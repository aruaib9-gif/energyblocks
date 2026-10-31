"use client";

import { useEffect } from "react";
import { cart } from "./cart-store";

/** Empties the cart once an order is confirmed paid (once per order, so later shopping isn't wiped). */
export function ClearCartOnPaid({ orderNumber }: { orderNumber: string }) {
  useEffect(() => {
    const key = `eb-cleared-${orderNumber}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    cart.clear();
  }, [orderNumber]);
  return null;
}
