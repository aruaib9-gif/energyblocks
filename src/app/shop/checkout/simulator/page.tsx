import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { formatNaira } from "@/lib/shop/meta";
import { getPaymentSummary } from "@/lib/shop/orders";
import { paymentsMode } from "@/lib/shop/paystack";
import { simulatePayment } from "../actions";

// Development-only stand-in for the Paystack payment page, used when no PAYSTACK_SECRET_KEY is set.
export default function SimulatorPage(props: PageProps<"/shop/checkout/simulator">) {
  return (
    <Suspense>
      <Simulator {...props} />
    </Suspense>
  );
}

async function Simulator({ searchParams }: PageProps<"/shop/checkout/simulator">) {
  const reference = String((await searchParams).reference ?? "");
  if (paymentsMode() !== "simulated" || !reference) notFound();
  await connection();
  const row = await getPaymentSummary(reference);
  if (!row) notFound();

  return (
    <div className="container-x px-6 pt-14 lg:px-0">
      <div className="card mx-auto max-w-md overflow-hidden">
        <div className="hazard-stripe h-2" />
        <div className="p-8 text-center">
          <p className="eyebrow">Test payment · development only</p>
          <p className="mt-4 text-[34px] font-semibold tracking-tight">{formatNaira(row.amountKobo)}</p>
          <p className="mt-1 text-sm text-muted">
            Order {row.number} · {row.email}
          </p>
          <p className="mt-6 rounded-xl bg-brand-soft px-4 py-3 text-left text-sm text-brand-strong">
            No Paystack key is configured, so this simulator stands in for the payment page. Add{" "}
            <code>PAYSTACK_SECRET_KEY</code> to take real (or Paystack test-mode) payments.
          </p>
          <form action={simulatePayment} className="mt-6 grid gap-3">
            <input type="hidden" name="reference" value={reference} />
            <button name="outcome" value="success" className="btn-primary py-3">
              Simulate successful payment
            </button>
            <button name="outcome" value="fail" className="btn-outline py-3">
              Simulate declined payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
