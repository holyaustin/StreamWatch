import { NextResponse } from "next/server";
import { readVotesForProposal } from "@/lib/sdsService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get("proposalId") || "";

    console.log("📡 READ VOTES FOR:", proposalId);

    const votes = await readVotesForProposal(proposalId);

    console.log("📊 VOTES RETURNED:", votes);

    return NextResponse.json(votes);
  } catch (err: any) {
    console.error("❌ ERROR READING VOTES:", err);
    return NextResponse.json(
      { error: "Failed to read votes", details: err.message },
      { status: 500 }
    );
  }
}
