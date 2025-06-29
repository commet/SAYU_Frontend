'use client';

import { motion } from 'framer-motion';
import { WifiOff, RefreshCw, Home, Palette } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Offline Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gray-800/50 rounded-full mb-8"
        >
          <WifiOff className="w-12 h-12 text-gray-400" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-4"
        >
          You're Offline
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mb-8 leading-relaxed"
        >
          It looks like you've lost your internet connection. Don't worry - you can still explore some of your saved content and aesthetic journey while offline.
        </motion.p>

        {/* Offline Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-gray-800"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Available Offline</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Your profile and quiz results</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Previously viewed artworks</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Saved aesthetic preferences</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Cached community posts</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>

            <Link
              href="/profile"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              <Palette className="w-4 h-4" />
              Profile
            </Link>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
        >
          <p className="text-blue-300 text-sm">
            💡 <strong>Tip:</strong> SAYU works great offline! Install the app for the best offline experience and instant access to your aesthetic journey.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}