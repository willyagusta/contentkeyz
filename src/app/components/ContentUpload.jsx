'use client';

import { useState, useRef } from 'react';
import { IPFSService } from '../../utils/ipfs';

const CONTENT_TYPES = {
  PDF: 0,
  VIDEO: 1,
  ZIP: 2,
  AUDIO: 3,
  IMAGE: 4,
  YOUTUBE: 5,
  TWITTER: 6,
  NOTION: 7,
  OTHER: 8
};

export default function ContentUpload({ onContentCreated }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contentType, setContentType] = useState('file');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    embedUrl: ''
  });
  const fileInputRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const detectContentType = (file) => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType.includes('pdf')) return CONTENT_TYPES.PDF;
    if (fileType.startsWith('video/')) return CONTENT_TYPES.VIDEO;
    if (fileType.startsWith('audio/')) return CONTENT_TYPES.AUDIO;
    if (fileType.startsWith('image/')) return CONTENT_TYPES.IMAGE;
    if (fileName.endsWith('.zip') || fileName.endsWith('.rar')) return CONTENT_TYPES.ZIP;
    
    return CONTENT_TYPES.OTHER;
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (contentType === 'file' && !fileInputRef.current?.files[0]) {
      alert('Please select a file');
      return;
    }

    if (contentType === 'embed' && !formData.embedUrl) {
      alert('Please enter an embed URL');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let ipfsHash = '';
      let previewHash = '';
      let detectedContentType = CONTENT_TYPES.OTHER;

      if (contentType === 'file') {
        const file = fileInputRef.current.files[0];
        detectedContentType = detectContentType(file);

        // Upload main file
        const uploadResult = await IPFSService.uploadFile(file, {
          onProgress: (progress) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 50));
          }
        });
        
        ipfsHash = uploadResult.hash;

        // Create and upload preview
        const previewFile = await IPFSService.createPreview(file);
        if (previewFile) {
          const previewResult = await IPFSService.uploadFile(previewFile);
          previewHash = previewResult.hash;
          setUploadProgress(75);
        }
      } else {
        // Handle embed content
        const url = formData.embedUrl;
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          detectedContentType = CONTENT_TYPES.YOUTUBE;
        } else if (url.includes('twitter.com') || url.includes('x.com')) {
          detectedContentType = CONTENT_TYPES.TWITTER;
        } else if (url.includes('notion.')) {
          detectedContentType = CONTENT_TYPES.NOTION;
        }
      }

      // Create metadata
      const metadata = {
        title: formData.title,
        description: formData.description,
        contentType: detectedContentType,
        ipfsHash: ipfsHash,
        embedUrl: formData.embedUrl,
        createdAt: new Date().toISOString(),
        version: '1.0'
      };

      const metadataResult = await IPFSService.uploadJSON(metadata);
      setUploadProgress(90);

      // Call smart contract to create content
      const contentData = {
        title: formData.title,
        description: formData.description,
        contentType: detectedContentType,
        ipfsHash: ipfsHash,
        embedUrl: formData.embedUrl || '',
        price: parseFloat(formData.price) || 0,
        previewHash: previewHash,
        metadataHash: metadataResult.hash
      };

      setUploadProgress(100);
      
      if (onContentCreated) {
        onContentCreated(contentData);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        embedUrl: ''
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert('Content uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Upload Content</h2>
      
      <form onSubmit={handleFileUpload} className="space-y-6">
        {/* Content Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Content Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="file"
                checked={contentType === 'file'}
                onChange={(e) => setContentType(e.target.value)}
                className="mr-2"
              />
              File Upload (PDF, Video, ZIP, etc.)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="embed"
                checked={contentType === 'embed'}
                onChange={(e) => setContentType(e.target.value)}
                className="mr-2"
              />
              Embed (YouTube, Twitter, Notion)
            </label>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter content title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your content"
          />
        </div>

        {/* File Upload */}
        {contentType === 'file' && (
          <div>
            <label className="block text-sm font-medium mb-2">File *</label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.zip,.rar,.mp4,.mp3,.wav,.jpg,.jpeg,.png,.gif"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported: PDF, ZIP, MP4, MP3, Images (Max 100MB)
            </p>
          </div>
        )}

        {/* Embed URL */}
        {contentType === 'embed' && (
          <div>
            <label className="block text-sm font-medium mb-2">Embed URL *</label>
            <input
              type="url"
              name="embedUrl"
              value={formData.embedUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://youtube.com/watch?v=... or https://twitter.com/..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported: YouTube, Twitter/X, Notion pages
            </p>
          </div>
        )}

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-2">Price (ETH)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            step="0.001"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.01"
          />
          <p className="text-sm text-gray-500 mt-1">
            Set to 0 for free content
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div>
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading}
          className={`w-full py-3 px-4 rounded-md font-medium ${
            isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
          } text-white transition-colors`}
        >
          {isUploading ? 'Uploading...' : 'Upload Content'}
        </button>
      </form>
    </div>
  );
}
