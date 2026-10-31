import { blob, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Money is stored in kobo (₦1 = 100 kobo) and timestamps as epoch milliseconds,
// so every row serialises cleanly across the server/client boundary and into caches.

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now());
const updatedAt = () =>
  integer("updated_at")
    .notNull()
    .$defaultFn(() => Date.now());

export const products = sqliteTable(
  "products",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    category: text("category").notNull(),
    brand: text("brand").notNull().default(""),
    sku: text("sku").notNull().default(""),
    // One "Label: value" pair per line, shown as a spec table.
    specs: text("specs").notNull().default(""),
    priceKobo: integer("price_kobo").notNull(),
    compareAtKobo: integer("compare_at_kobo"),
    stock: integer("stock").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("products_category_idx").on(t.category)],
);

export const productImages = sqliteTable(
  "product_images",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    data: blob("data", { mode: "buffer" }).notNull(),
    contentType: text("content_type").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export const orders = sqliteTable(
  "orders",
  {
    id: id(),
    number: text("number").notNull().unique(),
    // Unguessable token that lets the customer view their order without an account.
    accessToken: text("access_token").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    notes: text("notes").notNull().default(""),
    subtotalKobo: integer("subtotal_kobo").notNull(),
    deliveryKobo: integer("delivery_kobo").notNull(),
    totalKobo: integer("total_kobo").notNull(),
    paymentStatus: text("payment_status", { enum: ["pending", "paid", "failed", "refunded"] })
      .notNull()
      .default("pending"),
    status: text("status", {
      enum: ["pending_payment", "paid", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"],
    })
      .notNull()
      .default("pending_payment"),
    courier: text("courier").notNull().default(""),
    trackingNumber: text("tracking_number").notNull().default(""),
    // Set when payment arrived but stock had already run out for an item.
    stockIssue: integer("stock_issue", { mode: "boolean" }).notNull().default(false),
    paidAt: integer("paid_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("orders_email_idx").on(t.email), index("orders_status_idx").on(t.status)],
);

export const orderItems = sqliteTable("order_items", {
  id: id(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  priceKobo: integer("price_kobo").notNull(),
  quantity: integer("quantity").notNull(),
});

export const orderEvents = sqliteTable("order_events", {
  id: id(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  note: text("note").notNull().default(""),
  actor: text("actor").notNull().default("system"),
  createdAt: createdAt(),
});

export const payments = sqliteTable(
  "payments",
  {
    id: id(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    reference: text("reference").notNull().unique(),
    amountKobo: integer("amount_kobo").notNull(),
    status: text("status", { enum: ["initialized", "success", "failed", "abandoned"] })
      .notNull()
      .default("initialized"),
    channel: text("channel").notNull().default(""),
    gatewayResponse: text("gateway_response").notNull().default(""),
    paidAt: integer("paid_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("payments_order_idx").on(t.orderId)],
);

export const admins = sqliteTable("admins", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: createdAt(),
});

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderEvent = typeof orderEvents.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type OrderStatus = Order["status"];
