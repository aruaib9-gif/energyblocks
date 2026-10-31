import "server-only";
import { Binary } from "mongodb";
import { requireAdmin } from "./auth";
import { collections, escapeRegex, newId, toApp, withTransaction } from "./db";
import { event, splitOrder } from "./orders";
import type { OrderStatus, Product } from "./schema";

// Admin data access. Every function re-checks the session itself, so a page or action
// can't accidentally expose or change data by forgetting to.

export const LOW_STOCK = 5;

/* ---------- Reads ---------- */

export async function dashboardStats() {
  await requireAdmin();
  const { orders, products } = await collections();
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const sumPaid = (match: Record<string, unknown>) =>
    orders
      .aggregate<{ total: number; n: number }>([
        { $match: { paymentStatus: "paid", ...match } },
        { $group: { _id: null, total: { $sum: "$totalKobo" }, n: { $sum: 1 } } },
      ])
      .toArray()
      .then((r) => r[0] ?? { total: 0, n: 0 });

  const [allTime, last30, toFulfil, inTransit, awaitingPayment, lowStock, recent, flagged] = await Promise.all([
    sumPaid({}),
    sumPaid({ paidAt: { $gte: since } }),
    orders.countDocuments({ status: { $in: ["paid", "processing"] } }),
    orders.countDocuments({ status: { $in: ["shipped", "out_for_delivery"] } }),
    orders.countDocuments({ status: "pending_payment" }),
    products
      .find({ active: true, stock: { $lte: LOW_STOCK } }, { projection: { name: 1, stock: 1 } })
      .sort({ stock: 1 })
      .limit(8)
      .toArray(),
    orders.find({}, { projection: { items: 0, events: 0 } }).sort({ createdAt: -1 }).limit(8).toArray(),
    orders
      .find(
        {
          $or: [
            { stockIssue: true },
            { "events.status": { $in: ["payment_flagged", "payment_duplicate"] } },
            { status: "cancelled", paymentStatus: "paid" },
          ],
        },
        { projection: { number: 1 } },
      )
      .limit(10)
      .toArray(),
  ]);
  return {
    revenueKobo: allTime.total,
    paidOrders: allTime.n,
    revenue30Kobo: last30.total,
    paidOrders30: last30.n,
    toFulfil,
    inTransit,
    awaitingPayment,
    lowStock: lowStock.map((p) => ({ id: p._id, name: p.name, stock: p.stock })),
    recent: recent.map((o) => splitOrder({ ...o, items: [], events: [] }).order),
    flagged: flagged.map((o) => ({ id: o._id, number: o.number })),
  };
}

export async function adminListProducts(q?: string) {
  await requireAdmin();
  const { products, images } = await collections();
  const filter = q ? { $or: [{ name: { $regex: escapeRegex(q), $options: "i" } }, { sku: { $regex: escapeRegex(q), $options: "i" } }] } : {};
  const rows = await products.find(filter).sort({ name: 1 }).toArray();
  const firsts = await images
    .aggregate<{ _id: string; imageId: string }>([
      { $match: { productId: { $in: rows.map((r) => r._id) } } },
      { $sort: { position: 1, createdAt: 1 } },
      { $group: { _id: "$productId", imageId: { $first: "$_id" } } },
    ])
    .toArray();
  const firstFor = new Map(firsts.map((f) => [f._id, f.imageId]));
  return rows.map((r) => ({ ...toApp(r), imageId: firstFor.get(r._id) ?? null }));
}

export async function adminGetProduct(id: string) {
  await requireAdmin();
  const { products, images } = await collections();
  const product = await products.findOne({ _id: id });
  if (!product) return null;
  const imgs = await images
    .find({ productId: id }, { projection: { _id: 1, position: 1 } })
    .sort({ position: 1, createdAt: 1 })
    .toArray();
  return { product: toApp(product) as Product, images: imgs.map((i) => ({ id: i._id, position: i.position })) };
}

export async function adminListOrders({ status, q }: { status?: string; q?: string }) {
  await requireAdmin();
  const { orders } = await collections();
  const filter: Record<string, unknown> = {};
  if (status === "flagged") filter.stockIssue = true;
  else if (status) filter.status = status;
  if (q) {
    const re = { $regex: escapeRegex(q.trim()), $options: "i" };
    filter.$or = [{ number: re }, { email: re }, { name: re }, { phone: re }];
  }
  const [rows, counts] = await Promise.all([
    orders.find(filter, { projection: { events: 0 } }).sort({ createdAt: -1 }).limit(200).toArray(),
    orders.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]).toArray(),
  ]);
  return {
    rows: rows.map((o) => ({
      ...splitOrder({ ...o, events: [] }).order,
      itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
    })),
    counts: Object.fromEntries(counts.map((c) => [c._id, c.n])) as Record<string, number>,
  };
}

export async function adminGetOrder(id: string) {
  await requireAdmin();
  const { orders, payments } = await collections();
  const doc = await orders.findOne({ _id: id });
  if (!doc) return null;
  const { order, items, events } = splitOrder(doc);
  const attempts = await payments.find({ orderId: id }).sort({ createdAt: -1 }).toArray();
  return {
    order,
    items,
    events: [...events].sort((a, b) => b.createdAt - a.createdAt),
    attempts: attempts.map(toApp),
  };
}

export async function adminListPayments(status?: string) {
  await requireAdmin();
  const { payments, orders } = await collections();
  const valid = ["initialized", "success", "failed", "abandoned"];
  const rows = await payments
    .find(status && valid.includes(status) ? { status: status as "success" } : {})
    .sort({ createdAt: -1 })
    .limit(300)
    .toArray();
  const os = await orders
    .find({ _id: { $in: [...new Set(rows.map((r) => r.orderId))] } }, { projection: { number: 1, email: 1 } })
    .toArray();
  const byId = new Map(os.map((o) => [o._id, o]));
  return rows.map((p) => ({
    ...toApp(p),
    orderNumber: byId.get(p.orderId)?.number ?? "—",
    email: byId.get(p.orderId)?.email ?? "",
  }));
}

export async function adminListAdmins() {
  await requireAdmin();
  const { admins } = await collections();
  const rows = await admins.find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: 1 }).toArray();
  return rows.map((a) => ({ id: a._id, name: a.name, email: a.email, createdAt: a.createdAt }));
}

/* ---------- Products ---------- */

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

/** Creates or updates a product. Throws a duplicate-key error (11000) if the slug is taken. */
export async function upsertProduct(id: string | null, input: ProductInput) {
  await requireAdmin();
  const { products } = await collections();
  const now = Date.now();
  if (id) {
    await products.updateOne({ _id: id }, { $set: { ...input, updatedAt: now } });
    return id;
  }
  const _id = newId();
  await products.insertOne({ _id, ...input, createdAt: now, updatedAt: now });
  return _id;
}

/** Products that have been sold are hidden rather than deleted, to keep order history intact. */
export async function removeProduct(id: string) {
  await requireAdmin();
  const { products, orders, images } = await collections();
  const sold = await orders.findOne({ "items.productId": id }, { projection: { _id: 1 } });
  if (sold) {
    await products.updateOne({ _id: id }, { $set: { active: false, updatedAt: Date.now() } });
  } else {
    await products.deleteOne({ _id: id });
    await images.deleteMany({ productId: id });
  }
}

export async function addImages(productId: string, files: { data: Buffer; contentType: string }[]) {
  await requireAdmin();
  if (!files.length) return;
  const { images } = await collections();
  const last = await images.find({ productId }).sort({ position: -1 }).limit(1).next();
  const start = (last?.position ?? -1) + 1;
  await images.insertMany(
    files.map((f, i) => ({
      _id: newId(),
      productId,
      data: new Binary(f.data),
      contentType: f.contentType,
      position: start + i,
      createdAt: Date.now(),
    })),
  );
}

export async function removeImage(imageId: string) {
  await requireAdmin();
  const { images } = await collections();
  await images.deleteOne({ _id: imageId });
}

export async function setPrimaryImage(productId: string, imageId: string) {
  await requireAdmin();
  const { images } = await collections();
  const imgs = await images.find({ productId }, { projection: { _id: 1 } }).sort({ position: 1, createdAt: 1 }).toArray();
  const ordered = [imageId, ...imgs.map((i) => i._id).filter((i) => i !== imageId)];
  await images.bulkWrite(ordered.map((id, position) => ({ updateOne: { filter: { _id: id }, update: { $set: { position } } } })));
}

/* ---------- Orders ---------- */

export async function getOrderForUpdate(id: string) {
  await requireAdmin();
  const { orders } = await collections();
  const doc = await orders.findOne({ _id: id });
  return doc ? splitOrder(doc) : null;
}

/** Applies a status/courier change; cancelling a paid order returns its stock. */
export async function applyOrderUpdate(
  id: string,
  change: { status: OrderStatus | ""; courier: string; trackingNumber: string; note: string; actorName: string },
) {
  await requireAdmin();
  const { orders, products } = await collections();
  return withTransaction(async (session) => {
    const doc = await orders.findOne({ _id: id }, { session });
    if (!doc) return null;
    const update: Record<string, unknown> = {
      $set: {
        ...(change.status ? { status: change.status } : {}),
        courier: change.courier,
        trackingNumber: change.trackingNumber,
        updatedAt: Date.now(),
      },
    };
    if (change.status || change.note) {
      update.$push = { events: event(change.status || "note", change.note, "admin") };
    }
    await orders.updateOne({ _id: id }, update, { session });

    // With a stock shortfall we can't tell which lines were taken, so the admin adjusts by hand.
    let restocked = false;
    if (change.status === "cancelled" && doc.paymentStatus === "paid" && !doc.stockIssue) {
      for (const i of doc.items) {
        if (!i.productId) continue;
        await products.updateOne({ _id: i.productId }, { $inc: { stock: i.quantity }, $set: { updatedAt: Date.now() } }, { session });
      }
      restocked = true;
    }
    const after = (await orders.findOne({ _id: id }, { session }))!;
    return { ...splitOrder(after), restocked };
  });
}

export async function markOrderRefunded(id: string, adminName: string) {
  await requireAdmin();
  const { orders } = await collections();
  await orders.updateOne(
    { _id: id, paymentStatus: "paid" },
    {
      $set: { paymentStatus: "refunded", updatedAt: Date.now() },
      $push: { events: event("refunded", `Marked refunded by ${adminName}. Issue the refund from the Paystack dashboard.`, "admin") },
    },
  );
}

export async function clearStockIssue(id: string) {
  await requireAdmin();
  const { orders } = await collections();
  await orders.updateOne({ _id: id }, { $set: { stockIssue: false } });
}
