"use client";

import Link from "next/link";
import GaddaMenu from "@/components/GaddaMenu";
import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useCart } from "@/components/CartProvider";
import type {
  Mattress,
  SiteSettings
} from "@/lib/catalog";

type HeaderAction = {
  id: string;
  label: string;
  href: string;
  icon: string;
  presentation: "text" | "icon";
  enabled: boolean;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  mobile: string;
};

function Icon({
  name,
  className = "h-5 w-5"
}: {
  name:
    | "phone"
    | "heart"
    | "account"
    | "pin"
    | "cart";
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
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
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

  if (name === "pin") {
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6.2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
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

  const [pinOpen, setPinOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pinDraft, setPinDraft] = useState("");
  const [pinError, setPinError] = useState("");
  const pinWrapRef = useRef<HTMLDivElement>(null);

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [wishlistCount, setWishlistCount] =
    useState(0);

  const { count } = useCart();

  const siteWithActions = site as SiteSettings & {
    headerUtilities?: HeaderAction[];
  };

  const extraActions = (
    siteWithActions.headerUtilities || []
  ).filter(
    (action) =>
      action.enabled &&
      !["phone", "wishlist", "account"].includes(
        action.id
      )
  );

  const groups = useMemo(() => {
    const grouped = new Map<string, Mattress[]>();

    for (const product of products) {
      const category =
        product.category?.trim() || "Other";

      grouped.set(category, [
        ...(grouped.get(category) || []),
        product
      ]);
    }

    return Array.from(grouped.entries());
  }, [products]);

  const featured =
    products.find((item) => item.badge) ||
    products[0];

  function refreshAccount() {
    fetch("/api/customer/me")
      .then((response) => response.json())
      .then((body) =>
        setCustomer(body.customer || null)
      )
      .catch(() => setCustomer(null));
  }

  function refreshWishlist() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(
          "eurofoam-wishlist"
        ) || "[]"
      );

      setWishlistCount(
        Array.isArray(saved) ? saved.length : 0
      );
    } catch {
      setWishlistCount(0);
    }
  }

  useEffect(() => {
    const stored =
      localStorage.getItem("eurofoam-pincode") || "";

    setPincode(stored);
    setPinDraft(stored);

    refreshAccount();
    refreshWishlist();

    window.addEventListener(
      "eurofoam:account",
      refreshAccount
    );

    window.addEventListener(
      "eurofoam:wishlist",
      refreshWishlist
    );

    return () => {
      window.removeEventListener(
        "eurofoam:account",
        refreshAccount
      );

      window.removeEventListener(
        "eurofoam:wishlist",
        refreshWishlist
      );
    };
  }, []);

  useEffect(() => {
    if (!pinOpen) return;

    function handleOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      if (
        pinWrapRef.current &&
        !pinWrapRef.current.contains(target)
      ) {
        setPinOpen(false);
        setPinError("");
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPinOpen(false);
        setPinError("");
      }
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [pinOpen]);

  function savePincode() {
    const value = pinDraft.trim();

    if (!/^\d{6}$/.test(value)) {
      setPinError(
        "Enter a valid 6-digit PIN code."
      );
      return;
    }

    localStorage.setItem(
      "eurofoam-pincode",
      value
    );

    setPincode(value);
    setPinError("");
    setPinOpen(false);
  }

  const phoneHref = `tel:${site.phone.replace(
    /[^\d+]/g,
    ""
  )}`;

  return (
    <>
      {site.announcementEnabled !== false && site.announcement ? (
        site.announcementHref ? (
          <a
            href={site.announcementHref}
            className="block px-4 py-2 text-center text-xs font-semibold tracking-wide"
            style={{
              backgroundColor: site.announcementBackground || "#FF6500",
              color: site.announcementForeground || "#FFFFFF"
            }}
          >
            {site.announcement}
          </a>
        ) : (
          <div
            className="px-4 py-2 text-center text-xs font-semibold tracking-wide"
            style={{
              backgroundColor: site.announcementBackground || "#FF6500",
              color: site.announcementForeground || "#FFFFFF"
            }}
          >
            {site.announcement}
          </div>
        )
      ) : null}

      <header
        className="relative sticky top-0 z-50 border-b border-ink/10 bg-[#F3ECDD]"
        onMouseLeave={() =>
          setCatalogOpen(false)
        }
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5 px-5 py-3 lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-4"
          >
            <span
              className="gadda-wordmark"
              aria-label="GADDA"
            >
              GADDA
            </span>

            
          </Link>

          <nav className="gadda-main-nav hidden items-center gap-7 lg:flex">
            <button
              type="button"
              onClick={() =>
                setCatalogOpen((v) => !v)
              }
              className="gadda-nav-link flex items-center gap-2 text-sm font-bold text-ink/75"
            >
              Gadda Menu
              <span className="text-[9px]">
                ▼
              </span>
            </button>

            <Link
              href="/reviews"
              className="gadda-nav-link text-sm font-bold text-ink/75"
            >
              Reviews
            </Link>

            <Link
              href="/sleep-quiz"
              className="gadda-match-button px-5 py-2.5 text-sm font-bold"
            >
              Find My Match
            </Link>
          </nav>

          <div className="gadda-header-tools flex shrink-0 items-center gap-1 xl:gap-2">
            {extraActions.length ? (
              <div className="hidden items-center gap-1 2xl:flex">
                {extraActions.map((action) => (
                  <a
                    key={action.id}
                    href={action.href}
                    className="rounded-full px-3 py-2 text-sm font-semibold text-ink/65 hover:bg-white/70"
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            ) : null}

            <a
              href={phoneHref}
              className="hidden items-center gap-2 rounded-xl px-2.5 py-2 hover:bg-white/70 2xl:flex"
            >
              <Icon
                name="phone"
                className="h-6 w-6"
              />

              <span className="leading-tight">
                <span className="block text-xs font-bold">
                  Call
                </span>

                <span className="block text-[10px] text-ink/45">
                  GADDA
                </span>
              </span>
            </a>

            <Link
              href="/wishlist"
              className="hidden items-center gap-2 rounded-xl px-2.5 py-2 hover:bg-white/70 xl:flex"
            >
              <Icon
                name="heart"
                className="h-6 w-6"
              />

              <span className="leading-tight">
                <span className="block text-xs font-bold">
                  Saved
                </span>

                <span className="block text-[10px] text-ink/45">
                  {wishlistCount
                    ? `${wishlistCount} item${
                        wishlistCount === 1
                          ? ""
                          : "s"
                      }`
                    : "Wishlist"}
                </span>
              </span>
            </Link>

            <Link
              href="/account"
              className="hidden items-center gap-2 rounded-xl px-2.5 py-2 hover:bg-white/70 xl:flex"
            >
              <Icon
                name="account"
                className="h-6 w-6"
              />

              <span className="leading-tight">
                <span className="block max-w-[110px] truncate text-xs font-bold">
                  {customer
                    ? `Hi, ${
                        customer.name.split(
                          " "
                        )[0]
                      }`
                    : "My Account"}
                </span>

                <span className="block text-[10px] text-ink/45">
                  {customer
                    ? "Account"
                    : "Sign in / Sign up"}
                </span>
              </span>
            </Link>

            <div
              ref={pinWrapRef}
              className="relative hidden xl:block"
            >
              <button
                type="button"
                onClick={() => {
                  setPinDraft(pincode);
                  setPinError("");
                  setPinOpen((v) => !v);
                }}
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left hover:bg-white/70"
              >
                <Icon
                  name="pin"
                  className="h-6 w-6"
                />

                <span className="leading-tight">
                  <span className="block text-xs font-bold">
                    Deliver to
                  </span>

                  <span className="block text-[10px] text-ink/45">
                    {pincode ||
                      "Enter PIN"}
                  </span>
                </span>
              </button>

              {pinOpen ? (
                <div className="absolute right-0 top-[calc(100%+12px)] w-72 rounded-[1.4rem] border border-ink/10 bg-white p-5 shadow-[0_20px_60px_rgba(24,24,24,.16)]">
                  <p className="text-xs font-black uppercase tracking-[.12em] text-[#FF6500]">
                    Delivery location
                  </p>

                  <p className="mt-2 text-sm text-ink/55">
                    Enter your 6-digit PIN code.
                  </p>

                  <input
                    value={pinDraft}
                    onChange={(e) =>
                      setPinDraft(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        savePincode();
                      }
                    }}
                    inputMode="numeric"
                    placeholder="781001"
                    className="mt-4 w-full rounded-xl border border-ink/15 px-4 py-3 text-lg font-bold tracking-[.15em] outline-none focus:border-[#FF6500]"
                  />

                  {pinError ? (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      {pinError}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={savePincode}
                    className="mt-4 w-full rounded-full bg-ink px-4 py-3 text-xs font-black text-white"
                  >
                    USE THIS PIN
                  </button>
                </div>
              ) : null}
            </div>

            <Link
              href="/cart"
              title="Cart"
              aria-label={
                count
                  ? `Cart with ${count} items`
                  : "Cart"
              }
              className="relative flex h-12 w-12 items-center justify-center rounded-full hover:bg-white"
            >
              <Icon
                name="cart"
                className="h-7 w-7"
              />

              {count ? (
                <span className="absolute right-0 top-0 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6500] px-1 text-[10px] font-black text-white">
                  {count > 99
                    ? "99+"
                    : count}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() =>
                setMobileOpen(true)
              }
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white/60 lg:hidden"
              aria-label="Open menu"
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
          <GaddaMenu
            products={products}
            onClose={() =>
              setCatalogOpen(false)
            }
          />
        ) : null}
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setMobileOpen(false)
            }
            aria-label="Close menu"
          />

          <aside className="absolute right-0 top-0 h-full w-[min(92vw,430px)] overflow-y-auto bg-white shadow-2xl">
            <div className="border-b border-ink/10 bg-[#F3ECDD] p-5">
              <div className="flex items-center justify-between">
                <img
                  src={site.logoUrl}
                  alt={site.brandName}
                  className="h-14 w-auto"
                />

                <button
                  type="button"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="h-10 w-10 rounded-full bg-white text-xl"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  href="/account"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="rounded-[1.2rem] bg-white p-4"
                >
                  <Icon
                    name="account"
                    className="h-6 w-6"
                  />

                  <div className="mt-3 text-sm font-black">
                    {customer
                      ? customer.name
                      : "My Account"}
                  </div>

                  <div className="mt-1 text-xs text-ink/45">
                    {customer
                      ? "View account"
                      : "Sign in / Sign up"}
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    const entered =
                      window.prompt(
                        "Enter your 6-digit delivery PIN",
                        pincode
                      );

                    if (
                      entered &&
                      /^\d{6}$/.test(
                        entered.trim()
                      )
                    ) {
                      const value =
                        entered.trim();

                      localStorage.setItem(
                        "eurofoam-pincode",
                        value
                      );

                      setPincode(value);
                      setPinDraft(value);
                    }
                  }}
                  className="rounded-[1.2rem] bg-white p-4 text-left"
                >
                  <Icon
                    name="pin"
                    className="h-6 w-6"
                  />

                  <div className="mt-3 text-sm font-black">
                    Deliver to
                  </div>

                  <div className="mt-1 text-xs text-ink/45">
                    {pincode ||
                      "Enter PIN"}
                  </div>
                </button>
              </div>
            </div>

            <div className="p-5">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setCatalogOpen(true);
                }}
                className="block w-full py-4 text-left text-lg font-black"
              >
                Gadda Menu
              </button>

              {groups.map(
                ([category, items]) => (
                  <div
                    key={category}
                    className="border-t border-ink/10 py-4"
                  >
                    <div className="text-xs font-black uppercase tracking-[.12em] text-ink/40">
                      {category}
                    </div>

                    {items.map(
                      (product) => (
                        <Link
                          key={product.slug}
                          href={`/mattresses/${product.slug}`}
                          onClick={() =>
                            setMobileOpen(
                              false
                            )
                          }
                          className="block py-2.5 font-bold"
                        >
                          {product.name}
                        </Link>
                      )
                    )}
                  </div>
                )
              )}

              <div className="border-t border-ink/10 py-3">
                <Link
                  href="/wishlist"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="flex items-center gap-3 py-4 font-bold"
                >
                  <Icon
                    name="heart"
                    className="h-5 w-5"
                  />
                  Saved mattresses
                </Link>

                <a
                  href={phoneHref}
                  className="flex items-center gap-3 py-4 font-bold"
                >
                  <Icon
                    name="phone"
                    className="h-5 w-5"
                  />
                  Call GADDA
                </a>

                {extraActions.map(
                  (action) => (
                    <a
                      key={action.id}
                      href={action.href}
                      className="block py-4 font-bold"
                    >
                      {action.label}
                    </a>
                  )
                )}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
