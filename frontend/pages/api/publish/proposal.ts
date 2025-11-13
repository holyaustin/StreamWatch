import type { NextApiRequest, NextApiResponse } from "next";
import { ensureSchemasRegistered, publishProposal } from "../../../lib/sdsService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { proposalId, title, proposer } = req.body;
  if (!proposalId || !title || !proposer) return res.status(400).json({ error: "Missing fields" });
  try {
    await ensureSchemasRegistered();
    const tx = await publishProposal(String(proposalId), title, proposer);
    return res.status(200).json({ tx });
  } catch (err: any) {
    console.error("publish proposal error", err);
    return res.status(500).json({ error: String(err?.message ?? err) });
  }
}
