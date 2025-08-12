'use client';

import { useState, useEffect } from 'react';
import ContentUpload from '../../components/ContentUpload';
import ContentGallery from '../../components/ContentGallery';
import { useAccount } from 'wagmi';

export default function ContentDashboard() {
  const { address } = useAccount();
  const [contents, setContents] = useState([]);
  const [userAccess, setUserAccess] = useState({});
  const [activeTab, setActiveTab] = useState('browse');

  // Mock data for demonstration
  useEffect(() => {
    const mockContents = [
      {
        id: 1,
        title: "Advanced DeFi Strategies PDF",
        description: "Comprehensive guide to yield farming and liquidity provision",
        contentType: 0, // PDF
        ipfsHash: "QmExample1...",
        embedUrl: "",
        price: 0.05,
        creator: "0x1234...5678",
        isActive: true,
        createdAt: new Date().toISOString(),
        previewHash: "QmPreview1..."
      },
      {
        id: 2,
        title: "Smart Contract Tutorial",
        description: "Learn Solidity from scratch",
        contentType: 5, // YouTube
        ipfsHash: "",
        embedUrl: "https://youtube.com/watch?v=example",
        price: 0,
        creator: "0x8765...4321",
        isActive: true,
        createdAt: new Date().toISOString(),
        previewHash: ""
      },
      {
        id: 3,
        title: "Web3 Development Course",
        description: "Complete course materials and resources",
        contentType: 2, // ZIP
        ipfsHash: "QmExample3...",
        embedUrl: "",
        price: 0.1,
        creator: "0x9999...1111",
        isActive: true,
        createdAt: new Date().toISOString(),
        previewHash: "QmPreview3..."
      }
    ];

    setContents(mockContents);
    
    // Mock user access (user has access to content 2)
    setUserAccess({ 2: true });
  }, []);

  const handleContentCreated = (contentData) => {
    console.log('Content created:', contentData);
    // This would call the smart contract and update the contents list
  };

  const handlePurchase = async (contentId, price) => {
    console.log('Purchasing content:', contentId, price);
    // Implementation, this would call the smart contract and update user access
    setUserAccess(prev => ({ ...prev, [contentId]: true }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Content Dashboard
          </h1>
          <p className="text-gray-600">
            Upload, manage, and access premium content with IPFS storage
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'browse'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Browse Content
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload Content
            </button>
            <button
              onClick={() => setActiveTab('my-content')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Content
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'browse' && (
          <ContentGallery
            contents={contents}
            userAccess={userAccess}
            onPurchase={handlePurchase}
          />
        )}

        {activeTab === 'upload' && (
          <ContentUpload onContentCreated={handleContentCreated} />
        )}

        {activeTab === 'my-content' && (
          <ContentGallery
            contents={contents.filter(c => c.creator.toLowerCase() === address?.toLowerCase())}
            userAccess={userAccess}
            onPurchase={handlePurchase}
            showFilter={false}
          />
        )}
      </div>
    </div>
  );
}
