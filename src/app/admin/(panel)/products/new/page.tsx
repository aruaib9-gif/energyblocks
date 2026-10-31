import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/shop/auth";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin/products" className="text-sm text-muted hover:text-foreground">
        ← Products
      </Link>
      <PageHeader title="Add product" />
      <ProductForm />
    </>
  );
}
