"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useCart } from "@/components/CartProvider";
import { useLocation, PinMessage } from "@/components/store/LocationProvider";
import WishlistButton from "@/components/WishlistButton";
import { IconMoon, IconRupee, IconShield, IconTruck } from "@/components/store/Icons";
import { money, type Mattress } from "@/lib/catalog";
import { SIZE_GROUPS, groupsOf, parseCustom, type SizeRow, type Sizing } from "@/lib/sizes";
import SizePicker from "@/components/store/SizePicker";

type Props = {
  mattress: Mattress;
  trialNights: number;
  warranty: string;
  sizing: Sizing;
};

function defaultSize(rows: SizeRow[]) {
  const q = SIZE_GROUPS.find((g) => g.id === "Queen")!.common;
  return (rows.find((r) => r.length === q[0] && r.width === q[1]) || rows[Math.min(2, rows.length - 1)] || rows[0])?.label;
}

export default function ProductBuyBox({ mattress, trialNights, warranty, sizing }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const { info, eta, pin, check, loading, askOnce } = useLocation();
  const [size, setSize] = useState(() => defaultSize(mattress.sizes as SizeRow[]));
  const [customAdd, setCustomAdd] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [picker, setPicker] = useState<{ open: boolean; group?: string; then?: "add" | "buy" }>({ open: false });
  const groups = useMemo(() => groupsOf(mattress.sizes as SizeRow[]), [mattress.sizes]);
  const [height, setHeight] = useState(mattress.heights[0]?.label);
  const [picked, setPicked] = useState<Record<string, string>>(() =>
    Object.fromEntries((mattress.options || []).map((o) => [o.id, o.choices[0]?.label]))
  );
  const [qty, setQty] = useState(1);
  const [pinInput, setPinInput] = useState(pin);
  const [showSticky, setShowSticky] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => setPinInput(pin), [pin]);
  useEffect(() => askOnce(), [askOnce]);
  // ?variant=true opens the size chooser straight away (link it from ads, WhatsApp…)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("variant") === "true") setPicker({ open: true });
  }, []);

  // Sticky buy bar once the main button scrolls away.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const sizeRow = mattress.sizes.find((s) => s.label === size) || (parseCustom(size || "") ? { label: size!, priceAdd: customAdd } : undefined);
  const sizeGroup = (mattress.sizes as SizeRow[]).find((s) => s.label === size)?.group || (parseCustom(size || "") ? "Custom" : "");
  const heightRow = mattress.heights.find((h) => h.label === height);
  const optionRows = (mattress.options || []).map((o) => o.choices.find((c) => c.label === picked[o.id]) || o.choices[0]);
  const variant = optionRows.map((c) => c?.label).filter(Boolean).join(" · ");
  const unit =
    mattress.basePrice + (sizeRow?.priceAdd || 0) + (heightRow?.priceAdd || 0) + optionRows.reduce((s, c) => s + (c?.priceAdd || 0), 0);

  const item = useMemo(
    () => ({
      id: `${mattress.slug}-${size}-${height}${variant ? `-${variant}` : ""}`,
      slug: mattress.slug,
      name: mattress.name,
      image: mattress.image,
      size: size || "",
      height: height || "",
      variant: variant || undefined,
      price: unit,
      quantity: qty,
    }),
    [mattress, size, height, variant, unit, qty]
  );

  function add() {
    if (!confirmed) return setPicker({ open: true, then: "add" });
    addItem(item);
  }

  function buyNow() {
    if (!confirmed) return setPicker({ open: true, then: "buy" });
    addItem(item, { open: false });
    router.push("/checkout");
  }

  async function submitPin(e: FormEvent) {
    e.preventDefault();
    await check(pinInput);
  }

  return (
    <div className="g-buy">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
        <div>
          <span className="g-chip g-chip--orange">{mattress.kicker}</span>
          <h1>{mattress.name}</h1>
        </div>
        <WishlistButton
          mattress={{ slug: mattress.slug, name: mattress.name, image: mattress.image, kicker: mattress.kicker, basePrice: mattress.basePrice }}
        />
      </div>
      <p className="g-buy-sub">{mattress.shortDescription}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <span className="g-chip">{mattress.firmness} feel</span>
        <span className="g-chip">{mattress.layers.length} layers</span>
        {mattress.reviews > 0 && mattress.rating > 0 ? (
          <a href="#reviews" className="g-chip" style={{ textDecoration: "none" }}>
            ★ {mattress.rating.toFixed(1)} from {mattress.reviews} reviews
          </a>
        ) : null}
      </div>

      <div className="g-buy-price" aria-live="polite">
        <b>{money(unit)}</b>
        {mattress.compareAt > mattress.basePrice ? <s style={{ color: "var(--g-ink-3)" }}>{money(mattress.compareAt + (unit - mattress.basePrice))}</s> : null}
        <small>Inclusive of all taxes. Delivery included.</small>
      </div>

      <section className="g-buy-block" aria-labelledby="size-h">
        <div>
          <h2 id="size-h">Choose size</h2>
          <Link href="/size-guide" className="g-link" style={{ fontSize: ".88rem" }} target="_blank">
            Size guide
          </Link>
        </div>
        <button type="button" className="g-size-current" onClick={() => setPicker({ open: true })} aria-haspopup="dialog">
          <span>
            <small>{confirmed ? "Your size" : "Selected"}</small>
            <b>{(size || "").replace(/ in$/, '"')}</b>
            <span>
              {height} thick{confirmed ? " · confirmed ✓" : ""}
            </span>
          </span>
          <span className="g-size-change">Change ›</span>
        </button>
        <div className="g-size-groups" aria-label="Size groups">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={sizeGroup === g.id}
              onClick={() => setPicker({ open: true, group: g.id })}
            >
              {g.id}
            </button>
          ))}
          {sizing.customEnabled ? (
            <button type="button" aria-pressed={sizeGroup === "Custom"} onClick={() => setPicker({ open: true, group: "Custom" })}>
              Custom
            </button>
          ) : null}
        </div>
        <p className="g-size-tip">
          📏 Measure the <b>inside of your bed frame</b>, not your old mattress.{" "}
          <button type="button" className="g-link" onClick={() => setPicker({ open: true })}>
            How to measure
          </button>
        </p>
      </section>

      {(mattress.options || []).map((option) => (
        <section className="g-buy-block" key={option.id} aria-labelledby={`opt-${option.id}`}>
          <div>
            <h2 id={`opt-${option.id}`}>
              {option.label} <span>{picked[option.id]}</span>
            </h2>
          </div>
          <div className="g-choices" role="radiogroup" aria-labelledby={`opt-${option.id}`} style={{ gridTemplateColumns: "1fr 1fr" }}>
            {option.choices.map((c) => (
              <button
                key={c.label}
                type="button"
                role="radio"
                aria-checked={picked[option.id] === c.label}
                className="g-choice"
                onClick={() => setPicked((p) => ({ ...p, [option.id]: c.label }))}
              >
                <b>{c.label}</b>
                <small>{c.priceAdd ? `+ ${money(c.priceAdd)}` : "Included"}</small>
                {c.note ? <small>{c.note}</small> : null}
              </button>
            ))}
          </div>
        </section>
      ))}

      <div className="g-eta">
        <div className="g-eta-row">
          <span>
            <IconTruck width={18} height={18} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6, color: "var(--g-indigo)" }} />
            {info?.ok && eta ? (
              <>
                Arrives <strong>{eta}</strong> to {info.place?.city || info.pin}
              </>
            ) : (
              <>Check your delivery date</>
            )}
          </span>
        </div>
        <form onSubmit={submitPin}>
          <label htmlFor="pdp-pin" className="g-sr">
            PIN code
          </label>
          <input
            id="pdp-pin"
            className="g-input"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="Enter PIN code"
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <button type="submit" className="g-btn g-btn--sm" style={{ minHeight: 42 }} disabled={loading || pinInput.length !== 6} data-busy={loading || undefined}>
            {loading ? "Checking…" : info?.ok && pinInput === info.pin ? "Checked" : "Check"}
          </button>
        </form>
        {info && !info.ok ? <PinMessage info={info} eta={eta} /> : null}
      </div>

      <div className="g-buy-cta" ref={ctaRef}>
        <div className="g-qty" role="group" aria-label="Quantity" style={{ height: 52 }}>
          <button type="button" aria-label="One less" onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 44, height: 48 }}>
            −
          </button>
          <output aria-live="polite">{qty}</output>
          <button type="button" aria-label="One more" onClick={() => setQty((q) => Math.min(10, q + 1))} style={{ width: 44, height: 48 }}>
            +
          </button>
        </div>
        <button type="button" className="g-btn g-btn--block" onClick={add}>
          Add to cart, {money(unit * qty)}
        </button>
        <button type="button" className="g-btn g-btn--orange g-btn--block" style={{ gridColumn: "1 / -1" }} onClick={buyNow}>
          Buy now
        </button>
      </div>

      <div className="g-buy-perks">
        <div>
          <IconMoon />
          <div>
            <b>{trialNights} nights to decide</b>
            <span>
              Not right? We collect it and refund you. <Link href="/policies/trial" className="g-link">Trial terms</Link>
            </span>
          </div>
        </div>
        <div>
          <IconTruck />
          <div>
            <b>Delivery included</b>
            <span>Comes flat, not rolled. We call before dispatch.</span>
          </div>
        </div>
        <div>
          <IconRupee />
          <div>
            <b>Pay on delivery</b>
            <span>Cash or UPI at your door, or a UPI link once we confirm.</span>
          </div>
        </div>
        <div>
          <IconShield />
          <div>
            <b>{warranty}</b>
            <span>
              Covers sagging and manufacturing defects. <Link href="/policies/warranty" className="g-link">Details</Link>
            </span>
          </div>
        </div>
      </div>

      <SizePicker
        mattress={mattress}
        sizing={sizing}
        open={picker.open}
        startGroup={picker.group}
        initial={{ size: size || "", height: height || "" }}
        optionsAdd={optionRows.reduce((sum, c) => sum + (c?.priceAdd || 0), 0)}
        onClose={() => setPicker({ open: false })}
        onConfirm={(c) => {
          setSize(c.size);
          setHeight(c.height);
          setCustomAdd(parseCustom(c.size) ? c.sizeAdd : 0);
          setConfirmed(true);
          const then = picker.then;
          setPicker({ open: false });
          const next = { ...item, id: `${mattress.slug}-${c.size}-${c.height}${variant ? `-${variant}` : ""}`, size: c.size, height: c.height,
            price: mattress.basePrice + c.sizeAdd + (mattress.heights.find((h) => h.label === c.height)?.priceAdd || 0) + optionRows.reduce((sum, o) => sum + (o?.priceAdd || 0), 0) };
          if (then === "add") addItem(next);
          if (then === "buy") {
            addItem(next, { open: false });
            router.push("/checkout");
          }
        }}
      />

      <div className="g-sticky-buy" data-show={showSticky} aria-hidden={!showSticky}>
        <div className="g-wrap">
          <div className="g-sticky-buy-info">
            <b>{money(unit * qty)}</b>
            <span>
              {mattress.name}, {size}, {height}
            </span>
          </div>
          <button type="button" className="g-btn g-btn--orange" onClick={add} tabIndex={showSticky ? 0 : -1}>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
