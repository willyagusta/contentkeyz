"use client";

import React, { useState } from 'react';

export default function Dashboard() {
    const [file, setFile] = useState(null);
    const [contentLink, setContentLink] = useState("");
    const [price, setPrice] = useState("");
    const [isNFT, setIsNFT] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log ({
            file,
            contentLink,
            price,
            isNFT
        });

        alert("Content saved successfully!");
    };


    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
            <h1 className="text-2xl font-bold mb-4">Creator Dashboard</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Upload */}
              <div>
                <label className="block text-sm mb-1">Upload File</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-300 bg-gray-700 rounded-md p-2"
                />
              </div>
    
              {/* OR Content Link */}
              <div>
                <label className="block text-sm mb-1">Content Link</label>
                <input
                  type="url"
                  placeholder="https://example.com/content"
                  value={contentLink}
                  onChange={(e) => setContentLink(e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-700 text-gray-200"
                />
              </div>
    
              {/* Price */}
              <div>
                <label className="block text-sm mb-1">Price</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2 rounded-md bg-gray-700 text-gray-200"
                />
                <span className="text-xs text-gray-400">ETH or stablecoin</span>
              </div>
    
              {/* NFT Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isNFT}
                  onChange={(e) => setIsNFT(e.target.checked)}
                  className="mr-2"
                />
                <label>Mint as NFT</label>
              </div>
    
              {/* Save Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-md p-2 font-semibold"
              >
                Save Content
              </button>
            </form>
          </div>
        </div>
      );
}