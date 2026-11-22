"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "@/components/store/ConsentProvider";
import { trackGa4Interaction } from "@/lib/ga4-client";

type BuyerPath = {
  intent: string;
  title: string;
  description: string;
  primary: string;
  primaryHref: string;
  secondary: string;
  secondaryHref: string;
};

function offer(path: string): BuyerPath | null {
  if (path === "/guides/mattress-too-firm") return {
    intent: "firm", title: "Want a softer surface without losing support?",
    description: "Compare GADDA Pro's memory-foam top and 32D HR base. Your feel may differ.",
    primary: "See Pro & choose size", primaryHref: "/mattresses/gadda-pro",
    secondary: "Check my match", secondaryHref: "/sleep-quiz?problem=firm#sleepmatch",
  };
  if (path === "/guides/mattress-too-soft") return {
    intent: "sinking", title: "Prefer a firmer, simpler mattress?",
    description: "Check GADDA Regular, then select your size and eligible delivery PIN.",
    primary: "See Regular & price", primaryHref: "/mattresses/gadda-regular",
    secondary: "Compare mattress feels", secondaryHref: "/sleep-quiz?problem=sinking#sleepmatch",
  };
  if (path === "/guides/sleeping-hot-on-mattress") return {
    intent: "hot", title: "Comparing cooling-oriented constructions?",
    description: "See Ultimate's actual layers and trade-offs. Cooling isn't guaranteed.",
    primary: "See Ultimate & price", primaryHref: "/mattresses/gadda-ultimate",
    secondary: "Find my match", secondaryHref: "/sleep-quiz?problem=hot#sleepmatch",
  };
  if (path === "/guides/the-sleep-company-mattress-return") return {
    intent: "return", title: "Need a replacement after contacting the seller?",
    description: "GADDA cannot process another brand's return. You can compare your next mattress here.",
    primary: "Compare replacements", primaryHref: "/compare",
    secondary: "See GADDA trial rules", secondaryHref: "/policies/trial",
  };
  if (path.startsWith("/guides/") || path.startsWith("/alternatives/")) return {
    intent: "problem", title: "Know what you want to change in your next mattress?",
    description: "Match firmness and construction, then check price and Assam/Meghalaya delivery.",
    primary: "Find my mattress", primaryHref: "/sleep-quiz#sleepmatch",
    secondary: "Compare 3 models", secondaryHref: "/compare",
  };
  if (path === "/alternatives" || path === "/guides/mattress-problems") return {
    intent: "research", title: "Turn your research into a shortlist",
    description: "Compare three real GADDA constructions, without a signup or hidden upgrade.",
    primary: "See recommended match", primaryHref: "/sleep-quiz#sleepmatch",
    secondary: "Compare models", secondaryHref: "/compare",
  };
  if (path === "/mattresses/guwahati") return {
    intent: "guwahati", title: "Ready to check the final mattress price?",
    description: "Select size and thickness. Delivery depends on your Assam or Meghalaya PIN code.",
    primary: "Shop mattresses", primaryHref: "/mattresses",
    secondary: "Find the right feel", secondaryHref: "/sleep-quiz#sleepmatch",
  };
  if (path === "/size-guide") return {
    intent: "size", title: "Got your bed measurements?",
    description: "Choose a GADDA model and enter your exact size for the current price.",
    primary: "Choose size & price", primaryHref: "/mattresses",
    secondary: "Compare models", secondaryHref: "/compare",
  };
  if (path === "/compare") return {
    intent: "compare", title: "Found the feel and materials you prefer?",
    description: "Pick a model, configure the exact size and check delivery eligibility.",
    primary: "Choose my mattress", primaryHref: "/mattresses",
    secondary: "Need a recommendation?", secondaryHref: "/sleep-quiz#sleepmatch",
  };
  return null;
}

/** Optional, dismissible, context-matched path to the store. Never blocks reading or checkout. */
export default function IntentPurchasePath() {
  const path = usePathname() || "/";
  const { analytics } = useConsent();
  const [scrolled, setScrolled] = useState({ path: "", visible: false });
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const choice = offer(path);

  useEffect(() => {
    if (!offer(path)) return;
    const onScroll = () => {
      const visible = window.scrollY > 340;
      setScrolled((state) => state.path === path && state.visible === visible ? state : { path, visible });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [path]);

  if (!choice || scrolled.path !== path || !scrolled.visible || dismissedFor === path) return null;
  const clicked = (choiceType: "primary" | "secondary") => {
    if (analytics) trackGa4Interaction("purchase_path_click", { intent: choice.intent, choice: choiceType });
  };
  return (
    <aside className="g-intent-path" aria-label="Optional next step for mattress shopping">
      <button type="button" className="g-intent-path-close" onClick={() => setDismissedFor(path)} aria-label="Dismiss mattress recommendation">×</button>
      <p className="g-intent-path-kicker">YOUR NEXT STEP · GADDA</p>
      <h2>{choice.title}</h2>
      <p>{choice.description}</p>
      <div className="g-intent-path-actions">
        <Link onClick={() => clicked("primary")} href={choice.primaryHref} className="g-intent-path-primary">{choice.primary}</Link>
        <Link onClick={() => clicked("secondary")} href={choice.secondaryHref} className="g-intent-path-secondary">{choice.secondary}</Link>
      </div>
      <small>Only eligible Assam and Meghalaya PIN codes. No obligation to buy.</small>
    </aside>
  );
}
