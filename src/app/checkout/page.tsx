import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutClient from "@/components/store/CheckoutClient";
import { BUSINESS } from "@/lib/business";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main id="main" className="g-wrap">
        <CheckoutClient trialNights={BUSINESS.trialNights} />
      </main>
      <Footer />
    </>
  );
}
