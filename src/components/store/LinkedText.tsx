import Link from "next/link";
import type { ReactNode } from "react";

/*
  Turns "Take the [60-second quiz](/sleep-quiz)" into text with a real link.
  Only site paths (/...), https://, tel:, mailto: and wa.me links are allowed.
*/
const LINK = /\[([^\]]{1,80})\]\(([^)\s]{1,300})\)/g;

export function safeHref(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (/^(https:\/\/|tel:|mailto:)/i.test(href)) return href;
  return null;
}

export default function LinkedText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const href = safeHref(m[2]);
    out.push(text.slice(last, m.index));
    if (!href) out.push(m[1]);
    else if (href.startsWith("/"))
      out.push(
        <Link key={m.index} href={href} className="g-link">
          {m[1]}
        </Link>
      );
    else
      out.push(
        <a key={m.index} href={href} className="g-link" target="_blank" rel="noopener noreferrer">
          {m[1]}
        </a>
      );
    last = (m.index || 0) + m[0].length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
}
