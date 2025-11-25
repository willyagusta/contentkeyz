'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEnsName } from 'wagmi';

export default function CreatorsGallery({ creators = [] }) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('newest');
  const [filteredCreators, setFilteredCreators] = useState(creators);

  // Sort creators
  useEffect(() => {
    let sorted = [...creators];

    switch (sortBy) {
      case 'newest':
        // Already sorted by latest content date
        break;
      case 'earnings':
        sorted.sort((a, b) => b.lifetimeEarnings - a.lifetimeEarnings);
        break;
      case 'sales':
        sorted.sort((a, b) => b.totalSales - a.totalSales);
        break;
      case 'content':
        sorted.sort((a, b) => b.activeContent - a.activeContent);
        break;
    }

    setFilteredCreators(sorted);
  }, [creators, sortBy]);

  const handleCreatorClick = (creatorAddress) => {
    router.push(`/${creatorAddress}`);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Sort */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest Creators</option>
              <option value="earnings">Top Earners</option>
              <option value="sales">Most Sales</option>
              <option value="content">Most Content</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Creators Grid */}
      {filteredCreators.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-medium mb-2">No creators found</h3>
          <p className="text-gray-500">
            Be the first to create content and become a creator!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCreators.map((creator) => (
            <CreatorCard
              key={creator.address}
              creator={creator}
              onClick={() => handleCreatorClick(creator.address)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CreatorCard({ creator, onClick }) {
  const { data: ensName } = useEnsName({ address: creator.address });

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatEther = (value) => {
    return parseFloat(value).toFixed(4);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      {/* Creator Header */}
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
          <span className="text-white text-2xl font-bold">
            {ensName ? ensName.charAt(0).toUpperCase() : creator.address.charAt(2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {ensName || formatAddress(creator.address)}
          </h3>
          <p className="text-xs text-gray-500 font-mono truncate">
            {formatAddress(creator.address)}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">
            {creator.activeContent}
          </div>
          <div className="text-xs text-gray-500">Content</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">
            {creator.totalSales}
          </div>
          <div className="text-xs text-gray-500">Sales</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600">
            {formatEther(creator.lifetimeEarnings)}
          </div>
          <div className="text-xs text-gray-500">ETH</div>
        </div>
      </div>

      {/* View Profile Button */}
      <button className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
        View Profile →
      </button>
    </div>
  );
}

