import type { CSSProperties } from "react";
import type { MattressLayer } from "@/lib/catalog";

/*
  Real 3D mattress, built in CSS (no images): a quilted base, foam blocks
  and the top layers peeling up like pages — the modern "product render"
  look. Drawn from the product's layers, so any configuration in Admin
  renders itself. Sized in container units, so it scales like a picture.

    mode="peel"      hero cutaway: cover + comfort layers curling up
    mode="exploded"  every layer floating apart, numbered
*/

type Layer = Pick<MattressLayer, "name" | "description" | "visualKind" | "thickness" | "density" | "material">;

function kindOf(l: Layer): string {
  const k = l.visualKind && l.visualKind !== "auto" ? l.visualKind : "";
  if (k) return k;
  const n = l.name.toLowerCase();
  if (n.includes("cover") || n.includes("fabric") || n.includes("knit")) return "fabric";
  if (n.includes("spring")) return "spring";
  if (n.includes("latex")) return "latex";
  if (n.includes("cool") || n.includes("gel")) return "cool";
  if (n.includes("memory")) return "memory";
  if (n.includes("hr")) return "hr";
  if (n.includes("hd") || n.includes("base")) return "hd";
  return "foam";
}

const speck = (c: string, size = 9) =>
  `radial-gradient(circle at 30% 40%, ${c} 0 0.7px, transparent 1.3px) 0 0 / ${size}px ${size}px, radial-gradient(circle at 70% 75%, ${c} 0 0.6px, transparent 1.2px) 0 0 / ${size + 4}px ${size + 3}px`;

/* top-face background, base colour */
const SKIN: Record<string, { top: string; base: string }> = {
  fabric: { top: "repeating-linear-gradient(118deg, #ecebe7 0 0.9cqw, #d9d7d2 0.9cqw 1.25cqw)", base: "#dedcd7" },
  memory: { top: `${speck("rgba(150,130,100,.35)")}, #efe9de`, base: "#e6dfd1" },
  cool: {
    top: "radial-gradient(60% 40% at 20% 30%, #e6f1fb 0 30%, transparent 60%), radial-gradient(50% 60% at 75% 60%, #2f74c9 0 25%, transparent 65%), radial-gradient(40% 30% at 45% 85%, #cfe3f7 0 30%, transparent 70%), linear-gradient(100deg, #6fa6e2, #3c84d6 45%, #93c1ee)",
    base: "#4f8dd4",
  },
  adaptive: { top: `${speck("rgba(80,70,110,.3)")}, #ddd7ea`, base: "#cfc8e0" },
  foam: { top: `${speck("rgba(150,120,50,.35)")}, #f2e2b3`, base: "#e8d59f" },
  hr: { top: `${speck("rgba(90,60,40,.35)", 8)}, #b8907a`, base: "#a98069" },
  hd: { top: `${speck("rgba(0,0,0,.35)", 8)}, #5d5b58`, base: "#52504d" },
  zoned: { top: `repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0 33%, transparent 33% 66%), ${speck("rgba(90,60,40,.35)", 8)}, #b8907a`, base: "#a98069" },
  core: { top: `${speck("rgba(90,60,40,.35)", 8)}, #b8907a`, base: "#a98069" },
  latex: { top: "radial-gradient(circle, rgba(140,120,80,.45) 0 1.2px, transparent 1.7px) 0 0 / 14px 13px, #f3e9cf", base: "#e9dcb9" },
  spring: { top: "repeating-linear-gradient(0deg, #3c3b39 0 2px, #4a4946 2px 4px), #444", base: "#3a3937" },
};

const COILS =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='60'%3E%3Cpath d='M13 0c11 5 11 10 0 15S2 25 13 30s11 10 0 15-11 10 0 15' fill='none' stroke='%23c9cdd2' stroke-width='2.4'/%3E%3C/svg%3E\") 0 50% / auto 100% repeat-x, #2f2e2c";

/* a small chip of a layer's material, for legends */
export function layerSwatch(l: Layer) {
  const sk = SKIN[kindOf(l)] || SKIN.foam;
  return kindOf(l) === "spring" ? COILS : sk.top;
}

const DEFAULT_IN: Record<string, number> = { fabric: 0.6, memory: 1, cool: 1, adaptive: 1, foam: 1, latex: 1.5, hr: 4, hd: 4, zoned: 4, core: 4, spring: 5 };
const inches = (t?: string) => {
  const m = t?.match(/(\d+(?:\.\d+)?)/);
  return m ? Math.min(10, Math.max(0.3, Number(m[1]))) : 0;
};

type Block = { l: Layer; kind: string; t: number; i: number };

function Box({ kind, h, z, inset = 0, n }: { kind: string; h: number; z: number; inset?: number; n?: number }) {
  const skin = SKIN[kind] || SKIN.foam;
  const side = kind === "spring" ? COILS : `linear-gradient(rgba(0,0,0,.06), rgba(0,0,0,.14)), ${skin.top}`;
  const box: CSSProperties = { inset: `${inset}%`, transform: `translateZ(${z}cqw)` };
  return (
    <div className="g-ls-box" style={box}>
      <div className="g-ls-top" style={{ background: skin.top, transform: `translateZ(${h}cqw)` }} />
      <div className="g-ls-front" style={{ height: `${h}cqw`, background: side }}>
        {n ? <span className="g-ls-num">{n}</span> : null}
      </div>
      <div className="g-ls-end" style={{ width: `${h}cqw`, background: `linear-gradient(90deg, rgba(0,0,0,.22), rgba(0,0,0,.3)), ${skin.base}` }} />
    </div>
  );
}

/* a thin layer that curls up from the back edge, built from bending strips */
function Peel({ kind, z, lift, start, strips = 18 }: { kind: string; z: number; lift: number; start: number; strips?: number }) {
  const skin = SKIN[kind] || SKIN.foam;
  const under = kind === "fabric" ? "linear-gradient(#cfccc6, #b3b0aa)" : `linear-gradient(rgba(0,0,0,.22), rgba(0,0,0,.22)), ${skin.base}`;
  // spread `lift` degrees of bend over the strips after `start`, easing in — a wide sweep, not a tight roll
  const w = Array.from({ length: strips }, (_, k) => {
    const t = (k + 0.5) / strips;
    return t < start ? 0 : Math.pow((t - start) / (1 - start), 0.9);
  });
  const sum = w.reduce((x, y) => x + y, 0) || 1;
  const node = (k: number): React.ReactNode => {
    if (k === strips) return null;
    const a = (lift * w[k]) / sum;
    return (
      <div className="g-ls-strip" style={{ top: k ? "100%" : 0, transform: `rotateX(${a.toFixed(2)}deg)` }}>
        <div className="g-ls-sface" style={{ background: skin.top, backgroundPositionY: `${-k * 100}%` }} />
        <div className="g-ls-sunder" style={{ background: under }} />
        {k === strips - 1 ? <div className="g-ls-sedge" style={{ background: skin.base }} /> : null}
        {node(k + 1)}
      </div>
    );
  };
  return (
    <div className="g-ls-peel" style={{ transform: `translateZ(${z}cqw)`, ["--strips" as string]: strips }}>
      {node(0)}
    </div>
  );
}

export default function LayerScene({
  layers,
  name,
  kicker,
  tagline,
  mode = "peel",
}: {
  layers: Layer[];
  name: string;
  kicker?: string;
  tagline?: string;
  mode?: "peel" | "exploded";
}) {
  const blocks: Block[] = layers.map((l, i) => {
    const kind = kindOf(l);
    return { l, kind, i, t: inches(l.thickness) || DEFAULT_IN[kind] || 1 };
  });
  const hasCover = blocks[0]?.kind === "fabric";
  const inner = hasCover ? blocks.slice(1) : blocks;
  const coreIn = inner.reduce((s, b) => s + b.t, 0) || 6;

  const k = (mode === "peel" ? 13 : 16) / coreIn; // cqw per inch
  const trayH = 1.6;

  // bottom → top
  const bottomUp = [...inner].reverse();
  // peel the top thin layers (≤ 2 inch each, max 2) plus the cover
  const peelable = mode === "peel" ? inner.filter((b, idx) => idx < 2 && b.t <= 2.5).length : 0;
  const flat = bottomUp.slice(0, bottomUp.length - peelable);
  const peeled = bottomUp.slice(bottomUp.length - peelable);

  const gap = mode === "exploded" ? 8 : 0;
  let z = trayH * (mode === "peel" ? 1 : 0.6);
  const flatPos = flat.map((b) => {
    const h = Math.max(0.8, b.t * k);
    const p = { b, z, h };
    z += h + gap;
    return p;
  });
  const peelPos = peeled.map((b) => {
    const p = { b, z: z + 0.15 };
    z += Math.max(0.5, b.t * k * 0.6) + 0.5;
    return p;
  });

  return (
    <div className={`g-ls g-ls--${mode}`} role="img" aria-label={`${name}: layers top to bottom — ${layers.map((l) => l.name).join(", ")}`}>
      <div className="g-ls-world">
        <div className="g-ls-shadow" />
        {/* quilted base (bottom of the zip cover) with piping and a sewn label */}
        <div className="g-ls-box" style={{ inset: 0 }}>
          <div className="g-ls-top g-ls-tray-top" style={{ transform: `translateZ(${trayH}cqw)` }} />
          <div className="g-ls-front g-ls-quilt" style={{ height: `${trayH + (mode === "peel" ? 1.4 : 0)}cqw` }}>
            <span className="g-ls-piping" />
          </div>
          <div className="g-ls-end g-ls-quilt g-ls-quilt--dark" style={{ width: `${trayH + (mode === "peel" ? 1.4 : 0)}cqw` }}>
            <span className="g-ls-brand">GADDA</span>
          </div>
        </div>

        {flatPos.map(({ b, z: zz, h }) => (
          <Box key={b.i} kind={b.kind} h={h} z={zz} inset={mode === "peel" ? 1.5 : 0} />
        ))}

        {mode === "exploded" && hasCover ? <Box kind="fabric" h={0.9} z={z + 1.6} /> : null}

        {peelPos.map(({ b, z: zz }, idx) => (
          <Peel key={b.i} kind={b.kind} z={zz} lift={34 + idx * 22} start={0.45 - idx * 0.08} />
        ))}
        {mode === "peel" && hasCover ? <Peel kind="fabric" z={z + 0.4} lift={98} start={0.26} /> : null}
      </div>

      {mode === "peel" ? (
        <>
          <div className="g-ls-title">
            {kicker ? <small>{kicker}</small> : null}
            <b>{name}</b>
          </div>
          {tagline ? <p className="g-ls-tagline">{tagline}</p> : null}
        </>
      ) : null}
    </div>
  );
}
