import { getStoreData } from "@/lib/store";
import HeaderClient from "@/components/HeaderClient";

export default async function Header() {
  const { site } = await getStoreData();
  return <HeaderClient site={site} />;
}
