"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProposalDetailPage({ params }: any) {
  const id = params.id;
  const [proposal, setProposal] = useState<any>(null);

  async function load() {
    try {
      const res = await fetch("/api/read/proposals");
      const all = await res.json();
      setProposal(all.find((p: any) => p.proposalId === id) ?? null);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  if (!proposal) return <div className="p-8">Loading proposal…</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">{proposal.title}</h1>
        <Link href="/proposals" className="px-3 py-2 bg-gray-200 rounded">Back</Link>
      </div>

      <div className="p-4 border rounded-xl bg-gray-50 space-y-2">
        <p><strong>ID:</strong> {proposal.proposalId}</p>
        <p><strong>Proposer:</strong> {proposal.proposer}</p>
        <p><strong>Status:</strong> {proposal.status}</p>
        <p><strong>Votes:</strong> {proposal.votes}</p>
      </div>

      <Link
        href={`/votes/${proposal.proposalId}`}
        className="px-3 py-2 bg-blue-600 text-white rounded"
      >
        View Votes
      </Link>
    </div>
  );
}
