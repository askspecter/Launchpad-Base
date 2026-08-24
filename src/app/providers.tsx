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

// Exactly Verbo's wallet set (no Coinbase — its SDK touches @base-org/account /
// @coinbase/cdp-sdk, which next.config stubs to `false`, and that crashes the
// app on mobile Safari). MetaMask / Rainbow / WalletConnect need a real
// WalletConnect projectId (free at cloud.reown.com) via NEXT_PUBLIC_WC_PROJECT_ID.
const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
const wagmiConfig = getDefaultConfig({
  appName: "Pork",
  projectId: wcProjectId || "pork_missing_wc_project_id",
  chains: [robinhoodChain],
  transports: { [robinhoodChain.id]: http() },
  ssr: true,
  // WalletConnect/Rainbow build a WC connector that throws ("uid") during
  // prerender when the projectId is a placeholder, so they're only added when a
  // real projectId is set. On the deployed site (projectId set) the list is the
  // full Verbo set; locally/without it, just injected.
  wallets: wcProjectId
    ? [{ groupName: "Popular", wallets: [metaMaskWallet, injectedWallet, rainbowWallet, walletConnectWallet] }]
    : [{ groupName: "Popular", wallets: [injectedWallet] }],
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
