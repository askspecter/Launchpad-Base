/**
 * Deterministic fallback logo generator.
 *
 * When no image-gen provider is configured, we still return a real, unique
 * logo so the studio works end-to-end: a gradient coin derived from the
 * ticker. Same ticker → same logo, every time.
 */
export function generateFallbackLogo(ticker: string): string {
  const seed = hash(ticker || "PONS");
  const h1 = seed % 360;
  const h2 = (seed * 7) % 360;
  const initials = ticker.slice(0, 4).toUpperCase() || "PONS";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${h1} 85% 55%)"/>
      <stop offset="1" stop-color="hsl(${h2} 85% 45%)"/>
    </linearGradient>
  </defs>
  <circle cx="128" cy="128" r="120" fill="url(#g)"/>
  <circle cx="128" cy="128" r="120" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="6"/>
  <text x="128" y="128" font-family="ui-sans-serif,system-ui,sans-serif" font-size="${
    initials.length > 3 ? 64 : 84
  }" font-weight="800" fill="#fff" text-anchor="middle" dominant-baseline="central">${escapeXml(
    initials
  )}</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string)
  );
}
