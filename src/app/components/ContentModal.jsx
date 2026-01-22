'use client';

import React from 'react';

export default function ContentModal({ content, onClose }) {
  const getIPFSUrl = (hash) => {
    if (!hash) return null;
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
    return `${gateway}${hash}`;
  };

  const extractYouTubeId = (url) => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  };

  const renderContent = () => {
    const fileUrl = getIPFSUrl(content.ipfsHash);
    const previewUrl = getIPFSUrl(content.previewHash);

    switch (content.contentType) {
      case 0: // PDF
        return (
          <div className="w-full h-[600px]">
            <iframe
              src={fileUrl}
              width="100%"
              height="100%"
              className="rounded-lg border"
              title={content.title}
            />
            <div className="mt-4 flex justify-center">
              <a
                href={fileUrl}
                download
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        );

      case 1: // VIDEO
        return (
          <div>
            <video
              controls
              width="100%"
              className="rounded-lg"
              poster={previewUrl}
            >
              <source src={fileUrl} />
              Your browser does not support the video tag.
            </video>
            <div className="mt-4 flex justify-center">
              <a
                href={fileUrl}
                download
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <span>Download Video</span>
              </a>
            </div>
          </div>
        );

      case 2: // ZIP
        return (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-4">{content.title}</h3>
            <p className="text-gray-600 mb-6">{content.description}</p>
            <a
              href={fileUrl}
              download
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 text-lg font-semibold"
            >
              <span>Download ZIP File</span>
            </a>
          </div>
        );

      case 3: // AUDIO
        return (
          <div>
            <div className="bg-gray-50 rounded-lg p-8 mb-4">
              <audio controls className="w-full">
                <source src={fileUrl} />
                Your browser does not support the audio tag.
              </audio>
            </div>
            <div className="flex justify-center">
              <a
                href={fileUrl}
                download
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <span>Download Audio</span>
              </a>
            </div>
          </div>
        );

      case 4: // IMAGE
        return (
          <div>
            <img
              src={fileUrl}
              alt={content.title}
              className="max-w-full h-auto rounded-lg mx-auto"
            />
            <div className="mt-4 flex justify-center">
              <a
                href={fileUrl}
                download
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <span>Download Image</span>
              </a>
            </div>
          </div>
        );

      case 5: // YOUTUBE
        const youtubeId = extractYouTubeId(content.embedUrl);
        return (
          <div>
            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              frameBorder="0"
              allowFullScreen
              className="rounded-lg"
              title={content.title}
            />
            <div className="mt-4 text-center">
              <a
                href={content.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Open on YouTube →
              </a>
            </div>
          </div>
        );

      case 6: // TWITTER
        return (
          <div>
            <blockquote className="twitter-tweet">
              <a href={content.embedUrl}></a>
            </blockquote>
            <div className="mt-4 text-center">
              <a
                href={content.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Open on Twitter →
              </a>
            </div>
          </div>
        );

      case 7: // NOTION
        return (
          <div>
            <iframe
              src={content.embedUrl}
              width="100%"
              height="600"
              frameBorder="0"
              className="rounded-lg"
              title={content.title}
            />
            <div className="mt-4 text-center">
              <a
                href={content.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Open in Notion →
              </a>
            </div>
          </div>
        );

      default: // OTHER
        return (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold mb-4">{content.title}</h3>
            <p className="text-gray-600 mb-6">{content.description}</p>
            {fileUrl && (
              <a
                href={fileUrl}
                download
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 text-lg font-semibold"
              >
                <span>📥</span>
                <span>Download File</span>
              </a>
            )}
          </div>
        );
    }
  };

  const contentTypeLabels = ['PDF', 'VIDEO', 'ZIP', 'AUDIO', 'IMAGE', 'YOUTUBE', 'TWITTER', 'NOTION', 'OTHER'];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
            <p className="text-gray-600 mt-1">{content.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center space-x-2 text-sm text-gray-500">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              {contentTypeLabels[content.contentType] || 'CONTENT'}
            </span>
            <span>•</span>
            <span>Owned ✓</span>
          </div>
          {renderContent()}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">IPFS Hash:</span>
              <span className="ml-2 font-mono text-xs break-all">{content.ipfsHash || 'N/A'}</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

