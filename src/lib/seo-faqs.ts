import { FAQS, OLD_PAY_ANSWER, PAY_QUESTION, payAnswer } from "@/lib/content";
import { razorpayReady } from "@/lib/razorpay";
import type { SiteSettings } from "@/lib/catalog";

export function actualFaqs(site: SiteSettings) {
  const custom = site.faqs?.filter((f) => f.q?.trim() && f.a?.trim());
  const entries = custom?.length ? custom : FAQS;
  return entries.map((f) => ({
    q: f.q,
    a: f.q === PAY_QUESTION && [OLD_PAY_ANSWER, payAnswer(true), payAnswer(false)].includes(f.a)
      ? payAnswer(razorpayReady()) : f.a,
  }));
}
