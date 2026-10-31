// Client-safe shop constants and helpers (no database access here).
import type { IconName } from "@/components/icons";

export const categories = [
  { slug: "fire-safety", label: "Fire safety", icon: "flame", blurb: "Extinguishers, alarms, detectors and blankets" },
  { slug: "cctv-security", label: "CCTV & security", icon: "cctv", blurb: "Cameras, recorders, access control and screening" },
  { slug: "ppe", label: "PPE & workwear", icon: "hardhat", blurb: "Helmets, boots, harnesses and hi-vis" },
  { slug: "tools", label: "Tools & equipment", icon: "wrench", blurb: "Site tools, testers and measuring kit" },
  { slug: "electrical", label: "Electrical", icon: "zap", blurb: "Cables, reels, lighting and power" },
  { slug: "materials", label: "Building materials", icon: "boxes", blurb: "Fixings, sealants and site consumables" },
] as const satisfies readonly { slug: string; label: string; icon: IconName; blurb: string }[];

export type CategorySlug = (typeof categories)[number]["slug"];

export function categoryOf(slug: string) {
  return categories.find((c) => c.slug === slug) ?? categories[0];
}

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const nairaExact = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });

export function formatNaira(kobo: number) {
  return kobo % 100 === 0 ? naira.format(kobo / 100) : nairaExact.format(kobo / 100);
}

export const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const;

// Delivery fees in kobo. Placeholder rates — set these to your real logistics costs.
const deliveryRates: Record<string, number> = {
  Lagos: 3_500_00,
  Ogun: 5_000_00,
  Rivers: 4_000_00,
  Delta: 5_000_00,
  Bayelsa: 5_500_00,
  "Akwa Ibom": 5_500_00,
  "FCT (Abuja)": 6_000_00,
};
const defaultDeliveryKobo = 7_500_00;
export const freeDeliveryOverKobo = 500_000_00;

export function deliveryFeeFor(state: string, subtotalKobo: number) {
  if (subtotalKobo >= freeDeliveryOverKobo) return 0;
  return deliveryRates[state] ?? defaultDeliveryKobo;
}

export const orderStatusLabels = {
  pending_payment: "Awaiting payment",
  paid: "Payment confirmed",
  processing: "Being prepared",
  shipped: "Dispatched",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
} as const;

export type OrderStatusKey = keyof typeof orderStatusLabels;

/** Which statuses an admin may move an order to from each status. */
export const nextStatuses: Record<OrderStatusKey, OrderStatusKey[]> = {
  pending_payment: ["cancelled"],
  paid: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered", "shipped"],
  delivered: [],
  cancelled: [],
};

// The customer-facing journey, in order.
export const fulfilmentSteps: OrderStatusKey[] = ["paid", "processing", "shipped", "out_for_delivery", "delivered"];

export const paymentStatusLabels = {
  pending: "Unpaid",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
} as const;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseSpecs(specs: string) {
  return specs
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      return i === -1 ? { label: l, value: "" } : { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() };
    });
}

export const imageUrl = (id: string) => `/api/shop/images/${id}`;
