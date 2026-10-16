import type { CSSProperties } from "react";
import type { MattressLayer } from "@/lib/catalog";

/*
  The brand picture: the actual layers of a GADDA, stacked. Used in the
  hero (exploded, labelled), on product cards and on product pages, so
  every mattress is shown by what's really inside it.
*/

const ART = {
  cover: "/layers/gadda/cover.webp",
  comfort: "/layers/gadda/comfort.webp",
  support: "/layers/gadda/support.webp",
  base: "/layers/gadda/base.webp",
} as const;

export function artFor(layer: Pick<MattressLayer, "visualKind" | "name">): string {
  const kind = layer.visualKind && layer.visualKind !== "auto" ? layer.visualKind : "";
  const n = layer.name.toLowerCase();
  if (kind === "fabric" || n.includes("cover") || n.includes("fabric")) return ART.cover;
  if (kind === "hd" || n.includes("hd ") || n === "hd foam" || n.includes("base")) return ART.base;
  if (kind === "hr" || kind === "spring" || kind === "zoned" || kind === "core" || n.includes("hr") || n.includes("spring"))
    return ART.support;
  return ART.comfort;
}

type Props = {
  layers: Pick<MattressLayer, "name" | "description" | "visualKind" | "material">[];
  /* vertical spacing between layers, as % of the slab height */
  spread?: "tight" | "open" | "exploded";
  labels?: boolean;
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
};

const STEP = { tight: 34, open: 62, exploded: 96 };

export default function MattressStack({
  layers,
  spread = "tight",
  labels = false,
  animate = false,
  className = "",
  style,
}: Props) {
  // Labelled stacks need a little more air so the tags never collide.
  const step = STEP[spread] + (labels ? 22 : 0);
  // Each slab image is ~16% as tall as it is wide (1200×193).
  const slab = 16.1;
  const total = slab + (layers.length - 1) * slab * (step / 100);

  return (
    <div
      className={`g-mstack ${className}`}
      style={{ position: "relative", width: "100%", aspectRatio: `100 / ${total.toFixed(2)}`, ...style }}
      role="img"
      aria-label={`Layers, top to bottom: ${layers.map((l) => l.name).join(", ")}`}
    >
      {layers.map((layer, i) => {
        const top = (i * slab * (step / 100) * 100) / total;
        return (
          <div
            key={`${layer.name}-${i}`}
            className="g-mstack-layer"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${top}%`,
              zIndex: layers.length - i,
              ["--i" as string]: i,
              ["--n" as string]: layers.length,
              animationDelay: animate ? `${(layers.length - i) * 110}ms` : undefined,
            }}
            data-animate={animate || undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={artFor(layer)} alt="" width={1200} height={193} loading={animate ? "eager" : "lazy"} decoding="async" />
            {labels ? (
              <span className="g-stack-label" style={{ top: "18%" }} aria-hidden="true">
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
