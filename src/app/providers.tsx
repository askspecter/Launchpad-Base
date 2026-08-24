"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider, http, createStorage, noopStorage } from "wagmi";
import { getDefaultConfig, RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import "@rainbow-me/rainbowkit/styles.css";
import { robinhoodChain } from "@/lib/chain";

// ─────────────────────────────────────────────────────────────────────────────
// Wallet connect (RainbowKit), rebuilt with hardening against the mobile-Safari
// "undefined is not an object (evaluating 'e.uid')" crash that took the site
// down before:
//
//  • multiInjectedProviderDiscovery is OFF. wagmi's EIP-6963 auto-discovery
//    dynamically creates connectors on mount; a malformed provider announcement
//    was a prime suspect for the undefined-connector/uid crash. We target
//    window.ethereum directly via injectedWallet instead.
//  • WalletConnect (and the wallets that tunnel through it — MetaMask mobile,
//    Rainbow) is only included when a REAL projectId is set
//    (NEXT_PUBLIC_WC_PROJECT_ID, free at cloud.reown.com). With a placeholder,
//    WalletConnect/@reown-appkit — the heaviest, most Safari-fragile part of the
//    stack — is never initialized. Without a projectId we ship injected-only,
//    which still gives browser-extension and in-app-wallet-browser connects and
//    cannot crash on plain mobile Safari.
//  • Fresh, versioned storage key so no stale connector state is ever rehydrated.
//  • global-error.tsx still self-heals (clears wallet storage + reloads once) as
//    a last-resort net.
//
// To enable WalletConnect / mobile wallets, set NEXT_PUBLIC_WC_PROJECT_ID.
// ─────────────────────────────────────────────────────────────────────────────
const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID?.trim();

const wagmiConfig = getDefaultConfig({
  appName: "Pork",
  // getDefaultConfig requires a non-empty string. When no real id is set this
  // placeholder is never used, because no WalletConnect-backed wallet is listed.
  projectId: wcProjectId || "pork_missing_wc_project_id",
  chains: [robinhoodChain],
  transports: { [robinhoodChain.id]: http() },
  ssr: true,
  multiInjectedProviderDiscovery: false,
  storage: createStorage({
    key: "pork.wagmi.v3",
    storage: typeof window !== "undefined" ? window.localStorage : noopStorage,
  }),
  wallets: [
    {
      groupName: "Popular",
      wallets: wcProjectId
        ? [injectedWallet, metaMaskWallet, rainbowWallet, walletConnectWallet]
        : [injectedWallet],
    },
  ],
});

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
