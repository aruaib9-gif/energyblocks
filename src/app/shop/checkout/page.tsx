"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Icon } from "@/components/icons";
import { cartSubtotal, useCart, useHydrated } from "@/components/shop/cart-store";
import { deliveryFeeFor, formatNaira, nigerianStates } from "@/lib/shop/meta";
import { placeOrder, type CheckoutState } from "./actions";

const field = "mt-1.5 w-full rounded-xl border border-line bg-background/50 px-3.5 py-2.5 text-[15px] outline-none focus:border-brand/60 focus:bg-card";

export default function CheckoutPage() {
  const lines = useCart();
  const hydrated = useHydrated();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const [deliveryState, setDeliveryState] = useState(state.values?.state ?? "");
  const subtotal = cartSubtotal(lines);
  const delivery = deliveryState ? deliveryFeeFor(deliveryState, subtotal) : null;
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (!hydrated) {
    return <div className="container-x mt-10 h-96 animate-pulse rounded-2xl bg-card" aria-busy="true" />;
  }

  if (lines.length === 0) {
    return (
      <div className="container-x px-6 pt-10 lg:px-0">
        <div className="card px-6 py-16 text-center">
          <p className="text-lg font-semibold">Your cart is empty.</p>
          <Link href="/shop" className="btn-primary mt-6">
            Browse the marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x px-6 pt-10 lg:px-0">
      <Link href="/shop/cart" className="text-sm text-muted hover:text-foreground">
        ← Back to cart
      </Link>
      <h1 className="display mt-2 text-[34px]">Checkout</h1>

      <form action={action} className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]" noValidate>
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(lines.map((l) => ({ productId: l.productId, quantity: l.quantity })))}
        />
        <div className="card p-6 sm:p-8">
          <h2 className="font-semibold">Delivery details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="name" error={fe.name} defaultValue={v.name} autoComplete="name" />
            <Field label="Phone" name="phone" error={fe.phone} defaultValue={v.phone} type="tel" autoComplete="tel" placeholder="+234" />
            <Field
              label="Email"
              name="email"
              error={fe.email}
              defaultValue={v.email}
              type="email"
              autoComplete="email"
              hint="Your receipt and tracking link are tied to this email."
              className="sm:col-span-2"
            />
            <Field
              label="Delivery address"
              name="address"
              error={fe.address}
              defaultValue={v.address}
              autoComplete="street-address"
              className="sm:col-span-2"
            />
            <Field label="City / town" name="city" error={fe.city} defaultValue={v.city} autoComplete="address-level2" />
            <label className="block text-sm font-medium">
              State
              <select
                name="state"
                value={deliveryState}
                onChange={(e) => setDeliveryState(e.target.value)}
                aria-invalid={!!fe.state}
                className={field}
              >
                <option value="">Choose a state…</option>
                {nigerianStates.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              {fe.state && <span className="mt-1 block text-xs text-accent">{fe.state}</span>}
            </label>
            <label className="block text-sm font-medium sm:col-span-2">
              Delivery notes <span className="font-normal text-muted">(optional)</span>
              <textarea name="notes" rows={3} defaultValue={v.notes} placeholder="Landmark, gate code, site contact…" className={field} />
            </label>
          </div>
        </div>

        <aside className="card p-6 lg:sticky lg:top-20">
          <h2 className="font-semibold">Your order</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {lines.map((l) => (
              <li key={l.productId} className="flex justify-between gap-3">
                <span>
                  {l.quantity} × {l.name}
                </span>
                <span className="shrink-0 font-medium">{formatNaira(l.priceKobo * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd>{delivery === null ? "Choose a state" : delivery === 0 ? "Free" : formatNaira(delivery)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
              <dt>Total</dt>
              <dd>{formatNaira(subtotal + (delivery ?? 0))}</dd>
            </div>
          </dl>

          {state.error && (
            <p role="alert" className="mt-4 rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent">
              {state.error}{" "}
              {state.orderToken && (
                <Link href={`/shop/order/${state.orderToken}`} className="font-semibold underline">
                  Go to your order
                </Link>
              )}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn-primary mt-6 w-full py-3 disabled:opacity-60">
            {pending ? "Starting secure payment…" : <>Pay {formatNaira(subtotal + (delivery ?? 0))} <Icon name="lock" /></>}
          </button>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted">
            You&rsquo;ll be taken to Paystack to pay by card, bank transfer or USSD. Prices and stock are confirmed when
            you pay.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  className = "",
  ...props
}: { label: string; name: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block text-sm font-medium ${className}`}>
      {label}
      <input name={name} aria-invalid={!!error} className={field} {...props} />
      {error ? (
        <span className="mt-1 block text-xs text-accent">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>
      )}
    </label>
  );
}
