"use client";

import { useSyncExternalStore } from "react";

// The cart lives in localStorage. It only holds a display snapshot — checkout re-reads
// prices and stock from the database, so a stale or edited cart can't change what's charged.
export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  priceKobo: number;
  imageId: string | null;
  category: string;
  stock: number;
  quantity: number;
};

const KEY = "eb-cart-v1";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let cache: { raw: string | null; lines: CartLine[] } = { raw: null, lines: EMPTY };

function read(): CartLine[] {
  const raw = localStorage.getItem(KEY);
  if (raw !== cache.raw) {
    let lines: CartLine[] = EMPTY;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) lines = parsed;
    } catch {}
    cache = { raw, lines };
  }
  return cache.lines;
}

function write(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const cart = {
  add(line: Omit<CartLine, "quantity">, quantity = 1) {
    const lines = read();
    const existing = lines.find((l) => l.productId === line.productId);
    const next = existing
      ? lines.map((l) =>
          l.productId === line.productId ? { ...l, ...line, quantity: Math.min(line.stock, l.quantity + quantity) } : l,
        )
      : [...lines, { ...line, quantity: Math.min(line.stock, quantity) }];
    write(next);
  },
  setQuantity(productId: string, quantity: number) {
    write(
      read()
        .map((l) => (l.productId === productId ? { ...l, quantity: Math.max(0, Math.min(l.stock, quantity)) } : l))
        .filter((l) => l.quantity > 0),
    );
  },
  remove(productId: string) {
    write(read().filter((l) => l.productId !== productId));
  },
  clear() {
    write([]);
  },
};

const noop = () => () => {};
/** False during SSR and the first client render, so cart-dependent UI can avoid an "empty cart" flash. */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.priceKobo * l.quantity, 0);
