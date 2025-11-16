// lib/sdsStreamClient.ts
'use client';

import { createPublicClient, http } from 'viem';
import { defineChain } from 'viem';
import { SDK } from '@somnia-chain/streams';

// Cached schema IDs so they only load once
let SCHEMAS: {
  proposalSchemaId: `0x${string}`;
  voteSchemaId: `0x${string}`;
  publisher: `0x${string}`;
} | null = null;

// Load schema IDs from API
async function loadSchemas() {
  if (SCHEMAS) return SCHEMAS;

  const res = await fetch("/api/schemas", { cache: "no-store" });
  const json = await res.json();

  SCHEMAS = json;
  return json;
}

const dreamChain = defineChain({
  id: 50312,
  name: 'Somnia Dream',
  network: 'somnia-dream',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: { default: { http: ['https://dream-rpc.somnia.network'] } },
});

function makeSdk() {
  const publicClient = createPublicClient({ chain: dreamChain, transport: http() });
  return new (SDK as any)({ public: publicClient });
}

// Try to create stream subscription
async function tryCreateSubscription(sdk: any, opts: any) {
  if (!sdk || !sdk.streams) return null;

  if (typeof sdk.streams.createSubscription === "function") {
    return sdk.streams.createSubscription(opts);
  }
  return null;
}

// ----------------------------------------------------------
// SUBSCRIBE TO PROPOSALS
// ----------------------------------------------------------
export async function subscribeToProposals(
  onEvent: (e: { proposalId: string; title: string; proposer: string }) => void
) {
  const { proposalSchemaId, publisher } = await loadSchemas();
  const sdk = makeSdk();

  const opts = {
    schemaId: proposalSchemaId,
    publisher,
    onEvent: (ev: any) => {
      const data = ev?.data ?? ev;
      onEvent({
        proposalId: String(data.proposalId?.value ?? data.proposalId),
        title: String(data.title?.value ?? data.title),
        proposer: String(data.proposer?.value ?? data.proposer),
      });
    }
  };

  const sub = await tryCreateSubscription(sdk, opts);

  if (sub?.unsubscribe) return () => sub.unsubscribe();
  return () => {};
}

// ----------------------------------------------------------
// SUBSCRIBE TO VOTES
// ----------------------------------------------------------
export async function subscribeToVotes(
  proposalId: string,
  onEvent: (e: { voter: string; support: boolean; timestamp: number }) => void
) {
  const { voteSchemaId, publisher } = await loadSchemas();
  const sdk = makeSdk();

  const opts = {
    schemaId: voteSchemaId,
    publisher,
    filter: [{ field: "proposalId", equals: proposalId }],
    onEvent: (ev: any) => {
      const data = ev?.data ?? ev;
      const pid = String(data.proposalId?.value ?? data.proposalId);
      if (pid !== proposalId) return;

      onEvent({
        voter: String(data.voter?.value ?? data.voter),
        support: Boolean(data.support?.value ?? data.support),
        timestamp: Number(data.timestamp?.value ?? data.timestamp ?? Date.now() / 1000),
      });
    }
  };

  const sub = await tryCreateSubscription(sdk, opts);

  if (sub?.unsubscribe) return () => sub.unsubscribe();
  return () => {};
}
