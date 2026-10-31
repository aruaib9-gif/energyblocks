import "server-only";
import { and, asc, count, desc, eq, gte, inArray, like, lte, or, sql, sum } from "drizzle-orm";
import { requireAdmin } from "./auth";
import { db } from "./db";
import { admins, orderEvents, orderItems, orders, payments, productImages, products, type OrderStatus } from "./schema";

// Admin data access. Every function re-checks the session itself, so a page or action
// can't accidentally expose data by forgetting to.

export const LOW_STOCK = 5;

export async function dashboardStats() {
  await requireAdmin();
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const [[allTime], [last30], [toFulfil], [inTransit], [awaitingPayment], lowStock, recent, flagged] = await Promise.all([
    db.select({ total: sum(orders.totalKobo), n: count() }).from(orders).where(eq(orders.paymentStatus, "paid")),
    db
      .select({ total: sum(orders.totalKobo), n: count() })
      .from(orders)
      .where(and(eq(orders.paymentStatus, "paid"), gte(orders.paidAt, since))),
    db.select({ n: count() }).from(orders).where(inArray(orders.status, ["paid", "processing"])),
    db.select({ n: count() }).from(orders).where(inArray(orders.status, ["shipped", "out_for_delivery"])),
    db.select({ n: count() }).from(orders).where(eq(orders.status, "pending_payment")),
    db
      .select({ id: products.id, name: products.name, stock: products.stock })
      .from(products)
      .where(and(eq(products.active, true), lte(products.stock, LOW_STOCK)))
      .orderBy(asc(products.stock))
      .limit(8),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8),
    db
      .select({ id: orders.id, number: orders.number })
      .from(orders)
      .where(
        or(
          eq(orders.stockIssue, true),
          sql`exists (select 1 from ${orderEvents} e where e.order_id = ${orders.id} and e.status in ('payment_flagged','payment_duplicate'))`,
          and(eq(orders.status, "cancelled"), eq(orders.paymentStatus, "paid")),
        ),
      )
      .limit(10),
  ]);
  return {
    revenueKobo: Number(allTime.total ?? 0),
    paidOrders: allTime.n,
    revenue30Kobo: Number(last30.total ?? 0),
    paidOrders30: last30.n,
    toFulfil: toFulfil.n,
    inTransit: inTransit.n,
    awaitingPayment: awaitingPayment.n,
    lowStock,
    recent,
    flagged,
  };
}

export async function adminListProducts(q?: string) {
  await requireAdmin();
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      category: products.category,
      sku: products.sku,
      priceKobo: products.priceKobo,
      stock: products.stock,
      active: products.active,
      featured: products.featured,
      updatedAt: products.updatedAt,
      imageId: sql<string | null>`(select id from ${productImages} i where i.product_id = ${products.id} order by i.position, i.created_at limit 1)`,
    })
    .from(products)
    .where(q ? or(like(products.name, `%${q}%`), like(products.sku, `%${q}%`)) : undefined)
    .orderBy(asc(products.name));
  return rows;
}

export async function adminGetProduct(id: string) {
  await requireAdmin();
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) return null;
  const images = await db
    .select({ id: productImages.id, position: productImages.position })
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(asc(productImages.position), asc(productImages.createdAt));
  return { product, images };
}

export async function adminListOrders({ status, q }: { status?: string; q?: string }) {
  await requireAdmin();
  const filters = [];
  if (status === "flagged") filters.push(eq(orders.stockIssue, true));
  else if (status) filters.push(eq(orders.status, status as OrderStatus));
  if (q) {
    const term = `%${q.trim()}%`;
    filters.push(or(like(orders.number, term), like(orders.email, term), like(orders.name, term), like(orders.phone, term))!);
  }
  const [rows, counts] = await Promise.all([
    db
      .select({
        id: orders.id,
        number: orders.number,
        name: orders.name,
        email: orders.email,
        state: orders.state,
        totalKobo: orders.totalKobo,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        stockIssue: orders.stockIssue,
        createdAt: orders.createdAt,
        itemCount: sql<number>`(select coalesce(sum(quantity),0) from ${orderItems} oi where oi.order_id = ${orders.id})`,
      })
      .from(orders)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(orders.createdAt))
      .limit(200),
    db.select({ status: orders.status, n: count() }).from(orders).groupBy(orders.status),
  ]);
  return { rows, counts: Object.fromEntries(counts.map((c) => [c.status, c.n])) as Record<string, number> };
}

export async function adminGetOrder(id: string) {
  await requireAdmin();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return null;
  const [items, events, attempts] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, id)).orderBy(desc(orderEvents.createdAt)),
    db.select().from(payments).where(eq(payments.orderId, id)).orderBy(desc(payments.createdAt)),
  ]);
  return { order, items, events, attempts };
}

export async function adminListPayments(status?: string) {
  await requireAdmin();
  const valid = ["initialized", "success", "failed", "abandoned"] as const;
  const s = valid.find((v) => v === status);
  return db
    .select({
      id: payments.id,
      reference: payments.reference,
      amountKobo: payments.amountKobo,
      status: payments.status,
      channel: payments.channel,
      gatewayResponse: payments.gatewayResponse,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
      orderId: orders.id,
      orderNumber: orders.number,
      email: orders.email,
    })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .where(s ? eq(payments.status, s) : undefined)
    .orderBy(desc(payments.createdAt))
    .limit(300);
}

export async function adminListAdmins() {
  await requireAdmin();
  return db
    .select({ id: admins.id, name: admins.name, email: admins.email, createdAt: admins.createdAt })
    .from(admins)
    .orderBy(asc(admins.createdAt));
}
