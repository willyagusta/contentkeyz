'use client';

import { useState } from 'react';
import { IPFSService } from '../../utils/ipfs';
import ContentModal from './ContentModal';

const ContentTypeIcons = {
  0: '📄', // PDF
  1: '🎬', // VIDEO
  2: '📦', // ZIP
  3: '🎵', // AUDIO
  4: '🖼️', // IMAGE
  5: '📺', // YOUTUBE
  6: '🐦', // TWITTER
  7: '📝', // NOTION
  8: '📁'  // OTHER
};

export default function ContentViewer({ content, hasAccess, onPurchase }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const getEmbedComponent = (content) => {
    if (!hasAccess) return null;

    switch (content.contentType) {
      case 5: // YouTube
        const youtubeId = extractYouTubeId(content.embedUrl);
        return (
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            frameBorder="0"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        );

      case 6: // Twitter
        return (
          <blockquote className="twitter-tweet">
            <a href={content.embedUrl}></a>
          </blockquote>
        );

      case 7: // Notion
        return (
          <iframe
            src={content.embedUrl}
            width="100%"
            height="500"
            frameBorder="0"
            className="rounded-lg"
          ></iframe>
        );

      default:
        return null;
    }
  };

  const getFileViewer = (content) => {
    if (!hasAccess) return null;

    const fileUrl = IPFSService.getIPFSUrl(content.ipfsHash);

    switch (content.contentType) {
      case 0: // PDF
        return (
          <iframe
            src={fileUrl}
            width="100%"
            height="600"
            className="rounded-lg border"
          ></iframe>
        );

      case 1: // VIDEO
        return (
          <video
            controls
            width="100%"
            className="rounded-lg"
            poster={content.previewHash ? IPFSService.getIPFSUrl(content.previewHash) : undefined}
          >
            <source src={fileUrl} />
            Your browser does not support the video tag.
          </video>
        );

      case 3: // AUDIO
        return (
          <audio controls className="w-full">
            <source src={fileUrl} />
            Your browser does not support the audio tag.
          </audio>
        );

      case 4: // IMAGE
        return (
          <img
            src={fileUrl}
            alt={content.title}
            className="max-w-full h-auto rounded-lg"
          />
        );

      case 2: // ZIP
      default:
        return (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">{ContentTypeIcons[content.contentType]}</div>
            <a
              href={fileUrl}
              download
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download File
            </a>
          </div>
        );
    }
  };

  const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      await onPurchase(content.id, content.price);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyShareLink = async () => {
    try {
      setCopying(true);

      const origin =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : '';

      // Use dedicated content detail route for shareable links
      const shareUrl = `${origin}/content/${content.id}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('Unable to copy link. Please try again.');
    } finally {
      setCopying(false);
    }
  };

  const getPreviewContent = () => {
    if (content.previewHash) {
      return (
        <div className="mb-4">
          <img
            src={IPFSService.getIPFSUrl(content.previewHash)}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      );
    }

    return (
      <div className="mb-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-2">{ContentTypeIcons[content.contentType]}</div>
          <p className="text-gray-500">Content Preview</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Preview Section */}
      {!hasAccess && getPreviewContent()}

      {/* Content Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold mb-2">{content.title}</h3>
            <p className="text-gray-600 mb-2">{content.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{ContentTypeIcons[content.contentType]} Content Type</span>
              <span>By {content.creator.slice(0, 6)}...{content.creator.slice(-4)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {content.price > 0 ? `${content.price} ETH` : 'FREE'}
            </div>
          </div>
        </div>

        {/* Access Control */}
        {!hasAccess ? (
          <div className="border-t pt-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">
                🔒 This content is locked. Purchase access to view the full content.
              </p>
            </div>
            <button
              onClick={handlePurchase}
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-medium ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {isLoading ? 'Processing...' : `Purchase Access${content.price > 0 ? ` for ${content.price} ETH` : ' (Free)'}`}
            </button>
          </div>
        ) : (
          <div className="border-t pt-4 space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 mb-3">
                ✅ You have access to this content!
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0">
                <button
                  onClick={() => setShowModal(true)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>View & Download Content</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  disabled={copying}
                  className="w-full sm:w-auto border border-green-500 text-green-700 hover:bg-green-50 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <span>{copying ? 'Copying...' : 'Copy Share Link'}</span>
                </button>
              </div>
              {copySuccess && (
                <p className="mt-2 text-xs text-green-700">
                  Link copied! Share it with others to send them directly to this content.
                </p>
              )}
            </div>
          </div>
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


