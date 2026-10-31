"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { cart, cartSubtotal, useCart, useHydrated } from "@/components/shop/cart-store";
import { ProductVisual } from "@/components/shop/product-visual";
import { formatNaira, freeDeliveryOverKobo } from "@/lib/shop/meta";

export default function CartPage() {
  const lines = useCart();
  const hydrated = useHydrated();
  const subtotal = cartSubtotal(lines);
  const toFree = freeDeliveryOverKobo - subtotal;

  return (
    <div className="container-x px-6 pt-10 lg:px-0">
      <h1 className="display text-[34px]">Your cart</h1>

      {!hydrated ? (
        <div className="card mt-8 h-64 animate-pulse" aria-busy="true" />
      ) : lines.length === 0 ? (
        <div className="card mt-8 px-6 py-16 text-center">
          <Icon name="bag" className="mx-auto size-8 text-muted" />
          <p className="mt-4 text-lg font-semibold">Your cart is empty.</p>
          <Link href="/shop" className="btn-primary mt-6">
            Browse the marketplace <Icon name="arrowRight" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="card divide-y divide-line">
            {lines.map((l) => (
              <li key={l.productId} className="flex gap-4 p-4">
                <Link href={`/shop/${l.slug}`} className="shrink-0 overflow-hidden rounded-xl border border-line">
                  <ProductVisual imageId={l.imageId} category={l.category} alt={l.name} sizes="96px" className="size-20 sm:size-24" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/shop/${l.slug}`} className="font-semibold hover:text-brand">
                      {l.name}
                    </Link>
                    <p className="shrink-0 font-semibold">{formatNaira(l.priceKobo * l.quantity)}</p>
                  </div>
                  <p className="text-sm text-muted">{formatNaira(l.priceKobo)} each</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button
                        type="button"
                        aria-label={`Decrease ${l.name}`}
                        onClick={() => cart.setQuantity(l.productId, l.quantity - 1)}
                        className="grid size-9 place-items-center"
                      >
                        <Icon name="minus" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold tabular-nums">{l.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${l.name}`}
                        disabled={l.quantity >= l.stock}
                        onClick={() => cart.setQuantity(l.productId, l.quantity + 1)}
                        className="grid size-9 place-items-center disabled:opacity-40"
                      >
                        <Icon name="plus" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => cart.remove(l.productId)}
                      className="flex items-center gap-1.5 text-sm text-muted hover:text-accent"
                    >
                      <Icon name="trash" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="card p-6 lg:sticky lg:top-20">
            <h2 className="font-semibold">Order summary</h2>
            <dl className="mt-4 space-y-2 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold">{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd>{toFree <= 0 ? "Free" : "Calculated at checkout"}</dd>
              </div>
            </dl>
            {toFree > 0 && (
              <p className="mt-4 rounded-xl bg-brand-soft px-3 py-2 text-sm text-brand-strong">
                Add {formatNaira(toFree)} more for free delivery.
              </p>
            )}
            <Link href="/shop/checkout" className="btn-primary mt-6 w-full py-3">
              Checkout <Icon name="arrowRight" />
            </Link>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Icon name="lock" className="size-3.5" /> Secure payment via Paystack
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
