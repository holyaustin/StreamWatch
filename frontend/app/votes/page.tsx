"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function VotesIndexPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/read/proposals", { cache: "no-store" });
      const items = await res.json();
      setProposals(items ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">All Votes / Proposals</h1>

      {loading && <p>Loading proposals…</p>}

      {!loading && proposals.length === 0 && (
        <p className="text-gray-600">No proposals yet.</p>
      )}

      <div className="space-y-3">
        {proposals.map((p) => (
          <Link href={`/votes/${p.proposalId}`} key={p.proposalId}>
            <div className="border p-4 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <p><strong>ID:</strong> {p.proposalId}</p>
              <p><strong>Title:</strong> {p.title}</p>
              <p><strong>Votes:</strong> {p.votes}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
