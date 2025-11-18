// lib/sdsService.ts
// Clean, production-ready, stable SDS service

import {
  SDK,
  SchemaEncoder,
  zeroBytes32,
} from "@somnia-chain/streams";

import {
  createPublicClient,
  createWalletClient,
  http,
  Hex,
  defineChain,
  keccak256,
  stringToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { waitForTransactionReceipt } from "viem/actions";

import "dotenv/config";

/* ----------------------------------------------------
   SOMNIA DREAM CHAIN CONFIG
---------------------------------------------------- */
export const dreamChain = defineChain({
  id: 50312,
  name: "Somnia Dream",
  network: "somnia-dream",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network"] },
  },
  blockExplorers: {
    default: {
      name: "Somnia Explorer",
      url: "https://shannon-explorer.somnia.network/",
      apiUrl: "https://shannon-explorer.somnia.network/api",
    },
  },
});

/* ----------------------------------------------------
   ENVIRONMENT
---------------------------------------------------- */
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) throw new Error("❌ Missing PRIVATE_KEY in .env");

const account = privateKeyToAccount(PRIVATE_KEY);
console.log("Account is", account.address);

export const PUBLISHER_ADDRESS =
  (process.env.PUBLISHER_ADDRESS as `0x${string}`) || account.address;

/* ----------------------------------------------------
   SCHEMAS
---------------------------------------------------- */
const PROPOSAL_SCHEMA =
  "string proposalId, string title, address proposer, uint256 timestamp";

const VOTE_SCHEMA =
  "string proposalId, address voter, bool support, uint256 timestamp";

let _cachedProposalSchemaId: `0x${string}` | undefined;
let _cachedVoteSchemaId: `0x${string}` | undefined;

/* ----------------------------------------------------
   HELPERS
---------------------------------------------------- */
export type DecodedItem = {
  name: string;
  type: string;
  value: any;
};

function extract(item: DecodedItem): string {
  return String(item?.value ?? "");
}

// Generate a stable 32-byte ID from a string
function id32(input: string): Hex {
  return keccak256(stringToHex(input)) as Hex;
}

/* ----------------------------------------------------
   INIT CLIENTS
---------------------------------------------------- */
function initClients() {
  const publicClient = createPublicClient({
    chain: dreamChain,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: dreamChain,
    transport: http(),
  });

  const sdk = new SDK({ public: publicClient, wallet: walletClient });
  return { sdk, publicClient };
}

/* ----------------------------------------------------
   REGISTER SCHEMAS SAFELY
---------------------------------------------------- */
export async function ensureSchemasRegistered() {
  const { sdk, publicClient } = initClients();

  // Use cached values if available
  if (_cachedProposalSchemaId && _cachedVoteSchemaId) {
    return {
      proposalSchemaId: _cachedProposalSchemaId,
      voteSchemaId: _cachedVoteSchemaId,
    };
  }

  const proposalSchemaId = (await sdk.streams.computeSchemaId(
    PROPOSAL_SCHEMA
  )) as `0x${string}`;

  const voteSchemaId = (await sdk.streams.computeSchemaId(
    VOTE_SCHEMA
  )) as `0x${string}`;

  // Try registration once
  try {
    const tx = await sdk.streams.registerDataSchemas(
      [
        {
          id: "proposal_schema",
          schema: PROPOSAL_SCHEMA,
          parentSchemaId: zeroBytes32 as Hex,
        },
        {
          id: "vote_schema",
          schema: VOTE_SCHEMA,
          parentSchemaId: zeroBytes32 as Hex,
        },
      ],
      true // allowFailure
    );

    // Only wait if a real tx is returned
    if (typeof tx === "string" && tx.startsWith("0x")) {
      await waitForTransactionReceipt(publicClient, { hash: tx });
    }
  } catch (e) {
    console.warn("⚠️ Schemas probably already registered.");
  }

  _cachedProposalSchemaId = proposalSchemaId;
  _cachedVoteSchemaId = voteSchemaId;

  return { proposalSchemaId, voteSchemaId };
}

/* ----------------------------------------------------
   PUBLISH PROPOSAL
---------------------------------------------------- */
export async function publishProposal(
  proposalId: string,
  title: string,
  proposer: string
) {
  const { sdk } = initClients();
  const { proposalSchemaId } = await ensureSchemasRegistered();

  const encoder = new SchemaEncoder(PROPOSAL_SCHEMA);
  const now = BigInt(Math.floor(Date.now() / 1000));

  const data = encoder.encodeData([
    { name: "proposalId", type: "string", value: proposalId },
    { name: "title", type: "string", value: title },
    { name: "proposer", type: "address", value: proposer },
    { name: "timestamp", type: "uint256", value: now },
  ]);

  const tx = await sdk.streams.set([
    {
      id: id32(`proposal-${proposalId}`),
      schemaId: proposalSchemaId,
      data,
    },
  ]);

  return String(tx);
}

/* ----------------------------------------------------
   PUBLISH VOTE
---------------------------------------------------- */
export async function publishVote(
  proposalId: string,
  voter: string,
  support: boolean
) {
  const { sdk } = initClients();
  const { voteSchemaId } = await ensureSchemasRegistered();

  const encoder = new SchemaEncoder(VOTE_SCHEMA);
  const now = BigInt(Math.floor(Date.now() / 1000));

  const data = encoder.encodeData([
    { name: "proposalId", type: "string", value: proposalId },
    { name: "voter", type: "address", value: voter },
    { name: "support", type: "bool", value: support },
    { name: "timestamp", type: "uint256", value: now },
  ]);

  const tx = await sdk.streams.set([
    {
      id: id32(`vote-${proposalId}-${now}`),
      schemaId: voteSchemaId,
      data,
    },
  ]);

  return String(tx);
}

/* ----------------------------------------------------
   READ PROPOSALS (SAFE)
---------------------------------------------------- */
export async function readProposals() {
  const { sdk } = initClients();
  const { proposalSchemaId } = await ensureSchemasRegistered();

  let rows: any = [];

  try {
    rows = await sdk.streams.getAllPublisherDataForSchema(
      proposalSchemaId,
      PUBLISHER_ADDRESS
    );
  } catch (err: any) {
    if (String(err).includes("NoData")) return [];
    console.error("readProposals error", err);
    return [];
  }

  return (rows as DecodedItem[][]).map((row) => ({
    proposalId: extract(row[0]),
    title: extract(row[1]),
    proposer: extract(row[2]),
    timestamp: Number(extract(row[3])),
  }));
}

/* ----------------------------------------------------
   READ VOTES (SAFE)
---------------------------------------------------- */
export async function readVotesForProposal(proposalId: string) {
  const { sdk } = initClients();
  const { voteSchemaId } = await ensureSchemasRegistered();

  let rows: any = [];

  try {
    rows = await sdk.streams.getAllPublisherDataForSchema(
      voteSchemaId,
      PUBLISHER_ADDRESS
    );
  } catch (err: any) {
    if (String(err).includes("NoData")) return [];
    console.error("readVotes error", err);
    return [];
  }

  return (rows as DecodedItem[][])
    .map((row) => ({
      proposalId: extract(row[0]),
      voter: extract(row[1]),
      support: extract(row[2]) === "true",
      timestamp: Number(extract(row[3])),
    }))
    .filter((x) => x.proposalId === proposalId);
}
