// lib/chain.ts
import { defineChain } from 'viem';

// A minimal Somnia Testnet definition for wagmi/viem/connectkit
export const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'], // replace with official Somnia RPC if different
      webSocket: ['wss://dream-rpc.somnia.network/ws'], // if Somnia exposes a WS; check docs & replace
    },
  },
  testnet: true,
} as const);
