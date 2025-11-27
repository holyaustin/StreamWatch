"use client";

import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  // Auto redirect when wallet connects
  useEffect(() => {
    if (isConnected) router.push("/dashboard");
  }, [isConnected, router]);

  return (
    <div
      className="
        min-h-screen w-full
        flex flex-col items-center justify-center
        px-6 text-center text-white
        bg-gradient-to-b from-black via-[#0b1a33] to-black
      "
    >
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
        StreamWatch DAO
      </h1>

      <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-md">
        Real-time governance analytics powered by Somnia Data Streams.
      </p>

      {!isConnected && (
        <div className="scale-110">
          <ConnectKitButton />
        </div>
      )}

      {isConnected && (
        <div className="mt-6">
          <p className="text-gray-400 text-sm">Connected as:</p>
          <p className="font-mono text-green-400">{address}</p>
        </div>
      )}
    </div>
  );
}
