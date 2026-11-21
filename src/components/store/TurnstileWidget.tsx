"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileAPI = {
  render: (container: HTMLElement, options: {
    sitekey: string; action: string; theme: "auto";
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
  }) => string;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: TurnstileAPI } }

/** The widget is optional until TURNSTILE_ENFORCE=true is set on the server. */
export default function TurnstileWidget({ action, onToken }: {
  action: "order" | "lead"; onToken: (token: string) => void;
}) {
  const [config, setConfig] = useState<{ siteKey: string; enforced: boolean } | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [broken, setBroken] = useState(false);
  const target = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  useEffect(() => { callback.current = onToken; }, [onToken]);

  useEffect(() => {
    let active = true;
    fetch("/api/turnstile/config", { cache: "no-store" })
      .then(async r => { if (!r.ok) throw Error("Configuration unavailable"); return await r.json(); })
      .then(x => { if (active) setConfig({ siteKey: typeof x.siteKey === "string" ? x.siteKey : "", enforced: x.enforced === true }); })
      .catch(() => { if (active) setBroken(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!scriptReady || !config?.siteKey || !target.current || !window.turnstile) return;
    const id = window.turnstile.render(target.current, {
      sitekey: config.siteKey, action, theme: "auto",
      callback: token => callback.current(token),
      "expired-callback": () => callback.current(""),
      "error-callback": () => callback.current(""),
    });
    return () => { callback.current(""); window.turnstile?.remove(id); };
  }, [scriptReady, config?.siteKey, action]);

  if (broken) return <small role="status">If verification is required and unavailable, please refresh this page.</small>;
  if (!config?.siteKey) {
    return config?.enforced ? <small role="alert">Security setup is incomplete. Please contact GADDA.</small> : null;
  }
  return <>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      strategy="afterInteractive" onReady={() => setScriptReady(true)} onError={() => setBroken(true)} />
    <div ref={target} aria-label="Security verification" />
    {config.enforced && <small>Security verification is required before submitting.</small>}
  </>;
}
