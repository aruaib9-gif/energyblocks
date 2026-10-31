import Link from "next/link";
import { OrderStatusPill, PageHeader, Panel, PaymentPill } from "@/components/admin/ui";
import { Icon, type IconName } from "@/components/icons";
import { formatDate } from "@/components/shop/status-timeline";
import { dashboardStats } from "@/lib/shop/admin";
import { formatNaira } from "@/lib/shop/meta";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const s = await dashboardStats();
  const tiles: { label: string; value: string; sub: string; icon: IconName; href: string }[] = [
    { label: "Revenue (30 days)", value: formatNaira(s.revenue30Kobo), sub: `${s.paidOrders30} paid orders`, icon: "wallet", href: "/admin/payments?status=success" },
    { label: "To fulfil", value: String(s.toFulfil), sub: "Paid, not yet dispatched", icon: "boxes", href: "/admin/orders?status=paid" },
    { label: "In transit", value: String(s.inTransit), sub: "Dispatched or out for delivery", icon: "truck", href: "/admin/orders?status=shipped" },
    { label: "Awaiting payment", value: String(s.awaitingPayment), sub: "Checkout started, unpaid", icon: "clock", href: "/admin/orders?status=pending_payment" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" sub={`All-time revenue ${formatNaira(s.revenueKobo)} from ${s.paidOrders} paid orders`} />

      {s.flagged.length > 0 && (
        <div role="alert" className="mb-6 rounded-2xl border border-accent/30 bg-accent/8 p-4 text-sm">
          <p className="font-semibold text-accent">Orders needing attention</p>
          <p className="mt-1 text-foreground/80">
            Stock shortfalls, mismatched or duplicate payments, or paid orders that were cancelled:{" "}
            {s.flagged.map((f, i) => (
              <span key={f.id}>
                {i > 0 && ", "}
                <Link href={`/admin/orders/${f.id}`} className="font-semibold text-brand underline">
                  {f.number}
                </Link>
              </span>
            ))}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-2xl border border-line bg-white p-5 transition hover:border-brand/40">
            <div className="flex items-center justify-between text-sm text-muted">
              {t.label}
              <Icon name={t.icon} className="size-4.5 text-brand" />
            </div>
            <p className="mt-3 text-[28px] font-semibold tracking-tight">{t.value}</p>
            <p className="mt-1 text-xs text-muted">{t.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_340px]">
        <Panel
          title="Recent orders"
          actions={
            <Link href="/admin/orders" className="text-sm font-medium text-brand">
              View all
            </Link>
          }
        >
          {s.recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-line">
                  {s.recent.map((o) => (
                    <tr key={o.id} className="hover:bg-background/40">
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand">
                          {o.number}
                        </Link>
                        <span className="block text-xs text-muted">{formatDate(o.createdAt)}</span>
                      </td>
                      <td className="px-3 py-3">{o.name}</td>
                      <td className="px-3 py-3">
                        <PaymentPill status={o.paymentStatus} />
                      </td>
                      <td className="px-3 py-3">
                        <OrderStatusPill status={o.status} />
                      </td>
                      <td className="px-5 py-3 text-right font-medium">{formatNaira(o.totalKobo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Low stock">
          {s.lowStock.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">All products are well stocked.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {s.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <Link href={`/admin/products/${p.id}`} className="truncate hover:text-brand">
                    {p.name}
                  </Link>
                  <span className={`shrink-0 font-semibold ${p.stock === 0 ? "text-accent" : "text-[#b45309]"}`}>
                    {p.stock === 0 ? "Out" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
