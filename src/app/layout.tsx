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
import LocationProvider from "@/components/store/LocationProvider";
import CartDrawer from "@/components/store/CartDrawer";
import MarketingTags from "@/components/store/MarketingTags";
import JsonLd from "@/components/store/JsonLd";
import SewingThread from "@/components/store/SewingThread";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent";
import { isValidPin } from "@/lib/delivery";
import { getStoreData } from "@/lib/store";
import { organizationLd, websiteLd } from "@/lib/seo";
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
  metadataBase: new URL(publicOrigin() || "https://eurofoam.in"),
  title: {
    default: "GADDA Mattresses | Gadda hi hai yaar.",
    template: "%s | GADDA Mattresses",
  },
  description:
    "Three honest mattresses, made in India. Real materials, one fair price, delivery included and 100 nights to decide at home.",
  applicationName: "GADDA",
  openGraph: {
    type: "website",
    siteName: "GADDA Mattresses",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
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
      <body
        suppressHydrationWarning
        className={`${bricolage.variable} ${hanken.variable} ${yatra.variable} antialiased`}
      >
        <SewingThread />
        <a href="#main" className="g-skip">
          Skip to content
        </a>
        <JsonLd data={[organizationLd(site), websiteLd()]} nonce={nonce} />
        <ConsentProvider initial={consent}>
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
