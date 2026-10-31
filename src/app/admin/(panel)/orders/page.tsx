import Link from "next/link";
import { OrderStatusPill, PageHeader, Panel, PaymentPill } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { formatDate } from "@/components/shop/status-timeline";
import { adminListOrders } from "@/lib/shop/admin";
import { formatNaira, orderStatusLabels } from "@/lib/shop/meta";

export const metadata = { title: "Orders" };

const tabs: { key: string; label: string }[] = [
  { key: "", label: "All" },
  ...Object.entries(orderStatusLabels).map(([key, label]) => ({ key, label })),
  { key: "flagged", label: "Stock issues" },
];

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const { rows, counts } = await adminListOrders({ status: status || undefined, q: q || undefined });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader title="Orders" sub={`${total} order${total === 1 ? "" : "s"} in total`} />
      <nav aria-label="Filter by status" className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {tabs.map((t) => {
          const n = t.key === "" ? total : counts[t.key];
          const params = new URLSearchParams({ ...(t.key && { status: t.key }), ...(q && { q }) });
          return (
            <Link
              key={t.key}
              href={`/admin/orders${params.size ? `?${params}` : ""}`}
              aria-current={status === t.key ? "page" : undefined}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium ${
                status === t.key ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand/40"
              }`}
            >
              {t.label}
              {n ? <span className="ml-1.5 opacity-70">{n}</span> : null}
            </Link>
          );
        })}
      </nav>
      <Panel>
        <form className="flex items-center gap-2 border-b border-line px-5 py-3">
          {status && <input type="hidden" name="status" value={status} />}
          <Icon name="search" className="text-muted" />
          <label htmlFor="oq" className="sr-only">
            Search orders
          </label>
          <input id="oq" name="q" defaultValue={q} placeholder="Order number, name, email or phone…" className="flex-1 bg-transparent py-1 text-sm outline-none" />
        </form>
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted">No orders match.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-2.5 font-medium">Order</th>
                  <th className="px-3 py-2.5 font-medium">Customer</th>
                  <th className="px-3 py-2.5 font-medium">Payment</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((o) => (
                  <tr key={o.id} className="hover:bg-background/40">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand">
                        {o.number}
                      </Link>
                      {o.stockIssue && <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">Stock issue</span>}
                      <span className="block text-xs text-muted">
                        {formatDate(o.createdAt)} · {o.itemCount} item{o.itemCount === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {o.name}
                      <span className="block text-xs text-muted">
                        {o.email} · {o.state}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <PaymentPill status={o.paymentStatus} />
                    </td>
                    <td className="px-3 py-3">
                      <OrderStatusPill status={o.status} />
                    </td>
                    <td className="px-5 py-3 text-right font-medium whitespace-nowrap">{formatNaira(o.totalKobo)}</td>
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
