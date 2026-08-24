import { NextResponse } from "next/server";
import { getKv } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/upload  { dataUrl: "data:image/...;base64,..." }
 * Stores a (client-downscaled) image in KV and returns a stable path that
 * serves it. The token's on-chain `logo` points at this URL, so it shows in
 * the feed and everywhere else.
 */
export async function POST(req: Request) {
  const kv = getKv();
  if (!kv) {
    return NextResponse.json(
      { error: "Image storage not configured (set KV_REST_API_URL / KV_REST_API_TOKEN)." },
      { status: 503 }
    );
  }

  let dataUrl = "";
  try {
    const body = (await req.json()) as { dataUrl?: string };
    dataUrl = body.dataUrl ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(dataUrl);
  if (!m) {
    return NextResponse.json({ error: "Expected a base64 image data URL." }, { status: 400 });
  }
  // Keep well under Upstash's ~1MB REST request cap (the base64 string is larger
  // than the decoded bytes; the client already compresses to fit).
  if (dataUrl.length > 950_000) {
    return NextResponse.json(
      { error: "Image too large after compression — try a smaller or simpler image." },
      { status: 413 }
    );
  }

  const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/-/g, "");
  try {
    await kv.set(`img:${id}`, dataUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Storage write failed.";
    return NextResponse.json(
      { error: `Could not save the image to storage: ${message}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ id, path: `/api/img/${id}` });
}
