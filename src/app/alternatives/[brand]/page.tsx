import type { Metadata } from "next";
import "../../sleep-quiz/sleepmatch.css";
import "../../sleep-quiz/sleepmatch-extra.css";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/store/JsonLd";
import ProductVisual from "@/components/store/ProductVisual";
import { getStoreData } from "@/lib/store";
import { money } from "@/lib/catalog";
import { breadcrumbLd } from "@/lib/seo";
import { alternativeBySlug, ALTERNATIVES } from "@/lib/sleepmatch-alternatives";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ brand: string }> };
export function generateStaticParams() { return ALTERNATIVES.map((a) => ({ brand: a.slug })); }
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { brand } = await params;
  const data = alternativeBySlug(brand);
  if (!data) return { title: "Comparison not found", robots: { index: false } };
  return { title: `${data.brand} Mattress Alternatives & Buyer Checklist`, description: data.description,
    alternates: { canonical: `/alternatives/${data.slug}` },
    openGraph: { title: data.title, description: data.description, url: `/alternatives/${data.slug}` } };
}

export default async function AlternativePage({ params }: Params) {
  const { brand } = await params;
  const data = alternativeBySlug(brand);
  if (!data) notFound();
  const { products } = await getStoreData();
  const nonce = (await headers()).get("x-nonce") || undefined;
  const primary = products.find((p) => p.slug === data.recommendedSlug);
  return <>
    <Header />
    <JsonLd nonce={nonce} data={[
      breadcrumbLd([{ name: "Home", path: "/" }, { name: "Mattress alternatives", path: "/alternatives" }, { name: `${data.brand} alternatives`, path: `/alternatives/${data.slug}` }]),
      { "@context": "https://schema.org", "@type": "WebPage", name: data.title,
        description: data.description, about: { "@type": "Thing", name: "Mattress comparison and purchase checklist" },
        isPartOf: { "@type": "WebSite", name: "GADDA", url: "https://gadda.store" } },
    ]} />
    <main id="main" className="sm5-alt-page sm-page">
      <div className="g-wrap sm5-alt-wrap">
        <nav aria-label="Breadcrumb" className="sm5-alt-crumb"><Link href="/">GADDA</Link> / <Link href="/alternatives">Mattress alternatives</Link> / {data.brand}</nav>
        <p className="sm5-alt-eyebrow">INDEPENDENT MATTRESS BUYING GUIDE</p>
        <h1>{data.title}</h1>
        <p className="sm5-alt-summary">{data.intro}</p>
        <div className="sm5-alt-two">
          <div>
            <section aria-labelledby="decision-title"><h2 id="decision-title">What to check before choosing an alternative</h2>
              {data.questions.map((item, i) => <article key={item.heading} className="sm5-alt-question"><span>{String(i+1).padStart(2,"0")}</span><div><h3>{item.heading}</h3><p>{item.answer}</p></div></article>)}
            </section>
            <section className="sm5-alt-checklist" aria-labelledby="checklist-title"><h2 id="checklist-title">Your pre-purchase checklist</h2><ul>{data.checklist.map((c) => <li key={c}>{c}</li>)}</ul></section>
            <section className="sm5-alt-disclosure" aria-label="Review source and independence">
              <h2>About the reviews people search for</h2>
              <p>Third-party review platforms can help identify questions to ask, but experiences vary and complaints may later be resolved. We have not independently verified any individual allegation. Read current policies directly from the relevant seller before relying on them.</p>
              <p><a href={data.reviewUrl} target="_blank" rel="noopener noreferrer">{data.reviewLabel} ↗</a></p>
              <small>GADDA is an independent seller. This page is not affiliated with or endorsed by {data.brand}; it does not reproduce or claim to match that brand's proprietary technology.</small>
            </section>
          </div>
          <aside className="sm5-alt-aside" aria-labelledby="gadda-answer-title">
            <span>THE GADDA APPROACH</span><h2 id="gadda-answer-title">Compare by the actual construction.</h2>
            <p>{data.gaddaAngle}</p>
            {primary ? <div className="sm5-alt-product"><div><ProductVisual image={primary.cardImage || primary.image} layers={primary.layers} alt={`${primary.name} mattress`} /></div><h3>{primary.name}</h3><p>{primary.shortDescription}</p><p className="sm5-alt-price">From {money(primary.basePrice)} <small>size and upgrades change final price</small></p><Link href={`/mattresses/${primary.slug}`}>See product details →</Link></div> : null}
            <Link href={`/sleep-quiz?problem=${data.problemParam}#sleepmatch`} className="sm5-alt-main-cta">Find my GADDA match →</Link>
            <p className="sm5-alt-caveat">Four questions, no signup required. Only Assam and Meghalaya PIN codes are screened for delivery.</p>
          </aside>
        </div>
        <section className="sm5-alt-faq" aria-labelledby="alt-faq-title"><h2 id="alt-faq-title">Frequently asked questions</h2>{data.faq.map((x) => <details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>)}</section>
        {data.slug === "the-sleep-company-mattress" ? <section className="sm5-alt-other" aria-label="Official return guidance">
          <h2>Already bought and want to return it?</h2>
          <p>Read the original seller's terms and contact their support before buying a replacement. <Link href="/guides/the-sleep-company-mattress-return">Steps to request The Sleep Company mattress return →</Link></p>
        </section> : null}
        <div className="sm5-alt-other"><h2>Continue comparing</h2>{ALTERNATIVES.filter((x) => x.slug !== data.slug).map((x)=><Link href={`/alternatives/${x.slug}`} key={x.slug}>{x.brand} alternatives →</Link>)}<Link href="/guides/mattress-trial-returns">Understand trial and returns →</Link></div>
      </div>
    </main><Footer />
  </>;
}
