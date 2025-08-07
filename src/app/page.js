"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useEnsName } from "wagmi";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
        Welcome to ContentKeyz
      </h1>

      <p className="text-gray-600 text-center mb-6 max-w-md">
        Own your identity. Connect your wallet to authenticate as a creator.
      </p>

      <div className="mb-4">
        <ConnectButton />
      </div>

      {isConnected && (
        <div className="mt-6 text-center">
          <p className="text-lg text-gray-700 font-semibold">
            Signed in as: {ensName ? ensName : address}
          </p>
        </div>
      )}
    </main>
  );
}