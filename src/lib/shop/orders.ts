import "server-only";
import { randomBytes } from "node:crypto";
import { and, asc, desc, eq, gte, inArray, ne, sql } from "drizzle-orm";
import { db } from "./db";
import { deliveryFeeFor } from "./meta";
import { initializePayment, verifyPayment, type VerifiedPayment } from "./paystack";
import { orderEvents, orderItems, orders, payments, products, type Order } from "./schema";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I for read-aloud order numbers

function orderNumber() {
  const bytes = randomBytes(7);
  return "EB-" + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
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
export async function createOrder(input: CheckoutInput) {
  const wanted = new Map<string, number>();
  for (const i of input.items) wanted.set(i.productId, (wanted.get(i.productId) ?? 0) + i.quantity);
  if (wanted.size === 0) throw new CheckoutError("Your cart is empty.");

  const rows = await db
    .select()
    .from(products)
    .where(and(inArray(products.id, [...wanted.keys()]), eq(products.active, true)));

  const lines = [...wanted].map(([productId, quantity]) => {
    const p = rows.find((r) => r.id === productId);
    if (!p) throw new CheckoutError("An item in your cart is no longer available. Please review your cart.");
    if (p.stock < quantity)
      throw new CheckoutError(
        p.stock > 0 ? `Only ${p.stock} × ${p.name} left in stock.` : `${p.name} is out of stock.`,
      );
    return { productId, quantity, name: p.name, priceKobo: p.priceKobo };
  });

  const subtotalKobo = lines.reduce((s, l) => s + l.priceKobo * l.quantity, 0);
  const deliveryKobo = deliveryFeeFor(input.state, subtotalKobo);

  return db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
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
      })
      .returning();
    await tx.insert(orderItems).values(lines.map((l) => ({ ...l, orderId: order.id })));
    await tx.insert(orderEvents).values({ orderId: order.id, status: "pending_payment", note: "Order placed" });
    return order;
  });
}

/** Creates a fresh payment attempt for an unpaid order and returns where to send the customer. */
export async function startPayment(order: Order, siteUrl: string) {
  if (order.paymentStatus === "paid") throw new CheckoutError("This order is already paid.");
  if (order.status === "cancelled") throw new CheckoutError("This order was cancelled.");

  const reference = `${order.number}-${randomBytes(3).toString("hex")}`;
  await db.insert(payments).values({
    orderId: order.id,
    provider: "paystack",
    reference,
    amountKobo: order.totalKobo,
  });
  return initializePayment({
    email: order.email,
    amountKobo: order.totalKobo,
    reference,
    callbackUrl: `${siteUrl}/shop/checkout/verify`,
    metadata: { order_id: order.id, order_number: order.number },
  });
}

export type SettleResult =
  | { ok: true; order: Order; changedStock: boolean }
  | { ok: false; reason: string; order?: Order };

/**
 * Confirms a payment with the gateway and, once, marks the order paid and takes the stock.
 * Safe to call repeatedly (redirect, webhook and admin "re-verify" may all race).
 */
export async function settlePayment(reference: string): Promise<SettleResult> {
  const [payment] = await db.select().from(payments).where(eq(payments.reference, reference)).limit(1);
  if (!payment) return { ok: false, reason: "Unknown payment reference." };
  const [current] = await db.select().from(orders).where(eq(orders.id, payment.orderId)).limit(1);
  if (payment.status === "success") return { ok: true, order: current, changedStock: false };

  const verified = await verifyPayment(reference);
  if (!verified) return { ok: false, reason: "Payment could not be verified yet.", order: current };

  if (verified.status !== "success") {
    if (verified.status === "failed" || verified.status === "abandoned") {
      await recordAttempt(payment.id, verified);
    }
    return { ok: false, reason: verified.gatewayResponse || "Payment was not completed.", order: current };
  }

  if (verified.amountKobo !== payment.amountKobo || verified.currency !== "NGN") {
    await recordAttempt(payment.id, { ...verified, status: "failed", gatewayResponse: "Amount mismatch — flagged" });
    await db.insert(orderEvents).values({
      orderId: payment.orderId,
      status: "payment_flagged",
      note: `Gateway reported ${verified.currency} ${verified.amountKobo / 100}, expected NGN ${payment.amountKobo / 100}.`,
    });
    return { ok: false, reason: "Payment amount did not match the order.", order: current };
  }

  const result = await db.transaction(async (tx) => {
    // Claim the payment; if another request got here first, do nothing.
    const claimed = await tx
      .update(payments)
      .set({
        status: "success",
        channel: verified.channel,
        gatewayResponse: verified.gatewayResponse,
        paidAt: verified.paidAt ?? Date.now(),
        updatedAt: Date.now(),
      })
      .where(and(eq(payments.id, payment.id), ne(payments.status, "success")))
      .returning({ id: payments.id });
    if (claimed.length === 0) return { changedStock: false };

    const [order] = await tx.select().from(orders).where(eq(orders.id, payment.orderId)).limit(1);
    if (order.paymentStatus === "paid") {
      // A second successful charge on an already-paid order: keep it visible for a refund.
      await tx.insert(orderEvents).values({
        orderId: order.id,
        status: "payment_duplicate",
        note: `Duplicate payment ${reference} received — refund required.`,
      });
      return { changedStock: false };
    }

    let stockIssue = false;
    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    for (const item of items) {
      if (!item.productId) continue;
      const taken = await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${item.quantity}`, updatedAt: Date.now() })
        .where(and(eq(products.id, item.productId), gte(products.stock, item.quantity)))
        .returning({ id: products.id });
      if (taken.length === 0) stockIssue = true;
    }

    const wasCancelled = order.status === "cancelled";
    await tx
      .update(orders)
      .set({
        paymentStatus: "paid",
        status: wasCancelled ? "cancelled" : "paid",
        paidAt: verified.paidAt ?? Date.now(),
        stockIssue,
        updatedAt: Date.now(),
      })
      .where(eq(orders.id, order.id));
    await tx.insert(orderEvents).values({
      orderId: order.id,
      status: "paid",
      note: wasCancelled
        ? "Payment received after the order was cancelled — refund required."
        : `Payment confirmed via ${verified.channel || "Paystack"}.${stockIssue ? " Stock shortfall flagged for review." : ""}`,
    });
    return { changedStock: true };
  });

  const [order] = await db.select().from(orders).where(eq(orders.id, payment.orderId)).limit(1);
  return { ok: true, order, changedStock: result.changedStock };
}

async function recordAttempt(paymentId: string, v: VerifiedPayment) {
  await db
    .update(payments)
    .set({ status: v.status === "success" ? "success" : v.status === "abandoned" ? "abandoned" : "failed", channel: v.channel, gatewayResponse: v.gatewayResponse, updatedAt: Date.now() })
    .where(and(eq(payments.id, paymentId), ne(payments.status, "success")));
}

export async function getOrderByToken(token: string) {
  const [order] = await db.select().from(orders).where(eq(orders.accessToken, token)).limit(1);
  if (!order) return null;
  const [items, events] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, order.id)).orderBy(asc(orderEvents.createdAt)),
  ]);
  return { order, items, events };
}

export async function findOrderForTracking(number: string, email: string) {
  const [order] = await db
    .select({ accessToken: orders.accessToken })
    .from(orders)
    .where(and(eq(orders.number, number.trim().toUpperCase()), eq(orders.email, email.trim().toLowerCase())))
    .limit(1);
  return order?.accessToken ?? null;
}

export async function getPaymentAmount(reference: string) {
  const [p] = await db
    .select({ amountKobo: payments.amountKobo, status: payments.status, orderId: payments.orderId })
    .from(payments)
    .where(eq(payments.reference, reference))
    .limit(1);
  return p ?? null;
}

export async function latestPaymentFor(orderId: string) {
  const [p] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .orderBy(desc(payments.createdAt))
    .limit(1);
  return p ?? null;
}
