import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteCommerceEndcap from "@/components/SiteCommerceEndcap";
import { money } from "@/lib/catalog";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const { products } = await getStoreData();

  const rows = [
    ["STARTS AT", (m: typeof products[number]) => money(m.basePrice)],
    ["FEEL", (m: typeof products[number]) => m.firmness],
    ["BEST FOR", (m: typeof products[number]) => m.kicker],
    ["TRIAL", (m: typeof products[number]) => m.trial],
    ["WARRANTY", (m: typeof products[number]) => m.warranty],
    ["MAIN JOB", (m: typeof products[number]) => m.features[0] || "—"],
    ["LAYERS", (m: typeof products[number]) => `${m.layers.length} explained layers`],
  ] as const;

  return (
    <>
      <Header />

      <main className="site-compare site-public-v2">
        <section className="site-compare-head">
          <div className="site-page-meta site-page-meta-dark">
            <span>COMPARE GADDAS</span>
            <span>{products.length} MODELS · SAME QUESTIONS</span>
          </div>

          <div className="site-compare-head-grid">
            <div>
              <p className="site-orange">STILL TORN?</p>
              <h1>PUT THEM<br />SIDE BY<br /><em>SIDE.</em></h1>
            </div>

            <div className="site-compare-head-side">
              <p>
                Same rows. Same language. No opening four product tabs just to work out what actually changed.
              </p>
              <Link href="/sleep-quiz">TOO MUCH? FIND MY MATCH →</Link>
            </div>
          </div>
        </section>

        <section className="site-compare-table-wrap">
          <table className="site-compare-table">
            <thead>
              <tr>
                <th>WHAT MATTERS</th>
                {products.map((product) => (
                  <th key={product.slug}>
                    <Link href={`/mattresses/${product.slug}`} className="site-compare-product">
                      <img src={product.image} alt="" />
                      <small>{product.category}</small>
                      <strong>{product.name}</strong>
                      <span>★ {product.rating} · {product.reviews.toLocaleString("en-IN")} reviews</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map(([label, render]) => (
                <tr key={label}>
                  <th>{label}</th>
                  {products.map((product) => <td key={product.slug}>{render(product)}</td>)}
                </tr>
              ))}

              <tr className="site-compare-buy-row">
                <th>READY?</th>
                {products.map((product) => (
                  <td key={product.slug}>
                    <Link href={`/mattresses/${product.slug}`}>CHOOSE {product.name.toUpperCase()} →</Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>

        <SiteCommerceEndcap
          eyebrow="THE TABLE DIDN'T DECIDE IT?"
          title="ANSWER FOUR QUESTIONS INSTEAD."
        />
      </main>

      <Footer />
    </>
  );
}
