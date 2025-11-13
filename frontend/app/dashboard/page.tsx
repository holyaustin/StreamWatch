'use client';

import { useEffect, useState } from 'react';
import { subscribeToProposals } from '@/lib/sdsService';
import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface Proposal {
  id: string;
  proposer: string;
  votes: number;
}

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToProposals((data) => {
      setProposals((prev) => [
        ...prev,
        { id: data.id, proposer: data.proposer, votes: data.votes || 0 },
      ]);
    });
    return () => unsubscribe();
  }, []);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-3xl mb-4">Please connect your wallet</h2>
        <ConnectKitButton />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6 text-blue-900">DAO Live Governance</h1>
      <BarChart width={600} height={300} data={proposals}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="id" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="votes" fill="#1E3A8A" />
      </BarChart>

      <p className="mt-8 text-gray-600">
        Connected as <span className="font-mono">{address}</span>
      </p>
    </div>
  );
}
