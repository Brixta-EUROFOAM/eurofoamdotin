"use client";

import { useEffect, useState } from "react";
import { IconHeart } from "@/components/store/Icons";
import { trackEvent } from "@/lib/telemetry-client";

export type SavedMattress = {
  slug: string;
  name: string;
  image: string;
  kicker: string;
  basePrice: number;
};

export const WISHLIST_KEY = "eurofoam-wishlist";

export function readSaved(): SavedMattress[] {
  try {
    const raw = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((i) => i && typeof i.slug === "string").slice(0, 20) : [];
  } catch {
    return [];
  }
}

export default function WishlistButton({ mattress, className = "g-icon-btn" }: { mattress: SavedMattress; className?: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readSaved().some((item) => item.slug === mattress.slug));
    sync();
    window.addEventListener("eurofoam:wishlist", sync);
    return () => window.removeEventListener("eurofoam:wishlist", sync);
  }, [mattress.slug]);

  function toggle() {
    const current = readSaved();
    const has = current.some((item) => item.slug === mattress.slug);
    const next = has ? current.filter((item) => item.slug !== mattress.slug) : [...current, mattress];
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    } catch {}
    setSaved(!has);
    if (!has) trackEvent("wishlist_add", { productSlug: mattress.slug });
    window.dispatchEvent(new Event("eurofoam:wishlist"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${mattress.name} from saved` : `Save ${mattress.name} for later`}
      title={saved ? "Saved" : "Save for later"}
      className={className}
      style={{ background: "#fff", color: saved ? "var(--g-orange)" : "var(--g-ink)" }}
    >
      <IconHeart filled={saved} />
    </button>
  );
}
