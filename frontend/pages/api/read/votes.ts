import type { NextApiRequest, NextApiResponse } from "next";
import { readVotesForProposal } from "../../../lib/sdsService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { proposalId } = req.query;
  if (!proposalId || typeof proposalId !== "string") return res.status(400).json({ error: "proposalId query required" });
  try {
    const votes = await readVotesForProposal(proposalId);
    return res.status(200).json(votes);
  } catch (err: any) {
    console.error("read votes error", err);
    return res.status(500).json({ error: String(err?.message ?? err) });
  }
}
