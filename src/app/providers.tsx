"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider, http } from "wagmi";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { robinhoodChain } from "@/lib/chain";

// Wallet set. No Coinbase — its SDK touches @base-org/account / @coinbase/cdp-sdk,
// which next.config stubs to `false`, and that crashes the app on mobile Safari.
//
// IMPORTANT: MetaMask / Rainbow / WalletConnect all connect through WalletConnect
// under the hood, which *requires a real projectId* (free at cloud.reown.com).
// Feeding them a placeholder made wagmi's reconnect-on-mount initialize the
// WalletConnect connector with an invalid id, and that throws at the root of the
// React tree — blanking the ENTIRE site with "Application error: a client-side
// exception has occurred" on every page, including the home page.
//
// So the WalletConnect-backed wallets are only offered when a real projectId is
// configured (NEXT_PUBLIC_WC_PROJECT_ID). Without one we fall back to the plain
// injected (browser-extension) connector, which needs no projectId — matching
// what .env.example documents ("injected/browser wallets still work" without a
// projectId). viem is deduped to a single version via package.json overrides, so
// the old "reading 'uid'" crash stays fixed regardless of the wallet list.
const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID?.trim();

const wagmiConfig = getDefaultConfig({
  appName: "Pork",
  // getDefaultConfig requires a non-empty string. When no real id is set, this
  // placeholder is never used to init WalletConnect because the WC-backed
  // wallets below are omitted.
  projectId: wcProjectId || "pork_missing_wc_project_id",
  chains: [robinhoodChain],
  transports: { [robinhoodChain.id]: http() },
  ssr: true,
  wallets: [
    {
      groupName: "Popular",
      wallets: wcProjectId
        ? [metaMaskWallet, injectedWallet, rainbowWallet, walletConnectWallet]
        : [injectedWallet],
    },
  ],
});

const porkTheme = darkTheme({
  accentColor: "#ec0e7b",
  accentColorForeground: "#ffffff",
  borderRadius: "large",
  overlayBlur: "small",
  fontStack: "system",
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={porkTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
