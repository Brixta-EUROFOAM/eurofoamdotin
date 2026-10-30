import MattressStack from "@/components/store/MattressStack";
import type { MattressLayer } from "@/lib/catalog";

/* The product's main photo, filling its box. Falls back to the drawn layer stack only when there's no photo yet. */
export default function ProductVisual({
  image,
  layers,
  alt,
  spread = "open",
  focus,
}: {
  image?: string;
  layers: Pick<MattressLayer, "name" | "visualKind" | "description">[];
  alt: string;
  spread?: "tight" | "open" | "exploded";
  focus?: "top" | "center" | "bottom";
}) {
  const real = image && !image.includes("unsplash.com");
  if (real) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        className="g-pv"
        src={image}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={focus ? { objectPosition: `center ${focus}` } : undefined}
      />
    );
  }
  return <MattressStack layers={layers} spread={spread} />;
}
