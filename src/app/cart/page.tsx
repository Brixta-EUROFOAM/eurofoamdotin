import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartClient from "@/components/CartClient";

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="site-utility-page">
        <CartClient />
      </main>
      <Footer />
    </>
  );
}
