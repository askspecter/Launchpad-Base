"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Pork-styled trigger over RainbowKit's connect modal
 * (MetaMask · Browser Wallet · Rainbow · WalletConnect).
 *
 * RainbowKit's <ConnectButton> must not render during SSR/prerender: doing so
 * crashes Next's static export with "Cannot read properties of undefined
 * (reading 'uid')". We render a static placeholder on the server and mount the
 * real button only on the client, after hydration. wagmi core hooks elsewhere
 * still work server-side via WagmiProvider (ssr: true).
 */
export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Same footprint as the connected/disconnected button, non-interactive.
    return (
      <button className="btn-brand !px-4 !py-2.5" aria-hidden disabled>
        Connect
      </button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted: rkMounted }) => {
        const ready = rkMounted;
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
