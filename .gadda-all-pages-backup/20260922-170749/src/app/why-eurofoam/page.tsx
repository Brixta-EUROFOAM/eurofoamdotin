import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function WhyGaddaPage() {

  return (
    <>
      <Header />

      <main className="site-why">

        <section className="site-why-hero">

          <p className="site-orange">
            WHY GADDA?
          </p>

          <h1>
            WE GOT
            <br />
            TIRED OF
            <br />
            <em>MATTRESS THEATRE.</em>
          </h1>

          <div className="site-why-lead">
            <strong>
              A mattress is already a big purchase.
              It does not need to become a research project too.
            </strong>

            <p>
              GADDA exists to make the product easier to understand:
              fewer decisions, clearer construction and a much more
              straightforward conversation about comfort.
            </p>
          </div>

        </section>


        <section className="site-why-problem">

          <div>
            <p className="site-orange">
              WHAT WE DIDN&apos;T LIKE
            </p>

            <h2>
              THE CATEGORY
              <br />
              STARTED SELLING
              <br />
              COMPLEXITY.
            </h2>
          </div>

          <div className="site-why-list">

            <article>
              <span>01</span>
              <h3>Too many choices.</h3>
              <p>
                When every mattress sounds almost identical,
                more options stop being useful.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>Too much jargon.</h3>
              <p>
                Material names mean very little unless somebody
                explains what they actually change while you sleep.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>Too much showroom theatre.</h3>
              <p>
                Ten minutes under bright lights is not how anyone
                actually sleeps.
              </p>
            </article>

          </div>

        </section>


        <section className="site-why-belief">

          <p className="site-dark-label">
            OUR VERSION IS LESS EXCITING.
          </p>

          <h2>
            MAKE A GOOD
            <br />
            MATTRESS.
            <br />
            SHOW WHAT&apos;S
            <br />
            INSIDE.
            <br />
            PRICE IT CLEARLY.
          </h2>

          <div className="site-why-belief-foot">

            <p>
              We would rather earn trust by being understandable
              than impress you with a longer vocabulary.
            </p>

            <strong>
              GOOD SLEEP.
              <br />
              NO DRAMA.
            </strong>

          </div>

        </section>


        <section className="site-why-pillars">

          <article>
            <span>01</span>
            <h3>FEWER GADDAS.</h3>
            <p>
              Different mattresses should exist for different reasons,
              not just to create a bigger catalogue.
            </p>
          </article>

          <article>
            <span>02</span>
            <h3>NO BLACK BOX.</h3>
            <p>
              If a layer matters, you should be able to see it
              and understand the job it is doing.
            </p>
          </article>

          <article>
            <span>03</span>
            <h3>TRY IT AT HOME.</h3>
            <p>
              Your bedroom is a better test environment
              than a mattress showroom.
            </p>
          </article>

          <article>
            <span>04</span>
            <h3>REAL FEEDBACK.</h3>
            <p>
              Reviews, support conversations and returns should
              make the next product better.
            </p>
          </article>

        </section>


        <section className="site-why-final">

          <p className="site-orange">
            ENOUGH ABOUT US.
          </p>

          <h2>
            SEE THE
            <br />
            GADDAS.
          </h2>

          <Link href="/mattresses">
            SHOP THE RANGE →
          </Link>

        </section>

      </main>

      <Footer />
    </>
  );
}
