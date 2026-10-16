import Link from "next/link";
import type { Review } from "@/lib/catalog";
import NeedleArt from "@/components/store/NeedleArt";

export default function Reviews({ reviews, limit = 6, heading = true }: { reviews: Review[]; limit?: number; heading?: boolean }) {
  const shown = reviews.slice(0, limit);
  return (
    <section className="g-section g-section--cream" aria-labelledby="reviews-title">
      <div className="g-wrap">
        {heading ? (
          <div className="g-head">
            <div>
              <h2 className="g-h2" id="reviews-title">
                What sleepers say
              </h2>
              {shown.length ? (
                <p className="g-lede">Every review here is from a real order. We don&apos;t edit them and we don&apos;t pay for them.</p>
              ) : null}
            </div>
            {reviews.length > limit ? (
              <Link href="/reviews" className="g-btn g-btn--ghost">
                All {reviews.length} reviews
              </Link>
            ) : null}
          </div>
        ) : null}

        {shown.length ? (
          <div className="g-reviews">
            {shown.map((r) => (
              <figure key={r.id} className="g-review" style={{ margin: 0 }}>
                <span className="g-stars" aria-label={`${r.stars} out of 5`}>
                  <i aria-hidden="true">{"★".repeat(Math.max(1, Math.min(5, Math.round(r.stars))))}</i>
                </span>
                <blockquote>{r.quote}</blockquote>
                <footer>
                  <b>{r.name}</b>
                  <span>{r.product}</span>
                </footer>
              </figure>
            ))}
          </div>
        ) : (
          <div className="g-empty">
            <NeedleArt />
            <h3 className="g-h3">No reviews yet — and we won&apos;t fake them</h3>
            <p>
              GADDA is new. Instead of borrowing celebrity faces or inventing five-star quotes, we&apos;ll show real
              reviews here as our first customers sleep on their mattresses. Until then, the 100-night trial is our
              review: if it&apos;s not right, send it back.
            </p>
            <Link href="/policies/trial" className="g-link">
              How the trial works
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
