'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Info, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Artwork } from '@/lib/museums/api-client';
import Image from 'next/image';

interface ArtworkRecommendationCardProps {
  artwork: Artwork;
  matchReasons?: string[];
  onSave?: (artwork: Artwork) => void;
  onShare?: (artwork: Artwork) => void;
}

export default function ArtworkRecommendationCard({
  artwork,
  matchReasons = [],
  onSave,
  onShare
}: ArtworkRecommendationCardProps) {
  const { language } = useLanguage();
  const [isLiked, setIsLiked] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked && onSave) {
      onSave(artwork);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(artwork);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(artwork.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${artwork.id}-${artwork.title.replace(/[^a-z0-9]/gi, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="artwork-recommendation-card overflow-hidden">
        <div className="relative aspect-[4/5] bg-gray-100">
          {!imageError ? (
            <Image
              src={artwork.thumbnailUrl || artwork.imageUrl}
              alt={artwork.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="text-gray-400">Image unavailable</span>
            </div>
          )}
          
          {/* Match reasons badge */}
          {matchReasons.length > 0 && (
            <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
              {matchReasons[0]}
            </div>
          )}
          
          {/* Action buttons overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex justify-between items-end">
              <div className="text-white">
                <h3 className="font-semibold text-lg line-clamp-2">
                  {language === 'ko' && artwork.titleKo ? artwork.titleKo : artwork.title}
                </h3>
                <p className="text-sm opacity-90">
                  {language === 'ko' && artwork.artistKo ? artwork.artistKo : artwork.artist}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleLike}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Info className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expandable info section */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                <div>
                  <h4 className="font-semibold text-sm mb-1">
                    {language === 'ko' ? '작품 정보' : 'Artwork Details'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {artwork.date && <span>{artwork.date} • </span>}
                    {language === 'ko' && artwork.mediumKo ? artwork.mediumKo : artwork.medium}
                  </p>
                  {artwork.dimensions && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {artwork.dimensions}
                    </p>
                  )}
                </div>
                
                {artwork.emotionalTags && artwork.emotionalTags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      {language === 'ko' ? '감정 태그' : 'Emotional Tags'}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {artwork.emotionalTags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShare}
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    {language === 'ko' ? '공유' : 'Share'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownload}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {language === 'ko' ? '다운로드' : 'Download'}
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 text-center">
                  {artwork.sourceMuseum} • {artwork.license}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}