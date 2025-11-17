'use client';

import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { somniaTestnet } from 'viem/chains';
import { createClient as createViemClient } from 'viem';

// -----------------------------
// ✅ 1. React Query client
// -----------------------------
const queryClient = new QueryClient();

// -----------------------------
// ✅ 2. Wagmi config with custom Viem client
// -----------------------------
const config = createConfig({
  chains: [somniaTestnet],
  client({ chain }) {
    return createViemClient({
      chain,
      transport: http(chain.rpcUrls.default.http[0]), // Uses Somnia Testnet RPC URL
    });
  },
});

// -----------------------------
// ✅ 3. Top-level provider
// -----------------------------
export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* ConnectKit handles autoConnect internally */}
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
