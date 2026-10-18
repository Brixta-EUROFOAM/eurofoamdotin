import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { saveMedia } from "@/lib/leads";

export const runtime = "nodejs";

const MAX_UPLOAD = 12 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif"
]);

const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif"
};

/* Trust the file's bytes, not the browser's label. */
function sniff(bytes: Buffer): string | null {
  const hex = bytes.subarray(0, 12).toString("hex");
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e470d0a1a0a")) return "image/png";
  if (hex.startsWith("47494638")) return "image/gif";
  if (hex.startsWith("52494646") && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (bytes.subarray(4, 12).toString("ascii").startsWith("ftypavi")) return "image/avif";
  return null;
}

function filenameFor(name: string, type: string) {
  const ext = EXT[type] || ".bin";
  const stem = path
    .basename(name, path.extname(name))
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  return `${Date.now()}-${stem || "image"}${ext}`;
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file supplied" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD) {
    return NextResponse.json({ error: "Image exceeds 12 MB" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const real = sniff(bytes);
  if (!real) {
    return NextResponse.json({ error: "That file isn't a real image" }, { status: 400 });
  }

  const safe = filenameFor(file.name, real);
  await saveMedia(safe, real, bytes);

  return NextResponse.json({ url: `/media/${safe}` });
}
