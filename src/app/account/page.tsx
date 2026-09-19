import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountClient from "@/components/AccountClient";

export default function AccountPage() {
  return (
    <>
      <Header />

      <main className="site-utility-page">
        <AccountClient />
      </main>

      <Footer />
    </>
  );
}
