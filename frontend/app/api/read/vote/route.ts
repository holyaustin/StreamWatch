import { NextResponse } from "next/server";
import { readVotesForProposal } from "@/lib/sdsService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get("proposalId");

    if (!proposalId) return NextResponse.json([]);

    const rows = await readVotesForProposal(proposalId);
    return NextResponse.json(rows ?? []);
  } catch (err: any) {
    if (err?.message?.includes("NoData")) {
      return NextResponse.json([]);
    }
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}
