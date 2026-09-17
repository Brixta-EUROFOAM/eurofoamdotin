import Link from "next/link";

import { getStoreData } from "@/lib/store";
import {
  BUSINESS_ACTIVITY,
  BUSINESS_LEGAL_NAME,
} from "@/lib/business";

export default async function Footer() {
  const { site } = await getStoreData();

  return (
    <footer className="bg-[#111] text-[#F3ECDD]">

      <div className="mx-auto max-w-[1500px] px-5 py-16 lg:px-10 lg:py-24">

        <div className="border-b border-white/20 pb-16">

          <div className="relative inline-block pt-3">

            <div className="absolute left-0 right-0 top-0 h-[6px] bg-[#F3ECDD]" />

            <div className="text-[clamp(5rem,14vw,14rem)] font-black leading-[.7] tracking-[-.09em]">
              GADDA
            </div>

          </div>

          <p className="mt-8 text-[clamp(1.5rem,3vw,3rem)] font-bold tracking-[-.04em] text-white/70">
            Gadda hi hai yaar.
          </p>

        </div>


        <div className="grid gap-12 py-14 md:grid-cols-3">

          <div>

            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#FF6500]">
              GADDA
            </p>

            <div className="mt-5 grid gap-3 text-sm text-white/65">

              <Link href="/mattresses" className="hover:text-white">
                Saare gadde →
              </Link>

              <Link href="/compare" className="hover:text-white">
                Compare →
              </Link>

              <Link href="/sleep-quiz" className="hover:text-white">
                Kaunsa wala? →
              </Link>

            </div>

          </div>


          <div>

            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#FF6500]">
              IDHAR BHI
            </p>

            <div className="mt-5 grid gap-3 text-sm text-white/65">

              <Link href="/reviews" className="hover:text-white">
                Log kya bol rahe hain →
              </Link>

              <Link href="/wishlist" className="hover:text-white">
                Pasand wale →
              </Link>

              <Link href="/account" className="hover:text-white">
                Account →
              </Link>

            </div>

          </div>


          <div>

            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#FF6500]">
              BAAT KARNI HAI?
            </p>

            <div className="mt-5 text-sm leading-7 text-white/65">

              <div>{site.email}</div>

              <div>{site.phone}</div>

            </div>

            <Link
              href="/business-information"
              className="mt-5 inline-block text-xs font-black tracking-[.08em] text-white/55 hover:text-white"
            >
              BUSINESS INFORMATION →
            </Link>

          </div>

        </div>


        <div className="flex flex-col justify-between gap-5 border-t border-white/20 pt-7 text-xs text-white/40 md:flex-row">

          <div>
            <span className="text-white/65">
              Legal business name: {BUSINESS_LEGAL_NAME}
            </span>

            <span className="mx-2">
              ·
            </span>

            {BUSINESS_ACTIVITY}
          </div>


          <div>
            © {new Date().getFullYear()} GADDA.
          </div>

        </div>

      </div>

    </footer>
  );
}
