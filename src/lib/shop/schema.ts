// Document shapes stored in MongoDB.
// Ids are UUID strings (not ObjectIds) so they drop straight into URLs and serialise cleanly.
// Money is in kobo (₦1 = 100 kobo) and timestamps are epoch milliseconds.

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type AttemptStatus = "initialized" | "success" | "failed" | "abandoned";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  /** One "Label: value" pair per line, shown as a spec table. */
  specs: string;
  priceKobo: number;
  compareAtKobo: number | null;
  stock: number;
  active: boolean;
  featured: boolean;
  createdAt: number;
  updatedAt: number;
};

export type ProductImageMeta = { id: string; productId: string; position: number; createdAt: number };

export type OrderItem = { id: string; productId: string | null; name: string; priceKobo: number; quantity: number };

export type OrderEvent = { id: string; status: string; note: string; actor: string; createdAt: number };

export type Order = {
  id: string;
  number: string;
  /** Unguessable token that lets the customer view their order without an account. */
  accessToken: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes: string;
  subtotalKobo: number;
  deliveryKobo: number;
  totalKobo: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  courier: string;
  trackingNumber: string;
  /** Set when payment arrived but stock had already run out for an item. */
  stockIssue: boolean;
  paidAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type Payment = {
  id: string;
  orderId: string;
  provider: string;
  reference: string;
  amountKobo: number;
  status: AttemptStatus;
  channel: string;
  gatewayResponse: string;
  paidAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type Admin = { id: string; email: string; name: string; passwordHash: string; createdAt: number };
