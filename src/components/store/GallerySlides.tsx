import MattressStack from "@/components/store/MattressStack";
import Stamp from "@/components/store/Stamp";
import LayerScene, { layerSwatch } from "@/components/store/LayerScene";
import type { Mattress } from "@/lib/catalog";
import { SIZE_GROUPS } from "@/lib/sizes";

/*
  Product "images" drawn from the product's own data, so every mattress
  gets Wakefit-style gallery slides without a photo shoot:
    inside   — the layers, exploded, with what each one is
    trial    — the N-night trial stamp
    sizes    — every size to scale, top view
    delivery — comes flat, delivered, pay on delivery
  They scale like pictures (container units), so they work as big slides
  and as tiny thumbnails. Turn each on/off per product in Admin → Products.
*/

export type AutoSlide = "cutaway" | "inside" | "trial" | "sizes" | "delivery";
export const AUTO_SLIDES: { id: AutoSlide; label: string }[] = [
  { id: "cutaway", label: "3D cutaway (layers peeling up)" },
  { id: "inside", label: "What's inside (layer breakdown)" },
  { id: "trial", label: "Trial nights" },
  { id: "sizes", label: "Sizes to scale" },
  { id: "delivery", label: "Delivery & payment" },
];

type P = { mattress: Mattress; trialNights: number; customSizes?: boolean };

/* "1″ 32 density HR foam" — thickness and density from Admin, without repeating the name */
export function calloutTitle(l: Mattress["layers"][number]) {
  const t = l.thickness?.match(/(\d+(?:\.\d+)?)/)?.[1];
  const d = (l.density || "").replace(/\D/g, "");
  const showD = d && !new RegExp(`\\b${d}\\s*d(ensity)?\\b`, "i").test(l.name);
  return [t ? `${t}″` : "", showD ? `${d} density` : "", l.name].filter(Boolean).join(" ");
}

export function CutawaySlide({ mattress }: P) {
  return (
    <div className="g-slide">
      <LayerScene layers={mattress.layers} name={mattress.name} kicker={mattress.kicker} tagline={mattress.shortDescription} mode="peel" />
    </div>
  );
}

export function InsideSlide({ mattress }: P) {
  // Uploaded layer PNGs (Admin → Layers) keep the picture stack; otherwise the 3D exploded view.
  const custom = mattress.layers.some((l) => l.visualAsset?.trim());
  return (
    <div className={`g-slide g-slide--inside ${custom ? "" : "g-slide--inside3d"}`}>
      {custom ? (
        <div className="g-slide-stack">
          <MattressStack layers={mattress.layers} spread="exploded" />
        </div>
      ) : (
        <div className="g-slide-scene">
          <LayerScene layers={mattress.layers} name={mattress.name} mode="exploded" />
        </div>
      )}
      <ol className="g-slide-callouts">
        {mattress.layers.map((l, i) => (
          <li key={i}>
            <i className="g-slide-chip" style={{ background: layerSwatch(l) }} aria-hidden="true" />
            <b>{calloutTitle(l)}</b>
            <span>{l.description}</span>
          </li>
        ))}
      </ol>
      <span className="g-slide-tag">{mattress.name} · top to bottom</span>
    </div>
  );
}

export function TrialSlide({ mattress, trialNights }: P) {
  return (
    <div className="g-slide g-slide--trial">
      <span className="g-slide-disc">
        <Stamp className="g-slide-stamp" ring="Sleep on it at home" center={String(trialNights)} sub="nights" tone="rust" size={200} rotate={-10} />
      </span>
      <div className="g-slide-copy">
        <b>{trialNights} nights in your own bed.</b>
        <span>Not right for you? We pick it up and refund you.</span>
        <small>{mattress.name}</small>
      </div>
    </div>
  );
}

export function SizesSlide({ mattress, customSizes }: P) {
  const groups = SIZE_GROUPS.filter((g) => mattress.sizes.some((s) => (s.group || s.label.split(" ")[0]) === g.id));
  return (
    <div className="g-slide g-slide--sizes">
      <div className="g-slide-head">
        <b>Every size, to scale</b>
        <span>Top view · length × breadth in inches</span>
      </div>
      <div className="g-slide-beds">
        {groups.map((g) => {
          const [l, w] = g.common;
          return (
            <figure key={g.id}>
              <span className="g-slide-bed" style={{ width: `${(w / 72) * 100}%`, aspectRatio: `${w} / ${l}` }}>
                <i />
              </span>
              <figcaption>
                <b>{g.id}</b>
                {l} × {w}
              </figcaption>
            </figure>
          );
        })}
      </div>
      {customSizes ? <span className="g-slide-tag">or any custom size, cut to fit</span> : null}
    </div>
  );
}

export function DeliverySlide({ mattress }: P) {
  return (
    <div className="g-slide g-slide--delivery">
      <div className="g-slide-head">
        <b>From our floor to your door</b>
        <span>{mattress.name}</span>
      </div>
      <ul className="g-slide-list">
        <li>
          <b>Comes flat</b>
          <span>Not rolled in a box. Sleep on it the same night.</span>
        </li>
        <li>
          <b>Delivery included</b>
          <span>In the price. We call before we dispatch.</span>
        </li>
        <li>
          <b>Pay on delivery</b>
          <span>Cash or UPI at your door.</span>
        </li>
      </ul>
    </div>
  );
}

export function AutoSlideView({ kind, ...p }: P & { kind: AutoSlide }) {
  if (kind === "cutaway") return <CutawaySlide {...p} />;
  if (kind === "inside") return <InsideSlide {...p} />;
  if (kind === "trial") return <TrialSlide {...p} />;
  if (kind === "sizes") return <SizesSlide {...p} />;
  return <DeliverySlide {...p} />;
}
