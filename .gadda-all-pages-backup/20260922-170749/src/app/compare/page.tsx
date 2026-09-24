import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  ] as const;

  return (
    <>
      <Header />

      <main className="site-compare">

        <section className="site-compare-head">

          <p className="site-orange">
            STILL TORN?
          </p>

          <h1>
            PUT THEM
            <br />
            SIDE BY
            <br />
            <em>SIDE.</em>
          </h1>

          <p>
            Same questions. Same rows. No product-page gymnastics.
          </p>

        </section>


        <section className="site-compare-table-wrap">

          <table className="site-compare-table">

            <thead>
              <tr>
                <th>WHAT MATTERS</th>

                {products.map((product) => (
                  <th key={product.slug}>
                    <small>{product.category}</small>
                    <strong>{product.name}</strong>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>

              {rows.map(([label, render]) => (
                <tr key={label}>

                  <th>{label}</th>

                  {products.map((product) => (
                    <td key={product.slug}>
                      {render(product)}
                    </td>
                  ))}

                </tr>
              ))}

              <tr className="site-compare-buy-row">
                <th>ENOUGH INFO?</th>

                {products.map((product) => (
                  <td key={product.slug}>
                    <Link href={`/mattresses/${product.slug}`}>
                      SEE {product.name.toUpperCase()} →
                    </Link>
                  </td>
                ))}

              </tr>

            </tbody>

          </table>

        </section>

      </main>

      <Footer />
    </>
  );
}
