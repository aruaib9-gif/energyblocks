import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s · Admin · Energy Blocks", default: "Admin · Energy Blocks" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-full flex-1 bg-[#eef2f9]">{children}</div>;
}
