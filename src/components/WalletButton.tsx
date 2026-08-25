"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useAccount, useBalance, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { robinhoodChain, explorerTx } from "@/lib/chain";
import { useCreatorFees } from "@/lib/useCreatorFees";

/**
 * Wallet button, Pons-style. Not connected → a small EVM-wallet picker.
 * Connected → a dropdown showing the address, creator fees ready to claim, copy
 * address, a link to the profile, and disconnect. Forces Robinhood Chain on
 * connect (no RainbowKit — see src/app/providers.tsx).
 */
export function WalletButton({ variant = "solid" }: { variant?: "inline" | "solid" }) {
  const inline = variant === "inline";
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const autoSwitched = useRef(false);
  useEffect(() => setMounted(true), []);

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { eth: feeEth, claim, busy: claiming, txHash: claimTx } = useCreatorFees();
  const [copied, setCopied] = useState(false);

  const onRobinhood = chainId === robinhoodChain.id;
  const { data: bal } = useBalance({
    address,
    chainId: robinhoodChain.id,
    query: { enabled: Boolean(address) && isConnected },
  });

  useEffect(() => {
    if (!isConnected) {
      autoSwitched.current = false;
      return;
    }
    if (!onRobinhood && !autoSwitched.current) {
      autoSwitched.current = true;
      switchChain({ chainId: robinhoodChain.id });
    }
  }, [isConnected, onRobinhood, switchChain]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const connectCls = inline
    ? "rounded-full px-4 py-2 text-sm font-semibold text-pink transition hover:text-zinc-900"
    : "btn-brand !px-4 !py-2";

  if (!mounted) {
    return (
      <div aria-hidden style={{ opacity: 0, pointerEvents: "none" }}>
        <button type="button" className={connectCls}>Connect</button>
      </div>
    );
  }

  const metaMask = connectors[0];
  const generic = connectors[1] ?? connectors[0];

  function pick(which: "metaMask" | "generic") {
    setOpen(false);
    autoSwitched.current = false;
    const hasProvider =
      typeof window !== "undefined" && typeof (window as { ethereum?: unknown }).ethereum !== "undefined";
    if (!hasProvider) {
      window.alert(
        "No browser wallet detected. Open this site inside your wallet app's browser (e.g. MetaMask), or install the MetaMask extension."
      );
      return;
    }
    connect({ connector: which === "metaMask" ? metaMask : generic, chainId: robinhoodChain.id });
  }

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  // ── Not connected: wallet picker ──────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="relative" ref={wrapRef}>
        <button className={connectCls} onClick={() => setOpen((v) => !v)} type="button">
          Connect
        </button>
        {open && (
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-ink-line bg-white/95 p-1.5 shadow-glow backdrop-blur">
            <p className="px-3 pb-1.5 pt-2 text-xs font-semibold text-zinc-400">
              Connect on {robinhoodChain.name}
            </p>
            <button
              type="button"
              onClick={() => pick("metaMask")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-zinc-800 transition hover:bg-black/[0.04]"
            >
              <span className="text-lg">🦊</span> MetaMask
            </button>
            <button
              type="button"
              onClick={() => pick("generic")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-zinc-800 transition hover:bg-black/[0.04]"
            >
              <span className="text-lg">👛</span> Other browser wallet
            </button>
            <p className="px-3 pb-2 pt-1.5 text-[11px] leading-snug text-zinc-400">
              Requires an EVM wallet — you&apos;ll be switched to {robinhoodChain.name}.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Connected, wrong network ──────────────────────────────────────────────
  if (!onRobinhood) {
    return (
      <button
        type="button"
        onClick={() => switchChain({ chainId: robinhoodChain.id })}
        disabled={switching}
        className="rounded-full border border-amber-400/50 bg-amber-400/15 px-3.5 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-400/25"
        title={`Switch to ${robinhoodChain.name}`}
      >
        {switching ? "Switching…" : `Switch to ${robinhoodChain.name}`}
      </button>
    );
  }

  // ── Connected: account dropdown ───────────────────────────────────────────
  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Wallet";
  const balText = bal ? `${trim(bal.formatted)} ${bal.symbol}` : "…";
  const feeText = `${trim(formatEther(feeEth))} ETH`;
  const hasFees = feeEth > 0n;

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full bg-zinc-900 py-2 pl-3 pr-3 text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        <span className="hidden font-mono text-pink sm:inline">{balText}</span>
        <span className="hidden h-3 w-px bg-white/20 sm:inline" />
        <span className="inline-flex items-center gap-1.5 font-mono">
          <span className="h-2 w-2 rounded-full bg-pink shadow-[0_0_8px_#ec0e7b]" />
          {short}
        </span>
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-ink-line bg-white/95 p-2 shadow-glow backdrop-blur">
          {/* Address */}
          <div className="flex items-center gap-2.5 rounded-xl bg-black/[0.03] px-3 py-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></svg>
            </span>
            <span className="font-mono text-sm font-semibold text-zinc-900">{short}</span>
          </div>

          {/* Creator fees ready */}
          <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            Creator fees ready
          </p>
          <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-2">
            <div>
              <div className="font-mono text-sm font-semibold text-zinc-900">{feeText}</div>
              <div className="text-[11px] text-zinc-500">Paid to your wallet</div>
            </div>
            <button
              type="button"
              onClick={() => claim()}
              disabled={!hasFees || claiming}
              className="rounded-full bg-pink px-3.5 py-1.5 text-sm font-semibold text-white transition enabled:hover:bg-pink-deep disabled:opacity-40"
            >
              {claiming ? "Claiming…" : "Claim"}
            </button>
          </div>
          {claimTx && (
            <a href={explorerTx(claimTx)} target="_blank" rel="noreferrer" className="block px-3 pb-1 text-[11px] text-pink">
              ✓ Claim sent — view on explorer
            </a>
          )}

          <div className="my-1.5 h-px bg-ink-line" />

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-zinc-800 transition hover:bg-black/[0.04]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></svg>
            View profile
          </Link>
          <button
            type="button"
            onClick={copyAddress}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-zinc-800 transition hover:bg-black/[0.04]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
            {copied ? "Copied!" : "Copy address"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              disconnect();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-500/10"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></svg>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

/** Trim a formatted amount to at most 4 decimals, dropping trailing zeros. */
function trim(v: string): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return v;
  if (n === 0) return "0";
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}
