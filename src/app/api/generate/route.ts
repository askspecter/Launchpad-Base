import { NextResponse } from "next/server";
import { generateLaunchPackage } from "@/lib/ai/generate";
import { generateFallbackLogo } from "@/lib/ai/avatar";
import { checkTickerAvailability } from "@/lib/ai/availability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/generate  { idea: string }
 * → full launch package + a logo (data URI) + on-chain availability warning.
 */
export async function POST(req: Request) {
  let idea = "";
  try {
    const body = (await req.json()) as { idea?: string };
    idea = (body.idea ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (idea.length < 3) {
    return NextResponse.json({ error: "Write at least 3 characters for your idea." }, { status: 400 });
  }
  if (idea.length > 500) {
    return NextResponse.json({ error: "Idea is too long (max 500 characters)." }, { status: 400 });
  }

  try {
    const pkg = await generateLaunchPackage(idea);

    // Logo: use configured image provider if present, else deterministic SVG.
    const logo = await generateLogo(pkg.ticker, pkg.description);

    // Availability is a soft warning; run it in parallel-safe fashion.
    const availability = await checkTickerAvailability(pkg.ticker);

    return NextResponse.json({ package: pkg, logo, availability });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to build the launch package.";
    // config / provider issues → 503 (service not ready), otherwise 500.
    const status = /API_KEY|credits|LLM Gateway|not set|rejected the API key/i.test(message)
      ? 503
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

async function generateLogo(ticker: string, description: string): Promise<string> {
  const url = process.env.IMAGE_API_URL;
  const key = process.env.IMAGE_API_KEY;
  if (!url || !key) return generateFallbackLogo(ticker);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        prompt: `Minimal, iconic logo for a crypto token "$${ticker}". ${description}. Flat vector, centered, bold.`,
      }),
    });
    if (!res.ok) return generateFallbackLogo(ticker);
    const data = (await res.json()) as { image?: string; url?: string };
    return data.image || data.url || generateFallbackLogo(ticker);
  } catch {
    return generateFallbackLogo(ticker);
  }
}
