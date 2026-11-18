"use client";
import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="card bedgrid aspect-square" />;
  return (
    <div>
      <div className="card relative aspect-square overflow-hidden">
        <Image src={images[i]} alt={`${name} — fotografia ${i + 1}`} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {images.map((src, k) => (
            <button
              key={src}
              onClick={() => setI(k)}
              aria-label={`Ver fotografia ${k + 1}`}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${k === i ? "border-orange" : "border-line"}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
