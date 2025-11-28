import VotesDetailClient from "./VotesDetailClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;   // ✅ unwrap params safely

  return <VotesDetailClient id={id} />;
}
