import { NextResponse } from "next/server";
import { ensureSchemasRegistered, publishProposal } from "@/lib/sdsService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📥 API RECEIVED BODY:", body);

    const { proposalId, title, proposer } = body;

    console.log("📦 EXTRACTED FIELDS:", { proposalId, title, proposer });

    if (!proposalId || !title || !proposer) {
      console.error("❌ API ERROR: Missing fields:", body);
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await ensureSchemasRegistered();

    console.log("🚀 CALLING publishProposal() WITH:", {
      proposalId,
      title,
      proposer,
    });

    const tx = await publishProposal(String(proposalId), title, proposer);

    console.log("✅ TX RETURNED FROM publishProposal:", tx);

    return NextResponse.json({ tx });
  } catch (err: any) {
    console.error("❌ publish proposal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
