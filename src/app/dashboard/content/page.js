'use client';

import { useState, useEffect } from 'react';
import ContentUpload from '../../components/ContentUpload';
import ContentGallery from '../../components/ContentGallery';
import { useAccount } from 'wagmi';
import { useFetchContent } from '../../../hooks/useFetchContent';
import { usePurchaseContent } from '../../../hooks/usePurchasesContent';

export default function ContentDashboard() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState('browse');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const { contents, userAccess, loading, error, refetch } = useFetchContent();
  const { purchaseContent, purchasing, isSuccess: purchaseSuccess } = usePurchaseContent();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Refetch content when purchase succeeds
  useEffect(() => {
    if (purchaseSuccess) {
      setSuccessMessage('Purchase successful! Refreshing content...');
      // Small delay to ensure blockchain state is updated
      setTimeout(() => {
        handleRefresh();
        setTimeout(() => setSuccessMessage(null), 3000);
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseSuccess]);

  const handleContentCreated = (contentData) => {
    console.log('Content created:', contentData);
    setSuccessMessage('Content created successfully! Refreshing content...');
    // Refresh content list after creation
    setTimeout(() => {
      handleRefresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 3000); // Wait for transaction confirmation
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Content Dashboard
              </h1>
              <p className="text-gray-600">
                Upload, manage, and access premium content with IPFS storage
              </p>
              {contents.length === 0 && !loading && !error && (
                <p className="text-sm text-gray-500 mt-2">
                  No content available yet. Be the first to upload!
                </p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              title="Refresh content"
            >
              <svg
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
          </div>
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                <strong>Error:</strong> {error}
              </p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}
          {successMessage && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </p>
            </div>
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
