"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readSaved, WISHLIST_KEY, type SavedMattress } from "@/components/WishlistButton";
import { money } from "@/lib/catalog";
import NeedleArt from "@/components/store/NeedleArt";

export default function WishlistClient() {
  const [items, setItems] = useState<SavedMattress[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readSaved());
    setReady(true);
  }, []);

  function remove(slug: string) {
    const next = items.filter((item) => item.slug !== slug);
    setItems(next);
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    } catch {}
    window.dispatchEvent(new Event("eurofoam:wishlist"));
  }

  if (!ready) return null;

  if (!items.length) {
    return (
      <div className="g-empty">
        <NeedleArt />
        <h2 className="g-h3">Nothing saved yet</h2>
        <p>Tap the heart on any mattress to keep it here while you decide. Saved items stay on this device only.</p>
        <Link href="/mattresses" className="g-btn">
          Browse mattresses
        </Link>
      </div>
    );
  }

  return (
    <div className="g-card-flat" style={{ padding: 0 }}>
      {items.map((item) => (
        <div key={item.slug} className="g-line" style={{ padding: 20, margin: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt="" />
          <div>
            <div className="g-line-top">
              <Link href={`/mattresses/${item.slug}`}>{item.name}</Link>
              <b>from {money(item.basePrice)}</b>
            </div>
            <p className="g-line-spec">{item.kicker}</p>
            <div className="g-line-row">
              <Link href={`/mattresses/${item.slug}`} className="g-btn g-btn--sm">
                Choose size
              </Link>
              <button type="button" className="g-remove" onClick={() => remove(item.slug)}>
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
