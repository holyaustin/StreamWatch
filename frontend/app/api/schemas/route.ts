import { NextResponse } from "next/server";
import { ensureSchemasRegistered } from "@/lib/sdsService";

export async function GET() {
  const { proposalSchemaId, voteSchemaId } = await ensureSchemasRegistered();

  return NextResponse.json({
    proposalSchemaId,
    voteSchemaId,
  });
}
