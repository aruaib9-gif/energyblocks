import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { PRODUCTS_TAG } from "@/lib/shop/catalog";
import { settlePayment } from "@/lib/shop/orders";

// Paystack sends the customer back here (?reference=…) after checkout.
// The webhook confirms payments too; whichever arrives first settles the order.
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference") ?? req.nextUrl.searchParams.get("trxref");
  if (!reference) redirect("/shop");

  const result = await settlePayment(reference);
  if (result.ok && result.changedStock) revalidateTag(PRODUCTS_TAG, "max");
  if (!result.order) redirect("/shop/track");

  const outcome = result.ok ? "success" : "failed";
  redirect(`/shop/order/${result.order.accessToken}?payment=${outcome}`);
}
