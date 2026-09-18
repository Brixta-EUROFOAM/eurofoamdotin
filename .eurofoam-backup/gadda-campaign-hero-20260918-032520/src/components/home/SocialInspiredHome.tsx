"use client";

import AnimatedCollection from "@/components/home/AnimatedCollection";
import ExplodedLayers from "@/components/home/ExplodedLayers";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
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
  const heroRef = useRef<HTMLElement>(null);
  const [heroProgress, setHeroProgress] = useState(0);

  const featured = useMemo(
    () => products.slice(0, Math.min(4, products.length)),
    [products]
  );

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const hero = heroRef.current;
      if (!hero) return;

      const rect = hero.getBoundingClientRect();
      const height = Math.max(window.innerHeight, hero.offsetHeight);
      const progress = Math.min(
        1,
        Math.max(0, -rect.top / height)
      );
      setHeroProgress(progress);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const heroImage =
    site.heroSlides?.find((slide) => slide.enabled !== false)?.image ||
    site.heroImage ||
    featured[0]?.image;

  return (
    <main className="social-home">
      <section
        ref={heroRef}
        id="top"
        className="social-hero"
      >
        <div
          className="social-hero-media"
          style={{
            transform: `scale(${1 + heroProgress * 0.075}) translateY(${heroProgress * 3}%)`,
          }}
        >
          {heroImage ? (
            <img src={heroImage} alt="GADDA mattress bedroom" />
          ) : (
            <GraphicPlaceholder label="HERO CAMPAIGN" />
          )}
        </div>

        <div className="social-hero-shade" />

        <div className="social-hero-top">
          <div className="social-hero-kicker">
            {site.brandName} · {site.brandSuffix}
          </div>
          <Link href="/mattresses" className="social-outline-button">
            SHOP MATTRESSES <Arrow />
          </Link>
        </div>

        <div className="social-hero-copy">
          <p className="social-micro">Gadda hi hai yaar.</p>
          <h1 className="gadda-hero-word">GADDA</h1>

          <div className="social-hero-bottom">
            <p>
              Mattress engineering made understandable.
              Comfort you can choose without showroom theatre.
            </p>
            <a href="#story" className="social-scroll-cue">
              <span>SCROLL TO EXPLORE</span>
              <b>↓</b>
            </a>
          </div>
        </div>
      </section>

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

      <section id="gallery" className="social-gallery">
        <div className="social-gallery-copy">
          <p className="social-micro">04 / IN THE WILD</p>
          <h2>
            BEDROOMS,
            <br />
            NOT SHOWROOMS.
          </h2>
        </div>

        <div className="social-gallery-grid">
          <figure className="social-gallery-large">
            <img
              src={featured[0]?.image || heroImage}
              alt="GADDA bedroom campaign"
            />
            <figcaption>HOME / 01</figcaption>
          </figure>

          <GraphicPlaceholder label="LIFESTYLE CAMPAIGN 02" />

          <figure>
            <img
              src={featured[1]?.image || heroImage}
              alt="GADDA cooling mattress"
            />
            <figcaption>DETAIL / 03</figcaption>
          </figure>

          <GraphicPlaceholder label="MATERIAL MACRO 04" />

          <figure className="social-gallery-wide">
            <img
              src={featured[2]?.image || featured[0]?.image || heroImage}
              alt="GADDA mattress collection"
            />
            <figcaption>COLLECTION / 05</figcaption>
          </figure>
        </div>
      </section>

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