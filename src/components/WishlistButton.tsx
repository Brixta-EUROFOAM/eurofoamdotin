"use client";

import { useEffect, useState } from "react";

export type SavedMattress = {
  slug: string;
  name: string;
  image: string;
  kicker: string;
  basePrice: number;
};

function readSaved(): SavedMattress[] {
  try {
    return JSON.parse(
      localStorage.getItem("eurofoam-wishlist") || "[]"
    );
  } catch {
    return [];
  }
}

export default function WishlistButton({
  mattress
}: {
  mattress: SavedMattress;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(
      readSaved().some((item) => item.slug === mattress.slug)
    );
  }, [mattress.slug]);

  function toggle() {
    const current = readSaved();

    const next = current.some(
      (item) => item.slug === mattress.slug
    )
      ? current.filter((item) => item.slug !== mattress.slug)
      : [...current, mattress];

    localStorage.setItem(
      "eurofoam-wishlist",
      JSON.stringify(next)
    );

    setSaved(
      next.some((item) => item.slug === mattress.slug)
    );

    window.dispatchEvent(
      new Event("eurofoam:wishlist")
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        saved
          ? `Remove ${mattress.name} from saved`
          : `Save ${mattress.name}`
      }
      title={saved ? "Saved" : "Save mattress"}
      className={`absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition ${
        saved
          ? "border-[#FF7A00] bg-[#FF7A00] text-white"
          : "border-white/70 bg-white/90 text-ink hover:text-[#D95F0E]"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
    </button>
  );
}
