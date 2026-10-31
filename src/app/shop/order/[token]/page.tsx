import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Icon } from "@/components/icons";
import { ClearCartOnPaid } from "@/components/shop/clear-cart";
import { StatusTimeline, formatDate } from "@/components/shop/status-timeline";
import { company } from "@/lib/content";
import { formatNaira, orderStatusLabels } from "@/lib/shop/meta";
import { getOrderByToken } from "@/lib/shop/orders";
import { retryPayment } from "../../checkout/actions";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default function OrderPage(props: PageProps<"/shop/order/[token]">) {
  return (
    <Suspense fallback={<div className="container-x mt-10 h-96 animate-pulse rounded-2xl bg-card" />}>
      <Order {...props} />
    </Suspense>
  );
}

async function Order({ params, searchParams }: PageProps<"/shop/order/[token]">) {
  const [{ token }, sp] = await Promise.all([params, searchParams]);
  await connection(); // live order data — always read at request time
  const data = await getOrderByToken(token);
  if (!data) notFound();
  const { order, items, events } = data;
  const paid = order.paymentStatus === "paid";
  const justPaid = sp.payment === "success" && paid;
  const failed = (sp.payment === "failed" || sp.payment === "error") && !paid;
  const customerEvents = events.filter((e) => e.status in orderStatusLabels).reverse();

  return (
    <div className="container-x px-6 pt-10 lg:px-0">
      {paid && <ClearCartOnPaid orderNumber={order.number} />}

      {justPaid && (
        <div className="mb-8 flex items-start gap-4 rounded-2xl bg-brand p-6 text-white">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15">
            <Icon name="check" className="size-5" />
          </span>
          <div>
            <p className="text-lg font-semibold">Payment received — thank you, {order.name.split(" ")[0]}!</p>
            <p className="mt-1 text-white/80">
              A copy of this page&rsquo;s link is your receipt. Bookmark it, or track any time with order number{" "}
              <strong>{order.number}</strong> and your email.
            </p>
          </div>
        </div>
      )}
      {failed && (
        <div role="alert" className="mb-8 rounded-2xl border border-accent/30 bg-accent/10 p-5 text-accent">
          Your payment didn&rsquo;t go through. No money was taken for this attempt — you can try again below.
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Order {order.number}</p>
          <h1 className="display mt-2 text-[32px]">
            {order.status === "cancelled" ? "Order cancelled" : orderStatusLabels[order.status]}
          </h1>
          <p className="mt-1 text-sm text-muted">Placed {formatDate(order.createdAt)}</p>
        </div>
        {!paid && order.status !== "cancelled" && (
          <form action={retryPayment}>
            <input type="hidden" name="token" value={token} />
            <button className="btn-primary py-3">
              Pay {formatNaira(order.totalKobo)} now <Icon name="lock" />
            </button>
          </form>
        )}
      </div>

      {paid && order.status !== "cancelled" && (
        <section className="card mt-8 p-6 sm:p-8" aria-label="Delivery progress">
          <StatusTimeline status={order.status} events={events} />
          {(order.courier || order.trackingNumber) && (
            <p className="mt-6 rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand-strong">
              <Icon name="truck" className="mr-1.5 inline size-4" />
              {order.courier && <>Shipped with <strong>{order.courier}</strong>. </>}
              {order.trackingNumber && <>Courier tracking number: <strong>{order.trackingNumber}</strong></>}
            </p>
          )}
        </section>
      )}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <section className="card">
          <h2 className="border-b border-line px-6 py-4 font-semibold">Items</h2>
          <ul className="divide-y divide-line">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 px-6 py-3 text-[15px]">
                <span>
                  {i.quantity} × {i.name}
                </span>
                <span className="font-medium">{formatNaira(i.priceKobo * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 border-t border-line px-6 py-4 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatNaira(order.subtotalKobo)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd>{order.deliveryKobo === 0 ? "Free" : formatNaira(order.deliveryKobo)}</dd>
            </div>
            <div className="flex justify-between pt-2 text-lg font-semibold">
              <dt>Total</dt>
              <dd>{formatNaira(order.totalKobo)}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Payment</dt>
              <dd className={paid ? "font-semibold text-brand" : "text-accent"}>
                {paid ? `Paid ${order.paidAt ? formatDate(order.paidAt) : ""}` : "Not yet paid"}
              </dd>
            </div>
          </dl>
        </section>

        <aside className="space-y-6">
          <section className="card p-6 text-[15px]">
            <h2 className="font-semibold">Delivering to</h2>
            <p className="mt-3 leading-relaxed">
              {order.name}
              <br />
              {order.address}
              <br />
              {order.city}, {order.state}
              <br />
              <span className="text-muted">{order.phone}</span>
            </p>
          </section>
          {customerEvents.length > 0 && (
            <section className="card p-6">
              <h2 className="font-semibold">Updates</h2>
              <ul className="mt-3 space-y-3 text-sm">
                {customerEvents.map((e) => (
                  <li key={e.id}>
                    <p className="font-medium">{orderStatusLabels[e.status as keyof typeof orderStatusLabels]}</p>
                    {e.note && e.actor === "admin" && <p className="text-muted">{e.note}</p>}
                    <p className="text-xs text-muted">{formatDate(e.createdAt)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className="text-sm text-muted">
            Questions about this order? Call{" "}
            <a href={company.phoneHref} className="font-medium text-brand">
              {company.phone}
            </a>{" "}
            and quote {order.number}.
          </p>
          <Link href="/shop" className="btn-outline w-full">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
