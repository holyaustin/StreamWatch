"use client";

import { useEffect, useState } from "react";
import { readVotesForProposal } from "@/lib/sdsService";

export default function VotesPage({ params }: any) {
  const { id } = params;
  const [votes, setVotes] = useState<any[]>([]);

  useEffect(() => {
    readVotesForProposal(id).then(setVotes);
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Votes for {id}</h1>

      {votes.length === 0 && <p>No votes found.</p>}

      <div className="space-y-4">
        {votes.map((v, i) => (
          <div key={i} className="border p-4 rounded-xl bg-gray-50">
            <p><strong>Voter:</strong> {v.voter}</p>
            <p><strong>Support:</strong> {v.support ? "YES" : "NO"}</p>
            <p><strong>Timestamp:</strong> {new Date(v.timestamp * 1000).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
