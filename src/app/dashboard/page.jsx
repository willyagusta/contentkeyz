"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Dashboard() {
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState('upload');
    const [file, setFile] = useState(null);
    const [contentData, setContentData] = useState({
        title: '',
        description: '',
        contentLink: '',
        price: '',
        contentType: '0'
    });
    const [isNFT, setIsNFT] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            console.log({
                file,
                ...contentData,
                isNFT
            });
            setIsLoading(false);
            alert("Content saved successfully!");
        }, 2000);
    };

    const handleInputChange = (field, value) => {
        setContentData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-white text-2xl">🔑</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Creator Dashboard</h1>
                    <p className="text-gray-600 mb-8">Connect your wallet to access the creator dashboard and start monetizing your content.</p>
                    <ConnectButton />
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
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Home
                            </button>
                            <ConnectButton />
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Dashboard Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Creator Dashboard</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Upload and monetize your exclusive content. Create gated experiences for your audience.
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'upload'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                📤 Upload Content
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'analytics'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                📊 Analytics
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'settings'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                ⚙️ Settings
                            </button>
                        </nav>
                    </div>

                    <div className="p-8">
                        {activeTab === 'upload' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Content Title *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter content title"
                                            value={contentData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        />
                                    </div>

                                    {/* Content Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Content Type *
                                        </label>
                                        <select
                                            value={contentData.contentType}
                                            onChange={(e) => handleInputChange('contentType', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        >
                                            <option value="0">📄 PDF Document</option>
                                            <option value="1">🎬 Video</option>
                                            <option value="2">📦 ZIP Archive</option>
                                            <option value="3">🎵 Audio</option>
                                            <option value="4">🖼️ Image</option>
                                            <option value="5">📺 YouTube</option>
                                            <option value="6">🐦 Twitter</option>
                                            <option value="7">📝 Notion</option>
                                            <option value="8">📁 Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe your content..."
                                        value={contentData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                    />
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload File
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            onChange={(e) => setFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <div className="text-4xl mb-4">📎</div>
                                            <p className="text-lg font-medium text-gray-700 mb-2">
                                                {file ? file.name : 'Click to upload file'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                or drag and drop your file here
                                            </p>
                                        </label>
                                    </div>
                                </div>

                                {/* Content Link Alternative */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Or Content Link
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://example.com/content"
                                        value={contentData.contentLink}
                                        onChange={(e) => handleInputChange('contentLink', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price (ETH) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.0001"
                                            required
                                            placeholder="0.01"
                                            value={contentData.price}
                                            onChange={(e) => handleInputChange('price', e.target.value)}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                            <span className="text-gray-500 font-medium">ETH</span>
                                        </div>
                                    </div>
                                </div>

                                {/* NFT Toggle */}
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={isNFT}
                                            onChange={(e) => setIsNFT(e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-700">
                                                💎 Mint as NFT
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Create a unique collectible token for this content
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center space-x-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            <span>Publishing...</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center space-x-2">
                                            <span>🚀</span>
                                            <span>Publish Content</span>
                                        </span>
                                    )}
                                </button>
                            </form>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">📊</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                                <p className="text-gray-500">
                                    Track your content performance, earnings, and audience engagement.
                                </p>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">⚙️</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings Coming Soon</h3>
                                <p className="text-gray-500">
                                    Customize your creator profile and content preferences.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}