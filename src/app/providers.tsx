"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { WagmiProvider, http } from "wagmi";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { robinhoodChain } from "@/lib/chain";
import { WalletErrorBoundary } from "@/components/WalletErrorBoundary";

// Coinbase + injected/MetaMask work without a WalletConnect projectId (Coinbase
// also gives mobile users a working option). WalletConnect / Rainbow need a real
// projectId (free at cloud.reown.com); we only add them when one is set so a
// missing/placeholder id can't break the wallet stack.
const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
const wallets = wcProjectId
  ? [
      {
        groupName: "Popular",
        wallets: [metaMaskWallet, coinbaseWallet, injectedWallet, rainbowWallet, walletConnectWallet],
      },
    ]
  : [{ groupName: "Popular", wallets: [metaMaskWallet, coinbaseWallet, injectedWallet] }];

const wagmiConfig = getDefaultConfig({
  appName: "Pork",
  // getDefaultConfig requires a string; the WC-based wallets above are only
  // included when a real id exists, so this placeholder is never used to init WC.
  projectId: wcProjectId || "pork_no_walletconnect",
  chains: [robinhoodChain],
  transports: { [robinhoodChain.id]: http() },
  ssr: true,
  wallets,
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
  const withoutWallet = (
    <WalletReadyContext.Provider value={false}>{children}</WalletReadyContext.Provider>
  );
  if (!mounted) return withoutWallet;

  // Client: mount the wallet stack, but if it throws, degrade gracefully to the
  // no-wallet tree instead of blanking the page.
  return (
    <WalletErrorBoundary fallback={withoutWallet}>
      <WalletReadyContext.Provider value={true}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={porkTheme} modalSize="compact">
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </WalletReadyContext.Provider>
    </WalletErrorBoundary>
  );
}
