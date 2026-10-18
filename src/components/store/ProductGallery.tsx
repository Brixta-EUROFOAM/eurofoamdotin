"use client";

import { useState } from "react";
import MattressStack from "@/components/store/MattressStack";
import Stamp from "@/components/store/Stamp";
import type { MattressLayer } from "@/lib/catalog";

/* "What's inside" layer view first, then every product photo (main image first). */
export default function ProductGallery({
  name,
  image,
  gallery = [],
  layers,
}: {
  name: string;
  image: string;
  gallery?: string[];
  layers: MattressLayer[];
}) {
  const photos = Array.from(new Set([image, ...gallery].filter(Boolean)));
  const [view, setView] = useState<number>(-1); // -1 = inside

  return (
    <div className="g-gallery">
      <Stamp className="g-stamp--gallery" ring="Made in India • Sold direct" center="गद्दा" tone="indigo" size={108} rotate={-8} />
      <div className={`g-gallery-main ${view < 0 ? "g-gallery-main--stack" : ""}`}>
        {view < 0 ? (
          <MattressStack className="g-mstack--labelled" layers={layers} spread="exploded" labels />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photos[view]} alt={`${name}, photo ${view + 1}`} />
        )}
      </div>
      {photos.length ? (
        <div className="g-gallery-thumbs" role="tablist" aria-label="Product views">
          <button type="button" role="tab" aria-selected={view < 0} aria-current={view < 0} onClick={() => setView(-1)} title="What's inside">
            <div style={{ padding: "16px 6px" }}>
              <MattressStack layers={layers} />
            </div>
          </button>
          {photos.map((src, i) => (
            <button key={src} type="button" role="tab" aria-selected={view === i} aria-current={view === i} onClick={() => setView(i)} title={`Photo ${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
