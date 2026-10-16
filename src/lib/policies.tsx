import Link from "next/link";
import type { ReactNode } from "react";
import { BUSINESS } from "@/lib/business";
import { DELIVERY_ZONES, DISPATCH_FROM } from "@/lib/delivery";

/*
  Customer-facing policies. Written in plain English and drafted against:
  - Consumer Protection Act 2019 + Consumer Protection (E-Commerce) Rules 2020
  - CCPA Guidelines for Prevention and Regulation of Dark Patterns 2023
  - Digital Personal Data Protection Act 2023 + DPDP Rules 2025
  - IT Act 2000 s.43A / SPDI Rules 2011, Legal Metrology (Packaged Commodities) Rules 2011

  ⚠ These are a solid starting draft, not legal advice. Have a lawyer
  review them once, and keep BUSINESS (src/lib/business.ts) filled in.
*/

export type Policy = { slug: string; title: string; summary: string; body: (ctx: Ctx) => ReactNode };
type Ctx = { email: string | null; phone: string | null };

const B = BUSINESS;
const G = B.grievanceOfficer;

const contactLine = (ctx: Ctx) =>
  [ctx.phone && `phone ${ctx.phone}`, ctx.email && `email ${ctx.email}`].filter(Boolean).join(", ") || "the contact details on our Contact page";

const officer = (ctx: Ctx) => (
  <table>
    <tbody>
      <tr>
        <th>Name</th>
        <td>{G.name || "To be appointed — until then, write to us using the Contact page"}</td>
      </tr>
      <tr>
        <th>Designation</th>
        <td>{G.designation}</td>
      </tr>
      <tr>
        <th>Email</th>
        <td>{G.email || ctx.email || "See Contact page"}</td>
      </tr>
      {G.phone || ctx.phone ? (
        <tr>
          <th>Phone</th>
          <td>{G.phone || ctx.phone}</td>
        </tr>
      ) : null}
      <tr>
        <th>Address</th>
        <td>{B.registeredAddress.length ? B.registeredAddress.join(", ") : `${B.legalName}, ${B.jurisdictionCity}`}</td>
      </tr>
      <tr>
        <th>Hours</th>
        <td>{B.supportHours}</td>
      </tr>
    </tbody>
  </table>
);

export const POLICIES: Policy[] = [
  {
    slug: "terms",
    title: "Terms of Sale",
    summary: "The agreement when you buy from GADDA.",
    body: (ctx) => (
      <>
        <p>
          These terms apply when you buy from this website. The seller is <b>{B.legalName}</b> (&ldquo;GADDA&rdquo;,
          &ldquo;we&rdquo;){B.registeredAddress.length ? `, ${B.registeredAddress.join(", ")}` : ""}
          {B.gstin ? `, GSTIN ${B.gstin}` : ""}. By placing an order you agree to them. They don&apos;t take away any right
          you have under Indian consumer law.
        </p>

        <h2>Prices</h2>
        <p>
          Every price on the site is the full price in Indian rupees, inclusive of GST and delivery. There is no
          separate &ldquo;MRP&rdquo; that nobody pays, no handling fee, and nothing added at checkout. The price you see
          on the product page for your chosen size, height and options is the price on your invoice. If a price was
          shown wrongly because of an obvious error, we&apos;ll tell you before dispatch and you can cancel for a full
          refund.
        </p>

        <h2>Placing an order</h2>
        <p>
          When you place an order you get an order number. We then call you on the number you gave to confirm the
          details and a delivery time. The contract is formed when we confirm on that call. If we can&apos;t reach you
          after three tries over two working days, we may cancel the order; nothing will have been charged.
        </p>

        <h2 id="payment">Payment</h2>
        <ul>
          <li>
            <b>Pay on delivery</b> — cash or UPI to our delivery team when the mattress arrives.
          </li>
          <li>
            <b>UPI payment link</b> — after we confirm your order we send a payment link from our business account.
          </li>
        </ul>
        <p>
          We never ask for card numbers, OTPs or your UPI PIN over the phone, WhatsApp or email. If anyone does, it
          isn&apos;t us — please report it to us.
        </p>

        <h2>Delivery, trial, returns and warranty</h2>
        <p>
          See the <Link href="/policies/shipping">Delivery</Link>, <Link href="/policies/trial">100-night trial</Link>,{" "}
          <Link href="/policies/cancellation">Cancellation &amp; refunds</Link> and{" "}
          <Link href="/policies/warranty">Warranty</Link> pages. They form part of these terms.
        </p>

        <h2>Product information</h2>
        <p>
          We describe each mattress&apos;s layers and materials as accurately as we can. Foam is cut and laid by hand, so
          a layer may vary slightly in thickness. Colours on screen may differ a little from the real fabric. Country
          of origin: {B.countryOfOrigin}.
        </p>

        <h2>Fair dealing</h2>
        <p>
          We don&apos;t use fake countdown timers, fake stock warnings, pre-ticked add-ons, hidden charges or any other
          practice listed in the CCPA&apos;s Dark Patterns Guidelines, 2023. If you think anything on this site is
          misleading, tell our Grievance Officer.
        </p>

        <h2>Liability</h2>
        <p>
          Nothing in these terms limits our liability where the law doesn&apos;t allow it to be limited, including for
          defective products under the Consumer Protection Act, 2019. Otherwise our liability for an order is limited
          to the amount you paid for it.
        </p>

        <h2>Complaints and disputes</h2>
        <p>
          Contact us first — {contactLine(ctx)}. If we don&apos;t resolve it, write to our{" "}
          <Link href="/policies/grievance">Grievance Officer</Link>. You can also approach the National Consumer
          Helpline (1915 or consumerhelpline.gov.in) or the consumer commission. These terms are governed by Indian
          law; courts at {B.jurisdictionCity} have jurisdiction, without affecting your right to file a consumer
          complaint where you live.
        </p>
      </>
    ),
  },
  {
    slug: "shipping",
    title: "Delivery",
    summary: "Where we deliver, how long it takes and what it costs (nothing).",
    body: () => (
      <>
        <p>
          Delivery is <b>included in every price</b>, anywhere we deliver in India. Mattresses are dispatched from{" "}
          {DISPATCH_FROM} and arrive flat (not rolled), wrapped in protective plastic.
        </p>
        <h2>How long it takes</h2>
        <p>Estimated working days from our confirmation call to your door:</p>
        <table>
          <thead>
            <tr>
              <th>Area</th>
              <th>Estimated time</th>
            </tr>
          </thead>
          <tbody>
            {DELIVERY_ZONES.map((z) => (
              <tr key={z.id}>
                <td>{z.label}</td>
                <td>
                  {z.minDays}–{z.maxDays} working days
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Enter your PIN code on any product page for dates. These are estimates; we confirm a delivery window on the
          phone before dispatch, and call again if anything changes. We currently can&apos;t deliver to Army Post Office
          PIN codes.
        </p>
        <h2>On delivery day</h2>
        <ul>
          <li>Someone needs to be home to receive it. Tell us about stairs, lifts or narrow doors when we call.</li>
          <li>Check the packaging before signing. If it&apos;s damaged, note it on the delivery slip and send us a photo the same day.</li>
          <li>Unwrap it and you can sleep on it the same night. A new-foam smell is normal and fades in a day or two with the windows open.</li>
        </ul>
        <h2>Old mattress</h2>
        <p>We don&apos;t take old mattresses away as standard. Ask on the confirmation call — sometimes we can arrange it locally.</p>
      </>
    ),
  },
  {
    slug: "trial",
    title: "100-night trial & returns",
    summary: "Sleep on it at home. If it's not right, we take it back.",
    body: (ctx) => (
      <>
        <p>
          You get <b>{B.trialNights} nights</b> from the delivery date to decide whether your GADDA is right for you.
        </p>
        <h2>How it works</h2>
        <ol>
          <li>Sleep on it for at least 30 nights. Your body takes a few weeks to adjust to any new mattress, so early verdicts are often wrong.</li>
          <li>Still not happy before night {B.trialNights}? Contact us — {contactLine(ctx)} — with your order number.</li>
          <li>We arrange a pickup from your home at no cost to you.</li>
          <li>Once it&apos;s collected and checked, we refund the full amount you paid within {B.refundDays} working days, to the original UPI account or by bank transfer.</li>
        </ol>
        <h2>The small print</h2>
        <ul>
          <li>One trial return per household.</li>
          <li>The mattress should be clean, dry and undamaged apart from normal use. Using a mattress protector is the easiest way to make sure of that.</li>
          <li>Custom-size mattresses are made just for you and can&apos;t be returned under the trial (warranty still applies).</li>
          <li>The trial is on top of — not instead of — your rights if a mattress arrives damaged or defective. Those are handled as a replacement, at any time.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "cancellation",
    title: "Cancellations & refunds",
    summary: "Changing your mind before and after dispatch.",
    body: () => (
      <>
        <h2>Before dispatch</h2>
        <p>
          Cancel any time before the mattress leaves us, for free, by calling or messaging us. If you&apos;d already paid
          by UPI link, you get the full amount back within {B.refundDays} working days.
        </p>
        <h2>After dispatch</h2>
        <p>
          You can refuse delivery at the door — we&apos;ll take it back and refund anything paid. Once delivered, the{" "}
          <Link href="/policies/trial">{B.trialNights}-night trial</Link> applies.
        </p>
        <h2>If we cancel</h2>
        <p>
          If we ever have to cancel (for example, we can&apos;t deliver to your area), we tell you straight away and refund
          everything. We don&apos;t charge a cancellation fee in either direction.
        </p>
        <h2>Refund timeline</h2>
        <p>
          Refunds go back the way you paid: UPI to the same UPI ID, cash orders by bank transfer to an account you give
          us. Expect it within {B.refundDays} working days of the cancellation or of the mattress being collected.
        </p>
      </>
    ),
  },
  {
    slug: "warranty",
    title: "Warranty",
    summary: "What's covered and how to claim.",
    body: (ctx) => (
      <>
        <p>
          Every GADDA comes with a manufacturer&apos;s warranty from {B.legalName}, starting on the delivery date.
          {Object.keys(B.warrantyYears).length
            ? ` Length: ${Object.entries(B.warrantyYears)
                .map(([k, v]) => `${k.replace(/-/g, " ")} ${v} years`)
                .join(", ")}.`
            : " The warranty length for your mattress is printed on its label and invoice."}
        </p>
        <h2>Covered</h2>
        <ul>
          <li>A permanent dip or sag of more than 1 inch (25 mm) when nobody is lying on it</li>
          <li>Foam that cracks, crumbles or splits under normal use</li>
          <li>Faulty stitching, or a zip that fails, on the cover</li>
          <li>Springs that break or poke through (on pocket-spring options)</li>
        </ul>
        <h2>Not covered</h2>
        <ul>
          <li>Normal softening of the comfort layers — that&apos;s foam settling, not a defect</li>
          <li>Stains, burns, cuts, liquid damage or damage from pets</li>
          <li>Damage from an unsuitable base: broken slats, gaps wider than 3 inches, or a sagging bed frame</li>
          <li>Personal preference about firmness (that&apos;s what the trial is for)</li>
        </ul>
        <h2>How to claim</h2>
        <p>
          Send your order number, a photo of the label, and photos of the problem (a string pulled tight across the
          mattress shows a dip well) — {contactLine(ctx)}. We&apos;ll reply within 48 hours. If it&apos;s covered we repair
          or replace it; if we replace it, the warranty carries on from the original date.
        </p>
      </>
    ),
  },
  {
    slug: "privacy",
    title: "Privacy notice",
    summary: "What we collect, why, and your rights under the DPDP Act.",
    body: (ctx) => (
      <>
        <p>
          {B.legalName} is the <b>Data Fiduciary</b> for personal data collected on this website, under the Digital
          Personal Data Protection Act, 2023. This notice says, in plain words, what we collect and why. We don&apos;t
          sell your data. Ever.
        </p>

        <h2>What we collect, and why</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Why</th>
              <th>Kept for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Name, mobile, address, PIN code, optional email</td>
              <td>To confirm, deliver and support your order; to honour the trial and warranty</td>
              <td>8 years (GST and accounting law), then deleted</td>
            </tr>
            <tr>
              <td>Account email and password (stored only as a one-way hash)</td>
              <td>So you can sign in and see your orders</td>
              <td>Until you delete the account</td>
            </tr>
            <tr>
              <td>Call-back requests</td>
              <td>To call you back</td>
              <td>6 months</td>
            </tr>
            <tr>
              <td>Newsletter email (only if you sign up)</td>
              <td>To send occasional emails about new products and real offers</td>
              <td>Until you unsubscribe</td>
            </tr>
            <tr>
              <td>Delivery PIN code you type in</td>
              <td>To show delivery dates — kept in a cookie on your device</td>
              <td>90 days on your device</td>
            </tr>
            <tr>
              <td>Anonymous visit data (pages viewed, device type) — only with your consent</td>
              <td>To understand what&apos;s confusing on the site and fix it</td>
              <td>13 months</td>
            </tr>
          </tbody>
        </table>
        <p>
          We do not collect your precise location, contacts, or anything from your phone beyond what you type in. IP
          addresses are used briefly to stop spam and abuse and are not stored with your order.
        </p>

        <h2>Who we share it with</h2>
        <p>
          Only what&apos;s needed: the transport company delivering your order gets your name, phone and address; our
          bank or UPI provider processes payments; the website runs on our own server in India and is served through Cloudflare&apos;s network, which shields it from attacks. Each is bound to use the
          data only for that job. We disclose data to authorities only when Indian law requires it.
        </p>

        <h2>Your rights</h2>
        <p>Under the DPDP Act you can:</p>
        <ul>
          <li>
            <b>Get a summary</b> of the personal data we hold and who we&apos;ve shared it with — signed in, use
            &ldquo;Download my data&rdquo; on your <Link href="/account">account page</Link>.
          </li>
          <li>
            <b>Correct or update</b> it.
          </li>
          <li>
            <b>Erase</b> it, where we don&apos;t need to keep it by law — &ldquo;Delete my account&rdquo; on your account page does this instantly.
          </li>
          <li>
            <b>Withdraw consent</b> for anything based on consent (analytics, newsletter) as easily as you gave it —
            use &ldquo;Cookie settings&rdquo; at the bottom of every page, or the unsubscribe link in any email.
          </li>
          <li>
            <b>Nominate</b> someone to exercise these rights if you die or become incapacitated.
          </li>
          <li>
            <b>Complain</b> to our Grievance Officer (details below). We respond within the time the law sets. If
            you&apos;re not satisfied, you may complain to the Data Protection Board of India.
          </li>
        </ul>

        <h2>Security</h2>
        <p>
          The site runs only over HTTPS with modern security headers. Passwords are stored as salted scrypt hashes;
          sessions are signed, HTTP-only cookies. Access to order data is limited to staff who need it. If a breach
          ever affects your data, we&apos;ll tell you and the Data Protection Board as the law requires.
        </p>

        <h2>Children</h2>
        <p>The site isn&apos;t meant for anyone under 18, and we don&apos;t knowingly collect their data.</p>

        <h2>Contact for privacy questions</h2>
        {officer(ctx)}
        <p>
          Cookies are explained separately in our <Link href="/policies/cookies">Cookie policy</Link>.
        </p>
      </>
    ),
  },
  {
    slug: "cookies",
    title: "Cookie policy",
    summary: "Every cookie and browser-storage item we use.",
    body: () => (
      <>
        <p>
          We keep this short because we use very little. Nothing optional runs until you choose in the cookie banner,
          and &ldquo;Reject all&rdquo; is as easy as &ldquo;Accept all&rdquo;. If your browser sends a Global Privacy Control or
          Do Not Track signal, we treat it as &ldquo;reject&rdquo; automatically. Change your mind any time with
          &ldquo;Cookie settings&rdquo; in the footer.
        </p>
        <h2>Always on (needed to run the shop)</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>What it does</th>
              <th>Lasts</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>gd_consent</td>
              <td>Remembers your cookie choice</td>
              <td>6 months</td>
            </tr>
            <tr>
              <td>gd_pin</td>
              <td>The delivery PIN code you entered</td>
              <td>90 days</td>
            </tr>
            <tr>
              <td>eurofoam_customer</td>
              <td>Keeps you signed in (HTTP-only, can&apos;t be read by scripts)</td>
              <td>30 days</td>
            </tr>
            <tr>
              <td>nova-cart (browser storage)</td>
              <td>Your cart</td>
              <td>Until you clear it</td>
            </tr>
            <tr>
              <td>eurofoam-wishlist (browser storage)</td>
              <td>Mattresses you saved</td>
              <td>Until you clear it</td>
            </tr>
          </tbody>
        </table>
        <h2>Only with your consent: &ldquo;Improve the site&rdquo;</h2>
        <table>
          <tbody>
            <tr>
              <td>eurofoam-visitor-v1, eurofoam-session-v1 (browser storage)</td>
              <td>Random IDs so we can count visits and see which pages help. Sent only to our own server — no Google Analytics, no Meta.</td>
              <td>Deleted when you withdraw consent</td>
            </tr>
          </tbody>
        </table>
        <h2>Only with your consent: &ldquo;Ads and offers&rdquo;</h2>
        <p>
          Currently not in use. If we ever add an advertising partner (like Google or Meta), it will be listed here
          first and will only load if you switch this on.
        </p>
      </>
    ),
  },
  {
    slug: "grievance",
    title: "Grievance redressal",
    summary: "Our Grievance Officer and how complaints are handled.",
    body: (ctx) => (
      <>
        <p>
          As required by the Consumer Protection (E-Commerce) Rules, 2020 and the Digital Personal Data Protection Act,
          2023, {B.legalName} has a Grievance Officer for complaints about orders, products, this website or your
          personal data.
        </p>
        {officer(ctx)}
        <h2>What happens when you complain</h2>
        <ol>
          <li>Write to the Grievance Officer with your name, phone, order number (if any) and what went wrong.</li>
          <li>We acknowledge it within <b>48 hours</b> and give you a reference number.</li>
          <li>We resolve it within <b>one month</b> of receiving it, and tell you what we did.</li>
        </ol>
        <p>
          If you&apos;re not satisfied, you can contact the National Consumer Helpline on 1915 or at
          consumerhelpline.gov.in, file a complaint at e-daakhil.nic.in, or, for personal-data issues, approach the Data
          Protection Board of India.
        </p>
      </>
    ),
  },
];

export function getPolicy(slug: string) {
  return POLICIES.find((p) => p.slug === slug);
}
