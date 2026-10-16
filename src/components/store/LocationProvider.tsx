"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { etaRange } from "@/lib/delivery";
import { IconClose, IconPin } from "@/components/store/Icons";
import { trackEvent } from "@/lib/telemetry-client";

/*
  Delivery location, the way the better mattress sites do it — but
  without nagging:
  - Asked for only when it matters (first product page or cart visit),
    never as a wall on landing.
  - Always skippable; we never auto-detect location or ask the browser
    for GPS. The PIN is something the visitor types.
  - Saved in a first-party cookie (gd_pin) so the server can show the
    same delivery estimate; it's "necessary" because the visitor asked
    for it, and it's cleared like any other cookie.
*/

export type PinInfo = {
  ok: boolean;
  pin: string;
  reason?: "invalid" | "unserviceable";
  zone?: string;
  minDays?: number;
  maxDays?: number;
  place?: { city: string; district: string; state: string } | null;
};

type Ctx = {
  pin: string;
  info: PinInfo | null;
  eta: string | null;
  loading: boolean;
  check: (pin: string) => Promise<PinInfo | null>;
  openPicker: () => void;
  /* show the picker once per browser, the first time it's useful */
  askOnce: () => void;
};

const LocationContext = createContext<Ctx | null>(null);

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used inside LocationProvider");
  return ctx;
}

const PIN_COOKIE = "gd_pin";
const ASKED_KEY = "gd-pin-asked";

function setPinCookie(pin: string) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${PIN_COOKIE}=${pin}; Path=/; Max-Age=${60 * 60 * 24 * 90}; SameSite=Lax${secure}`;
}

export default function LocationProvider({
  initialPin,
  children,
}: {
  initialPin: string;
  children: ReactNode;
}) {
  const [pin, setPin] = useState(initialPin);
  const [info, setInfo] = useState<PinInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const check = useCallback(async (raw: string) => {
    const clean = raw.replace(/\D/g, "").slice(0, 6);
    if (clean.length !== 6) {
      const bad: PinInfo = { ok: false, pin: clean, reason: "invalid" };
      setInfo(bad);
      return bad;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/pincode?pin=${clean}`);
      const data = (await res.json()) as PinInfo;
      setInfo(data);
      if (data.ok) {
        setPin(clean);
        setPinCookie(clean);
      }
      void trackEvent("pincode_check", { ok: data.ok, zone: data.zone || "" });
      return data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Rehydrate the saved PIN's details quietly.
  useEffect(() => {
    if (initialPin) void check(initialPin);
  }, [initialPin, check]);

  const askOnce = useCallback(() => {
    if (pin) return;
    try {
      if (localStorage.getItem(ASKED_KEY)) return;
      localStorage.setItem(ASKED_KEY, "1");
    } catch {
      return;
    }
    setTimeout(() => setOpen(true), 1200);
  }, [pin]);

  const eta = info?.ok && info.minDays != null && info.maxDays != null ? etaRange(info.minDays, info.maxDays) : null;

  const value = useMemo<Ctx>(
    () => ({ pin, info, eta, loading, check, openPicker: () => setOpen(true), askOnce }),
    [pin, info, eta, loading, check, askOnce]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
      {open ? <PinDialog onClose={() => setOpen(false)} /> : null}
    </LocationContext.Provider>
  );
}

export function PinMessage({ info, eta }: { info: PinInfo | null; eta: string | null }) {
  if (!info) return null;
  if (!info.ok) {
    return (
      <div className="g-pin-result g-pin-result--bad" role="status">
        {info.reason === "invalid"
          ? "That doesn't look like a 6-digit PIN code."
          : "We can't deliver to this PIN code yet. Call or WhatsApp us — we'll try to sort it out."}
      </div>
    );
  }
  return (
    <div className="g-pin-result" role="status">
      Delivers to {info.place ? `${info.place.city}, ${info.place.state}` : info.zone} by <b>{eta}</b>
      <br />
      <small style={{ fontWeight: 500 }}>Delivery is included in the price. Pay on delivery if you like.</small>
    </div>
  );
}

function PinDialog({ onClose }: { onClose: () => void }) {
  const { pin, info, eta, loading, check } = useLocation();
  const [value, setValue] = useState(pin);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const result = await check(value);
    if (result?.ok) setTimeout(onClose, 1400);
  }

  return (
    <div className="g-dialog-wrap" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="g-dialog" role="dialog" aria-modal="true" aria-labelledby="pin-title">
        <button type="button" className="g-icon-btn g-dialog-close" aria-label="Close" onClick={onClose}>
          <IconClose />
        </button>
        <IconPin width={30} height={30} style={{ color: "var(--g-indigo)" }} />
        <h2 id="pin-title" style={{ marginTop: 10 }}>
          Where should it go?
        </h2>
        <p>Your PIN code gives you a real delivery date. Nothing else — no location tracking.</p>
        <form className="g-pin-form" onSubmit={submit}>
          <label className="g-sr" htmlFor="pin-input">
            PIN code
          </label>
          <input
            ref={input}
            id="pin-input"
            className="g-input"
            inputMode="numeric"
            autoComplete="postal-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="788001"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <button type="submit" className="g-btn" disabled={loading || value.length !== 6} data-busy={loading || undefined}>
            {loading ? "Checking…" : "Check"}
          </button>
        </form>
        <PinMessage info={info} eta={eta} />
        <p style={{ marginTop: 16, fontSize: ".88rem" }}>
          <button type="button" className="g-link" onClick={onClose}>
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
}
