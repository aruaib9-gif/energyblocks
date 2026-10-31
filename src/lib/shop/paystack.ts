import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Paystack (https://paystack.com/docs/api/transaction) — card, bank transfer and USSD in NGN.
// Without PAYSTACK_SECRET_KEY, development falls back to a local simulator so the full
// order flow can be exercised; production refuses to take orders until a key is set.

const API = "https://api.paystack.co";

export type VerifiedPayment = {
  status: "success" | "failed" | "abandoned" | "initialized";
  amountKobo: number;
  currency: string;
  channel: string;
  gatewayResponse: string;
  paidAt: number | null;
};

const secret = () => process.env.PAYSTACK_SECRET_KEY;

export const paymentsMode = (): "live" | "simulated" | "unconfigured" =>
  secret() ? "live" : process.env.NODE_ENV === "production" ? "unconfigured" : "simulated";

// Simulated payments are remembered in-process so the verify step can confirm them.
const simulated = globalThis as unknown as { ebSimulated?: Map<string, VerifiedPayment> };
simulated.ebSimulated ??= new Map();

export function recordSimulatedPayment(reference: string, amountKobo: number, ok: boolean) {
  if (paymentsMode() !== "simulated") throw new Error("Simulator is disabled");
  simulated.ebSimulated!.set(reference, {
    status: ok ? "success" : "failed",
    amountKobo,
    currency: "NGN",
    channel: "simulator",
    gatewayResponse: ok ? "Approved (simulated)" : "Declined (simulated)",
    paidAt: ok ? Date.now() : null,
  });
}

export async function initializePayment(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, string>;
}): Promise<{ authorizationUrl: string }> {
  const mode = paymentsMode();
  if (mode === "unconfigured") throw new Error("Online payments are not configured yet.");
  if (mode === "simulated") {
    const url = new URL("/shop/checkout/simulator", input.callbackUrl);
    url.searchParams.set("reference", input.reference);
    return { authorizationUrl: url.toString() };
  }

  const res = await fetch(`${API}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status) throw new Error(json?.message ?? "Could not start payment with Paystack.");
  return { authorizationUrl: json.data.authorization_url as string };
}

export async function verifyPayment(reference: string): Promise<VerifiedPayment | null> {
  const mode = paymentsMode();
  if (mode === "simulated") return simulated.ebSimulated!.get(reference) ?? null;
  if (mode === "unconfigured") return null;

  const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status) return null;
  const d = json.data;
  return {
    status: (["success", "failed", "abandoned"].includes(d.status) ? d.status : "initialized") as VerifiedPayment["status"],
    amountKobo: Number(d.amount),
    currency: String(d.currency),
    channel: String(d.channel ?? ""),
    gatewayResponse: String(d.gateway_response ?? ""),
    paidAt: d.paid_at ? Date.parse(d.paid_at) : null,
  };
}

export function isValidWebhookSignature(rawBody: string, signature: string | null) {
  const key = secret();
  if (!key || !signature) return false;
  const expected = createHmac("sha512", key).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
