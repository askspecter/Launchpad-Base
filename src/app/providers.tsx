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

// Wallet connect — the exact proven RainbowKit + wagmi v2 setup (see the
// project's WALLET_CONNECT.md). The two things that make this stable:
//   1. next.config.js webpack aliases stub the Coinbase/Base account SDKs that
//      wagmi's connector barrel eagerly imports (the #1 crash cause).
//   2. "@rainbow-me/rainbowkit/styles.css" is imported in layout.tsx before
//      globals, so the connect modal renders styled.
//
// injectedWallet shows as "Browser Wallet". WalletConnect + mobile wallets need
// a project id (free at cloud.reown.com) via NEXT_PUBLIC_WC_PROJECT_ID.
const wagmiConfig = getDefaultConfig({
  appName: "Pork",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "missing_wc_project_id",
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

// Light "Prism" theme to match Pork — pink accent, rounded, subtle overlay.
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
        <RainbowKitProvider theme={porkTheme} modalSize="compact" initialChain={robinhoodChain}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
