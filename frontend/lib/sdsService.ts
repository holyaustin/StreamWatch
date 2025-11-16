// no "use server" here — this file is used by API routes & server code


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
  toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { waitForTransactionReceipt } from "viem/actions";

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

export const PUBLISHER_ADDRESS =
  (process.env.PUBLISHER_ADDRESS as `0x${string}`) || account.address;

/* ----------------------------------------------------
   SCHEMAS
---------------------------------------------------- */
const PROPOSAL_SCHEMA =
  "string proposalId, string title, address proposer, uint256 timestamp, string status, uint256 votes";

const VOTE_SCHEMA =
  "string proposalId, address voter, bool support, uint256 timestamp";

let _cachedProposalSchemaId: `0x${string}` | undefined;
let _cachedVoteSchemaId: `0x${string}` | undefined;

/* ----------------------------------------------------
   TYPES
---------------------------------------------------- */
export type DecodedItem = {
  name: string;
  type: string;
  value: any;
};

function extract(item: DecodedItem): string {
  return String(item?.value ?? "");
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
   REGISTER SCHEMAS
---------------------------------------------------- */
export async function ensureSchemasRegistered() {
  const { sdk, publicClient } = initClients();

  if (_cachedProposalSchemaId && _cachedVoteSchemaId) {
    return {
      proposalSchemaId: _cachedProposalSchemaId,
      voteSchemaId: _cachedVoteSchemaId,
    };
  }

  const proposalSchemaId = await sdk.streams.computeSchemaId(
    PROPOSAL_SCHEMA
  ) as `0x${string}`;

  const voteSchemaId = await sdk.streams.computeSchemaId(
    VOTE_SCHEMA
  ) as `0x${string}`;

  try {
    const tx = await sdk.streams.registerDataSchemas(
      [
        {
          id: "proposal_schema",
          schema: PROPOSAL_SCHEMA,
          parentSchemaId: zeroBytes32 as `0x${string}`,
        },
        {
          id: "vote_schema",
          schema: VOTE_SCHEMA,
          parentSchemaId: zeroBytes32 as `0x${string}`,
        },
      ],
      true
    );

    if (typeof tx === "string" && tx.startsWith("0x")) {
      await waitForTransactionReceipt(publicClient, {
        hash: tx as `0x${string}`,
      });
    }
  } catch (e) {
    console.warn("⚠️ Schema already exists");
  }

  _cachedProposalSchemaId = proposalSchemaId;
  _cachedVoteSchemaId = voteSchemaId;

  return { proposalSchemaId, voteSchemaId };
}

/* ----------------------------------------------------
   EXPOSE SCHEMA IDS FOR STREAMING CLIENT
---------------------------------------------------- */
export async function getSchemaIds() {
  return await ensureSchemasRegistered();
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
    { name: "status", type: "string", value: "open" },
    { name: "votes", type: "uint256", value: BigInt(0) },
  ]);

  const tx = await sdk.streams.set([
    {
      id: toHex(proposalId, { size: 32 }) as Hex,
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
      id: toHex(`${proposalId}-${now}`, { size: 32 }) as Hex,
      schemaId: voteSchemaId,
      data,
    },
  ]);

  return String(tx);
}

/* ----------------------------------------------------
   READ PROPOSALS
---------------------------------------------------- */
export async function readProposals() {
  const { sdk } = initClients();
  const { proposalSchemaId } = await ensureSchemasRegistered();

  const rows = await sdk.streams.getAllPublisherDataForSchema(
    proposalSchemaId,
    PUBLISHER_ADDRESS
  );

  return (rows as DecodedItem[][]).map((row) => ({
    proposalId: extract(row[0]),
    title: extract(row[1]),
    proposer: extract(row[2]),
    timestamp: Number(extract(row[3])),
    status: extract(row[4]),
    votes: Number(extract(row[5])),
  }));
}

/* ----------------------------------------------------
   READ VOTES
---------------------------------------------------- */
export async function readVotesForProposal(proposalId: string) {
  const { sdk } = initClients();
  const { voteSchemaId } = await ensureSchemasRegistered();

  const rows = await sdk.streams.getAllPublisherDataForSchema(
    voteSchemaId,
    PUBLISHER_ADDRESS
  );

  return (rows as DecodedItem[][])
    .map((row) => ({
      proposalId: extract(row[0]),
      voter: extract(row[1]),
      support: extract(row[2]) === "true",
      timestamp: Number(extract(row[3])),
    }))
    .filter((x) => x.proposalId === proposalId);
}
