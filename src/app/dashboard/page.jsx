"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useAccount, useEnsName } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import ContentUpload from '../components/ContentUpload';

export default function Dashboard() {
    const { address, isConnected } = useAccount();
    const { data: ensName } = useEnsName({ address });
    const [activeTab, setActiveTab] = useState('upload');
    const router = useRouter();

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-white text-2xl">🦸‍♂️</span>
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
                        <div className="flex items-center space-x-4">
                            {address && (
                                <button
                                    onClick={() => router.push(`/${ensName || address}`)}
                                    className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                                >
                                    My Profile
                                </button>
                            )}
                            <button
                                onClick={() => router.push('/dashboard/content')}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Content Hub
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 transition-colors"
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

                {/* Quick Access Card */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-4 md:mb-0 md:mr-6">
                            <h2 className="text-2xl font-bold mb-2">Content Hub</h2>
                            <p className="text-blue-100">
                                Browse all content, discover creators, and manage your library
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard/content')}
                            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                        >
                            <span>Go to Content Hub</span>
                            <span>→</span>
                        </button>
                    </div>
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
                                Upload Content
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'analytics'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Analytics
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'settings'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Settings
                            </button>
                        </nav>
                    </div>

                    <div className="p-8">
                        {activeTab === 'upload' && (
                            <ContentUpload 
                                onContentCreated={(contentData) => {
                                    console.log('Content created:', contentData);
                                    // Optionally refresh content list or show success message
                                }}
                            />
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