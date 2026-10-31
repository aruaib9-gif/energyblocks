import Link from "next/link";
import type { CatalogProduct } from "@/lib/shop/catalog";
import { categoryOf, formatNaira } from "@/lib/shop/meta";
import { AddToCart } from "./add-to-cart";
import { ProductVisual } from "./product-visual";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const p = product;
  const imageId = p.imageIds[0] ?? null;
  return (
    <article className="card lift group flex flex-col overflow-hidden">
      <Link href={`/shop/${p.slug}`} className="relative block">
        <ProductVisual
          imageId={imageId}
          category={p.category}
          alt={p.name}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="aspect-square transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {p.compareAtKobo && p.compareAtKobo > p.priceKobo && (
          <span className="absolute top-3 left-3 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">
            Save {Math.round((1 - p.priceKobo / p.compareAtKobo) * 100)}%
          </span>
        )}
        {p.stock === 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">
            Out of stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col border-t border-line p-4">
        <p className="eyebrow text-[10px]">{categoryOf(p.category).label}</p>
        <h3 className="mt-1.5 line-clamp-2 text-[15px] leading-snug font-semibold">
          <Link href={`/shop/${p.slug}`} className="hover:text-brand">
            {p.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p>
            <span className="block text-[17px] font-semibold tracking-tight">{formatNaira(p.priceKobo)}</span>
            {p.compareAtKobo && p.compareAtKobo > p.priceKobo && (
              <span className="text-xs text-muted line-through">{formatNaira(p.compareAtKobo)}</span>
            )}
          </p>
          <AddToCart
            compact
            line={{ productId: p.id, slug: p.slug, name: p.name, priceKobo: p.priceKobo, imageId, category: p.category, stock: p.stock }}
          />
        </div>
      </div>
    </article>
  );
}
