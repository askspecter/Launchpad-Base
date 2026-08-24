import { NextResponse } from "next/server";
import { getAddress, isAddress, type Address } from "viem";
import { canLaunch, launchFee, openLaunchConfigs, usableQuoteAssets } from "@/lib/pons/readerV2";
import { V2_QUOTE_TOKENS } from "@/lib/pons/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v2/launch-options?address=0x...
 * Everything a v2 create flow needs, read live from the factory:
 * open launch configs, usable quote assets, the launch fee, and whether the
 * given address may launch (public launches are whitelist-gated).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  // Candidate ERC-20 quote assets to validate: the owner-provided registry
  // list, plus any extra addresses from env (comma-separated). Native ETH is
  // always included by usableQuoteAssets(). Only assets the factory actually
  // approves are returned, so an un-approved address never reaches the UI.
  const seen = new Set<string>();
  const candidates: { symbol: string; name: string; address: Address }[] = [];
  for (const t of V2_QUOTE_TOKENS) {
    const key = t.address.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push({ symbol: t.symbol, name: t.name, address: getAddress(t.address) });
  }
  for (const raw of (process.env.NEXT_PUBLIC_V2_PAIR_TOKENS ?? "").split(",")) {
    const s = raw.trim();
    if (!isAddress(s) || seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase());
    const short = `${s.slice(0, 6)}…${s.slice(-4)}`;
    candidates.push({ symbol: short, name: short, address: getAddress(s) });
  }

  try {
    const [fee, configs, quoteAssets, gate] = await Promise.all([
      launchFee(),
      openLaunchConfigs(),
      usableQuoteAssets(candidates),
      address && isAddress(address) ? canLaunch(address as Address) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      launchFee: fee.toString(),
      canLaunch: gate,
      configs: configs.map((c) => ({
        id: c.id.toString(),
        supply: c.supply.toString(),
        curveFeeBps: c.curveFeeBps.toString(),
        graduationThreshold: c.graduationThreshold.toString(),
        poolFee: c.poolFee,
        tickSpacing: c.tickSpacing,
      })),
      quoteAssets: quoteAssets.map((q) => ({
        asset: q.asset,
        symbol: q.symbol,
        name: q.name,
        decimals: q.decimals,
        graduationThreshold: q.graduationThreshold.toString(),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to read v2 launch options.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
