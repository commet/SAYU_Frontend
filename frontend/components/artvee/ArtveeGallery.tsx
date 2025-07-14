'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Loader2, Download, ExternalLink, Heart, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Artwork {
  artveeId: string;
  title: string;
  artist: string;
  url: string;
  imageUrl: string;
  thumbnailUrl: string;
  sayuType: string;
}

interface ArtveeGalleryProps {
  personalityType: string;
  className?: string;
}

export function ArtveeGallery({ personalityType, className }: ArtveeGalleryProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/artvee/random/${personalityType}/12`
        );
        
        if (!response.ok) throw new Error('Failed to fetch artworks');
        
        const data = await response.json();
        setArtworks(data.artworks);
      } catch (error) {
        console.error('Error fetching artworks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (personalityType) {
      fetchArtworks();
    }
  }, [personalityType]);

  const handleImageError = (artveeId: string) => {
    setImageError(prev => ({ ...prev, [artveeId]: true }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!artworks.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No artworks found for your personality type.
      </div>
    );
  }

  return (
    <>
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
        {artworks.map((artwork, index) => (
          <motion.div
            key={artwork.artveeId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => setSelectedArtwork(artwork)}
          >
            <div className="aspect-[4/3] relative bg-gray-100">
              {imageError[artwork.artveeId] ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <p className="text-sm text-gray-500">Image unavailable</p>
                </div>
              ) : (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${artwork.thumbnailUrl}`}
                  alt={artwork.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => handleImageError(artwork.artveeId)}
                />
              )}
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{artwork.title}</h3>
                <p className="text-sm opacity-90">{artwork.artist}</p>
              </div>
            </div>

            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                <Heart className="h-4 w-4" />
              </button>
              <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for selected artwork */}
      {selectedArtwork && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedArtwork(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-5xl w-full bg-white rounded-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-2/3 relative bg-gray-100">
                <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${selectedArtwork.imageUrl}`}
                    alt={selectedArtwork.title}
                    fill
                    className="object-contain"
                    onError={() => handleImageError(selectedArtwork.artveeId)}
                  />
                </div>
              </div>
              
              <div className="lg:w-1/3 p-6 flex flex-col">
                <h2 className="text-2xl font-bold mb-2">{selectedArtwork.title}</h2>
                <p className="text-lg text-gray-600 mb-4">{selectedArtwork.artist}</p>
                
                <div className="flex-1" />
                
                <div className="flex gap-3 mt-6">
                  <a
                    href={selectedArtwork.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Artvee
                  </a>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}