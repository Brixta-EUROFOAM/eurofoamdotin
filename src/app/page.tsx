import Link from "next/link";
import { headers } from "next/headers";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import MattressStack from "@/components/store/MattressStack";
import TrustStrip from "@/components/store/TrustStrip";
import Faq from "@/components/store/Faq";
import Reviews from "@/components/store/Reviews";
import HelpStrip from "@/components/store/HelpStrip";
import Stamp from "@/components/store/Stamp";
import HindiNote from "@/components/store/HindiNote";
import { getStoreData } from "@/lib/store";
import { money } from "@/lib/catalog";
import { BUSINESS } from "@/lib/business";
import { copyText } from "@/lib/site-copy";
import PromoBanners from "@/components/store/PromoBanners";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { site, products, reviews } = await getStoreData();
  const nonce = (await headers()).get("x-nonce") || undefined;
  const show = site.homeSections || {};
  const hero = products.find((p) => p.slug === site.homeStoryProductSlug) || products[1] || products[0];
  const cheapest = products.length ? Math.min(...products.map((p) => p.basePrice)) : 0;
  const t = (key: string, vars: Record<string, string | number> = {}) =>
    copyText(site, key, { trial: BUSINESS.trialNights, count: products.length, ...vars });

  return (
    <>
      <Header />
      <main id="main">
        {/* Hero: the mattress, taken apart */}
        <section className="g-hero" aria-labelledby="hero-title">
          <div className="g-wrap g-hero-grid">
            <div>
              <p className="g-hero-deva" lang="hi">
                गद्दा
              </p>
              <h1 className="g-h1" id="hero-title">
                {site.heroTitle || "Gadda hi hai yaar."}
              </h1>
              <p className="g-lede">{t("heroLede")}</p>
              <div className="g-hero-cta">
                <Link href="/mattresses" className="g-btn g-btn--orange">
                  {sentence(site.primaryCtaLabel) || "Shop mattresses"}
                </Link>
                <Link href="/sleep-quiz" className="g-btn g-btn--ghost">
                  {sentence(site.secondaryCtaLabel) || "Find my match"}
                </Link>
              </div>
              {cheapest ? (
                <p className="g-hero-from">
                  {(() => {
                    const [before, ...after] = t("heroFrom").split("{price}");
                    return (
                      <>
                        {before}
                        {after.length ? <b>{money(cheapest)}</b> : null}
                        {after.join("")}
                      </>
                    );
                  })()}
                </p>
              ) : null}
            </div>

            {hero ? (
              <div className="g-hero-visual">
                <Stamp
                  className="g-stamp--hero"
                  ring={`${BUSINESS.trialNights} nights at home`}
                  center={String(BUSINESS.trialNights)}
                  sub="nights"
                  tone="rust"
                  rotate={-12}
                />
                <MattressStack
                  className="g-mstack--labelled"
                  layers={hero.layers}
                  spread="exploded"
                  labels
                  animate
                />
                <p style={{ margin: "18px 0 0", fontSize: ".92rem", color: "var(--g-ink-2)" }}>
                  Inside the {hero.name}. That&apos;s all of it.{" "}
                  <Link href={`/mattresses/${hero.slug}`} className="g-link">
                    See the {hero.name}
                  </Link>
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <TrustStrip />

        {show.promos !== false ? <PromoBanners banners={site.homeBanners || []} title={t("promosTitle")} /> : null}

        {show.productGrid !== false ? (
          <section className="g-section" aria-labelledby="range-title">
            <div className="g-wrap">
              <div className="g-head">
                <div>
                  <h2 className="g-h2" id="range-title">
                    {t("rangeTitle")}
                  </h2>
                  {t("rangeHindi") ? <HindiNote>{t("rangeHindi")}</HindiNote> : null}
                  <p className="g-lede">{t("rangeLede")}</p>
                </div>
                <Link href="/compare" className="g-btn g-btn--ghost">
                  {t("rangeCompare")}
                </Link>
              </div>
              <div className="g-products g-rail">
                {products.map((p) => (
                  <ProductCard
                    key={p.slug}
                    mattress={p}
                    highlight={p.slug === hero?.slug ? t("rangePick") || undefined : undefined}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* The honesty bit */}
        <section className="g-section g-section--cream" aria-labelledby="vs-title">
          <div className="g-wrap">
            <div className="g-head">
              <div>
                <h2 className="g-h2" id="vs-title">
                  {t("vsTitle")}
                </h2>
                {t("vsHindi") ? <HindiNote>{t("vsHindi")}</HindiNote> : null}
                <p className="g-lede">{t("vsLede")}</p>
              </div>
            </div>
            <div className="g-vs">
              <div className="g-vs-col g-vs-col--them">
                <h3>{t("vsThemTitle")}</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/home/mattress-jargon.png"
                  alt="A tall stack of mattresses with labels like AI Sleep Tech, 15 Layers, Cooling Gel Matrix and Max Pro Ultra+"
                  loading="lazy"
                  width={907}
                  height={801}
                />
                <ul className="g-vs-list" style={{ color: "var(--g-ink-2)" }}>
                  {["vsThem1", "vsThem2", "vsThem3"].map((k) =>
                    t(k) ? (
                      <li key={k}>
                        <span>{t(k)}</span>
                      </li>
                    ) : null
                  )}
                </ul>
              </div>
              <div className="g-vs-col g-vs-col--us">
                <h3>{t("vsUsTitle")}</h3>
                <Stamp className="g-stamp--corner" ring="One price for everyone" center="₹" sub="No fake MRP" tone="indigo" size={112} rotate={10} />
                {hero ? (
                  <div style={{ padding: "8% 6%" }}>
                    <MattressStack layers={hero.layers} spread="open" />
                  </div>
                ) : null}
                <ul className="g-vs-list">
                  {["vsUs1", "vsUs2", "vsUs3"].map((k) =>
                    t(k) ? (
                      <li key={k}>
                        <div>
                          {t(k)}
                          <br />
                          <span>{t(`${k}Sub`)}</span>
                        </div>
                      </li>
                    ) : null
                  )}
                </ul>
                <Link href="/why-gadda" className="g-btn g-btn--orange" style={{ justifySelf: "start" }}>
                  {t("vsCta")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How buying works — a real sequence */}
        <section className="g-section g-section--ink" aria-labelledby="how-title">
          <div className="g-wrap">
            <div className="g-head">
              <div>
                <h2 className="g-h2" id="how-title">
                  {t("howTitle")}
                </h2>
                {t("howHindi") ? <HindiNote>{t("howHindi")}</HindiNote> : null}
                <p className="g-lede">{t("howLede")}</p>
              </div>
            </div>
            <ol className="g-steps g-rail">
              {["how1", "how2", "how3", "how4"].map((k) =>
                t(k) ? (
                  <li key={k}>
                    <h3>{t(k)}</h3>
                    <p>{t(`${k}Sub`)}</p>
                  </li>
                ) : null
              )}
            </ol>
          </div>
        </section>

        <section className="g-section" aria-label="Help choosing">
          <div className="g-wrap g-split">
            <Link href="/sleep-quiz" className="g-panel g-panel--orange">
              <div>
                <h3>{t("quizTitle")}</h3>
                <p>{t("quizBody")}</p>
              </div>
              <span className="g-btn" style={{ justifySelf: "start" }}>
                {t("quizCta")}
              </span>
            </Link>
            <Link href="/compare" className="g-panel g-panel--ticking">
              <div>
                <h3>{t("compareTitle")}</h3>
                <p>{t("compareBody")}</p>
              </div>
              <span className="g-btn" style={{ justifySelf: "start" }}>
                {t("compareCta")}
              </span>
            </Link>
          </div>
        </section>

        {show.reviews !== false ? <Reviews reviews={reviews} /> : null}

        <Faq limit={6} nonce={nonce} />

        <HelpStrip />
      </main>
      <Footer />
    </>
  );
}

function sentence(text?: string) {
  if (!text) return "";
  if (text !== text.toUpperCase()) return text;
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
