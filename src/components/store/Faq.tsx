import Link from "next/link";
import { FAQS } from "@/lib/content";
import { getStoreData } from "@/lib/store";
import LinkedText from "@/components/store/LinkedText";
import JsonLd from "@/components/store/JsonLd";
import { faqLd } from "@/lib/seo";
import HindiNote from "@/components/store/HindiNote";

export default async function Faq({
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
  const { site } = await getStoreData();
  const all = site.faqs?.filter((f) => f.q?.trim() && f.a?.trim()).length ? site.faqs.filter((f) => f.q?.trim() && f.a?.trim()) : FAQS;
  const items = limit ? all.slice(0, limit) : all;
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
                {item.a.split(/\n{2,}/).map((para, k) => (
                  <p key={k}>
                    <LinkedText text={para} />
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
