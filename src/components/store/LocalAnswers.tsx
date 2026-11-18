import Link from "next/link";
import type { Mattress } from "@/lib/catalog";
import { money } from "@/lib/catalog";
import { BUSINESS } from "@/lib/business";
import JsonLd from "@/components/store/JsonLd";
import { faqLd } from "@/lib/seo";

/* Direct answers appear in initial HTML. JSON-LD uses identical Q&A text. */
export default function LocalAnswers({ product, nonce }: { product?: Mattress; nonce?: string }) {
  const details = product?.layers.map((l) => l.density ? `${l.name} (${l.density})` : l.name) || [];
  const questions = product ? [
    {
      q: `Can I order the ${product.name} mattress in Guwahati?`,
      a: `GADDA offers the ${product.name} mattress online to customers looking for mattresses in Guwahati, Assam. Available dimensions and delivery estimates depend on the selected size and PIN code. The final price includes GST and the displayed delivery allowance. Enter your six-digit PIN code on the product page to check serviceability before ordering.`,
    },
    {
      q: `What materials are inside the ${product.name}?`,
      a: `Its published layer construction is ${details.join(", ")}. The catalogue lists the firmness as ${product.firmness.toLowerCase()} and the advertised thickness options as ${product.heights.map((h) => h.label).join(" and ")}. A material or edge-support feature not explicitly listed in the product specifications should not be assumed. Compare the published construction before buying.`,
    },
    {
      q: "What is the starting price and trial policy?",
      a: `The current starting price is ${money(product.basePrice)}, including GST and the advertised logistics allowance, for the smallest listed configuration. Larger sizes, thickness upgrades and optional materials change the price. GADDA publishes a ${BUSINESS.trialNights}-night trial, subject to its full trial terms. Final availability and delivery estimates must be checked by PIN code.`,
    },
  ] : [
    {
      q: "Where can I compare mattresses in Guwahati, Assam?",
      a: "GADDA sells Regular, Pro and Ultimate mattresses online, with published layer descriptions, available dimensions and GST-inclusive prices. Buyers in Guwahati can compare specifications and check their six-digit PIN code for delivery eligibility. The website does not claim a walk-in Guwahati showroom. Start with the Guwahati mattress guide or the full product comparison before choosing.",
    },
    {
      q: "Which mattress is suitable for my bed size?",
      a: "Measure the inside length and width of your bed frame in inches. GADDA lists Single, Double, Queen and King dimensions along with selectable thicknesses. Custom measurements are also supported when the option is enabled. Compare the actual dimensions, layers and final checkout price rather than choosing solely by the category name. The size guide explains this process.",
    },
  ];
  return (
    <section className="g-section" aria-label="Guwahati mattress buying answers">
      <JsonLd nonce={nonce} data={faqLd(questions)} />
      <div className="g-wrap g-prose" style={{ maxWidth: 920 }}>
        {questions.map(({ q, a }) => <div key={q}><h2>{q}</h2><p>{a}</p></div>)}
        <p><Link href="/mattresses/guwahati">Guwahati mattress guide</Link> · <Link href="/size-guide">Size guide</Link> · <Link href="/compare">Compare mattresses</Link> · <Link href="/policies/trial">Trial terms</Link></p>
      </div>
    </section>
  );
}
