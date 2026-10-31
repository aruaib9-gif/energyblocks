import Image from "next/image";
import { categoryOf } from "@/lib/shop/meta";
import { Icon } from "../icons";

/** A product's uploaded photo, or a branded category tile until one is uploaded. */
export function ProductVisual({
  src,
  category,
  alt,
  sizes,
  preload = false,
  className = "",
}: {
  /** Image URL (Cloudflare CDN or the app's image route), or nothing for a placeholder tile. */
  src: string | null | undefined;
  category: string;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className="object-contain p-3" />
      </div>
    );
  }
  const c = categoryOf(category);
  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-linear-to-br from-brand-soft to-card ${className}`}
      role="img"
      aria-label={alt}
    >
      <div aria-hidden="true" className="blueprint-grid absolute inset-0 opacity-60" />
      <span className="relative grid size-16 place-items-center rounded-2xl bg-card text-brand shadow-sm ring-1 ring-line">
        <Icon name={c.icon} className="size-8" />
      </span>
    </div>
  );
}
