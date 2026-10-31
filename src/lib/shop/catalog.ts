import "server-only";
import { and, asc, desc, eq, inArray, like, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { productImages, products } from "./schema";

// Public catalogue reads. Cached and tagged "products"; admin edits and paid orders
// (which change stock) invalidate the tag.
export const PRODUCTS_TAG = "products";

export type CatalogProduct = Awaited<ReturnType<typeof withImages>>[number];

async function withImages(rows: (typeof products.$inferSelect)[]) {
  const ids = rows.map((r) => r.id);
  const images = ids.length
    ? await db
        .select({ id: productImages.id, productId: productImages.productId })
        .from(productImages)
        .where(inArray(productImages.productId, ids))
        .orderBy(asc(productImages.position), asc(productImages.createdAt))
    : [];
  return rows.map((r) => ({
    ...r,
    imageIds: images.filter((i) => i.productId === r.id).map((i) => i.id),
  }));
}

export async function listProducts({ category, q }: { category?: string; q?: string } = {}) {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("hours");

  const filters = [eq(products.active, true)];
  if (category) filters.push(eq(products.category, category));
  if (q) {
    const term = `%${q.replace(/[%_]/g, "")}%`;
    filters.push(or(like(products.name, term), like(products.brand, term), like(products.description, term))!);
  }
  const rows = await db
    .select()
    .from(products)
    .where(and(...filters))
    .orderBy(desc(products.featured), asc(products.name));
  return withImages(rows);
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("hours");

  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.active, true)))
    .limit(1);
  const [product] = await withImages(rows);
  return product ?? null;
}

export async function getRelatedProducts(category: string, excludeId: string) {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("hours");

  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.active, true), eq(products.category, category)))
    .orderBy(desc(products.featured))
    .limit(5);
  return withImages(rows.filter((r) => r.id !== excludeId).slice(0, 4));
}
