"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useAccount, usePublicClient, useEnsName } from "wagmi";
import { ethers } from "ethers";
import { usePurchaseContent } from "@/hooks/usePurchasesContent";
import ContentModal from "../../components/ContentModal";
import { IPFSService } from "../../../utils/ipfs";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const ABI = [
  {
    inputs: [],
    name: "getTotalContent",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_contentId", type: "uint256" }],
    name: "getContent",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "uint8", name: "contentType", type: "uint8" },
          { internalType: "string", name: "ipfsHash", type: "string" },
          { internalType: "string", name: "embedUrl", type: "string" },
          { internalType: "uint256", name: "price", type: "uint256" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "bool", name: "isActive", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "string", name: "previewHash", type: "string" },
          { internalType: "uint256", name: "totalEarnings", type: "uint256" },
          { internalType: "uint256", name: "totalSales", type: "uint256" },
        ],
        internalType: "struct AccessUnlock.ContentItem",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "uint256", name: "_contentId", type: "uint256" },
    ],
    name: "checkAccess",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
];

const ContentTypeIcons = {
  0: "📄", // PDF
  1: "🎬", // VIDEO
  2: "📦", // ZIP
  3: "🎵", // AUDIO
  4: "🖼️", // IMAGE
  5: "📺", // YOUTUBE
  6: "🐦", // TWITTER
  7: "📝", // NOTION
  8: "📁", // OTHER
};

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const publicClient = usePublicClient();
  const { address: userAddress, isConnected } = useAccount();
  const { data: userEnsName } = useEnsName({ address: userAddress });
  const { purchaseContent, purchasing } = usePurchaseContent();

  const [content, setContent] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (!publicClient || !CONTRACT_ADDRESS) {
        setError("Missing contract configuration");
        setLoading(false);
        return;
      }

      const idParam = params.id;
      if (!idParam) {
        setError("Content ID not provided");
        setLoading(false);
        return;
      }

      try {
        const contentId = BigInt(idParam);

        const contract = {
          address: CONTRACT_ADDRESS,
          abi: ABI,
        };

        const item = await publicClient.readContract({
          ...contract,
          functionName: "getContent",
          args: [contentId],
        });

        if (!item || !item.isActive) {
          setError("Content not found or inactive");
          setLoading(false);
          return;
        }

        const formatted = {
          id: Number(item.id),
          title: item.title,
          description: item.description,
          contentType: Number(item.contentType),
          ipfsHash: item.ipfsHash,
          embedUrl: item.embedUrl,
          price: item.price,
          creator: item.creator,
          isActive: item.isActive,
          createdAt: item.createdAt,
          previewHash: item.previewHash,
          totalEarnings: item.totalEarnings,
          totalSales: item.totalSales,
        };

        setContent(formatted);

        if (userAddress) {
          try {
            const access = await publicClient.readContract({
              ...contract,
              functionName: "checkAccess",
              args: [userAddress, contentId],
            });
            setHasAccess(access);
            if (access) {
              setShowModal(true);
            }
          } catch {
            setHasAccess(false);
          }
        }
      } catch (err) {
        console.error("Failed to load content:", err);
        setError(err.message || "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [params.id, publicClient, userAddress]);

  const formatEther = (wei) => {
    if (!wei) return "0.0000";
    try {
      const formatted = ethers.formatEther(wei.toString());
      const num = parseFloat(formatted);
      const result = num.toFixed(4).replace(/\.?0+$/, "");
      return result || "0";
    } catch {
      return "0.0000";
    }
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    if (!content) return;

    try {
      const priceValue = formatEther(content.price);
      await purchaseContent(content.id, priceValue);
      // After successful purchase, re-check access
      if (publicClient && userAddress) {
        const access = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: "checkAccess",
          args: [userAddress, BigInt(content.id)],
        });
        setHasAccess(access);
        if (access) {
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed: " + (error.message || "Unknown error"));
    }
  };

  const getPreview = () => {
    if (!content) return null;

    if (content.previewHash) {
      return (
        <img
          src={IPFSService.getIPFSUrl(content.previewHash)}
          alt="Preview"
          className="w-full h-64 object-cover rounded-2xl border"
        />
      );
    }

    return (
      <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-2">
            {ContentTypeIcons[content.contentType] || "📁"}
          </div>
          <p className="text-gray-500">Exclusive Content Preview</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading content details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white/70 rounded-2xl shadow-lg border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Unable to load content
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard/content")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Content Hub
          </button>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="ContentKeyz Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ContentKeyz
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {isConnected && userAddress && (
                <button
                  onClick={() => router.push(`/${userEnsName || userAddress}`)}
                  className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  My Profile
                </button>
              )}
              <button
                onClick={() => router.back()}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <button
                onClick={() =>
                  router.push(`/${content.creator}`)
                }
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View Creator
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <div>{getPreview()}</div>

          <div>
            <div className="mb-4 inline-flex items-center space-x-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>
                Content #{content.id} ·{" "}
                {ContentTypeIcons[content.contentType] || "📁"}{" "}
                {[
                  "PDF",
                  "VIDEO",
                  "ZIP",
                  "AUDIO",
                  "IMAGE",
                  "YOUTUBE",
                  "TWITTER",
                  "NOTION",
                  "OTHER",
                ][content.contentType] || "OTHER"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {content.title}
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {content.description}
            </p>

            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Price</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-emerald-600">
                    {formatEther(content.price)}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    ETH
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Total Sales</p>
                <p className="text-lg font-semibold text-gray-800">
                  {content.totalSales?.toString?.() ?? "0"} sold
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs uppercase text-gray-500 mb-1">
                Creator
              </p>
              <p className="text-sm font-mono bg-gray-100 rounded-lg px-3 py-2 inline-block">
                {content.creator.slice(0, 6)}...
                {content.creator.slice(-4)}
              </p>
            </div>

            <div className="border-t pt-6">
              {hasAccess ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <p className="text-green-800 font-medium mb-3">
                    ✅ You already own this content.
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <span>Open Content Viewer</span>
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                  <p className="text-yellow-900 mb-3">
                    🔒 This content is locked. Purchase access to unlock the
                    full content.
                  </p>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    {purchasing ? "Purchasing..." : "Unlock Content"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Content Modal for owners */}
      {showModal && hasAccess && (
        <ContentModal content={content} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}


