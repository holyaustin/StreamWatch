// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { subscribeToProposals, subscribeToVotes } from '@/lib/sdsStreamClient';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

type Row = { id: string; title: string; proposer: string; votes: number };

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const [rows, setRows] = useState<Row[]>([]);
  const [schemasLoaded, setSchemasLoaded] = useState(false);

  // 🔥 LOAD SCHEMAS FIRST
  useEffect(() => {
    (async () => {
      await fetch("/api/schemas", { cache: "no-store" });
      setSchemasLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!schemasLoaded) return;

    let unsubProposals: (() => void) | null = null;
    let voteUnsubs: Map<string, () => void> = new Map();

    (async () => {
      unsubProposals = await subscribeToProposals((p) => {
        setRows((prev) => {
          const exists = prev.find((r) => r.id === p.proposalId);
          if (exists)
            return prev.map(r =>
              r.id === p.proposalId
                ? { ...r, title: p.title, proposer: p.proposer }
                : r
            );

          const newRow: Row = { id: p.proposalId, title: p.title, proposer: p.proposer, votes: 0 };

          // Subscribe to votes for this proposal
          (async () => {
            const unsubVotes = await subscribeToVotes(p.proposalId, (v) => {
              setRows((old) =>
                old.map(rr =>
                  rr.id === p.proposalId
                    ? { ...rr, votes: rr.votes + (v.support ? 1 : 0) }
                    : rr
                )
              );
            });

            if (typeof unsubVotes === 'function') voteUnsubs.set(p.proposalId, unsubVotes);
          })().catch(console.error);

          return [...prev, newRow];
        });
      });
    })();

    return () => {
      if (unsubProposals) unsubProposals();
      voteUnsubs.forEach((u) => u());
      voteUnsubs.clear();
    };
  }, [schemasLoaded]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Connect wallet to view live governance</h2>
          <ConnectKitButton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">StreamWatch — Live Governance</h1>

      <div className="overflow-auto">
        <BarChart width={800} height={320} data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="id" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="votes" fill="#1E3A8A" />
        </BarChart>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="p-3 border rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{r.title}</div>
                <div className="text-xs text-gray-500">ID: {r.id} • proposer: {r.proposer}</div>
              </div>
              <div className="text-xl font-bold text-blue-800">{r.votes}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
