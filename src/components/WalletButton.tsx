"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

/**
 * Lightweight wallet button built directly on wagmi's `injected` connector
 * (no RainbowKit — see src/app/providers.tsx for why). Connects to an in-page
 * wallet (MetaMask / other extensions, or a wallet app's in-app browser).
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
      // No in-page wallet available (e.g. plain mobile Safari). Point the user
      // to a wallet, rather than failing silently.
      window.alert(
        "No browser wallet detected. Open this site inside your wallet app's browser (e.g. MetaMask), or install a wallet extension."
      );
      return;
    }
    connect({ connector: injected });
  }

  if (!isConnected) {
    return (
      <button className={connectCls} onClick={handleConnect} type="button" disabled={isPending}>
        {isPending ? "Connecting…" : "Connect"}
      </button>
    );
  }

  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Wallet";
  return (
    <button
      type="button"
      onClick={() => disconnect()}
      title="Disconnect"
      className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-2 font-mono text-sm font-medium text-white transition hover:bg-zinc-800"
    >
      <span className="h-2 w-2 rounded-full bg-pink shadow-[0_0_8px_#ec0e7b]" />
      {short}
    </button>
  );
}
