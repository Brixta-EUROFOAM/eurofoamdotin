"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "@/components/store/ConsentProvider";

/*
  Basic opt-in tagging: do not load Google Tag Manager until the visitor
  specifically allows analytics. Advertising remains separately consented.
  No identifiers or cookieless Google pings before analytics consent.

  The public GTM ID is deliberately included as a fallback because the
  production Docker image builds in GitHub Actions without local .env files.
  Within GTM, publish a Google tag linked to the GA4 measurement ID (G-...).
  Never add a second Google tag directly to layout.tsx.
*/
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-P2KKR8HJ";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const safeId = (v?: string) => (v && /^[A-Za-z0-9-]{4,30}$/.test(v) ? v : "");

export default function MarketingTags({ nonce }: { nonce?: string }) {
  const { analytics, marketing } = useConsent();
  const pathname = usePathname() || "/";
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Read browser opt-outs before injecting any third-party scripts.
  const blocked = !hydrated ||
    (typeof navigator !== "undefined" &&
      (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true));
  const gtm = safeId(GTM_ID);
  const pixel = safeId(META_PIXEL_ID);
  const loadGtm = !blocked && analytics && Boolean(gtm) && !pathname.startsWith("/admin");
  const loadPixel = !blocked && marketing && Boolean(pixel) && !pathname.startsWith("/admin");

  if (!loadGtm && !loadPixel) return null;
  return (
    <>
      {loadGtm ? (
        <Script id="gtm" nonce={nonce} strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;
/* Consent is set before loading Tag Manager. Only analytics opt-in reaches this code. */
gtag('consent','default',{analytics_storage:'granted',ad_storage:'${marketing ? "granted" : "denied"}',ad_user_data:'${marketing ? "granted" : "denied"}',ad_personalization:'${marketing ? "granted" : "denied"}'});
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.nonce='${nonce || ""}';j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      ) : null}
      {loadPixel ? (
        <Script id="meta-pixel" nonce={nonce} strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}
