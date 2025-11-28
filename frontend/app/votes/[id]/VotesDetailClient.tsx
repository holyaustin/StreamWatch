"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/** Helper: shorten wallet address */
function shorten(addr: string = "") {
  return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}

export default function VotesDetailClient({ id }: { id: string }) {
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
  }, [id]);

  return (
    <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto space-y-6 text-gray-900">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-gray-200 text-2xl md:text-3xl font-bold break-words">
          Votes for {id}
        </h1>

        <Link
          href="/votes"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 active:scale-95 text-center"
        >
          Back
        </Link>
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-600">Loading votes…</p>}

      {/* Empty State */}
      {!loading && votes.length === 0 && (
        <p className="text-gray-600">No votes found for this proposal.</p>
      )}

      {/* Vote Cards */}
      <div className="space-y-4">
        {votes.map((v, i) => (
          <div
            key={i}
            className="
              p-4 
              border 
              rounded-xl 
              bg-white 
              shadow-sm 
              text-gray-800
              break-words 
              overflow-hidden
            "
          >
            <p className="text-sm">
              <strong>Voter:</strong> <span className="font-mono">{shorten(v.voter)}</span>
            </p>

            <p className="text-sm">
              <strong>Support:</strong>{" "}
              <span className={v.support ? "text-green-600" : "text-red-600"}>
                {v.support ? "YES" : "NO"}
              </span>
            </p>

            <p className="text-sm">
              <strong>Timestamp:</strong>{" "}
              {new Date(v.timestamp * 1000).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
