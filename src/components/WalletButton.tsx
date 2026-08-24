"use client";

import { useEffect, useState } from "react";
import { useAccount, useBalance, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { robinhoodChain } from "@/lib/chain";

/**
 * Lightweight wallet button built directly on wagmi's `injected` connector
 * (no RainbowKit — see src/app/providers.tsx for why). Connects to an in-page
 * wallet (MetaMask / other extensions, or a wallet app's in-app browser),
 * forces the Robinhood Chain network, and shows the wallet's native balance.
 *
 *  - variant "inline": text-style item for the desktop nav pill.
 *  - variant "solid":  compact pink button for mobile.
 */
export function WalletButton({ variant = "solid" }: { variant?: "inline" | "solid" }) {
  const inline = variant === "inline";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();

  const onRobinhood = chainId === robinhoodChain.id;
  const { data: bal } = useBalance({
    address,
    chainId: robinhoodChain.id,
    query: { enabled: Boolean(address) && isConnected },
  });

  const connectCls = inline
    ? "rounded-full px-4 py-2 text-sm font-semibold text-pink transition hover:text-zinc-900"
    : "btn-brand !px-4 !py-2";

  // Avoid a hydration flash: render an inert placeholder until mounted.
  if (!mounted) {
    return (
      <div aria-hidden style={{ opacity: 0, pointerEvents: "none" }}>
        <button type="button" className={connectCls}>Connect</button>
      </div>
    );
  }

  function handleConnect() {
    const injected = connectors[0];
    const hasProvider =
      typeof window !== "undefined" && typeof (window as { ethereum?: unknown }).ethereum !== "undefined";
    if (!injected || !hasProvider) {
      window.alert(
        "No browser wallet detected. Open this site inside your wallet app's browser (e.g. MetaMask), or install a wallet extension."
      );
      return;
    }
    // Request the Robinhood Chain up front so the wallet switches/adds it on
    // connect instead of landing on whatever network (or Solana) it was on.
    connect({ connector: injected, chainId: robinhoodChain.id });
  }

  if (!isConnected) {
    return (
      <button className={connectCls} onClick={handleConnect} type="button" disabled={isPending}>
        {isPending ? "Connecting…" : "Connect"}
      </button>
    );
  }

  // Connected but on the wrong network (e.g. wallet defaulted to Solana / mainnet).
  if (!onRobinhood) {
    return (
      <button
        type="button"
        onClick={() => switchChain({ chainId: robinhoodChain.id })}
        disabled={switching}
        className="rounded-full border border-amber-400/50 bg-amber-400/15 px-3.5 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-400/25"
        title={`Switch to ${robinhoodChain.name}`}
      >
        {switching ? "Switching…" : "Switch network"}
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
