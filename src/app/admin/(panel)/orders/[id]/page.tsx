import Link from "next/link";
import { notFound } from "next/navigation";
import { markRefunded, resolveStockIssue, reverifyPayment } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { OrderUpdateForm } from "@/components/admin/order-update-form";
import { OrderStatusPill, PageHeader, Panel, PaymentPill } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { formatDate } from "@/components/shop/status-timeline";
import { adminGetOrder } from "@/lib/shop/admin";
import { formatNaira, orderStatusLabels } from "@/lib/shop/meta";

export const metadata = { title: "Order" };

const eventLabel = (s: string) =>
  ({
    note: "Note",
    refunded: "Marked refunded",
    payment_flagged: "Payment flagged",
    payment_duplicate: "Duplicate payment",
  })[s] ?? orderStatusLabels[s as keyof typeof orderStatusLabels] ?? s;

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const data = await adminGetOrder(id);
  if (!data) notFound();
  const { order, items, events, attempts } = data;

  return (
    <>
      <Link href="/admin/orders" className="text-sm text-muted hover:text-foreground">
        ← Orders
      </Link>
      <PageHeader
        title={`Order ${order.number}`}
        sub={
          <span className="flex flex-wrap items-center gap-2">
            Placed {formatDate(order.createdAt)} <PaymentPill status={order.paymentStatus} /> <OrderStatusPill status={order.status} />
          </span>
        }
        actions={
          <Link href={`/shop/order/${order.accessToken}`} target="_blank" className="btn-outline">
            Customer view <Icon name="arrowRight" />
          </Link>
        }
      />

      {order.stockIssue && (
        <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent/8 p-4 text-sm">
          <p>
            <strong className="text-accent">Stock shortfall.</strong> This order was paid after an item ran out. Restock,
            substitute or refund, then clear the flag.
          </p>
          <form action={resolveStockIssue}>
            <input type="hidden" name="orderId" value={order.id} />
            <button className="btn-outline py-1.5">Mark resolved</button>
          </form>
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Panel title="Items">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {items.map((i) => (
                  <tr key={i.id}>
                    <td className="px-5 py-3">
                      {i.productId ? (
                        <Link href={`/admin/products/${i.productId}`} className="font-medium hover:text-brand">
                          {i.name}
                        </Link>
                      ) : (
                        i.name
                      )}
                    </td>
                    <td className="px-3 py-3 text-muted">
                      {i.quantity} × {formatNaira(i.priceKobo)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium">{formatNaira(i.priceKobo * i.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="space-y-1 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatNaira(order.subtotalKobo)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery ({order.state})</dt>
                <dd>{formatNaira(order.deliveryKobo)}</dd>
              </div>
              <div className="flex justify-between pt-1 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatNaira(order.totalKobo)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Payment attempts">
            {attempts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">No payment attempts.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-line">
                    {attempts.map((p) => (
                      <tr key={p.id}>
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs">{p.reference}</span>
                          <span className="block text-xs text-muted">{formatDate(p.createdAt)}</span>
                        </td>
                        <td className="px-3 py-3">
                          <PaymentPill status={p.status} />
                          {p.gatewayResponse && <span className="block pt-1 text-xs text-muted">{p.gatewayResponse}</span>}
                        </td>
                        <td className="px-3 py-3 text-muted">{p.channel}</td>
                        <td className="px-3 py-3 text-right font-medium">{formatNaira(p.amountKobo)}</td>
                        <td className="px-5 py-3 text-right">
                          {p.status !== "success" && (
                            <form action={reverifyPayment}>
                              <input type="hidden" name="reference" value={p.reference} />
                              <button className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                                <Icon name="refresh" className="size-3.5" /> Re-check
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {order.paymentStatus === "paid" && (
              <form action={markRefunded} className="border-t border-line px-5 py-3 text-right">
                <input type="hidden" name="orderId" value={order.id} />
                <ConfirmButton message="Mark this order as refunded? Issue the actual refund from your Paystack dashboard." className="text-xs font-medium text-muted hover:text-accent">
                  Mark as refunded
                </ConfirmButton>
              </form>
            )}
          </Panel>

          <Panel title="History">
            <ol className="divide-y divide-line text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex gap-4 px-5 py-3">
                  <span className="w-36 shrink-0 text-xs text-muted">{formatDate(e.createdAt)}</span>
                  <span>
                    <span className="font-medium">{eventLabel(e.status)}</span>
                    <span className="ml-2 text-xs text-muted">{e.actor}</span>
                    {e.note && <span className="block text-muted">{e.note}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-6 xl:sticky xl:top-8">
          <Panel title="Update delivery">
            {order.paymentStatus === "paid" || order.status === "pending_payment" ? (
              <OrderUpdateForm order={order} />
            ) : (
              <p className="p-5 text-sm text-muted">This order can&rsquo;t be updated.</p>
            )}
          </Panel>
          <Panel title="Customer">
            <div className="space-y-1 p-5 text-sm">
              <p className="font-semibold">{order.name}</p>
              <p>
                <a href={`mailto:${order.email}`} className="text-brand">
                  {order.email}
                </a>
              </p>
              <p>
                <a href={`tel:${order.phone.replace(/[^\d+]/g, "")}`} className="text-brand">
                  {order.phone}
                </a>
              </p>
              <p className="pt-2 leading-relaxed">
                {order.address}
                <br />
                {order.city}, {order.state}
              </p>
              {order.notes && <p className="mt-2 rounded-lg bg-background/60 px-3 py-2 text-muted">“{order.notes}”</p>}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
