"use client";

import Link from "next/link";
import { Icon } from "../icons";
import { Logo } from "../logo";
import { cartCount, useCart } from "./cart-store";

export function ShopHeader() {
  const count = cartCount(useCart());
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur-md">
      <div className="container-x flex h-14 items-center gap-6 px-6 lg:px-0">
        <Link href="/" aria-label="Energy Blocks — main site">
          <Logo />
        </Link>
        <Link
          href="/shop"
          className="hidden rounded-full bg-highlight px-2.5 py-0.5 text-[11px] font-bold tracking-[0.16em] text-ink uppercase sm:inline"
        >
          Marketplace
        </Link>
        <nav aria-label="Shop" className="ml-auto flex items-center gap-1 text-sm sm:gap-4">
          <Link href="/shop" className="rounded-full px-3 py-1.5 hover:bg-card max-sm:hidden">
            All products
          </Link>
          <Link href="/shop/track" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-card">
            <Icon name="truck" /> <span className="max-sm:sr-only">Track order</span>
          </Link>
          <Link href="/shop/cart" className="btn-primary relative py-1.5" aria-label={`Cart, ${count} items`}>
            <Icon name="bag" /> Cart
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
