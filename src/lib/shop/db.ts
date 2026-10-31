import "server-only";
import { Binary, MongoClient, type Db } from "mongodb";
import type { Admin, Order, OrderEvent, OrderItem, Payment, Product } from "./schema";

// MongoDB Atlas. Set MONGODB_URI (mongodb+srv://…) and optionally MONGODB_DB.
// The client is cached on globalThis so serverless invocations and dev hot-reloads reuse
// one connection pool instead of opening a new one per request.

type WithMongoId<T extends { id: string }> = Omit<T, "id"> & { _id: string };

export type ProductDoc = WithMongoId<Product>;
export type OrderDoc = WithMongoId<Order> & { items: OrderItem[]; events: OrderEvent[] };
export type PaymentDoc = WithMongoId<Payment>;
export type AdminDoc = WithMongoId<Admin>;
/** A product photo: `key` when stored on Cloudflare R2, `data` for the older in-database storage. */
export type ImageDoc = {
  _id: string;
  productId: string;
  key?: string;
  data?: Binary;
  contentType: string;
  position: number;
  createdAt: number;
};

const g = globalThis as unknown as { ebMongo?: MongoClient; ebIndexes?: Promise<unknown> };

function client() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add your MongoDB Atlas connection string (mongodb+srv://…) to " +
        ".env.local for development and to your hosting provider's environment variables for production.",
    );
  }
  g.ebMongo ??= new MongoClient(uri, { appName: "energy-blocks", maxPoolSize: 10 });
  return g.ebMongo;
}

function database(): Db {
  return client().db(process.env.MONGODB_DB || "energyblocks");
}

/** Typed collections. Indexes are ensured once per process on first use. */
export async function collections() {
  const db = database();
  const c = {
    products: db.collection<ProductDoc>("products"),
    images: db.collection<ImageDoc>("product_images"),
    orders: db.collection<OrderDoc>("orders"),
    payments: db.collection<PaymentDoc>("payments"),
    admins: db.collection<AdminDoc>("admins"),
  };
  g.ebIndexes ??= Promise.all([
    c.products.createIndexes([{ key: { slug: 1 }, unique: true }, { key: { category: 1, active: 1 } }]),
    c.images.createIndex({ productId: 1, position: 1 }),
    c.orders.createIndexes([
      { key: { number: 1 }, unique: true },
      { key: { accessToken: 1 }, unique: true },
      { key: { email: 1 } },
      { key: { status: 1, createdAt: -1 } },
    ]),
    c.payments.createIndexes([{ key: { reference: 1 }, unique: true }, { key: { orderId: 1 } }]),
    c.admins.createIndex({ email: 1 }, { unique: true }),
  ]).catch((e) => {
    g.ebIndexes = undefined; // retry on next call
    throw e;
  });
  await g.ebIndexes;
  return c;
}

/** Runs `fn` in a multi-document transaction (Atlas clusters are replica sets, so this is supported). */
export async function withTransaction<T>(fn: (session: import("mongodb").ClientSession) => Promise<T>) {
  const session = client().startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export const newId = () => crypto.randomUUID();

/** Maps a Mongo document's `_id` to the `id` the rest of the app uses. */
export function toApp<T extends { _id: string }>(doc: T): Omit<T, "_id"> & { id: string } {
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
}

export const isDuplicateKey = (e: unknown) => (e as { code?: number })?.code === 11000;

export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
