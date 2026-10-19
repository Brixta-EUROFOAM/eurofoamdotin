"use client";

import Link from "next/link";
import { useState } from "react";
import ProductVisual from "@/components/store/ProductVisual";
import { IconMoon, IconRupee, IconTruck, IconShield } from "@/components/store/Icons";
import { money, type MattressLayer } from "@/lib/catalog";

export type MegaProduct = {
  slug: string;
  name: string;
  kicker: string;
  firmness: string;
  basePrice: number;
  image?: string;
  layers: Pick<MattressLayer, "name" | "visualKind" | "description">[];
};

/* 1 = plush … 5 = firm, from the plain-words firmness label. */
export function feelScore(firmness: string) {
  const f = firmness.toLowerCase();
  if (f.includes("plush") || f.includes("soft")) return 2;
  if (f.includes("balanc") || f.includes("medium")) return 3;
  if (f.includes("extra firm")) return 5;
  if (f.includes("firm")) return 4;
  return 3;
}

export function FeelScale({ firmness }: { firmness: string }) {
  const score = feelScore(firmness);
  return (
    <span className="g-feel" aria-label={`Feel: ${firmness}`}>
      <span className="g-feel-track" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <i key={n} data-on={n === score || undefined} />
        ))}
      </span>
      <span className="g-feel-ends" aria-hidden="true">
        <span>Plush</span>
        <span>Firm</span>
      </span>
    </span>
  );
}

export default function MegaMenu({
  products,
  pick,
  trialNights,
  onNavigate,
}: {
  products: MegaProduct[];
  pick?: string;
  trialNights: number;
  onNavigate?: () => void;
}) {
  const initial = products.find((p) => p.slug === pick) || products[1] || products[0];
  const [active, setActive] = useState(initial?.slug);
  const shown = products.find((p) => p.slug === active) || initial;

  return (
    <div className="g-wrap">
      <div className="g-mm">
        {/* Column 1 — the range, by feel */}
        <div className="g-mm-col">
          <p className="g-mm-title">Shop by feel</p>
          <ul className="g-mm-list" role="list">
            {products.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/mattresses/${p.slug}`}
                  className="g-mm-row"
                  data-active={p.slug === shown?.slug || undefined}
                  onMouseEnter={() => setActive(p.slug)}
                  onFocus={() => setActive(p.slug)}
                  onClick={onNavigate}
                >
                  <span className="g-mm-thumb">
                    <ProductVisual image={p.image} layers={p.layers} alt="" />
                  </span>
                  <span className="g-mm-name">
                    <b>
                      {p.name}
                      {p.slug === pick ? <em>Our pick</em> : null}
                    </b>
                    <span>{p.kicker}</span>
                  </span>
                  <span className="g-mm-price">
                    <small>from</small>
                    {money(p.basePrice)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/mattresses" className="g-mm-all" onClick={onNavigate}>
            View all mattresses
          </Link>
        </div>

        {/* Column 2 — live preview of the hovered mattress */}
        {shown ? (
          <Link href={`/mattresses/${shown.slug}`} className="g-mm-preview" onClick={onNavigate} aria-label={`Shop ${shown.name}`}>
            <div className="g-mm-preview-art" key={shown.slug}>
              <ProductVisual image={shown.image} layers={shown.layers} alt={shown.name} />
            </div>
            <div className="g-mm-preview-body">
              <div className="g-mm-preview-head">
                <b>{shown.name}</b>
                <FeelScale firmness={shown.firmness} />
              </div>
              <ol className="g-mm-layers">
                {shown.layers.map((l) => (
                  <li key={l.name}>{l.name}</li>
                ))}
              </ol>
              <span className="g-btn g-btn--sm g-btn--orange">Shop {shown.name}, from {money(shown.basePrice)}</span>
            </div>
          </Link>
        ) : null}

        {/* Column 3 — help choosing */}
        <div className="g-mm-col">
          <p className="g-mm-title">Help me choose</p>
          <Link href="/sleep-quiz" className="g-mm-quiz" onClick={onNavigate}>
            <b>Find my match</b>
            <span>5 questions, 60 seconds, one answer.</span>
          </Link>
          <nav className="g-mm-links" aria-label="Buying help">
            <Link href="/compare" onClick={onNavigate}>
              Compare all three
            </Link>
            <Link href="/size-guide" onClick={onNavigate}>
              Size guide
            </Link>
            <Link href="/why-gadda" onClick={onNavigate}>
              What&apos;s actually inside
            </Link>
            <Link href="/reviews" onClick={onNavigate}>
              Reviews
            </Link>
          </nav>
        </div>
      </div>

      <ul className="g-mm-trust" role="list">
        <li>
          <IconMoon /> {trialNights}-night home trial
        </li>
        <li>
          <IconTruck /> Delivery included
        </li>
        <li>
          <IconRupee /> Pay on delivery
        </li>
        <li>
          <IconShield /> Made in India, sold direct
        </li>
      </ul>
    </div>
  );
}
