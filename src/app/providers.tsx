"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider, createConfig, http, createStorage, noopStorage } from "wagmi";
import { injected } from "wagmi/connectors";
import { robinhoodChain } from "@/lib/chain";

// ─────────────────────────────────────────────────────────────────────────────
// Wallet connect — RainbowKit-FREE (injected only).
//
// RainbowKit + WalletConnect repeatedly crashed the whole site on mobile Safari
// ("undefined is not an object (evaluating 'e.uid')"). The configuration proven
// stable on the user's device is a bare wagmi setup on the lightweight injected
// connector, driven by a custom wallet button (components/WalletButton.tsx):
//   [0] MetaMask, targeted directly (EVM, supports adding Robinhood Chain)
//   [1] any generic injected wallet (fallback)
// MIPD auto-discovery is off; a versioned storage key avoids rehydrating stale
// connector state. The app is Robinhood-Chain-only; the wallet button forces
// that network on connect and auto-connects inside a wallet's in-app browser.
// ─────────────────────────────────────────────────────────────────────────────
const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  transports: { [robinhoodChain.id]: http() },
  connectors: [
    injected({ target: "metaMask", shimDisconnect: true }),
    injected({ shimDisconnect: true }),
  ],
  multiInjectedProviderDiscovery: false,
  ssr: true,
  storage: createStorage({
    key: "pork.wagmi.v3",
    storage: typeof window !== "undefined" ? window.localStorage : noopStorage,
  }),
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
