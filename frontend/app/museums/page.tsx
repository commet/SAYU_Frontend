'use client';

import { motion } from 'framer-motion';
import { MuseumSearch } from '@/components/museums/MuseumSearch';
import { Building2, Palette, Globe, Database } from 'lucide-react';

export default function MuseumsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Museum Collections
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Explore artworks from world-renowned museums and cultural institutions. 
            Discover masterpieces, hidden gems, and diverse collections from across the globe.
          </p>

          {/* Museum Sources - Only commercially licensed APIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-white">Met Museum</span>
              </div>
              <div className="text-xs text-gray-400">Metropolitan Museum of Art</div>
              <div className="text-xs text-green-400 mt-1">✓ Commercial Use</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-white">Rijksmuseum</span>
              </div>
              <div className="text-xs text-gray-400">Dutch National Museum</div>
              <div className="text-xs text-green-400 mt-1">✓ Commercial Use</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-white">Cleveland Museum</span>
              </div>
              <div className="text-xs text-gray-400">Cleveland Museum of Art</div>
              <div className="text-xs text-green-400 mt-1">✓ Commercial Use</div>
            </div>
          </div>
        </motion.div>

        {/* Search Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MuseumSearch />
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Global Collections</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Access artworks from museums worldwide, spanning thousands of years of human creativity 
              and cultural expression.
            </p>
          </div>

          <div className="bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Rich Metadata</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Detailed information about each artwork including artist, medium, period, culture, 
              and provenance data.
            </p>
          </div>

          <div className="bg-gray-900/30 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Palette className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">High Quality Images</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Professional museum photography allowing you to appreciate the details and beauty 
              of each artwork.
            </p>
          </div>
        </motion.div>

        {/* Search Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Search Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <ul className="space-y-2">
              <li>• Search by artwork title, artist name, or museum</li>
              <li>• Use filters to narrow down by medium, culture, or period</li>
              <li>• Toggle "Public Domain" to find freely usable images</li>
            </ul>
            <ul className="space-y-2">
              <li>• Try broad terms like "landscape" or "portrait"</li>
              <li>• Explore specific movements like "Impressionism"</li>
              <li>• Filter by department to focus on paintings, sculptures, etc.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}