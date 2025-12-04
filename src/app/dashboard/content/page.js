'use client';

import { useState, useEffect } from 'react';
import ContentUpload from '../../components/ContentUpload';
import ContentGallery from '../../components/ContentGallery';
import CreatorsGallery from '../../components/CreatorsGallery';
import { useAccount } from 'wagmi';
import { useFetchContent } from '../../../hooks/useFetchContent';
import { useFetchCreators } from '../../../hooks/useFetchCreators';
import { usePurchaseContent } from '../../../hooks/usePurchasesContent';
import { useCreateContent } from '../../../hooks/useCreateContent';

export default function ContentDashboard() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState('browse');
  const { contents, userAccess, loading, refetch } = useFetchContent();
  const { creators, loading: creatorsLoading } = useFetchCreators();
  const { purchaseContent, purchasing, isSuccess: purchaseSuccess } = usePurchaseContent();

  // Refetch content when purchase succeeds
  useEffect(() => {
    if (purchaseSuccess) {
      // Small delay to ensure blockchain state is updated
      setTimeout(() => {
        refetch(); // Use refetch instead of reload
      }, 2000);
    }
  }, [purchaseSuccess, refetch]);

  const handleContentCreated = (contentData) => {
    console.log('Content created:', contentData);
    // Wait for transaction to be confirmed and RPC to index
    // isSuccess already means transaction is confirmed, but RPC might need a moment
    setTimeout(() => {
      refetch(); // Use refetch instead of reload
      // Optionally switch to "My Content" tab to see the new content
      if (address) {
        setActiveTab('my-content');
      }
    }, 3000); // Wait 3 seconds for RPC indexing
  };

  const handlePurchase = async (contentId, price) => {
    try {
      await purchaseContent(contentId, price.toString());
      // Success is handled by useEffect above
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed: ' + (error.message || error.toString()));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content from blockchain...</p>
        </div>
      </div>
    );
  }

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
          {contents.length === 0 && !loading && (
            <p className="text-sm text-gray-500 mt-2">
              No content available yet. Be the first to upload!
            </p>
          )}
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
              onClick={() => setActiveTab('creators')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'creators'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Browse Creators
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
            {address && (
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
            )}
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

        {activeTab === 'creators' && (
          creatorsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading creators...</p>
            </div>
          ) : (
            <CreatorsGallery creators={creators} />
          )
        )}

        {activeTab === 'upload' && (
          <ContentUpload onContentCreated={handleContentCreated} />
        )}

        {activeTab === 'my-content' && address && (
          <ContentGallery
            contents={contents.filter(c => c.creator.toLowerCase() === address.toLowerCase())}
            userAccess={userAccess}
            onPurchase={handlePurchase}
            showFilter={false}
          />
        )}

        {/* Purchase Loading Indicator */}
        {purchasing && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Processing purchase...</span>
          </div>
        )}
      </div>
    </div>
  );
}
