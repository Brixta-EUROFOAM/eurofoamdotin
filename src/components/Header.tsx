import { getStoreData } from "@/lib/store";
import HeaderClient from "@/components/HeaderClient";
import { phoneLink } from "@/lib/contact";
import { BUSINESS } from "@/lib/business";

const KEEP = new Set(["MRP", "GST", "UPI", "EMI", "PIN", "GADDA", "HR", "HD"]);

/* The admin types announcements in CAPS; show them in calm sentence case. */
function sentenceCase(text: string) {
  if (text !== text.toUpperCase()) return text;
  const words = text.split(/\s+/).map((w) => (KEEP.has(w.replace(/[^A-Z]/g, "")) ? w : w.toLowerCase()));
  const out = words.join(" ");
  return out.charAt(0).toUpperCase() + out.slice(1);
}

export default async function Header() {
  const { site, products } = await getStoreData();

  const messages = (site.announcementEnabled === false ? "" : site.announcement || "")
    .split(/\s*[·|•]\s*/)
    .map((m) => m.trim())
    .filter(Boolean)
    .map(sentenceCase);

  return (
    <HeaderClient
      messages={messages}
      announcementHref={site.announcementHref || "/policies/trial"}
      phone={phoneLink(site.phone)}
      products={products.map((p) => ({
        slug: p.slug,
        name: p.name,
        kicker: p.kicker,
        firmness: p.firmness,
        basePrice: p.basePrice,
        image: p.image,
        layers: p.layers.map((l) => ({ name: l.name, visualKind: l.visualKind, description: l.description })),
      }))}
      pick={site.homeStoryProductSlug}
      trialNights={BUSINESS.trialNights}
    />
  );
}
