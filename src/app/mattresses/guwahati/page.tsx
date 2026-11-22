import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/store/JsonLd";
import { breadcrumbLd, faqLd } from "@/lib/seo";
import { getStoreData } from "@/lib/store";
import { money } from "@/lib/catalog";
import { mattressPrice } from "@/lib/mattress-pricing";
import { BUSINESS } from "@/lib/business";


export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Mattresses in Guwahati | GADDA",
  description: "Shop Regular, Pro and Ultimate mattresses in Guwahati. Compare prices, sizes, foam density and delivery eligibility by PIN code.",
  alternates: { canonical: "/mattresses/guwahati" },
  openGraph: { title: "Mattresses in Guwahati | GADDA", description: "GADDA mattress sizes, specifications, pricing and PIN-based delivery checks for Guwahati, Assam.", url: "/mattresses/guwahati" },
  twitter: { card: "summary_large_image" },
};

const questions = [
  { q: "Where can I buy a mattress online in Guwahati?", a: "You can compare and order GADDA Regular, Pro and Ultimate mattresses through the GADDA website. Check your Guwahati delivery PIN code on the mattress product page before buying. The website publishes material layers, available sizes, price and policies for comparison; a local walk-in showroom is not currently advertised." },
  { q: "Do you sell high-density and orthopedic-style mattresses in Guwahati?", a: "GADDA Pro lists a 32D high-resilience foam support core, while Ultimate lists a 40D high-resilience core. Firmness and feel differ across the line. 'Orthopedic' is not a substitute for an individual clinical recommendation; compare the product construction and your support preferences before ordering." },
  { q: "How quickly can a GADDA mattress reach Guwahati?", a: "Delivery time is not a guaranteed blanket 24-hour or 48-hour promise. Use the delivery PIN checker on the product page to see the current estimated window for your location. GADDA confirms delivery details before dispatch, and estimates can change with transporter availability." },
  { q: "Can I order a custom-size mattress?", a: "The website offers selectable standard dimensions and a custom measurement option when available. To order a custom size, measure the inside dimensions of the frame and choose the thickness you need. The checkout price is calculated from your chosen mattress, area and available upgrades." },
  { q: "Where can I compare 6-inch and 8-inch mattress prices in Assam?", a: "Open a GADDA product page and select the exact bed dimensions and thickness to see the calculated amount. Regular and Pro have 6-inch and 8-inch options, while Ultimate has 8-inch and 10-inch options. Confirm your Assam or Meghalaya PIN code for delivery eligibility before checkout." },
  { q: "Can I order a mattress in Meghalaya as well as Guwahati?", a: "GADDA sells to eligible delivery PIN codes in Assam and Meghalaya. Not every address in either state is automatically serviceable; enter your six-digit PIN code to check availability and an estimated delivery window." },
];

export default async function GuwahatiMattressesPage() {
  const { products } = await getStoreData();
  const nonce = (await headers()).get("x-nonce") || undefined;
  // Identical dimensions and thickness, never a misleading cross-size base-price comparison.
  const referenceSize = "Queen 75 × 60 in";
  const referenceHeight = "8 inch";
  const sameSize = products.map((product) => ({
    product,
    total: mattressPrice(product, referenceSize, referenceHeight),
  }));
  const hasComparison = sameSize.length === 3 && sameSize.every((item) => item.total !== null);
  return <>
    <Header />
    <JsonLd nonce={nonce} data={[
      breadcrumbLd([{ name: "Home", path: "/" }, { name: "Mattresses", path: "/mattresses" }, { name: "Guwahati", path: "/mattresses/guwahati" }]),
      faqLd(questions),
    ]} />
    <main id="main">
      <header className="g-page-head"><div className="g-wrap">
        <nav aria-label="Breadcrumb"><ol className="g-crumbs"><li><Link href="/">Home</Link></li><li><Link href="/mattresses">Mattresses</Link></li><li aria-current="page">Guwahati</li></ol></nav>
        <h1 className="g-h1">Mattresses in Guwahati, Assam</h1>
        <p className="g-lede">GADDA offers Regular, Pro and Ultimate mattresses online for customers searching in Guwahati. Compare the published layer construction, exact bed sizes, starting prices and trial terms before ordering. Delivery serviceability and timing depend on your PIN code; check that on each product page.</p>
        <Link className="g-btn g-btn--orange" href="/mattresses">Shop mattresses</Link>
      </div></header>
      <section className="g-section"><div className="g-wrap">
        <h2 className="g-h2">Which GADDA mattress should I compare?</h2>
        <p className="g-lede">Regular is the base foam option; Pro uses memory foam and a 32D HR support core with an optional pocket-spring configuration; Ultimate uses cooling memory foam, adaptive foam and a 40D HR support core with an optional latex upgrade. Verify the exact chosen construction and price on the product page.</p>
        <div className="g-chart"><table><caption>Actual catalogue details and currently displayed prices</caption>
          <thead><tr><th scope="col">Model</th><th scope="col">Core / support</th><th scope="col">Listed heights</th><th scope="col">Starting price (INR)</th></tr></thead>
          <tbody>{products.map((p) => <tr key={p.slug}>
            <th scope="row"><Link href={`/mattresses/${p.slug}`}>{p.name}</Link></th>
            <td>{p.layers.filter((l) => l.density).map((l) => `${l.name} ${l.density}`).join(", ") || p.layers.at(-1)?.name || "See product"}</td>
            <td>{p.heights.map((h) => h.label).join(", ")}</td><td>{money(p.basePrice)}</td>
          </tr>)}</tbody></table></div>
        <p>Displayed starting prices include GST and the site's advertised logistics allowance. Optional springs, latex, thickness, size and custom cutting affect the final selling price.</p>
      </div></section>
      {hasComparison ? (
        <section className="g-section" aria-labelledby="equal-size-prices"><div className="g-wrap">
          <h2 className="g-h2" id="equal-size-prices">Foam gadda price in Guwahati: compare the same size</h2>
          <p className="g-lede">Searching for a queen-size gadda price or an 8-inch foam mattress? These are current base-configuration prices for the same Queen 75 × 60 in size and 8-inch thickness. Optional layers change the amount.</p>
          <div className="g-chart"><table>
            <caption>Comparable GADDA prices for Queen 75 × 60 in, 8-inch, no upgrades</caption>
            <thead><tr><th scope="col">Model</th><th scope="col">Support / feel</th><th scope="col">Price, including GST and delivery allowance</th><th scope="col">Next step</th></tr></thead>
            <tbody>{sameSize.map(({ product, total }) => (
              <tr key={product.slug}><th scope="row">{product.name}</th><td>{product.firmness}</td><td>{money(total!)}</td><td><Link href={`/mattresses/${product.slug}?size=${encodeURIComponent(referenceSize)}&height=${encodeURIComponent(referenceHeight)}`}>Choose size &amp; check delivery</Link></td></tr>
            ))}</tbody>
          </table></div>
          <p>Prices are computed from the same calculator as checkout. Confirm your eligible Assam or Meghalaya delivery PIN code before ordering. The 100-night trial is subject to the <Link href="/policies/trial">published terms</Link>.</p>
          <p><Link className="g-btn g-btn--orange" href="/sleep-quiz#sleepmatch">Find the right feel</Link> <Link className="g-link" href="/compare">Explore all configurations</Link></p>
        </div></section>
      ) : null}
      <section className="g-section g-section--cream"><div className="g-wrap">
        <h2 className="g-h2">What should I check against traditional and online mattress brands?</h2>
        <p>Different manufacturers publish different construction details. A reliable comparison requires checking each specific model's density, verified edge support, cover construction, delivery charges, trial terms and actual size. Generic claims about all traditional or online brands are not evidence of their real product specifications.</p>
        <div className="g-chart"><table><caption>Verification checklist, not unsupported competitor performance claims</caption><thead><tr>
          <th scope="col">Criterion</th><th scope="col">GADDA catalogue</th><th scope="col">Traditional / legacy mattress</th><th scope="col">Generic online foam mattress</th>
        </tr></thead><tbody>
          <tr><th scope="row">Core density</th><td>Pro 32D HR; Ultimate 40D HR</td><td>Verify model specification</td><td>Verify model specification</td></tr>
          <tr><th scope="row">Edge reinforcement</th><td>Not yet independently documented</td><td>Verify model specification</td><td>Verify model specification</td></tr>
          <tr><th scope="row">Glue / inspection zip</th><td>Not verified; do not assume</td><td>Verify model specification</td><td>Verify model specification</td></tr>
          <tr><th scope="row">Delivered price</th><td>Shown by selected size and PIN</td><td>Request all-inclusive quote</td><td>Check checkout total</td></tr>
          <tr><th scope="row">Trial terms</th><td>{BUSINESS.trialNights}-night policy, subject to terms</td><td>Read model-specific terms</td><td>Read model-specific terms</td></tr>
        </tbody></table></div>
      </div></section>
      <section className="g-section"><div className="g-wrap g-prose" style={{maxWidth:920}}>
        <h2 className="g-h2">Guwahati mattress buying questions</h2>
        {questions.map((f) => <article key={f.q}><h3>{f.q}</h3><p>{f.a}</p></article>)}
        <p><Link href="/size-guide">Mattress size guide</Link> · <Link href="/policies/shipping">Delivery policy</Link> · <Link href="/contact">Contact GADDA</Link></p>
      </div></section>
    </main>
    <Footer />
  </>;
}
