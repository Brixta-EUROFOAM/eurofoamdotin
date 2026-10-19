import type { Mattress, SiteSettings } from "@/lib/catalog";
import { BUSINESS } from "@/lib/business";
import { siteUrl } from "@/lib/public-url";

/* schema.org builders. Only facts we actually have — no invented ratings. */

const abs = (src: string) => (src.startsWith("http") ? src : siteUrl(src));

export function organizationLd(site: SiteSettings) {
  const phone = (site.phone || "").replace(/[^\d+]/g, "");
  const realPhone = phone.length >= 10 && !/^\+?9?1?0+$/.test(phone);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BUSINESS.brand,
    legalName: BUSINESS.legalName,
    url: siteUrl("/"),
    slogan: site.tagline,
    ...(realPhone || (site.email && !site.email.endsWith(".example"))
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            areaServed: "IN",
            availableLanguage: ["en", "hi", "bn"],
            ...(realPhone ? { telephone: phone } : {}),
            ...(site.email && !site.email.endsWith(".example") ? { email: site.email } : {}),
          },
        }
      : {}),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GADDA Mattresses",
    url: siteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl("/mattresses")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productLd(p: Mattress) {
  const prices = p.sizes.flatMap((s) => p.heights.map((h) => p.basePrice + s.priceAdd + h.priceAdd));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.shortDescription,
    image: [abs(p.image)],
    sku: p.slug,
    brand: { "@type": "Brand", name: BUSINESS.brand },
    category: "Mattresses",
    countryOfOrigin: BUSINESS.countryOfOrigin,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: "https://schema.org/InStock",
      url: siteUrl(`/mattresses/${p.slug}`),
      seller: { "@type": "Organization", name: BUSINESS.legalName },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: BUSINESS.trialNights,
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "INR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
      },
    },
    ...(p.reviews > 0 && p.rating > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews } }
      : {}),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1") },
    })),
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: siteUrl(t.path),
    })),
  };
}
