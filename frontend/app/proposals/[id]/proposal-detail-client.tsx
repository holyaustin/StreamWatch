"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Shorten wallet address so it doesn’t overflow on small screens
function shorten(addr: string = "") {
  return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}

export default function ProposalDetailClient({ id }: { id: string }) {
  const [proposal, setProposal] = useState<any>(null);
  const router = useRouter();

  async function load() {
    try {
      const res = await fetch("/api/read/proposals", { cache: "no-store" });
      const all = await res.json();
      setProposal(all.find((p: any) => p.proposalId === id) ?? null);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  if (!proposal) return <div className="p-8 text-center">Loading proposal…</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-6">

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Mobile Back Button */}
      <button
        onClick={() => router.back()}
        className="md:hidden mb-4 flex items-center gap-2 text-white bg-blue-600 py-2 px-4 rounded-full shadow active:scale-95"
      >
        <span className="text-lg">←</span> Back
      </button>

        <h1 className="text-2xl sm:text-3xl font-bold break-words">
          {proposal.title}
        </h1>


      </div>

      {/* Proposal Card */}
      <div className="p-4 border rounded-xl text-black bg-gray-50 space-y-3 shadow-sm">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <strong>ID:</strong>
          <span className="mt-1 sm:mt-0 break-all text-sm sm:text-base">
            {proposal.proposalId}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <strong>Proposer:</strong>
          <span className="mt-1 sm:mt-0 text-sm sm:text-base">
            {shorten(proposal.proposer)}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <strong>Status:</strong>
          <span className="mt-1 sm:mt-0">
            {proposal.status ?? "N/A"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <strong>Votes:</strong>
          <span className="mt-1 sm:mt-0">
            {proposal.votes ?? "N/A"}
          </span>
        </div>

      </div>

      {/* View Votes Button */}
      <Link
        href={`/votes/${proposal.proposalId}`}
        className="
          block text-center px-4 py-3 bg-blue-600 
          text-white rounded-lg shadow hover:bg-blue-700 transition
        "
      >
        View Votes
      </Link>
    </div>
  );
}
