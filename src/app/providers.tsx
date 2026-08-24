"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider, createConfig, http, createStorage, noopStorage } from "wagmi";
import { robinhoodChain } from "@/lib/chain";

// ─────────────────────────────────────────────────────────────────────────────
// Wallet connect is temporarily REMOVED.
//
// RainbowKit + WalletConnect were crashing the whole site on mobile Safari with
// "undefined is not an object (evaluating 'e.uid')" — a connector/uid failure in
// the wallet stack that we could not stabilize (see git history). To get the site
// reliably back up, all wallet-connection code (RainbowKit provider + modal, the
// WalletConnect/MetaMask/injected connectors, and the Connect button UI) is
// stripped out. A fresh wallet integration will be built on top of this later.
//
// wagmi is kept only as an INERT chain context: the config has NO connectors and
// MIPD auto-discovery is off, so nothing tries to connect and there is no
// connector whose `uid` can be dereferenced. Every component that calls wagmi
// hooks (useAccount, useBalance, useWriteContract, …) keeps compiling and simply
// renders its "not connected" state until the new wallet layer lands.
// ─────────────────────────────────────────────────────────────────────────────
const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  transports: { [robinhoodChain.id]: http() },
  connectors: [],
  multiInjectedProviderDiscovery: false,
  ssr: true,
  // Fresh, versioned storage key so any wallet state persisted by the old
  // RainbowKit/wagmi setup is abandoned rather than rehydrated.
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
