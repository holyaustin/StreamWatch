import { NextResponse } from "next/server";
import { ensureSchemasRegistered, publishVote } from "@/lib/sdsService";

export async function POST(req: Request) {
  try {
    const { proposalId, voter, support } = await req.json();

    if (!proposalId || !voter || typeof support === "undefined") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await ensureSchemasRegistered();
    const tx = await publishVote(String(proposalId), voter, !!support);

    return NextResponse.json({ tx });
  } catch (err: any) {
    console.error("publish vote error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
