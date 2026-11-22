import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mattress Problems: Too Hard, Sinking, Hot or Return Issues",
  description: "Uncomfortable mattress? Troubleshoot firmness, sinking, overheating and return problems before switching. Explore practical guides and compare GADDA mattresses where delivery is available.",
  alternates: { canonical: "/guides/mattress-problems" },
  openGraph: {
    title: "Mattress Problems & Solutions | GADDA",
    description: "Identify the issue before buying another mattress. Practical guides on firmness, sagging, heat and returns.",
    url: "/guides/mattress-problems",
  },
};

const problems = [
  { title: "Mattress is too firm", symptom: "Pressure at shoulders or hips, especially when side sleeping", action: "Compare surface cushioning with underlying support; assess the bed base first", href: "/guides/mattress-too-firm", anchor: "Troubleshoot a hard mattress" },
  { title: "Mattress feels soft or is sinking", symptom: "Too much sink, uneven support or visible body impressions", action: "Check foundation, measure sagging and evaluate any warranty before replacing", href: "/guides/mattress-too-soft", anchor: "Check sinking and support" },
  { title: "Mattress feels too hot", symptom: "Warmth or sweat at night", action: "Review room temperature, sheets, protectors and actual material construction", href: "/guides/sleeping-hot-on-mattress", anchor: "Understand mattress heat" },
  { title: "Trial or refund confusion", symptom: "Unclear pickup conditions, exclusions or return deadlines", action: "Read model-specific terms, save the invoice and contact the actual seller", href: "/guides/mattress-trial-returns", anchor: "Understand mattress returns" },
  { title: "Returning a The Sleep Company mattress", symptom: "You need the correct official return channel and eligibility checks", action: "Follow independent instructions linked to the seller's current official trial policy", href: "/guides/the-sleep-company-mattress-return", anchor: "How to request The Sleep Company return" },
];

export default function MattressProblemsPage() {
  return <>
    <Header />
    <main id="main">
      <section className="g-section" style={{ background: "var(--g-cream)" }}>
        <div className="g-wrap" style={{ maxWidth: 930 }}>
          <nav aria-label="Breadcrumb"><Link href="/">Home</Link> / Mattress problems</nav>
          <p className="g-chip g-chip--orange" style={{ marginTop: 22 }}>MATTRESS TROUBLESHOOTING</p>
          <h1 className="g-h1">Your mattress feels wrong. Find out why before buying again.</h1>
          <p className="g-lede">Hardness, sinking, heat, size mismatch and confusing return rules are different problems. Start with the right one. These practical guides explain what to test, what to ask your current seller and which mattress features to compare.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
            <Link href="/sleep-quiz#sleepmatch" className="g-btn g-btn--orange">Find a mattress for my needs</Link>
            <Link href="/compare" className="g-btn g-btn--ghost">Compare all GADDA models</Link>
          </div>
        </div>
      </section>
      <section className="g-section"><div className="g-wrap" style={{ maxWidth: 930 }}>
        <h2 className="g-h2">Choose the problem you're facing</h2>
        <div style={{ display: "grid", gap: 17, marginTop: 24 }}>
          {problems.map((p) => <article key={p.href} className="g-card-flat" style={{ padding: 24 }}>
            <h3 className="g-h3">{p.title}</h3>
            <p><strong>What you may notice:</strong> {p.symptom}.</p>
            <p><strong>What to check:</strong> {p.action}.</p>
            <p><Link className="g-link" href={p.href}>{p.anchor} →</Link></p>
          </article>)}
        </div>
        <h2 className="g-h2" style={{ marginTop: 40 }}>Researching another mattress brand?</h2>
        <p>Our independent <Link className="g-link" href="/alternatives">mattress alternatives checklists</Link> cover buying questions involving Wakefit, SleepyCat and The Sleep Company. They are not customer-service channels for those brands.</p>
        <p className="g-note">GADDA sells and delivers only to eligible PIN codes in Assam and Meghalaya. Compare our <Link className="g-link" href="/policies/trial">published trial terms</Link> and <Link className="g-link" href="/policies/shipping">delivery rules</Link> before ordering. No mattress is guaranteed to resolve a medical problem.</p>
      </div></section>
    </main>
    <Footer />
  </>;
}
