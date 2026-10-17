import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MattressStack from "@/components/store/MattressStack";
import HelpStrip from "@/components/store/HelpStrip";
import { getStoreData } from "@/lib/store";
import { money } from "@/lib/catalog";
import { BUSINESS, SIZE_GUIDE, warrantyLabel } from "@/lib/business";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare mattresses",
  description: "GADDA Regular, Pro and Ultimate side by side: layers, feel, sizes, heights and prices.",
  alternates: { canonical: "/compare" },
};

export default async function ComparePage() {
  const { products } = await getStoreData();

  const rows: { label: string; cell: (p: (typeof products)[number]) => React.ReactNode }[] = [
    { label: "Feel", cell: (p) => p.firmness },
    { label: "Best for", cell: (p) => p.kicker },
    {
      label: "Layers, top to bottom",
      cell: (p) => (
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          {p.layers.map((l) => (
            <li key={l.name}>{l.name}</li>
          ))}
        </ol>
      ),
    },
    {
      label: "Upgrades",
      cell: (p) =>
        p.options?.length
          ? p.options.map((o) => o.choices.filter((c) => c.priceAdd).map((c) => `${c.label} (+${money(c.priceAdd)})`).join(", ")).join("; ")
          : "None — it's the simple one",
    },
    { label: "Heights", cell: (p) => p.heights.map((h) => h.label).join(", ") },
    ...p_sizes(),
    { label: "Trial", cell: () => `${BUSINESS.trialNights} nights` },
    { label: "Warranty", cell: (p) => warrantyLabel(p.slug) },
    { label: "Delivery", cell: () => "Included" },
  ];

  function p_sizes() {
    const labels = Array.from(new Set(products.flatMap((p) => p.sizes.map((s) => s.label))));
    return labels.map((label) => ({
      label: `${label}, ${products[0]?.heights[0]?.label || ""}`,
      cell: (p: (typeof products)[number]) => {
        const s = p.sizes.find((x) => x.label === label);
        return s ? money(p.basePrice + s.priceAdd) : "—";
      },
    }));
  }

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
            <p className="g-lede">The same facts for every mattress, in the same words. Prices include GST and delivery.</p>
          </div>
        </header>

        <section className="g-section g-section--tight">
          <div className="g-wrap">
            <div className="g-compare-wrap">
              <table className="g-compare" style={{ ["--cols" as string]: products.length }}>
                <caption className="g-sr">Comparison of GADDA mattresses</caption>
                <thead>
                  <tr>
                    <td />
                    {products.map((p) => (
                      <th key={p.slug} scope="col">
                        <div style={{ maxWidth: 220, marginBottom: 14 }}>
                          <MattressStack layers={p.layers} spread="open" />
                        </div>
                        <Link href={`/mattresses/${p.slug}`}>{p.name}</Link>
                        <div style={{ fontWeight: 500, color: "var(--g-ink-2)", marginTop: 4 }}>from {money(p.basePrice)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      {products.map((p) => (
                        <td key={p.slug}>{r.cell(p)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" />
                    {products.map((p) => (
                      <td key={p.slug}>
                        <Link href={`/mattresses/${p.slug}`} className="g-btn g-btn--sm">
                          Choose size
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="g-section g-section--cream" id="sizes" aria-labelledby="sizes-title">
          <div className="g-wrap g-split" style={{ alignItems: "start" }}>
            <div>
              <h2 className="g-h2" id="sizes-title">
                Which size fits your bed?
              </h2>
              <p className="g-lede">
                Measure the inside of your bed frame, not the mattress you have now. If your bed is an odd size,
                WhatsApp us the measurements and we&apos;ll tell you what&apos;s possible.
              </p>
            </div>
            <div className="g-compare-wrap">
              <table className="g-compare g-compare--sizes" style={{ minWidth: 0 }}>
                <thead>
                  <tr>
                    <th scope="col">Size</th>
                    <th scope="col">Dimensions</th>
                    <th scope="col">Good for</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_GUIDE.map((s) => (
                    <tr key={s.label}>
                      <th scope="row" style={{ color: "var(--g-ink)" }}>
                        {s.label}
                      </th>
                      <td>
                        {s.inches}
                        <br />
                        <small style={{ color: "var(--g-ink-3)" }}>{s.cm}</small>
                      </td>
                      <td>{s.fits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <HelpStrip />
      </main>
      <Footer />
    </>
  );
}
