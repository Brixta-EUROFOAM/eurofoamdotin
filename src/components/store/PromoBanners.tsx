import Link from "next/link";
import type { HomeBanner } from "@/lib/catalog";

/* Ad / offer banners managed in Admin → Homepage & banners. */
export default function PromoBanners({ banners, title }: { banners: HomeBanner[]; title?: string }) {
  const live = banners.filter((b) => b.enabled !== false && (b.title || b.image));
  if (!live.length) return null;

  return (
    <section className="g-section g-promos-sec" aria-label={title || "Offers"}>
      <div className="g-wrap">
        {title ? <h2 className="g-h3" style={{ marginBottom: 16 }}>{title}</h2> : null}
        <div className={`g-promos ${live.length === 1 ? "g-promos--one" : ""}`}>
          {live.map((b) => {
            const inner = (
              <>
                {b.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image} alt="" loading="lazy" style={{ objectPosition: b.imagePosition || "center" }} />
                ) : null}
                <div className="g-promo-text">
                  {b.eyebrow ? <p className="g-promo-eyebrow">{b.eyebrow}</p> : null}
                  {b.title ? <h3>{b.title}</h3> : null}
                  {b.body ? <p>{b.body}</p> : null}
                  {b.ctaLabel ? <span className="g-btn g-btn--orange">{b.ctaLabel}</span> : null}
                </div>
              </>
            );
            const cls = `g-promo ${b.theme === "light" ? "g-promo--light" : ""} ${b.image ? "" : "g-promo--plain"}`;
            return b.href ? (
              <Link key={b.id} href={b.href} className={cls}>
                {inner}
              </Link>
            ) : (
              <div key={b.id} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
