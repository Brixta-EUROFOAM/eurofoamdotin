import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductBuyBox from "@/components/ProductBuyBox";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/store/ProductGallery";
import JsonLd from "@/components/store/JsonLd";
import SewnLabel from "@/components/store/SewnLabel";
import Faq from "@/components/store/Faq";
import Reviews from "@/components/store/Reviews";
import { money } from "@/lib/catalog";
import { getProduct, getStoreData } from "@/lib/store";
import { BUSINESS, SIZE_GUIDE, warrantyLabel } from "@/lib/business";
import { swatchFor } from "@/lib/content";
import { breadcrumbLd, productLd } from "@/lib/seo";
import { realEmail, phoneLink } from "@/lib/contact";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Mattress not found" };
  return {
    title: `${p.name} — ${p.firmness} mattress from ${money(p.basePrice)}`,
    description: `${p.shortDescription} ${BUSINESS.trialNights}-night trial, delivery included, pay on delivery.`,
    alternates: { canonical: `/mattresses/${p.slug}` },
    openGraph: { title: p.name, description: p.shortDescription, images: [{ url: p.image }] },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const mattress = await getProduct(slug);
  if (!mattress) notFound();

  const { products, reviews, site } = await getStoreData();
  const nonce = (await headers()).get("x-nonce") || undefined;
  const others = products.filter((p) => p.slug !== mattress.slug);
  const mine = reviews.filter((r) => r.product?.toLowerCase().includes(mattress.name.toLowerCase()));
  const warranty = warrantyLabel(mattress.slug);
  const phone = phoneLink(site.phone);
  const email = realEmail(site.email);
  const maxPrice =
    mattress.basePrice +
    Math.max(...mattress.sizes.map((s) => s.priceAdd)) +
    Math.max(...mattress.heights.map((h) => h.priceAdd)) +
    (mattress.options || []).reduce((sum, o) => sum + Math.max(...o.choices.map((c) => c.priceAdd)), 0);

  return (
    <>
      <Header />
      <JsonLd
        nonce={nonce}
        data={[
          productLd(mattress),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Mattresses", path: "/mattresses" },
            { name: mattress.name, path: `/mattresses/${mattress.slug}` },
          ]),
        ]}
      />
      <main id="main">
        <div className="g-wrap">
          <nav aria-label="Breadcrumb" style={{ paddingTop: 20 }}>
            <ol className="g-crumbs">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/mattresses">Mattresses</Link>
              </li>
              <li aria-current="page">{mattress.name}</li>
            </ol>
          </nav>
          <div className="g-pdp">
            <ProductGallery name={mattress.name} image={mattress.image} gallery={mattress.gallery} layers={mattress.layers} />
            <ProductBuyBox mattress={mattress} trialNights={BUSINESS.trialNights} warranty={warranty} />
          </div>
        </div>

        <section className="g-section g-section--cream" aria-labelledby="inside-title">
          <div className="g-wrap g-split" style={{ alignItems: "start" }}>
            <div>
              <h2 className="g-h2" id="inside-title">
                What&apos;s inside, top to bottom
              </h2>
              <p className="g-lede">{mattress.longDescription}</p>
              <ul className="g-vs-list" style={{ marginTop: 24 }}>
                {mattress.features.map((f) => (
                  <li key={f}>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="g-layers">
              {mattress.layers.map((layer) => (
                <div className="g-layer" key={layer.name}>
                  <span className="g-layer-swatch" style={{ background: swatchFor(layer.visualKind, layer.name) }} aria-hidden="true" />
                  <div>
                    <b>{layer.name}</b>
                    <p>{layer.description}</p>
                    {[layer.material, layer.thickness, layer.density && `Density ${layer.density}`].filter(Boolean).length ? (
                      <small>{[layer.material, layer.thickness, layer.density && `Density ${layer.density}`].filter(Boolean).join(", ")}</small>
                    ) : null}
                  </div>
                </div>
              ))}
              {(mattress.options || []).map((o) => (
                <p key={o.id} className="g-note" style={{ textAlign: "left", margin: 0 }}>
                  {o.label}: choose {o.choices.map((c) => c.label).join(" or ")} above.
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="g-section" aria-labelledby="specs-title">
          <div className="g-wrap g-split" style={{ alignItems: "start" }}>
            <div>
              <h2 className="g-h2" id="specs-title">
                The details
              </h2>
              <p className="g-lede">
                Everything the label on the mattress says, here before you buy. Questions?{" "}
                <Link href="/contact" className="g-link">
                  Ask us
                </Link>
                .
              </p>
            </div>
            <SewnLabel
              title={
                <>
                  {mattress.name}
                  <small>Read this label before you buy</small>
                </>
              }
              rows={[
                ["Feel", mattress.firmness],
                [
                  "Sizes",
                  mattress.sizes
                    .map((s) => {
                      const g = SIZE_GUIDE.find((x) => x.label === s.label);
                      return g ? `${s.label} (${g.inches})` : s.label;
                    })
                    .join(", "),
                ],
                ["Heights", mattress.heights.map((h) => h.label).join(", ")],
                ["Price (MRP, incl. all taxes)", `${money(mattress.basePrice)} to ${money(maxPrice)}, by size, height and options`],
                ["Net quantity", "1 mattress"],
                ["Country of origin", BUSINESS.countryOfOrigin],
                [
                  "Manufactured and marketed by",
                  `${BUSINESS.legalName}${BUSINESS.manufacturerAddress.length ? `, ${BUSINESS.manufacturerAddress.join(", ")}` : ""}`,
                ],
                [
                  "Trial",
                  <>
                    {BUSINESS.trialNights} nights. <Link href="/policies/trial">Terms</Link>
                  </>,
                ],
                [
                  "Warranty",
                  <>
                    {warranty}. <Link href="/policies/warranty">What&apos;s covered</Link>
                  </>,
                ],
                ["Consumer care", [phone?.label, email, BUSINESS.supportHours].filter(Boolean).join(", ")],
              ]}
            />
          </div>
        </section>

        <div id="reviews">
          <Reviews reviews={mine} />
        </div>

        <Faq limit={5} nonce={nonce} title={`Questions about the ${mattress.name}`} id="pdp-faq" />

        {others.length ? (
          <section className="g-section g-section--cream" aria-labelledby="others-title">
            <div className="g-wrap">
              <div className="g-head">
                <h2 className="g-h2" id="others-title">
                  The other two
                </h2>
                <Link href="/compare" className="g-btn g-btn--ghost">
                  Compare all three
                </Link>
              </div>
              <div className="g-products g-products--two g-rail">
                {others.map((p) => (
                  <ProductCard key={p.slug} mattress={p} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
