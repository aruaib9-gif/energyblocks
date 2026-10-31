import type { Metadata } from "next";
import Link from "next/link";
import { ShopHeader } from "@/components/shop/shop-header";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: {
    template: "%s | Energy Blocks Marketplace",
    default: "Marketplace — Fire Safety, CCTV, PPE & Site Equipment | Energy Blocks",
  },
  description:
    "Buy fire extinguishers, alarms, CCTV cameras, access control, PPE and construction equipment from Energy Blocks. Pay securely online and track delivery anywhere in Nigeria.",
};

export default function ShopLayout({ children }: LayoutProps<"/shop">) {
  return (
    <>
      <ShopHeader />
      <div className="flex-1">{children}</div>
      <footer className="mt-24 bg-ink px-6 py-10 text-sm text-white/65">
        <div className="container-x flex flex-wrap items-center justify-between gap-4">
          <p>
            © Energy Blocks Construction Ltd · {company.rc} · Secure payments by Paystack
          </p>
          <nav aria-label="Footer" className="flex flex-wrap gap-5">
            <Link href="/shop/track" className="hover:text-white">
              Track an order
            </Link>
            <a href={company.phoneHref} className="hover:text-white">
              {company.phone}
            </a>
            <Link href="/" className="hover:text-white">
              Main site
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
