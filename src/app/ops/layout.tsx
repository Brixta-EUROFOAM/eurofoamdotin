import type { Metadata, Viewport } from "next";
import "./ops.css";

export const metadata: Metadata = { title: "Operations", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#23211e" };

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
