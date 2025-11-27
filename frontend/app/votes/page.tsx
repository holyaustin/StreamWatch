"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function shorten(addr: string = "") {
  return addr.length > 10 ? `${addr.slice(0,6)}...${addr.slice(-4)}` : addr;
}

export default function AllVotesPage() {
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function load() {
    try {
      const res = await fetch("/api/read/vote");
      const data = await res.json();

      setVotes(
        data.sort(
          (a: any, b: any) => (b.timestamp ?? 0) - (a.timestamp ?? 0)
        )
      );
    } catch (err) {
      console.error("Failed to load votes:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="px-6 py-4 max-w-3xl mx-auto text-gray-100 space-y-6">

      {/* Back button mobile */}
      <button
        onClick={() => router.back()}
        className="md:hidden flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-center">All Votes</h1>

      {loading && <p className="text-gray-300 text-center">Loading...</p>}

      {!loading && votes.length === 0 && (
        <p className="text-gray-300 text-center">No votes recorded yet.</p>
      )}

      <div className="space-y-4">
        {votes.map((v: any, i: number) => (
          <div
            key={i}
            className="p-4 bg-white text-gray-900 rounded-xl shadow border"
          >
            <p>
              <strong>Proposal:</strong> {v.proposalId}
            </p>

            <p className="mt-1">
              <strong>Voter:</strong> {shorten(v.voter)}
            </p>

            <p className="mt-1">
              <strong>Support:</strong>{" "}
              <span className={v.support ? "text-green-700" : "text-red-600"}>
                {v.support ? "YES" : "NO"}
              </span>
            </p>

            <p className="text-xs text-gray-500 mt-2">
              {new Date((v.timestamp ?? Date.now()) * 1000).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
