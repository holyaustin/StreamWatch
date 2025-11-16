// app/proposals/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeToVotes } from '@/lib/sdsStreamClient';
import { readProposals } from '@/lib/sdsService';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function ProposalDetail({ params }: any) {
  const { id } = params;
  const [proposal, setProposal] = useState<any>(null);
  const [votes, setVotes] = useState<{ timestamp: number; cumulative: number }[]>([]);

  useEffect(() => {
    // load proposal details (fallback to API)
    (async () => {
      try {
        const res = await fetch('/api/read/proposal');
        const all = await res.json();
        setProposal(all.find((p: any) => p.proposalId === id) ?? null);
      } catch (e) { console.error(e); }
    })();
  }, [id]);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let count = 0;

    (async () => {
      unsub = await subscribeToVotes(id, (v) => {
        // increment only for support=true
        if (!v.support) return;
        count++;
        setVotes((prev) => [...prev, { timestamp: v.timestamp || Date.now(), cumulative: count }]);
      });
    })();

    return () => { if (unsub) unsub(); };
  }, [id]);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Proposal {id}</h1>
      {proposal && (
        <div className="mb-6 p-4 border rounded bg-white">
          <div className="text-lg font-semibold">{proposal.title}</div>
          <div className="text-xs text-gray-500">Proposer: {proposal.proposer}</div>
          <div className="text-sm mt-2">Status: {proposal.status} — Votes: {proposal.votes}</div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-2">Live Votes (cumulative)</h2>

      <div className="h-64 bg-white p-3 border rounded">
        {votes.length === 0 ? (
          <div className="text-sm text-gray-500">No votes yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={votes.map(v => ({ time: new Date(v.timestamp * 1000).toLocaleTimeString(), cumulative: v.cumulative }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="cumulative" stroke="#1E3A8A" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
