import { NextResponse } from "next/server";
import { readVotesForProposal, readAllVotes } from "@/lib/sdsService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get("proposalId");

    console.log("📡 READ VOTES API — proposalId:", proposalId || "(ALL)");

    const raw = proposalId
      ? await readVotesForProposal(proposalId)
      : await readAllVotes();

    console.log("📥 RAW SDS VOTES:", raw);

    return NextResponse.json(raw);
  } catch (err: any) {
    console.error("❌ ERROR READING VOTES:", err);
    return NextResponse.json(
      { error: "Failed to read votes", details: err.message },
      { status: 500 }
    );
  }
}
