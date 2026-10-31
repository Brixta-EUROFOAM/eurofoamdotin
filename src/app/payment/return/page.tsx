import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SewnLabel from "@/components/store/SewnLabel";
import { applyPaymentLink, paymentLabel, type Order } from "@/lib/orders";
import { fetchPaymentLink, verifyReturn, type RazorpayLink } from "@/lib/razorpay";
import { money } from "@/lib/catalog";
import { BUSINESS } from "@/lib/business";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment", robots: { index: false, follow: false } };

type Params = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";

/*
  Where Razorpay sends the customer after paying. Nothing here is trusted
  from the address bar: the signature is checked with our key secret, then
  the link is fetched from Razorpay's API and only that answer is used.
*/
export default async function PaymentReturnPage({ searchParams }: Params) {
  const q = await searchParams;
  const ret = {
    linkId: one(q.razorpay_payment_link_id),
    referenceId: one(q.razorpay_payment_link_reference_id),
    status: one(q.razorpay_payment_link_status),
    paymentId: one(q.razorpay_payment_id),
    signature: one(q.razorpay_signature),
  };

  let link: RazorpayLink | null = null;
  let order: Order | null = null;
  let problem = "";
  if (!ret.linkId) {
    problem = "There's no payment to show here.";
  } else if (!verifyReturn(ret)) {
    problem = "We couldn't confirm this payment from this page.";
  } else {
    try {
      link = await fetchPaymentLink(ret.linkId);
      order = await applyPaymentLink(link);
      if (!order) problem = "We couldn't match this payment to an order.";
    } catch {
      problem = "We're still confirming your payment with Razorpay.";
    }
  }

  const paid = link?.status === "paid" && order;

  return (
    <>
      <Header />
      <main id="main" className="g-wrap">
        <div className="g-narrow" style={{ display: "grid", gap: 18, paddingBlock: "clamp(32px, 6vw, 72px)" }}>
          {paid && order ? (
            <div className="g-receipt" role="status">
              <SewnLabel
                tone="white"
                title={
                  <>
                    Payment received
                    <small>Keep this label, it&apos;s your receipt</small>
                  </>
                }
                rows={[
                  ["Order number", <b key="id">{order.id}</b>],
                  ["Paid", `${money((link?.amount_paid || 0) / 100)} incl. GST and delivery`],
                  ["Payment", paymentLabel(order)],
                  ["Payment ID", order.pay?.paymentId || ret.paymentId],
                  ["Deliver to", `${order.customer.city} ${order.customer.pincode}`],
                  ["Trial", `${BUSINESS.trialNights} nights from delivery`],
                ]}
              />
              <p style={{ margin: 0, color: "var(--g-ink-2)" }}>
                Thank you. We&apos;ll call you on {order.customer.phone} to fix a delivery date. Nothing else to pay.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Link href="/track-order" className="g-btn">
                  Track this order
                </Link>
                <Link href="/" className="g-btn g-btn--ghost">
                  Back to the shop
                </Link>
              </div>
            </div>
          ) : order && link ? (
            <section className="g-card-flat" role="status">
              <h1 className="g-h3" style={{ marginTop: 0 }}>
                The payment didn&apos;t go through
              </h1>
              <p style={{ color: "var(--g-ink-2)" }}>
                Order {order.id} is saved and nothing was charged. You can try again, or simply pay when the mattress
                arrives. We&apos;ll call you either way.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {link.status === "created" ? (
                  <a href={link.short_url} className="g-btn g-btn--orange">
                    Try again, {money(link.amount / 100)}
                  </a>
                ) : null}
                <Link href="/track-order" className="g-btn g-btn--ghost">
                  Track this order
                </Link>
              </div>
            </section>
          ) : (
            <section className="g-card-flat" role="status">
              <h1 className="g-h3" style={{ marginTop: 0 }}>
                {problem || "Payment"}
              </h1>
              <p style={{ color: "var(--g-ink-2)" }}>
                If money left your account, it shows on your order within a few minutes. Check it with your order number
                and phone, or call us and we&apos;ll look it up.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <Link href="/track-order" className="g-btn">
                  Track your order
                </Link>
                <Link href="/contact" className="g-btn g-btn--ghost">
                  Contact us
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
