"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { SiteSettings } from "@/lib/catalog";

const links = [
  { label: "Mattresses", href: "/mattresses" },
  { label: "Why Eurofoam", href: "/why-eurofoam" },
  { label: "Compare", href: "/compare" },
  { label: "Reviews", href: "/reviews" },
  { label: "Sleep Quiz", href: "/sleep-quiz" }
];

export default function HeaderClient({ site }: { site: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <>
      <div className="bg-[#FF7A00] px-4 py-2 text-center text-xs font-semibold tracking-wide text-white">
        {site.announcement}
      </div>
     <header className="sticky top-0 z-50 border-b border-ink/10 bg-[#FAF6E8] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img
              src={site.logoUrl}
              alt={`${site.brandName} ${site.brandSuffix}`}
              className="h-12 w-auto max-w-[175px] object-contain"
            />
            <span className="hidden border-l border-ink/15 pl-3 text-[10px] font-black uppercase tracking-[0.18em] text-ink/55 sm:block">
              {site.brandSuffix}
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-ink/70 transition hover:text-gold-dark"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="rounded-full border border-ink/15 bg-sand px-4 py-2 text-sm font-bold text-ink"
            >
              Cart{count ? ` (${count})` : ""}
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-full border border-ink/15 bg-sand px-3 py-2 text-sm font-bold lg:hidden"
              aria-label="Toggle navigation"
            >
              Menu
            </button>
          </div>
        </div>

        {open ? (
          <nav className="border-t border-ink/10 bg-white px-5 py-4 lg:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block border-b border-ink/10 py-3 text-sm font-semibold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
    </>
  );
}
