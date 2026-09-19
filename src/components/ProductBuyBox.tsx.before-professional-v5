"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Mattress } from "@/lib/catalog";
import { money } from "@/lib/catalog";

export default function ProductBuyBox({ mattress }: { mattress: Mattress }) {
  const [size, setSize] = useState(mattress.sizes[2]?.label || mattress.sizes[0].label);
  const [height, setHeight] = useState(mattress.heights[0].label);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const price = useMemo(() => {
    const sizeAdd = mattress.sizes.find((entry) => entry.label === size)?.priceAdd || 0;
    const heightAdd =
      mattress.heights.find((entry) => entry.label === height)?.priceAdd || 0;
    return mattress.basePrice + sizeAdd + heightAdd;
  }, [mattress, size, height]);

  return (
    <div className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-[0_15px_50px_rgba(22,29,35,0.08)] md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-gold-dark">
        {mattress.kicker}
      </p>
      <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">
        {mattress.name}
      </h1>
      <p className="mt-4 text-sm leading-7 text-ink/65">
        {mattress.longDescription}
      </p>

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-sand px-3 py-2 font-bold">★ {mattress.rating} ({mattress.reviews})</span>
        <span className="rounded-full bg-sand px-3 py-2 font-bold">{mattress.firmness}</span>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink">Choose size</h2>
          <span className="text-xs text-ink/45">Indian standard sizes</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {mattress.sizes.map((entry) => (
            <button
              key={entry.label}
              onClick={() => setSize(entry.label)}
              className={`rounded-xl border px-3 py-3 text-sm font-bold ${
                size === entry.label
                  ? "border-ink bg-ink text-white"
                  : "border-ink/15 bg-white text-ink"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-bold text-ink">Choose height</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {mattress.heights.map((entry) => (
            <button
              key={entry.label}
              onClick={() => setHeight(entry.label)}
              className={`rounded-xl border px-4 py-3 text-sm font-bold ${
                height === entry.label
                  ? "border-ink bg-ink text-white"
                  : "border-ink/15 bg-white text-ink"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <p className="text-xs uppercase tracking-[0.15em] text-ink/45">
          Your configuration
        </p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <div>
            <p className="font-bold">{size} · {height}</p>
            <p className="mt-1 text-3xl font-black text-ink">{money(price)}</p>
          </div>
          <p className="text-right text-xs leading-5 text-ink/45">
            Tax included<br />Free standard shipping
          </p>
        </div>
      </div>

      <button
        onClick={() => {
          addItem({
            id: `${mattress.slug}-${size}-${height}`,
            slug: mattress.slug,
            name: mattress.name,
            image: mattress.image,
            size,
            height,
            price,
            quantity: 1
          });
          setAdded(true);
          setTimeout(() => setAdded(false), 1400);
        }}
        className="mt-6 w-full rounded-full bg-gold px-6 py-4 text-base font-black text-white transition hover:translate-y-[-1px] hover:shadow-lg"
      >
        {added ? "ADDED TO CART ✓" : "ADD TO CART"}
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs font-bold text-ink/70">
        <div className="rounded-xl bg-sand px-3 py-3">{mattress.trial}</div>
        <div className="rounded-xl bg-sand px-3 py-3">{mattress.warranty}</div>
      </div>
    </div>
  );
}
