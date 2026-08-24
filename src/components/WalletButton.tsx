"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Wallet trigger over RainbowKit's connect modal (same pattern as Verbo — no
 * local mount gate; RainbowKit's own `mounted` handles readiness).
 *  - variant "inline": text-style item for the desktop nav pill.
 *  - variant "solid":  compact pink button for mobile.
 */
export function WalletButton({ variant = "solid" }: { variant?: "inline" | "solid" }) {
  const inline = variant === "inline";
  const connectCls = inline
    ? "rounded-full px-4 py-2 text-sm font-semibold text-pink transition hover:text-zinc-900"
    : "btn-brand !px-4 !py-2";

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        return (
          <div {...(!ready && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none" } })}>
            {!connected ? (
              <button className={connectCls} onClick={openConnectModal} type="button">
                Connect
              </button>
            ) : chain.unsupported ? (
              <button
                type="button"
                onClick={openChainModal}
                className="rounded-full border border-red-400/40 bg-red-500/10 px-3.5 py-2 text-sm font-semibold text-red-600"
              >
                Wrong network
              </button>
            ) : (
              <button
                type="button"
                onClick={openAccountModal}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-2 font-mono text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                <span className="h-2 w-2 rounded-full bg-pink shadow-[0_0_8px_#ec0e7b]" />
                {account.displayName}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
