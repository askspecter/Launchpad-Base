"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Pork-styled trigger over RainbowKit's connect modal
 * (MetaMask · Browser Wallet · Rainbow · WalletConnect).
 */
export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div {...(!ready && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none" } })}>
            {!connected ? (
              <button className="btn-brand !px-4 !py-2.5" onClick={openConnectModal}>
                Connect
              </button>
            ) : chain.unsupported ? (
              <button className="btn-ghost" onClick={openChainModal}>
                Wrong network
              </button>
            ) : (
              <button className="btn-ghost font-mono" onClick={openAccountModal}>
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-rose shadow-[0_0_8px_#ff3d7f]" />
                {account.displayName}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
