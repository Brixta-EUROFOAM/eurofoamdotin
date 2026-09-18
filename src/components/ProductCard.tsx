import Link from "next/link";
import type { Mattress } from "@/lib/catalog";
import { money } from "@/lib/catalog";
import WishlistButton from "@/components/WishlistButton";

export default function ProductCard({
  mattress,
  index = 0,
}: {
  mattress: Mattress;
  index?: number;
}) {

  const discount = Math.round(
    ((mattress.compareAt - mattress.basePrice) /
      mattress.compareAt) *
      100
  );

  const number =
    String(index + 1).padStart(2, "0");

  const attitude =
    mattress.category
      ?.toLowerCase()
      .includes("cool")
      ? "RAAT KO GARMI?"
      : mattress.category
        ?.toLowerCase()
        .includes("ortho")
        ? "KAMAR KA SCENE?"
        : mattress.category
          ?.toLowerCase()
          .includes("hybrid")
          ? "THODA BOUNCE?"
          : "BAS GADDA CHAHIYE?";

  return (

    <article
      className={`gadda-shop-card ${
        index % 2
          ? "gadda-shop-card-reverse"
          : ""
      }`}
    >

      <div className="gadda-shop-card-number">
        {number}
      </div>


      <div className="gadda-shop-card-visual">

        <Link
          href={`/mattresses/${mattress.slug}`}
          className="gadda-shop-image-link"
        >

          <img
            src={mattress.image}
            alt={mattress.name}
          />

        </Link>


        <div className="gadda-shop-badge">

          {mattress.badge ||
            mattress.category}

        </div>


        <div className="gadda-shop-discount">

          {discount}%
          <br />
          OFF

        </div>


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



      <div className="gadda-shop-card-copy">

        <p className="gadda-shop-attitude">
          {attitude}
        </p>


        <Link
          href={`/mattresses/${mattress.slug}`}
        >

          <h2>
            {mattress.name}
          </h2>

        </Link>


        <p className="gadda-shop-kicker-copy">
          {mattress.kicker}
        </p>


        <p className="gadda-shop-description">
          {mattress.shortDescription}
        </p>



        <div className="gadda-shop-specs">

          <div>

            <small>
              FEEL
            </small>

            <strong>
              {mattress.firmness}
            </strong>

          </div>


          <div>

            <small>
              TRIAL
            </small>

            <strong>
              {mattress.trial}
            </strong>

          </div>


          <div>

            <small>
              WARRANTY
            </small>

            <strong>
              {mattress.warranty}
            </strong>

          </div>

        </div>



        <div className="gadda-shop-price">

          <div>

            <small>
              STARTS AT
            </small>

            <div className="gadda-shop-old-price">
              {money(mattress.compareAt)}
            </div>

            <strong>
              {money(mattress.basePrice)}
            </strong>

          </div>


          <Link
            href={`/mattresses/${mattress.slug}`}
            className="gadda-shop-cta"
          >
            GADDA DEKHO ↗
          </Link>

        </div>

      </div>

    </article>

  );
}
