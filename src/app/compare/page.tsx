import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HelpStrip from "@/components/store/HelpStrip";
import CompareClient, { type CompareProduct } from "@/components/store/CompareClient";
import { getStoreData } from "@/lib/store";
import { money, type Mattress } from "@/lib/catalog";
import { BUSINESS, warrantyLabel } from "@/lib/business";
import { swatchFor } from "@/lib/content";
import { getSizing, type SizeRow } from "@/lib/sizes";
import { copyText } from "@/lib/site-copy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare mattresses",
  description: "GADDA Regular, Pro and Ultimate side by side: pick your bed size and see all three prices, feel, layers and upgrades.",
  alternates: { canonical: "/compare" },
};

/* the one-line answer to "which one?", same words as the FAQ */
const PICK_IF: Record<string, string> = {
  "gadda-regular": "You like it firm and want the best price.",
  "gadda-pro": "You want firm support with a softer top. It suits most people.",
  "gadda-ultimate": "You like a plush, sink-in-a-little feel.",
};

/* "Cool memory foam" → "cool memory foam", but "32D HR foam" stays as it is */
const lower = (t: string) => (/^[A-Z][a-z]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);

function upgrades(p: Mattress) {
  return (p.options || []).flatMap((o) =>
    o.choices
      .filter((c) => c.priceAdd > 0)
      .map((c) => {
        const swapped = c.swap ? p.layers[c.swap.index]?.name : "";
        return `${c.label}${swapped ? ` instead of ${lower(swapped)}` : ""}, ${money(c.priceAdd)} more`;
      }),
  );
}

export default async function ComparePage() {
  const { products, site } = await getStoreData();
  const sizing = getSizing(site);

  const list: CompareProduct[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    picture: p.cardImage?.trim() || p.image,
    firmness: p.firmness,
    pickIf: PICK_IF[p.slug] || p.kicker,
    basePrice: p.basePrice,
    layers: p.layers.map((l) => ({ name: l.name, swatch: swatchFor(l.visualKind, l.name) })),
    upgrades: upgrades(p),
    heights: p.heights,
    sizes: p.sizes as SizeRow[],
    warranty: warrantyLabel(p.slug),
  }));

  return (
    <>
      <Header />
      <main id="main">
        <header className="g-page-head">
          <div className="g-wrap">
            <nav aria-label="Breadcrumb">
              <ol className="g-crumbs">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li aria-current="page">Compare</li>
              </ol>
            </nav>
            <h1 className="g-h1" style={{ fontSize: "clamp(2.4rem, 5.6vw, 4.6rem)" }}>
              All three, side by side
            </h1>
            <p className="g-lede">
              Pick your bed size once and see what each one costs in it. Below that, only what&apos;s actually different
              between them.
            </p>
          </div>
        </header>

        <CompareClient
          products={list}
          pick={site.homeStoryProductSlug}
          pickLabel={copyText(site, "rangePick")}
          trialNights={BUSINESS.trialNights}
          customSizes={sizing.customEnabled ? { fee: sizing.customFee } : null}
        />

        <HelpStrip />
      </main>
      <Footer />
    </>
  );
}
