"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { nigerianStates } from "@/lib/shop/meta";
import { PRODUCTS_TAG } from "@/lib/shop/catalog";
import {
  CheckoutError,
  createOrder,
  findOrderForTracking,
  getOrderByToken,
  getPaymentSummary,
  settlePayment,
  startPayment,
} from "@/lib/shop/orders";
import { paymentsMode, recordSimulatedPayment } from "@/lib/shop/paystack";
import { siteUrl } from "@/lib/shop/site-url";

export type CheckoutState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  orderToken?: string;
  values?: Record<string, string>;
};

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.email("Enter a valid email address").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{10,20}$/, "Enter a valid phone number"),
  address: z.string().trim().min(6, "Enter your delivery address").max(300),
  city: z.string().trim().min(2, "Enter your city or town").max(80),
  state: z.enum(nigerianStates, "Choose a state"),
  notes: z.string().trim().max(500).default(""),
  items: z
    .array(z.object({ productId: z.string().min(1).max(64), quantity: z.number().int().min(1).max(999) }))
    .min(1, "Your cart is empty")
    .max(50),
});

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const values = Object.fromEntries(
    ["name", "email", "phone", "address", "city", "state", "notes"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  let items: unknown = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {}

  const parsed = checkoutSchema.safeParse({ ...values, items });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { fieldErrors, values, error: fieldErrors.items };
  }

  if (paymentsMode() === "unconfigured") {
    return { values, error: "Online payment is temporarily unavailable. Please call us to place your order." };
  }

  let order;
  try {
    order = await createOrder(parsed.data);
  } catch (e) {
    if (e instanceof CheckoutError) return { values, error: e.message };
    console.error("createOrder failed", e);
    return { values, error: "We couldn't place your order. Please try again." };
  }

  let url: string;
  try {
    url = (await startPayment(order, await siteUrl())).authorizationUrl;
  } catch (e) {
    console.error("startPayment failed", e);
    return {
      values,
      orderToken: order.accessToken,
      error: `Order ${order.number} is saved, but we couldn't reach the payment provider. You can retry payment from your order page.`,
    };
  }
  redirect(url);
}

/** Starts a new payment attempt for an existing unpaid order (from the order page). */
export async function retryPayment(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const data = await getOrderByToken(token);
  if (!data) redirect("/shop/track");
  const { order } = data;
  let url = `/shop/order/${token}?payment=error`;
  try {
    url = (await startPayment(order, await siteUrl())).authorizationUrl;
  } catch (e) {
    console.error("retryPayment failed", e);
  }
  redirect(url);
}

export type TrackState = { error?: string; number?: string; email?: string };

export async function trackOrder(_prev: TrackState, formData: FormData): Promise<TrackState> {
  const number = String(formData.get("number") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!number || !email) return { error: "Enter your order number and email.", number, email };
  const token = await findOrderForTracking(number, email);
  if (!token) return { error: "We couldn't find an order with those details. Check the order number in your confirmation.", number, email };
  redirect(`/shop/order/${token}`);
}

/** Development-only stand-in for the Paystack checkout page. */
export async function simulatePayment(formData: FormData) {
  if (paymentsMode() !== "simulated") redirect("/shop");
  const reference = String(formData.get("reference") ?? "");
  const ok = formData.get("outcome") === "success";
  const p = await getPaymentSummary(reference);
  if (!p) redirect("/shop");
  recordSimulatedPayment(reference, p.amountKobo, ok);
  const result = await settlePayment(reference);
  if (result.ok && result.changedStock) updateTag(PRODUCTS_TAG);
  if (!result.order) redirect("/shop");
  redirect(`/shop/order/${result.order.accessToken}?payment=${result.ok ? "success" : "failed"}`);
}
