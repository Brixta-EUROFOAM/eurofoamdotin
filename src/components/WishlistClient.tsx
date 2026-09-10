"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SavedMattress } from "@/components/WishlistButton";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export default function WishlistClient() {
  const [items, setItems] = useState<SavedMattress[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setItems(
        JSON.parse(
          localStorage.getItem("eurofoam-wishlist") || "[]"
        )
      );
    } finally {
      setReady(true);
    }
  }, []);

  function remove(slug: string) {
    const next = items.filter(
      (item) => item.slug !== slug
    );

    setItems(next);

    localStorage.setItem(
      "eurofoam-wishlist",
      JSON.stringify(next)
    );

    window.dispatchEvent(
      new Event("eurofoam:wishlist")
    );
  }

  if (!ready) return null;

  if (!items.length) {
    return (
      <div className="rounded-[2rem] border border-ink/10 bg-white p-9 text-center">
        <h1 className="font-display text-4xl">
          Nothing saved yet.
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/55">
          Use the heart on a mattress to save it here.
        </p>

        <Link
          href="/mattresses"
          className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-black text-white"
        >
          SHOP MATTRESSES
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-5xl">
        Saved mattresses.
      </h1>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.slug}
            className="overflow-hidden rounded-[1.8rem] border border-ink/10 bg-white"
          >
            <Link href={`/mattresses/${item.slug}`}>
              <img
                src={item.image}
                alt={item.name}
                className="aspect-[16/9] w-full object-cover"
              />
            </Link>

            <div className="p-6">
              <div className="text-xs font-bold uppercase tracking-[.12em] text-[#D95F0E]">
                {item.kicker}
              </div>

              <Link
                href={`/mattresses/${item.slug}`}
                className="mt-2 block font-display text-3xl"
              >
                {item.name}
              </Link>

              <div className="mt-3 font-black">
                {money(item.basePrice)}
              </div>

              <button
                type="button"
                onClick={() => remove(item.slug)}
                className="mt-5 text-xs font-black text-ink/45 underline underline-offset-4"
              >
                REMOVE
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
