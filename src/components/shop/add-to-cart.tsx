"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "../icons";
import { cart, useCart, type CartLine } from "./cart-store";

export function AddToCart({ line, compact = false }: { line: Omit<CartLine, "quantity">; compact?: boolean }) {
  const lines = useCart();
  const inCart = lines.find((l) => l.productId === line.productId)?.quantity ?? 0;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = line.stock <= 0;
  const maxMore = Math.max(0, line.stock - inCart);

  function add(n: number) {
    cart.add(line, n);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  if (compact) {
    return (
      <button
        type="button"
        disabled={soldOut || maxMore === 0}
        onClick={() => add(1)}
        aria-label={`Add ${line.name} to cart`}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
      >
        <Icon name={added ? "check" : "plus"} />
      </button>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-line bg-card">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={qty <= 1}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid size-11 place-items-center rounded-full disabled:opacity-40"
          >
            <Icon name="minus" />
          </button>
          <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={qty >= maxMore}
            onClick={() => setQty((q) => Math.min(maxMore, q + 1))}
            className="grid size-11 place-items-center rounded-full disabled:opacity-40"
          >
            <Icon name="plus" />
          </button>
        </div>
        <button
          type="button"
          disabled={soldOut || maxMore === 0}
          onClick={() => add(qty)}
          className="btn-primary flex-1 py-3 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
        >
          {soldOut ? "Out of stock" : added ? <>Added <Icon name="check" /></> : <>Add to cart <Icon name="bag" /></>}
        </button>
      </div>
      {inCart > 0 && (
        <p className="mt-3 text-sm text-muted">
          {inCart} in your cart ·{" "}
          <Link href="/shop/cart" className="font-medium text-brand hover:underline">
            View cart &amp; checkout
          </Link>
        </p>
      )}
    </div>
  );
}
