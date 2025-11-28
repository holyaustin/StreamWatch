# **StreamWatchDAO — Real-Time Governance Powered by Somnia Data Streams**

### **A Next-Generation DAO with Live Proposal & Voting Powered by SDS**
StreamWatch brings governance transparency to DAOs by providing live updates on proposals and votes using Somnia Data Streams SDK.
Users can connect their wallet, view active proposals, and see vote tallies update as they happen — no page refresh needed.

This project was built for the Somnia Hackathon, highlighting the power of streaming blockchain data in real-time governance.


**Verified DAO Contract:**  
`0x76E02311988b9c61d1FA64BcBb3C8b092834c568`  
_(Somnia Dream Chain — Chain ID 50312)_

---

## 🏆 Hackathon Highlight

**StreamWatchDAO** is a case study demonstrating how **Somnia Data Streams (SDS)** can be used to build **real-time DAO governance** — a use case _not originally listed_ among the recommended SDS integrations.

This project proves that SDS is not limited to gaming, identity, or analytics.  
It can revolutionize **decentralized governance** by providing:

- Instant proposal indexing
- Real-time vote streaming
- Lightning-fast data reads
- A transparent and queryable governance history
- Version-controlled datasets
- A hybrid model combining blockchain security + SDS performance

**This is a new SDS category:  
🟦 Real-Time Decentralized Governance Layer.**

---

# 🚀 What is StreamWatchDAO?

StreamWatchDAO is a **real-time governance dashboard** that merges:

### **1. Somnia Smart Contract Governance**

Handles:

- Proposal creation
- On-chain voting
- Authenticity & security guarantees

### **2. Somnia Data Streams (SDS)**

Offers:

- Real-time indexing
- Lightning-fast reads
- Live vote streaming via subscriptions
- Structured data records
- Version-controlled governance datasets

### **3. Next.js Frontend**

Provides:

- Fully responsive UI
- Live updates without page refresh
- Integrated wallet authentication
- Mobile-first voting interface

---

# 📡 Why SDS Matters for a DAO

### _(Strong justification for judges)_

DAO governance typically suffers from:

| Traditional Problem                       | SDS Solution                               |
| ----------------------------------------- | ------------------------------------------ |
| On-chain reads are slow & expensive       | SDS provides **free, instant reads**       |
| UIs refresh only after block confirmation | SDS streams deliver **live events**        |
| Difficult to index proposal history       | SDS stores **structured & queryable data** |
| Analytics require subgraphs               | SDS schemas act as **built-in indexers**   |
| Hard to reset datasets for demos/testing  | SDS supports **schema versioning**         |

### 💡 SDS is a perfect fit for DAOs:

- Real-time votes
- High-speed queries
- Historical analysis
- Transparent governance
- Accurate UI updates in milliseconds

**StreamWatchDAO demonstrates a new frontier for SDS:  
A real-time, trust-enhanced governance engine.**

---

# 🧠 System Architecture

---

# 📦 Tech Stack

### **Blockchain / Governance**

- Somnia Dream Chain
- Verified DAO contract
- Wallet-based identity

### **Data Layer**

- Somnia Data Streams
- Schema Versioning
- Real-time stream subscriptions

### **Frontend**

- Next.js 14 (App Router)
- TailwindCSS
- Wagmi + WalletKit
- Responsive components

### **Backend**

- Next.js API Routes
- SDS service abstraction
- Automatic schema registration

---

🛠 DAO Smart Contract
Verified on Somnia Dream Network

0x76E02311988b9c61d1FA64BcBb3C8b092834c568

Includes:

Proposal creation

Voting

Execution logic

Events for SDS mirroring

🎯 Why This Project Matters

1. Introduces a new SDS use case: DAO governance

Not originally suggested by Somnia — but fits perfectly.

2. Enhances decentralized decision-making

Real-time transparency = better governance.

3. Proves SDS as a high-speed data indexer

Replaces slow RPC reads and expensive subgraphs.

4. Provides a template for future Somnia-based DAOs

This can evolve into a governance toolkit.

---

## Quick links

- Somnia Docs — Data Streams quickstart and tutorials: https://docs.somnia.network/somnia-data-streams/getting-started/quickstart
- Somnia On-chain chat tutorial: https://docs.somnia.network/somnia-data-streams/tutorials/build-a-minimal-on-chain-chat-app
- ConnectKit guide (Somnia): https://docs.somnia.network/developer/building-dapps/wallet-integration-and-auth/authenticating-with-connectkit

---

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

## ⭐  Conclusion

StreamWatchDAO demonstrates that Somnia Data Streams can transform DAO governance, making it:

- Faster

- More transparent

- More interactive

- More data-driven

- More aligned with real-time communities

This project opens a new category of SDS-powered applications
→ Real-time decentralized governance for Web3 communities.

Made with ❤️ for the Somnia Hackathon.

twitter: @holyaustin
