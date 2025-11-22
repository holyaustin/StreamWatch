import { NextResponse } from "next/server";
import { publishVote } from "@/lib/sdsService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📥 API RECEIVED VOTE BODY:", body);

    const proposalId = typeof body.proposalId === "string"
      ? body.proposalId
      : body.proposalId?.proposalId || "";

    const voter = body.voter;
    const support = !!body.support;

    console.log("📦 CLEANED VOTE FIELDS:", {
      proposalId,
      voter,
      support,
    });

    const tx = await publishVote(proposalId, voter, support);

    return NextResponse.json({ tx });
  } catch (err: any) {
    console.error("❌ ERROR IN VOTE API:", err);
    return NextResponse.json(
      { error: "Vote publish failed", details: err.message },
      { status: 500 }
    );
  }
}
