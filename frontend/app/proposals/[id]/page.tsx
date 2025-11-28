import ProposalDetailClient from "./proposal-detail-client";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ Now allowed

  return <ProposalDetailClient id={id} />;
}
