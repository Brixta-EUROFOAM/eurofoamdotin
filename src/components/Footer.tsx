import Link from "next/link";
import { getStoreData } from "@/lib/store";
import { BUSINESS } from "@/lib/business";
import { phoneLink, realEmail, whatsappLink } from "@/lib/contact";
import { CookieSettingsLink } from "@/components/store/ConsentProvider";
import NewsletterForm from "@/components/store/NewsletterForm";
import { IconWhatsApp } from "@/components/store/Icons";
import SewnLabel from "@/components/store/SewnLabel";

export default async function Footer() {
  const { site, products } = await getStoreData();
  const phone = phoneLink(site.phone);
  const email = realEmail(site.email);
  const wa = whatsappLink(site.phone);

  return (
    <footer className="g-footer">
      {wa ? (
        <a className="g-wa" href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat with GADDA on WhatsApp">
          <IconWhatsApp />
          <span>Talk to a human</span>
        </a>
      ) : null}

      <div className="g-footer-cover">
        <div className="g-wrap">
          <SewnLabel>
            <div className="g-footer-mark">
              <span>
                <span className="g-logo-latin">GADDA</span>{" "}
                <span className="g-logo-deva" aria-hidden="true">
                  गद्दा
                </span>
              </span>
              <p>
                Made in {BUSINESS.countryOfOrigin} by {BUSINESS.legalName}
              </p>
              <p>{site.tagline || "Gadda hi hai yaar."}</p>
            </div>
          </SewnLabel>
        </div>
      </div>

      <div className="g-wrap g-footer-top">
        <div className="g-footer-brand">
          <Link href="/" className="g-logo" aria-label="GADDA home">
            <span className="g-logo-latin">GADDA</span>
            <span className="g-logo-deva" aria-hidden="true">
              गद्दा
            </span>
          </Link>
          <p>{site.tagline || "Gadda hi hai yaar."} Three honest mattresses, made in India, sold direct.</p>
          <NewsletterForm />
        </div>

        <div>
          <h2>Shop</h2>
          <ul>
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={`/mattresses/${p.slug}`}>{p.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/compare">Compare mattresses</Link>
            </li>
            <li>
              <Link href="/sleep-quiz">Find my match</Link>
            </li>
            <li>
              <Link href="/wishlist">Saved mattresses</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2>Help</h2>
          <ul>
            <li>
              <Link href="/contact">Contact us</Link>
            </li>
            <li>
              <Link href="/track-order">Track your order</Link>
            </li>
            <li>
              <Link href="/policies/shipping">Delivery</Link>
            </li>
            <li>
              <Link href="/policies/trial">100-night trial &amp; returns</Link>
            </li>
            <li>
              <Link href="/policies/cancellation">Cancellations &amp; refunds</Link>
            </li>
            <li>
              <Link href="/policies/warranty">Warranty</Link>
            </li>
            <li>
              <Link href="/contact#faq">FAQs</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2>Talk to us</h2>
          <ul>
            {phone ? (
              <li>
                <a href={phone.href}>{phone.label}</a>
              </li>
            ) : null}
            {wa ? (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
            ) : null}
            {email ? (
              <li>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            ) : null}
            <li>{BUSINESS.supportHours}</li>
            <li>
              <Link href="/why-gadda">Why GADDA</Link>
            </li>
            <li>
              <Link href="/reviews">Reviews</Link>
            </li>
          </ul>
          <div className="g-footer-pay" aria-label="Ways to pay">
            <span>Pay on delivery</span>
            <span>UPI</span>
            <span>Cash</span>
          </div>
        </div>
      </div>

      <div className="g-wrap g-footer-legal">
        <div>
          <p>
            © {new Date().getFullYear()} {BUSINESS.legalName}. GADDA is a brand of {BUSINESS.legalName}.
          </p>
          {BUSINESS.registeredAddress.length ? <p>Registered office: {BUSINESS.registeredAddress.join(", ")}</p> : null}
          {BUSINESS.gstin ? <p>GSTIN: {BUSINESS.gstin}</p> : null}
          <p>All prices are in Indian rupees and include GST. Made in {BUSINESS.countryOfOrigin}.</p>
        </div>
        <nav aria-label="Legal">
          <Link href="/policies/terms">Terms of sale</Link>
          <Link href="/policies/privacy">Privacy</Link>
          <Link href="/policies/cookies">Cookies</Link>
          <CookieSettingsLink className="g-btn-reset" />
          <Link href="/policies/grievance">Grievance officer</Link>
          <Link href="/business-information">Business information</Link>
          <Link href="/sitemap.xml">Sitemap</Link>
        </nav>
      </div>
    </footer>
  );
}
