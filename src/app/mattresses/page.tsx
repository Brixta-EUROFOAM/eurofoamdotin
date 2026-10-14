import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { money } from "@/lib/catalog";
import { getStoreData } from "@/lib/store";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function MattressesPage() {
  const { products } = await getStoreData();

  return (
    <>
      <Header />
      <main className={styles.shop}>
        <section className={styles.intro} aria-labelledby="mattresses-title">
          <div className={styles.introInner}>
            <div className={styles.breadcrumb}>
              <Link href="/">GADDA</Link>
              <span aria-hidden="true">/</span>
              <span>MATTRESSES</span>
              <span className={styles.rangeCount}>{products.length} MODELS</span>
            </div>

            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>THE GADDA COLLECTION</p>
                <h1 id="mattresses-title">FIND YOUR<br /><span>GADDA.</span></h1>
                <p className={styles.heroDescription}>
                  A mattress should be easy to understand and comfortable to live with.
                  See what each one is made of, compare the feel, and choose the one that suits you.
                </p>
                <div className={styles.heroActions}>
                  <a className={styles.primaryAction} href="#range">
                    SHOP THE RANGE <span aria-hidden="true">↗</span>
                  </a>
                  <Link className={styles.textAction} href="/compare">
                    COMPARE MATTRESSES <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              <div className={styles.heroPhoto}>
                <img
                  src="/media/1789122018422-a-mattress-on-a-wooden-floor-in-a-bedroom-photo.jpg"
                  alt="Mattress in a furnished bedroom"
                />
                <div className={styles.photoCaption}>GOOD SLEEP. NO DRAMA.</div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.range} id="range" aria-labelledby="range-title">
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>THE RANGE</p>
                <h2 id="range-title">CHOOSE YOUR COMFORT.</h2>
              </div>
              <p className={styles.sectionIntro}>
                Different materials. Different feels. Clear starting prices.
                Open any mattress to choose your size and height.
              </p>
            </div>

            {products.length === 0 ? (
              <div className={styles.empty}>Our mattress range is being updated. Please check back soon.</div>
            ) : (
              <div className={styles.productGrid}>
                {products.map((product, index) => (
                  <article className={styles.card} key={product.slug}>
                    <div className={styles.productVisual}>
                      <Link
                        href={`/mattresses/${product.slug}`}
                        className={styles.imageLink}
                        aria-label={`View ${product.name}`}
                      >
                        <img src={product.image} alt={product.name} loading="lazy" />
                      </Link>
                      <span className={styles.itemNumber}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <p className={styles.productCategory}>{product.category || "MATTRESS"}</p>
                      <h3>
                        <Link href={`/mattresses/${product.slug}`}>{product.name}</Link>
                      </h3>
                      <p className={styles.productDescription}>{product.shortDescription}</p>
                      <dl className={styles.specifications}>
                        <div>
                          <dt>FEEL</dt>
                          <dd>{product.firmness}</dd>
                        </div>
                        <div>
                          <dt>AVAILABLE HEIGHTS</dt>
                          <dd>{product.heights.map((height) => height.label).join(" / ")}</dd>
                        </div>
                      </dl>
                      <div className={styles.cardBottom}>
                        <div className={styles.productPrice}>
                          <span>STARTING AT</span>
                          <strong>{money(product.basePrice)}</strong>
                        </div>
                        <Link className={styles.cardAction} href={`/mattresses/${product.slug}`}>
                          VIEW MATTRESS <span aria-hidden="true">↗</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <p className={styles.priceNote}>
              Starting prices are for the lowest-priced available configuration.
              Your selected size and height determine the final price.
            </p>
          </div>
        </section>

        <section className={styles.helpSection} aria-labelledby="help-title">
          <div className={styles.helpInner}>
            <div>
              <p className={styles.eyebrow}>NEED A HAND?</p>
              <h2 id="help-title">NOT SURE WHICH ONE?</h2>
              <p>Put the mattresses side by side, or answer a few questions to narrow down the options.</p>
            </div>
            <div className={styles.helpActions}>
              <Link className={styles.primaryAction} href="/compare">
                COMPARE THE RANGE <span aria-hidden="true">↗</span>
              </Link>
              <Link className={styles.outlineAction} href="/sleep-quiz">
                FIND MY MATCH <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
