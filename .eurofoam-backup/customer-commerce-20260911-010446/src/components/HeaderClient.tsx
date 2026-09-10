"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import {
  defaultHeaderUtilities,
  type HeaderUtility,
  type Mattress,
  type SiteSettings
} from "@/lib/catalog";

function HeaderIcon({
  name,
  className = "h-5 w-5"
}: {
  name: HeaderUtility["icon"] | "cart";
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true
  };

  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
      </svg>
    );
  }

  if (name === "heart") {
    return (
      <svg {...common}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
    );
  }

  if (name === "account") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </svg>
    );
  }

  if (name === "cart") {
    return (
      <svg {...common}>
        <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6.2" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
    );
  }

  if (name === "store") {
    return (
      <svg {...common}>
        <path d="M3 10h18" />
        <path d="M5 10v10h14V10" />
        <path d="M4 4h16l1 6H3l1-6Z" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (name === "dealer") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M17 8h4" />
        <path d="M19 6v4" />
      </svg>
    );
  }

  if (name === "bulk") {
    return (
      <svg {...common}>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m4.5 7.8 7.5 4.3 7.5-4.3" />
        <path d="M12 12v9" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M5 12h14" />
      <path d="m15 8 4 4-4 4" />
    </svg>
  );
}

function utilityHref(action: HeaderUtility, site: SiteSettings) {
  if (action.id === "phone" && (!action.href || action.href === "tel:")) {
    return `tel:${site.phone.replace(/[^\d+]/g, "")}`;
  }

  return action.href || "#";
}

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

  const utilities =
    site.headerUtilities && site.headerUtilities.length
      ? site.headerUtilities
      : defaultHeaderUtilities;

  const enabledUtilities = utilities.filter((action) => action.enabled);

  const groups = useMemo(() => {
    const grouped = new Map<string, Mattress[]>();

    for (const product of products) {
      const category = product.category?.trim() || "Other";
      const current = grouped.get(category) || [];
      current.push(product);
      grouped.set(category, current);
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
        className="relative sticky top-0 z-50 border-b border-ink/10 bg-[#FAF6E8]"
        onMouseLeave={() => setCatalogOpen(false)}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-3 lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-4"
            onClick={closeEverything}
          >
            <img
              src={site.logoUrl}
              alt={`${site.brandName} ${site.brandSuffix}`}
              className="h-20 w-auto max-w-[285px] object-contain"
            />

            <span className="hidden border-l border-ink/15 pl-4 text-[10px] font-black uppercase tracking-[0.18em] text-ink/55 md:block">
              {site.brandSuffix}
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <button
              type="button"
              onMouseEnter={() => setCatalogOpen(true)}
              onFocus={() => setCatalogOpen(true)}
              onClick={() => setCatalogOpen((value) => !value)}
              aria-expanded={catalogOpen}
              className="flex items-center gap-2 text-sm font-bold text-ink/75 transition hover:text-[#D95F0E]"
            >
              Mattresses
              <span
                className={`text-[9px] transition-transform ${
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
              className="rounded-full border border-[#FF7A00]/60 bg-white/60 px-5 py-2.5 text-sm font-bold text-ink transition hover:border-[#FF7A00] hover:bg-white"
            >
              Find My Match
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="hidden items-center gap-1.5 xl:flex">
              {enabledUtilities.map((action) => {
                const href = utilityHref(action, site);

                if (action.presentation === "text") {
                  return (
                    <a
                      key={action.id}
                      href={href}
                      className="rounded-full px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-white/65 hover:text-ink"
                    >
                      {action.label}
                    </a>
                  );
                }

                return (
                  <a
                    key={action.id}
                    href={href}
                    title={action.label}
                    aria-label={action.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-ink/75 transition hover:bg-white hover:text-[#D95F0E]"
                  >
                    <HeaderIcon
                      name={action.icon}
                      className="h-[22px] w-[22px]"
                    />
                  </a>
                );
              })}
            </div>

            <Link
              href="/cart"
              aria-label={count ? `Cart with ${count} items` : "Cart"}
              title="Cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-white"
            >
              <HeaderIcon name="cart" className="h-6 w-6" />

              {count ? (
                <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#FF7A00] px-1 text-[10px] font-black text-white">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => {
                setCatalogOpen(false);
                setMobileOpen(true);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white/60 lg:hidden"
              aria-label="Open navigation"
            >
              <span className="space-y-1">
                <span className="block h-[2px] w-5 bg-ink" />
                <span className="block h-[2px] w-5 bg-ink" />
                <span className="block h-[2px] w-5 bg-ink" />
              </span>
            </button>
          </div>
        </div>

        {catalogOpen ? (
          <div
            className="absolute left-0 right-0 top-full hidden border-y border-ink/10 bg-white shadow-[0_30px_70px_rgba(24,24,24,0.15)] lg:block"
            onMouseEnter={() => setCatalogOpen(true)}
          >
            <div className="mx-auto max-w-[1500px] px-8 py-8">
              <div className="mb-7 flex items-end justify-between gap-8">
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
                <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                  {groups.map((group) => (
                    <div key={group.category}>
                      <div className="border-b-2 border-[#FF7A00]/70 pb-2 text-xs font-black uppercase tracking-[0.12em]">
                        {group.category}
                      </div>

                      <div className="mt-3">
                        {group.products.map((product) => (
                          <Link
                            key={product.slug}
                            href={`/mattresses/${product.slug}`}
                            onClick={() => setCatalogOpen(false)}
                            className="group block rounded-xl px-2 py-2.5 transition hover:bg-[#FFF7F0]"
                          >
                            <div className="text-sm font-bold text-ink/80 group-hover:text-[#D95F0E]">
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
                    <div className="aspect-[16/10] overflow-hidden">
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
                    </div>
                  </Link>
                ) : null}
              </div>

              <div className="mt-8 flex gap-3 border-t border-ink/10 pt-5">
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
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute right-0 top-0 h-full w-[min(92vw,430px)] overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-ink/10 bg-[#FAF6E8] px-5 py-5">
              <div className="flex items-center justify-between">
                <img
                  src={site.logoUrl}
                  alt={site.brandName}
                  className="h-14 w-auto max-w-[210px] object-contain"
                />

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl"
                  aria-label="Close navigation"
                >
                  ×
                </button>
              </div>

              <Link
                href="/sleep-quiz"
                onClick={closeEverything}
                className="mt-5 block rounded-[1.25rem] border border-[#FF7A00]/40 bg-white/60 px-5 py-4"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#D95F0E]">
                  Need help choosing?
                </div>
                <div className="mt-1 font-display text-2xl">
                  Find My Mattress →
                </div>
              </Link>
            </div>

            <div className="px-5 py-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#D95F0E]">
                    Shop
                  </div>
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
                          className="flex items-center justify-between py-2.5 text-[15px] font-bold"
                        >
                          {product.name}
                          <span className="text-ink/25">→</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {enabledUtilities.length ? (
                <section className="border-t border-ink/10 py-5">
                  <h3 className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">
                    Your Eurofoam
                  </h3>

                  <div className="mt-2">
                    {enabledUtilities.map((action) => (
                      <a
                        key={action.id}
                        href={utilityHref(action, site)}
                        className="flex items-center gap-4 border-b border-ink/5 py-4"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF6E8] text-ink">
                          <HeaderIcon
                            name={action.icon}
                            className="h-5 w-5"
                          />
                        </span>

                        <span className="font-bold">
                          {action.label}
                        </span>
                      </a>
                    ))}

                    <Link
                      href="/cart"
                      onClick={closeEverything}
                      className="flex items-center gap-4 py-4"
                    >
                      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF6E8]">
                        <HeaderIcon name="cart" className="h-5 w-5" />
                      </span>

                      <span className="font-bold">
                        Cart{count ? ` (${count})` : ""}
                      </span>
                    </Link>
                  </div>
                </section>
              ) : null}

              <section className="border-t border-ink/10 py-3">
                <Link
                  href="/reviews"
                  onClick={closeEverything}
                  className="flex items-center justify-between py-4 font-bold"
                >
                  Reviews <span>→</span>
                </Link>

                <Link
                  href="/compare"
                  onClick={closeEverything}
                  className="flex items-center justify-between py-4 font-bold"
                >
                  Compare Mattresses <span>→</span>
                </Link>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
