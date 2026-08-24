"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { robinhoodChain } from "@/lib/chain";

/**
 * Wallet button — Robinhood Chain only. Built on wagmi's `injected` connectors
 * (no RainbowKit; see src/app/providers.tsx). It lets the user pick an EVM
 * wallet (MetaMask), and the moment a wallet connects it forces the Robinhood
 * Chain network — automatically switching/adding it — so the app never operates
 * on any other network. Also shows the wallet's native balance.
 *
 *  - variant "inline": text-style item for the desktop nav pill.
 *  - variant "solid":  compact pink button for mobile.
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

  const onRobinhood = chainId === robinhoodChain.id;
  const { data: bal } = useBalance({
    address,
    chainId: robinhoodChain.id,
    query: { enabled: Boolean(address) && isConnected },
  });

  // The moment a wallet connects on the wrong network, force Robinhood Chain
  // (prompts the wallet to switch/add it). Runs once per connection.
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

  // Close the picker on outside click / Escape.
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
    // Detect any EVM provider, including the dedicated ones that multi-chain
    // wallets (Bitget/OKX/Trust) expose outside window.ethereum.
    const w = window as unknown as {
      ethereum?: unknown;
      bitkeep?: { ethereum?: unknown };
      bitgetWallet?: { ethereum?: unknown };
      okxwallet?: unknown;
      trustwallet?: unknown;
    };
    const hasProvider =
      typeof window !== "undefined" &&
      !!(w.ethereum || w.bitkeep?.ethereum || w.bitgetWallet?.ethereum || w.okxwallet || w.trustwallet);
    if (!hasProvider) {
      window.alert(
        "No browser wallet detected. Open this site inside your wallet app's browser (e.g. MetaMask), or install the MetaMask extension."
      );
      return;
    }
    // Request Robinhood Chain up front so the wallet switches/adds it during the
    // connect prompt.
    connect({ connector: which === "metaMask" ? metaMask : generic, chainId: robinhoodChain.id });
  }

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
              <span className="text-lg">👛</span>
              <span className="min-w-0">
                <span className="block">Bitget / OKX / Trust…</span>
                <span className="block text-[11px] font-normal text-zinc-400">Other EVM browser wallet</span>
              </span>
            </button>
            <p className="px-3 pb-2 pt-1.5 text-[11px] leading-snug text-zinc-400">
              Connects on the EVM network and switches you to {robinhoodChain.name}. If your wallet
              opens on Solana, pick Ethereum/EVM first.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Connected but not yet on Robinhood Chain — the auto-switch above fires; this
  // button is the manual fallback if the wallet rejected or is still pending.
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

  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Wallet";
  const balText = bal ? `${trim(bal.formatted)} ${bal.symbol}` : "…";
  return (
    <button
      type="button"
      onClick={() => disconnect()}
      title="Disconnect"
      className="inline-flex items-center gap-2 rounded-full bg-zinc-900 py-2 pl-3 pr-3.5 text-sm font-medium text-white transition hover:bg-zinc-800"
    >
      <span className="hidden font-mono text-pink sm:inline">{balText}</span>
      <span className="hidden h-3 w-px bg-white/20 sm:inline" />
      <span className="inline-flex items-center gap-1.5 font-mono">
        <span className="h-2 w-2 rounded-full bg-pink shadow-[0_0_8px_#ec0e7b]" />
        {short}
      </span>
    </button>
  );
}

/** Trim a formatted balance to at most 4 decimals, dropping trailing zeros. */
function trim(v: string): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return v;
  if (n === 0) return "0";
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}
