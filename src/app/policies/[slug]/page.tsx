import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPolicy, POLICIES } from "@/lib/policies";
import { getStoreData } from "@/lib/store";
import { BUSINESS } from "@/lib/business";
import { phoneLink, realEmail } from "@/lib/contact";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getPolicy(slug);
  return p ? { title: p.title, description: p.summary, alternates: { canonical: `/policies/${p.slug}` } } : { title: "Not found" };
}

export default async function PolicyPage({ params }: Params) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();
  const { site } = await getStoreData();
  const ctx = { email: realEmail(site.email), phone: phoneLink(site.phone)?.label || null };

  return (
    <>
      <Header />
      <main id="main">
        <header className="g-page-head">
          <div className="g-wrap">
            <nav aria-label="Breadcrumb">
              <ol className="g-crumbs">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>Policies</li>
                <li aria-current="page">{policy.title}</li>
              </ol>
            </nav>
            <h1 className="g-h1" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}>
              {policy.title}
            </h1>
            <p className="g-lede">{policy.summary}</p>
            <nav className="g-policy-nav" aria-label="Policies">
              {POLICIES.map((p) => (
                <Link key={p.slug} href={`/policies/${p.slug}`} aria-current={p.slug === policy.slug ? "page" : undefined}>
                  {p.title}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <article className="g-section g-section--tight">
          <div className="g-wrap">
            <div className="g-prose">
              {policy.body(ctx)}
              <p style={{ marginTop: 40, fontSize: ".88rem" }}>Last updated {BUSINESS.policiesUpdated}.</p>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
