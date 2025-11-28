// lib/sdsService.ts
import { SDK, SchemaEncoder, zeroBytes32 } from "@somnia-chain/streams";
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
import "dotenv/config";

/* ----------------------------------------------------
   Chain
---------------------------------------------------- */
export const dreamChain = defineChain({
  id: 50312,
  name: "Somnia Dream",
  network: "somnia-dream",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: { default: { http: ["https://dream-rpc.somnia.network"] } },
});

/* ----------------------------------------------------
   Env
---------------------------------------------------- */
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(PRIVATE_KEY);

export const PUBLISHER_ADDRESS =
  (process.env.PUBLISHER_ADDRESS as `0x${string}`) || account.address;

/* ----------------------------------------------------
   Schemas
---------------------------------------------------- */
export const PROPOSAL_SCHEMA =
  "string proposalId, string title, address proposer, uint256 timestamp";

export const VOTE_SCHEMA =
  "string proposalId, address voter, bool support, uint256 timestamp";

// cache
let _cachedProposalSchemaId: `0x${string}` | undefined;
let _cachedVoteSchemaId: `0x${string}` | undefined;

/* ----------------------------------------------------
   Helpers
---------------------------------------------------- */
function safeValue(v: any) {
  if (v == null) return "";
  if (typeof v === "object" && "value" in v) {
    const inner = v.value;
    if (typeof inner === "bigint") return Number(inner);
    return inner;
  }
  return v;
}

function extractFieldsFromSdkItem(item: any): Record<string, any> {
  const out: Record<string, any> = {};

  // SDS returns array: [ {name, value: {value}} , ... ]
  if (Array.isArray(item)) {
    for (const field of item) {
      const raw = field?.value?.value;

      if (typeof raw === "bigint") out[field.name] = Number(raw);
      else out[field.name] = raw ?? "";
    }
  }

  console.log("🔍 DECODED SDK ITEM (FIXED):", out);
  return out;
}

/* ----------------------------------------------------
   Clients
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
   Register Schemas
---------------------------------------------------- */
export async function ensureSchemasRegistered() {
  const { sdk, publicClient } = initClients();

  const proposalSchemaId =
    (await sdk.streams.computeSchemaId(PROPOSAL_SCHEMA)) as `0x${string}`;
  const voteSchemaId =
    (await sdk.streams.computeSchemaId(VOTE_SCHEMA)) as `0x${string}`;

  console.log("🧩 COMPUTED SCHEMA IDS:", {
    proposalSchemaId,
    voteSchemaId,
  });

  const proposalExists = await sdk.streams.isDataSchemaRegistered(
    proposalSchemaId
  );
  const voteExists = await sdk.streams.isDataSchemaRegistered(voteSchemaId);

  console.log("📘 SCHEMA REGISTRATION STATUS:", {
    proposalExists,
    voteExists,
  });

  if (!proposalExists || !voteExists) {
    const regs = [];

    if (!proposalExists)
      regs.push({
        id: proposalSchemaId,
        schema: PROPOSAL_SCHEMA,
        parentSchemaId: zeroBytes32 as `0x${string}`,
      });

    if (!voteExists)
      regs.push({
        id: voteSchemaId,
        schema: VOTE_SCHEMA,
        parentSchemaId: zeroBytes32 as `0x${string}`,
      });

    console.log("📝 REGISTERING SCHEMAS:", regs);

    try {
      const tx = await sdk.streams.registerDataSchemas(regs, true);

      console.log("📨 REGISTER SCHEMA TX:", tx);

      if (typeof tx === "string" && tx.startsWith("0x")) {
        await waitForTransactionReceipt(publicClient, { hash: tx as Hex });
      }
    } catch (err) {
      console.error("❌ ERROR REGISTERING SCHEMAS:", err);
    }
  }

  _cachedProposalSchemaId = proposalSchemaId;
  _cachedVoteSchemaId = voteSchemaId;

  return { proposalSchemaId, voteSchemaId };
}

/* ----------------------------------------------------
   Publish Proposal
---------------------------------------------------- */
export async function publishProposal(
  proposalId: string,
  title: string,
  proposer: string
) {
  console.log("🚀 PUBLISH PROPOSAL INPUT:", {
    proposalId,
    title,
    proposer,
  });

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

  console.log("🧱 ENCODED PROPOSAL DATA:", data);

  const recordId = toHex(`${proposalId}-${now}`, { size: 32 }) as Hex;

  console.log("🆔 PROPOSAL RECORD ID:", recordId);

  const tx = await sdk.streams.set([
    { id: recordId, schemaId: proposalSchemaId, data },
  ]);

  console.log("📨 STREAM SET TX:", tx);

  return String(tx);
}


function normalizeProposalId(input: any): string {
  if (typeof input === "string") return input;

  if (input == null) return "";

  // Case: { proposalId: "X" }
  if (typeof input === "object" && typeof input.proposalId === "string") {
    return input.proposalId;
  }

  // Case: { proposalId: { value: "X" }}
  if (
    typeof input === "object" &&
    typeof input.proposalId === "object" &&
    typeof input.proposalId.value === "string"
  ) {
    return input.proposalId.value;
  }

  // Last fallback: stringify safely
  return JSON.stringify(input);
}



/* ----------------------------------------------------
   Publish Vote (ADDED)
---------------------------------------------------- */
export async function publishVote(
  proposalId: string,
  voter: string,
  support: boolean
) {
  console.log("🚀 PUBLISH VOTE INPUT:", {
    proposalId,
    voter,
    support,
  });

  const { sdk } = initClients();
  const { voteSchemaId } = await ensureSchemasRegistered();

  console.log("🔢 USING VOTE SCHEMA:", voteSchemaId);

    // Ensure proposalId is plain string
  const cleanId = normalizeProposalId(proposalId);
  console.log("🧹 CLEAN PROPOSAL ID:", cleanId);

  const encoder = new SchemaEncoder(VOTE_SCHEMA);
  const now = BigInt(Math.floor(Date.now() / 1000));

  const data = encoder.encodeData([
    { name: "proposalId", type: "string", value: cleanId },
    { name: "voter", type: "address", value: voter },
    { name: "support", type: "bool", value: !!support },
    { name: "timestamp", type: "uint256", value: now },
  ]);

  console.log("🧱 ENCODED VOTE DATA:", data);

  // A unique deterministic ID for vote record
  const recordId = toHex(`vote-${cleanId}-${now}`, { size: 32 }) as Hex;

  console.log("🆔 VOTE RECORD ID:", recordId);

  const tx = await sdk.streams.set([
    { id: recordId, schemaId: voteSchemaId, data },
  ]);

  console.log("📨 STREAM SET TX (VOTE):", tx);
  return String(tx);
}

/* ----------------------------------------------------
   Read Proposals
---------------------------------------------------- */
type Proposal = {
  proposalId: string;
  title: string;
  proposer: string;
  timestamp: number;
};

export async function readProposals() {
  const { sdk } = initClients();
  const { proposalSchemaId } = await ensureSchemasRegistered();

  console.log("📡 READING PROPOSALS FOR SCHEMA:", proposalSchemaId);

  let raw: any = null;

  try {
    raw = await sdk.streams.getAllPublisherDataForSchema(
      proposalSchemaId,
      PUBLISHER_ADDRESS
    );
    console.log("📥 RAW STREAM DATA:", raw);
  } catch (err) {
    console.error("❌ ERROR READING PROPOSALS:", err);
    return [];
  }

  if (!raw) return [];

  //return raw.map((item: any) => {
 const proposals: Proposal[] = raw.map((item: any) => {
    console.log("🔎 RAW RECORD ITEM:", item);
    const obj = extractFieldsFromSdkItem(item);
    return {
      proposalId: obj.proposalId ?? "",
      title: obj.title ?? "",
      proposer: obj.proposer ?? "",
      timestamp: Number(obj.timestamp ?? 0),
    };
  });

   // 🔥 Add dynamic vote counts
  const enriched = await Promise.all(
    proposals.map(async (p) => {
      const votes = await readVotesForProposal(p.proposalId);

      return {
        ...p,
        status: "Active",       // could be computed later
        votes: votes.length,    // 🔥 Real vote count
      };
    })
  );

  return enriched;
}

/* ----------------------------------------------------
   Read Votes for a Proposal
---------------------------------------------------- */
export async function readVotesForProposal(proposalId: string) {
  const { sdk } = initClients();
  const { voteSchemaId } = await ensureSchemasRegistered();

  console.log("📡 READING VOTES FOR PROPOSAL:", proposalId);
  console.log("🔢 USING VOTE SCHEMA ID:", voteSchemaId);
  console.log("👤 PUBLISHER:", PUBLISHER_ADDRESS);

  let raw: any = null;

  try {
    raw = await sdk.streams.getAllPublisherDataForSchema(
      voteSchemaId,
      PUBLISHER_ADDRESS
    );

    console.log("📥 RAW VOTE STREAM DATA:", raw);
  } catch (err) {
    console.error("❌ ERROR READING VOTES:", err);
    return [];
  }

  if (!raw) return [];

  // Decode each raw SDS entry
  const decoded = raw
    .map((item: any) => {
      console.log("🔎 RAW VOTE ITEM:", item);
      const fields = extractFieldsFromSdkItem(item);

      return {
         proposalId: String(fields.proposalId ?? "").trim(),
        voter: fields.voter ?? "",
        support: fields.support ?? false,
        timestamp: Number(fields.timestamp ?? 0),
      };
    })
    // Filter votes that belong to this proposal
     .filter((v: any) => v.proposalId === String(proposalId).trim());

  console.log(`📊 FILTERED VOTES FOR ${proposalId}:`, decoded);

  return decoded;
}

/* ----------------------------------------------------
   Read ALL Votes (no filtering)
---------------------------------------------------- */
export async function readAllVotes() {
  const { sdk } = initClients();
  const { voteSchemaId } = await ensureSchemasRegistered();

  console.log("📡 READING ALL VOTES FOR SCHEMA:", voteSchemaId);

  let raw: any = null;

  try {
    raw = await sdk.streams.getAllPublisherDataForSchema(
      voteSchemaId,
      PUBLISHER_ADDRESS
    );

    console.log("📥 RAW ALL-VOTES STREAM DATA:", raw);
  } catch (err) {
    console.error("❌ ERROR READING ALL VOTES:", err);
    return [];
  }

  if (!raw) return [];

  // Decode each raw SDS entry
  return raw.map((item: any) => {
    console.log("🔎 RAW VOTE ITEM:", item);
    const fields = extractFieldsFromSdkItem(item);

    return {
      proposalId: fields.proposalId ?? "",
      voter: fields.voter ?? "",
      support: fields.support ?? false,
      timestamp: Number(fields.timestamp ?? 0),
    };
  });
}
