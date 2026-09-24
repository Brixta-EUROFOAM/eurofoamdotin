import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MattressesPage() {
  const { products } = await getStoreData();

  return (
    <>
      <Header />

      <main className="site-shop">

        <section className="site-shop-hero">

          <div className="site-page-meta">
            <span>THE GADDA RANGE</span>
            <span>{String(products.length).padStart(2, "0")} GADDAS</span>
          </div>

          <div className="site-shop-title">

            <div>
              <p className="site-orange">
                YOU KNOW WHAT MATTERS NOW.
              </p>

              <h1>
                PICK THE
                <br />
                JOB.
                <br />
                <em>THEN THE GADDA.</em>
              </h1>
            </div>

            <div className="site-shop-side">
              <p>
                No fifty almost-identical models.
                No mattress naming maze.
              </p>

              <strong>
                START WITH WHAT
                <br />
                YOU WANT IT TO DO.
              </strong>
            </div>

          </div>

        </section>


        <section className="site-shop-guide">

          <div>
            <span>01</span>
            <strong>SUPPORT</strong>
            <p>Stable, medium-firm everyday sleep.</p>
          </div>

          <div>
            <span>02</span>
            <strong>COOLING</strong>
            <p>For people who tend to sleep warm.</p>
          </div>

          <div>
            <span>03</span>
            <strong>BOUNCE</strong>
            <p>More response. Easier movement.</p>
          </div>

          <div>
            <span>04</span>
            <strong>SIMPLE</strong>
            <p>The basics done properly.</p>
          </div>

        </section>


        <section className="gadda-shop-list">

          <div className="gadda-shop-list-head">
            <span>THE MENU</span>
            <span>PICK BY PROBLEM. NOT JARGON.</span>
          </div>

          {products.map((mattress, index) => (
            <ProductCard
              key={mattress.slug}
              mattress={mattress}
              index={index}
            />
          ))}

        </section>

      </main>

      <Footer />
    </>
  );
}
