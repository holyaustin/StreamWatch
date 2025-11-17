import { NextResponse } from "next/server";
import { readVotesForProposal } from "@/lib/sdsService";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("proposalId");

  if (!id) return NextResponse.json([]);

  try {
    const votes = await readVotesForProposal(id);
    return NextResponse.json(votes);
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 500 });
  }
}
