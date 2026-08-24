import { generateFallbackLogo } from "./avatar";

/**
 * Real AI image generation for token art.
 *
 * Two styles:
 *  - "icon"  → a clean, iconic token logo.
 *  - "photo" → a photorealistic, cinematic promo image.
 *
 * Provider is an OpenAI-compatible images endpoint set via IMAGE_API_URL +
 * IMAGE_API_KEY (e.g. an images/generations route). We accept several response
 * shapes ({ data:[{b64_json|url}] } or { image|url }). If no provider is
 * configured, the "icon" style falls back to a deterministic SVG so the studio
 * still works end-to-end; "photo" has no offline substitute and also falls
 * back to the SVG mark.
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
  const url = process.env.IMAGE_API_URL;
  const key = process.env.IMAGE_API_KEY;
  if (!url || !key) return generateFallbackLogo(ticker);

  const prompt = buildImagePrompt(style, ticker, description);
  const model = process.env.IMAGE_MODEL || "gpt-image-1";
  const size = process.env.IMAGE_SIZE || (style === "photo" ? "1024x1024" : "512x512");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
        // Some gateways key off X-API-Key instead of Authorization.
        "x-api-key": key,
      },
      body: JSON.stringify({ model, prompt, size, n: 1, response_format: "b64_json" }),
    });
    if (!res.ok) return generateFallbackLogo(ticker);

    const data = (await res.json()) as {
      data?: Array<{ b64_json?: string; url?: string }>;
      image?: string;
      url?: string;
    };

    const b64 = data.data?.[0]?.b64_json;
    if (b64) return `data:image/png;base64,${b64}`;
    const hosted = data.data?.[0]?.url || data.url;
    if (hosted) return hosted;
    if (data.image) return data.image; // may already be a data URI

    return generateFallbackLogo(ticker);
  } catch {
    return generateFallbackLogo(ticker);
  }
}
