import { aiKnowledge } from "@/lib/ai-knowledge";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  return new Response(await aiKnowledge(true), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
