import { revalidateTag } from "next/cache";
import { PRODUCTS_TAG } from "@/lib/shop/catalog";
import { settlePayment } from "@/lib/shop/orders";
import { isValidWebhookSignature } from "@/lib/shop/paystack";

// Configure in Paystack: Settings → API Keys & Webhooks → Webhook URL
//   https://<your-domain>/api/webhooks/paystack
// Catches payments where the customer closed the tab before being redirected back.
export async function POST(req: Request) {
  const raw = await req.text();
  if (!isValidWebhookSignature(raw, req.headers.get("x-paystack-signature"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    // Re-verifies with the Paystack API before marking anything paid.
    const result = await settlePayment(event.data.reference);
    if (result.ok && result.changedStock) revalidateTag(PRODUCTS_TAG, "max");
  }
  return new Response("ok");
}
