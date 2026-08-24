"use client";

import { useEffect, useState } from "react";

interface Point {
  block: number;
  priceWeth: number;
  priceUsd: number | null;
}

export function PriceChart({ pool, isToken0 }: { pool: string; isToken0: boolean }) {
  const [points, setPoints] = useState<Point[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/token/chart?pool=${pool}&isToken0=${isToken0}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => !cancelled && setPoints(d.points ?? []))
      .catch(() => !cancelled && setPoints([]));
    return () => {
      cancelled = true;
    };
  }, [pool, isToken0]);

  return (
    <section className="card p-5">
      <h2 className="text-sm font-medium text-zinc-700">Price</h2>
      {points === null && <p className="mt-3 text-xs text-zinc-500">Loading chart…</p>}
      {points !== null && points.length < 2 && (
        <p className="mt-3 text-xs text-zinc-500">Not enough trades yet to draw a chart.</p>
      )}
      {points !== null && points.length >= 2 && <Chart points={points} />}
    </section>
  );
}

function Chart({ points }: { points: Point[] }) {
  const useUsd = points.every((p) => p.priceUsd !== null);
  const vals = points.map((p) => (useUsd ? (p.priceUsd as number) : p.priceWeth));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const W = 600;
  const H = 160;
  const pad = 6;

  const d = vals
    .map((v, i) => {
      const x = pad + (i / (vals.length - 1)) * (W - pad * 2);
      const y = pad + (1 - (v - min) / range) * (H - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const first = vals[0];
  const last = vals[vals.length - 1];
  const change = first > 0 ? ((last - first) / first) * 100 : 0;

  return (
    <div>
      <div className="mt-1 flex items-baseline gap-3">
        <span className="text-2xl font-black tracking-tight">
          {useUsd ? `$${fmt(last)}` : `${fmt(last)} WETH`}
        </span>
        <span className="text-sm font-semibold">
          {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" preserveAspectRatio="none">
        <path d={d} fill="none" stroke="#000" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="mt-1 text-[10px] text-zinc-500">{points.length} swaps · from on-chain events</p>
    </div>
  );
}

function fmt(x: number): string {
  if (x >= 1) return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return x.toFixed(12).replace(/0+$/, "").replace(/\.$/, "");
}
