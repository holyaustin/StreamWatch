'use client';

import { useEffect, useState } from 'react';
import { subscribeToVotes } from '@/lib/sdsStreamClient';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';

export default function VotePage() {
  const { isConnected, address } = useAccount();

  const [proposals, setProposals] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [support, setSupport] = useState<boolean>(true);
  const [liveVotes, setLiveVotes] = useState<any[]>([]);
  const [schemasLoaded, setSchemasLoaded] = useState(false);

  // Load schemas
  useEffect(() => {
    (async () => {
      await fetch("/api/schemas", { cache: "no-store" });
      setSchemasLoaded(true);
    })();
  }, []);

  // Load proposals via API
  useEffect(() => {
    if (!schemasLoaded) return;

    (async () => {
      const res = await fetch("/api/read/proposals");
      const items = await res.json();
      setProposals(items ?? []);
    })();
  }, [schemasLoaded]);

  // Live vote streaming
  useEffect(() => {
    if (!selected || !schemasLoaded) return;

    let unsub: (() => void) | null = null;

    (async () => {
      unsub = await subscribeToVotes(selected, (v) => {
        setLiveVotes((prev) => [...prev, v]);
      });
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [selected, schemasLoaded]);

  async function handleVote() {
    if (!selected || !isConnected) return alert("Connect wallet & select proposal");

    try {
      const res = await fetch("/api/publish/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: selected,
          voter: address,
          support,
        }),
      });

      if (!res.ok) throw new Error("Vote failed");

      alert("Vote submitted!");
    } catch (e) {
      console.error(e);
      alert("Vote failed");
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Cast Vote (Live)</h1>

      {!isConnected && (
        <div className="p-4 bg-yellow-50 border rounded">
          <p className="mb-2">Connect your wallet to vote</p>
          <ConnectKitButton />
        </div>
      )}

      <div className="space-y-3">
        <select
          className="w-full p-3 border rounded"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">-- select proposal --</option>
          {proposals.map((p: any) => (
            <option key={p.proposalId} value={p.proposalId}>
              {p.proposalId} — {p.title}
            </option>
          ))}
        </select>

        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input type="radio" checked={support} onChange={() => setSupport(true)} /> Yes
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={!support} onChange={() => setSupport(false)} /> No
          </label>
        </div>

        <button
          className="w-full py-3 rounded bg-green-600 text-white"
          onClick={handleVote}
        >
          Submit Vote
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mt-6">Live Votes</h2>
        {liveVotes.length === 0 && (
          <p className="text-sm text-gray-500">No live votes yet</p>
        )}
        <div className="space-y-2 mt-3">
          {liveVotes.map((v, i) => (
            <div key={i} className="p-2 border rounded bg-gray-50">
              <div><strong>Voter:</strong> {v.voter}</div>
              <div><strong>Support:</strong> {v.support ? "YES" : "NO"}</div>
              <div className="text-xs text-gray-500">
                {new Date((v.timestamp ?? Date.now()) * 1000).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
