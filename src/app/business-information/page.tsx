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
  title: "Business Information | Eurofoam",
  description:
    "Official business information for Eurofoam, a seller of pillows and mattresses.",
};


export default function BusinessInformationPage() {
  return (
    <>
      <Header />

      <main className="bg-[#f7f4ee] text-ink">
        <section className="mx-auto max-w-5xl px-5 py-16 sm:py-20 lg:px-8 lg:py-24">

          <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">

            <div className="border-b border-black/10 px-6 py-8 sm:px-10 sm:py-10">

              <p className="text-xs font-black uppercase tracking-[0.18em] text-black/45">
                Official Business Information
              </p>

              <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
                Eurofoam
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-black/60">
                This page provides the legal business identity and the
                products and services offered through the Eurofoam website.
              </p>

            </div>


            <div className="grid gap-0 md:grid-cols-2">

              <section className="border-b border-black/10 p-6 sm:p-10 md:border-b-0 md:border-r">

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">
                  Legal business name
                </p>

                <p className="mt-3 text-2xl font-semibold">
                  {BUSINESS_LEGAL_NAME}
                </p>

              </section>


              <section className="p-6 sm:p-10">

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">
                  Nature of business
                </p>

                <p className="mt-3 text-xl font-semibold">
                  {BUSINESS_ACTIVITY}
                </p>

              </section>

            </div>


            <section className="border-t border-black/10 px-6 py-8 sm:px-10">

              <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">
                About the business
              </p>

              <p className="mt-4 max-w-3xl text-base leading-7 text-black/65">
                {BUSINESS_DESCRIPTION}
              </p>

            </section>


            <section className="border-t border-black/10 px-6 py-8 sm:px-10">

              <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">
                Products offered
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                {BUSINESS_PRODUCTS.map((product) => (
                  <div
                    key={product}
                    className="rounded-2xl border border-black/10 bg-[#f7f4ee] px-5 py-4"
                  >
                    <div className="font-semibold">
                      {product}
                    </div>

                    <div className="mt-1 text-sm text-black/50">
                      Available through Eurofoam.
                    </div>
                  </div>
                ))}

              </div>

            </section>


            <section className="border-t border-black/10 bg-black/[0.025] px-6 py-6 sm:px-10">

              <p className="text-sm leading-6 text-black/55">
                The EUROFOAM name and website are operated under the legal
                business name <strong className="text-black/75">Eurofoam</strong>.
                Eurofoam sells pillows and mattresses.
              </p>

            </section>

          </div>

        </section>
      </main>

      <Footer />
    </>
  );
}
