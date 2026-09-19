import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SocialInspiredHome from "@/components/home/SocialInspiredHome";
import { getStoreData } from "@/lib/store";
import FloatingPillMotion from "@/components/home/FloatingPillMotion";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { site, products } = await getStoreData();

  return (
    <>
      <Header />
      <FloatingPillMotion />
      <SocialInspiredHome site={site} products={products} />
      <Footer />
    </>
  );
}
