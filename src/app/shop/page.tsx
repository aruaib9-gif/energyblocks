import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/icons";
import { ProductCard } from "@/components/shop/product-card";
import { listProducts } from "@/lib/shop/catalog";
import { categories, formatNaira, freeDeliveryOverKobo } from "@/lib/shop/meta";

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line px-6 pt-14 pb-12">
        <div aria-hidden="true" className="blueprint-grid pointer-events-none absolute inset-0" />
        <div className="container-x relative">
          <p className="eyebrow">Energy Blocks Marketplace</p>
          <h1 className="display mt-3 max-w-3xl text-[40px] leading-[1.02] sm:text-[56px]">
            Safety &amp; site equipment, <span className="serif-accent">delivered.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-[1.6] text-foreground/80">
            Fire protection, CCTV and access control, PPE and site tools — the same kit we install on our own
            projects. Pay securely online and track your delivery to anywhere in Nigeria.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2 text-[13px] font-semibold text-brand">
            {[
              ["lock", "Secure payment via Paystack"],
              ["truck", `Free delivery over ${formatNaira(freeDeliveryOverKobo)}`],
              ["shield", "Genuine, certified products"],
            ].map(([icon, t]) => (
              <li key={t} className="flex items-center gap-1.5 rounded-full border border-brand/25 bg-card px-3 py-1.5">
                <Icon name={icon as "lock"} className="size-3.5" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Suspense fallback={<CatalogueSkeleton />}>
        <Catalogue searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Catalogue({ searchParams }: { searchParams: PageProps<"/shop">["searchParams"] }) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" && categories.some((c) => c.slug === sp.category) ? sp.category : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";
  const items = await listProducts({ category, q: q || undefined });
  const active = categories.find((c) => c.slug === category);

  return (
    <div className="container-x px-6 pt-8 lg:px-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Categories" className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
          <CategoryChip href={q ? `/shop?q=${encodeURIComponent(q)}` : "/shop"} active={!category} label="All" icon="grid" />
          {categories.map((c) => (
            <CategoryChip
              key={c.slug}
              href={`/shop?category=${c.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              active={category === c.slug}
              label={c.label}
              icon={c.icon}
            />
          ))}
        </nav>
        <form action="/shop" className="flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 focus-within:border-brand/50 lg:w-80">
          {category && <input type="hidden" name="category" value={category} />}
          <Icon name="search" className="size-4 shrink-0 text-muted" />
          <label htmlFor="shop-q" className="sr-only">
            Search products
          </label>
          <input id="shop-q" name="q" defaultValue={q} placeholder="Search extinguishers, cameras…" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
        </form>
      </div>

      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">
          {active ? active.label : "All products"}
          {q && <span className="font-normal text-muted"> matching &ldquo;{q}&rdquo;</span>}
        </h2>
        <p className="text-sm text-muted">{items.length} item{items.length === 1 ? "" : "s"}</p>
      </div>
      {active && <p className="mt-1 text-sm text-muted">{active.blurb}</p>}

      {items.length === 0 ? (
        <div className="card mt-6 px-6 py-16 text-center">
          <p className="text-lg font-semibold">Nothing found.</p>
          <p className="mt-2 text-muted">
            Try another search, or{" "}
            <Link href="/#contact" className="text-brand underline">
              ask us to source it
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({ href, active, label, icon }: { href: string; active: boolean; label: string; icon: Parameters<typeof Icon>[0]["name"] }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
        active ? "border-brand bg-brand text-white" : "border-line bg-card hover:border-brand/40"
      }`}
    >
      <Icon name={icon} className="size-4" /> {label}
    </Link>
  );
}

function CatalogueSkeleton() {
  return (
    <div className="container-x px-6 pt-8 lg:px-0" aria-busy="true">
      <div className="h-10 w-2/3 animate-pulse rounded-full bg-card" />
      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="card aspect-3/4 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
