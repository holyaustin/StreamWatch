import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const proposalId = searchParams.get('proposalId');
  const voter = searchParams.get('voter');

  if (!proposalId || !voter) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    // Query your database or SDS to check if this voter has already voted on this proposal
    // This is a placeholder - implement based on your data storage
    const response = await fetch(`${process.env.SDS_URL}/votes?proposalId=${proposalId}&voter=${voter}`);
    
    if (!response.ok) {
      return NextResponse.json({ hasVoted: false });
    }

    const votes = await response.json();
    const hasVoted = Array.isArray(votes) && votes.length > 0;

    return NextResponse.json({ hasVoted });
  } catch (error) {
    console.error('Error checking vote:', error);
    return NextResponse.json({ hasVoted: false });
  }
}