'use client';

import { useState } from 'react';
import { ArtworkViewingProvider, useArtworkViewing } from '@/contexts/ArtworkViewingContext';
import { ArtCuratorChatbot } from '@/components/chatbot/ArtCuratorChatbot';
import { AnimalCompanion } from '@/components/animations/AnimalCompanion';
import { motion } from 'framer-motion';
import { ZoomIn, Heart, Share2, Info } from 'lucide-react';

// Example artwork data
const exampleArtwork = {
  id: 'example-1',
  title: 'Starry Night',
  artist: 'Vincent van Gogh',
  year: 1889,
  imageUrl: '/images/example-artwork.jpg',
  medium: 'Oil on canvas',
  dimensions: '73.7 cm × 92.1 cm',
  museum: 'Museum of Modern Art',
  description: 'A swirling night sky over a French village'
};

// Inner component that uses the context
function ArtworkViewerContent() {
  const { setCurrentArtwork, updateViewingStats, getViewingTime } = useArtworkViewing();
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // Set current artwork on mount
  useState(() => {
    setCurrentArtwork(exampleArtwork);
  });

  const handleZoom = () => {
    setIsZoomed(!isZoomed);
    updateViewingStats({ zoomed: true, interactions: 1 });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    updateViewingStats({ interactions: 1 });
  };

  const handleShare = () => {
    updateViewingStats({ shared: true, interactions: 1 });
    // Implement share functionality
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content area */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Artwork display */}
          <div className="relative">
            <motion.div
              animate={{ scale: isZoomed ? 1.5 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative overflow-hidden rounded-lg shadow-2xl"
            >
              <img
                src={exampleArtwork.imageUrl}
                alt={exampleArtwork.title}
                className="w-full h-auto"
              />
            </motion.div>
            
            {/* Artwork controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleZoom}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <ZoomIn className={`w-5 h-5 ${isZoomed ? 'text-primary' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={handleLike}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Artwork information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{exampleArtwork.title}</h1>
              <p className="text-xl text-gray-600">{exampleArtwork.artist}, {exampleArtwork.year}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Medium:</span> {exampleArtwork.medium}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Dimensions:</span> {exampleArtwork.dimensions}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Location:</span> {exampleArtwork.museum}
              </p>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              {exampleArtwork.description}
            </p>
            
            {/* Viewing stats */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Your Viewing Experience</h3>
              <p className="text-sm text-gray-600">
                Time spent: {Math.floor(getViewingTime() / 60)}m {getViewingTime() % 60}s
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animal Companion - positioned separately */}
      <AnimalCompanion position="bottom-left" />
      
      {/* Chatbot - positioned on the right */}
      <ArtCuratorChatbot position="bottom-right" />
    </div>
  );
}

// Main component with provider
export default function ArtworkViewingExample() {
  return (
    <ArtworkViewingProvider>
      <ArtworkViewerContent />
    </ArtworkViewingProvider>
  );
}