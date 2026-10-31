import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/icons";
import { AddToCart } from "@/components/shop/add-to-cart";
import { Gallery } from "@/components/shop/gallery";
import { ProductCard } from "@/components/shop/product-card";
import { getProductBySlug, getRelatedProducts } from "@/lib/shop/catalog";
import { categoryOf, deliveryFeeFor, formatNaira, freeDeliveryOverKobo, parseSpecs } from "@/lib/shop/meta";

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description.slice(0, 160) };
}

export default function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  return (
    <Suspense fallback={<div className="container-x mt-10 aspect-[2/1] animate-pulse rounded-2xl bg-card px-6" />}>
      <Product params={params} />
    </Suspense>
  );
}

async function Product({ params }: { params: PageProps<"/shop/[slug]">["params"] }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const p = product;
  const c = categoryOf(p.category);
  const specs = parseSpecs(p.specs);
  const related = await getRelatedProducts(p.category, p.id);
  const lowStock = p.stock > 0 && p.stock <= 5;

  return (
    <div className="container-x px-6 pt-8 lg:px-0">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/shop" className="hover:text-foreground">
          Marketplace
        </Link>{" "}
        /{" "}
        <Link href={`/shop?category=${c.slug}`} className="hover:text-foreground">
          {c.label}
        </Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <Gallery images={p.images} category={p.category} name={p.name} />

        <div>
          <p className="eyebrow">
            {c.label}
            {p.brand && ` · ${p.brand}`}
          </p>
          <h1 className="display mt-3 text-[32px] leading-[1.1] sm:text-[40px]">{p.name}</h1>
          <div className="mt-5 flex items-baseline gap-3">
            <p className="text-[30px] font-semibold tracking-tight">{formatNaira(p.priceKobo)}</p>
            {p.compareAtKobo && p.compareAtKobo > p.priceKobo && (
              <p className="text-lg text-muted line-through">{formatNaira(p.compareAtKobo)}</p>
            )}
          </div>
          <p className={`mt-2 text-sm font-medium ${p.stock === 0 ? "text-accent" : lowStock ? "text-[#b45309]" : "text-brand"}`}>
            {p.stock === 0 ? "Out of stock" : lowStock ? `Only ${p.stock} left` : "In stock — ready to dispatch"}
          </p>

          <p className="mt-6 text-[16px] leading-[1.7] whitespace-pre-line text-foreground/80">{p.description}</p>

          <div className="mt-8">
            <AddToCart
              line={{ productId: p.id, slug: p.slug, name: p.name, priceKobo: p.priceKobo, image: p.images[0] ?? null, category: p.category, stock: p.stock }}
            />
          </div>

          <ul className="card mt-8 divide-y divide-line text-sm">
            <li className="flex gap-3 p-4">
              <Icon name="truck" className="mt-0.5 size-4.5 shrink-0 text-brand" />
              <span>
                Delivery across Nigeria from {formatNaira(deliveryFeeFor("Lagos", 0))} — free on orders over{" "}
                {formatNaira(freeDeliveryOverKobo)}. Track every step online.
              </span>
            </li>
            <li className="flex gap-3 p-4">
              <Icon name="lock" className="mt-0.5 size-4.5 shrink-0 text-brand" />
              <span>Pay by card, bank transfer or USSD through Paystack. We never see your card details.</span>
            </li>
            <li className="flex gap-3 p-4">
              <Icon name="wrench" className="mt-0.5 size-4.5 shrink-0 text-brand" />
              <span>
                Need it installed or certified?{" "}
                <Link href="/#contact" className="font-medium text-brand hover:underline">
                  Our engineers can handle it
                </Link>
                .
              </span>
            </li>
          </ul>

          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-[15px] font-semibold">Specifications</h2>
              <dl className="card mt-3 divide-y divide-line text-sm">
                {specs.map((s) => (
                  <div key={s.label} className="grid grid-cols-[40%_1fr] gap-4 px-4 py-2.5">
                    <dt className="text-muted">{s.label}</dt>
                    <dd className="font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-semibold">More in {c.label}</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
