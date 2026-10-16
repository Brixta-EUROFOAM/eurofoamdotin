import Link from "next/link";
import { getStoreData } from "@/lib/store";
import { phoneLink, realEmail, whatsappLink } from "@/lib/contact";
import { BUSINESS } from "@/lib/business";
import { IconMail, IconPhone, IconWhatsApp } from "@/components/store/Icons";
import HindiNote from "@/components/store/HindiNote";

export default async function HelpStrip() {
  const { site } = await getStoreData();
  const phone = phoneLink(site.phone);
  const wa = whatsappLink(site.phone);
  const email = realEmail(site.email);

  return (
    <section className="g-section g-section--tight g-section--cream" aria-labelledby="help-title">
      <div className="g-wrap g-help">
        <div>
          <h2 className="g-h2" id="help-title">
            Still deciding? Talk to a person.
          </h2>
          <HindiNote>बात करें</HindiNote>
          <p className="g-lede">
            No sales script. Tell us how you sleep and what you&apos;re sleeping on now, and we&apos;ll tell you which
            one to get — or if you don&apos;t need a new mattress at all. {BUSINESS.supportHours}.
          </p>
        </div>
        <div className="g-help-ways">
          {wa ? (
            <a className="g-btn" href={wa} target="_blank" rel="noopener noreferrer">
              <IconWhatsApp width={20} height={20} /> WhatsApp us
            </a>
          ) : null}
          {phone ? (
            <a className="g-btn g-btn--ghost" href={phone.href}>
              <IconPhone width={18} height={18} /> {phone.label}
            </a>
          ) : null}
          {email ? (
            <a className="g-btn g-btn--ghost" href={`mailto:${email}`}>
              <IconMail width={18} height={18} /> Email
            </a>
          ) : null}
          {!wa && !phone && !email ? (
            <Link className="g-btn" href="/contact">
              Contact us
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
