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

      <main className="gadda-shop-page">

        <section className="gadda-shop-hero">

          <div className="gadda-shop-hero-top">

            <span>
              THE GADDA MENU
            </span>

            <span>
              {String(products.length).padStart(2, "0")} GADDE
            </span>

          </div>


          <div className="gadda-shop-hero-grid">

            <div>

              <p className="gadda-shop-kicker">
                SHOP MATTRESSES
              </p>

              <h1>
                KAUNSA
                <br />
                GADDA?
              </h1>

            </div>


            <div className="gadda-shop-hero-side">

              <p>
                Feel dekh.
                <br />
                Support dekh.
                <br />
                Phir gadda dekh.
              </p>

              <div className="gadda-shop-hero-sticker">
                GADDA
                <br />
                HI HAI
                <br />
                YAAR.
              </div>

            </div>

          </div>


          <div className="gadda-shop-rule">

            <span>
              SCROLL THE MENU ↓
            </span>

            <span>
              SIZE + HEIGHT PRODUCT PAGE PE
            </span>

          </div>

        </section>



        <section className="gadda-shop-list">

          <div className="gadda-shop-list-head">

            <span>
              PICK BY PROBLEM.
            </span>

            <span>
              NOT JARGON.
            </span>

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
