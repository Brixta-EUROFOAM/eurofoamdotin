import Link from "next/link";
import { TRUST } from "@/lib/content";
import { IconMoon, IconRupee, IconTag, IconTruck } from "@/components/store/Icons";

const ICONS = { trial: IconMoon, delivery: IconTruck, price: IconTag, pay: IconRupee } as const;

export default function TrustStrip() {
  return (
    <section className="g-trust" aria-label="What you get with every GADDA">
      <div className="g-wrap g-trust-grid g-rail">
        {TRUST.map((t) => {
          const Icon = ICONS[t.id];
          return (
            <Link key={t.id} href={t.href} className="g-trust-item">
              <Icon />
              <div>
                <b>{t.title}</b>
                <span>{t.body}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
