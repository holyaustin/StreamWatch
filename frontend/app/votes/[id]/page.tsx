"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function VotesDetailPage({ params }: any) {
  const id = params.id;
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/read/vote?proposalId=${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      const items = await res.json();
      setVotes(items ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [id]);

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Votes for {id}</h1>
        <Link href="/votes" className="px-3 py-2 bg-gray-200 rounded">
          Back
        </Link>
      </div>

      {loading && <p>Loading votes…</p>}

      {!loading && votes.length === 0 && (
        <p>No votes found for this proposal.</p>
      )}

      <div className="space-y-4">
        {votes.map((v, i) => (
          <div key={i} className="p-4 border rounded-xl bg-gray-50">
            <p><strong>Voter:</strong> {v.voter}</p>
            <p><strong>Support:</strong> {v.support ? "YES" : "NO"}</p>
            <p><strong>Timestamp:</strong> {new Date(v.timestamp * 1000).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
