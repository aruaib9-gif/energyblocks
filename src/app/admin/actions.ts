"use server";

import { refresh, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import {
  addImages,
  applyOrderUpdate,
  clearStockIssue,
  getOrderForUpdate,
  markOrderRefunded,
  removeImage,
  removeProduct,
  setPrimaryImage,
  upsertProduct,
} from "@/lib/shop/admin";
import { changePassword, createAdmin, requireAdmin, signIn, signOut } from "@/lib/shop/auth";
import { PRODUCTS_TAG } from "@/lib/shop/catalog";
import { isDuplicateKey } from "@/lib/shop/db";
import { sendEmail, statusUpdateEmail } from "@/lib/shop/email";
import { categories, nextStatuses, orderStatusLabels, slugify } from "@/lib/shop/meta";
import { settlePayment } from "@/lib/shop/orders";
import type { OrderStatus } from "@/lib/shop/schema";
import { siteUrl } from "@/lib/shop/site-url";

export type FormState = { error?: string; ok?: string; fieldErrors?: Record<string, string> };

const fieldErrorsOf = (issues: z.core.$ZodIssue[]) => {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0])] ??= i.message;
  return out;
};

/* ---------- Sign-in, with a simple per-email/IP lockout ---------- */

const attempts = new Map<string, { n: number; until: number }>();

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${email.toLowerCase()}|${ip}`;
  const a = attempts.get(key);
  if (a && a.n >= 5 && a.until > Date.now()) {
    return { error: "Too many attempts. Try again in 15 minutes." };
  }
  if (!(await signIn(email, password))) {
    attempts.set(key, { n: (a && a.until > Date.now() ? a.n : 0) + 1, until: Date.now() + 15 * 60_000 });
    return { error: "Incorrect email or password." };
  }
  attempts.delete(key);
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await signOut();
  redirect("/admin/login");
}

/* ---------- Products ---------- */

const ALLOWED_IMAGES: Record<string, (b: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/webp": (b) => b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
};
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

async function readImages(formData: FormData) {
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > 8) throw new Error("Upload up to 8 images at a time.");
  const out: { data: Buffer; contentType: string }[] = [];
  for (const f of files) {
    if (f.size > MAX_IMAGE_BYTES) throw new Error(`${f.name} is larger than 4 MB.`);
    const bytes = new Uint8Array(await f.arrayBuffer());
    const type = Object.keys(ALLOWED_IMAGES).find((t) => ALLOWED_IMAGES[t](bytes));
    if (!type) throw new Error(`${f.name} isn't a JPEG, PNG or WebP image.`);
    out.push({ data: Buffer.from(bytes), contentType: type });
  }
  return out;
}

const naira = z
  .string()
  .trim()
  .transform((s) => s.replace(/[₦,\s]/g, ""))
  .pipe(z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 25000 or 25000.50"))
  .transform((s) => Math.round(Number(s) * 100));

const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(160),
  slug: z.string().trim().max(80).optional(),
  category: z.enum(categories.map((c) => c.slug) as [string, ...string[]], "Choose a category"),
  brand: z.string().trim().max(80),
  sku: z.string().trim().max(60),
  price: naira.refine((k) => k >= 100, "Price must be at least ₦1"),
  compareAt: z.union([z.literal("").transform(() => null), naira]),
  stock: z.coerce.number().int("Whole numbers only").min(0, "Can't be negative").max(1_000_000),
  description: z.string().trim().max(5000),
  specs: z.string().trim().max(3000),
  active: z.boolean(),
  featured: z.boolean(),
});

export async function saveProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;
  const parsed = productSchema.safeParse({
    ...Object.fromEntries(
      ["name", "slug", "category", "brand", "sku", "price", "compareAt", "stock", "description", "specs"].map((k) => [
        k,
        String(formData.get(k) ?? ""),
      ]),
    ),
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error.issues) };
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);
  if (!slug) return { fieldErrors: { slug: "Use letters or numbers" } };

  let images;
  try {
    images = await readImages(formData);
  } catch (e) {
    return { fieldErrors: { images: (e as Error).message } };
  }

  let productId: string;
  try {
    productId = await upsertProduct(id, {
      name: d.name,
      slug,
      category: d.category,
      brand: d.brand,
      sku: d.sku,
      priceKobo: d.price,
      compareAtKobo: d.compareAt,
      stock: d.stock,
      description: d.description,
      specs: d.specs,
      active: d.active,
      featured: d.featured,
    });
  } catch (e) {
    if (isDuplicateKey(e)) return { fieldErrors: { slug: "Another product already uses this URL slug" } };
    throw e;
  }
  await addImages(productId, images);
  updateTag(PRODUCTS_TAG);
  if (!id) redirect(`/admin/products/${productId}?saved=1`);
  refresh();
  return { ok: "Saved." };
}

export async function deleteProduct(formData: FormData) {
  await removeProduct(String(formData.get("id")));
  updateTag(PRODUCTS_TAG);
  redirect("/admin/products");
}

export async function uploadImages(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  try {
    const images = await readImages(formData);
    if (!images.length) return { error: "Choose at least one image." };
    await addImages(String(formData.get("productId")), images);
  } catch (e) {
    return { error: (e as Error).message };
  }
  updateTag(PRODUCTS_TAG);
  refresh();
  return { ok: "Uploaded." };
}

export async function deleteImage(formData: FormData) {
  await removeImage(String(formData.get("imageId")));
  updateTag(PRODUCTS_TAG);
  refresh();
}

export async function makePrimaryImage(formData: FormData) {
  await setPrimaryImage(String(formData.get("productId")), String(formData.get("imageId")));
  updateTag(PRODUCTS_TAG);
  refresh();
}

/* ---------- Orders ---------- */

export async function updateOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = String(formData.get("orderId"));
  const status = String(formData.get("status") ?? "") as OrderStatus | "";
  const courier = String(formData.get("courier") ?? "").trim().slice(0, 80);
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim().slice(0, 80);
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);

  const current = await getOrderForUpdate(id);
  if (!current) return { error: "Order not found." };
  const { order } = current;
  if (status && !nextStatuses[order.status].includes(status)) {
    return { error: `Can't move an order from “${orderStatusLabels[order.status]}” to “${orderStatusLabels[status]}”.` };
  }
  if ((status === "shipped" || status === "out_for_delivery") && !courier && !order.courier) {
    return { fieldErrors: { courier: "Add the courier before marking as dispatched" } };
  }

  const result = await applyOrderUpdate(id, { status, courier, trackingNumber, note, actorName: admin.name });
  if (!result) return { error: "Order not found." };
  if (result.restocked) updateTag(PRODUCTS_TAG);

  // Tell the customer about status changes (not about courier edits or internal notes alone).
  if (status) {
    const base = await siteUrl();
    const updated = result.order;
    after(() => sendEmail(statusUpdateEmail(updated, status, note, `${base}/shop/order/${updated.accessToken}`)));
  }
  refresh();
  return { ok: status ? `Saved — ${order.email} has been emailed.` : "Saved." };
}

export async function reverifyPayment(formData: FormData) {
  await requireAdmin();
  const result = await settlePayment(String(formData.get("reference")));
  if (result.ok && result.changedStock) updateTag(PRODUCTS_TAG);
  refresh();
}

export async function markRefunded(formData: FormData) {
  const admin = await requireAdmin();
  await markOrderRefunded(String(formData.get("orderId")), admin.name);
  refresh();
}

export async function resolveStockIssue(formData: FormData) {
  await clearStockIssue(String(formData.get("orderId")));
  refresh();
}

/* ---------- Team ---------- */

export async function addAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Name is required"),
      email: z.email("Enter a valid email"),
      password: z.string().min(10, "Use at least 10 characters"),
    })
    .safeParse(Object.fromEntries(["name", "email", "password"].map((k) => [k, String(formData.get(k) ?? "")])));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error.issues) };
  try {
    await createAdmin(parsed.data);
  } catch (e) {
    if (isDuplicateKey(e)) return { fieldErrors: { email: "That email already has access" } };
    throw e;
  }
  refresh();
  return { ok: `${parsed.data.name} can now sign in.` };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const next = String(formData.get("next") ?? "");
  if (next.length < 10) return { fieldErrors: { next: "Use at least 10 characters" } };
  const ok = await changePassword(admin.id, String(formData.get("current") ?? ""), next);
  return ok ? { ok: "Password updated." } : { fieldErrors: { current: "Current password is incorrect" } };
}
