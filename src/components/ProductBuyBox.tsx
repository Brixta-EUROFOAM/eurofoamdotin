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

  const [size, setSize] =
    useState(
      mattress.sizes[2]?.label ||
      mattress.sizes[0]?.label ||
      ""
    );

  const [height, setHeight] =
    useState(
      mattress.heights[0]?.label ||
      ""
    );

  const [added, setAdded] =
    useState(false);

  const { addItem } =
    useCart();


  const pricing =
    useMemo(() => {

      const sizeAdd =
        mattress.sizes.find(
          (entry) =>
            entry.label === size
        )?.priceAdd || 0;

      const heightAdd =
        mattress.heights.find(
          (entry) =>
            entry.label === height
        )?.priceAdd || 0;

      const extras =
        sizeAdd + heightAdd;

      const price =
        mattress.basePrice + extras;

      const comparePrice =
        mattress.compareAt + extras;

      const saving =
        Math.max(
          0,
          comparePrice - price
        );

      const savingPercent =
        comparePrice > 0
          ? Math.round(
              (saving / comparePrice) *
              100
            )
          : 0;

      return {
        price,
        comparePrice,
        saving,
        savingPercent,
      };

    }, [
      mattress,
      size,
      height,
    ]);


  function addCurrentSelection() {

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

    window.setTimeout(
      () => setAdded(false),
      1400
    );
  }


  function buyNow() {

    addCurrentSelection();

    window.setTimeout(
      () => {
        window.location.assign("/cart");
      },
      80
    );
  }


  return (
    <section
      id="buy-console"
      className="sell-buybox"
    >

      <div className="sell-buybox-overline">

        <span>
          {mattress.category}
        </span>

        <span>
          {mattress.badge ||
            mattress.kicker}
        </span>

      </div>


      <h1>
        {mattress.name}
      </h1>


      <p className="sell-buybox-kicker">
        {mattress.kicker}
      </p>


      <p className="sell-buybox-description">
        {mattress.shortDescription}
      </p>


      <div className="sell-buybox-rating">

        <strong>
          ★ {mattress.rating}
        </strong>

        <span>
          {mattress.reviews
            .toLocaleString("en-IN")} reviews
        </span>

      </div>


      <div className="sell-buybox-price">

        <div>

          <small>
            SELECTED PRICE
          </small>

          <strong>
            {money(pricing.price)}
          </strong>

        </div>


        {pricing.saving > 0 ? (

          <div className="sell-buybox-saving">

            <del>
              {money(
                pricing.comparePrice
              )}
            </del>

            <span>
              SAVE{" "}
              {money(
                pricing.saving
              )}
              {" · "}
              {pricing.savingPercent}%
            </span>

          </div>

        ) : null}

      </div>


      <div className="sell-buybox-selector">

        <div className="sell-buybox-selector-head">

          <strong>
            SIZE
          </strong>

          <span>
            Price updates automatically
          </span>

        </div>


        <div className="sell-buybox-size-grid">

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


      <div className="sell-buybox-selector">

        <div className="sell-buybox-selector-head">

          <strong>
            HEIGHT
          </strong>

          <span>
            Pick the profile you want
          </span>

        </div>


        <div className="sell-buybox-height-grid">

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


      <div className="sell-buybox-selected">

        <div>

          <small>
            YOUR GADDA
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


      <div className="sell-buybox-actions">

        <button
          type="button"
          className="sell-buybox-add"
          onClick={addCurrentSelection}
        >
          {added
            ? "ADDED TO CART ✓"
            : `ADD TO CART · ${money(pricing.price)}`
          }
        </button>


        <button
          type="button"
          className="sell-buybox-now"
          onClick={buyNow}
        >
          BUY NOW →
        </button>

      </div>


      <div className="sell-buybox-trust">

        <div>
          <small>
            DELIVERY
          </small>

          <strong>
            Standard shipping included
          </strong>
        </div>


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
            WARRANTY
          </small>

          <strong>
            {mattress.warranty}
          </strong>
        </div>


        <div>
          <small>
            RETURNS
          </small>

          <strong>
            See applicable trial / return terms
          </strong>
        </div>

      </div>

    </section>
  );
}
