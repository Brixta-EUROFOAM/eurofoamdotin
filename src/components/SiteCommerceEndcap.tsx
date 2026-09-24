import Link from "next/link";

export default function SiteCommerceEndcap({
  eyebrow = "ENOUGH RESEARCH.",
  title = "PICK THE JOB. PICK THE GADDA.",
}: {
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section className="site-commerce-endcap">
      <div className="site-commerce-endcap-copy">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
      </div>

      <div className="site-commerce-endcap-actions">
        <Link href="/mattresses" className="site-commerce-endcap-primary">
          SHOP GADDAS →
        </Link>
        <Link href="/sleep-quiz" className="site-commerce-endcap-secondary">
          FIND MY MATCH →
        </Link>
        <Link href="/compare" className="site-commerce-endcap-text">
          COMPARE THE RANGE
        </Link>
      </div>

      <div className="site-commerce-endcap-proof">
        <span>TRIAL TERMS SHOWN BEFORE YOU BUY</span>
        <span>WARRANTY SHOWN BY MODEL</span>
        <span>STANDARD SHIPPING INCLUDED</span>
      </div>
    </section>
  );
}
