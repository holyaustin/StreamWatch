"use client";

import { useState, useEffect } from "react";
import { publishProposal, readProposals } from "@/lib/sdsService";

export default function ProposePage() {
  const [proposalId, setProposalId] = useState("");
  const [title, setTitle] = useState("");
  const [proposer, setProposer] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);

  async function loadProposals() {
    try {
      const data = await readProposals();
      setProposals(data);
    } catch (err) {
      console.error("Failed loading proposals:", err);
    }
  }

  useEffect(() => {
    loadProposals();
  }, []);

  async function submitProposal() {
    if (!proposalId || !title || !proposer) return alert("Fill all fields");

    setLoading(true);
    try {
      await publishProposal(proposalId, title, proposer);
      alert("Proposal published!");
      setProposalId("");
      setTitle("");
      setProposer("");
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

      {/* Form */}
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
          placeholder="Title"
          className="w-full p-3 border rounded-xl"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Proposer Address (0x...)"
          className="w-full p-3 border rounded-xl"
          value={proposer}
          onChange={(e) => setProposer(e.target.value)}
        />

        <button
          onClick={submitProposal}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Submitting..." : "Submit Proposal"}
        </button>
      </div>

      {/* List of Proposals */}
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
