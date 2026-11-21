import type { Metadata } from "next";
import ProblemGuide from "@/components/store/ProblemGuide";
export const metadata: Metadata = {
  title: "100-Night Mattress Trials: What to Check Before You Buy",
  description: "A plain-English checklist for return eligibility, custom-size exclusions, pickup, refunds and delivery before buying a mattress online.",
  alternates: { canonical: "/guides/mattress-trial-returns" },
};
export default function Page() {
  return <ProblemGuide
    eyebrow="Trial and refund clarity"
    title="A 100-night trial isn't the whole return policy."
    summary="Before buying any mattress online, check the complete return conditions: eligible models, condition requirements, exceptions, pickup location, fees and refund processing. An advertised trial period alone does not settle these details."
    explain={[
      { heading: "Check eligibility before paying", text: "Confirm whether the exact size, thickness and optional configuration you want is covered. Custom-size mattresses can be treated differently. Get the applicable policy in writing or save it with your order details." },
      { heading: "Check the pickup and refund process", text: "Find out how a request is filed, whether photos are required, who arranges pickup, what condition the mattress must be in, and the stated refund process. Keep your order number and records." },
      { heading: "Check delivery to your own PIN", text: "A nationwide-looking storefront does not mean every postal code is serviceable. Confirm an actual eligible PIN, expected dispatch and delivery timelines, and a support contact before checkout." },
      { heading: "Check the seller, not just the promise", text: "Read the business information, support channels, warranty exclusions and any special terms. If the product is already defective or misdescribed, your statutory consumer rights may be relevant separately from a voluntary trial policy." },
    ]}
    recommendation={null}
    faqs={[
      { question: "Does GADDA advertise a 100-night trial?", answer: "GADDA's current catalogue references a 100-night trial. Eligibility and exclusions are governed by the published GADDA trial policy. Do not assume every customised order or issue qualifies." },
      { question: "What if a seller denies an eligible return?", answer: "Keep the order record, dated policy copy and support correspondence. Escalate through the seller's grievance process; statutory consumer complaint routes may also be available where applicable." },
    ]}
  />;
}
