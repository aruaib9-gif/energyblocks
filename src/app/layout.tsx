import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.energyblocks.com"),
  title: "Energy Blocks — We Build Now, You Pay Later | Construction on Credit in Nigeria",
  description:
    "Energy Blocks Construction Ltd delivers construction, welding & fabrication, marine support, vessel hire, procurement & supply chain, manpower and facility maintenance across Nigeria. Deposit-free mobilisation, milestone-based payment, 72-hour site setup.",
  keywords: [
    "construction company Nigeria",
    "oil and gas fabrication Nigeria",
    "marine support services Nigeria",
    "vessel hire Nigeria",
    "procurement supply chain oil and gas",
    "manpower services Nigeria",
    "facility maintenance oil and gas",
    "NDT services Port Harcourt",
    "Energy Blocks",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://www.energyblocks.com",
    siteName: "Energy Blocks Construction Ltd",
    title: "Energy Blocks — We build now. You pay later.",
    description:
      "Construction, fabrication, marine support, vessel hire, procurement, manpower and facility maintenance across Nigeria.",
  },
};

export const viewport: Viewport = {
  themeColor: "#d5e0f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Arms the scroll reveals before first paint. If the app never hydrates, the fallback
            timer drops the hidden state so content can't stay invisible. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var r=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;r.setAttribute("data-fx","");setTimeout(function(){if(!r.hasAttribute("data-fx-ready"))r.removeAttribute("data-fx")},4000)})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
