"use client";

import React from "react";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useEnsName } from "wagmi";
import { useRouter } from "next/navigation";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Image 
                src="/logo.png" 
                alt="ContentKeyz Logo" 
                width={50} 
                height={32} 
                className="rounded-lg"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ContentKeyz
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Dashboard
                </button>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              Decentralized Content Monetization Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Unlock Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Creative Potential
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create, monetize, and distribute exclusive content using blockchain technology. 
              Own your audience, control your revenue, and build lasting creator-fan relationships.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <ConnectButton />
            {isConnected && (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Go to Dashboard →
              </button>
            )}
          </div>

          {isConnected && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-gray-200 shadow-lg">
              <div className="flex items-center justify-center mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-600">Connected</span>
              </div>
              <p className="text-lg font-semibold text-gray-800 mb-2">
                {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
              </p>
              <p className="text-sm text-gray-500">Ready to create content!</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Image 
                  src="/gate.png" 
                  alt="Gate Icon" 
                  width={32} 
                  height={32} 
                  className="rounded-lg"
                />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Gated Content</h3>
            <p className="text-gray-600">
              Lock your premium content behind crypto payments. Fans unlock access with ETH or tokens.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Image 
                  src="/nftimg.png" 
                  alt="Gate Icon" 
                  width={32} 
                  height={32} 
                  className="rounded-lg"
                />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">NFT Integration</h3>
            <p className="text-gray-600">
              Mint your content as NFTs, creating unique collectibles that fans can own and trade.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Image 
                  src="/decen.png" 
                  alt="Gate Icon" 
                  width={32} 
                  height={32} 
                  className="rounded-lg"
                />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Decentralized</h3>
            <p className="text-gray-600">
              Built on blockchain technology for true ownership, transparency, and censorship resistance.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {!isConnected && (
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to begin your creator journey
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}