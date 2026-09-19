"use client";

import AnimatedGallery from "@/components/home/AnimatedGallery";
import CampaignHero from "@/components/home/CampaignHero";
import AnimatedCollection from "@/components/home/AnimatedCollection";
import ExplodedLayers from "@/components/home/ExplodedLayers";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
} from "react";
import type {
  Mattress,
  SiteSettings,
} from "@/lib/catalog";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function GraphicPlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`social-graphic-placeholder ${className}`}
      aria-label={`${label} graphic placeholder`}
    >
      <span>{label}</span>
      <small>DESIGNER ARTWORK AREA</small>
    </div>
  );
}

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = "true";
          observer.disconnect();
        }
      },
      { threshold: 0.14 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`social-reveal ${className}`}>
      {children}
    </div>
  );
}

export default function SocialInspiredHome({
  site,
  products,
}: {
  site: SiteSettings;
  products: Mattress[];
}) {
const featured = useMemo(
    () => products.slice(0, Math.min(4, products.length)),
    [products]
  );



  const heroImage =
    site.heroSlides?.find((slide) => slide.enabled !== false)?.image ||
    site.heroImage ||
    featured[0]?.image;

  return (
    <main className="social-home">
      <CampaignHero site={site} products={products} />

      <nav className="social-subnav" aria-label="Homepage sections">
        <a href="#story">STORY</a>
        <a href="#collection">COLLECTION</a>
        <a href="#inside">INSIDE</a>
        <a href="#gallery">GALLERY</a>
        <a href="#match">FIND YOUR MATCH</a>
      </nav>

      <section id="story" className="social-story">
        <div className="social-section-label">01 / OUR POINT OF VIEW</div>

        <Reveal>
          <div className="social-story-grid">
            <div>
              <p className="social-eyebrow">A LOVE LETTER TO</p>
              <h2>
                THE GOOD
                <br />
                NIGHT.
              </h2>
            </div>

            <div className="social-story-copy">
              <p>
                We think buying a mattress should feel less like deciphering
                a catalogue and more like understanding your own sleep.
              </p>
              <p>
                So we make the important things visible: feel, support,
                construction, heat management, motion control and price.
              </p>

              <Link href="/why-eurofoam" className="social-text-link">
                WHY GADDA <Arrow />
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="social-chip-row" aria-label="Mattress benefits">
          {[
            "PRESSURE RELIEF",
            "COOLER SLEEP",
            "EDGE SUPPORT",
            "LOW MOTION",
            "100 NIGHT TRIAL",
          ].map((item, index) => (
            <span
              key={item}
              className={`social-chip social-chip-${index + 1}`}
            >
              {item}
            </span>
          ))}
        </div>

        <GraphicPlaceholder
          label="EDITORIAL SLEEP ILLUSTRATION"
          className="social-story-art"
        />
      </section>

      <AnimatedCollection products={products} />

      <ExplodedLayers />

      <AnimatedGallery products={products} />

      <section id="match" className="social-match">
        <div className="social-match-orbit" aria-hidden="true">
          <span>SOFT</span>
          <span>COOL</span>
          <span>FIRM</span>
          <span>QUIET</span>
        </div>

        <div className="social-match-inner">
          <p className="social-micro">05 / YOUR SLEEP PROFILE</p>
          <h2>
            FOUR QUESTIONS.
            <br />
            ONE PLACE TO START.
          </h2>
          <p>
            Side, back, hot sleeper, couple, firmer or softer:
            turn preferences into a practical mattress shortlist.
          </p>
          <Link href="/sleep-quiz" className="social-solid-button">
            FIND MY MATCH <Arrow />
          </Link>
        </div>
      </section>

      <section className="social-service-strip">
        <div>
          <strong>100</strong>
          <span>NIGHT TRIAL</span>
        </div>
        <div>
          <strong>10</strong>
          <span>YEAR WARRANTY</span>
        </div>
        <div>
          <strong>₹</strong>
          <span>DIRECT PRICING</span>
        </div>
        <div>
          <strong>↔</strong>
          <span>MOTION CONTROL</span>
        </div>
      </section>

      <section className="social-final">
        <div className="social-final-word gadda-final-word">GADDA</div>

        <div className="social-final-grid">
          <p>
            Built for bedrooms.
            <br />
            Explained for humans.
          </p>

          <div>
            <Link href="/mattresses">SHOP MATTRESSES <Arrow /></Link>
            <Link href="/compare">COMPARE <Arrow /></Link>
            <Link href="/sleep-quiz">FIND MY MATCH <Arrow /></Link>
          </div>

          <div>
            <Link href="/business-information">
              BUSINESS INFORMATION <Arrow />
            </Link>
            <Link href="/reviews">REVIEWS <Arrow /></Link>
            <Link href="/account">ACCOUNT <Arrow /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}