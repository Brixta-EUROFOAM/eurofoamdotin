"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Mattress, MattressLayer } from "@/lib/catalog";
import { layersWithChoices } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";

const fallbackLayers: StageLayer[] = [
  {
    number: "01",
    name: "AirKnit Cover",
    description: "Soft-touch breathable top fabric.",
    asset: "/layers/euro-align/layer-1.png",
  },
  {
    number: "02",
    name: "Relief Foam",
    description: "Contours without a deep sink.",
    asset: "/layers/euro-align/layer-2.png",
  },
  {
    number: "03",
    name: "Support Grid Foam",
    description: "Zoned response through the torso and hips.",
    asset: "/layers/euro-align/layer-3.png",
  },
  {
    number: "04",
    name: "Stability Core",
    description: "Dense base foam for edge-to-edge support.",
    asset: "/layers/euro-align/layer-4.png",
  },
];

const tierNames = ["REGULAR", "PRO", "ULTIMATE"];

type StageLayer = {
  number: string;
  name: string;
  description: string;
  asset: string;
  filter?: string;
  spring?: boolean;
  material?: string;
  density?: string;
  thickness?: string;
};

/* The four existing layer renders, re-tinted per material. */
const LAYER_ART: Record<string, { asset: string; filter?: string }> = {
  fabric: { asset: "/layers/euro-align/layer-1.png" },
  foam: { asset: "/layers/euro-align/layer-2.png" },
  memory: { asset: "/layers/euro-align/layer-2.png", filter: "sepia(.35) saturate(1.5) hue-rotate(-14deg) brightness(.9)" },
  cool: { asset: "/layers/euro-align/layer-2.png", filter: "hue-rotate(165deg) saturate(.75) brightness(1.06)" },
  latex: { asset: "/layers/euro-align/layer-2.png", filter: "saturate(.45) brightness(1.14)" },
  adaptive: { asset: "/layers/euro-align/layer-3.png" },
  zoned: { asset: "/layers/euro-align/layer-3.png" },
  hd: { asset: "/layers/euro-align/layer-4.png", filter: "brightness(2.4) contrast(.85)" },
  hr: { asset: "/layers/euro-align/layer-4.png" },
  core: { asset: "/layers/euro-align/layer-4.png" },
};

function kindOf(layer: MattressLayer) {
  if (layer.visualKind && layer.visualKind !== "auto") return layer.visualKind;
  const n = layer.name.toLowerCase();
  if (n.includes("spring")) return "spring";
  if (n.includes("latex")) return "latex";
  if (n.includes("cool")) return "cool";
  if (n.includes("memory")) return "memory";
  if (n.includes("cover") || n.includes("fabric")) return "fabric";
  if (n.includes("hr")) return "hr";
  if (n.includes("hd")) return "hd";
  return "foam";
}

function toStage(list: MattressLayer[]): StageLayer[] {
  return list.map((layer, i) => {
    const kind = kindOf(layer);
    const art = LAYER_ART[kind] || LAYER_ART.foam;
    return {
      number: String(i + 1).padStart(2, "0"),
      name: layer.name,
      description: layer.description,
      asset: layer.visualAsset || art.asset,
      filter: art.filter,
      spring: kind === "spring",
      material: layer.material,
      density: layer.density,
      thickness: layer.thickness,
    };
  });
}

function SpringArt() {
  return (
    <svg viewBox="0 0 540 120" className="gp-spring" aria-hidden="true">
      <rect x="6" y="10" width="528" height="100" rx="22" fill="#1d1d1d" stroke="#3a3a3a" />
      {Array.from({ length: 13 }).map((_, i) => {
        const x = 34 + i * 39;
        return (
          <path
            key={i}
            d={`M${x} 22 q14 6 0 12 q-14 6 0 12 q14 6 0 12 q-14 6 0 12 q14 6 0 12 q-14 6 0 12 q14 6 0 12`}
            fill="none"
            stroke="#FF6500"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/* The layer recipe in plain words, e.g. "Memory foam + Soft foam + 32D HR foam". */
function recipe(product: Mattress) {
  return product.layers
    .filter((l) => l.visualKind !== "fabric" && !/cover/i.test(l.name))
    .map((l) => l.name)
    .join(" + ");
}

function TierCard({ product, index }: { product: Mattress; index: number }) {
  const { addItem } = useCart();
  const sizes = product.sizes || [];
  const [size, setSize] = useState(sizes[1]?.label || sizes[0]?.label || "");
  const [added, setAdded] = useState(false);
  const height = product.heights?.[0]?.label || "";
  const price =
    product.basePrice + (sizes.find((s) => s.label === size)?.priceAdd || 0);
  const upgrade = product.options?.[0]?.choices.find((c) => c.priceAdd > 0);

  function add() {
    addItem({
      id: `${product.slug}-${size}-${height}`,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size,
      height,
      price,
      quantity: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className={index === 1 ? "gadda-tier-card gp-tier is-pick" : "gadda-tier-card gp-tier"}>
      {index === 1 ? <span className="gp-pick">Most people pick this</span> : null}
      <div className="gadda-tier-card-top">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <small>{product.kicker}</small>
      </div>
      <Link href={`/mattresses/${product.slug}`} className="gadda-tier-image">
        <img src={product.image} alt={product.name} />
      </Link>
      <div className="gadda-tier-copy">
        <h3>
          <Link href={`/mattresses/${product.slug}`}>{product.badge || tierNames[index]}</Link>
        </h3>
        <p className="gp-recipe">{recipe(product)}</p>
        {upgrade ? (
          <p className="gp-upgrade">
            or {upgrade.label.toLowerCase()} · +{money(upgrade.priceAdd)}
          </p>
        ) : (
          <p className="gp-upgrade">No upgrades needed. That&apos;s the point.</p>
        )}

        <div className="gp-sizes" role="group" aria-label={`${product.name} size`}>
          {sizes.map((s) => (
            <button
              key={s.label}
              type="button"
              className={s.label === size ? "is-on" : ""}
              onClick={() => setSize(s.label)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="gp-price">
          <strong>{money(price)}</strong>
          <span>
            {size} · {height} · about ₹{Math.round(price / 1000)} a night for your first 1,000 nights
          </span>
        </div>

        <div className="gp-actions">
          <button type="button" className="gp-add" onClick={add}>
            {added ? "Added ✓" : "Add to cart"}
          </button>
          <Link href={`/mattresses/${product.slug}`} className="gp-details">
            Details →
          </Link>
        </div>
      </div>
    </article>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function clamp(n: number) {
  return Math.max(0, Math.min(1, n));
}

function easeOutCubic(n: number) {
  return 1 - Math.pow(1 - n, 3);
}

export default function ExplodedLayers({
  products = [],
}: {
  products?: Mattress[];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const manualUntil = useRef(0);

  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);

  const showcase = products.slice(0, 3);
  const [tier, setTier] = useState(Math.min(1, Math.max(0, showcase.length - 1)));
  const [picked, setPicked] = useState<Record<string, Record<string, string>>>({});
  const current = showcase[tier];
  const choices = (current && picked[current.slug]) || {};
  const layers: StageLayer[] = current
    ? toStage(layersWithChoices(current, choices))
    : fallbackLayers;
  const layerCount = useRef(layers.length);
  layerCount.current = layers.length;

  const focusLayer = useCallback((index: number) => {
    manualUntil.current = Date.now() + 1800;
    setActive(index);
  }, []);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;

      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      const travel = Math.max(1, rect.height - vh);

      const raw = clamp(
        -rect.top / travel
      );

      const eased = easeOutCubic(raw);

      setProgress(eased);

      if (Date.now() > manualUntil.current) {
        const index = Math.min(
          layerCount.current - 1,
          Math.floor(
            clamp(raw * 1.04) *
              layerCount.current
          )
        );

        setActive(index);
      }
    };

    const request = () => {
      if (!raf) {
        raf = requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener(
      "scroll",
      request,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      request
    );

    return () => {
      window.removeEventListener(
        "scroll",
        request
      );

      window.removeEventListener(
        "resize",
        request
      );

      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  /*
    Start almost assembled.
    Spread dramatically as the user moves through
    the pinned orange section.
  */

  const spread =
    10 + progress * 116;

  const act = Math.min(active, layers.length - 1);

  return (
    <section
      id="inside"
      className="gadda-explode"
    >

      <div className="gadda-tier-showcase">
        <div className="gadda-tier-head">
          <div>
            <p>THE SHORTLIST / 03</p>
            <h2>REGULAR.<br />PRO.<br />ULTIMATE.</h2>
          </div>
          <div className="gadda-tier-head-copy">
            <strong>THREE OPTIONS.<br />NO CATALOGUE MAZE.</strong>
            <p>Three mattresses. Real materials, written in plain words. Pick the one that fits the job.</p>
          </div>
        </div>

        <div className="gadda-tier-grid">
          {showcase.map((product, index) => (
            <TierCard key={product.slug} product={product} index={index} />
          ))}
        </div>

        <div className="gadda-tier-divider">
          <span>PRODUCT CHOICE</span>
          <span>NOW SEE WHAT&apos;S INSIDE ↓</span>
        </div>
      </div>

      <div ref={sectionRef} className="gadda-explode-track">

      <div className="gadda-explode-sticky">

        {/* =========================================
            LEFT — EDITORIAL STORY
        ========================================== */}

        <div className="gadda-explode-copy">

          <p className="gadda-explode-label">
            03 / WHAT&apos;S INSIDE
          </p>

          <h2>
            NO
            <br />
            BLACK
            <br />
            BOX.
          </h2>

          <p className="gadda-explode-intro">
            Mattress layers should not be
            mystery ingredients.
            <br /><br />
            Pick a Gadda. Here&apos;s the whole thing.
          </p>

          {showcase.length ? (
            <div className="gp-nbb-tabs" role="tablist" aria-label="Choose a mattress">
              {showcase.map((p, i) => (
                <button
                  key={p.slug}
                  type="button"
                  role="tab"
                  aria-selected={i === tier}
                  className={i === tier ? "is-on" : ""}
                  onClick={() => {
                    setTier(i);
                    focusLayer(0);
                  }}
                >
                  {p.badge || tierNames[i]}
                </button>
              ))}
            </div>
          ) : null}

          {(current?.options || []).map((option) => (
            <div className="gp-nbb-option" key={option.id}>
              <span>{option.label}</span>
              <div>
                {option.choices.map((c) => {
                  const on = (choices[option.id] || option.choices[0]?.label) === c.label;
                  return (
                    <button
                      key={c.label}
                      type="button"
                      className={on ? "is-on" : ""}
                      onClick={() =>
                        current &&
                        setPicked((prev) => ({
                          ...prev,
                          [current.slug]: { ...(prev[current.slug] || {}), [option.id]: c.label },
                        }))
                      }
                    >
                      {c.label}
                      {c.priceAdd > 0 ? ` +${money(c.priceAdd)}` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="gadda-explode-scroll">
            <span>
              SCROLL TO PULL IT APART
            </span>

            <div>
              <i
                style={{
                  transform:
                    `scaleX(${progress})`,
                }}
              />
            </div>
          </div>

        </div>


        {/* =========================================
            CENTRE — EXPLODING MATTRESS
        ========================================== */}

        <div className="gadda-explode-stage">

          <div className="gadda-explode-stage-top">

            <span>
              {current ? current.name.toUpperCase() : "MATTRESS / 01"}
            </span>

            <span>
              EXPLODED VIEW
            </span>

          </div>


          <div className="gadda-layer-stack">

            <div className="gadda-layer-axis" />

            {layers.map(
              (layer, index) => {

                /*
                  Layer zero is topmost.

                  Bottom layers move less.
                  Upper layers travel further upward.
                */

                const reverseIndex =
                  layers.length -
                  index -
                  1;

                const y =
                  -reverseIndex *
                  spread;

                const isActive =
                  index === act;

                const x =
                  isActive
                    ? 20
                    : 0;

                const scale =
                  isActive
                    ? 1.045
                    : 1;

                return (
                  <button
                    key={layer.number}
                    type="button"
                    className={
                      "gadda-layer " +
                      (
                        isActive
                          ? "is-active"
                          : ""
                      )
                    }
                    style={{
                      zIndex:
                        20 - index,

                      transform:
                        `translateX(calc(-50% + ${x}px)) ` +
                        `translateY(${y}px) ` +
                        `scale(${scale})`,
                    }}
                    onClick={() =>
                      focusLayer(index)
                    }
                  >

                    {layer.spring ? (
                      <SpringArt />
                    ) : (
                      <img
                        src={layer.asset}
                        alt={layer.name}
                        draggable={false}
                        style={layer.filter ? { filter: layer.filter } : undefined}
                      />
                    )}

                    <span className="gadda-layer-dot" />

                  </button>
                );
              }
            )}

          </div>


          <div className="gadda-layer-caption">
            <span>
              CLICK A LAYER
            </span>

            <strong>
              {layers[act].number}
            </strong>
          </div>

        </div>


        {/* =========================================
            RIGHT — ACTIVE LAYER INFORMATION
        ========================================== */}

        <div className="gadda-explode-info">

          <div className="gadda-explode-number">
            {layers[act].number}
          </div>


          <div
            key={`${current?.slug}-${act}`}
            className="gadda-explode-active"
          >

            <p>
              MATERIAL LAYER
            </p>

            <h3>
              {layers[act].name}
            </h3>

            <div className="gadda-explode-callout">

              <span />

              <p>
                {layers[act].description}
              </p>

            </div>

            {layers[act].material || layers[act].density || layers[act].thickness ? (
              <dl className="gp-spec">
                {layers[act].material ? (
                  <div>
                    <dt>Material</dt>
                    <dd>{layers[act].material}</dd>
                  </div>
                ) : null}
                {layers[act].density ? (
                  <div>
                    <dt>Density</dt>
                    <dd>{layers[act].density}</dd>
                  </div>
                ) : null}
                {layers[act].thickness ? (
                  <div>
                    <dt>Thickness</dt>
                    <dd>{layers[act].thickness}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

          </div>


          <div className="gadda-layer-picker">

            {layers.map(
              (layer, index) => (
                <button
                  key={layer.number}
                  type="button"
                  onClick={() =>
                    focusLayer(index)
                  }
                  className={
                    index === act
                      ? "is-active"
                      : ""
                  }
                >

                  <span>
                    {layer.number}
                  </span>

                  <strong>
                    {layer.name}
                  </strong>

                  {layer.density ? <em className="gp-pick-density">{layer.density}</em> : null}

                </button>
              )
            )}

          </div>

        </div>

      </div>

      </div>

    </section>
  );
}
