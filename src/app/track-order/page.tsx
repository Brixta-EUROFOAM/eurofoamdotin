import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrackOrder from "@/components/store/TrackOrder";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Track your order", robots: { index: false, follow: true } };

export default function TrackOrderPage() {
  return (
    <>
      <Header />
      <main id="main">
        <header className="g-page-head">
          <div className="g-wrap">
            <h1 className="g-h1" style={{ fontSize: "clamp(2.4rem, 5.6vw, 4.6rem)" }}>
              Where&apos;s my mattress?
            </h1>
            <p className="g-lede">
              Enter the order number from your confirmation and the mobile number you ordered with. Signed in?{" "}
              <Link href="/account" className="g-link">
                See all your orders
              </Link>
              .
            </p>
          </div>
        </header>
        <section className="g-section g-section--tight">
          <div className="g-wrap">
            <TrackOrder />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
