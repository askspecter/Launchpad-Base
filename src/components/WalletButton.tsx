"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWalletReady } from "@/app/providers";

/**
 * Wallet trigger over RainbowKit's connect modal.
 *  - variant "inline": text-style item that sits inside the desktop nav pill.
 *  - variant "solid":  compact pink button for mobile.
 *
 * Gated on useWalletReady() (the RainbowKit provider is client-only), so it
 * shows a placeholder until mounted, then the real button.
 */
export function WalletButton({ variant = "solid" }: { variant?: "inline" | "solid" }) {
  const ready = useWalletReady();
  const inline = variant === "inline";

  const connectCls = inline
    ? "rounded-full px-4 py-2 text-sm font-semibold text-pink transition hover:text-zinc-900"
    : "btn-brand !px-4 !py-2";

  if (!ready) {
    return (
      <button className={connectCls} aria-hidden disabled>
        Connect
      </button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
        const connected = mounted && account && chain;
        if (!connected) {
          return (
            <button className={connectCls} onClick={openConnectModal}>
              Connect
            </button>
          );
        }
        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="rounded-full border border-red-400/40 bg-red-500/10 px-3.5 py-2 text-sm font-semibold text-red-600"
            >
              Wrong network
            </button>
          );
        }
        return (
          <button
            onClick={openAccountModal}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-2 font-mono text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <span className="h-2 w-2 rounded-full bg-pink shadow-[0_0_8px_#ec0e7b]" />
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
