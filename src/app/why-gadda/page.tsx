import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MattressStack from "@/components/store/MattressStack";
import HelpStrip from "@/components/store/HelpStrip";
import { getStoreData } from "@/lib/store";
import { BUSINESS } from "@/lib/business";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Why GADDA — no mattress theatre",
  description: "Fewer mattresses, clearer construction and one honest price. Why GADDA sells mattresses the way it does.",
  alternates: { canonical: "/why-gadda" },
};

export default async function WhyGaddaPage() {
  const { products, site } = await getStoreData();
  const hero = products.find((p) => p.slug === site.homeStoryProductSlug) || products[0];

  return (
    <>
      <Header />
      <main id="main">
        <section className="g-hero" aria-labelledby="why-title">
          <div className="g-wrap g-hero-grid" style={{ minHeight: 0 }}>
            <div>
              <h1 className="g-h1" id="why-title">
                We got tired of mattress theatre.
              </h1>
              <p className="g-lede">
                A mattress is already a big purchase. It doesn&apos;t need to become a research project too. GADDA exists
                to make it easy to understand: fewer choices, clear construction, and a straight conversation about
                comfort.
              </p>
            </div>
            {hero ? (
              <div className="g-hero-visual">
                <MattressStack layers={hero.layers} spread="exploded" animate />
              </div>
            ) : null}
          </div>
        </section>

        <section className="g-section" aria-labelledby="problem-title">
          <div className="g-wrap g-split" style={{ alignItems: "start" }}>
            <h2 className="g-h2" id="problem-title">
              What we didn&apos;t like
            </h2>
            <div className="g-faq-list">
              {[
                ["Too many choices", "When every mattress sounds almost identical, more options stop being useful. Big brands sell dozens; most homes need one of three."],
                ["Too much jargon", "Material names mean very little unless someone explains what they change while you sleep. “Ortho-gel-hybrid-pro” is a price tag, not a description."],
                ["Fake discounts", "An MRP nobody pays, slashed by 60% every single day, plus a countdown that resets at midnight. It's designed to rush you."],
                ["Showroom theatre", "Ten minutes lying on a bed under bright lights isn't how anyone actually sleeps. Your bedroom is the only real test."],
              ].map(([t, b]) => (
                <details key={t} open>
                  <summary>{t}</summary>
                  <div>
                    <p>{b}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="g-section g-section--ink" aria-labelledby="belief-title">
          <div className="g-wrap">
            <h2 className="g-h2" id="belief-title" style={{ maxWidth: "18ch" }}>
              Make a good mattress. Show what&apos;s inside. Price it clearly.
            </h2>
            <p className="g-lede">
              Our version is less exciting. We&apos;d rather earn trust by being understandable than impress you with a
              longer vocabulary. Good sleep, no drama.
            </p>
            <div className="g-split" style={{ marginTop: 40, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {[
                ["Fewer gaddas", "Three mattresses, each for a different reason — not a bigger catalogue for its own sake."],
                ["No black box", "Every layer is named on the product page, with what it's for. If we know the density, it's printed."],
                [`Try it at home`, `${BUSINESS.trialNights} nights in your own bed. If it's wrong, we collect it and refund you.`],
                ["One honest price", "The same price for everyone, every day, with GST and delivery inside it."],
              ].map(([t, b]) => (
                <div key={t} style={{ borderTop: "2px solid var(--g-orange)", paddingTop: 16 }}>
                  <h3 className="g-h3">{t}</h3>
                  <p style={{ color: "rgba(255,255,255,.7)", margin: "8px 0 0" }}>{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="g-section" aria-label="Shop">
          <div className="g-wrap g-split">
            <Link href="/mattresses" className="g-panel g-panel--orange">
              <h3>See the three mattresses</h3>
              <span className="g-btn" style={{ justifySelf: "start" }}>
                Shop mattresses
              </span>
            </Link>
            <Link href="/business-information" className="g-panel g-panel--ticking">
              <div>
                <h3>Who&apos;s behind GADDA</h3>
                <p>{BUSINESS.legalName}. Made in {BUSINESS.countryOfOrigin}.</p>
              </div>
              <span className="g-btn" style={{ justifySelf: "start" }}>
                Business information
              </span>
            </Link>
          </div>
        </section>
        <HelpStrip />
      </main>
      <Footer />
    </>
  );
}
