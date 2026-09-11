import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { appendTelemetry } from "@/lib/telemetry";
import {
  CUSTOMER_COOKIE,
  customerFromSession
} from "@/lib/customerAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowed = new Set([
  "page_view",
  "product_view",
  "scroll_depth",
  "page_engagement",
  "add_to_cart",
  "remove_from_cart",
  "cart_quantity",
  "checkout_start",
  "order_created"
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!allowed.has(String(body.type || ""))) {
      return NextResponse.json(
        { error: "Unsupported event." },
        { status: 400 }
      );
    }

    const jar = await cookies();

    const customer = await customerFromSession(
      jar.get(CUSTOMER_COOKIE)?.value
    );

    await appendTelemetry({
      ...body,
      customerId: customer?.id
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
