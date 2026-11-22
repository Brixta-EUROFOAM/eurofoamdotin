import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource-variable/hanken-grotesk/wght.css";
import localFont from "next/font/local";
import "./globals.css";
import "./craft.css";
import "./app.css";
import "./intent-purchase-path.css";
import CartProvider from "@/components/CartProvider";
import TelemetryTracker from "@/components/TelemetryTracker";
import ConsentProvider from "@/components/store/ConsentProvider";
import AcquisitionTracker from "@/components/store/AcquisitionTracker";
import CloudflareAnalytics from "@/components/store/CloudflareAnalytics";
import LocationProvider from "@/components/store/LocationProvider";
import CartDrawer from "@/components/store/CartDrawer";
import MarketingTags from "@/components/store/MarketingTags";
import GA4Tracker from "@/components/store/GA4Tracker";
import IntentPurchasePath from "@/components/store/IntentPurchasePath";
import JsonLd from "@/components/store/JsonLd";
import SewingThread from "@/components/store/SewingThread";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent";
import { isValidPin } from "@/lib/delivery";
import { getStoreData } from "@/lib/store";
import { brandKnowledgeGraph } from "@/lib/local-seo";
import { publicOrigin } from "@/lib/public-url";

const yatra = localFont({
  src: "../../public/fonts/YatraOne.ttf",
  variable: "--font-yatra",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicOrigin() || "https://gadda.store"),
  title: {
    default: "GADDA Mattresses Online | Assam & Meghalaya",
    template: "%s | GADDA Mattresses",
  },
  description:
    "Shop GADDA Regular, Pro and Ultimate mattresses. Compare firmness, foam layers and prices. Delivery to eligible PIN codes in Assam and Meghalaya.",
  applicationName: "GADDA",
  openGraph: {
    type: "website",
    siteName: "GADDA",
    locale: "en_IN",
    title: "GADDA Mattresses Online | Assam & Meghalaya",
    description: "Compare GADDA mattress construction, sizes and prices. Delivery for eligible PIN codes in Assam and Meghalaya only.",
    images: [{ url: "/products/gadda-regular/v3-bed-angle.webp", alt: "GADDA Regular mattress" }],
  },
  twitter: { card: "summary_large_image", images: ["/products/gadda-regular/v3-bed-angle.webp"] },
  formatDetection: { telephone: false, address: false, email: false },
  appleWebApp: { capable: true, title: "GADDA", statusBarStyle: "default" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jar = await cookies();
  const nonce = (await headers()).get("x-nonce") || undefined;
  const consent = parseConsent(jar.get(CONSENT_COOKIE)?.value);
  const savedPin = jar.get("gd_pin")?.value || "";
  const { site } = await getStoreData();

  return (
    <html lang="en-IN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><JsonLd data={brandKnowledgeGraph(site)} nonce={nonce} /></head>
      <body
        suppressHydrationWarning
        className={`${yatra.variable} antialiased`}
      >
        <SewingThread />
        <a href="#main" className="g-skip">
          Skip to content
        </a>
        <ConsentProvider initial={consent}>
          <AcquisitionTracker />
          <CloudflareAnalytics nonce={nonce} />
          <MarketingTags nonce={nonce} />
          <GA4Tracker nonce={nonce} />
          <LocationProvider initialPin={isValidPin(savedPin) ? savedPin : ""}>
            <CartProvider>
              <TelemetryTracker />
              {children}
              <IntentPurchasePath />
              <CartDrawer />
            </CartProvider>
          </LocationProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
