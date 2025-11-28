"use client";

import { useEffect, useState } from "react";
import { subscribeToVotes } from "@/lib/sdsStreamClient";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { voteOnChain } from "@/lib/contract";

function shorten(addr: string = "") {
  return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}

export default function VotePage() {
  const { isConnected, address } = useAccount();

  const [proposals, setProposals] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [support, setSupport] = useState<boolean>(true);
  const [latestVote, setLatestVote] = useState<any | null>(null);
  const [schemasLoaded, setSchemasLoaded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [checkingVoteStatus, setCheckingVoteStatus] = useState(false);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      await fetch("/api/schemas", { cache: "no-store" });
      setSchemasLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!schemasLoaded) return;
    (async () => {
      const res = await fetch("/api/read/proposals");
      setProposals(await res.json());
    })();
  }, [schemasLoaded]);

  // Check if user has already voted when address or selected proposal changes
  useEffect(() => {
    if (!address || !selected || !schemasLoaded) {
      setHasVoted(false);
      return;
    }

    const checkExistingVote = async () => {
      setCheckingVoteStatus(true);
      try {
        const res = await fetch(`/api/check-vote?proposalId=${selected}&voter=${address}`);
        if (res.ok) {
          const data = await res.json();
          setHasVoted(data.hasVoted);
        } else {
          setHasVoted(false);
        }
      } catch (error) {
        console.error("Error checking vote status:", error);
        setHasVoted(false);
      } finally {
        setCheckingVoteStatus(false);
      }
    };

    checkExistingVote();
  }, [address, selected, schemasLoaded]);

  useEffect(() => {
    if (!selected || !schemasLoaded) return;

    let unsub: (() => void) | undefined;

    (async () => {
      unsub = await subscribeToVotes(selected, (v) => {
        setLatestVote(v);
        // If the latest vote is from the current user, update hasVoted status
        if (v.voter?.toLowerCase() === address?.toLowerCase()) {
          setHasVoted(true);
        }
      });
    })();

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [selected, schemasLoaded, address]);

  async function handleVote() {
    if (!selected || !isConnected)
      return toast.error("Connect wallet & select proposal");

    if (hasVoted) {
      return toast.error("You have already voted on this proposal");
    }

    try {
      toast.loading("Submitting on-chain vote…");
      const receipt = await voteOnChain(selected, support);
      toast.dismiss();
      toast.success("Vote confirmed on-chain!");

      toast.loading("Saving vote to SDS…");
      const res = await fetch("/api/publish/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: selected, voter: address, support }),
      });

      if (!res.ok) {
        toast.dismiss();
        toast.error("SDS storage failed");
        return;
      }

      toast.dismiss();
      toast.success("Vote successfully stored in SDS!");
      setHasVoted(true);
    } catch (err: any) {
      toast.dismiss();
      toast.error(err?.message || "Vote failed");
    }
  }

  return (
    <div className="px-8 py-2 max-w-2xl mx-auto space-y-6 text-gray-100">

      <button
        onClick={() => router.back()}
        className="md:hidden mb-4 flex items-center gap-2 text-white bg-blue-600 py-2 px-4 rounded-full shadow active:scale-95"
      >
        <span className="text-lg">←</span> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-100 text-center">Cast Vote (Live)</h1>

      {!isConnected && (
        <div className="p-4 bg-yellow-50 border rounded">
          <p className="mb-2">Connect your wallet to vote</p>
          <ConnectKitButton />
        </div>
      )}

      <div className="space-y-3 p-6 bg-white shadow rounded-xl border text-gray-900">

        {address && (
          <p className="text-sm text-gray-700">
            <strong>Your Wallet:</strong> {shorten(address)}
          </p>
        )}

        {/* Select Proposal */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full p-3 border rounded bg-white text-left text-gray-900"
          >
            {selected
              ? proposals.find((p) => p.proposalId === selected)?.title
              : "-- select a proposal --"}
          </button>

          {dropdownOpen && (
            <div className="absolute mt-1 w-full max-h-60 overflow-y-auto bg-white border rounded shadow-lg z-50 p-2">
              {proposals.map((p: any) => (
                <div
                  key={p.proposalId}
                  onClick={() => {
                    setSelected(p.proposalId);
                    setDropdownOpen(false);
                  }}
                  className="p-2 rounded hover:bg-blue-100 cursor-pointer break-words whitespace-normal"
                >
                  <strong>{p.proposalId}</strong> — {p.title}
                </div>
              ))}

              {proposals.length === 0 && (
                <p className="text-gray-500 p-2 text-sm">No proposals available</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center text-gray-900">
          <label className="flex items-center gap-2">
            <input type="radio" checked={support} onChange={() => setSupport(true)} /> Yes
          </label>

          <label className="flex items-center gap-2">
            <input type="radio" checked={!support} onChange={() => setSupport(false)} /> No
          </label>
        </div>

        {hasVoted && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            You have already voted on this proposal
          </div>
        )}

        <button 
          className={`w-full py-3 rounded text-white ${
            hasVoted 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`} 
          onClick={handleVote}
          disabled={hasVoted || checkingVoteStatus}
        >
          {checkingVoteStatus ? 'Checking vote status...' : 
           hasVoted ? 'Already Voted' : 'Submit Vote (on-chain → SDS)'}
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-100">Latest Vote</h2>

        {!latestVote && <p className="text-sm text-gray-300">No live votes yet</p>}

        {latestVote && (
          <div className="p-4 border rounded bg-gray-50 text-gray-900 shadow-sm mt-3">
            <div><strong>Voter:</strong> {shorten(latestVote.voter)}</div>
            <div><strong>Support:</strong> {latestVote.support ? "YES" : "NO"}</div>
            <div className="text-xs text-gray-500">
              {new Date((latestVote.timestamp ?? Date.now()) * 1000).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}