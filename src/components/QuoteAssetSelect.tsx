"use client";

import { useEffect, useRef, useState } from "react";

export interface QuoteAsset {
  asset: string;
  symbol: string;
  name: string;
}

/**
 * "Paired asset" picker — dark glass dropdown showing ticker + full name.
 * A square badge stands in for a token logo (we don't host per-asset art).
 */
export function QuoteAssetSelect({
  assets,
  value,
  onChange,
}: {
  assets: QuoteAsset[];
  value: string;
  onChange: (asset: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = assets.find((a) => a.asset.toLowerCase() === value.toLowerCase()) ?? assets[0];

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl border border-ink-line bg-black/40 px-3 py-2.5 text-left transition hover:border-white/25"
      >
        {selected && <Badge symbol={selected.symbol} />}
        <span className="font-bold text-white">{selected?.symbol}</span>
        <span className="truncate text-xs text-zinc-500">{selected?.name}</span>
        <span className="ml-auto text-xs text-zinc-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="thin-scroll absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-ink-line bg-ink-800/95 p-1 shadow-card backdrop-blur-xl">
          {assets.map((a) => {
            const active = a.asset.toLowerCase() === value.toLowerCase();
            return (
              <button
                type="button"
                key={a.asset}
                onClick={() => {
                  onChange(a.asset);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                  active ? "bg-rose/15 text-white" : "text-zinc-300 hover:bg-white/[0.06]"
                }`}
              >
                <Badge symbol={a.symbol} />
                <span className="font-bold">{a.symbol}</span>
                <span className="ml-auto truncate text-xs text-zinc-500">{a.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Badge({ symbol }: { symbol: string }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-ink-line bg-white/[0.04] text-[9px] font-black text-zinc-300">
      {symbol.slice(0, 2)}
    </span>
  );
}
