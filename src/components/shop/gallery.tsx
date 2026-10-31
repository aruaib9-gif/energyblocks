"use client";

import { useState } from "react";
import { ProductVisual } from "./product-visual";

export function Gallery({ images, category, name }: { images: string[]; category: string; name: string }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <ProductVisual
        src={images[active]}
        category={category}
        alt={name}
        preload
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="card aspect-square"
      />
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={i === active}
              className={`overflow-hidden rounded-xl border-2 ${i === active ? "border-brand" : "border-transparent"}`}
            >
              <ProductVisual src={url} category={category} alt="" sizes="100px" className="aspect-square" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
