// lib/contract.ts
import { ethers } from "ethers";

export const STREAMWATCH_DAO_ADDRESS = process.env.NEXT_PUBLIC_DAO_ADDRESS || "0x7FF1e2bb4ac07b92b17C5801F109c40504C9955B";

// ABI for the contract above (minimal subset)
export const STREAMWATCH_DAO_ABI = [
  "function createProposal(string proposalId, string title)",
  "function vote(string proposalId, bool support)",
  "event ProposalCreated(string indexed proposalId, string title, address indexed proposer, uint256 timestamp)",
  "event VoteCast(string indexed proposalId, address indexed voter, bool support, uint256 timestamp)"
];

function ensureEthereum() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No injected Ethereum provider found (MetaMask/Wallet).");
  }
}

/**
 * Send createProposal transaction using the connected wallet.
 * Returns the transaction receipt (awaited).
 */
export async function createProposalOnChain(proposalId: string, title: string) {
  ensureEthereum();
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(STREAMWATCH_DAO_ADDRESS, STREAMWATCH_DAO_ABI, signer);

  const tx = await contract.createProposal(proposalId, title);
  // wait for 1 confirmation
  const receipt = await tx.wait();
  return receipt;
}

/**
 * Send vote transaction using connected wallet.
 */
export async function voteOnChain(proposalId: string, support: boolean) {
  ensureEthereum();
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(STREAMWATCH_DAO_ADDRESS, STREAMWATCH_DAO_ABI, signer);

  const tx = await contract.vote(proposalId, support);
  const receipt = await tx.wait();
  return receipt;
}
