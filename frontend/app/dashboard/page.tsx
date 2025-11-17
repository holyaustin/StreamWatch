"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { subscribeToProposals, subscribeToVotes } from "@/lib/sdsStreamClient";
import { useAccount, useBalance } from "wagmi";
import { ConnectKitButton } from "connectkit";

// Charts
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

// --------------------
// Types
// --------------------

type ProposalRow = {
  id: string;
  title: string;
  proposer: string;
  timestamp: number;
  votes: number;
};

type VoteRow = {
  proposalId: string;
  voter: string;
  support: boolean;
  timestamp: number;
};

// Colors for pie chart
const PIE_COLORS = ["#2ecc71", "#e74c3c"];

export default function DashboardPage() {
  const { isConnected, address } = useAccount();

  const { data: balance } = useBalance({
    address,
    watch: true,
  });

  const [schemasLoaded, setSchemasLoaded] = useState(false);

  // Real-time state
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [votes, setVotes] = useState<VoteRow[]>([]);

  // --------------------
  // Load schemas first
  // --------------------
  useEffect(() => {
    (async () => {
      await fetch("/api/schemas", { cache: "no-store" });
      setSchemasLoaded(true);
    })();
  }, []);

  // --------------------
  // Real-time proposals stream
  // --------------------
  useEffect(() => {
    if (!schemasLoaded) return;

    let unsubProposals: (() => void) | null = null;

    (async () => {
      unsubProposals = await subscribeToProposals((p) => {
        setProposals((prev) => {
          const exists = prev.find((x) => x.id === p.proposalId);
          if (!exists) {
            return [
              ...prev,
              {
                id: p.proposalId,
                title: p.title,
                proposer: p.proposer,
                timestamp: Date.now(),
                votes: 0,
              },
            ];
          }
          return prev;
        });
      });
    })();

    return () => {
      if (unsubProposals) unsubProposals();
    };
  }, [schemasLoaded]);

  // --------------------
  // Real-time votes stream
  // --------------------
  useEffect(() => {
    if (!schemasLoaded) return;

    let unsubMap = new Map<string, () => void>();

    proposals.forEach((p) => {
      if (!unsubMap.has(p.id)) {
        (async () => {
          const unsub = await subscribeToVotes(p.id, (v) => {
            setVotes((old) => [...old, { ...v, proposalId: p.id }]);

            // increment vote count live
            setProposals((rows) =>
              rows.map((r) =>
                r.id === p.id
                  ? { ...r, votes: r.votes + (v.support ? 1 : 0) }
                  : r
              )
            );
          });

          unsubMap.set(p.id, unsub);
        })();
      }
    });

    return () => {
      unsubMap.forEach((fn) => fn());
      unsubMap.clear();
    };
  }, [proposals, schemasLoaded]);

  // --------------------
  // Stats
  // --------------------
  const totalProposals = proposals.length;
  const totalVotes = votes.length;
  const yesVotes = votes.filter((v) => v.support).length;
  const noVotes = totalVotes - yesVotes;

  const pieData = [
    { name: "Yes", value: yesVotes },
    { name: "No", value: noVotes },
  ];

  // Line chart for proposals over time
  const proposalTimeline = proposals.map((p) => ({
    name: p.id,
    time: p.timestamp,
  }));

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold mb-4">
            Connect wallet to view the live SDS Governance Dashboard
          </h2>
          <ConnectKitButton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">

      <h1 className="text-4xl font-bold text-blue-800 mb-6">
        StreamWatch — SDS Live Governance Dashboard
      </h1>

      {/* ------------------------- */}
      {/* 2 × 2 GRID */}
      {/* ------------------------- */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* CARD 1 — ACCOUNT DETAILS */}
        <div className="border rounded-xl p-6 bg-white shadow space-y-3">
          <h2 className="text-xl font-semibold">Your Account</h2>
          <p><strong>Address:</strong> {address}</p>
          <p><strong>Balance:</strong> {balance?.formatted} {balance?.symbol}</p>
          <p>
            <strong>Schemas Loaded:</strong>{" "}
            {schemasLoaded ? (
              <span className="text-green-700">Yes</span>
            ) : (
              <span className="text-red-700">No</span>
            )}
          </p>

          <div className="pt-4">
            <h3 className="font-semibold">Navigation</h3>
            <div className="flex flex-col space-y-2 mt-2">
              <Link href="/propose" className="text-blue-700 underline">Create Proposal</Link>
              <Link href="/vote" className="text-blue-700 underline">Vote on Proposal</Link>
              <Link href="/proposals" className="text-blue-700 underline">All Proposals</Link>
              <Link href="/votes" className="text-blue-700 underline">All Votes</Link>
            </div>
          </div>
        </div>

        {/* CARD 2 — HOW TO TEST */}
        <div className="border rounded-xl p-6 bg-white shadow space-y-3">
          <h2 className="text-xl font-semibold">How to Test</h2>

          <ol className="list-decimal ml-5 space-y-2">
            <li>Connect your wallet</li>
            <li>Go to <Link href="/propose" className="underline text-blue-700">/propose</Link></li>
            <li>Create a new proposal</li>
            <li>Go to <Link href="/vote" className="underline text-blue-700">/vote</Link></li>
            <li>Cast YES/NO votes in real-time</li>
            <li>Watch updates appear instantly on this dashboard</li>
          </ol>

          <p className="mt-2 text-gray-500 text-sm">
            Powered by Somnia Data Streams — live, reactive on-chain data.
          </p>
        </div>

        {/* CARD 3 — PROPOSAL CHARTS */}
        <div className="border rounded-xl p-6 bg-white shadow space-y-4">
          <h2 className="text-xl font-semibold">Proposals Overview</h2>
          <p><strong>Total Proposals:</strong> {totalProposals}</p>

          {/* Bar chart */}
          <BarChart width={400} height={250} data={proposals}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="id" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="votes" fill="#1e40af" />
          </BarChart>

          {/* Line chart */}
          <LineChart width={400} height={200} data={proposalTimeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="time" stroke="#2563eb" />
          </LineChart>
        </div>

        {/* CARD 4 — VOTE CHARTS */}
        <div className="border rounded-xl p-6 bg-white shadow space-y-4">
          <h2 className="text-xl font-semibold">Votes Overview</h2>

          <p><strong>Total Votes:</strong> {totalVotes}</p>
          <p><strong>YES:</strong> {yesVotes}</p>
          <p><strong>NO:</strong> {noVotes}</p>

          {/* Pie chart */}
          <PieChart width={300} height={220}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={PIE_COLORS[index]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>

          {/* Votes bar chart */}
          <BarChart width={350} height={220} data={votes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="proposalId" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="support" fill="#16a34a" />
          </BarChart>
        </div>

      </div>
    </div>
  );
}
