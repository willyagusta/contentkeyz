'use client';

import { useState, useEffect } from 'react';
import ContentViewer from './ContentViewer';

const CONTENT_FILTERS = {
  ALL: 'all',
  PDF: '0',
  VIDEO: '1',
  ZIP: '2',
  AUDIO: '3',
  IMAGE: '4',
  YOUTUBE: '5',
  TWITTER: '6',
  NOTION: '7',
  OTHER: '8'
};

export default function ContentGallery({ 
  contents = [], 
  userAccess = {}, 
  onPurchase,
  showFilter = true 
}) {
  const [filter, setFilter] = useState(CONTENT_FILTERS.ALL);
  const [sortBy, setSortBy] = useState('newest');
  const [filteredContents, setFilteredContents] = useState([]);

  useEffect(() => {
    let filtered = [...contents];

    // Apply content type filter
    if (filter !== CONTENT_FILTERS.ALL) {
      filtered = filtered.filter(content => content.contentType.toString() === filter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price_low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price_high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredContents(filtered);
  }, [contents, filter, sortBy]);

  return (
    <div className="space-y-6">
      {showFilter && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Content Type Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={CONTENT_FILTERS.ALL}>All Content</option>
                <option value={CONTENT_FILTERS.PDF}>📄 PDFs</option>
                <option value={CONTENT_FILTERS.VIDEO}>🎬 Videos</option>
                <option value={CONTENT_FILTERS.AUDIO}>🎵 Audio</option>
                <option value={CONTENT_FILTERS.IMAGE}>🖼️ Images</option>
                <option value={CONTENT_FILTERS.YOUTUBE}>📺 YouTube</option>
                <option value={CONTENT_FILTERS.TWITTER}>🐦 Twitter</option>
                <option value={CONTENT_FILTERS.NOTION}>📝 Notion</option>
                <option value={CONTENT_FILTERS.ZIP}>📦 Archives</option>
                <option value={CONTENT_FILTERS.OTHER}>📁 Other</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500">
              {filteredContents.length} content{filteredContents.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      {filteredContents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-medium mb-2">No content found</h3>
          <p className="text-gray-500">
            {filter !== CONTENT_FILTERS.ALL 
              ? 'Try adjusting your filters or check back later.' 
              : 'Be the first to upload some content!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredContents.map((content) => (
            <ContentViewer
              key={content.id}
              content={content}
              hasAccess={userAccess[content.id] || false}
              onPurchase={onPurchase}
            />
          ))}
        </div>
      )}
    </div>
  );
}


