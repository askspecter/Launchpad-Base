"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider, http } from "wagmi";
import { RainbowKitProvider, getDefaultConfig, lightTheme } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { robinhoodChain } from "@/lib/chain";

// Wallet connect — the exact working RainbowKit + wagmi v2 setup from Verbo
// (see WALLET_CONNECT.md). RainbowKit's modal gives MetaMask / Browser Wallet /
// Rainbow / WalletConnect. WalletConnect negotiates an EVM-only (eip155) session,
// so multi-chain wallets (Bitget/OKX) connect on Robinhood — never Solana.
//
// Stability depends on TWO things, both in place:
//   1. next.config.js webpack aliases stub the Coinbase/Base account SDKs that
//      wagmi's connector barrel eagerly imports.
//   2. NO viem `overrides` in package.json — WalletConnect keeps its own nested
//      viem (2.23.2). Forcing a single viem broke WalletConnect and crashed the
//      app; matching Verbo's tree (no override) is what keeps it up.
// And "@rainbow-me/rainbowkit/styles.css" is imported in layout.tsx.
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

// Light "Prism" theme to match Pork — pink accent.
const porkTheme = lightTheme({
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
