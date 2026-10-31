import "server-only";
import { AwsClient } from "aws4fetch";

// Product photos on Cloudflare R2 (S3-compatible object storage).
//   R2_ACCOUNT_ID         Cloudflare dashboard → R2 → Account ID
//   R2_ACCESS_KEY_ID      R2 → Manage API tokens → token with Object Read & Write on the bucket
//   R2_SECRET_ACCESS_KEY
//   R2_BUCKET             e.g. energyblocks-images
//   R2_PUBLIC_URL         the bucket's public URL — a custom domain such as https://images.energyblocks.com
//                         (or the https://pub-….r2.dev URL while testing)
// Admins upload straight from the browser to R2 with short-lived signed URLs, so files
// never pass through the app server (Vercel caps request bodies at 4.5 MB).
// Customers load images from Cloudflare's CDN. Without R2 configured, photos fall back to
// being stored in MongoDB.

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const env = () => ({
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET,
  publicUrl: process.env.R2_PUBLIC_URL?.replace(/\/$/, ""),
  // Optional: only for pointing at an S3-compatible stand-in during testing.
  endpoint: process.env.R2_ENDPOINT?.replace(/\/$/, ""),
});

export function r2Enabled() {
  const e = env();
  return !!(e.accountId && e.accessKeyId && e.secretAccessKey && e.bucket && e.publicUrl);
}

function r2() {
  const e = env();
  if (!r2Enabled()) throw new Error("Cloudflare R2 is not configured (R2_* environment variables).");
  return {
    client: new AwsClient({ accessKeyId: e.accessKeyId!, secretAccessKey: e.secretAccessKey!, service: "s3", region: "auto" }),
    objectUrl: (key: string) =>
      `${e.endpoint ?? `https://${e.accountId}.r2.cloudflarestorage.com`}/${e.bucket}/${encodeKey(key)}`,
  };
}

const encodeKey = (key: string) => key.split("/").map(encodeURIComponent).join("/");

/** Public CDN URL for a stored object. */
export function publicImageUrl(key: string) {
  return `${env().publicUrl}/${encodeKey(key)}`;
}

/** Where to load an image from: the CDN for R2 objects, the app's image route for legacy ones. */
export function imageSrc(img: { _id: string; key?: string }) {
  return img.key ? publicImageUrl(img.key) : `/api/shop/images/${img._id}`;
}

/** A URL the browser can PUT one file to for the next 10 minutes. */
export async function presignUpload(key: string) {
  const { client, objectUrl } = r2();
  const url = new URL(objectUrl(key));
  url.searchParams.set("X-Amz-Expires", "600");
  const signed = await client.sign(new Request(url, { method: "PUT" }), { aws: { signQuery: true } });
  return signed.url;
}

/**
 * Confirms an uploaded object exists, is within the size limit and really is an image
 * (checked from its first bytes, not the client-declared type). Returns its content type.
 */
export async function inspectUpload(key: string): Promise<{ ok: true; contentType: string } | { ok: false; reason: string }> {
  const { client, objectUrl } = r2();
  const res = await client.fetch(objectUrl(key), { headers: { Range: "bytes=0-15" } });
  if (res.status === 404) return { ok: false, reason: "Upload not found — please try again." };
  if (!res.ok) return { ok: false, reason: `Storage error (${res.status}).` };
  const size = Number(res.headers.get("content-range")?.split("/")[1] ?? res.headers.get("content-length") ?? 0);
  const b = new Uint8Array(await res.arrayBuffer());
  const type =
    b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
      ? "image/jpeg"
      : b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
        ? "image/png"
        : b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
          ? "image/webp"
          : null;
  if (!type) return { ok: false, reason: "That file isn't a JPEG, PNG or WebP image." };
  if (size > MAX_IMAGE_BYTES) return { ok: false, reason: "Image is larger than 8 MB." };
  return { ok: true, contentType: type };
}

export async function deleteObject(key: string) {
  if (!r2Enabled()) return;
  const { client, objectUrl } = r2();
  const res = await client.fetch(objectUrl(key), { method: "DELETE" });
  if (!res.ok && res.status !== 404) console.error(`[r2] delete ${key} failed: ${res.status}`);
}
