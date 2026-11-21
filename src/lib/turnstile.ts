/** Cloudflare Turnstile guard. Enforcement is opt-in after checkout QA. */
export type TurnstilePurpose = "lead" | "order";
export type VerifyResult = { ok: true } | { ok: false; status: number; error: string };

export const turnstileEnforced = () => process.env.TURNSTILE_ENFORCE === "true";

export async function verifyTurnstile(token: unknown, purpose: TurnstilePurpose): Promise<VerifyResult> {
  if (!turnstileEnforced()) return { ok: true };
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const siteKey = process.env.TURNSTILE_SITE_KEY?.trim();
  if (!secret || !siteKey) return { ok: false, status: 503, error: "Security verification is temporarily unavailable. Please contact us." };
  if (typeof token !== "string" || !token || token.length > 2048) {
    return { ok: false, status: 422, error: "Please complete the security check and try again." };
  }
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }).toString(),
      signal: AbortSignal.timeout(7000),
      cache: "no-store",
    });
    if (!response.ok) return { ok: false, status: 503, error: "Security service is temporarily unavailable. Try again shortly." };
    const data = (await response.json()) as { success?: boolean; hostname?: string; action?: string };
    if (!data.success || data.action !== purpose) {
      return { ok: false, status: 422, error: "Security check expired or failed. Please try again." };
    }
    if (process.env.NODE_ENV === "production" && !["gadda.store", "www.gadda.store"].includes(data.hostname || "")) {
      return { ok: false, status: 422, error: "Invalid security verification. Please refresh and retry." };
    }
    return { ok: true };
  } catch {
    return { ok: false, status: 503, error: "Security service is temporarily unavailable. Please try again." };
  }
}
