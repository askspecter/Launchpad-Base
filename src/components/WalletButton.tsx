"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWalletReady } from "@/app/providers";

/**
 * Pork-styled trigger over RainbowKit's connect modal
 * (MetaMask · Browser Wallet · Rainbow · WalletConnect).
 *
 * Gated on useWalletReady(): the RainbowKit provider is client-only, so we show
 * a static placeholder until it is mounted, then render the real button. Using
 * the shared flag (not a local one) guarantees ConnectButton never renders
 * before RainbowKitProvider exists.
 */
export function WalletButton() {
  const ready = useWalletReady();

  if (!ready) {
    return (
      <button className="btn-brand !px-4 !py-2.5" aria-hidden disabled>
        Connect
      </button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
        const rkReady = mounted;
        const connected = rkReady && account && chain;

        return (
          <div {...(!rkReady && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none" } })}>
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
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-pink shadow-[0_0_8px_#ec0e7b]" />
                {account.displayName}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
