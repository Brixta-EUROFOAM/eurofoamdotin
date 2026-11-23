import { otpEnabled } from "@/lib/gadda-feature-flags";
import { NextResponse } from "next/server";
import { startEmailOtp, OtpFailure } from "@/lib/gadda-otp";
import { clientIp, forbidden, rateLimit, readJson, sameOrigin, tooMany } from "@/lib/security";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(request:Request){
  if (!otpEnabled()) return NextResponse.json({ error: "OTP verification is currently disabled." }, { status: 503 });

  if(!sameOrigin(request))return forbidden();
  if(!rateLimit(`email-otp-start:${clientIp(request)}`,12,60*60_000))return tooMany();
  const b=await readJson<{email?:string;name?:string}>(request,2048);
  if(!b)return NextResponse.json({error:"Invalid request."},{status:400});
  try{return NextResponse.json(await startEmailOtp(String(b.email||""),String(b.name||"")));}
  catch(e){if(e instanceof OtpFailure)return NextResponse.json({error:e.message},{status:e.status});
    console.error("[gadda otp] email start failed",(e as Error).name);return NextResponse.json({error:"Could not request email code."},{status:503});}
}
