import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type GuideProps = {
  eyebrow: string;
  problem?: "firm" | "sinking" | "hot";
  title: string;
  summary: string;
  explain: { heading: string; text: string }[];
  recommendation: { name: string; href: string; reason: string } | null;
  faqs: { question: string; answer: string }[];
};

/** Search-visible, genuinely informative guides; no unsupported medical or competing-brand claims. */
export default function ProblemGuide({ eyebrow, problem, title, summary, explain, recommendation, faqs }: GuideProps) {
  const matchHref = problem ? `/sleep-quiz?problem=${problem}#sleepmatch` : "/sleep-quiz#sleepmatch";
  return <>
    <Header />
    <main id="main">
      <section className="g-section" style={{ background: "var(--g-cream)" }}>
        <div className="g-wrap" style={{ maxWidth: 850 }}>
          <nav aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/sleep-quiz">SleepMatch</Link> / {eyebrow}</nav>
          <p className="g-chip g-chip--orange" style={{ marginTop: 22 }}>{eyebrow}</p>
          <h1 className="g-h1">{title}</h1>
          <p className="g-lede">{summary}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 25 }}>
            <Link className="g-btn g-btn--orange" href={matchHref}>Find my match — {problem ? "3" : "4"} quick questions</Link>
            <Link className="g-btn g-btn--ghost" href="/compare">Compare all three mattresses</Link>
          </div>
        </div>
      </section>
      <section className="g-section"><div className="g-wrap" style={{ maxWidth: 850 }}>
        <h2 className="g-h2">What to check before choosing another mattress</h2>
        {explain.map((item) => <div key={item.heading} style={{ margin: "28px 0" }}>
          <h3 className="g-h3">{item.heading}</h3><p>{item.text}</p>
        </div>)}
        {recommendation && <section aria-label="GADDA product suggestion" className="g-card-flat" style={{ padding: 25, marginTop: 28 }}>
          <p className="g-chip g-chip--orange">A GADDA option to consider</p>
          <h2 className="g-h3"><Link className="g-link" href={`${recommendation.href}?variant=true`}>{recommendation.name}</Link></h2>
          <p>{recommendation.reason}</p>
          <p>Not a universal match. Use the quiz to compare your sleep position, preferred feel, temperature, sharing and budget.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href={matchHref} className="g-btn g-btn--orange">Check my match</Link>
            <Link href={`${recommendation.href}?variant=true`} className="g-btn g-btn--ghost">Choose size & buy</Link>
          </div>
        </section>}
      </div></section>
      <section className="g-section" style={{ background: "var(--g-cream)" }}><div className="g-wrap" style={{ maxWidth: 850 }}>
        <h2 className="g-h2">Common questions</h2>
        {faqs.map((f) => <div key={f.question} style={{ margin: "26px 0" }}><h3 className="g-h3">{f.question}</h3><p>{f.answer}</p></div>)}
        <div style={{ margin: "28px 0" }}><Link href={matchHref} className="g-btn g-btn--orange">Find my mattress & see the price</Link></div>
        <p className="g-note">This is buying guidance, not medical advice. Ongoing or severe pain deserves professional assessment. Mattress comfort and product performance are individual; no quiz can guarantee a result.</p>
        <p className="g-note">GADDA currently screens deliveries in Assam and Meghalaya. Check your PIN and published <Link className="g-link" href="/policies/shipping">delivery terms</Link> before ordering. Read the <Link className="g-link" href="/policies/trial">100-night trial conditions and exclusions</Link> before relying on the offer.</p>
      </div></section>
    </main>
    <Footer />
  </>;
}
