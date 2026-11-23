import { NextResponse } from "next/server";
import { initiateGaddaNewsletter } from "@/lib/gadda-newsletter-doi";
import { OtpFailure } from "@/lib/gadda-otp";
import { verifyTurnstile } from "@/lib/turnstile";
import { clientIp, forbidden, rateLimit, readJson, sameOrigin, tooMany } from "@/lib/security";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(request:Request){
  if(!sameOrigin(request))return forbidden();
  if(!rateLimit(`sub:${clientIp(request)}`,5,60*60_000))return tooMany();
  const body=await readJson<{email?:string;website?:string;source?:string;optIn?:boolean;turnstileToken?:string}>(request,4096);
  if(!body)return NextResponse.json({error:"Invalid request."},{status:400});
  if(body.website)return NextResponse.json({ok:true});
  if(body.optIn!==true)return NextResponse.json({error:"Newsletter requires an explicit opt-in."},{status:422});
  const challenge=await verifyTurnstile(body.turnstileToken,"lead");
  if(!challenge.ok)return NextResponse.json({error:challenge.error},{status:challenge.status});
  try {return NextResponse.json(await initiateGaddaNewsletter(String(body.email||""),body.source==="sleep_quiz"?"sleep_quiz":"newsletter"));}
  catch(e){if(e instanceof OtpFailure)return NextResponse.json({error:e.message},{status:e.status});
   console.error("[gadda newsletter] DOI failed",(e as Error).name);return NextResponse.json({error:"Could not send confirmation."},{status:503});}
}
