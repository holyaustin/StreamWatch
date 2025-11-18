import { NextResponse } from "next/server";
import { readProposals } from "@/lib/sdsService";

export async function GET() {
  try {
    const rows = await readProposals();
    return NextResponse.json(rows ?? []);
  } catch (err: any) {
    if (err?.message?.includes("NoData")) {
      return NextResponse.json([]);
    }
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}
