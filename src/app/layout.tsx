import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./craft.css";
import "./app.css";
import CartProvider from "@/components/CartProvider";
import TelemetryTracker from "@/components/TelemetryTracker";
import ConsentProvider from "@/components/store/ConsentProvider";
import AcquisitionTracker from "@/components/store/AcquisitionTracker";
import CloudflareAnalytics from "@/components/store/CloudflareAnalytics";
import LocationProvider from "@/components/store/LocationProvider";
import CartDrawer from "@/components/store/CartDrawer";
import MarketingTags from "@/components/store/MarketingTags";
import JsonLd from "@/components/store/JsonLd";
import SewingThread from "@/components/store/SewingThread";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent";
import { isValidPin } from "@/lib/delivery";
import { getStoreData } from "@/lib/store";
import { brandKnowledgeGraph } from "@/lib/local-seo";
import { publicOrigin } from "@/lib/public-url";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["500", "700", "800"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const yatra = localFont({
  src: "../../public/fonts/YatraOne.ttf",
  variable: "--font-yatra",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicOrigin() || "https://gadda.store"),
  title: {
    default: "GADDA Mattresses in Guwahati | Shop Online",
    template: "%s | GADDA Mattresses",
  },
  description:
    "Compare GADDA mattresses in Guwahati: Regular, Pro and Ultimate. Browse real foam specs, sizes, GST-inclusive prices and delivery eligibility.",
  applicationName: "GADDA",
  openGraph: {
    type: "website",
    siteName: "GADDA Mattresses",
    locale: "en_IN",
    title: "GADDA Mattresses in Guwahati | Shop Online",
    description: "Compare GADDA mattresses by foam density, dimensions and price in Assam.",
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
        className={`${bricolage.variable} ${hanken.variable} ${yatra.variable} antialiased`}
      >
        <SewingThread />
        <a href="#main" className="g-skip">
          Skip to content
        </a>
        <ConsentProvider initial={consent}>
          <AcquisitionTracker />
          <CloudflareAnalytics nonce={nonce} />
          <MarketingTags nonce={nonce} />
          <LocationProvider initialPin={isValidPin(savedPin) ? savedPin : ""}>
            <CartProvider>
              <TelemetryTracker />
              {children}
              <CartDrawer />
            </CartProvider>
          </LocationProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
