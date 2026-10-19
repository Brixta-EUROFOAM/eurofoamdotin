"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import MattressStack from "@/components/store/MattressStack";
import Stamp from "@/components/store/Stamp";
import { AUTO_SLIDES, AutoSlideView, type AutoSlide } from "@/components/store/GallerySlides";
import type { Mattress } from "@/lib/catalog";

type Slide = { kind: "photo"; src: string } | { kind: AutoSlide };

/*
  Product gallery: your photos + slides drawn from the product's data
  (layers, trial, sizes, delivery). Arrows, swipe, "2 / 8" counter and a
  full-screen view, like the big mattress sites.
*/
export default function ProductGallery({
  mattress,
  trialNights,
  customSizes,
}: {
  mattress: Mattress;
  trialNights: number;
  customSizes?: boolean;
}) {
  const photos = Array.from(new Set([mattress.image, ...(mattress.gallery || [])].filter(Boolean)));
  const on = (k: AutoSlide) => (mattress.slides ? mattress.slides.includes(k) : true) && ((k !== "inside" && k !== "cutaway") || mattress.layers.length > 0);
  const auto = AUTO_SLIDES.map((a) => a.id).filter(on);

  // main photo (or the 3D cutaway if there's no photo), layer breakdown, trial, more photos, sizes, delivery
  const slides: Slide[] = [];
  if (photos[0]) slides.push({ kind: "photo", src: photos[0] });
  if (auto.includes("cutaway") && mattress.layers.length) slides.push({ kind: "cutaway" });
  if (auto.includes("inside")) slides.push({ kind: "inside" });
  if (auto.includes("trial")) slides.push({ kind: "trial" });
  for (const src of photos.slice(1)) slides.push({ kind: "photo", src });
  if (auto.includes("sizes")) slides.push({ kind: "sizes" });
  if (auto.includes("delivery")) slides.push({ kind: "delivery" });
  if (!slides.length) slides.push({ kind: "inside" });

  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const n = slides.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);
  const touch = useRef<number | null>(null);
  const badge = mattress.photoBadge !== false;

  useEffect(() => {
    if (!full) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", k);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.documentElement.style.overflow = "";
    };
  }, [full, go]);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touch.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touch.current === null) return;
      const dx = e.changedTouches[0].clientX - touch.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touch.current = null;
    },
  };

  const render = (s: Slide, big = false) =>
    s.kind === "photo" ? (
      <div className="g-slide g-slide--photo">
        <span className="g-slide-fill" style={{ backgroundImage: `url("${s.src}")` }} aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.src} alt={`${mattress.name}`} loading={big ? "eager" : "lazy"} />
        {badge ? (
          <Stamp className="g-slide-badge" ring="Sleep on it at home" center={String(trialNights)} sub="nights" tone="indigo" size={110} rotate={-8} />
        ) : null}
      </div>
    ) : (
      <AutoSlideView kind={s.kind} mattress={mattress} trialNights={trialNights} customSizes={customSizes} />
    );

  const label = (s: Slide) => (s.kind === "photo" ? "Photo" : AUTO_SLIDES.find((a) => a.id === s.kind)?.label || s.kind);

  return (
    <div className="g-gallery">
      <div className="g-gallery-main g-gallery-main--slides" {...swipe}>
        <div className="g-gallery-track" style={{ transform: `translateX(-${i * 100}%)` }}>
          {slides.map((s, k) => (
            <div className="g-gallery-cell" key={k} aria-hidden={k !== i} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}: ${label(s)}`}>
              {render(s, k === 0)}
            </div>
          ))}
        </div>
        {n > 1 ? (
          <>
            <button type="button" className="g-gal-arrow g-gal-arrow--prev" onClick={() => go(-1)} aria-label="Previous image">
              ‹
            </button>
            <button type="button" className="g-gal-arrow g-gal-arrow--next" onClick={() => go(1)} aria-label="Next image">
              ›
            </button>
          </>
        ) : null}
        <span className="g-gal-count" aria-live="polite">
          {i + 1} / {n}
        </span>
        <button type="button" className="g-gal-full" onClick={() => setFull(true)} aria-label="View full screen">
          ⤢
        </button>
      </div>

      {n > 1 ? (
        <div className="g-gallery-thumbs" role="tablist" aria-label="Product images">
          {slides.map((s, k) => (
            <button key={k} type="button" role="tab" aria-selected={k === i} aria-current={k === i} onClick={() => setI(k)} title={label(s)}>
              {s.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.src} alt="" loading="lazy" />
              ) : s.kind === "inside" ? (
                <div style={{ padding: "14px 8px" }}>
                  <MattressStack layers={mattress.layers} />
                </div>
              ) : (
                <div className="g-thumb-slide">{render(s)}</div>
              )}
            </button>
          ))}
        </div>
      ) : null}

      {full && typeof document !== "undefined" ? createPortal(
        <div className="g-lightbox" role="dialog" aria-modal="true" aria-label={`${mattress.name} images`} {...swipe}>
          <button type="button" className="g-lightbox-x" onClick={() => setFull(false)} aria-label="Close">
            ×
          </button>
          <div className="g-lightbox-stage" onClick={(e) => e.target === e.currentTarget && setFull(false)}>
            <div className="g-lightbox-frame">{render(slides[i], true)}</div>
          </div>
          {n > 1 ? (
            <>
              <button type="button" className="g-gal-arrow g-gal-arrow--prev" onClick={() => go(-1)} aria-label="Previous image">
                ‹
              </button>
              <button type="button" className="g-gal-arrow g-gal-arrow--next" onClick={() => go(1)} aria-label="Next image">
                ›
              </button>
            </>
          ) : null}
          <span className="g-gal-count g-gal-count--lb">
            {i + 1} / {n}
          </span>
        </div>,
        document.body
      ) : null}
    </div>
  );
}
