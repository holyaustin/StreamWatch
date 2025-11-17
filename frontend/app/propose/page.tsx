"use client";

import { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";

export default function ProposePage() {
  const { isConnected, address } = useAccount();

  const [proposalId, setProposalId] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);

  async function loadProposals() {
    try {
      const res = await fetch("/api/read/proposals");
      const data = await res.json();
      setProposals(data);
    } catch (err) {
      console.error("Failed loading proposals:", err);
    }
  }

  useEffect(() => {
    loadProposals();
  }, []);

  async function submitProposal() {
    if (!proposalId || !title || !address)
      return alert("Fill all fields and connect wallet");

    setLoading(true);
    try {
      const res = await fetch("/api/publish/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          title,
          proposer: address,
        }),
      });

      const out = await res.json();

      alert("Proposal published: " + out.tx);
      setProposalId("");
      setTitle("");
      await loadProposals();
    } catch (err) {
      console.error(err);
      alert("Failed to publish proposal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Create Proposal</h1>

      {!isConnected && (
        <div className="p-4 border rounded bg-yellow-50">
          <p className="mb-2">Connect your wallet to create proposals</p>
          <ConnectKitButton />
        </div>
      )}

      <div className="space-y-4 p-6 border rounded-xl bg-white shadow">
        <input
          type="text"
          placeholder="Proposal ID"
          className="w-full p-3 border rounded-xl"
          value={proposalId}
          onChange={(e) => setProposalId(e.target.value)}
        />

        <input
          type="text"
          placeholder="Proposal Title"
          className="w-full p-3 border rounded-xl"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button
          onClick={submitProposal}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Submitting..." : "Publish Proposal"}
        </button>
      </div>

      <h2 className="text-2xl font-semibold">Existing Proposals</h2>

      {proposals.length === 0 && (
        <p className="text-gray-600">No proposals yet.</p>
      )}

      <div className="space-y-4">
        {proposals.map((p, i) => (
          <div
            key={i}
            className="border rounded-xl p-4 bg-gray-50 shadow-sm"
          >
            <p><strong>ID:</strong> {p.proposalId}</p>
            <p><strong>Title:</strong> {p.title}</p>
            <p><strong>Proposer:</strong> {p.proposer}</p>
            <p><strong>Status:</strong> {p.status}</p>
            <p><strong>Votes:</strong> {p.votes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
