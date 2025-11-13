'use client';

import { useAccount } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white text-center">
      <h1 className="text-5xl font-bold text-blue-700 mb-6">StreamWatch</h1>
      <p className="text-lg text-gray-600 mb-10 max-w-md">
        Real-time governance dashboard for DAOs powered by Somnia Data Streams.
      </p>
      <ConnectKitButton />
      {isConnected && (
        <div className="mt-6">
          <p className="text-gray-800">Connected as:</p>
          <p className="font-mono text-blue-600">{address}</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
