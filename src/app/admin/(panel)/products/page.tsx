import Link from "next/link";
import { PageHeader, Panel } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { ProductVisual } from "@/components/shop/product-visual";
import { LOW_STOCK, adminListProducts } from "@/lib/shop/admin";
import { categoryOf, formatNaira } from "@/lib/shop/meta";

export const metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const rows = await adminListProducts(query || undefined);

  return (
    <>
      <PageHeader
        title="Products"
        sub={`${rows.length} product${rows.length === 1 ? "" : "s"} · ${rows.filter((r) => r.active).length} live on the storefront`}
        actions={
          <Link href="/admin/products/new" className="btn-primary">
            <Icon name="plus" /> Add product
          </Link>
        }
      />
      <Panel>
        <form className="flex items-center gap-2 border-b border-line px-5 py-3">
          <Icon name="search" className="text-muted" />
          <label htmlFor="pq" className="sr-only">
            Search products
          </label>
          <input id="pq" name="q" defaultValue={query} placeholder="Search by name or SKU…" className="flex-1 bg-transparent py-1 text-sm outline-none" />
        </form>
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-2.5 font-medium">Product</th>
                  <th className="px-3 py-2.5 font-medium">Category</th>
                  <th className="px-3 py-2.5 text-right font-medium">Price</th>
                  <th className="px-3 py-2.5 text-right font-medium">Stock</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-background/40">
                    <td className="px-5 py-2.5">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        <ProductVisual imageId={p.imageId} category={p.category} alt="" sizes="48px" className="size-11 shrink-0 rounded-lg border border-line [&_span]:size-8 [&_svg]:size-4" />
                        <span>
                          <span className="block font-semibold hover:text-brand">{p.name}</span>
                          {p.sku && <span className="text-xs text-muted">SKU {p.sku}</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted">{categoryOf(p.category).label}</td>
                    <td className="px-3 py-2.5 text-right font-medium whitespace-nowrap">{formatNaira(p.priceKobo)}</td>
                    <td className={`px-3 py-2.5 text-right font-semibold tabular-nums ${p.stock === 0 ? "text-accent" : p.stock <= LOW_STOCK ? "text-[#b45309]" : ""}`}>
                      {p.stock}
                    </td>
                    <td className="px-5 py-2.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.active ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f1f5f9] text-[#475569]"}`}>
                        {p.active ? "Live" : "Hidden"}
                      </span>
                      {p.featured && <span className="ml-1.5 rounded-full bg-highlight/30 px-2 py-0.5 text-xs font-semibold text-ink">Featured</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
