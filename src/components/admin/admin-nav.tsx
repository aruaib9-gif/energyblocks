"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "../icons";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Dashboard", icon: "gauge" },
  { href: "/admin/orders", label: "Orders", icon: "truck" },
  { href: "/admin/products", label: "Products", icon: "boxes" },
  { href: "/admin/payments", label: "Payments", icon: "wallet" },
  { href: "/admin/team", label: "Team & security", icon: "users" },
];

/** Highlights the current section. Wrap in <Suspense> with <AdminNavLinks path="" /> as fallback. */
export function AdminNav() {
  return <AdminNavLinks path={usePathname()} />;
}

export function AdminNavLinks({ path }: { path: string }) {
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {links.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/6 hover:text-white"
            }`}
          >
            <Icon name={l.icon} className="size-4.5" /> {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
