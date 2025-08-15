"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount, usePublicClient } from "wagmi";
import { ethers } from "ethers";
import { usePurchaseContent } from '@/hooks/usePurchasesContent';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "YOUR_CONTRACT_ADDRESS";

const ABI = [
  'function getCreatorStats(address) view returns (tuple(uint256 totalEarnings, uint256 totalSales, uint256 activeContent, uint256 lifetimeEarnings))',
  'function getUserContent(address) view returns (uint256[])',
  'function getContent(uint256) view returns (tuple(uint256 id, string title, string description, uint8 contentType, string ipfsHash, string embedUrl, uint256 price, address creator, bool isActive, uint256 createdAt, string previewHash, uint256 totalEarnings, uint256 totalSales))',
  'function hasAccess(address, uint256) view returns (bool)',
  'function purchaseAccess(uint256) payable returns (uint256)',
];

export default function CreatorProfile() {
  const params = useParams();
  const { address: userAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [creatorAddress, setCreatorAddress] = useState(null);
  const [creatorStats, setCreatorStats] = useState(null);
  const [creatorContent, setCreatorContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const resolveCreator = async () => {
      try {
        setLoading(true);
        const creatorName = params.creatorname;
        
        // Try to resolve if it's an ENS name, otherwise treat as address
        let resolvedAddress;
        if (creatorName.endsWith('.eth')) {
          // Resolve ENS name
          resolvedAddress = await publicClient.getEnsAddress({ name: creatorName });
        } else if (ethers.isAddress(creatorName)) {
          resolvedAddress = creatorName;
        } else {
          // For non-ENS names, show a helpful error
          throw new Error(`"${creatorName}" is not a valid ENS name or address. Try using name.eth or a wallet address.`);
        }

        setCreatorAddress(resolvedAddress);
      } catch (err) {
        setError("Creator not found");
        setLoading(false);
      }
    };

    if (params.creatorname) {
      resolveCreator();
    }
  }, [params.creatorname, publicClient]);

  // Fetch creator data
  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!creatorAddress || !publicClient) return;

      try {
        const contract = {
          address: CONTRACT_ADDRESS,
          abi: ABI,
        };

        // Get creator stats
        const stats = await publicClient.readContract({
          ...contract,
          functionName: 'getCreatorStats',
          args: [creatorAddress],
        });

        setCreatorStats({
          totalEarnings: stats[0],
          totalSales: stats[1],
          activeContent: stats[2],
          lifetimeEarnings: stats[3],
        });

        // Get creator's content IDs
        const contentIds = await publicClient.readContract({
          ...contract,
          functionName: 'getUserContent',
          args: [creatorAddress],
        });

        // Fetch detailed content info
        const contentDetails = await Promise.all(
          contentIds.map(async (id) => {
            const content = await publicClient.readContract({
              ...contract,
              functionName: 'getContent',
              args: [id],
            });

            let hasUserAccess = false;
            if (isConnected && userAddress) {
              hasUserAccess = await publicClient.readContract({
                ...contract,
                functionName: 'hasAccess',
                args: [userAddress, id],
              });
            }

            return {
              id: content[0],
              title: content[1],
              description: content[2],
              contentType: content[3],
              ipfsHash: content[4],
              embedUrl: content[5],
              price: content[6],
              creator: content[7],
              isActive: content[8],
              createdAt: content[9],
              previewHash: content[10],
              totalEarnings: content[11],
              totalSales: content[12],
              hasAccess: hasUserAccess,
            };
          })
        );

        setCreatorContent(contentDetails.filter(content => content.isActive));
        setLoading(false);
      } catch (err) {
        setError("Failed to load creator data");
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [creatorAddress, publicClient, isConnected, userAddress]);

  const formatEther = (wei) => {
    return ethers.formatEther(wei.toString());
  };

  const getContentTypeLabel = (type) => {
    const types = ['PDF', 'VIDEO', 'ZIP', 'AUDIO', 'IMAGE', 'YOUTUBE', 'TWITTER', 'NOTION', 'OTHER'];
    return types[type] || 'UNKNOWN';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">ContentKeyz</h1>
            <div className="text-sm text-gray-500">
              unlockr.xyz/{params.creatorname}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Creator Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {params.creatorname}
              </h1>
              <p className="text-gray-600 text-sm font-mono">
                {creatorAddress}
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center md:text-right">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {creatorStats?.totalSales?.toString() || '0'}
                </div>
                <div className="text-sm text-gray-500">Supporters</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {creatorStats?.activeContent?.toString() || '0'}
                </div>
                <div className="text-sm text-gray-500">Content Items</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatEther(creatorStats?.lifetimeEarnings || 0)} ETH
                </div>
                <div className="text-sm text-gray-500">Lifetime Earnings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Locked Content</h2>
          
          {creatorContent.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No content available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creatorContent.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  hasAccess={content.hasAccess}
                  userAddress={userAddress}
                  isConnected={isConnected}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentCard({ content, hasAccess, userAddress, isConnected }) {
  const { purchaseContent, purchasing, isSuccess } = usePurchaseContent();

  const handlePurchase = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      await purchaseContent(content.id, formatEther(content.price));
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed: " + error.message);
    }
  };

  const formatEther = (wei) => {
    return ethers.formatEther(wei.toString());
  };

  const getContentTypeLabel = (type) => {
    const types = ['PDF', 'VIDEO', 'ZIP', 'AUDIO', 'IMAGE', 'YOUTUBE', 'TWITTER', 'NOTION', 'OTHER'];
    return types[type] || 'UNKNOWN';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Preview Image */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-2">🔒</div>
          <div className="text-sm font-medium">
            {getContentTypeLabel(content.contentType)}
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {content.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {content.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-green-600">
            {formatEther(content.price)} ETH
          </div>
          <div className="text-sm text-gray-500">
            {content.totalSales.toString()} sold
          </div>
        </div>

        {hasAccess ? (
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium">
            ✓ Unlocked
          </button>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            {purchasing ? "Purchasing..." : "Unlock Content"}
          </button>
        )}
      </div>
    </div>
  );
}
