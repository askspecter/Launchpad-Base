import { createClient, type VercelKV } from "@vercel/kv";

/**
 * KV client that works across the common env namings: Vercel KV
 * (KV_REST_API_URL / KV_REST_API_TOKEN), an Upstash Redis marketplace
 * integration (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN), or a
 * REST_API-suffixed variant. Values are trimmed so a stray space/newline from
 * pasting into the dashboard doesn't silently break detection.
 * Returns null when unconfigured so routes can respond 503 cleanly.
 */
let client: VercelKV | null = null;

function firstEnv(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n]?.trim();
    if (v) return v;
  }
  return undefined;
}

export function getKv(): VercelKV | null {
  if (client) return client;
  const url = firstEnv("KV_REST_API_URL", "UPSTASH_REDIS_REST_URL", "REDIS_REST_API_URL");
  const token = firstEnv("KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_TOKEN", "REDIS_REST_API_TOKEN");
  if (!url || !token) return null;
  client = createClient({ url, token });
  return client;
}
