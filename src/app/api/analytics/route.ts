import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { getKv } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const KEY = "pork:launches";
const DAYS = 30;

interface LaunchRecord {
  token: string;
  version: "v1" | "v2";
  deployer: string;
  createdAt: number;
}

/**
 * GET /api/analytics
 * Real Pork metrics derived from launches recorded in KV. Volume / revenue /
 * trades need an onchain data provider (e.g. Dune) and are returned as null so
 * the UI can show "—" instead of a fabricated number.
 */
export async function GET() {
  const kv = getKv();
  const now = Date.now();
  const dayMs = 86_400_000;

  let all: LaunchRecord[] = [];
  if (kv) {
    const raw = (await kv.lrange<LaunchRecord | string>(KEY, 0, 999).catch(() => [])) ?? [];
    all = raw
      .map((r) => (typeof r === "string" ? safeParse(r) : r))
      .filter((r): r is LaunchRecord => !!r && isAddress(r.token));
  }

  // Daily launches histogram for the last DAYS days (oldest → newest).
  const buckets = new Array(DAYS).fill(0) as number[];
  const startOfToday = Math.floor(now / dayMs) * dayMs;
  for (const r of all) {
    const idx = DAYS - 1 - Math.floor((startOfToday - Math.floor((r.createdAt ?? 0) / dayMs) * dayMs) / dayMs);
    if (idx >= 0 && idx < DAYS) buckets[idx] += 1;
  }
  const series = buckets.map((count, i) => ({
    ts: startOfToday - (DAYS - 1 - i) * dayMs,
    count,
  }));

  const launches24h = all.filter((r) => now - (r.createdAt ?? 0) < dayMs).length;
  const uniqueDevs = new Set(all.map((r) => r.deployer?.toLowerCase()).filter(Boolean)).size;
  const uniqueDevs24h = new Set(
    all.filter((r) => now - (r.createdAt ?? 0) < dayMs).map((r) => r.deployer?.toLowerCase()).filter(Boolean)
  ).size;

  return NextResponse.json({
    configured: !!kv,
    updatedAt: now,
    allTime: {
      launches: all.length,
      uniqueDevs,
      // Not tracked without an onchain data provider:
      volumeUsd: null,
      tradesCount: null,
      protocolRevenueUsd: null,
      creatorEarningsUsd: null,
    },
    day: {
      launches: launches24h,
      uniqueDevs: uniqueDevs24h,
      volumeUsd: null,
      tradesCount: null,
      protocolRevenueUsd: null,
      creatorEarningsUsd: null,
    },
    series,
  });
}

function safeParse(s: string): LaunchRecord | null {
  try {
    return JSON.parse(s) as LaunchRecord;
  } catch {
    return null;
  }
}
