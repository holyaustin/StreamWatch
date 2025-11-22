// lib/sdsStreamClient.ts
'use client';

import { createPublicClient, http } from 'viem';
import { defineChain } from 'viem';
import { SDK } from '@somnia-chain/streams';

/**
 * Client-side streaming wrapper for Somnia Data Streams (SDK v0.9.x compatible).
 *
 * Behaviour:
 * - Loads schema IDs from /api/schemas (server route)
 * - Tries to create a real-time subscription via SDK.createSubscription
 * - Falls back to polling your server read endpoints if subscription isn't available
 *
 * Expects server routes:
 *  GET /api/schemas            -> { proposalSchemaId, voteSchemaId, publisher? }
 *  GET /api/read/proposals     -> [ ...proposal objects... ]
 *  GET /api/read/vote?proposalId=... -> [ ...vote objects... ]
 *
 * The subscription callback attempts to decode several event shapes:
 *  - ev.data (array or object)  (SDK returns array of decoded fields often)
 *  - ev.decoded
 *  - ev (raw)
 *
 * Decoding supports:
 *  - field.value (primitive)
 *  - field.value.value (wrapped)
 *  - direct property value (already decoded)
 */

// cached schemas to prevent repeated fetches
let SCHEMAS: {
  proposalSchemaId: `0x${string}`;
  voteSchemaId: `0x${string}`;
  publisher?: `0x${string}`;
} | null = null;

// Attempt to load schemas (and optional publisher address) from server
async function loadSchemas() {
  if (SCHEMAS) return SCHEMAS;

  try {
    const res = await fetch('/api/schemas', { cache: 'no-store' });
    if (!res.ok) throw new Error('failed to load schemas');
    const json = await res.json();

    SCHEMAS = {
      proposalSchemaId: json.proposalSchemaId,
      voteSchemaId: json.voteSchemaId,
      publisher: json.publisher ?? json.PUBLISHER_ADDRESS ?? undefined,
    };

    return SCHEMAS;
  } catch (err) {
    console.warn('sdsStreamClient: could not load /api/schemas', err);
    throw err;
  }
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
  // SDK's constructor typing may differ — construct as any to avoid TS friction in client code
  return new (SDK as any)({ public: publicClient });
}

/** tryCreateSubscription: prefer sdk.streams.createSubscription if available */
async function tryCreateSubscription(sdk: any, opts: any) {
  if (!sdk || !sdk.streams) return null;

  // preferred style (Hello World guide)
  if (typeof sdk.streams.createSubscription === 'function') {
    try {
      return await sdk.streams.createSubscription(opts);
    } catch (e) {
      // some browsers/environments may throw if websocket isn't available
      console.warn('createSubscription failed', e);
      return null;
    }
  }

  // older variants might not be present in browser SDK
  return null;
}

/* -------------------------
   Helpers: decode field values
   ------------------------- */
function decodeFieldValue(field: any) {
  // field could be:
  // { name: 'title', value: 'abc' }
  // { name: 'title', value: { value: 'abc' } }
  // or it could already be the primitive
  if (field == null) return undefined;

  // If field is a primitive
  if (typeof field !== 'object') return field;

  // Common shapes:
  // { name, value }  where value is primitive or { value: ... }
  if ('value' in field) {
    const v = field.value;
    if (v && typeof v === 'object' && 'value' in v) return v.value;
    return v;
  }

  // If the whole object is { name, decodedValue } or similar heuristics:
  if ('decoded' in field) return field.decoded;

  return undefined;
}

// Normalize an SDK event payload into a plain object { fieldName: value, ... }
function normalizeEventData(ev: any) {
  // SDK event shapes we handle:
  //  - ev.data = [ { name, value }, ... ]  (array)
  //  - ev.decoded = [ { name, value }, ... ]
  //  - ev = { proposalId: { value: 'x' }, title: { value: 'y' } }  (already keyed)
  //  - ev = { data: { ... } } etc.

  const candidateArrays = ev?.data ?? ev?.decoded ?? (Array.isArray(ev) ? ev : null);

  if (Array.isArray(candidateArrays)) {
    // array-of-fields -> object
    const out: Record<string, any> = {};
    for (const f of candidateArrays) {
      // field might be { name, value } or { name, value: { value: ... } }
      const name = f?.name;
      if (!name) continue;
      out[name] = decodeFieldValue(f);
    }
    return out;
  }

  // If ev is keyed object: { proposalId: { value: 'x' }, title: { value: 'y' } }
  if (ev && typeof ev === 'object') {
    const possible = Object.keys(ev).reduce((acc: any, k) => {
      try {
        const v = ev[k];
        // skip sdk metadata keys
        if (k === 'metadata' || k === 'publisher' || k === 'schemaId' || k === 'timestamp') return acc;
        const decoded = decodeFieldValue(v);
        if (typeof decoded !== 'undefined') acc[k] = decoded;
      } catch {}
      return acc;
    }, {});
    // if we found keys, return
    if (Object.keys(possible).length > 0) return possible;
  }

  // fallback: return empty object
  return {};
}

/* -------------------------
   Subscribe to proposals (realtime)
   - onEvent receives { proposalId, title, proposer }
   ------------------------- */
export async function subscribeToProposals(
  onEvent: (e: { proposalId: string; title: string; proposer: string }) => void
) {
  let schemas;
  try {
    schemas = await loadSchemas();
  } catch (e) {
    // If schemas cannot be loaded, fall back to polling (but loadSchemas should usually succeed)
    console.warn('subscribeToProposals: falling back to polling due to schema load failure', e);
    return startPollingProposals(onEvent);
  }

  const { proposalSchemaId, publisher } = schemas;
  const sdk = makeSdk();

  const opts = {
    schemaId: proposalSchemaId,
    publisher, // if undefined SDK may listen to all publishers (less ideal)
    onEvent: (ev: any) => {
      try {
        const data = normalizeEventData(ev);
        onEvent({
          proposalId: String(data.proposalId ?? data.id ?? data.proposal_id ?? ''),
          title: String(data.title ?? ''),
          proposer: String(data.proposer ?? data.sender ?? ''),
        });
      } catch (err) {
        console.warn('subscribeToProposals: event parse error', err, ev);
      }
    },
  };

  const sub = await tryCreateSubscription(sdk, opts);

  if (sub && typeof sub.unsubscribe === 'function') {
    return () => {
      try {
        sub.unsubscribe();
      } catch (e) {
        try { sub.close && sub.close(); } catch {}
      }
    };
  }

  // fallback to polling server API
  return startPollingProposals(onEvent);
}

/* -------------------------
   Subscribe to vote for a proposal (realtime)
   - onEvent receives { voter, support, timestamp }
   ------------------------- */
export async function subscribeToVotes(
  proposalId: string,
  onEvent: (e: { voter: string; support: boolean; timestamp: number }) => void
) {
  if (!proposalId) return () => {}; // noop unsubscribe

  let schemas;
  try {
    schemas = await loadSchemas();
  } catch (e) {
    console.warn('subscribeToVotes: falling back to polling due to schema load failure', e);
    return startPollingVotes(proposalId, onEvent);
  }

  const { voteSchemaId, publisher } = schemas;
  const sdk = makeSdk();

  const opts: any = {
    schemaId: voteSchemaId,
    publisher,
    onEvent: (ev: any) => {
      try {
        const data = normalizeEventData(ev);
        const pid = String(data.proposalId ?? '');
        if (pid !== proposalId) return; // not for this proposal

        onEvent({
          voter: String(data.voter ?? data.sender ?? ''),
          support: data.support === true || data.support === 'true' || data.support === 1,
          timestamp: Number(data.timestamp ?? Math.floor(Date.now() / 1000)),
        });
      } catch (err) {
        console.warn('subscribeToVotes: event parse error', err, ev);
      }
    },
  };

  // try to include filter if SDK supports it
  try {
    (opts as any).filter = [{ field: 'proposalId', equals: proposalId }];
  } catch {}

  const sub = await tryCreateSubscription(sdk, opts);

  if (sub && typeof sub.unsubscribe === 'function') {
    return () => {
      try {
        sub.unsubscribe();
      } catch (e) {
        try { sub.close && sub.close(); } catch {}
      }
    };
  }

  // fallback to polling server API
  return startPollingVotes(proposalId, onEvent);
}

/* -------------------------
   Polling fallbacks
   - keep dedupe sets and intervals per-subscription
   ------------------------- */

function startPollingProposals(onEvent: (e: { proposalId: string; title: string; proposer: string }) => void) {
  let stopped = false;
  const seen = new Set<string>();

  async function poll() {
    if (stopped) return;
    try {
      const res = await fetch('/api/read/proposals', { cache: 'no-store' });
      if (!res.ok) throw new Error('failed proposals read');
      const items = await res.json();
      if (Array.isArray(items)) {
        for (const it of items) {
          // expect item: { proposalId, title, proposer, timestamp }
          const id = String(it?.proposalId ?? it?.id ?? '');
          if (!id) continue;
          if (!seen.has(id)) {
            seen.add(id);
            onEvent({ proposalId: id, title: String(it?.title ?? ''), proposer: String(it?.proposer ?? '') });
          }
        }
      }
    } catch (e) {
      console.warn('poll proposals error', e);
    } finally {
      if (!stopped) setTimeout(poll, 3000);
    }
  }

  poll();

  return () => { stopped = true; };
}

function startPollingVotes(proposalId: string, onEvent: (e: { voter: string; support: boolean; timestamp: number }) => void) {
  let stopped = false;
  const seen = new Set<string>();

  async function poll() {
    if (stopped) return;
    try {
      const res = await fetch(`/api/read/vote?proposalId=${encodeURIComponent(proposalId)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('failed vote read');
      const items = await res.json();
      if (Array.isArray(items)) {
        for (const it of items) {
          const key = `${it?.voter ?? ''}-${it?.timestamp ?? ''}-${it?.support ?? ''}`;
          if (!key.trim()) continue;
          if (!seen.has(key)) {
            seen.add(key);
            onEvent({
              voter: String(it?.voter ?? ''),
              support: !!it?.support,
              timestamp: Number(it?.timestamp ?? Math.floor(Date.now() / 1000)),
            });
          }
        }
      }
    } catch (e) {
      console.warn('poll vote error', e);
    } finally {
      if (!stopped) setTimeout(poll, 2500);
    }
  }

  poll();

  return () => { stopped = true; };
}
