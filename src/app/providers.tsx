"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { WagmiProvider, http } from "wagmi";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { robinhoodChain } from "@/lib/chain";

// RainbowKit + wagmi. injectedWallet shows as "Browser Wallet".
// Mobile wallets need NEXT_PUBLIC_WC_PROJECT_ID (free at cloud.reown.com).
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

// Cinematic dark theme, keyed to Pork's logo pink.
const porkTheme = darkTheme({
  accentColor: "#ec0e7b",
  accentColorForeground: "#0a0a0c",
  borderRadius: "large",
  overlayBlur: "small",
  fontStack: "system",
});

/**
 * WagmiProvider/RainbowKitProvider cannot render during SSR/prerender here:
 * doing so throws "Cannot read properties of undefined (reading 'uid')" and
 * fails Next's static export (it breaks even on pages with no wallet hooks,
 * because the providers live in the root layout). So we mount the whole wallet
 * stack on the client only.
 *
 * `useWalletReady()` is the SINGLE source of truth for "is the wallet context
 * mounted". Every component that calls a wagmi/RainbowKit hook must gate on it,
 * so a consumer never renders before the provider exists (no ordering race:
 * the provider tree and this flag flip in the same render).
 */
const WalletReadyContext = createContext(false);
export function useWalletReady(): boolean {
  return useContext(WalletReadyContext);
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Server + first client render: no wallet providers. Content still renders;
  // wallet-dependent components show their gated fallback via useWalletReady().
  if (!mounted) {
    return <WalletReadyContext.Provider value={false}>{children}</WalletReadyContext.Provider>;
  }

  return (
    <WalletReadyContext.Provider value={true}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={porkTheme} modalSize="compact">
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </WalletReadyContext.Provider>
  );
}
