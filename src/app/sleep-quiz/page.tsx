import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SleepQuiz from "@/components/SleepQuiz";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find the Right Mattress | SleepMatch Quiz",
  description: "Mattress too firm, too soft or too hot? Try GADDA SleepMatch to compare three mattresses by feel, support, sleeping position and price.",
  alternates: { canonical: "/sleep-quiz" },
};

export default async function SleepQuizPage() {
  const { products } = await getStoreData();
  return (
    <>
      <Header />
      <main id="main">
        <section className="g-section" style={{ background: "var(--g-cream)", paddingBottom: 24 }}>
          <div className="g-wrap" style={{ maxWidth: 920 }}>
            <p className="g-chip g-chip--orange">GADDA SleepMatch · Free mattress finder</p>
            <h1 className="g-h1">Don't buy the wrong mattress. Find your fit first.</h1>
            <p className="g-lede">Too firm? Sinking too far? Waking up hot? Tell us your biggest mattress problem and how you sleep. Our transparent quiz recommends one of three GADDA constructions and explains why.</p>
            <p>It is a buying shortlist, not a diagnosis or a guarantee. Your answers are not sold and you can see a recommendation without subscribing.</p>
            <a className="g-btn g-btn--orange" href="#quiz">Find my match — start the quiz</a>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16, marginTop: 32 }}>
              <div className="g-card-flat" style={{ padding: 18 }}><h2 className="g-h3">Want a steady, firmer feel?</h2><p>Explore support vs sink and avoid unnecessary extras.</p><Link className="g-link" href="/guides/mattress-too-soft">Check sinking and support</Link></div>
              <div className="g-card-flat" style={{ padding: 18 }}><h2 className="g-h3">Too hard on shoulders?</h2><p>Understand comfort layers and pressure points.</p><Link className="g-link" href="/guides/mattress-too-firm">Compare firmness and comfort</Link></div>
              <div className="g-card-flat" style={{ padding: 18 }}><h2 className="g-h3">Waking up too warm?</h2><p>Compare material, cover and bedroom factors.</p><Link className="g-link" href="/guides/sleeping-hot-on-mattress">Explore sleeping cooler</Link></div>
            </div>
          </div>
        </section>

        <section id="quiz" className="g-section" style={{ minHeight: "70vh" }}>
          <div className="g-wrap">
            <SleepQuiz products={products} />
            <p className="g-note" style={{ marginTop: 40 }}>
              A shortlist, not a medical opinion. If you have a back condition, ask your doctor what they recommend.
            </p>
          </div>
        </section>
        <section className="g-section" style={{ background: "var(--g-cream)" }}>
          <div className="g-wrap" style={{ maxWidth: 900 }}>
            <h2 className="g-h2">How SleepMatch works</h2>
            <p>SleepMatch looks at your main concern, preferred firmness, sleeping position, whether you share the bed, your temperature preference and your budget. The score is a simple recommendation heuristic; it isn't AI-powered medical advice or a laboratory measurement.</p>
            <h3 className="g-h3">Three mattress constructions, three different trade-offs</h3>
            <p><Link className="g-link" href="/mattresses/gadda-regular">GADDA Regular</Link> offers a firmer, simpler foam construction and the lowest catalogue starting price. <Link className="g-link" href="/mattresses/gadda-pro">GADDA Pro</Link> adds a memory-foam comfort layer over HR support, with optional pocket springs. <Link className="g-link" href="/mattresses/gadda-ultimate">GADDA Ultimate</Link> offers a more plush feel with a cooling-memory-foam comfort layer and an optional latex upgrade. No material is right for every sleeper.</p>
            <h3 className="g-h3">The questions to ask before paying</h3>
            <p>A mattress can look right online and still feel wrong at home. Verify your bed measurements, layer construction, actual final price and delivery eligibility. Read the written trial exclusions and pickup conditions rather than relying on a large '100 nights' badge.</p>
            <p><Link className="g-link" href="/guides/mattress-trial-returns">Read our plain-English trial and returns checklist</Link>, then check GADDA's <Link className="g-link" href="/policies/trial">published policy</Link>. We currently screen delivery to Assam and Meghalaya by PIN code; the quiz alone does not establish serviceability.</p>
            <h2 className="g-h2">Common questions</h2>
            <h3 className="g-h3">Is SleepMatch free?</h3><p>Yes. No purchase or marketing-email signup is required to see your recommendation. An optional signup may be offered before the result; you can skip it.</p>
            <h3 className="g-h3">Will this help diagnose back pain?</h3><p>No. SleepMatch helps compare firmness and surface feel, not medical conditions. Consult a qualified professional about persistent pain.</p>
            <h3 className="g-h3">Can I return any mattress after 100 nights?</h3><p>Do not assume so. Read the specific product and order eligibility, condition requirements, exclusions, fees, timelines and pickup instructions in the applicable policy.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
