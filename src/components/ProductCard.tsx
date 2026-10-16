import Link from "next/link";
import WishlistButton from "@/components/WishlistButton";
import MattressStack from "@/components/store/MattressStack";
import { FeelScale } from "@/components/store/MegaMenu";
import { money, type Mattress } from "@/lib/catalog";
import { BUSINESS } from "@/lib/business";

export default function ProductCard({ mattress, highlight }: { mattress: Mattress; highlight?: string }) {
  const href = `/mattresses/${mattress.slug}`;
  const largest = Math.max(...mattress.sizes.map((s) => s.priceAdd)) + Math.max(...mattress.heights.map((h) => h.priceAdd));

  return (
    <article className="g-card">
      <div className="g-card-media" style={{ display: "grid", placeItems: "center", padding: "10% 9%" }}>
        <MattressStack layers={mattress.layers} spread="open" />
        <div className="g-card-tags">
          {highlight ? <span className="g-chip g-chip--orange">{highlight}</span> : null}
          <span className="g-chip">{mattress.firmness}</span>
        </div>
        <div className="g-card-wish">
          <WishlistButton
            mattress={{
              slug: mattress.slug,
              name: mattress.name,
              image: mattress.image,
              kicker: mattress.kicker,
              basePrice: mattress.basePrice,
            }}
          />
        </div>
      </div>

      <div className="g-card-body">
        <div className="g-card-title">
          <h3>
            <Link href={href}>{mattress.name}</Link>
          </h3>
          {mattress.reviews > 0 && mattress.rating > 0 ? (
            <span className="g-stars" aria-label={`${mattress.rating} out of 5 from ${mattress.reviews} reviews`}>
              <i aria-hidden="true">★</i> {mattress.rating.toFixed(1)} ({mattress.reviews})
            </span>
          ) : null}
        </div>
        <FeelScale firmness={mattress.firmness} />
        <p className="g-card-desc">{mattress.shortDescription}</p>
        <div className="g-card-meta">
          <span className="g-chip g-chip--indigo">{mattress.layers.length} layers</span>
          <span className="g-chip g-chip--indigo">{BUSINESS.trialNights}-night trial</span>
          {mattress.options?.length ? <span className="g-chip g-chip--indigo">Upgrade available</span> : null}
        </div>
        <div className="g-card-foot">
          <div className="g-price">
            <b>
              {money(mattress.basePrice)}
              {mattress.compareAt > mattress.basePrice ? <s>{money(mattress.compareAt)}</s> : null}
            </b>
            <small>
              {mattress.sizes[0]?.label} {mattress.heights[0]?.label}, up to {money(mattress.basePrice + largest)}
            </small>
          </div>
          <Link href={href} className="g-btn g-btn--sm" aria-label={`Choose a size of ${mattress.name}`}>
            Choose size
          </Link>
        </div>
      </div>
    </article>
  );
}
