/*
  Cookie & tracking consent — DPDP Act 2023 / DPDP Rules 2025 style.

  - Consent is opt-in, per purpose, and as easy to refuse as to give
    (equal-weight "Accept all" / "Reject all").
  - Nothing optional runs before a choice is made.
  - Global Privacy Control and Do-Not-Track are treated as "reject" for
    analytics and marketing.
  - The choice is stored in a first-party cookie the server can read, and
    a receipt (no personal data) is logged so consent can be proven.
  - Bumping CONSENT_VERSION re-asks everyone (do it when purposes change).
*/

export const CONSENT_COOKIE = "gd_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 6 months, then re-ask

export type ConsentPurpose = "necessary" | "analytics" | "marketing";

export type ConsentState = {
  v: number;
  /* ISO timestamp the choice was made */
  at: string;
  /* random receipt id, also logged server-side */
  id: string;
  analytics: boolean;
  marketing: boolean;
};

export const PURPOSES: {
  key: ConsentPurpose;
  title: string;
  body: string;
  locked?: boolean;
}[] = [
  {
    key: "necessary",
    title: "Needed to run the shop",
    body: "Your cart, sign-in, delivery PIN code, security and this consent choice. These can't be switched off.",
    locked: true,
  },
  {
    key: "analytics",
    title: "Improve the site",
    body: "Anonymous visit counts and which pages help or confuse people. First-party only — nothing is sent to Google or Meta.",
  },
  {
    key: "marketing",
    title: "Ads and offers",
    body: "Lets advertising partners measure our ads and show you relevant ones. Off unless you switch it on.",
  },
];

export function parseConsent(raw?: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(decodeURIComponent(raw)) as ConsentState;
    if (value?.v !== CONSENT_VERSION) return null;
    return {
      v: value.v,
      at: String(value.at || ""),
      id: String(value.id || "").slice(0, 64),
      analytics: value.analytics === true,
      marketing: value.marketing === true,
    };
  } catch {
    return null;
  }
}

export function serializeConsent(state: ConsentState) {
  return encodeURIComponent(JSON.stringify(state));
}
