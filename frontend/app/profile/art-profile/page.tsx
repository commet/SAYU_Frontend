'use client';

import { useEffect } from 'react';

export default function ArtProfilePage() {
  useEffect(() => {
    console.log('🎨 ArtProfilePage component mounted successfully!');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🎨 AI Art Profile
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome to the AI Art Profile Generator!
        </p>
        <div className="text-green-600 font-semibold mb-4">
          ✅ Page loaded successfully!
        </div>
        <div className="text-blue-600 text-sm mb-4">
          Navigation working! Current time: {new Date().toLocaleTimeString()}
        </div>
        <button 
          onClick={() => {
            console.log('Back button clicked');
            window.history.back();
          }}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          ← Back to Profile
        </button>
      </div>
    </div>
  );
}