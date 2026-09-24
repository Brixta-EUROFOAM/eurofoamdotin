import type { Metadata } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import {
  BUSINESS_ACTIVITY,
  BUSINESS_DESCRIPTION,
  BUSINESS_LEGAL_NAME,
  BUSINESS_PRODUCTS,
} from "@/lib/business";

export const metadata: Metadata = {
  title: "Business Information | GADDA",
  description:
    "Official business information for GADDA, a seller of pillows and mattresses.",
};

export default function BusinessInformationPage() {

  return (
    <>
      <Header />

      <main className="site-business">

        <section className="site-business-head">

          <p className="site-orange">
            THE BORING-BUT-IMPORTANT BIT.
          </p>

          <h1>
            OFFICIAL
            <br />
            BUSINESS
            <br />
            INFORMATION.
          </h1>

          <p>
            Legal identity, business activity and the products
            sold through the GADDA website.
          </p>

        </section>


        <section className="site-business-sheet">

          <div className="site-business-row">

            <span>
              LEGAL BUSINESS NAME
            </span>

            <strong>
              {BUSINESS_LEGAL_NAME}
            </strong>

          </div>


          <div className="site-business-row">

            <span>
              NATURE OF BUSINESS
            </span>

            <strong>
              {BUSINESS_ACTIVITY}
            </strong>

          </div>


          <div className="site-business-block">

            <span>
              ABOUT THE BUSINESS
            </span>

            <p>
              {BUSINESS_DESCRIPTION}
            </p>

          </div>


          <div className="site-business-block">

            <span>
              PRODUCTS OFFERED
            </span>

            <div className="site-business-products">

              {BUSINESS_PRODUCTS.map(
                (product, index) => (
                  <div key={product}>
                    <small>
                      {String(index + 1).padStart(2, "0")}
                    </small>

                    <strong>
                      {product}
                    </strong>
                  </div>
                )
              )}

            </div>

          </div>


          <div className="site-business-note">
            GADDA is the brand name used for the sale of pillows
            and mattresses under the legal business entity
            {" "}
            <strong>
              {BUSINESS_LEGAL_NAME}
            </strong>.
          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}
