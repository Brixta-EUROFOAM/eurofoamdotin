"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE,
  CONSENT_VERSION,
  PURPOSES,
  serializeConsent,
  type ConsentState,
} from "@/lib/consent";
import { IconClose } from "@/components/store/Icons";

type Ctx = {
  consent: ConsentState | null;
  /* true once the visitor has made a choice (or GPC answered for them) */
  decided: boolean;
  analytics: boolean;
  marketing: boolean;
  openPreferences: () => void;
};

const ConsentContext = createContext<Ctx>({
  consent: null,
  decided: false,
  analytics: false,
  marketing: false,
  openPreferences: () => {},
});

export const useConsent = () => useContext(ConsentContext);

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function writeCookie(state: ConsentState) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${serializeConsent(state)}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`;
}

function signalOptOut() {
  if (typeof navigator === "undefined") return false;
  return navigator.globalPrivacyControl === true || navigator.doNotTrack === "1";
}

export default function ConsentProvider({
  initial,
  children,
}: {
  initial: ConsentState | null;
  children: ReactNode;
}) {
  const [consent, setConsent] = useState<ConsentState | null>(initial);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [draft, setDraft] = useState({ analytics: false, marketing: false });
  const [optOutSignal, setOptOutSignal] = useState(false);
  const pathname = usePathname() || "/";
  const onAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const gpc = signalOptOut();
    setOptOutSignal(gpc);
    if (!initial) {
      // Browser privacy signal = a clear "no". Record it and don't nag.
      if (gpc) {
        save({ analytics: false, marketing: false }, true);
      } else {
        const t = setTimeout(() => setBannerOpen(true), 900);
        return () => clearTimeout(t);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep Google Consent Mode (if a tag manager is ever added) in sync.
  useEffect(() => {
    if (!consent || typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
    });
  }, [consent]);

  const save = useCallback(
    (choice: { analytics: boolean; marketing: boolean }, viaSignal = false) => {
      const gpc = signalOptOut();
      const state: ConsentState = {
        v: CONSENT_VERSION,
        at: new Date().toISOString(),
        id: newId(),
        analytics: gpc ? false : choice.analytics,
        marketing: gpc ? false : choice.marketing,
      };
      writeCookie(state);
      setConsent(state);
      setBannerOpen(false);
      setPrefsOpen(false);
      // Consent receipt — proof of what was agreed, when. No personal data.
      void fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ ...state, source: viaSignal ? "gpc" : "banner" }),
      }).catch(() => {});
      // Withdrawing analytics consent wipes the analytics identifiers too.
      if (!state.analytics) {
        try {
          localStorage.removeItem("eurofoam-visitor-v1");
          localStorage.removeItem("eurofoam-session-v1");
        } catch {}
      }
    },
    []
  );

  const openPreferences = useCallback(() => {
    setDraft({ analytics: consent?.analytics ?? false, marketing: consent?.marketing ?? false });
    setBannerOpen(false);
    setPrefsOpen(true);
  }, [consent]);

  const value = useMemo<Ctx>(
    () => ({
      consent,
      decided: Boolean(consent),
      analytics: Boolean(consent?.analytics),
      marketing: Boolean(consent?.marketing),
      openPreferences,
    }),
    [consent, openPreferences]
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}

      {bannerOpen && !prefsOpen && !onAdmin ? (
        <section className="g-consent" role="region" aria-label="Cookie choices">
          <h2>Cookies, briefly</h2>
          <p>
            We use a few to run the shop (cart, sign-in, your PIN code). With your OK we&apos;d also count visits
            to make the site better — first-party, never sold. Your call. <Link href="/policies/cookies" className="g-link">Cookie policy</Link>
          </p>
          <div className="g-consent-actions">
            <button type="button" className="g-btn g-btn--ghost" onClick={() => save({ analytics: false, marketing: false })}>
              Reject all
            </button>
            <button type="button" className="g-btn" onClick={() => save({ analytics: true, marketing: true })}>
              Accept all
            </button>
            <button type="button" className="g-link g-consent-more" onClick={openPreferences}>
              Choose what to allow
            </button>
          </div>
        </section>
      ) : null}

      {prefsOpen ? (
        <div className="g-dialog-wrap" onClick={(e) => e.target === e.currentTarget && setPrefsOpen(false)}>
          <div className="g-dialog g-dialog--wide" role="dialog" aria-modal="true" aria-labelledby="consent-title">
            <button type="button" className="g-icon-btn g-dialog-close" aria-label="Close" onClick={() => setPrefsOpen(false)}>
              <IconClose />
            </button>
            <h2 id="consent-title">Your privacy choices</h2>
            <p>
              Change these any time from &ldquo;Cookie settings&rdquo; at the bottom of every page. Withdrawing is as
              easy as agreeing.
            </p>
            {optOutSignal ? (
              <p className="g-chip g-chip--indigo" style={{ marginTop: 14 }}>
                Your browser sends a Global Privacy Control signal, so optional tracking stays off.
              </p>
            ) : null}
            <div style={{ marginTop: 10 }}>
              {PURPOSES.map((purpose) => {
                const on = purpose.locked ? true : draft[purpose.key as "analytics" | "marketing"];
                return (
                  <div className="g-purpose" key={purpose.key}>
                    <div>
                      <b id={`p-${purpose.key}`}>{purpose.title}</b>
                      <p>{purpose.body}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      className="g-switch"
                      aria-checked={on}
                      aria-labelledby={`p-${purpose.key}`}
                      disabled={purpose.locked || (optOutSignal && !purpose.locked)}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          [purpose.key]: !d[purpose.key as "analytics" | "marketing"],
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
            <div className="g-consent-actions" style={{ marginTop: 20 }}>
              <button type="button" className="g-btn g-btn--ghost" onClick={() => save({ analytics: false, marketing: false })}>
                Reject all
              </button>
              <button type="button" className="g-btn" onClick={() => save(draft)}>
                Save choices
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConsentContext.Provider>
  );
}

export function CookieSettingsLink({ className = "g-link" }: { className?: string }) {
  const { openPreferences } = useConsent();
  return (
    <button type="button" className={className} onClick={openPreferences}>
      Cookie settings
    </button>
  );
}
