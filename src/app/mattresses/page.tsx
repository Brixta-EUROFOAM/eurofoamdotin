import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductListing from "@/components/store/ProductListing";
import TrustStrip from "@/components/store/TrustStrip";
import HelpStrip from "@/components/store/HelpStrip";
import JsonLd from "@/components/store/JsonLd";
import { getStoreData } from "@/lib/store";
import { breadcrumbLd } from "@/lib/seo";
import { siteUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mattresses — firm, balanced and plush",
  description: "All three GADDA mattresses: Regular, Pro and Ultimate. Every size in 6 or 8 inch, one honest price, delivery included.",
  alternates: { canonical: "/mattresses" },
};

export default async function MattressesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { products, site } = await getStoreData();
  const nonce = (await headers()).get("x-nonce") || undefined;

  return (
    <>
      <Header />
      <JsonLd
        nonce={nonce}
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Mattresses", path: "/mattresses" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: siteUrl(`/mattresses/${p.slug}`), name: p.name })),
          },
        ]}
      />
      <main id="main">
        <header className="g-page-head">
          <div className="g-wrap">
            <nav aria-label="Breadcrumb">
              <ol className="g-crumbs">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li aria-current="page">Mattresses</li>
              </ol>
            </nav>
            <h1 className="g-h1" style={{ fontSize: "clamp(2.4rem, 5.6vw, 4.6rem)" }}>
              {q ? <>Mattresses matching &ldquo;{q}&rdquo;</> : "All mattresses"}
            </h1>
            <p className="g-lede">
              Three of them, because that&apos;s all most homes need. Not sure?{" "}
              <Link href="/sleep-quiz" className="g-link">
                Take the quiz
              </Link>{" "}
              or{" "}
              <Link href="/compare" className="g-link">
                compare them
              </Link>
              .
            </p>
          </div>
        </header>
        <section className="g-section g-section--tight">
          <div className="g-wrap">
            <ProductListing products={products} query={q} pick={site.homeStoryProductSlug} />
          </div>
        </section>
        <TrustStrip />
        <HelpStrip />
      </main>
      <Footer />
    </>
  );
}
