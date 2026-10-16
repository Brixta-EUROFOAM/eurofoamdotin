"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Mattress } from "@/lib/catalog";

type Sort = "recommended" | "price-asc" | "price-desc";

const FEELS = [
  { id: "all", label: "All feels", test: () => true },
  { id: "firm", label: "Firm", test: (f: string) => /firm/i.test(f) && !/plush|soft/i.test(f) },
  { id: "balanced", label: "Balanced", test: (f: string) => /balanc|medium/i.test(f) },
  { id: "plush", label: "Plush", test: (f: string) => /plush|soft/i.test(f) },
];

export default function ProductListing({
  products,
  query,
  pick,
}: {
  products: Mattress[];
  query: string;
  pick?: string;
}) {
  const [feel, setFeel] = useState("all");
  const [sort, setSort] = useState<Sort>("recommended");
  const [springs, setSprings] = useState(false);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const test = FEELS.find((f) => f.id === feel)?.test || (() => true);
    const list = products.filter((p) => {
      if (!test(p.firmness)) return false;
      if (springs && !JSON.stringify(p.options || []).toLowerCase().includes("spring") && !p.layers.some((l) => /spring/i.test(l.name)))
        return false;
      if (!q) return true;
      return [p.name, p.kicker, p.firmness, p.shortDescription, ...p.layers.map((l) => l.name), ...p.features]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    if (sort === "price-asc") return [...list].sort((a, b) => a.basePrice - b.basePrice);
    if (sort === "price-desc") return [...list].sort((a, b) => b.basePrice - a.basePrice);
    return list;
  }, [products, query, feel, sort, springs]);

  return (
    <>
      <div className="g-filters">
        <div className="g-filter-group" role="group" aria-label="Filter by feel">
          {FEELS.map((f) => (
            <button key={f.id} type="button" className="g-filter" aria-pressed={feel === f.id} onClick={() => setFeel(f.id)}>
              {f.label}
            </button>
          ))}
          <button type="button" className="g-filter" aria-pressed={springs} onClick={() => setSprings((v) => !v)}>
            Pocket-spring option
          </button>
        </div>
        <label>
          <span className="g-sr">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>

      <p className="g-sr" aria-live="polite">
        {shown.length} mattresses shown
      </p>

      {shown.length ? (
        <div className="g-products">
          {shown.map((p) => (
            <ProductCard key={p.slug} mattress={p} highlight={p.slug === pick ? "Our pick for most people" : undefined} />
          ))}
        </div>
      ) : (
        <div className="g-empty">
          <h2 className="g-h3">Nothing matches those filters</h2>
          <p>We only make three mattresses, so filters run out fast. Clear them to see all three.</p>
          <button
            type="button"
            className="g-btn"
            onClick={() => {
              setFeel("all");
              setSprings(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
