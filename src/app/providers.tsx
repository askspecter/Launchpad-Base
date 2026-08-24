"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider, createConfig, http, createStorage, noopStorage } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { robinhoodChain } from "@/lib/chain";

// WalletConnect (added only when a project id is configured) negotiates an
// EVM-only session (eip155:<chainId>). That is the one path that forces a
// multi-chain wallet like Bitget onto the EVM/Robinhood network — it cannot
// offer Solana for an eip155 session — and its provider only initialises on
// connect(), not on mount, so it never white-screens the app the way
// RainbowKit's eager stack did. Free project id at cloud.reown.com.
export const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "";

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
// ─────────────────────────────────────────────────────────────────────────────
// EVM-provider targeting for multi-chain wallets.
//
// Wallets like Bitget, OKX and Trust are multi-chain (EVM + Solana + …). If we
// just grab the bare `window.ethereum`, their in-app browser shows a connect
// sheet defaulting to whatever network the wallet last used — often Solana —
// which is useless for an EVM-only app. Each of these wallets *also* exposes a
// dedicated EVM provider (e.g. window.bitkeep.ethereum). Targeting that provider
// tells the wallet "this is an EVM dApp", so it presents the EVM/Robinhood
// connect instead of Solana.
// ─────────────────────────────────────────────────────────────────────────────
type Eip1193 = { request: (...a: unknown[]) => Promise<unknown>; isMetaMask?: boolean };
type MultiWindow = Window & {
  ethereum?: Eip1193 & { providers?: Eip1193[] };
  bitkeep?: { ethereum?: Eip1193 };
  bitgetWallet?: { ethereum?: Eip1193 };
  okxwallet?: Eip1193;
  trustwallet?: Eip1193;
};

/** Return the best EVM (EIP-1193) provider, preferring a wallet's dedicated EVM
 *  endpoint over a multi-chain router that might default to Solana. */
function evmProvider(win?: unknown): Eip1193 | undefined {
  const w = (win ?? (typeof window !== "undefined" ? window : undefined)) as MultiWindow | undefined;
  if (!w) return undefined;
  // Dedicated EVM providers exposed by multi-chain wallets.
  const dedicated =
    w.bitkeep?.ethereum ?? w.bitgetWallet?.ethereum ?? w.okxwallet ?? w.trustwallet;
  if (dedicated) return dedicated;
  const eth = w.ethereum;
  if (!eth) return undefined;
  // Some wallets inject several providers under window.ethereum.providers —
  // prefer a genuine EVM one (MetaMask) when present.
  if (Array.isArray(eth.providers) && eth.providers.length) {
    return eth.providers.find((p: Eip1193) => p.isMetaMask) ?? eth.providers[0];
  }
  return eth;
}

const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  transports: { [robinhoodChain.id]: http() },
  // Two connectors so the user can pick a wallet explicitly:
  //   [0] MetaMask, targeted directly.
  //   [1] any EVM wallet — targets the dedicated EVM provider so multi-chain
  //       wallets (Bitget/OKX/Trust) present the EVM connect, not Solana.
  // The app is Robinhood-Chain-only; the wallet button forces that network on
  // connect.
  connectors: [
    injected({ target: "metaMask", shimDisconnect: true }),
    injected({
      shimDisconnect: true,
      target: () => ({
        id: "evmInjected",
        name: "Browser Wallet",
        provider: (win) => evmProvider(win) as never,
      }),
    }),
    // [2] WalletConnect — EVM-only session, forces Robinhood (not Solana).
    ...(WC_PROJECT_ID
      ? [
          walletConnect({
            projectId: WC_PROJECT_ID,
            showQrModal: true,
            metadata: {
              name: "Pork",
              description: "Cinematic AI launchpad on Robinhood Chain",
              url: "https://pork.works",
              icons: ["https://pork.works/pork-logo.png"],
            },
          }),
        ]
      : []),
  ],
  multiInjectedProviderDiscovery: false,
  ssr: true,
  storage: createStorage({
    // Bumped key wipes any stale connector state (e.g. a wallet that connected
    // on the wrong namespace) so the next connect starts clean.
    key: "pork.wagmi.v4",
    storage: typeof window !== "undefined" ? window.localStorage : noopStorage,
  }),
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    // reconnectOnMount=false: never touch the wallet on page load. Multi-chain
    // in-app browsers (Bitget/OKX) pop a connect sheet — defaulting to Solana —
    // the instant a dApp reads the provider on mount. Nothing accesses the
    // wallet until the user explicitly clicks Connect and picks an EVM wallet.
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
