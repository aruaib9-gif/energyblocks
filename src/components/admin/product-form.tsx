"use client";

import { useActionState, useState } from "react";
import { saveProduct, type FormState } from "@/app/admin/actions";
import type { Product } from "@/lib/shop/schema";
import { categories, slugify } from "@/lib/shop/meta";
import { Icon } from "../icons";
import { Panel, adminField } from "./ui";

const kobo = (k: number | null | undefined) => (k == null ? "" : String(k / 100));

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!product);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="grid items-start gap-6 xl:grid-cols-[1fr_320px]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="space-y-6">
        <Panel title="Details">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <F label="Product name" error={fe.name} className="sm:col-span-2">
              <input
                name="name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                className={adminField}
                aria-invalid={!!fe.name}
              />
            </F>
            <F label="URL slug" error={fe.slug} hint={`/shop/${slug || "…"}`} className="sm:col-span-2">
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                className={adminField}
                aria-invalid={!!fe.slug}
              />
            </F>
            <F label="Category" error={fe.category}>
              <select name="category" defaultValue={product?.category ?? ""} className={adminField} aria-invalid={!!fe.category}>
                <option value="">Choose…</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </F>
            <F label="Brand" error={fe.brand}>
              <input name="brand" defaultValue={product?.brand} className={adminField} />
            </F>
            <F label="Description" error={fe.description} className="sm:col-span-2">
              <textarea name="description" rows={5} defaultValue={product?.description} className={adminField} />
            </F>
            <F label="Specifications" error={fe.specs} hint='One per line, e.g. "Capacity: 9 kg"' className="sm:col-span-2">
              <textarea name="specs" rows={5} defaultValue={product?.specs} className={`${adminField} font-mono text-sm`} />
            </F>
          </div>
        </Panel>

        {!product && (
          <Panel title="Images">
            <div className="p-5">
              <F label="Upload photos" error={fe.images} hint="JPEG, PNG or WebP, up to 4 MB each. The first becomes the main image.">
                <input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple className={`${adminField} file:mr-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-3 file:py-1 file:text-sm file:font-medium file:text-brand`} />
              </F>
            </div>
          </Panel>
        )}
      </div>

      <div className="space-y-6 xl:sticky xl:top-8">
        <Panel title="Pricing & stock">
          <div className="space-y-4 p-5">
            <F label="Price (₦)" error={fe.price}>
              <input name="price" inputMode="decimal" required defaultValue={kobo(product?.priceKobo)} placeholder="25000" className={adminField} aria-invalid={!!fe.price} />
            </F>
            <F label="Compare-at price (₦)" error={fe.compareAt} hint="Optional — shows as a crossed-out “was” price.">
              <input name="compareAt" inputMode="decimal" defaultValue={kobo(product?.compareAtKobo)} className={adminField} aria-invalid={!!fe.compareAt} />
            </F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Stock" error={fe.stock}>
                <input name="stock" type="number" min={0} required defaultValue={product?.stock ?? 0} className={adminField} aria-invalid={!!fe.stock} />
              </F>
              <F label="SKU" error={fe.sku}>
                <input name="sku" defaultValue={product?.sku} className={adminField} />
              </F>
            </div>
          </div>
        </Panel>
        <Panel title="Visibility">
          <div className="space-y-3 p-5 text-sm">
            <label className="flex items-center gap-2.5">
              <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="size-4 accent-brand" />
              Live on the storefront
            </label>
            <label className="flex items-center gap-2.5">
              <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="size-4 accent-brand" />
              Featured (shown first)
            </label>
          </div>
        </Panel>
        {state.error && (
          <p role="alert" className="rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p role="status" className="rounded-xl bg-[#dcfce7] px-3 py-2 text-sm text-[#166534]">
            {state.ok}
          </p>
        )}
        <button disabled={pending} className="btn-primary w-full py-3 disabled:opacity-60">
          {pending ? "Saving…" : <>{product ? "Save changes" : "Create product"} <Icon name="check" /></>}
        </button>
      </div>
    </form>
  );
}

function F({ label, error, hint, className = "", children }: { label: string; error?: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block text-sm font-medium ${className}`}>
      {label}
      {children}
      {error ? <span className="mt-1 block text-xs text-accent">{error}</span> : hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}
