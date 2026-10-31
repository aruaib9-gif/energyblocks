import { getImage } from "@/lib/shop/catalog";

// Serves product photos stored in MongoDB (the pre-R2 storage), and redirects to the CDN
// for photos on Cloudflare R2. Each upload gets a new id, so responses can be cached forever.
export async function GET(_req: Request, ctx: RouteContext<"/api/shop/images/[id]">) {
  const { id } = await ctx.params;
  const img = await getImage(id);
  if (!img) return new Response("Not found", { status: 404 });
  if ("redirect" in img) return Response.redirect(img.redirect!, 308);
  return new Response(new Uint8Array(img.data!), {
    headers: {
      "Content-Type": img.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
