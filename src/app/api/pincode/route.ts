import { NextResponse } from "next/server";
import { checkPin } from "@/lib/delivery";
import { clientIp, rateLimit, tooMany } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  GET /api/pincode?pin=788001
  → serviceability + delivery window from our own zone table, plus the
    post-office city/state from India Post's public lookup (cached; if
    that service is down we still answer from the zone table).
  The browser never talks to the third party directly.
*/

type Place = { city: string; district: string; state: string };
const cache = new Map<string, { place: Place | null; at: number }>();
const TTL = 1000 * 60 * 60 * 24 * 7;

async function lookupPlace(pin: string): Promise<Place | null> {
  const hit = cache.get(pin);
  if (hit && Date.now() - hit.at < TTL) return hit.place;
  let place: Place | null = null;
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      signal: AbortSignal.timeout(2500),
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        Status?: string;
        PostOffice?: { Name?: string; District?: string; State?: string; Block?: string }[];
      }[];
      const office = data?.[0]?.Status === "Success" ? data[0].PostOffice?.[0] : undefined;
      if (office?.District && office.State) {
        place = {
          city: String(office.Block && office.Block !== "NA" ? office.Block : office.District).slice(0, 60),
          district: String(office.District).slice(0, 60),
          state: String(office.State).slice(0, 60),
        };
      }
    }
  } catch {
    /* fall through with null — zone table still answers */
  }
  if (cache.size > 5000) cache.clear();
  cache.set(pin, { place, at: Date.now() });
  return place;
}

export async function GET(request: Request) {
  if (!rateLimit(`pin:${clientIp(request)}`, 40, 60_000)) return tooMany();
  const pin = new URL(request.url).searchParams.get("pin") || "";
  const result = checkPin(pin);
  if (!result.ok) {
    return NextResponse.json({ ok: false, pin: result.pin, reason: result.reason });
  }
  const place = await lookupPlace(result.pin);
  return NextResponse.json(
    {
      ok: true,
      pin: result.pin,
      zone: result.zone.label,
      minDays: result.minDays,
      maxDays: result.maxDays,
      place,
    },
    { headers: { "Cache-Control": "private, max-age=3600" } }
  );
}
