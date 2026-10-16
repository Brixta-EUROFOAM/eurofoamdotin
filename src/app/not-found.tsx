import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NeedleArt from "@/components/store/NeedleArt";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="g-section">
        <div className="g-wrap" style={{ maxWidth: 720 }}>
          <NeedleArt width={260} />
          <h1 className="g-h1" style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)" }}>
            This page came unstitched.
          </h1>
          <p className="g-lede">The link may be old or mistyped. Everything we sell is one click away though.</p>
          <div className="g-hero-cta">
            <Link href="/mattresses" className="g-btn g-btn--orange">
              Shop mattresses
            </Link>
            <Link href="/" className="g-btn g-btn--ghost">
              Go to the homepage
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
