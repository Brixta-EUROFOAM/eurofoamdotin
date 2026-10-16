import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Faq from "@/components/store/Faq";
import CallbackForm from "@/components/store/CallbackForm";
import { getStoreData } from "@/lib/store";
import { BUSINESS } from "@/lib/business";
import { phoneLink, realEmail, whatsappLink } from "@/lib/contact";
import { IconMail, IconPhone, IconWhatsApp } from "@/components/store/Icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Help & contact",
  description: "Call, WhatsApp or email GADDA. Real people, working hours, no bots.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { site } = await getStoreData();
  const nonce = (await headers()).get("x-nonce") || undefined;
  const phone = phoneLink(site.phone);
  const wa = whatsappLink(site.phone);
  const email = realEmail(site.email);

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
                <li aria-current="page">Help &amp; contact</li>
              </ol>
            </nav>
            <h1 className="g-h1" style={{ fontSize: "clamp(2.4rem, 5.6vw, 4.6rem)" }}>
              Talk to a person
            </h1>
            <p className="g-lede">{BUSINESS.supportHours}. Outside those hours, leave a message and we&apos;ll reply the next working day.</p>
          </div>
        </header>

        <section className="g-section g-section--tight">
          <div className="g-wrap g-split" style={{ alignItems: "start" }}>
            <div style={{ display: "grid", gap: 14 }}>
              {wa ? (
                <a className="g-card-flat" href={wa} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "flex", gap: 16, alignItems: "center" }}>
                  <IconWhatsApp width={30} height={30} style={{ color: "#1f8f55" }} />
                  <div>
                    <b>WhatsApp</b>
                    <div style={{ color: "var(--g-ink-2)" }}>Fastest for questions, photos of your bed, order updates</div>
                  </div>
                </a>
              ) : null}
              {phone ? (
                <a className="g-card-flat" href={phone.href} style={{ textDecoration: "none", display: "flex", gap: 16, alignItems: "center" }}>
                  <IconPhone width={28} height={28} style={{ color: "var(--g-indigo)" }} />
                  <div>
                    <b>Call {phone.label}</b>
                    <div style={{ color: "var(--g-ink-2)" }}>{BUSINESS.supportHours}</div>
                  </div>
                </a>
              ) : null}
              {email ? (
                <a className="g-card-flat" href={`mailto:${email}`} style={{ textDecoration: "none", display: "flex", gap: 16, alignItems: "center" }}>
                  <IconMail width={28} height={28} style={{ color: "var(--g-indigo)" }} />
                  <div>
                    <b>{email}</b>
                    <div style={{ color: "var(--g-ink-2)" }}>For anything that needs a paper trail</div>
                  </div>
                </a>
              ) : null}
              <div className="g-card-flat">
                <b>Already ordered?</b>
                <p style={{ margin: "6px 0 12px", color: "var(--g-ink-2)" }}>Check where your mattress is with your order number and phone.</p>
                <Link href="/track-order" className="g-btn g-btn--ghost g-btn--sm">
                  Track your order
                </Link>
              </div>
              <div className="g-card-flat">
                <b>A complaint we haven&apos;t sorted out?</b>
                <p style={{ margin: "6px 0 12px", color: "var(--g-ink-2)" }}>Write to our Grievance Officer — they must reply within 48 hours.</p>
                <Link href="/policies/grievance" className="g-link">
                  Grievance redressal
                </Link>
              </div>
            </div>
            <CallbackForm />
          </div>
        </section>

        <Faq nonce={nonce} title="Common questions" />
      </main>
      <Footer />
    </>
  );
}
