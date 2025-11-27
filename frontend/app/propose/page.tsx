"use client";

import { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export default function ProposePage() {
  const { isConnected, address } = useAccount();

  const [proposalId, setProposalId] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const router = useRouter();
  // Shorten wallet address responsively
  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

 async function loadProposals() {
  try {
    const res = await fetch("/api/read/proposals");
    const data = await res.json();

    console.log("📡 RECEIVED PROPOSALS:", data);

    if (!Array.isArray(data) || data.length === 0) {
      setProposals([]);
      return;
    }

    // Extract **ONLY the last (latest) proposal**
    const latest = data[data.length - 1];

    console.log("🔥 LATEST PROPOSAL:", latest);

    setProposals([latest]); // ALWAYS only ONE entry
  } catch (err) {
    console.error("Failed loading proposals:", err);
  }
}


  useEffect(() => {
    loadProposals();
  }, []);

  async function submitProposal() {
    console.log("📝 FORM INPUT BEFORE SUBMIT:", {
      proposalId,
      title,
      proposer: address,
    });

    if (!proposalId || !title || !address)
      return alert("Fill all fields and connect wallet");

    setLoading(true);
    try {
      const body = {
        proposalId,
        title,
        proposer: address,
      };

      console.log("📤 FRONTEND SENDING TO API:", body);

      const res = await fetch("/api/publish/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const out = await res.json();
      console.log("📥 FRONTEND RESPONSE FROM API:", out);

      alert("Proposal published: " + out.tx);
      setProposalId("");
      setTitle("");
      await loadProposals();
    } catch (err) {
      console.error("❌ FRONTEND PUBLISH ERROR:", err);
      alert("Failed to publish proposal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-8 py-2 max-w-2xl mx-auto space-y-8 text-gray-900">
      {/* Mobile Back Button */}
        <button
          onClick={() => router.back()}
          className="
            md:hidden 
            mb-4 
            flex 
            items-center 
            gap-2 
            text-white 
            bg-blue-600 
            py-2 
            px-4 
            rounded-full 
            shadow 
            active:scale-95 
          "
        >
  <span className="text-lg">←</span> Back
</button>

      <h1 className="text-3xl font-bold text-white text-center">Create Proposal</h1>

      {/* Wallet Connection Notice */}
      {!isConnected && (
        <div className="p-4 border rounded-xl bg-yellow-50 text-gray-900">
          <p className="mb-2">Connect your wallet to create proposals</p>
          <ConnectKitButton />
        </div>
      )}

      {/* Form */}
      <div className="space-y-4 p-6 border rounded-xl bg-white shadow text-gray-900">
        <div className="text-sm text-gray-700 mb-2">
          <strong>Connected as:</strong>{" "}
          <span className="font-mono text-blue-700 break-all">
            {shortAddr}
          </span>
        </div>

        <input
          type="text"
          placeholder="Proposal ID"
          className="w-full p-3 border rounded-xl text-gray-900"
          value={proposalId}
          onChange={(e) => setProposalId(e.target.value)}
        />

        <input
          type="text"
          placeholder="Proposal Title"
          className="w-full p-3 border rounded-xl text-gray-900"
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

      {/* LATEST PROPOSAL */}
      <h2 className="text-2xl font-semibold text-white">Latest Proposal</h2>

      {proposals.length === 0 && (
        <p className="text-gray-200">No proposals yet.</p>
      )}

      <div className="space-y-4">
        {proposals.map((p, i) => (
          <div
            key={i}
            className="border rounded-xl p-4 bg-white shadow text-gray-900"
          >
            <p><strong>ID:</strong> {p.proposalId}</p>
            <p><strong>Title:</strong> {p.title}</p>
            <p className="break-all">
              <strong>Proposer:</strong>{" "}
              <span className="font-mono text-blue-700">
                {p.proposer
                  ? `${p.proposer.slice(0, 6)}...${p.proposer.slice(-4)}`
                  : ""}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
