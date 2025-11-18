import { NextResponse } from "next/server";
import { ensureSchemasRegistered, publishProposal } from "@/lib/sdsService";

export async function POST(req: Request) {
  try {
    const { proposalId, title, proposer } = await req.json();

    if (!proposalId || !title || !proposer) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await ensureSchemasRegistered();

    const tx = await publishProposal(String(proposalId), title, proposer);
    return NextResponse.json({ tx });
  } catch (err: any) {
    console.error("publish proposal error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
