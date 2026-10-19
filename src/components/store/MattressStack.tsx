import type { CSSProperties } from "react";
import type { MattressLayer } from "@/lib/catalog";

/*
  The brand picture: the actual layers of a GADDA, stacked. Used in the
  hero (exploded, labelled), on product cards and on product pages, so
  every mattress is shown by what's really inside it.
*/

/* Real layer photos (transparent, same camera angle): public/layers/real/ */
const ART = {
  cover: "/layers/real/cover.webp",
  white: "/layers/real/foam-white.webp",
  grey: "/layers/real/foam-grey.webp",
  latex: "/layers/real/latex.webp",
} as const;

export function artFor(layer: Pick<MattressLayer, "visualKind" | "name"> & { visualAsset?: string }): string {
  // a PNG uploaded for this layer in Admin → Products → Layers wins
  if (layer.visualAsset?.trim()) return layer.visualAsset.trim();
  const kind = layer.visualKind && layer.visualKind !== "auto" ? layer.visualKind : "";
  const n = layer.name.toLowerCase();
  if (kind === "fabric" || n.includes("cover") || n.includes("fabric")) return ART.cover;
  if (kind === "latex" || n.includes("latex")) return ART.latex;
  if (["hd", "hr", "spring", "zoned", "core"].includes(kind) || /\b(hd|hr|base|spring|support)\b/.test(n)) return ART.grey;
  return ART.white;
}

/* photo canvas: 1448 × 1086, the slab sits between y≈255 and y≈960 */
const CW = 1448;
const CH = 1086;
const Y0 = 255;
const Y1 = 960;
const SLAB_MID = 0.53;

type Props = {
  layers: Pick<MattressLayer, "name" | "description" | "visualKind" | "material" | "visualAsset">[];
  /* vertical spacing between layers, as % of the slab height */
  spread?: "tight" | "open" | "exploded";
  labels?: boolean;
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
};

const STEP = { tight: 120, open: 190, exploded: 250 };

export default function MattressStack({
  layers,
  spread = "tight",
  labels = false,
  animate = false,
  className = "",
  style,
}: Props) {
  const step = STEP[spread] + (labels ? 60 : 0);
  const n = Math.max(1, layers.length);
  const span = (n - 1) * step + (Y1 - Y0); // visible height in canvas px
  const imgW = labels ? 0.66 : 1;

  return (
    <div
      className={`g-mstack g-mstack--real ${labels ? "g-mstack--labelled" : ""} ${className}`}
      style={{ position: "relative", width: "100%", aspectRatio: `${CW} / ${(span * imgW).toFixed(1)}`, ...style }}
      role="img"
      aria-label={`Layers, top to bottom: ${layers.map((l) => l.name).join(", ")}`}
    >
      {layers.map((layer, i) => {
        const top = ((i * step - Y0) / span) * 100;
        return (
          <div
            key={`${layer.name}-${i}`}
            className="g-mstack-layer"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${top}%`,
              height: `${(CH / span) * 100}%`,
              zIndex: n - i,
              ["--i" as string]: i,
              ["--n" as string]: n,
              animationDelay: animate ? `${(n - i) * 110}ms` : undefined,
            }}
            data-animate={animate || undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={artFor(layer)} alt="" width={CW} height={CH} loading={animate ? "eager" : "lazy"} decoding="async" />
            {labels ? (
              <span className="g-stack-label" style={{ top: `${SLAB_MID * 100}%`, transform: "translateY(-50%)" }} aria-hidden="true">
                <b>{layer.name}</b>
                <span>{layer.description}</span>
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
