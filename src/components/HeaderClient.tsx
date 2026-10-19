"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useCart } from "@/components/CartProvider";
import { useLocation } from "@/components/store/LocationProvider";
import ProductVisual from "@/components/store/ProductVisual";
import MegaMenu from "@/components/store/MegaMenu";
import {
  IconCart,
  IconChevron,
  IconClose,
  IconGrid,
  IconHome,
  IconHeart,
  IconMenu,
  IconPhone,
  IconPin,
  IconQuiz,
  IconSearch,
  IconUser,
} from "@/components/store/Icons";
import { money, type MattressLayer } from "@/lib/catalog";
import { trackEvent } from "@/lib/telemetry-client";

type NavProduct = {
  slug: string;
  name: string;
  kicker: string;
  firmness: string;
  basePrice: number;
  image?: string;
  layers: Pick<MattressLayer, "name" | "visualKind" | "description">[];
};

type Props = {
  messages: string[];
  announcementHref: string;
  phone: { href: string; label: string } | null;
  products: NavProduct[];
  pick?: string;
  trialNights: number;
};

export default function HeaderClient({ messages, announcementHref, phone, products, pick, trialNights }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mega, setMega] = useState(false);
  const [search, setSearch] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const { count, openDrawer, bump } = useCart();
  const { pin, info, openPicker } = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close everything on navigation.
  useEffect(() => {
    setMega(false);
    setSearch(false);
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMega(false);
        setSearch(false);
        setDrawer(false);
      }
      if (e.key === "/" && !/input|textarea|select/i.test((e.target as HTMLElement)?.tagName || "")) {
        e.preventDefault();
        setSearch(true);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMega(false);
        setSearch(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const openMegaSoon = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setMega(true), 120);
  };
  const closeMegaSoon = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setMega(false), 220);
  };

  const place = info?.ok ? info.place?.city || info.pin : pin;

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {messages.length ? <Announcement messages={messages} href={announcementHref} /> : null}

      <header className="g-header" ref={headerRef}>
        <div className="g-utility">
          <div className="g-wrap">
            <button type="button" className="g-deliver" onClick={openPicker}>
              <IconPin width={16} height={16} />
              {place ? (
                <>
                  Delivering to <b>{place}</b>
                </>
              ) : (
                <>
                  <span>Check delivery to</span> <b>your PIN code</b>
                </>
              )}
            </button>
            <nav aria-label="Help">
              <Link href="/track-order">Track order</Link>
              <Link href="/contact">Help &amp; contact</Link>
              {phone ? <a href={phone.href}>{phone.label}</a> : null}
            </nav>
          </div>
        </div>

        <div className="g-wrap g-bar">
          {pathname !== "/" ? (
            <button
              type="button"
              className="g-icon-btn g-back-btn"
              aria-label="Go back"
              onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
            >
              <IconChevron dir="left" />
            </button>
          ) : null}
          <button
            type="button"
            className="g-icon-btn g-menu-btn"
            aria-label="Open menu"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
          >
            <IconMenu />
          </button>

          <Link href="/" className="g-logo" aria-label="GADDA home">
            <span className="g-logo-latin">GADDA</span>
            <span className="g-logo-deva" aria-hidden="true">
              गद्दा
            </span>
          </Link>

          <nav className="g-nav" aria-label="Main">
            <div onMouseEnter={openMegaSoon} onMouseLeave={closeMegaSoon}>
              <button
                type="button"
                aria-expanded={mega}
                aria-controls="mega-mattresses"
                onClick={() => setMega((v) => !v)}
              >
                Mattresses <IconChevron width={16} height={16} />
              </button>
            </div>
            <Link href="/compare" aria-current={pathname === "/compare" ? "page" : undefined}>
              Compare
            </Link>
            <Link href="/sleep-quiz" aria-current={pathname === "/sleep-quiz" ? "page" : undefined}>
              Find my match
            </Link>
            <Link href="/why-gadda" aria-current={pathname === "/why-gadda" ? "page" : undefined}>
              Why GADDA
            </Link>
            <Link href="/reviews" aria-current={pathname === "/reviews" ? "page" : undefined}>
              Reviews
            </Link>
          </nav>

          <div className="g-actions">
            <button
              type="button"
              className="g-icon-btn"
              aria-label="Search"
              aria-expanded={search}
              onClick={() => {
                setMega(false);
                setSearch((v) => !v);
              }}
            >
              <IconSearch />
            </button>
            <Link href="/wishlist" className="g-icon-btn g-hide-md" aria-label="Saved mattresses">
              <IconHeart />
            </Link>
            <Link href="/account" className="g-icon-btn" aria-label="Account">
              <IconUser />
            </Link>
            <button type="button" className="g-icon-btn" aria-label={`Cart, ${count} items`} onClick={openDrawer}>
              <IconCart />
              {count ? (
                <span key={bump} className="g-badge g-badge--pop" aria-hidden="true">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {mega ? (
          <div className="g-mega" id="mega-mattresses" onMouseEnter={openMegaSoon} onMouseLeave={closeMegaSoon}>
            <MegaMenu products={products} pick={pick} trialNights={trialNights} onNavigate={() => setMega(false)} />
          </div>
        ) : null}

        {search ? <SearchPanel products={products} onClose={() => setSearch(false)} /> : null}
      </header>

      {drawer ? (
        <>
          <div className="g-drawer-backdrop" onClick={() => setDrawer(false)} />
          <aside className="g-drawer g-drawer--left" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="g-drawer-head">
              <Link href="/" className="g-logo" onClick={() => setDrawer(false)}>
                <span className="g-logo-latin">GADDA</span>
                <span className="g-logo-deva" aria-hidden="true">
                  गद्दा
                </span>
              </Link>
              <button type="button" className="g-icon-btn" aria-label="Close menu" onClick={() => setDrawer(false)}>
                <IconClose />
              </button>
            </div>
            <div className="g-drawer-body">
              <nav className="g-mnav" aria-label="Mobile">
                {products.map((p) => (
                  <Link key={p.slug} href={`/mattresses/${p.slug}`}>
                    {p.name}
                    <span style={{ fontFamily: "var(--font-body)", fontSize: ".9rem", fontWeight: 500, color: "var(--g-ink-3)" }}>
                      from {money(p.basePrice)}
                    </span>
                  </Link>
                ))}
                <Link href="/compare">Compare</Link>
                <Link href="/sleep-quiz">Find my match</Link>
                <Link href="/why-gadda">Why GADDA</Link>
                <Link href="/reviews">Reviews</Link>
              </nav>
              <div className="g-mnav-small">
                <Link href="/wishlist">Saved mattresses</Link>
                <Link href="/account">Account &amp; orders</Link>
                <Link href="/track-order">Track order</Link>
                <Link href="/contact">Help &amp; contact</Link>
                <Link href="/policies/trial">100-night trial</Link>
                <Link href="/policies/shipping">Delivery</Link>
                <Link href="/policies/warranty">Warranty</Link>
              </div>
            </div>
            {phone ? (
              <div className="g-drawer-foot">
                <a className="g-btn g-btn--ghost g-btn--block" href={phone.href}>
                  <IconPhone width={18} height={18} /> Call {phone.label}
                </a>
              </div>
            ) : null}
          </aside>
        </>
      ) : null}

      <MobileDock pathname={pathname} count={count} onCart={openDrawer} />
    </>
  );
}

function Announcement({ messages, href }: { messages: string[]; href: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (messages.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 4500);
    return () => clearInterval(t);
  }, [messages.length, paused]);

  const go = (d: number) => setI((n) => (n + d + messages.length) % messages.length);

  return (
    <div
      className="g-announce"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {messages.length > 1 ? (
        <button type="button" className="g-announce-nav g-announce-nav--prev" aria-label="Previous message" onClick={() => go(-1)}>
          <IconChevron dir="left" width={16} height={16} />
        </button>
      ) : null}
      <div className="g-announce-inner" aria-live="polite">
        <Link key={i} href={href} className="g-announce-msg">
          {messages[i]}
        </Link>
      </div>
      {messages.length > 1 ? (
        <button type="button" className="g-announce-nav g-announce-nav--next" aria-label="Next message" onClick={() => go(1)}>
          <IconChevron dir="right" width={16} height={16} />
        </button>
      ) : null}
    </div>
  );
}

function SearchPanel({ products, onClose }: { products: NavProduct[]; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => input.current?.focus(), []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) =>
      [p.name, p.kicker, p.firmness, ...p.layers.map((l) => l.name)].join(" ").toLowerCase().includes(term)
    );
  }, [q, products]);

  function submit(e: FormEvent) {
    e.preventDefault();
    trackEvent("search", { label: q.slice(0, 60) });
    const pick = results[active];
    if (pick && q.trim()) router.push(`/mattresses/${pick.slug}`);
    else router.push(`/mattresses${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
    onClose();
  }

  return (
    <div className="g-search" role="search">
      <div className="g-wrap">
        <form onSubmit={submit}>
          <label htmlFor="site-search" className="g-sr">
            Search mattresses
          </label>
          <input
            ref={input}
            id="site-search"
            className="g-input"
            type="search"
            placeholder="Try “memory foam”, “firm” or “pocket springs”"
            value={q}
            autoComplete="off"
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              }
            }}
            aria-controls="search-results"
          />
          <button type="submit" className="g-btn">
            Search
          </button>
        </form>
        {results.length ? (
          <div className="g-search-results" id="search-results" role="listbox">
            {results.map((p, i) => (
              <Link
                key={p.slug}
                href={`/mattresses/${p.slug}`}
                role="option"
                aria-selected={i === active}
                onClick={onClose}
              >
                <div className="g-search-thumb">
                  <ProductVisual image={p.image} layers={p.layers} alt="" />
                </div>
                <div>
                  <b>{p.name}</b>
                  <br />
                  <span>
                    {p.firmness} feel, from {money(p.basePrice)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="g-search-hint">
            Nothing matches “{q}”. We only make three mattresses — <Link href="/compare" className="g-link" onClick={onClose}>see them side by side</Link>.
          </p>
        )}
      </div>
    </div>
  );
}

function MobileDock({ pathname, count, onCart }: { pathname: string; count: number; onCart: () => void }) {
  const at = (p: string, exact = false) => (exact ? pathname === p : pathname.startsWith(p)) ? "page" : undefined;
  return (
    <nav className="g-dock" aria-label="App">
      <Link href="/" aria-current={at("/", true)}>
        <IconHome />
        <span>Home</span>
      </Link>
      <Link href="/mattresses" aria-current={at("/mattresses") || at("/compare")}>
        <IconGrid />
        <span>Shop</span>
      </Link>
      <Link href="/sleep-quiz" aria-current={at("/sleep-quiz")}>
        <IconQuiz />
        <span>Quiz</span>
      </Link>
      <Link href="/account" aria-current={at("/account") || at("/wishlist") || at("/track-order")}>
        <IconUser />
        <span>You</span>
      </Link>
      <button type="button" onClick={onCart} aria-label={`Cart, ${count} items`}>
        <IconCart />
        <span>Cart</span>
        {count ? <span className="g-badge">{count}</span> : null}
      </button>
    </nav>
  );
}
