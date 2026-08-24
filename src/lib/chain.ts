import { defineChain } from "viem";

/**
 * Robinhood Chain - verified network parameters.
 *  - Chain ID: 4663
 *  - Native currency: ETH
 *  - L2 built on Arbitrum Orbit
 *
 * Sources: robinhoodchain.wiki, Chainstack docs, MetaMask add-network guides.
 */
export const robinhoodChain = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 4663),
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL ?? "https://rpc.mainnet.chain.robinhood.com",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://robinhoodchain.blockscout.com",
    },
  },
});

export const explorerUrl =
  process.env.NEXT_PUBLIC_EXPLORER_URL ?? "https://robinhoodchain.blockscout.com";

export function explorerTx(hash: string): string {
  return `${explorerUrl}/tx/${hash}`;
}

export function explorerToken(address: string): string {
  return `${explorerUrl}/token/${address}`;
}
