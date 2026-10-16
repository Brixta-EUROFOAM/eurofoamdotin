"use client";

import Script from "next/script";
import { useConsent } from "@/components/store/ConsentProvider";

/*
  Third-party ad/analytics tags. NOTHING here loads unless:
   1. you set the env var (NEXT_PUBLIC_GTM_ID / NEXT_PUBLIC_META_PIXEL_ID), and
   2. the visitor switched on "Ads and offers" in the cookie choices.
  ("Basic" consent mode — no cookieless pings before consent.)
  The CSP in src/proxy.ts opens the matching domains only when the env
  var is set.
*/

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

const safeId = (v?: string) => (v && /^[A-Za-z0-9-]{4,30}$/.test(v) ? v : "");

export default function MarketingTags({ nonce }: { nonce?: string }) {
  const { marketing } = useConsent();
  const gtm = safeId(GTM_ID);
  const pixel = safeId(META_PIXEL_ID);
  if (!marketing || (!gtm && !pixel)) return null;

  return (
    <>
      {gtm ? (
        <Script id="gtm" nonce={nonce} strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;
gtag('consent','default',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.nonce='${nonce || ""}';j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      ) : null}
      {pixel ? (
        <Script id="meta-pixel" nonce={nonce} strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}
