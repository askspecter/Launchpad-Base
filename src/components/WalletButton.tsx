"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Wallet button — opens RainbowKit's polished connect modal (MetaMask ·
 * Browser Wallet · Rainbow · WalletConnect), exactly like Verbo. Styled to
 * Pork via ConnectButton.Custom.
 *
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
          <div
            {...(!ready && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none" } })}
          >
            {!connected ? (
              <button type="button" className={connectCls} onClick={openConnectModal}>
                Connect
              </button>
            ) : chain.unsupported ? (
              <button
                type="button"
                onClick={openChainModal}
                className="rounded-full border border-amber-400/50 bg-amber-400/15 px-3.5 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-400/25"
              >
                Switch to Robinhood
              </button>
            ) : (
              <button
                type="button"
                onClick={openAccountModal}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900 py-2 pl-3 pr-3.5 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                {account.displayBalance && (
                  <>
                    <span className="hidden font-mono text-pink sm:inline">
                      {account.displayBalance}
                    </span>
                    <span className="hidden h-3 w-px bg-white/20 sm:inline" />
                  </>
                )}
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <span className="h-2 w-2 rounded-full bg-pink shadow-[0_0_8px_#ec0e7b]" />
                  {account.displayName}
                </span>
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
