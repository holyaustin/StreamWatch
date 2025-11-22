"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { subscribeToProposals, subscribeToVotes } from "@/lib/sdsStreamClient";
import { useAccount, useBalance } from "wagmi";
import { ConnectKitButton } from "connectkit";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const PIE_COLORS = ["#2ecc71", "#e74c3c"];

export default function DashboardPage() {
  const { isConnected, address } = useAccount();

  const { data: balance } = useBalance({
    address,
    query: { refetchInterval: 5000 },
  });

  const [schemasLoaded, setSchemasLoaded] = useState(false);

  const [proposals, setProposals] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);

  /** 
   * 🔥 Persistent Maps to prevent repeated subscription setup 
   */
  const proposalSubscribedRef = useRef(false);
  const voteSubMap = useRef<Map<string, () => void>>(new Map());
  const knownVotes = useRef<Set<string>>(new Set()); // Deduplicate

  /* -----------------------------------------
     LOAD SCHEMAS FIRST
  ----------------------------------------- */
  useEffect(() => {
    (async () => {
      await fetch("/api/schemas", { cache: "no-store" });
      setSchemasLoaded(true);
    })();
  }, []);

  /* -----------------------------------------
     REAL-TIME PROPOSALS STREAM
     Subscribe ONCE ONLY
  ----------------------------------------- */
  useEffect(() => {
    if (!schemasLoaded || proposalSubscribedRef.current) return;

    (async () => {
      proposalSubscribedRef.current = true;

      await subscribeToProposals((p) => {
        if (!p.proposalId) return;

        setProposals((prev) => {
          if (prev.some((x) => x.id === p.proposalId)) return prev;
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
        });
      });
    })();
  }, [schemasLoaded]);

  /* -----------------------------------------
     REAL-TIME VOTES STREAM
     Each proposal gets ONE subscription only
     Deduplication prevents repeated votes being added
  ----------------------------------------- */
  useEffect(() => {
    if (!schemasLoaded) return;

    proposals.forEach((p) => {
      if (!p?.id) return;

      if (!voteSubMap.current.has(p.id)) {
        (async () => {
          const unsub = await subscribeToVotes(p.id, (v) => {
            const voteKey = `${v.voter}-${v.timestamp}`;

            // Prevent duplicate votes (SDS replays history)
            if (knownVotes.current.has(voteKey)) return;
            knownVotes.current.add(voteKey);

            // Add vote to list
            setVotes((prev) => [
              ...prev,
              {
                proposalId: p.id,
                voter: v.voter,
                support: v.support,
                timestamp: v.timestamp,
              },
            ]);

            // Update proposal vote count
            setProposals((prev) =>
              prev.map((row) =>
                row.id === p.id
                  ? { ...row, votes: row.votes + (v.support ? 1 : 0) }
                  : row
              )
            );
          });

          voteSubMap.current.set(p.id, unsub);
        })();
      }
    });

    return () => {
      for (const fn of voteSubMap.current.values()) {
        try {
          fn();
        } catch {}
      }
      voteSubMap.current.clear();
    };
  }, [schemasLoaded, proposals]);

  /* -----------------------------------------
     STATS
  ----------------------------------------- */
  const totalProposals = proposals.length;
  const totalVotes = votes.length;

  const yesVotes = votes.filter((v) => v.support === true).length;
  const noVotes = votes.filter((v) => v.support === false).length;

  const pieData = [
    { name: "Yes", value: yesVotes },
    { name: "No", value: noVotes },
  ];

  const proposalTimeline = proposals.map((p) => ({
    name: p.id,
    time: p.timestamp,
  }));

  /* -----------------------------------------
     REQUIRE WALLET CONNECTION
  ----------------------------------------- */
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold mb-4">
            Connect wallet to view the SDS Governance Dashboard
          </h2>
          <ConnectKitButton />
        </div>
      </div>
    );
  }

  /* -----------------------------------------
     UI
  ----------------------------------------- */
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">
        StreamWatch — SDS Live Governance Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ACCOUNT CARD */}
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

        {/* HOW TO TEST */}
        <div className="border rounded-xl p-6 bg-white shadow space-y-3">
          <h2 className="text-xl font-semibold">How to Test</h2>
          <ol className="list-decimal ml-5 space-y-2">
            <li>Connect wallet</li>
            <li>Create a proposal</li>
            <li>Vote on any proposal</li>
            <li>Watch live updates instantly</li>
          </ol>
        </div>

        {/* PROPOSALS STATS */}
        <div className="border rounded-xl p-6 bg-white shadow space-y-4">
          <h2 className="text-xl font-semibold">Proposals Overview</h2>
          <p><strong>Total Proposals:</strong> {totalProposals}</p>

          <BarChart width={400} height={250} data={proposals}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="id" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="votes" fill="#1e40af" />
          </BarChart>

          <LineChart width={400} height={200} data={proposalTimeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="time" stroke="#2563eb" />
          </LineChart>
        </div>

        {/* VOTES STATS */}
        <div className="border rounded-xl p-6 bg-white shadow space-y-4">
          <h2 className="text-xl font-semibold">Votes Overview</h2>
          <p><strong>Total Votes:</strong> {totalVotes}</p>
          <p><strong>YES:</strong> {yesVotes}</p>
          <p><strong>NO:</strong> {noVotes}</p>

          <PieChart width={300} height={220}>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
              {pieData.map((entry, index) => (
                <Cell key={index} fill={PIE_COLORS[index]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>

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
