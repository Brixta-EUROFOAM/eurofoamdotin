import { otpEnabled } from "@/lib/gadda-feature-flags";
import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE, createCustomerSession } from "@/lib/customerAuth";
import { OtpFailure,verifyEmailOtp } from "@/lib/gadda-otp";
import { clientIp,forbidden,rateLimit,readJson,sameOrigin,tooMany } from "@/lib/security";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(request:Request){
  if (!otpEnabled()) return NextResponse.json({ error: "OTP verification is currently disabled." }, { status: 503 });

 if(!sameOrigin(request))return forbidden();
 if(!rateLimit(`email-otp-verify:${clientIp(request)}`,35,60*60_000))return tooMany();
 const b=await readJson<{email?:string;code?:string}>(request,2048);
 if(!b)return NextResponse.json({error:"Invalid request."},{status:400});
 try{
  const customer=await verifyEmailOtp(String(b.email||""),String(b.code||""));
  const result=NextResponse.json({ok:true,customer});
  result.cookies.set(CUSTOMER_COOKIE,createCustomerSession(customer),{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*30});
  return result;
 }catch(e){if(e instanceof OtpFailure)return NextResponse.json({error:e.message},{status:e.status});
  console.error("[gadda otp] email verify failed",(e as Error).name);return NextResponse.json({error:"Could not verify email."},{status:503});}
}
