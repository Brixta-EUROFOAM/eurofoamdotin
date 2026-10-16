import Link from "next/link";
import { FAQS } from "@/lib/content";
import JsonLd from "@/components/store/JsonLd";
import { faqLd } from "@/lib/seo";
import HindiNote from "@/components/store/HindiNote";

export default function Faq({
  limit,
  nonce,
  title = "Questions people actually ask",
  id = "faq",
}: {
  limit?: number;
  nonce?: string;
  title?: string;
  id?: string;
}) {
  const items = limit ? FAQS.slice(0, limit) : FAQS;
  return (
    <section className="g-section" id={id} aria-labelledby={`${id}-title`}>
      <JsonLd data={faqLd(items)} nonce={nonce} />
      <div className="g-wrap g-faq">
        <div>
          <h2 className="g-h2" id={`${id}-title`}>
            {title}
          </h2>
          <HindiNote>बेझिझक पूछो</HindiNote>
          <p className="g-lede">
            Anything else? <Link href="/contact" className="g-link">Ask us directly</Link>. A person replies, not a
            bot.
          </p>
        </div>
        <div className="g-faq-list">
          {items.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <div>
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
