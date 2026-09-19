import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WishlistClient from "@/components/WishlistClient";

export default function WishlistPage() {
  return (
    <>
      <Header />

      <main className="site-utility-page">
        <WishlistClient />
      </main>

      <Footer />
    </>
  );
}
