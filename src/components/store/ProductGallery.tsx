"use client";

import { useState } from "react";
import MattressStack from "@/components/store/MattressStack";
import Stamp from "@/components/store/Stamp";
import type { MattressLayer } from "@/lib/catalog";

export default function ProductGallery({
  name,
  image,
  layers,
}: {
  name: string;
  image: string;
  layers: MattressLayer[];
}) {
  const [view, setView] = useState<"inside" | "photo">("inside");
  const hasPhoto = Boolean(image);

  return (
    <div className="g-gallery">
      <Stamp className="g-stamp--gallery" ring="Made in India • Sold direct" center="गद्दा" tone="indigo" size={108} rotate={-8} />
      <div className={`g-gallery-main ${view === "inside" ? "g-gallery-main--stack" : ""}`}>
        {view === "inside" ? (
          <MattressStack className="g-mstack--labelled" layers={layers} spread="exploded" labels />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={`${name} on a bed`} />
        )}
      </div>
      {hasPhoto ? (
        <div className="g-gallery-thumbs" role="tablist" aria-label="Product views">
          <button type="button" role="tab" aria-selected={view === "inside"} aria-current={view === "inside"} onClick={() => setView("inside")} title="What's inside">
            <div style={{ padding: "16px 6px" }}>
              <MattressStack layers={layers} />
            </div>
          </button>
          <button type="button" role="tab" aria-selected={view === "photo"} aria-current={view === "photo"} onClick={() => setView("photo")} title="Photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
