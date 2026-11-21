import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SleepQuiz from "@/components/SleepQuiz";
import ProductVisual from "@/components/store/ProductVisual";
import { getStoreData } from "@/lib/store";
import { money } from "@/lib/catalog";
import "./sleepmatch.css";

/* GADDA SleepMatch V3: restrained, product-first buying interface. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SleepMatch: Find Your Mattress in 4 Questions | GADDA",
  description: "Mattress too hard, sinking too much or sleeping hot? Answer 4 questions, compare GADDA Regular, Pro and Ultimate, view your size-based price, and continue to checkout.",
  alternates: { canonical: "/sleep-quiz" },
  openGraph: {
    title: "SleepMatch — Find the mattress that fits how you sleep",
    description: "Four practical questions. A clear recommendation. Real product specifications and size-based prices.",
    url: "/sleep-quiz",
  },
};

const resources = [
  {
    number: "01", title: "My mattress feels too hard",
    summary: "Learn the difference between firmness and the cushioning around shoulders and hips.",
    guide: "/guides/mattress-too-firm", problem: "firm",
  },
  {
    number: "02", title: "I sink too far into my mattress",
    summary: "Understand how the comfort layer and support core affect the overall feel.",
    guide: "/guides/mattress-too-soft", problem: "sinking",
  },
  {
    number: "03", title: "I sleep too hot at night",
    summary: "Compare foam, fabric and bedroom factors without exaggerated cooling promises.",
    guide: "/guides/sleeping-hot-on-mattress", problem: "hot",
  },
];

export default async function SleepQuizPage() {
  const { products } = await getStoreData();
  return (
    <>
      <Header />
      <main id="main" className="sm-page">
        <section className="sm-hero" aria-labelledby="sm-title">
          <div className="g-wrap sm-hero-layout">
            <div className="sm-hero-copy">
              <p className="sm-hero-eyebrow">GADDA / SLEEPMATCH</p>
              <h1 id="sm-title">Find the mattress that fits how you sleep.</h1>
              <p className="sm-hero-lede">Tell us what feels wrong with your current bed. Four quick answers narrow it down to one GADDA mattress, with a clear reason and a real price for your size.</p>
              <div className="sm-hero-proof" aria-label="What to expect">
                <div><strong>01</strong><span>Tell us the problem</span></div>
                <div><strong>02</strong><span>See your match</span></div>
                <div><strong>03</strong><span>Choose size and order</span></div>
              </div>
              <a href="#sleepmatch" className="sm-hero-cta">Start the 4-question match <span aria-hidden="true">→</span></a>
              <p className="sm-hero-note">Free. No account or email address required. Your recommendation is not a medical diagnosis.</p>
            </div>
            <div className="sm-hero-quiz" id="sleepmatch">
              <SleepQuiz products={products} />
            </div>
          </div>
          <div className="sm-hero-footer"><div className="g-wrap"><span>Three mattresses, compared by construction and feel</span><Link href="/compare">Compare all three →</Link></div></div>
        </section>

        <section className="sm-three" aria-labelledby="sm-products-heading">
          <div className="g-wrap">
            <div className="sm-section-intro">
              <p className="sm-kicker">PRODUCT RANGE</p>
              <h2 id="sm-products-heading">Three mattresses. Different reasons to choose each.</h2>
              <p>These are the actual GADDA constructions behind your SleepMatch recommendation. The quiz considers how you sleep; you make the final choice.</p>
            </div>
            <div className="sm-comparison-scroll" role="region" aria-label="GADDA mattress comparison" tabIndex={0}>
              <table className="sm-compare-table">
                <thead><tr><th scope="col">Mattress</th><th scope="col">Feel</th><th scope="col">Construction</th><th scope="col">Starting price</th><th scope="col"><span className="g-sr">Shop</span></th></tr></thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.slug}>
                      <th scope="row">
                        <div className="sm-product-ident">
                          <div className="sm-product-image"><ProductVisual image={product.cardImage || product.image} layers={product.layers} alt={`${product.name} mattress`} /></div>
                          <div><strong>{product.name}</strong><span>{product.kicker}</span></div>
                        </div>
                      </th>
                      <td>{product.firmness}</td>
                      <td className="sm-product-desc">{product.shortDescription}</td>
                      <td className="sm-product-price">{money(product.basePrice)}<small>From · GST included</small></td>
                      <td><Link className="sm-product-link" href={`/mattresses/${product.slug}?variant=true`}>Choose size <span aria-hidden="true">→</span></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="sm-table-note">Final prices depend on dimensions, thickness and optional upgrades. Check delivery serviceability before placing an order.</p>
          </div>
        </section>

        <section className="sm-problems" aria-labelledby="sm-problems-title">
          <div className="g-wrap sm-resource-layout">
            <div className="sm-resource-intro">
              <p className="sm-kicker">BUYER'S GUIDE</p>
              <h2 id="sm-problems-title">Know the problem. Choose with confidence.</h2>
              <p>Need more detail before answering? Start with a short practical guide, then continue directly into a quiz with your problem already selected.</p>
            </div>
            <div className="sm-resource-list">
              {resources.map((item) => (
                <article className="sm-resource" key={item.number}>
                  <span className="sm-resource-index">{item.number}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <div className="sm-resource-links"><Link href={item.guide}>Read the guide</Link><Link href={`/sleep-quiz?problem=${item.problem}#sleepmatch`}>Find my match →</Link></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sm-help" aria-labelledby="sm-help-title">
          <div className="g-wrap sm-help-layout">
            <div>
              <p className="sm-kicker">BEFORE YOU ORDER</p>
              <h2 id="sm-help-title">A good match includes the details.</h2>
              <p>Mattress feel is personal. We show the materials and the price, but you should also verify dimensions, serviceability and return eligibility.</p>
              <Link href="/guides/mattress-trial-returns">Understand trial and return terms →</Link>
            </div>
            <div className="sm-help-checks">
              <p><b>01</b><span>Measure the inside of your bed frame. <Link href="/size-guide">Size guide</Link></span></p>
              <p><b>02</b><span>Confirm the exact dimensions, thickness and options.</span></p>
              <p><b>03</b><span>Check delivery to your Assam or Meghalaya PIN code.</span></p>
              <p><b>04</b><span>Read the <Link href="/policies/trial">100-night trial conditions</Link> before payment.</span></p>
            </div>
          </div>
        </section>

        <section className="sm-faq" aria-labelledby="sm-faq-title">
          <div className="g-wrap sm-faq-layout">
            <h2 id="sm-faq-title">Questions before you choose</h2>
            <div>
              <details><summary>Will SleepMatch ask for my email?</summary><p>No. You can see a product recommendation and its size-based price without signing up.</p></details>
              <details><summary>Is the recommended mattress guaranteed to help my back pain?</summary><p>No. SleepMatch compares comfort preferences and mattress construction. It does not diagnose or treat any medical condition.</p></details>
              <details><summary>How much will my mattress cost?</summary><p>Select a size, exact dimensions, thickness and available upgrades on the results screen. The price updates before you continue to checkout.</p></details>
              <details><summary>What about delivery and the 100-night trial?</summary><p>GADDA currently checks delivery eligibility in Assam and Meghalaya. Return eligibility depends on the <Link href="/policies/trial">published trial policy</Link>.</p></details>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
