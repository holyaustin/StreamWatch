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
  ResponsiveContainer,   // ⭐ Enables responsive charts
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const proposalSubscribedRef = useRef(false);
  const voteSubMap = useRef<Map<string, () => void>>(new Map());
  const knownVotes = useRef<Set<string>>(new Set());

  /* Load schemas */
  useEffect(() => {
    (async () => {
      await fetch("/api/schemas", { cache: "no-store" });
      setSchemasLoaded(true);
    })();
  }, []);

  /* Live proposals */
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

  /* Live votes */
  useEffect(() => {
    if (!schemasLoaded) return;

    proposals.forEach((p) => {
      if (!p.id || voteSubMap.current.has(p.id)) return;

      (async () => {
        const unsub = await subscribeToVotes(p.id, (v) => {
          const voteKey = `${v.voter}-${v.timestamp}`;
          if (knownVotes.current.has(voteKey)) return;

          knownVotes.current.add(voteKey);

          setVotes((prev) => [
            ...prev,
            {
              proposalId: p.id,
              voter: v.voter,
              support: v.support,
              timestamp: v.timestamp,
            },
          ]);

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

  /* Stats */
  const totalProposals = proposals.length;
  const totalVotes = votes.length;
  const yesVotes = votes.filter((v) => v.support).length;
  const noVotes = votes.filter((v) => !v.support).length;

  const pieData = [
    { name: "Yes", value: yesVotes },
    { name: "No", value: noVotes },
  ];

  const proposalTimeline = proposals.map((p) => ({
    name: p.id,
    time: p.timestamp,
  }));

  /* Require wallet */
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Connect wallet to view the SDS Governance Dashboard
          </h2>
          <ConnectKitButton />
        </div>
      </div>
    );
  }

  /* UI */
  return (
    <div className="min-h-screen p-4 md:p-8 text-white space-y-6">
      {/* NAV */}
      <div className="bg-white text-black shadow rounded-lg p-4 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold">Dashboard</h2>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/propose" className="hover:text-blue-700">Create Proposal</Link>
          <Link href="/vote" className="hover:text-blue-700">Vote</Link>
          <Link href="/proposals" className="hover:text-blue-700">All Proposals</Link>
          <Link href="/votes" className="hover:text-blue-700">All Votes</Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden border px-3 py-1 rounded"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          Menu
        </button>
      </div>

      {/* Mobile Menu */}
{mobileMenuOpen && (
  <div className="md:hidden bg-white text-black rounded-lg p-4 space-y-3 shadow">

    <Link
      href="/propose"
      className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-medium shadow hover:bg-blue-700"
    >
      Create Proposal
    </Link>

    <Link
      href="/vote"
      className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-medium shadow hover:bg-blue-700"
    >
      Vote
    </Link>

    <Link
      href="/proposals"
      className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-medium shadow hover:bg-blue-700"
    >
      All Proposals
    </Link>

    <Link
      href="/votes"
      className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-medium shadow hover:bg-blue-700"
    >
      All Votes
    </Link>

  </div>
)}


      {/* MAIN TITLE (Responsive + Centered) */}
      <h1 className="
        text-2xl
        sm:text-3xl
        md:text-4xl
        font-bold
        text-blue-200
        text-center
        mt-4
      ">
        StreamWatch — SDS Live Governance Dashboard
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ACCOUNT CARD */}
        <div className="border rounded-xl p-6 bg-white shadow space-y-3 text-gray-900">
          <h2 className="text-xl font-semibold">Your Account</h2>

          <p className="break-all text-sm md:text-base">
            <strong>Address:</strong>{" "}
            <span className="font-mono block truncate max-w-full md:max-w-[80%]">
              {address}
            </span>
          </p>

          <p><strong>Balance:</strong> {balance?.formatted} {balance?.symbol}</p>
          <p>
            <strong>Schemas Loaded:</strong>{" "}
            {schemasLoaded ? (
              <span className="text-green-700">Yes</span>
            ) : (
              <span className="text-red-700">No</span>
            )}
          </p>
        </div>

        {/* HOW TO TEST */}
        <div className="border rounded-xl p-6 bg-white shadow space-y-3 text-gray-900">
          <h2 className="text-xl font-semibold">How to Test</h2>
          <ol className="list-decimal ml-5 space-y-2">
            <li>Connect wallet</li>
            <li>Create a proposal</li>
            <li>Vote on any proposal</li>
            <li>Watch live updates instantly</li>
          </ol>
        </div>

        {/* PROPOSAL CHARTS */}
        <div className="border rounded-xl p-6 bg-white shadow space-y-4 text-gray-900">
          <h2 className="text-xl font-semibold">Proposals Overview</h2>
          <p><strong>Total Proposals:</strong> {totalProposals}</p>

          <div className="w-full h-64">
            <ResponsiveContainer>
              <BarChart data={proposals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="votes" fill="#1e40af" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer>
              <LineChart data={proposalTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="time" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* VOTE CHARTS */}
        <div className="border rounded-xl p-6 bg-white shadow space-y-4 text-gray-900">
          <h2 className="text-xl font-semibold">Votes Overview</h2>

          <p><strong>Total Votes:</strong> {totalVotes}</p>
          <p><strong>YES:</strong> {yesVotes}</p>
          <p><strong>NO:</strong> {noVotes}</p>

          <div className="w-full h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer>
              <BarChart data={votes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="proposalId" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="support" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
