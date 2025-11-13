# 🛰️ StreamWatch — Real-Time DAO Governance Tracker

StreamWatch — Real-time DAO governance tracker built on **Somnia Data Streams SDK**.

A hackathon-ready demo that shows how Somnia Data Streams can power live proposals and votes in a transparent, on-chain manner. The project uses a single Next.js app (frontend + server API routes) so it can be deployed to **Vercel** as one project.

---

# 🚀 Overview

StreamWatch brings governance transparency to DAOs by providing live updates on proposals and votes using Somnia Data Streams SDK.
Users can connect their wallet, view active proposals, and see vote tallies update as they happen — no page refresh needed.

This project was built for the Somnia Hackathon, highlighting the power of streaming blockchain data in real-time governance.

---

## Features

- Live proposals & vote publishing via Somnia Data Streams SDK  
- Wallet connect using **ConnectKit** + **wagmi** (viem-based RPC)  
- Polling reads for serverless-friendly real-time UI (3500 ms default)  
- Clean blue & white UI with TailwindCSS v3  
- Single deployable Next.js app (pages/api server + app/ UI)

---

## Quick links

- Somnia Docs — Data Streams quickstart and tutorials: https://docs.somnia.network/somnia-data-streams/getting-started/quickstart  
- Somnia On-chain chat tutorial: https://docs.somnia.network/somnia-data-streams/tutorials/build-a-minimal-on-chain-chat-app  
- ConnectKit guide (Somnia): https://docs.somnia.network/developer/building-dapps/wallet-integration-and-auth/authenticating-with-connectkit

---

## Repo layout








# 🛰️ StreamWatch — Real-Time DAO Governance Tracker

Track DAO proposals, votes, and quorum updates in real-time using Somnia Data Streams, powered by Next.js + ConnectKit + Recharts + TailwindCSS.

# 🚀 Overview

StreamWatch brings governance transparency to DAOs by providing live updates on proposals and votes using Somnia Data Streams SDK.
Users can connect their wallet, view active proposals, and see vote tallies update as they happen — no page refresh needed.

This project was built for the Somnia Hackathon, highlighting the power of streaming blockchain data in real-time governance.

# 🧩 Features

- ✅ Real-Time Data: Live proposal and voting updates via Somnia Data Streams
- ✅ Wallet Integration: Seamless wallet connect with ConnectKit
- ✅ On-Chain DAO Governance: Built on the Somnia Testnet
- ✅ Data Visualization: Realtime charts with Recharts
- ✅ Unified Next.js Architecture: Backend API routes and frontend in one deployable app
- ✅ Modern UI: TailwindCSS (Blue/White Theme)

# 🏗️ Tech Stack
- Layer Technology
- Frontend Next.js 14, TailwindCSS v3, Recharts
- Backend Next.js API Routes (Node.js + Somnia SDK)
- Wallet ConnectKit + Wagmi + ethers v6
- Smart Contract Solidity v0.8.30 + Hardhat v2 + Typescript
- Blockchain Somnia Testnet
- Streaming SDK Somnia Data Streams SDK

# ⚙️ Installation & Setup

1. Clone the Repository
   - git clone https://github.com/holyaustin/streamwatch.git
   - cd streamwatch

2. Install Dependencies

# using npm

npm install

# or using yarn

yarn install

3. Environment Variables

Create a .env.local file at the root of your project:

- NEXT_PUBLIC_SOMNIA_API_KEY=your_somnia_api_key
- NEXT_PUBLIC_NETWORK_URL=https://rpc.testnet.somnia.network
- NEXT_PUBLIC_CHAIN_ID=--somnia-chain-id--

If you don’t have an API key, get one from Somnia Developer Dashboard
.

# 🧠 Architecture Overview

streamwatch/
├── contracts/ # Smart Contracts (DAO Governance)
│ ├── DaoGovernance.sol
│ ├── scripts/deploy.ts
│ └── test/dao.test.ts
│
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── page.tsx # Landing Page
│ │ ├── dashboard/page.tsx # Governance Dashboard
│ │ └── api/ # API Routes for backend logic
│ │ ├── proposals/route.ts
│ │ └── stream/route.ts
│ │
│ ├── components/ # Reusable UI components
│ │ ├── Header.tsx
│ │ ├── Footer.tsx
│ │ ├── ProposalCard.tsx
│ │ └── LiveChart.tsx
│ │
│ ├── lib/ # SDK & Utility functions
│ │ └── somnia.ts # Somnia Data Streams SDK setup
│ │
│ └── styles/ # TailwindCSS styling
│ └── globals.css
│
├── hardhat.config.ts # Hardhat Configuration
├── package.json
├── tailwind.config.js
└── README.md

🪄 Run Locally

1. Compile & Deploy Contract (Somnia Testnet)
   - cd contracts
   - npx hardhat compile
   - npx hardhat run scripts/deploy.ts --network somnia-testnet

2. Start the Development Server

# from root

npm run dev

Visit your app at 👉 http://localhost:3000

## 🧰 API Endpoints
Endpoint Description
- /api/stream Establishes real-time Somnia data stream
- /api/proposals Fetches latest DAO proposals
- /api/votes Fetches or subscribes to live vote data

## 📊 Example Dashboard

The live dashboard updates in real-time via Somnia Data Streams:

## 💡 Why StreamWatch?

1. Built for the Somnia Hackathon

2. Demonstrates Somnia Data Streams in a practical, transparent governance use-case

3. Showcases Next.js unified architecture for quick deployment

4. 100% open-source, easy to fork and extend

## 🤝 Contributing

- Want to extend StreamWatch?

- Fork the repo

- Create a new branch (feature/live-quorum)

- Submit a PR

## 🛡️ License

MIT © 2025 [Your Name or Team Name]

## 🧭 Resources

- Somnia Developer Docs

- Somnia Data Streams Quickstart

- ConnectKit Wallet Integration Guide

- Recharts Documentation
