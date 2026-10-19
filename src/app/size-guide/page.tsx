import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HelpStrip from "@/components/store/HelpStrip";
import HindiNote from "@/components/store/HindiNote";
import MeasureGuide from "@/components/store/MeasureGuide";
import { getStoreData } from "@/lib/store";
import { money } from "@/lib/catalog";
import { LENGTHS, SIZE_GROUPS, getSizing, toCm } from "@/lib/sizes";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Mattress size guide — how to measure your bed",
  description: "Measure your bed in 40 seconds and pick the right mattress size: Single, Double, Queen, King or any custom size, in inches and cm.",
  alternates: { canonical: "/size-guide" },
};

const BEDS = [
  { t: "Box / storage bed", b: "Measure inside the raised edge. Check the lid still opens with the mattress height you pick — 6 inch is safest." },
  { t: "Wooden cot or plain frame", b: "Measure between the inner edges of the side rails, at both ends. Use the smaller number." },
  { t: "Diwan or day bed", b: "Usually a Single (72 × 30 or 72 × 36) or a narrow Double. Measure it — older diwans can be narrower; Custom covers that." },
  { t: "On the floor", b: "Any size works. Pick by who sleeps on it: Single for one, Queen for two." },
];

export default async function SizeGuidePage() {
  const { site, products } = await getStoreData();
  const sizing = getSizing(site);
  const cheapest = products[0];

  return (
    <>
      <Header />
      <main id="main">
        <section className="g-section" aria-labelledby="sg-title">
          <div className="g-wrap g-split" style={{ alignItems: "start" }}>
            <div>
              <h1 className="g-h1" id="sg-title" style={{ fontSize: "clamp(2.6rem, 6vw, 4.6rem)" }}>
                Find your size in 40 seconds.
              </h1>
              <HindiNote>नाप लो, फिर लो</HindiNote>
              <p className="g-lede">
                Grab a measuring tape. Measure the bed, not the old mattress. Then pick the size row that matches — every
                product page has the same chart with prices.
              </p>
              <p className="g-lede" style={{ fontSize: "1rem" }}>{sizing.fitNote}</p>
              <div className="g-hero-cta">
                <Link href="/mattresses" className="g-btn g-btn--orange">
                  Shop mattresses
                </Link>
                {cheapest ? (
                  <Link href={`/mattresses/${cheapest.slug}?variant=true`} className="g-btn g-btn--ghost">
                    Open the size picker
                  </Link>
                ) : null}
              </div>
            </div>
            <MeasureGuide sizing={sizing} />
          </div>
        </section>

        <section className="g-section g-section--cream" aria-labelledby="std-title">
          <div className="g-wrap">
            <div className="g-head">
              <h2 className="g-h2" id="std-title">
                Standard sizes
              </h2>
              <p className="g-lede">Length is always 72, 75 or 78 inches (6 ft, 6 ft 3, 6 ft 6). Breadth decides the size.</p>
            </div>
            <div className="g-sg-grid">
              {SIZE_GROUPS.map((g) => (
                <article className="g-sg-card" key={g.id}>
                  <div className="g-sg-shape" aria-hidden="true">
                    <span style={{ width: `${(g.widths[g.widths.length - 1] / 72) * 100}%` }} />
                  </div>
                  <h3>{g.id}</h3>
                  <p>{g.fits}</p>
                  <table>
                    <tbody>
                      {g.widths.map((w) => (
                        <tr key={w}>
                          <th scope="row">{w} in wide</th>
                          <td>
                            {LENGTHS.map((l) => `${l}`).join(" / ")} × {w} in
                            <small>
                              {LENGTHS.map((l) => toCm(l)).join(" / ")} × {toCm(w)} cm
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <span className="g-sg-common">
                    Most common: {g.common[0]} × {g.common[1]} in
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="g-section" aria-labelledby="bed-title">
          <div className="g-wrap">
            <h2 className="g-h2" id="bed-title">
              What kind of bed do you have?
            </h2>
            <div className="g-split" style={{ marginTop: 28, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {BEDS.map((b) => (
                <div key={b.t} style={{ borderTop: "2px solid var(--g-orange)", paddingTop: 14 }}>
                  <h3 className="g-h3">{b.t}</h3>
                  <p style={{ color: "var(--g-ink-2)", margin: "8px 0 0" }}>{b.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {sizing.customEnabled ? (
          <section className="g-section g-section--ink" aria-labelledby="custom-title">
            <div className="g-wrap g-split">
              <div>
                <h2 className="g-h2" id="custom-title">
                  Odd-sized bed? We&apos;ll cut one to fit.
                </h2>
                <p className="g-lede">
                  On any mattress, choose <b>Custom</b> in the size picker and type the length and breadth (
                  {sizing.minLength}–{sizing.maxLength} × {sizing.minWidth}–{sizing.maxWidth} inches). It&apos;s priced as
                  the next standard size up{sizing.customFee ? ` + ${money(sizing.customFee)} for the custom cut` : ""}, and
                  the price shows before you order.
                </p>
              </div>
              <div style={{ alignSelf: "center" }}>
                <Link href="/mattresses" className="g-btn g-btn--orange">
                  Pick a mattress
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <HelpStrip />
      </main>
      <Footer />
    </>
  );
}
