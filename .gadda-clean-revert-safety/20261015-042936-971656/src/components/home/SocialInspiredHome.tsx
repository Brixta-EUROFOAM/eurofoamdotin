"use client";

import Link from "next/link";
import type { Mattress, Review, SiteSettings } from "@/lib/catalog";

type Props = { site: SiteSettings; products: Mattress[]; reviews?: Review[] };

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

const descriptions: Record<string, { eyebrow: string; lead: string; benefit: string }> = {
  "gadda-regular": { eyebrow: "THE EVERYDAY ONE", lead: "Simple comfort. Solid support.", benefit: "A comfortable mattress for everyday use, guest rooms and first homes." },
  "gadda-pro": { eyebrow: "THE ALL-ROUNDER", lead: "A little more comfort.", benefit: "Memory foam cushioning, with a choice of foam or pocket-spring support." },
  "gadda-ultimate": { eyebrow: "THE PREMIUM ONE", lead: "Comfort with more choice.", benefit: "Cooling memory foam, adaptive comfort and a supportive core." },
};

export default function SocialInspiredHome({ site, products }: Props) {
  const featured = ["gadda-regular", "gadda-pro", "gadda-ultimate"]
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Mattress => Boolean(product));
  const shown = featured.length ? featured : products.slice(0, 3);
  const startingPrice = shown.length ? Math.min(...shown.map((product) => product.basePrice)) : null;
  const heroImage = site.heroSlides?.find((slide) => slide.enabled !== false)?.image || site.heroImage || shown[0]?.image;

  return (
    <main className="gc-home">
      <section className="gc-hero" aria-labelledby="gc-hero-title">
        <div className="gc-shell gc-hero-grid">
          <div className="gc-hero-copy">
            <p className="gc-eyebrow">GADDA MATTRESSES</p>
            <h1 id="gc-hero-title">GOOD SLEEP.<br /><span>NO DRAMA.</span></h1>
            <p className="gc-hero-intro">Comfortable mattresses, clearly explained. Choose the feel you want, pick your size and know what you are paying for.</p>
            {startingPrice !== null && <p className="gc-hero-price">Starting at <strong>{money(startingPrice)}</strong></p>}
            <div className="gc-actions">
              <Link href="#the-range" className="gc-button gc-button-orange">Shop mattresses <span aria-hidden="true">→</span></Link>
              <Link href="/compare" className="gc-button gc-button-outline">Compare the range <span aria-hidden="true">→</span></Link>
            </div>
            <p className="gc-hero-caption">Three straightforward choices. No confusing names or inflated discounts.</p>
          </div>
          <div className="gc-hero-image">
            {heroImage && <img src={heroImage} alt="A GADDA mattress in a bedroom" />}
            <div className="gc-hero-image-label"><strong>GADDA.</strong><span>Made for actual sleep.</span></div>
          </div>
        </div>
      </section>

      <section className="gc-range" id="the-range" aria-labelledby="gc-range-title">
        <div className="gc-shell">
          <div className="gc-section-heading"><div><p className="gc-eyebrow">THE RANGE</p><h2 id="gc-range-title">FIND YOUR GADDA.</h2></div><p>Start with how you like to sleep. You can choose the size and available upgrades on the product page.</p></div>
          <div className="gc-product-grid">
            {shown.map((product, index) => {
              const detail = descriptions[product.slug];
              return <article className="gc-product" key={product.slug}>
                <Link className="gc-product-image" href={`/mattresses/${product.slug}`} aria-label={`View ${product.name}`}><img src={product.image} alt={product.name} loading="lazy" /></Link>
                <div className="gc-product-content">
                  <div className="gc-product-meta"><span>{detail?.eyebrow || product.category}</span><span>{String(index + 1).padStart(2, "0")}</span></div>
                  <h3>{product.name}</h3>
                  <p className="gc-product-lead">{detail?.lead || product.kicker}</p>
                  <p className="gc-product-description">{detail?.benefit || product.shortDescription}</p>
                  <div className="gc-product-footer"><div><small>FROM</small><strong>{money(product.basePrice)}</strong></div><Link href={`/mattresses/${product.slug}`} className="gc-product-link">View mattress <span aria-hidden="true">→</span></Link></div>
                </div>
              </article>;
            })}
          </div>
          <div className="gc-range-bottom"><span>Need help choosing? Compare materials, feel and prices side by side.</span><Link href="/compare">Compare all mattresses →</Link></div>
        </div>
      </section>

      <section className="gc-explainer" id="about-gadda" aria-labelledby="gc-explainer-title">
        <div className="gc-shell gc-explainer-grid"><div><p className="gc-eyebrow">WHY GADDA</p><h2 id="gc-explainer-title">A GOOD MATTRESS SHOULDN’T BE COMPLICATED.</h2></div><div className="gc-explainer-text"><p>We focus on the things you can actually compare: what the mattress is made from, how it feels and what it costs.</p><p>Regular keeps it simple. Pro adds pressure-relieving memory foam and a support-base choice. Ultimate adds cooling comfort and an optional latex top layer.</p><Link href="/mattresses">See how each mattress is made →</Link></div></div>
      </section>

      <section className="gc-steps" aria-labelledby="gc-steps-title"><div className="gc-shell"><div className="gc-section-heading"><div><p className="gc-eyebrow">HOW IT WORKS</p><h2 id="gc-steps-title">THREE EASY STEPS.</h2></div></div><div className="gc-steps-grid"><div><span>01</span><h3>Choose your Gadda</h3><p>Compare Regular, Pro and Ultimate to find the right comfort level.</p></div><div><span>02</span><h3>Pick your size</h3><p>Select the available size, height and mattress options. The displayed price updates with your choices.</p></div><div><span>03</span><h3>Review your order</h3><p>Check the final configuration and applicable delivery, trial and warranty terms before ordering.</p></div></div></div></section>

      <section className="gc-faq" aria-labelledby="gc-faq-title"><div className="gc-shell gc-faq-grid"><div><p className="gc-eyebrow">GOOD TO KNOW</p><h2 id="gc-faq-title">QUESTIONS, ANSWERED.</h2><p>Useful details, without a sales pitch.</p></div><div className="gc-faq-list"><details><summary>What is the difference between the three models?</summary><p>Regular is a firm-feeling foam mattress. Pro adds memory foam and a choice of support base. Ultimate adds cooling comfort and an optional latex upgrade.</p></details><details><summary>How do I choose the correct size?</summary><p>Open a product, choose the available size and height, and check the selected price before ordering.</p></details><details><summary>Can I try the mattress at home?</summary><p>Check the trial details and any eligibility conditions on the product page. Confirm return and trial terms before purchasing.</p></details><details><summary>What does the warranty cover?</summary><p>Warranty coverage depends on the model and written terms. Review those terms before placing an order.</p></details></div></div></section>

      <section className="gc-end"><div className="gc-shell gc-end-grid"><div><p className="gc-eyebrow">READY WHEN YOU ARE</p><h2>LESS RESEARCH.<br />MORE SLEEP.</h2><p>Three mattresses. Clear prices. An easier way to choose.</p></div><Link href="/mattresses" className="gc-button gc-button-orange">Shop GADDA <span aria-hidden="true">→</span></Link></div></section>
    </main>
  );
}
