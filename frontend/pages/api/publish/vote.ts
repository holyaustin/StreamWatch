import type { NextApiRequest, NextApiResponse } from "next";
import { ensureSchemasRegistered, publishVote } from "../../../lib/sdsService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { proposalId, voter, support } = req.body;
  if (!proposalId || !voter || typeof support === "undefined") return res.status(400).json({ error: "Missing fields" });
  try {
    await ensureSchemasRegistered();
    const tx = await publishVote(String(proposalId), voter, !!support);
    return res.status(200).json({ tx });
  } catch (err: any) {
    console.error("publish vote error", err);
    return res.status(500).json({ error: String(err?.message ?? err) });
  }
}
