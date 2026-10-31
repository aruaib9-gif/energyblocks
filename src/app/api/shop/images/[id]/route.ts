import { eq } from "drizzle-orm";
import { db } from "@/lib/shop/db";
import { productImages } from "@/lib/shop/schema";

// Serves product photos stored in the database. Each upload gets a new id, so responses
// can be cached forever.
export async function GET(_req: Request, ctx: RouteContext<"/api/shop/images/[id]">) {
  const { id } = await ctx.params;
  const [img] = await db
    .select({ data: productImages.data, contentType: productImages.contentType })
    .from(productImages)
    .where(eq(productImages.id, id))
    .limit(1);
  if (!img) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
