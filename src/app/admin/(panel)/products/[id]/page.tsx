import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ImageManager } from "@/components/admin/image-manager";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { adminGetProduct } from "@/lib/shop/admin";
import { r2Enabled } from "@/lib/shop/storage";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const data = await adminGetProduct(id);
  if (!data) notFound();
  const { product, images } = data;

  return (
    <>
      <Link href="/admin/products" className="text-sm text-muted hover:text-foreground">
        ← Products
      </Link>
      <PageHeader
        title={product.name}
        sub={sp.saved ? "Product created. Add more photos below." : undefined}
        actions={
          <>
            {product.active && (
              <Link href={`/shop/${product.slug}`} target="_blank" className="btn-outline">
                View in shop <Icon name="arrowRight" />
              </Link>
            )}
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={product.id} />
              <ConfirmButton
                message="Delete this product? Products with past orders are hidden instead, to keep order history."
                className="btn border border-accent/30 bg-white text-accent hover:bg-accent/8"
              >
                <Icon name="trash" /> Delete
              </ConfirmButton>
            </form>
          </>
        }
      />
      <div className="space-y-6">
        <ImageManager productId={product.id} images={images} direct={r2Enabled()} />
        <ProductForm product={product} />
      </div>
    </>
  );
}
