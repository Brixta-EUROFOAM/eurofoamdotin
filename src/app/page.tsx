import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SocialInspiredHome from "@/components/home/SocialInspiredHome";
import { getStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { site, products, reviews } = await getStoreData();

  return (
    <>
      <Header />
      <SocialInspiredHome site={site} products={products} reviews={reviews} />
      <Footer />
    </>
  );
}
