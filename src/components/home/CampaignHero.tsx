"use client";

import Link from "next/link";
import {
  useState,
  type CSSProperties,
} from "react";

import type {
  Mattress,
  SiteSettings,
} from "@/lib/catalog";


type CampaignConfig = {
  enabled?: boolean;
  kicker?: string;
  headlineTop?: string;
  headlineBottom?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  productSlug?: string;
  background?: string;
  paper?: string;
  promoBadge?: string;
  cornerNote?: string;
  stickers?: string[];
  proof?: string[];
};


export default function CampaignHero({
  site,
  products,
}: {
  site: SiteSettings;
  products: Mattress[];
}) {

  const config =
    (
      site as SiteSettings & {
        campaignHero?: CampaignConfig;
      }
    ).campaignHero || {};


  const coolingProduct =
    products.find(
      (product) =>
        product.category
          ?.toLowerCase()
          .includes("cool")
    );


  const selectedProduct =
    products.find(
      (product) =>
        product.slug ===
        config.productSlug
    )
    || coolingProduct
    || products[0];


  const image =
    selectedProduct?.image
    || site.heroSlides
      ?.find(
        (slide) =>
          slide.enabled !== false
      )
      ?.image
    || site.heroImage;


  const background =
    config.background
    || "#FF6500";

  const paper =
    config.paper
    || "#F3ECDD";


  const kicker =
    config.kicker
    || `GADDA / ${
      selectedProduct?.name
      || "THE DROP"
    }`;


  const headlineTop =
    config.headlineTop
    || "GARMI MEIN?";


  const headlineBottom =
    config.headlineBottom
    || "THANDA GADDA.";


  const body =
    config.body
    || "Cooling comfort without the showroom gyaan.";


  const href =
    config.ctaHref
    || (
      selectedProduct
        ? `/mattresses/${selectedProduct.slug}`
        : "/mattresses"
    );


  const cta =
    config.ctaLabel
    || "THANDA WALA DEKHO ↗";


  const stickers =
    config.stickers
    || [
      "HOT SLEEPER?",
      "COOLING WALA",
      "NO GYAAN",
      "100 NIGHTS",
    ];


  const proof =
    config.proof
    || [
      "100 NIGHT TRIAL",
      "10 YEAR WARRANTY",
      "FREE SHIPPING",
      "EASY RETURNS",
    ];


  const [pointer, setPointer] =
    useState({
      x: 0,
      y: 0,
    });


  if (config.enabled === false) {
    return null;
  }


  const style = {
    "--campaign-bg":
      background,

    "--campaign-paper":
      paper,

    "--campaign-x":
      `${pointer.x}px`,

    "--campaign-y":
      `${pointer.y}px`,
  } as CSSProperties;


  return (

    <section
      id="top"
      className="gadda-campaign"
      style={style}

      onPointerMove={(event) => {

        const rect =
          event.currentTarget
            .getBoundingClientRect();

        const x =
          (
            event.clientX
            - rect.left
          )
          / rect.width
          - 0.5;

        const y =
          (
            event.clientY
            - rect.top
          )
          / rect.height
          - 0.5;

        setPointer({
          x: x * 20,
          y: y * 15,
        });

      }}

      onPointerLeave={() =>
        setPointer({
          x: 0,
          y: 0,
        })
      }
    >


      {/* -----------------------------------------
          TOP CAMPAIGN META
      ------------------------------------------ */}

      <div className="gadda-campaign-top">

        <span>
          {kicker}
        </span>

        <span>
          CAMPAIGN / 01
        </span>

      </div>



      {/* -----------------------------------------
          MAIN CAMPAIGN
      ------------------------------------------ */}

      <div className="gadda-campaign-grid">


        {/* COPY */}

        <div className="gadda-campaign-copy">

          <div className="gadda-campaign-mini">
            GADDA HI HAI YAAR.
          </div>


          <h1 className="gadda-campaign-headline">

            <span>
              {headlineTop}
            </span>

            <strong>
              {headlineBottom}
            </strong>

          </h1>


          <p className="gadda-campaign-body">
            {body}
          </p>


          <Link
            href={href}
            className="gadda-campaign-cta"
          >
            {cta}
          </Link>

        </div>



        {/* PRODUCT / CAMPAIGN VISUAL */}

        <div className="gadda-campaign-visual">

          <div
            className="gadda-campaign-big-word"
            aria-hidden="true"
          >
            GADDA
          </div>


          <div
            className="gadda-campaign-sun"
            aria-hidden="true"
          />


          <div
            className="gadda-campaign-product"
          >

            {image ? (
              <img
                src={image}
                alt={
                  selectedProduct?.name
                  || "GADDA mattress"
                }
                draggable={false}
              />
            ) : (
              <div className="gadda-campaign-placeholder">
                PRODUCT
                <br />
                ARTWORK
              </div>
            )}

          </div>


          <div
            className="gadda-campaign-arrow"
            aria-hidden="true"
          >
            ↙
          </div>


          <div className="gadda-campaign-product-name">

            <small>
              TODAY&apos;S GADDA
            </small>

            <strong>
              {selectedProduct?.name
                || "GADDA"}
            </strong>

          </div>



          {/* TACKY STICKERS */}

          {stickers.map(
            (sticker, index) => (

              <span
                key={`${sticker}-${index}`}
                className={
                  `gadda-sticker ` +
                  `gadda-sticker-${index + 1}`
                }
              >
                {sticker}
              </span>

            )
          )}


          <div className="gadda-campaign-starburst">

            <span>
              {config.promoBadge
                || "ACCHA WALA"}
            </span>

          </div>

        </div>


      </div>



      {/* -----------------------------------------
          MARKETING PROOF STRIP
      ------------------------------------------ */}

      <div className="gadda-campaign-proof">

        {proof.map(
          (item, index) => (

            <div key={item}>

              <span>
                0{index + 1}
              </span>

              <strong>
                {item}
              </strong>

            </div>

          )
        )}

      </div>


      <div className="gadda-campaign-corner">

        {config.cornerNote
          || "CHANGE THIS CAMPAIGN WHENEVER YOU FEEL LIKE IT →"}

      </div>

    </section>

  );

}
