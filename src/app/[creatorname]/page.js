"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount, usePublicClient, useEnsName, useEnsAddress } from "wagmi";
import { ethers } from "ethers";
import { usePurchaseContent } from '@/hooks/usePurchasesContent';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import ContentModal from '../components/ContentModal';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const ABI = [
  {
    inputs: [],
    name: 'getTotalContent',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_contentId', type: 'uint256' }],
    name: 'getContent',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'string', name: 'title', type: 'string' },
          { internalType: 'string', name: 'description', type: 'string' },
          { internalType: 'uint8', name: 'contentType', type: 'uint8' },
          { internalType: 'string', name: 'ipfsHash', type: 'string' },
          { internalType: 'string', name: 'embedUrl', type: 'string' },
          { internalType: 'uint256', name: 'price', type: 'uint256' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
          { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
          { internalType: 'string', name: 'previewHash', type: 'string' },
          { internalType: 'uint256', name: 'totalEarnings', type: 'uint256' },
          { internalType: 'uint256', name: 'totalSales', type: 'uint256' },
        ],
        internalType: 'struct AccessUnlock.ContentItem',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_creator', type: 'address' }],
    name: 'getCreatorStats',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'totalEarnings', type: 'uint256' },
          { internalType: 'uint256', name: 'totalSales', type: 'uint256' },
          { internalType: 'uint256', name: 'activeContent', type: 'uint256' },
          { internalType: 'uint256', name: 'lifetimeEarnings', type: 'uint256' },
        ],
        internalType: 'struct AccessUnlock.CreatorStats',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_user', type: 'address' },
      { internalType: 'uint256', name: '_contentId', type: 'uint256' },
    ],
    name: 'checkAccess',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'purchaseAccess',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: '_contentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
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
  const [displayName, setDisplayName] = useState(null);
  
  // Get ENS name for the creator address
  const { data: ensName } = useEnsName({ 
    address: creatorAddress,
    enabled: !!creatorAddress && ethers.isAddress(creatorAddress)
  });

  const mainnetClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  // Debug function to test ENS resolution
  const testENS = async () => {
    try {
      console.log("Testing ENS resolution...");
      console.log("PublicClient:", publicClient);
      
      if (publicClient) {
        const address = await publicClient.getEnsAddress({ name: "hopestream.eth" });
        console.log("hopestream.eth resolves to:", address);
      }
    } catch (error) {
      console.error("ENS resolution failed:", error);
    }
  };

  // Call it when publicClient is ready
  useEffect(() => {
    if (publicClient) {
      testENS();
    }
  }, [publicClient]);

  useEffect(() => {
    const resolveCreator = async () => {
      try {
        setLoading(true);
        const creatorName = params.creatorname;
        
        // Try to resolve if it's an ENS name, otherwise treat as address
        let resolvedAddress;
        if (creatorName.endsWith('.eth')) {
          console.log("Attempting to resolve ENS:", creatorName);
          try {
            // Use dedicated mainnet client for ENS resolution
            resolvedAddress = await mainnetClient.getEnsAddress({ name: creatorName });
            console.log("ENS resolved to:", resolvedAddress);
          } catch (ensError) {
            console.error("ENS resolution failed:", ensError);
            throw new Error(`Could not resolve ${creatorName}. ENS lookup failed.`);
          }
        } else if (ethers.isAddress(creatorName)) {
          resolvedAddress = creatorName;
        } else {
          // For non-ENS names, show a helpful error
          throw new Error(`"${creatorName}" is not a valid ENS name or address. Try using name.eth or a wallet address.`);
        }

        setCreatorAddress(resolvedAddress);
        
        // Set display name - use ENS if available, otherwise use shortened address
        if (creatorName.endsWith('.eth')) {
          setDisplayName(creatorName);
        } else if (ethers.isAddress(creatorName)) {
          setDisplayName(`${creatorName.slice(0, 6)}...${creatorName.slice(-4)}`);
        } else {
          setDisplayName(creatorName);
        }
      } catch (err) {
        console.error("Creator resolution failed:", err);
        console.error("Error details:", {
          message: err.message,
          creatorName: params.creatorname,
          publicClient: !!publicClient
        });
        setError(err.message || "Creator not found");
        setLoading(false);
      }
    };

    if (params.creatorname) {
      resolveCreator();
    }
  }, [params.creatorname, publicClient]);
  
  // Update display name when ENS is resolved
  useEffect(() => {
    if (ensName && creatorAddress) {
      setDisplayName(ensName);
    } else if (creatorAddress && !displayName) {
      setDisplayName(`${creatorAddress.slice(0, 6)}...${creatorAddress.slice(-4)}`);
    }
  }, [ensName, creatorAddress]);

  // Fetch creator data
  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!creatorAddress || !publicClient || !CONTRACT_ADDRESS) {
        if (!CONTRACT_ADDRESS) {
          setError("Contract address not configured");
        }
        setLoading(false);
        return;
      }

      try {
        const contract = {
          address: CONTRACT_ADDRESS,
          abi: ABI,
        };

        let stats;

        try {
          // Get creator stats - returns a struct object, not an array
          stats = await publicClient.readContract({
            ...contract,
            functionName: 'getCreatorStats',
            args: [creatorAddress],
          });
          
          console.log("Creator stats:", stats);
          
          // Handle struct object (not array)
          const statsObj = stats;
          setCreatorStats({
            totalEarnings: statsObj.totalEarnings || BigInt(0),
            totalSales: statsObj.totalSales || BigInt(0),
            activeContent: statsObj.activeContent || BigInt(0),
            lifetimeEarnings: statsObj.lifetimeEarnings || BigInt(0),
          });
          
        } catch (statsError) {
          console.warn("No creator stats found, using defaults:", statsError.message);
          // Use default values if no stats exist
          setCreatorStats({
            totalEarnings: BigInt(0),
            totalSales: BigInt(0),
            activeContent: BigInt(0),
            lifetimeEarnings: BigInt(0),
          });
        }

        // Fetch all content and filter by creator (same approach as dashboard)
        try {
          // Get total content count
          const totalContent = await publicClient.readContract({
            ...contract,
            functionName: 'getTotalContent',
          });

          if (totalContent === 0n) {
            setCreatorContent([]);
            setLoading(false);
            return;
          }

          // Fetch all content items
          const contentPromises = [];
          for (let i = 1; i <= Number(totalContent); i++) {
            contentPromises.push(
              publicClient.readContract({
                ...contract,
                functionName: 'getContent',
                args: [BigInt(i)],
              }).catch(() => null)
            );
          }

          const contentResults = await Promise.all(contentPromises);
          
          // Filter content by creator and format
          const creatorContentList = [];
          for (let i = 0; i < contentResults.length; i++) {
            const content = contentResults[i];
            if (!content) continue;

            // Handle struct object
            const {
              id,
              title,
              description,
              contentType,
              ipfsHash,
              embedUrl,
              price,
              creator,
              isActive,
              createdAt,
              previewHash,
              totalEarnings,
              totalSales,
            } = content;

            // Only include active content from this creator
            if (isActive && creator.toLowerCase() === creatorAddress.toLowerCase()) {
              let hasUserAccess = false;
              if (isConnected && userAddress) {
                try {
                  hasUserAccess = await publicClient.readContract({
                    ...contract,
                    functionName: 'checkAccess',
                    args: [userAddress, BigInt(id)],
                  });
                } catch (accessError) {
                  console.warn(`Could not check access for content ${id}:`, accessError.message);
                }
              }

              creatorContentList.push({
                id: Number(id),
                title,
                description,
                contentType: Number(contentType),
                ipfsHash,
                embedUrl,
                price: price, // Keep as BigInt for purchase, format for display
                creator,
                isActive,
                createdAt,
                previewHash,
                totalEarnings,
                totalSales,
                hasAccess: hasUserAccess,
              });
            }
          }

          setCreatorContent(creatorContentList);
        } catch (contentError) {
          console.warn("Error fetching content:", contentError.message);
          setCreatorContent([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Contract call failed:", err);
        console.error("Error details:", {
          message: err.message,
          creatorAddress,
          contractAddress: CONTRACT_ADDRESS,
          publicClient: !!publicClient
        });
        
        // Show more specific error
        if (!CONTRACT_ADDRESS) {
          setError("Contract address not configured properly");
        } else if (err.message?.includes("network")) {
          setError("Network error - make sure you're on the right chain");
        } else {
          setError(`Contract error: ${err.message || "Failed to load creator data"}`);
        }
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [creatorAddress, publicClient, isConnected, userAddress]);

  const formatEther = (wei) => {
    if (!wei) return '0.0000';
    try {
      const formatted = ethers.formatEther(wei.toString());
      const num = parseFloat(formatted);
      // Format to 4 decimal places, but remove trailing zeros
      const result = num.toFixed(4).replace(/\.?0+$/, '');
      return result || '0';
    } catch (error) {
      console.error('Error formatting ether:', error);
      return '0.0000';
    }
  };
  
  const formatAddress = (address) => {
    if (!address) return '';
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getContentTypeLabel = (type) => {
    const types = ['PDF', 'VIDEO', 'ZIP', 'AUDIO', 'IMAGE', 'YOUTUBE', 'TWITTER', 'NOTION', 'OTHER'];
    return types[type] || 'UNKNOWN';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🔑</span>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading creator profile...</p>
          <p className="mt-2 text-sm text-gray-500">Fetching data from blockchain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🔑</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ContentKeyz
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                unlockr.xyz/{params.creatorname}
              </div>
              {isConnected && (
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Creator Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-white text-xl font-bold">
                    {ensName 
                      ? ensName.charAt(0).toUpperCase() 
                      : creatorAddress 
                        ? creatorAddress.charAt(2).toUpperCase() 
                        : params.creatorname?.charAt(0)?.toUpperCase() || 'C'}
                  </span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-1">
                    {displayName || params.creatorname}
                  </h1>
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-500">Active Creator</span>
                  </div>
                  {creatorAddress && (
                    <div className="bg-gray-100 rounded-lg px-3 py-1.5 inline-block">
                      <p className="text-gray-600 text-xs font-mono">
                        {creatorAddress.slice(0, 6)}...{creatorAddress.slice(-4)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              <div className="text-center lg:text-right">
                <div className="bg-blue-50 rounded-2xl p-4 mb-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {creatorStats?.totalSales ? Number(creatorStats.totalSales).toString() : '0'}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600">Supporters</div>
              </div>
              <div className="text-center lg:text-right">
                <div className="bg-green-50 rounded-2xl p-4 mb-2">
                  <div className="text-3xl font-bold text-green-600">
                    {creatorStats?.activeContent ? Number(creatorStats.activeContent).toString() : '0'}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600">Content Items</div>
              </div>
              <div className="text-center lg:text-right">
                <div className="bg-purple-50 rounded-2xl p-4 mb-2">
                  <div className="text-3xl font-bold text-purple-600">
                    {creatorStats?.lifetimeEarnings ? formatEther(creatorStats.lifetimeEarnings) : '0.0000'}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600">ETH Earned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Exclusive Content</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>{creatorContent.length} items available</span>
            </div>
          </div>
          
          {creatorContent.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📭</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                This creator hasn't uploaded any content yet. Check back soon for exclusive materials!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
  const [showModal, setShowModal] = useState(false);

  const formatEther = (wei) => {
    if (!wei) return '0.0000';
    try {
      // If it's already a number (from formatted content), return formatted string
      if (typeof wei === 'number') {
        return wei.toFixed(4).replace(/\.?0+$/, '') || '0';
      }
      const formatted = ethers.formatEther(wei.toString());
      const num = parseFloat(formatted);
      const result = num.toFixed(4).replace(/\.?0+$/, '');
      return result || '0';
    } catch (error) {
      console.error('Error formatting ether:', error);
      return '0.0000';
    }
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Format price from BigInt to ETH string
      const priceValue = formatEther(content.price);
      await purchaseContent(content.id, priceValue);
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed: " + error.message);
    }
  };

  const getContentTypeLabel = (type) => {
    const types = ['PDF', 'VIDEO', 'ZIP', 'AUDIO', 'IMAGE', 'YOUTUBE', 'TWITTER', 'NOTION', 'OTHER'];
    return types[type] || 'UNKNOWN';
  };

  const getContentTypeIcon = (type) => {
    const icons = ['📄', '🎬', '📦', '🎵', '🖼️', '📺', '🐦', '📝', '📁'];
    return icons[type] || '📁';
  };

  const getContentTypeColor = (type) => {
    const colors = [
      'from-red-500 to-pink-600',     // PDF
      'from-purple-500 to-indigo-600', // VIDEO
      'from-yellow-500 to-orange-600', // ZIP
      'from-green-500 to-teal-600',   // AUDIO
      'from-blue-500 to-cyan-600',    // IMAGE
      'from-red-600 to-rose-600',     // YOUTUBE
      'from-sky-500 to-blue-600',     // TWITTER
      'from-gray-500 to-slate-600',   // NOTION
      'from-indigo-500 to-purple-600' // OTHER
    ];
    return colors[type] || 'from-gray-500 to-slate-600';
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Preview Image */}
      <div className={`h-48 bg-gradient-to-br ${getContentTypeColor(content.contentType)} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
        <div className="relative z-10 h-full flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-5xl mb-3">{hasAccess ? '🔓' : '🔒'}</div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">{getContentTypeIcon(content.contentType)}</span>
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {getContentTypeLabel(content.contentType)}
              </span>
            </div>
          </div>
        </div>
        {hasAccess && (
          <div className="absolute top-4 right-4">
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              OWNED
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {content.title}
        </h3>
        <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
          {content.description}
        </p>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-emerald-600">
              {formatEther(content.price)}
            </div>
            <div className="text-sm text-gray-500 font-medium">ETH</div>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>{content.totalSales.toString()} sold</span>
          </div>
        </div>

        {hasAccess ? (
          <button 
            onClick={() => setShowModal(true)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>👁️</span>
              <span>View Content</span>
            </span>
          </button>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
          >
            {purchasing ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Purchasing...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>🔑</span>
                <span>Unlock Content</span>
              </span>
            )}
          </button>
        )}
      </div>

      {/* Content View Modal */}
      {showModal && hasAccess && (
        <ContentModal 
          content={content} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}
