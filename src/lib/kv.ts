import { createClient, type VercelKV } from "@vercel/kv";

/**
 * KV client that works with either env naming: Vercel KV
 * (KV_REST_API_URL / KV_REST_API_TOKEN) or an Upstash Redis marketplace
 * integration (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).
 * Returns null when unconfigured so routes can respond 503 cleanly.
 */
let client: VercelKV | null = null;

export function getKv(): VercelKV | null {
  if (client) return client;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  client = createClient({ url, token });
  return client;
}
