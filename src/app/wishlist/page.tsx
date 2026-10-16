import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WishlistClient from "@/components/WishlistClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Saved mattresses", robots: { index: false, follow: false } };

export default function WishlistPage() {
  return (
    <>
      <Header />
      <main id="main" className="g-wrap" style={{ paddingBlock: 40 }}>
        <h1 className="g-h2" style={{ marginBottom: 24 }}>
          Saved mattresses
        </h1>
        <WishlistClient />
      </main>
      <Footer />
    </>
  );
}
