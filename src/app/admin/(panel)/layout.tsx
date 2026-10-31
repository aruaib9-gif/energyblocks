import Link from "next/link";
import { Suspense } from "react";
import { AdminNav, AdminNavLinks } from "@/components/admin/admin-nav";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { getAdmin } from "@/lib/shop/auth";
import { paymentsMode } from "@/lib/shop/paystack";
import { logout } from "../actions";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-6 bg-ink px-4 py-5 text-white lg:sticky lg:top-0 lg:h-svh">
        <div className="flex items-center justify-between px-2">
          <Link href="/admin">
            <Logo inverted />
          </Link>
        </div>
        <Suspense fallback={<AdminNavLinks path="" />}>
          <AdminNav />
        </Suspense>
        <div className="mt-auto space-y-3 max-lg:hidden">
          <PaymentsBadge />
          <Link href="/shop" target="_blank" className="flex items-center gap-2 px-3 text-sm text-white/60 hover:text-white">
            <Icon name="bag" /> View storefront
          </Link>
          <Suspense fallback={<div className="h-14" />}>
            <WhoAmI />
          </Suspense>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}

function PaymentsBadge() {
  const mode = paymentsMode();
  const label = { live: "Paystack connected", simulated: "Payments: simulator (dev)", unconfigured: "Payments not configured" }[mode];
  return (
    <p
      className={`mx-1 rounded-lg px-3 py-2 text-xs font-medium ${
        mode === "live" ? "bg-[#25d366]/15 text-[#7ee2a8]" : "bg-highlight/15 text-highlight"
      }`}
    >
      {label}
    </p>
  );
}

async function WhoAmI() {
  const admin = await getAdmin();
  if (!admin) return null;
  return (
    <form action={logout} className="flex items-center justify-between gap-2 rounded-xl bg-white/6 px-3 py-2.5">
      <span className="min-w-0 text-sm">
        <span className="block truncate font-medium">{admin.name}</span>
        <span className="block truncate text-xs text-white/50">{admin.email}</span>
      </span>
      <button aria-label="Sign out" className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
        <Icon name="logout" />
      </button>
    </form>
  );
}
