"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import {
  deleteImage,
  finishImageUploads,
  makePrimaryImage,
  requestImageUploads,
  uploadImages,
  type FormState,
} from "@/app/admin/actions";
import { Icon } from "../icons";
import { Panel, adminField } from "./ui";

const fileInput = `${adminField} file:mr-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-3 file:py-1 file:text-sm file:font-medium file:text-brand`;

/**
 * Product photos. With Cloudflare R2 configured (`direct`), files go straight from the browser
 * to R2 via signed URLs; otherwise they're posted to the server and stored in MongoDB.
 */
export function ImageManager({
  productId,
  images,
  direct,
}: {
  productId: string;
  images: { id: string; url: string }[];
  direct: boolean;
}) {
  return (
    <Panel
      title={`Images (${images.length})`}
      actions={
        <span className={`text-xs font-medium ${direct ? "text-[#166534]" : "text-muted"}`}>
          {direct ? "Stored on Cloudflare R2" : "Stored in database (R2 not configured)"}
        </span>
      }
    >
      <div className="p-5">
        {images.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img, i) => (
              <li key={img.id} className="group relative overflow-hidden rounded-xl border border-line bg-white">
                <div className="relative aspect-square">
                  <Image src={img.url} alt="" fill sizes="200px" className="object-contain p-2" />
                </div>
                {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">Main</span>}
                <div className="flex border-t border-line text-xs">
                  {i > 0 && (
                    <form action={makePrimaryImage} className="flex-1">
                      <input type="hidden" name="imageId" value={img.id} />
                      <input type="hidden" name="productId" value={productId} />
                      <button className="w-full py-2 hover:bg-brand-soft">Make main</button>
                    </form>
                  )}
                  <form
                    action={deleteImage}
                    className="flex-1 border-l border-line first:border-l-0"
                    onSubmit={(e) => !confirm("Delete this image?") && e.preventDefault()}
                  >
                    <input type="hidden" name="imageId" value={img.id} />
                    <button className="flex w-full items-center justify-center gap-1 py-2 text-accent hover:bg-accent/8">
                      <Icon name="trash" className="size-3.5" /> Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
            <Icon name="image" className="mx-auto mb-2 size-6" />
            No photos yet — the storefront shows a category tile until you add one.
          </p>
        )}
        {direct ? <DirectUpload productId={productId} /> : <ServerUpload productId={productId} />}
      </div>
    </Panel>
  );
}

function DirectUpload({ productId }: { productId: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [msg, setMsg] = useState<FormState>({});

  async function upload() {
    const files = Array.from(input.current?.files ?? []);
    if (!files.length) return setMsg({ error: "Choose at least one image." });
    setBusy(true);
    setMsg({});
    try {
      const { tickets, error } = await requestImageUploads(
        productId,
        files.map((f) => ({ type: f.type, size: f.size })),
      );
      if (error || !tickets) return setMsg({ error: error ?? "Couldn't start the upload." });

      setProgress({ done: 0, total: files.length });
      const uploaded: string[] = [];
      await Promise.all(
        tickets.map(async (t, i) => {
          const res = await fetch(t.url, { method: "PUT", body: files[i], headers: { "Content-Type": files[i].type } });
          if (res.ok) uploaded.push(t.key);
          setProgress((p) => p && { ...p, done: p.done + 1 });
        }),
      );
      if (uploaded.length === 0) {
        return setMsg({ error: "Upload to Cloudflare failed. Check the bucket's CORS settings allow this site." });
      }
      setMsg(await finishImageUploads(productId, uploaded));
      if (input.current) input.current.value = "";
    } catch {
      setMsg({ error: "Upload failed — check your connection and the bucket's CORS settings." });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-60 flex-1 text-sm font-medium">
          Add photos <span className="font-normal text-muted">(JPEG, PNG or WebP, up to 8 MB each)</span>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} className={fileInput} />
        </label>
        <button type="button" onClick={upload} disabled={busy} className="btn-outline py-2.5 disabled:opacity-60">
          {busy ? "Uploading…" : "Upload"}
        </button>
      </div>
      {progress && (
        <div className="mt-3" role="status" aria-live="polite">
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-brand transition-[width] duration-300" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted">
            {progress.done} of {progress.total} sent to Cloudflare
          </p>
        </div>
      )}
      {msg.error && <p className="mt-2 text-sm text-accent">{msg.error}</p>}
      {msg.ok && <p className="mt-2 text-sm text-[#166534]">{msg.ok}</p>}
    </div>
  );
}

function ServerUpload({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(uploadImages, {});
  return (
    <>
      <form action={action} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="productId" value={productId} />
        <label className="min-w-60 flex-1 text-sm font-medium">
          Add photos <span className="font-normal text-muted">(up to 4 MB each)</span>
          <input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required className={fileInput} />
        </label>
        <button disabled={pending} className="btn-outline py-2.5 disabled:opacity-60">
          {pending ? "Uploading…" : "Upload"}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-accent">{state.error}</p>}
      {state.ok && <p className="mt-2 text-sm text-[#166534]">{state.ok}</p>}
    </>
  );
}
