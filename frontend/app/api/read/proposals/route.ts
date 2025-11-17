import { NextResponse } from "next/server";
import { readProposals } from "@/lib/sdsService";

export async function GET() {
  try {
    const rows = await readProposals();
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 500 });
  }
}
