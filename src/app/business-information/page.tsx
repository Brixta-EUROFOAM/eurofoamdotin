import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BUSINESS, BUSINESS_ACTIVITY, BUSINESS_DESCRIPTION, BUSINESS_PRODUCTS } from "@/lib/business";
import { getStoreData } from "@/lib/store";
import { phoneLink, realEmail } from "@/lib/contact";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Business information",
  description: "Official business information for GADDA, a seller of pillows and mattresses.",
  alternates: { canonical: "/business-information" },
};

export default async function BusinessInformationPage() {
  const { site } = await getStoreData();
  const phone = phoneLink(site.phone);
  const email = realEmail(site.email);

  const rows: [string, string][] = [
    ["Legal business name", BUSINESS.legalName],
    ["Brand", BUSINESS.brand],
    ["Nature of business", BUSINESS_ACTIVITY],
    ["Products", BUSINESS_PRODUCTS.join(", ")],
    ["Registered office", BUSINESS.registeredAddress.join(", ")],
    ["Manufacturing address", BUSINESS.manufacturerAddress.join(", ")],
    ["GSTIN", BUSINESS.gstin],
    ["Registration number", BUSINESS.registrationNo],
    ["Country of origin of goods", BUSINESS.countryOfOrigin],
    ["Customer care", [phone?.label, email].filter(Boolean).join(", ")],
    ["Support hours", BUSINESS.supportHours],
    ["Grievance Officer", [BUSINESS.grievanceOfficer.name, BUSINESS.grievanceOfficer.email].filter(Boolean).join(", ")],
  ];

  return (
    <>
      <Header />
      <main id="main">
        <header className="g-page-head">
          <div className="g-wrap">
            <h1 className="g-h1" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}>
              Business information
            </h1>
            <p className="g-lede">{BUSINESS_DESCRIPTION}</p>
          </div>
        </header>
        <section className="g-section g-section--tight">
          <div className="g-wrap" style={{ maxWidth: 900 }}>
            <dl className="g-kv">
              {rows
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} style={{ display: "contents" }}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
            <p style={{ marginTop: 24 }}>
              Policies: <Link href="/policies/terms" className="g-link">Terms of sale</Link>,{" "}
              <Link href="/policies/privacy" className="g-link">Privacy</Link>,{" "}
              <Link href="/policies/grievance" className="g-link">Grievance redressal</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
