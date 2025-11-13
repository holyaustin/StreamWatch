import type { NextApiRequest, NextApiResponse } from "next";
import { readProposals } from "../../../lib/sdsService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const items = await readProposals();
    return res.status(200).json(items);
  } catch (err: any) {
    console.error("read proposals error", err);
    return res.status(500).json({ error: String(err?.message ?? err) });
  }
}
