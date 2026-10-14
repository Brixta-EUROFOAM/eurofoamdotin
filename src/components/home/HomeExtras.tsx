import Link from "next/link";

/*
  Two Dollar-Shave-Club style sections in the existing GADDA look:
  1. Showroom vs GADDA — the whole pitch in one table.
  2. How it works — order to "keep it or don't".
*/

const VERSUS: [string, string, string][] = [
  ["Price", "\"MRP ₹38,000. Today only ₹14,999!\"", "One honest price. Same every day."],
  ["Foam names", "AI Sleep Tech. NASA Matrix. Max Pro Ultra+.", "HR foam. Memory foam. Density in numbers."],
  ["Trying it", "Lie down for 4 minutes while a salesman watches.", "Sleep on it at home for 100 nights."],
  ["Choosing", "Fourteen models that are mostly the same.", "Three Gaddas. Regular, Pro, Ultimate."],
  ["Delivery", "Extra charges. \"Sir, lift ka extra.\"", "Free delivery to your door."],
];

const STEPS: [string, string][] = [
  ["Pick your Gadda", "Regular, Pro or Ultimate. Choose size and height. Two minutes, tops."],
  ["We call to confirm", "A real person confirms your order, address and delivery day."],
  ["It comes to you", "Delivered to your door. Pay on delivery or by UPI link."],
  ["100 nights to decide", "Sleep on it properly. Not for you? Tell us within the trial. No drama."],
];

export default function HomeExtras() {
  return (
    <>
      <section className="gp-versus" aria-labelledby="gp-versus-title">
        <div className="gp-versus-head">
          <p>THE DIFFERENCE</p>
          <h2 id="gp-versus-title">
            SHOWROOM.
            <br />
            <span>VS GADDA.</span>
          </h2>
        </div>

        <div className="gp-versus-table" role="table">
          <div className="gp-versus-row gp-versus-top" role="row">
            <span role="columnheader" />
            <span role="columnheader">THE SHOWROOM</span>
            <span role="columnheader">GADDA</span>
          </div>
          {VERSUS.map(([what, them, us]) => (
            <div className="gp-versus-row" role="row" key={what}>
              <b role="rowheader">{what}</b>
              <span role="cell" className="gp-them">{them}</span>
              <span role="cell" className="gp-us">{us}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="gp-how" aria-labelledby="gp-how-title">
        <div className="gp-how-head">
          <p>HOW IT WORKS</p>
          <h2 id="gp-how-title">
            ORDER.
            <br />
            SLEEP.
            <br />
            <span>DECIDE.</span>
          </h2>
        </div>

        <ol className="gp-steps">
          {STEPS.map(([title, body], i) => (
            <li key={title}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </li>
          ))}
        </ol>

        <div className="gp-how-cta">
          <Link href="/mattresses" className="gs-commerce-primary">
            SHOP GADDAS <span>→</span>
          </Link>
          <Link href="/compare" className="gp-how-link">
            Compare all three →
          </Link>
        </div>
      </section>
    </>
  );
}
