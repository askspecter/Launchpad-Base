import { generateFallbackLogo } from "./avatar";

/**
 * AI token art through the **Bankr LLM Gateway** (same key/base as text
 * generation — Bankr routes across many models). Two styles:
 *  - "icon"  → a clean, iconic token logo.
 *  - "photo" → a photorealistic, cinematic promo image.
 *
 * Order of providers:
 *  1. Bankr LLM Gateway (BANKR_API_KEY, OpenAI-compatible /v1/images/generations)
 *  2. A generic OpenAI-compatible endpoint (IMAGE_API_URL + IMAGE_API_KEY), if set
 *  3. Deterministic SVG fallback so the studio always works.
 */

export type ImageStyle = "icon" | "photo";

export function buildImagePrompt(style: ImageStyle, ticker: string, description: string): string {
  const subject = description?.trim() || `a crypto token called $${ticker}`;
  if (style === "photo") {
    return (
      `Photorealistic, cinematic promotional key art for a crypto token "$${ticker}". ` +
      `${subject}. Dramatic studio lighting, rich depth of field, hyper-detailed, 4k, ` +
      `vibrant magenta-pink accent lighting, premium and bold. No text, no watermark, no logo.`
    );
  }
  return (
    `Minimal, iconic app-style logo for a crypto token "$${ticker}". ${subject}. ` +
    `Flat vector, bold, centered, high contrast, clean solid background, ` +
    `magenta-pink and black palette. No text, no letters, no watermark.`
  );
}

/** Generate token art. Returns a data URI or an absolute image URL. */
export async function generateTokenImage(
  ticker: string,
  description: string,
  style: ImageStyle = "icon"
): Promise<string> {
  const prompt = buildImagePrompt(style, ticker, description);
  const size = process.env.IMAGE_SIZE || (style === "photo" ? "1024x1024" : "512x512");

  // 1) Bankr LLM Gateway (preferred — one key for text + image + more).
  const bankrKey = process.env.BANKR_API_KEY;
  if (bankrKey) {
    const base = process.env.BANKR_BASE_URL || "https://llm.bankr.bot";
    const model = process.env.BANKR_IMAGE_MODEL || process.env.IMAGE_MODEL || "gpt-image-1";
    const img = await callImages(`${base}/v1/images/generations`, bankrKey, model, prompt, size);
    if (img) return img;
  }

  // 2) Generic OpenAI-compatible image endpoint (optional override).
  const url = process.env.IMAGE_API_URL;
  const key = process.env.IMAGE_API_KEY;
  if (url && key) {
    const model = process.env.IMAGE_MODEL || "gpt-image-1";
    const img = await callImages(url, key, model, prompt, size);
    if (img) return img;
  }

  // 3) Fallback: deterministic SVG mark.
  return generateFallbackLogo(ticker);
}

/** POST an OpenAI-compatible images request; tolerate several response shapes. */
async function callImages(
  endpoint: string,
  key: string,
  model: string,
  prompt: string,
  size: string
): Promise<string | null> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // Bankr keys off X-API-Key; other gateways use Authorization. Send both.
        "x-api-key": key,
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ model, prompt, size, n: 1, response_format: "b64_json" }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      data?: Array<{ b64_json?: string; url?: string }>;
      image?: string;
      url?: string;
    };
    const b64 = data.data?.[0]?.b64_json;
    if (b64) return `data:image/png;base64,${b64}`;
    return data.data?.[0]?.url || data.url || data.image || null;
  } catch {
    return null;
  }
}
