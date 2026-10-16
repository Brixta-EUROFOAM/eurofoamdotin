import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountClient from "@/components/AccountClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

export default function AccountPage() {
  return (
    <>
      <Header />
      <main id="main" className="g-wrap">
        <AccountClient />
      </main>
      <Footer />
    </>
  );
}
