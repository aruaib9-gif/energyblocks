import "server-only";
import { randomBytes } from "node:crypto";
import { after } from "next/server";
import { collections, isDuplicateKey, newId, toApp, withTransaction, type OrderDoc } from "./db";
import { adminNewOrderEmail, orderConfirmationEmail, sendEmail } from "./email";
import { deliveryFeeFor } from "./meta";
import { initializePayment, verifyPayment, type VerifiedPayment } from "./paystack";
import type { Order, OrderEvent } from "./schema";
import { siteUrl } from "./site-url";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I for read-aloud order numbers

function orderNumber() {
  return "EB-" + Array.from(randomBytes(7), (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export const event = (status: string, note = "", actor = "system"): OrderEvent => ({
  id: newId(),
  status,
  note,
  actor,
  createdAt: Date.now(),
});

/** Splits a stored order document into the order fields, its items and its events. */
export function splitOrder(doc: OrderDoc) {
  const { items, events, ...rest } = doc;
  return { order: toApp(rest) as Order, items, events };
}

export type CheckoutInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes: string;
  items: { productId: string; quantity: number }[];
};

export class CheckoutError extends Error {}

/** Prices, stock and totals are always recomputed from the database — never trusted from the cart. */
export async function createOrder(input: CheckoutInput): Promise<Order> {
  const wanted = new Map<string, number>();
  for (const i of input.items) wanted.set(i.productId, (wanted.get(i.productId) ?? 0) + i.quantity);
  if (wanted.size === 0) throw new CheckoutError("Your cart is empty.");

  const { products, orders } = await collections();
  const rows = await products.find({ _id: { $in: [...wanted.keys()] }, active: true }).toArray();

  const items = [...wanted].map(([productId, quantity]) => {
    const p = rows.find((r) => r._id === productId);
    if (!p) throw new CheckoutError("An item in your cart is no longer available. Please review your cart.");
    if (p.stock < quantity)
      throw new CheckoutError(p.stock > 0 ? `Only ${p.stock} × ${p.name} left in stock.` : `${p.name} is out of stock.`);
    return { id: newId(), productId, quantity, name: p.name, priceKobo: p.priceKobo };
  });

  const subtotalKobo = items.reduce((s, l) => s + l.priceKobo * l.quantity, 0);
  const deliveryKobo = deliveryFeeFor(input.state, subtotalKobo);
  const now = Date.now();

  // Retry on the (very unlikely) chance of an order-number collision.
  for (let attempt = 0; ; attempt++) {
    const doc: OrderDoc = {
      _id: newId(),
      number: orderNumber(),
      accessToken: randomBytes(24).toString("base64url"),
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      address: input.address,
      city: input.city,
      state: input.state,
      notes: input.notes,
      subtotalKobo,
      deliveryKobo,
      totalKobo: subtotalKobo + deliveryKobo,
      paymentStatus: "pending",
      status: "pending_payment",
      courier: "",
      trackingNumber: "",
      stockIssue: false,
      paidAt: null,
      createdAt: now,
      updatedAt: now,
      items,
      events: [event("pending_payment", "Order placed")],
    };
    try {
      await orders.insertOne(doc);
      return splitOrder(doc).order;
    } catch (e) {
      if (isDuplicateKey(e) && attempt < 3) continue;
      throw e;
    }
  }
}

/** Creates a fresh payment attempt for an unpaid order and returns where to send the customer. */
export async function startPayment(order: Order, base: string) {
  if (order.paymentStatus === "paid") throw new CheckoutError("This order is already paid.");
  if (order.status === "cancelled") throw new CheckoutError("This order was cancelled.");

  const { payments } = await collections();
  const reference = `${order.number}-${randomBytes(3).toString("hex")}`;
  const now = Date.now();
  await payments.insertOne({
    _id: newId(),
    orderId: order.id,
    provider: "paystack",
    reference,
    amountKobo: order.totalKobo,
    status: "initialized",
    channel: "",
    gatewayResponse: "",
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  });
  return initializePayment({
    email: order.email,
    amountKobo: order.totalKobo,
    reference,
    callbackUrl: `${base}/shop/checkout/verify`,
    metadata: { order_id: order.id, order_number: order.number },
  });
}

export type SettleResult =
  | { ok: true; order: Order; changedStock: boolean }
  | { ok: false; reason: string; order?: Order };

/**
 * Confirms a payment with the gateway and, exactly once, marks the order paid, takes the
 * stock and sends the confirmation emails. Safe to call repeatedly — the redirect, the
 * webhook and the admin "re-check" button may all race.
 */
export async function settlePayment(reference: string): Promise<SettleResult> {
  const { payments, orders, products } = await collections();
  const payment = await payments.findOne({ reference });
  if (!payment) return { ok: false, reason: "Unknown payment reference." };
  const currentDoc = await orders.findOne({ _id: payment.orderId });
  const current = currentDoc ? splitOrder(currentDoc).order : undefined;
  if (!current) return { ok: false, reason: "Order not found." };
  if (payment.status === "success") return { ok: true, order: current, changedStock: false };

  const verified = await verifyPayment(reference);
  if (!verified) return { ok: false, reason: "Payment could not be verified yet.", order: current };

  if (verified.status !== "success") {
    if (verified.status === "failed" || verified.status === "abandoned") await recordAttempt(payment._id, verified);
    return { ok: false, reason: verified.gatewayResponse || "Payment was not completed.", order: current };
  }

  if (verified.amountKobo !== payment.amountKobo || verified.currency !== "NGN") {
    await recordAttempt(payment._id, { ...verified, status: "failed", gatewayResponse: "Amount mismatch — flagged" });
    await orders.updateOne(
      { _id: payment.orderId },
      {
        $push: {
          events: event(
            "payment_flagged",
            `Gateway reported ${verified.currency} ${verified.amountKobo / 100}, expected NGN ${payment.amountKobo / 100}.`,
          ),
        },
      },
    );
    return { ok: false, reason: "Payment amount did not match the order.", order: current };
  }

  const outcome = await withTransaction(async (session) => {
    const now = Date.now();
    // Claim the payment; if another request got here first, do nothing.
    const claimed = await payments.updateOne(
      { _id: payment._id, status: { $ne: "success" } },
      {
        $set: {
          status: "success",
          channel: verified.channel,
          gatewayResponse: verified.gatewayResponse,
          paidAt: verified.paidAt ?? now,
          updatedAt: now,
        },
      },
      { session },
    );
    if (claimed.modifiedCount === 0) return { changedStock: false, newlyPaid: false };

    const order = await orders.findOne({ _id: payment.orderId }, { session });
    if (!order) return { changedStock: false, newlyPaid: false };
    if (order.paymentStatus === "paid") {
      // A second successful charge on an already-paid order: keep it visible for a refund.
      await orders.updateOne(
        { _id: order._id },
        { $push: { events: event("payment_duplicate", `Duplicate payment ${reference} received — refund required.`) } },
        { session },
      );
      return { changedStock: false, newlyPaid: false };
    }

    let stockIssue = false;
    for (const item of order.items) {
      if (!item.productId) continue;
      const taken = await products.updateOne(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity }, $set: { updatedAt: now } },
        { session },
      );
      if (taken.modifiedCount === 0) stockIssue = true;
    }

    const wasCancelled = order.status === "cancelled";
    await orders.updateOne(
      { _id: order._id },
      {
        $set: {
          paymentStatus: "paid",
          status: wasCancelled ? "cancelled" : "paid",
          paidAt: verified.paidAt ?? now,
          stockIssue,
          updatedAt: now,
        },
        $push: {
          events: event(
            "paid",
            wasCancelled
              ? "Payment received after the order was cancelled — refund required."
              : `Payment confirmed via ${verified.channel || "Paystack"}.${stockIssue ? " Stock shortfall flagged for review." : ""}`,
          ),
        },
      },
      { session },
    );
    return { changedStock: true, newlyPaid: true };
  });

  const doc = (await orders.findOne({ _id: payment.orderId }))!;
  const { order, items } = splitOrder(doc);

  if (outcome.newlyPaid) {
    const base = await siteUrl();
    after(async () => {
      await sendEmail(orderConfirmationEmail(order, items, `${base}/shop/order/${order.accessToken}`));
      const alert = adminNewOrderEmail(order, items, `${base}/admin/orders/${order.id}`);
      if (alert) await sendEmail(alert);
    });
  }
  return { ok: true, order, changedStock: outcome.changedStock };
}

async function recordAttempt(paymentId: string, v: VerifiedPayment) {
  const { payments } = await collections();
  await payments.updateOne(
    { _id: paymentId, status: { $ne: "success" } },
    {
      $set: {
        status: v.status === "abandoned" ? "abandoned" : "failed",
        channel: v.channel,
        gatewayResponse: v.gatewayResponse,
        updatedAt: Date.now(),
      },
    },
  );
}

export async function getOrderByToken(token: string) {
  const { orders } = await collections();
  const doc = await orders.findOne({ accessToken: token });
  if (!doc) return null;
  const { order, items, events } = splitOrder(doc);
  return { order, items, events: [...events].sort((a, b) => a.createdAt - b.createdAt) };
}

export async function findOrderForTracking(number: string, email: string) {
  const { orders } = await collections();
  const doc = await orders.findOne(
    { number: number.trim().toUpperCase(), email: email.trim().toLowerCase() },
    { projection: { accessToken: 1 } },
  );
  return doc?.accessToken ?? null;
}

/** For the development payment simulator. */
export async function getPaymentSummary(reference: string) {
  const { payments, orders } = await collections();
  const p = await payments.findOne({ reference });
  if (!p) return null;
  const o = await orders.findOne({ _id: p.orderId }, { projection: { number: 1, email: 1 } });
  return o ? { amountKobo: p.amountKobo, number: o.number, email: o.email } : null;
}
