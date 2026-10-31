import Link from "next/link";
import { PageHeader, Panel, PaymentPill } from "@/components/admin/ui";
import { formatDate } from "@/components/shop/status-timeline";
import { adminListPayments } from "@/lib/shop/admin";
import { formatNaira } from "@/lib/shop/meta";

export const metadata = { title: "Payments" };

const tabs = [
  { key: "", label: "All" },
  { key: "success", label: "Successful" },
  { key: "initialized", label: "Started" },
  { key: "failed", label: "Failed" },
  { key: "abandoned", label: "Abandoned" },
];

export default async function PaymentsPage({ searchParams }: PageProps<"/admin/payments">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const rows = await adminListPayments(status || undefined);
  const collected = rows.filter((r) => r.status === "success").reduce((s, r) => s + r.amountKobo, 0);

  return (
    <>
      <PageHeader
        title="Payments"
        sub={`Every Paystack transaction attempt. ${status === "" || status === "success" ? `${formatNaira(collected)} collected in the list below.` : ""}`}
      />
      <nav aria-label="Filter payments" className="mb-4 flex gap-1.5 overflow-x-auto">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/admin/payments?status=${t.key}` : "/admin/payments"}
            aria-current={status === t.key ? "page" : undefined}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium ${
              status === t.key ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand/40"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <Panel>
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-2.5 font-medium">Reference</th>
                  <th className="px-3 py-2.5 font-medium">Order</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Channel</th>
                  <th className="px-5 py-2.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs">{p.reference}</span>
                      <span className="block text-xs text-muted">{formatDate(p.paidAt ?? p.createdAt)}</span>
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/admin/orders/${p.orderId}`} className="font-semibold text-brand">
                        {p.orderNumber}
                      </Link>
                      <span className="block text-xs text-muted">{p.email}</span>
                    </td>
                    <td className="px-3 py-3">
                      <PaymentPill status={p.status} />
                      {p.gatewayResponse && <span className="block pt-1 text-xs text-muted">{p.gatewayResponse}</span>}
                    </td>
                    <td className="px-3 py-3 text-muted capitalize">{p.channel || "—"}</td>
                    <td className="px-5 py-3 text-right font-medium">{formatNaira(p.amountKobo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
