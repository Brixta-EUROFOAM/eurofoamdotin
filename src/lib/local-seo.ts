import type { Mattress, SiteSettings } from "@/lib/catalog";
import { BUSINESS } from "@/lib/business";
import { organizationLd, productLd, websiteLd } from "@/lib/seo";
import { siteUrl } from "@/lib/public-url";
import { phoneLink } from "@/lib/contact";

/* Confirm these facts with the legal business BEFORE enabling LocalBusiness markup.
   This address must correspond to a real, eligible place, not a virtual office.
   A service-area business can hide its address in Google Business Profile.
   Do NOT invent EdgeLock, an inspection zip, delivery SLAs or a 10-year warranty. */
export const LOCAL_SEO = {
  market: "Guwahati, Assam, India",
  serviceRegions: ["Guwahati", "Assam", "Meghalaya"],
  googleBusinessProfileUrl: "", // verified direct GBP share URL, if one exists
  socialProfiles: [] as string[], // verified Instagram, Facebook etc. full HTTPS URLs
  physicalLocation: {
    streetAddress: "",          // actual place associated with this business
    addressLocality: "",        // e.g. Guwahati ONLY if actually located there
    addressRegion: "Assam",
    postalCode: "",
    addressCountry: "IN",
  },
};

export function enhancedOrganizationLd(site: SiteSettings) {
  const sameAs = [LOCAL_SEO.googleBusinessProfileUrl, ...LOCAL_SEO.socialProfiles]
    .filter((url) => /^https:\/\//.test(url));
  return {
    ...organizationLd(site),
    "@id": siteUrl("/#organization"),
    url: siteUrl("/"),
    logo: siteUrl(site.logoUrl || "/icon.png"),
    areaServed: LOCAL_SEO.serviceRegions.map((name) => ({ "@type": "Place", name })),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function brandKnowledgeGraph(site: SiteSettings) {
  const local = localBusinessLd(site);
  return [enhancedOrganizationLd(site), {
    ...websiteLd(), "@id": siteUrl("/#website"),
    publisher: { "@id": siteUrl("/#organization") },
  }, ...(local ? [local] : [])];
}

export function localBusinessLd(site: SiteSettings) {
  const a = LOCAL_SEO.physicalLocation;
  if (!a.streetAddress.trim() || !a.addressLocality.trim() || !/^[1-9]\d{5}$/.test(a.postalCode)) return null;
  const phone = phoneLink(site.phone);
  return {
    "@context": "https://schema.org", "@type": "LocalBusiness",
    "@id": siteUrl("/#store"),
    name: BUSINESS.brand, legalName: BUSINESS.legalName,
    url: siteUrl("/"),
    image: siteUrl(site.logoUrl || "/icon.png"),
    address: { "@type": "PostalAddress", ...a },
    ...(phone ? { telephone: phone.label } : {}),
    areaServed: [{ "@type": "City", name: "Guwahati" }, { "@type": "AdministrativeArea", name: "Assam" }, { "@type": "AdministrativeArea", name: "Meghalaya" }],
    ...(LOCAL_SEO.googleBusinessProfileUrl ? { sameAs: [LOCAL_SEO.googleBusinessProfileUrl] } : {}),
  };
}

/* Add only specs present in the actual product catalogue. Unknown is not 'No'. */
export function enhancedProductLd(p: Mattress) {
  const props = [
    { "@type": "PropertyValue", name: "Thickness options", value: p.heights.map((h) => h.label).join(", ") },
    { "@type": "PropertyValue", name: "Comfort", value: p.firmness },
    ...p.layers.flatMap((l) => [
      ...(l.density?.trim() ? [{ "@type": "PropertyValue", name: `${l.name} density`, value: l.density }] : []),
      ...(l.material?.trim() ? [{ "@type": "PropertyValue", name: `${l.name} material`, value: l.material }] : []),
    ]),
    ...(BUSINESS.warrantyYears[p.slug] ? [{ "@type": "PropertyValue", name: "Warranty", value: `${BUSINESS.warrantyYears[p.slug]} years` }] : []),
  ];
  return { ...productLd(p), "@id": siteUrl(`/mattresses/${p.slug}#product`),
    mainEntityOfPage: siteUrl(`/mattresses/${p.slug}`),
    additionalProperty: props,
  };
}
