import path from "path";
import { NextResponse } from "next/server";
import { readMedia } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const types: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif"
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const safe = path.basename(filename);

  try {
    const file = await readMedia(safe);
    if (!file) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(new Uint8Array(file.bytes), {
      headers: {
        "Content-Type": file.mime || types[path.extname(safe).toLowerCase()] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
