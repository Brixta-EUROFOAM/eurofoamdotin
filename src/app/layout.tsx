import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eurofoam | PU Foam & Mattress Company",
  description: "One of the best mattress brands in India producing premium quality HD foam, PU foam, and Spring Mattresses.",
  icons: {
    icon: "/eurofoam-logo.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-primary/30">
        {children}
      </body>
    </html>
  );
}