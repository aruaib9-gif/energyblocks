"use client";

import Image from "next/image";
import { useActionState } from "react";
import { deleteImage, makePrimaryImage, uploadImages, type FormState } from "@/app/admin/actions";
import { imageUrl } from "@/lib/shop/meta";
import { Icon } from "../icons";
import { Panel, adminField } from "./ui";

export function ImageManager({ productId, images }: { productId: string; images: { id: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(uploadImages, {});
  return (
    <Panel title={`Images (${images.length})`}>
      <div className="p-5">
        {images.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img, i) => (
              <li key={img.id} className="group relative overflow-hidden rounded-xl border border-line bg-white">
                <div className="relative aspect-square">
                  <Image src={imageUrl(img.id)} alt="" fill sizes="200px" className="object-contain p-2" />
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
        <form action={action} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="productId" value={productId} />
          <label className="min-w-60 flex-1 text-sm font-medium">
            Add photos
            <input
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              required
              className={`${adminField} file:mr-3 file:rounded-full file:border-0 file:bg-brand-soft file:px-3 file:py-1 file:text-sm file:font-medium file:text-brand`}
            />
          </label>
          <button disabled={pending} className="btn-outline py-2.5 disabled:opacity-60">
            {pending ? "Uploading…" : "Upload"}
          </button>
        </form>
        {state.error && <p className="mt-2 text-sm text-accent">{state.error}</p>}
        {state.ok && <p className="mt-2 text-sm text-[#166534]">{state.ok}</p>}
      </div>
    </Panel>
  );
}
