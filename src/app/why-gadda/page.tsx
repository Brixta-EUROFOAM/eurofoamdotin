import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HelpStrip from "@/components/store/HelpStrip";
import HindiNote from "@/components/store/HindiNote";
import { getStoreData } from "@/lib/store";
import { BUSINESS } from "@/lib/business";
import { money, type Mattress } from "@/lib/catalog";
import { razorpayReady } from "@/lib/razorpay";
import w from "./why.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Why GADDA — no mattress theatre",
  description: "Three mattresses, every layer named in plain words, one honest price and 100 nights at home. Why GADDA sells mattresses the way it does.",
  alternates: { canonical: "/why-gadda" },
};

/* what the usual label says, and what it means */
const JARGON: [string, string][] = [
  ["AI Sleep Technology", "There's no computer in it. It's foam."],
  ["Cooling Gel Matrix", "Memory foam with gel mixed in. A bit cooler, not air-conditioning."],
  ["Premium NASA Foam", "Memory foam. NASA paid for it in the 1960s; ours is made in India."],
  ["Orthopaedic Spine System", "Firm. No doctor designed it, so we won't say one did."],
];

/* photos that ship with the site (public/products/…) */
const BEDROOM_PHOTO = "/products/gadda-regular/v3-bed-angle.webp";
const LABEL_PHOTO = "/products/gadda-ultimate/label-closeup.webp";

function queen(p: Mattress) {
  const rows = p.sizes.filter((r) => (r.group || r.label).toLowerCase().startsWith("queen"));
  if (!rows.length) return null;
  return p.basePrice + Math.min(...rows.map((r) => r.priceAdd)) + (p.heights[0]?.priceAdd || 0);
}

/* "Cool memory foam" → "cool memory foam", but "32D HR foam" stays as it is */
const lower = (t: string) => (/^[A-Z][a-z]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);

function upgrades(p: Mattress) {
  return (p.options || []).flatMap((o) =>
    o.choices
      .filter((c) => c.swap && c.priceAdd > 0)
      .map((c) => `${lower(c.label)} instead of ${lower(p.layers[c.swap!.index]?.name || o.label)}, ${money(c.priceAdd)} more`),
  );
}

export default async function WhyGaddaPage() {
  const { products } = await getStoreData();
  const height = products[0]?.heights[0]?.label || "6 inch";
  const online = razorpayReady();

  return (
    <>
      <Header />
      <main id="main">
        {/* The theatre, translated */}
        <section className={w.hero} aria-labelledby="why-title">
          <div className={`g-wrap ${w.heroGrid}`}>
            <div>
              <p className={w.deva} lang="hi">
                नौटंकी बंद
              </p>
              <h1 className={w.title} id="why-title">
                We got tired of mattress theatre.
              </h1>
              <p className="g-lede">
                A mattress is already a big purchase. It doesn&apos;t need to become a research project too. So we make
                three, name every layer in plain words, and charge everyone the same price.
              </p>
              <div className={w.cta}>
                <Link href="/mattresses" className="g-btn g-btn--orange">
                  Shop mattresses
                </Link>
                <Link href="#inside" className="g-btn g-btn--ghost">
                  See what&apos;s inside
                </Link>
              </div>
            </div>

            <figure className={w.label} aria-labelledby="label-cap">
              <div className={w.labelMark} aria-hidden="true">
                <b>GADDA</b>
                <span lang="hi">गद्दा</span>
              </div>
              <figcaption id="label-cap" className={w.labelHead}>
                <span>What the usual label says</span>
                <span>What it means</span>
              </figcaption>
              <dl className={w.rows}>
                {JARGON.map(([said, meant], i) => (
                  <div key={said} className={w.row} style={{ ["--i" as string]: i }}>
                    <dt>
                      <s className={w.said}>{said}</s>
                    </dt>
                    <dd className={w.meant}>{meant}</dd>
                  </div>
                ))}
              </dl>
              <p className={w.labelFoot}>Made in {BUSINESS.countryOfOrigin} by {BUSINESS.legalName}</p>
            </figure>
          </div>
        </section>

        {/* Everything inside, all three */}
        <section className="g-section" id="inside" aria-labelledby="inside-title">
          <div className="g-wrap">
            <div className={w.head}>
              <h2 className="g-h2" id="inside-title">
                This is everything inside them.
              </h2>
              <HindiNote>बस इतना ही</HindiNote>
              <p className="g-lede">
                Three mattresses, every layer named from the top down. No secret blend, no trademarked names for
                ordinary foam.
              </p>
            </div>
            <div className={w.range}>
              {products.map((p) => (
                <article key={p.slug} className={w.item}>
                  <Link href={`/mattresses/${p.slug}`} className={w.pic} tabIndex={-1} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.cardImage?.trim() || p.image} alt="" loading="lazy" decoding="async" width={1120} height={700} />
                  </Link>
                  <div className={w.itemHead}>
                    <h3 className="g-h3">
                      <Link href={`/mattresses/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <span className={w.feel}>{p.firmness}</span>
                  </div>
                  <ol className={w.layers} aria-label={`${p.name}, top to bottom`}>
                    {p.layers.map((l, i) => (
                      <li key={l.name + i}>
                        {l.name}
                        {l.density && !l.name.includes(l.density) ? <span>, density {l.density}</span> : null}
                      </li>
                    ))}
                  </ol>
                  {upgrades(p).map((u) => (
                    <p key={u} className={w.upgrade}>
                      Or: {u}.
                    </p>
                  ))}
                  <p className={w.from}>
                    From <b>{money(p.basePrice)}</b>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* One price */}
        <section className="g-section g-section--cream" aria-labelledby="price-title">
          <div className="g-wrap">
            <div className={w.head}>
              <h2 className="g-h2" id="price-title">
                One price. The same on Diwali as on a Tuesday.
              </h2>
              <p className="g-lede">
                No made-up MRP to slash, no coupon to hunt for, no timer. The price on the page is what everyone pays,
                with GST and delivery inside it.
              </p>
            </div>
            <div className={w.prices}>
              <div className={w.usual} aria-label="How a typical mattress sale looks">
                <p className={w.usualHead}>The usual mattress sale</p>
                <p className={w.mrp}>
                  MRP <s>₹45,000</s>
                </p>
                <p className={w.off}>62% off, today only</p>
                <p className={w.timer}>Sale ends in 03:59:59</p>
                <p className={w.usualFoot}>Tomorrow the timer starts again.</p>
              </div>
              <div className={w.ours}>
                <p className={w.oursHead}>
                  GADDA, Queen size, {height}
                </p>
                <table className={w.table}>
                  <tbody>
                    {products.map((p) => {
                      const q = queen(p);
                      return q ? (
                        <tr key={p.slug}>
                          <th scope="row">{p.name}</th>
                          <td>{money(q)}</td>
                        </tr>
                      ) : null;
                    })}
                  </tbody>
                </table>
                <p className={w.oursFoot}>
                  Today, tomorrow and during every festival. {online ? "Pay online or when it arrives." : "Pay when it arrives."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Try it at home */}
        <section className="g-section" aria-labelledby="trial-title">
          <div className={`g-wrap ${w.split}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={w.photo}
              src={BEDROOM_PHOTO}
              alt="A GADDA mattress on a wooden bed in a sunlit bedroom"
              loading="lazy"
              decoding="async"
              width={1254}
              height={1254}
            />
            <div>
              <h2 className="g-h2" id="trial-title">
                Ten minutes in a showroom tells you nothing.
              </h2>
              <p className="g-lede">Your bedroom is the only real test, so that&apos;s where you try it.</p>
              <dl className={w.promises}>
                <div>
                  <dt>{BUSINESS.trialNights} nights at home</dt>
                  <dd>Give it at least 30. If it still isn&apos;t right, we collect it and refund you.</dd>
                </div>
                <div>
                  <dt>Delivery included</dt>
                  <dd>To your door, anywhere in India. We call first to fix a time.</dd>
                </div>
                <div>
                  <dt>{online ? "Pay online or when it arrives" : "Pay when it arrives"}</dt>
                  <dd>
                    {online
                      ? "UPI, card or net banking at checkout, or cash or UPI on delivery. No card details on the phone."
                      : "Cash or UPI on delivery. No card details on the phone."}
                  </dd>
                </div>
              </dl>
              <Link href="/policies/trial" className="g-link">
                How the trial works
              </Link>
            </div>
          </div>
        </section>

        {/* Who makes it */}
        <section className="g-section g-section--ink" aria-labelledby="maker-title">
          <div className={`g-wrap ${w.maker}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={w.makerPhoto}
              src={LABEL_PHOTO}
              alt={`The GADDA label: made in ${BUSINESS.countryOfOrigin} by ${BUSINESS.legalName}`}
              loading="lazy"
              decoding="async"
              width={1122}
              height={1402}
            />
            <div>
              <h2 className="g-h2" id="maker-title">
                The name on the label is the company you deal with.
              </h2>
              <p className="g-lede">
                GADDA is made in {BUSINESS.countryOfOrigin} by {BUSINESS.legalName} and sold straight to you. No
                showroom rent or middlemen in the price, and when you call, a person picks up. {BUSINESS.supportHours}.
              </p>
              <div className={w.cta}>
                <Link href="/mattresses" className="g-btn g-btn--orange">
                  Shop the three mattresses
                </Link>
                <Link href="/business-information" className="g-btn g-btn--ghost">
                  Business information
                </Link>
              </div>
            </div>
          </div>
        </section>

        <HelpStrip />
      </main>
      <Footer />
    </>
  );
}
