'use client'

import { SDK, SchemaEncoder, zeroBytes32 } from '@somnia-chain/streams'
import {
  createPublicClient,
  createWalletClient,
  http,
  toHex,
  Hex,
  defineChain,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { waitForTransactionReceipt } from 'viem/actions'

// -----------------------------
// ⚙️ Define Somnia Dream Chain
// -----------------------------
export const dreamChain = defineChain({
  id: 50312,
  name: 'Somnia Dream',
  network: 'somnia-dream',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://shannon-explorer.somnia.network/',
      apiUrl: 'https://shannon-explorer.somnia.network/api',
    },
  },
})

// -----------------------------
// ⚙️ Environment Config
// -----------------------------
const PRIVATE_KEY = process.env.NEXT_PUBLIC_DEPLOYER_KEY as `0x${string}`
if (!PRIVATE_KEY) throw new Error('❌ Missing NEXT_PUBLIC_DEPLOYER_KEY in .env')

const account = privateKeyToAccount(PRIVATE_KEY)

// -----------------------------
// 🧩 Initialize SDK + Clients
// -----------------------------
export function initSomniaStreams() {
  const publicClient = createPublicClient({
    chain: dreamChain,
    transport: http(),
  })
  const walletClient = createWalletClient({
    account,
    chain: dreamChain,
    transport: http(),
  })

  const sdk = new SDK({ public: publicClient, wallet: walletClient })
  console.log('✅ Somnia SDK initialized')

  return { sdk, publicClient, walletClient }
}

// -----------------------------
// 🧩 Register Proposal Schema
// -----------------------------
export async function registerProposalSchema(): Promise<`0x${string}`> {
  const { sdk, publicClient } = initSomniaStreams()
  const schema =
    'string proposalId, string title, uint256 voteCount, uint256 quorum, string status'
  const schemaId = await sdk.streams.computeSchemaId(schema)

  try {
    const txHash = await sdk.streams.registerDataSchemas(
      [
        {
          id: 'DAOProposal',
          schema,
          parentSchemaId: zeroBytes32 as `0x${string}`,
        },
      ],
      true,
    )

    if (typeof txHash === 'string' && txHash.startsWith('0x')) {
      await waitForTransactionReceipt(publicClient, { hash: txHash as `0x${string}` })
      console.log(`✅ Schema registered or confirmed: ${txHash}`)
    } else if (txHash instanceof Error) {
      console.warn('⚠️ Schema registration returned an error:', txHash.message)
    } else {
      console.log('ℹ️ Schema already registered or no transaction returned.')
    }
  } catch (err) {
    console.error('⚠️ Schema registration failed:', err)
  }

  // ✅ Always return a value of the correct type
  return schemaId as `0x${string}`
}



// -----------------------------
// 🚀 Publish Proposal Event
// -----------------------------
export interface ProposalEvent {
  proposalId: string
  title: string
  voteCount: number
  quorum: number
  status: string
}

export async function publishProposalEvent(
  schemaId: `0x${string}`,
  data: ProposalEvent,
) {
  const { sdk } = initSomniaStreams()
  const encoder = new SchemaEncoder(
    'string proposalId, string title, uint256 voteCount, uint256 quorum, string status',
  )

  const encodedData = encoder.encodeData([
    { name: 'proposalId', value: data.proposalId, type: 'string' },
    { name: 'title', value: data.title, type: 'string' },
    { name: 'voteCount', value: BigInt(data.voteCount), type: 'uint256' },
    { name: 'quorum', value: BigInt(data.quorum), type: 'uint256' },
    { name: 'status', value: data.status, type: 'string' },
  ])

  const streamData = [
    {
      id: toHex(data.proposalId, { size: 32 }) as Hex, // ✅ properly typed
      schemaId,
      data: encodedData,
    },
  ]

  const tx = await sdk.streams.set(streamData)
  console.log(`📤 Published proposal event Tx: ${tx}`)
}

// -----------------------------
// 🔔 Subscribe to Proposal Events
// -----------------------------
export async function subscribeToProposalEvents(
  schemaId: `0x${string}`,
  publisher: `0x${string}`,
  onEvent: (event: ProposalEvent) => void,
) {
  const { sdk } = initSomniaStreams()
  const seen = new Set<string>()

  setInterval(async () => {
    const allData = await sdk.streams.getAllPublisherDataForSchema(
      schemaId,
      publisher,
    )
    if (!allData) return

    allData.forEach((item: any) => {
      if (!Array.isArray(item)) return

      const safeVal = (v: any): string => String(v?.value?.value ?? v?.value ?? '')

      const event: ProposalEvent = {
        proposalId: safeVal(item[0]),
        title: safeVal(item[1]),
        voteCount: Number(safeVal(item[2])),
        quorum: Number(safeVal(item[3])),
        status: safeVal(item[4]),
      }

      const id = `${event.proposalId}-${event.voteCount}`
      if (!seen.has(id)) {
        seen.add(id)
        onEvent(event)
        console.log('🆕 New governance event:', event)
      }
    })
  }, 4000)
}
