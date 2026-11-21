import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SleepQuiz from "@/components/SleepQuiz";
import ProductVisual from "@/components/store/ProductVisual";
import { getStoreData } from "@/lib/store";
import { money } from "@/lib/catalog";
import "./sleepmatch.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SleepMatch: Find Your Mattress in 4 Questions | GADDA",
  description: "Mattress too hard, sinking too much or sleeping hot? Answer 4 quick questions, see a personalized GADDA mattress match, choose your size and head straight to checkout.",
  alternates: { canonical: "/sleep-quiz" },
  openGraph: {
    title: "Stop guessing. Find your mattress with SleepMatch.",
    description: "Four questions. Three real GADDA mattresses. One recommendation, with clear pricing and no signup.",
    url: "/sleep-quiz",
  },
};

const problems = [
  { n: "01", title: "Too hard?", description: "Understand cushioning, pressure points and support before buying another firm mattress.", guide: "/guides/mattress-too-firm", cta: "Learn about comfort" },
  { n: "02", title: "Sinking too far?", description: "Learn how surface softness and a supportive base differ, and what to look for in each.", guide: "/guides/mattress-too-soft", cta: "Explore steady support" },
  { n: "03", title: "Sleeping too hot?", description: "Understand foam, covers and bedroom temperature without believing exaggerated cooling claims.", guide: "/guides/sleeping-hot-on-mattress", cta: "Explore cooling materials" },
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
              <p className="sm-hero-eyebrow"><span className="sm-hero-dot"/> INTRODUCING GADDA SLEEPMATCH</p>
              <h1 id="sm-title">The wrong mattress costs <em>more than money.</em></h1>
              <p className="sm-hero-lede">Stop guessing. Tell us what&apos;s bothering you. We&apos;ll match you to a real mattress, explain the trade-offs, and show you the price before checkout.</p>
              <div className="sm-hero-proof">
                <div><strong>04</strong><span>Quick questions</span></div>
                <div><strong>03</strong><span>Real mattresses</span></div>
                <div><strong>0</strong><span>Email gates</span></div>
              </div>
              <a href="#sleepmatch" className="sm-hero-cta">Find my mattress <span aria-hidden="true">↗</span></a>
              <p className="sm-hero-note">Free to try. No signup or pressure.</p>
            </div>
            <div className="sm-hero-quiz" id="sleepmatch"><p className="sm-mobile-quiz-intro">Your better mattress starts here.</p><SleepQuiz products={products} /></div>
          </div>
          <div className="sm-hero-footer"><div className="g-wrap"><span>Firmness isn't the whole story.</span><span>Neither is the price tag.</span><span>Find what fits <b>your</b> sleep.</span></div></div>
        </section>

        <section className="sm-three" aria-labelledby="sm-products-heading">
          <div className="g-wrap">
            <div className="sm-section-intro"><p className="sm-kicker">THREE WAYS TO SLEEP BETTER</p><h2 id="sm-products-heading">No twenty-model maze.<br/>Just three meaningful choices.</h2><p>SleepMatch compares the construction and feel of GADDA Regular, Pro and Ultimate. Choose for your needs, not for a flashy badge.</p></div>
            <div className="sm-product-grid">
              {products.map((product, index) => <article className="sm-product" key={product.slug}>
                <div className="sm-product-media"><span>0{index + 1} / GADDA</span><ProductVisual image={product.cardImage || product.image} layers={product.layers} alt={`${product.name} mattress`} /></div>
                <div className="sm-product-text"><div><h3>{product.name}</h3><p>{product.shortDescription}</p></div><div className="sm-product-price"><span>From {money(product.basePrice)}</span><Link href={`/mattresses/${product.slug}?variant=true`}>Choose size & buy <span aria-hidden="true">↗</span></Link></div></div>
              </article>)}
            </div>
          </div>
        </section>

        <section className="sm-problems" aria-labelledby="sm-problems-title">
          <div className="g-wrap">
            <div className="sm-section-intro"><p className="sm-kicker">START WITH YOUR PROBLEM</p><h2 id="sm-problems-title">What&apos;s keeping you up?</h2><p>You can read the science and trade-offs, or go straight to your personalized match.</p></div>
            <div className="sm-problem-grid">{problems.map((problem) => <article className="sm-problem" key={problem.n}>
              <span>{problem.n} / THE PROBLEM</span><h3>{problem.title}</h3><p>{problem.description}</p><Link href={problem.guide}>{problem.cta} ↗</Link>
            </article>)}</div>
          </div>
        </section>

        <section className="sm-help" aria-labelledby="sm-help-title"><div className="g-wrap sm-help-layout">
          <div><p className="sm-kicker">BUY SMARTER</p><h2 id="sm-help-title">Choose the feel.<br/>Know the terms.</h2><p>A mattress that feels comfortable in a showroom may feel different at home. Measure the inside of your bed frame, check your PIN code and read the actual trial terms before you pay.</p><Link href="/guides/mattress-trial-returns">Understand trials and returns ↗</Link></div>
          <div className="sm-help-checks"><p><b>01.</b> Match your preferred firmness and material.</p><p><b>02.</b> Select the exact length, width and thickness.</p><p><b>03.</b> Confirm delivery eligibility for your PIN code.</p><p><b>04.</b> Read the published <Link href="/policies/trial">100-night trial terms</Link>.</p></div>
        </div></section>
        <section className="sm-bottom-cta"><div className="g-wrap"><p className="sm-kicker">READY WHEN YOU ARE</p><h2>Let's get you to the right mattress.</h2><a href="#sleepmatch" className="sm-hero-cta">Find my mattress <span aria-hidden="true">↗</span></a><p>SleepMatch is a preference-based buying guide, not medical advice or a promise of pain relief. For persistent pain, consult a qualified healthcare professional.</p></div></section>
      </main>
      <Footer />
    </>
  );
}
