"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Mattress } from "@/lib/catalog";
import { money } from "@/lib/catalog";

export default function ProductBuyBox({
  mattress,
}: {
  mattress: Mattress;
}) {
  const [size, setSize] = useState(
    mattress.sizes[2]?.label ||
    mattress.sizes[0]?.label ||
    ""
  );

  const [height, setHeight] = useState(
    mattress.heights[0]?.label || ""
  );

  const [added, setAdded] = useState(false);

  const { addItem } = useCart();

  const pricing = useMemo(() => {
    const sizeAdd =
      mattress.sizes.find(
        (entry) => entry.label === size
      )?.priceAdd || 0;

    const heightAdd =
      mattress.heights.find(
        (entry) => entry.label === height
      )?.priceAdd || 0;

    const extras = sizeAdd + heightAdd;

    const price =
      mattress.basePrice + extras;

    const comparePrice =
      mattress.compareAt + extras;

    const saving =
      Math.max(
        0,
        comparePrice - price
      );

    return {
      price,
      comparePrice,
      saving,
    };
  }, [
    mattress,
    size,
    height,
  ]);

  return (
    <section className="pro-buybox">

      <div className="pro-buybox-overline">
        <span>{mattress.category}</span>
        <i />
        <span>{mattress.kicker}</span>
      </div>

      <h1>
        {mattress.name}
      </h1>

      <p className="pro-buybox-description">
        {mattress.longDescription}
      </p>


      <div className="pro-buybox-meta">

        <div>
          <strong>
            ★ {mattress.rating}
          </strong>

          <span>
            {mattress.reviews.toLocaleString("en-IN")}
            {" "}reviews
          </span>
        </div>

        <div>
          <strong>
            {mattress.firmness}
          </strong>

          <span>
            Mattress feel
          </span>
        </div>

      </div>


      <div className="pro-price">

        <div>
          <small>
            SELECTED PRICE
          </small>

          <strong>
            {money(pricing.price)}
          </strong>
        </div>

        {pricing.saving > 0 ? (
          <div className="pro-price-saving">
            <del>
              {money(pricing.comparePrice)}
            </del>

            <span>
              Save {money(pricing.saving)}
            </span>
          </div>
        ) : null}

      </div>


      <div className="pro-selector">

        <div className="pro-selector-heading">
          <strong>
            Choose size
          </strong>

          <span>
            Price updates automatically
          </span>
        </div>

        <div className="pro-size-grid">

          {mattress.sizes.map(
            (entry) => (

              <button
                key={entry.label}
                type="button"
                onClick={() =>
                  setSize(entry.label)
                }
                className={
                  size === entry.label
                    ? "is-active"
                    : ""
                }
              >
                {entry.label}
              </button>

            )
          )}

        </div>

      </div>


      <div className="pro-selector">

        <div className="pro-selector-heading">
          <strong>
            Choose height
          </strong>

          <span>
            Select your preferred profile
          </span>
        </div>

        <div className="pro-height-row">

          {mattress.heights.map(
            (entry) => (

              <button
                key={entry.label}
                type="button"
                onClick={() =>
                  setHeight(entry.label)
                }
                className={
                  height === entry.label
                    ? "is-active"
                    : ""
                }
              >
                {entry.label}
              </button>

            )
          )}

        </div>

      </div>


      <div className="pro-selected">

        <div>
          <small>
            YOUR CONFIGURATION
          </small>

          <strong>
            {size} · {height}
          </strong>
        </div>

        <span>
          Taxes included
          <br />
          Standard shipping included
        </span>

      </div>


      <button
        type="button"
        className="pro-add"
        onClick={() => {

          addItem({
            id:
              `${mattress.slug}-${size}-${height}`,
            slug:
              mattress.slug,
            name:
              mattress.name,
            image:
              mattress.image,
            size,
            height,
            price:
              pricing.price,
            quantity:
              1,
          });

          setAdded(true);

          setTimeout(
            () => setAdded(false),
            1400
          );

        }}
      >
        {added
          ? "ADDED TO CART ✓"
          : `ADD TO CART · ${money(pricing.price)}`
        }
      </button>


      <div className="pro-buy-confidence">

        <div>
          <small>
            TRY AT HOME
          </small>

          <strong>
            {mattress.trial}
          </strong>
        </div>

        <div>
          <small>
            PRODUCT COVERAGE
          </small>

          <strong>
            {mattress.warranty}
          </strong>
        </div>

      </div>

    </section>
  );
}
