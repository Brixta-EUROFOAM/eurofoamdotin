"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Mattress, SiteSettings } from "@/lib/catalog";

export default function HeaderClient({
  site,
  products
}: {
  site: SiteSettings;
  products: Mattress[];
}) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useCart();

  const groups = useMemo(() => {
    const grouped = new Map<string, Mattress[]>();

    for (const product of products) {
      const category = product.category?.trim() || "Other";
      const existing = grouped.get(category) || [];
      existing.push(product);
      grouped.set(category, existing);
    }

    return Array.from(grouped.entries()).map(([category, items]) => ({
      category,
      products: items
    }));
  }, [products]);

  const featured =
    products.find((product) => Boolean(product.badge)) || products[0];

  function closeEverything() {
    setCatalogOpen(false);
    setMobileOpen(false);
  }

  return (
    <>
      <div className="bg-[#FF7A00] px-4 py-2 text-center text-xs font-semibold tracking-wide text-white">
        {site.announcement}
      </div>

      <header
        className="relative sticky top-0 z-50 border-b border-ink/10 bg-[#FAF6E8] backdrop-blur"
        onMouseLeave={() => setCatalogOpen(false)}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={closeEverything}
          >
            <img
              src={site.logoUrl}
              alt={`${site.brandName} ${site.brandSuffix}`}
              className="h-12 w-auto max-w-[175px] object-contain"
            />

            <span className="hidden border-l border-ink/15 pl-3 text-[10px] font-black uppercase tracking-[0.18em] text-ink/55 sm:block">
              {site.brandSuffix}
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-8 lg:flex">
            <button
              type="button"
              onClick={() => setCatalogOpen((open) => !open)}
              onMouseEnter={() => setCatalogOpen(true)}
              onFocus={() => setCatalogOpen(true)}
              aria-expanded={catalogOpen}
              className="flex items-center gap-2 text-sm font-bold text-ink/75 transition hover:text-[#D95F0E]"
            >
              Mattresses
              <span
                className={`text-[10px] transition-transform ${
                  catalogOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            <Link
              href="/reviews"
              className="text-sm font-bold text-ink/75 transition hover:text-[#D95F0E]"
            >
              Reviews
            </Link>

            <Link
              href="/sleep-quiz"
              className="rounded-full bg-[#FF7A00] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#D95F0E]"
            >
              Find My Match
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/cart"
              className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:border-ink/30"
            >
              Cart{count ? ` (${count})` : ""}
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(true);
                setCatalogOpen(false);
              }}
              className="rounded-full border border-ink/15 bg-white px-3 py-2 text-sm font-bold lg:hidden"
              aria-label="Open navigation"
            >
              Menu
            </button>
          </div>
        </div>

        {/* DESKTOP MEGA MENU */}
        {catalogOpen ? (
          <div
            className="absolute left-0 right-0 top-full hidden border-y border-ink/10 bg-white shadow-[0_30px_70px_rgba(24,24,24,0.16)] lg:block"
            onMouseEnter={() => setCatalogOpen(true)}
          >
            <div className="mx-auto max-w-7xl px-8 py-8">
              <div className="mb-6 flex items-end justify-between gap-8">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#D95F0E]">
                    Shop mattresses
                  </p>
                  <h2 className="mt-2 font-display text-3xl">
                    Find the right sleep feel.
                  </h2>
                </div>

                <Link
                  href="/mattresses"
                  onClick={() => setCatalogOpen(false)}
                  className="text-sm font-black underline decoration-2 underline-offset-4"
                >
                  SHOP ALL →
                </Link>
              </div>

              <div className="grid gap-8 xl:grid-cols-[1fr_270px]">
                <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
                  {groups.map((group) => (
                    <div key={group.category}>
                      <div className="border-b-2 border-[#FF7A00]/70 pb-2 text-xs font-black uppercase tracking-[0.12em] text-ink">
                        {group.category}
                      </div>

                      <div className="mt-3 space-y-1">
                        {group.products.map((product) => (
                          <Link
                            key={product.slug}
                            href={`/mattresses/${product.slug}`}
                            onClick={() => setCatalogOpen(false)}
                            className="group/product block rounded-xl px-2 py-2.5 transition hover:bg-[#FFF7F0]"
                          >
                            <div className="text-sm font-bold text-ink/80 group-hover/product:text-[#D95F0E]">
                              {product.name}
                            </div>

                            {product.kicker ? (
                              <div className="mt-0.5 line-clamp-1 text-[11px] text-ink/40">
                                {product.kicker}
                              </div>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {featured ? (
                  <Link
                    href={`/mattresses/${featured.slug}`}
                    onClick={() => setCatalogOpen(false)}
                    className="group overflow-hidden rounded-[1.6rem] bg-[#FAF6E8]"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-sand">
                      <img
                        src={featured.image}
                        alt={featured.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="p-5">
                      <div className="text-[10px] font-black uppercase tracking-[0.15em] text-[#D95F0E]">
                        {featured.badge || "Featured"}
                      </div>
                      <div className="mt-1 font-display text-2xl">
                        {featured.name}
                      </div>
                      <div className="mt-2 text-xs leading-5 text-ink/55">
                        {featured.kicker}
                      </div>
                      <div className="mt-4 text-xs font-black">
                        VIEW MATTRESS →
                      </div>
                    </div>
                  </Link>
                ) : null}
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-ink/10 pt-5">
                <Link
                  href="/mattresses"
                  onClick={() => setCatalogOpen(false)}
                  className="rounded-full bg-ink px-5 py-2.5 text-xs font-black text-white"
                >
                  SHOP ALL
                </Link>

                <Link
                  href="/compare"
                  onClick={() => setCatalogOpen(false)}
                  className="rounded-full border border-ink/15 px-5 py-2.5 text-xs font-black"
                >
                  COMPARE MATTRESSES
                </Link>

                <Link
                  href="/sleep-quiz"
                  onClick={() => setCatalogOpen(false)}
                  className="rounded-full border border-[#FF7A00]/40 bg-[#FFF7F0] px-5 py-2.5 text-xs font-black text-[#D95F0E]"
                >
                  FIND MY MATCH
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* MOBILE WAKEFIT-STYLE DRAWER */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute right-0 top-0 h-full w-[min(92vw,430px)] overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-ink/10 bg-[#FAF6E8] px-5 py-5">
              <div className="flex items-center justify-between gap-4">
                <Link href="/" onClick={closeEverything}>
                  <img
                    src={site.logoUrl}
                    alt={site.brandName}
                    className="h-11 w-auto max-w-[150px] object-contain"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white text-xl"
                  aria-label="Close navigation"
                >
                  ×
                </button>
              </div>

              <Link
                href="/sleep-quiz"
                onClick={closeEverything}
                className="mt-5 block rounded-[1.25rem] bg-[#FF7A00] px-5 py-4 text-white"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70">
                  Not sure what to choose?
                </div>
                <div className="mt-1 font-display text-2xl">
                  Find My Mattress →
                </div>
              </Link>
            </div>

            <div className="px-5 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#D95F0E]">
                    Shop
                  </p>
                  <h2 className="mt-1 font-display text-3xl">
                    Mattresses
                  </h2>
                </div>

                <Link
                  href="/mattresses"
                  onClick={closeEverything}
                  className="text-xs font-black underline underline-offset-4"
                >
                  ALL →
                </Link>
              </div>

              <div className="mt-5">
                {groups.map((group) => (
                  <section
                    key={group.category}
                    className="border-t border-ink/10 py-5"
                  >
                    <h3 className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">
                      {group.category}
                    </h3>

                    <div className="mt-2">
                      {group.products.map((product) => (
                        <Link
                          key={product.slug}
                          href={`/mattresses/${product.slug}`}
                          onClick={closeEverything}
                          className="flex items-center justify-between gap-5 py-2.5 text-[15px] font-bold"
                        >
                          <span>{product.name}</span>
                          <span className="text-ink/25">→</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="border-t border-ink/10 py-3">
                <Link
                  href="/reviews"
                  onClick={closeEverything}
                  className="flex items-center justify-between py-4 text-base font-bold"
                >
                  Reviews <span>→</span>
                </Link>

                <Link
                  href="/compare"
                  onClick={closeEverything}
                  className="flex items-center justify-between py-4 text-base font-bold"
                >
                  Compare Mattresses <span>→</span>
                </Link>

                <Link
                  href="/why-eurofoam"
                  onClick={closeEverything}
                  className="flex items-center justify-between py-4 text-base font-bold"
                >
                  Why Eurofoam <span>→</span>
                </Link>
              </div>

              <div className="mt-4 rounded-[1.4rem] bg-[#FAF6E8] p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-ink/40">
                  Need help?
                </div>

                <a
                  href={`mailto:${site.email}`}
                  className="mt-2 block font-display text-2xl"
                >
                  Talk to Eurofoam →
                </a>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
