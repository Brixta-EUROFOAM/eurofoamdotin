import Link from "next/link";

import type {
  Mattress,
  SiteSettings,
} from "@/lib/catalog";

function money(value: number) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

export default function CampaignHero({
  site,
  products,
}: {
  site: SiteSettings;
  products: Mattress[];
}) {

  const cheapest =
    products.length
      ? products.reduce(
          (best, product) =>
            product.basePrice < best.basePrice
              ? product
              : best
        )
      : undefined;

  const image =
    site.heroSlides?.find(
      (slide) =>
        slide.enabled !== false
    )?.image
    || cheapest?.image
    || site.heroImage;

  const lowestPrice =
    products.length
      ? Math.min(
          ...products.map(
            (product) =>
              product.basePrice
          )
        )
      : 0;

  return (
    <section
      id="top"
      className="gadda-v3-hero"
    >

      <div className="gadda-v3-hero-copy">

        <div className="gadda-v3-mini-brand">
          GADDA.
          <span>
            {site.tagline || "Gadda hi hai yaar."}
          </span>
        </div>


        <h1>
          GOOD SLEEP.
          <br />
          <strong>
            NO DRAMA.
          </strong>
        </h1>


        <p className="gadda-v3-hero-lead">
          Great mattresses.
          <br />
          Clear choices.
          <br />
          Honest pricing.
        </p>


        <p className="gadda-v3-hero-detail">
          Pick the feel. See what&apos;s inside.
          Pay for the gadda — not the theatre around it.
        </p>


        <div className="gadda-v3-hero-actions">

          <Link
            href="/mattresses"
            className="gadda-v3-primary"
          >
            SHOP MATTRESSES ↗
          </Link>

          {lowestPrice > 0 ? (
            <span>
              FROM {money(lowestPrice)}
            </span>
          ) : null}

        </div>

      </div>


      <div className="gadda-v3-hero-visual">

        {image ? (
          <img
            src={image}
            alt="GADDA mattress"
          />
        ) : null}


        <div className="gadda-v3-hero-note gadda-v3-note-1">
          SAME GADDA.
          <br />
          LESS DRAMA.
        </div>


        <div className="gadda-v3-hero-note gadda-v3-note-2">
          FINALLY.
          <br />
          A MATTRESS BRAND
          <br />
          THAT TALKS SENSE.
        </div>


        <div className="gadda-v3-hero-sticker">
          GADDA
          <br />
          HI HAI
          <br />
          YAAR.
        </div>

      </div>


      <div className="gadda-v3-hero-proof">

        <div>
          <strong>
            ₹
          </strong>
          <span>
            CLEAR PRICING
          </span>
        </div>

        <div>
          <strong>
            100
          </strong>
          <span>
            NIGHT TRIAL*
          </span>
        </div>

        <div>
          <strong>
            ✓
          </strong>
          <span>
            WARRANTY
          </span>
        </div>

        <div>
          <strong>
            4
          </strong>
          <span>
            CLEAR CHOICES
          </span>
        </div>

      </div>

    </section>
  );
}
