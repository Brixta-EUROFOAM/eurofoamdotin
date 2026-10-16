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

export const dynamic = "force-dynamic";

export default async function Home() {
  const { site, products, reviews } = await getStoreData();
  const nonce = (await headers()).get("x-nonce") || undefined;
  const show = site.homeSections || {};
  const hero = products.find((p) => p.slug === site.homeStoryProductSlug) || products[1] || products[0];
  const cheapest = products.length ? Math.min(...products.map((p) => p.basePrice)) : 0;

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
              <p className="g-lede">
                It&apos;s a mattress, not a rocket. Three honest ones, built from foam you can name, sold at one
                fair price with delivery included — and {BUSINESS.trialNights} nights at home to make sure.
              </p>
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
                  From <b>{money(cheapest)}</b>, GST and delivery included.
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

        {show.productGrid !== false ? (
          <section className="g-section" aria-labelledby="range-title">
            <div className="g-wrap">
              <div className="g-head">
                <div>
                  <h2 className="g-h2" id="range-title">
                    Three mattresses. That&apos;s the whole range.
                  </h2>
                  <HindiNote>बस तीन</HindiNote>
                  <p className="g-lede">
                    Firm, balanced or plush. Every size in 6 or 8 inch, priced the same for everyone, every day.
                  </p>
                </div>
                <Link href="/compare" className="g-btn g-btn--ghost">
                  Compare side by side
                </Link>
              </div>
              <div className="g-products">
                {products.map((p) => (
                  <ProductCard
                    key={p.slug}
                    mattress={p}
                    highlight={p.slug === hero?.slug ? "Our pick for most people" : undefined}
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
                  Buying a mattress shouldn&apos;t need a glossary.
                </h2>
                <HindiNote>सीधी बात</HindiNote>
                <p className="g-lede">
                  Most of the words on a mattress label are there to justify the price tag. Here&apos;s the
                  difference.
                </p>
              </div>
            </div>
            <div className="g-vs">
              <div className="g-vs-col g-vs-col--them">
                <h3>The usual mattress</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/home/mattress-jargon.png"
                  alt="A tall stack of mattresses with labels like AI Sleep Tech, 15 Layers, Cooling Gel Matrix and Max Pro Ultra+"
                  loading="lazy"
                  width={907}
                  height={801}
                />
                <ul className="g-vs-list" style={{ color: "var(--g-ink-2)" }}>
                  <li>
                    <span>An &ldquo;MRP&rdquo; that nobody pays, slashed by 60% forever</span>
                  </li>
                  <li>
                    <span>Trademarked names for ordinary foam</span>
                  </li>
                  <li>
                    <span>A sale countdown that resets at midnight</span>
                  </li>
                </ul>
              </div>
              <div className="g-vs-col g-vs-col--us">
                <h3>A GADDA</h3>
                <Stamp className="g-stamp--corner" ring="One price for everyone" center="₹" sub="No fake MRP" tone="indigo" size={112} rotate={10} />
                {hero ? (
                  <div style={{ padding: "8% 6%" }}>
                    <MattressStack layers={hero.layers} spread="open" />
                  </div>
                ) : null}
                <ul className="g-vs-list">
                  <li>
                    <div>
                      Every layer named, in plain words
                      <br />
                      <span>Cover, comfort foam, support foam. Density printed where we know it.</span>
                    </div>
                  </li>
                  <li>
                    <div>
                      One price, the real one
                      <br />
                      <span>Including GST and delivery. No coupons needed to get a fair deal.</span>
                    </div>
                  </li>
                  <li>
                    <div>
                      Made in India, sold direct
                      <br />
                      <span>No showroom rent or middlemen added to what you pay.</span>
                    </div>
                  </li>
                </ul>
                <Link href="/why-gadda" className="g-btn g-btn--orange" style={{ justifySelf: "start" }}>
                  Why we do it this way
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
                  How buying a GADDA works
                </h2>
                <HindiNote>आराम से</HindiNote>
                <p className="g-lede">No payment gateway hoops. Order online, and a person takes it from there.</p>
              </div>
            </div>
            <ol className="g-steps">
              <li>
                <h3>Pick size and height</h3>
                <p>Order online in two minutes. No payment needed on the site.</p>
              </li>
              <li>
                <h3>We call to confirm</h3>
                <p>A real person checks your size, address and a delivery time that suits you.</p>
              </li>
              <li>
                <h3>It arrives flat</h3>
                <p>Delivered to your door. Pay on delivery, or by UPI link if you prefer.</p>
              </li>
              <li>
                <h3>{BUSINESS.trialNights} nights to decide</h3>
                <p>Not right for you? We pick it up and refund you.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="g-section" aria-label="Help choosing">
          <div className="g-wrap g-split">
            <Link href="/sleep-quiz" className="g-panel g-panel--orange">
              <div>
                <h3>Not sure which one?</h3>
                <p>Five quick questions about how you sleep. We&apos;ll point you to one mattress, with the reason.</p>
              </div>
              <span className="g-btn" style={{ justifySelf: "start" }}>
                Take the 60-second quiz
              </span>
            </Link>
            <Link href="/compare" className="g-panel g-panel--ticking">
              <div>
                <h3>See all three side by side</h3>
                <p>Layers, feel, heights and prices in one table. No marketing words.</p>
              </div>
              <span className="g-btn" style={{ justifySelf: "start" }}>
                Compare mattresses
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
