import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { collections, escapeRegex, toApp, type ProductDoc } from "./db";

// Public catalogue reads. Cached and tagged "products"; admin edits and paid orders
// (which change stock) invalidate the tag.
export const PRODUCTS_TAG = "products";

export type CatalogProduct = Awaited<ReturnType<typeof withImages>>[number];

async function withImages(rows: ProductDoc[]) {
  const { images } = await collections();
  const ids = rows.map((r) => r._id);
  const imgs = ids.length
    ? await images
        .find({ productId: { $in: ids } }, { projection: { _id: 1, productId: 1 } })
        .sort({ position: 1, createdAt: 1 })
        .toArray()
    : [];
  return rows.map((r) => ({
    ...toApp(r),
    imageIds: imgs.filter((i) => i.productId === r._id).map((i) => i._id),
  }));
}

export async function listProducts({ category, q }: { category?: string; q?: string } = {}) {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("hours");

  const { products } = await collections();
  const filter: Record<string, unknown> = { active: true };
  if (category) filter.category = category;
  if (q) {
    const re = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ name: re }, { brand: re }, { description: re }];
  }
  const rows = await products.find(filter).sort({ featured: -1, name: 1 }).toArray();
  return withImages(rows);
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("hours");

  const { products } = await collections();
  const row = await products.findOne({ slug, active: true });
  if (!row) return null;
  const [product] = await withImages([row]);
  return product;
}

export async function getRelatedProducts(category: string, excludeId: string) {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("hours");

  const { products } = await collections();
  const rows = await products
    .find({ active: true, category, _id: { $ne: excludeId } })
    .sort({ featured: -1, name: 1 })
    .limit(4)
    .toArray();
  return withImages(rows);
}

/** Raw image bytes for the image route. Not cached here — the route sets immutable HTTP caching. */
export async function getImage(id: string) {
  const { images } = await collections();
  const img = await images.findOne({ _id: id }, { projection: { data: 1, contentType: 1 } });
  return img ? { data: img.data.buffer, contentType: img.contentType } : null;
}
