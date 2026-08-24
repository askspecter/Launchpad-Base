"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider, createConfig, http, createStorage, noopStorage } from "wagmi";
import { injected } from "wagmi/connectors";
import { robinhoodChain } from "@/lib/chain";

// ─────────────────────────────────────────────────────────────────────────────
// Wallet connect — deliberately RainbowKit-FREE.
//
// RainbowKit (and the WalletConnect / @reown-appkit stack it pulls in) crashed
// the whole site on mobile Safari with "undefined is not an object (evaluating
// 'e.uid')" every time it was mounted. The only configuration that stayed up on
// that device is a bare wagmi setup, so wallet connect is built directly on
// wagmi's lightweight `injected` connector instead:
//
//  • `injected` targets window.ethereum directly (MetaMask & other extensions,
//    and wallet in-app browsers). No WalletConnect, no @reown-appkit, no
//    MetaMask SDK — none of the heavy, Safari-fragile code that was crashing.
//  • MIPD (EIP-6963 auto-discovery) is OFF — it dynamically builds connectors on
//    mount and was a suspect for the undefined-connector/uid crash.
//  • Fresh, versioned storage key so no stale connector state is rehydrated.
//
// The Connect button (components/WalletButton.tsx) drives this via wagmi hooks.
// A richer modal (e.g. RainbowKit or WalletConnect QR for mobile) can be layered
// back on later once it's verified stable on mobile Safari.
// ─────────────────────────────────────────────────────────────────────────────
const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  transports: { [robinhoodChain.id]: http() },
  connectors: [injected({ shimDisconnect: true })],
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
