import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reviews from "@/components/store/Reviews";
import HelpStrip from "@/components/store/HelpStrip";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Reviews",
  description: "Reviews from people who bought and slept on a GADDA mattress. Unedited and unpaid.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const { reviews } = await getStoreData();
  return (
    <>
      <Header />
      <main id="main">
        <header className="g-page-head">
          <div className="g-wrap">
            <nav aria-label="Breadcrumb">
              <ol className="g-crumbs">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li aria-current="page">Reviews</li>
              </ol>
            </nav>
            <h1 className="g-h1" style={{ fontSize: "clamp(2.4rem, 5.6vw, 4.6rem)" }}>
              Slept on it. Then said so.
            </h1>
            <p className="g-lede">
              Reviews come only from real orders. We publish the bad ones too, and we never pay or offer discounts for
              a rating.
            </p>
          </div>
        </header>
        <Reviews reviews={reviews} limit={200} heading={false} />
        <HelpStrip />
      </main>
      <Footer />
    </>
  );
}
