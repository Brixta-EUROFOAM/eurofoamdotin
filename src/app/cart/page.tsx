import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartClient from "@/components/CartClient";
import { razorpayReady } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Cart", robots: { index: false, follow: false } };

export default function CartPage() {
  return (
    <>
      <Header />
      <main id="main" className="g-wrap">
        <CartClient onlinePay={razorpayReady()} />
      </main>
      <Footer />
    </>
  );
}
