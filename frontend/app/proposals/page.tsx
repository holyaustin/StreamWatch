"use client";

import { useEffect, useState } from "react";
import { readProposals } from "@/lib/sdsService";
import Link from "next/link";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    readProposals().then(setProposals);
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">All Proposals</h1>

      {proposals.length === 0 && <p>No proposals found.</p>}

      <div className="space-y-4">
        {proposals.map((p, i) => (
          <Link href={`/proposals/${p.proposalId}`} key={i}>
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
