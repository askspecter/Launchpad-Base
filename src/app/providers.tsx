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
// Exactly Verbo's setup. The "reading 'uid'" crash was caused by duplicate viem
// copies in the tree (a second nested viem made connector uids mismatch); an
// npm override now dedupes viem to a single version, so the plain full wallet
// list is safe. Set NEXT_PUBLIC_WC_PROJECT_ID (free at cloud.reown.com) for
// WalletConnect/mobile.
const wagmiConfig = getDefaultConfig({
  appName: "Pork",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "pork_missing_wc_project_id",
  chains: [robinhoodChain],
  transports: { [robinhoodChain.id]: http() },
  ssr: true,
  wallets: [
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, injectedWallet, rainbowWallet, walletConnectWallet],
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
