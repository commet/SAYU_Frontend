'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, Clock, Grid, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { artProfileAPI } from '@/lib/art-profile-api';
import { ArtProfileGalleryItem } from '../../../shared';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

export default function ArtProfileGallery() {
  const { language } = useLanguage();
  const [galleryItems, setGalleryItems] = useState<ArtProfileGalleryItem[]>([]);
  const [filter, setFilter] = useState<'recent' | 'popular' | 'style'>('popular');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGallery();
  }, [filter, selectedStyle]);

  const loadGallery = async () => {
    setIsLoading(true);
    try {
      const items = await artProfileAPI.getGallery({
        sort: filter === 'popular' ? 'popular' : 'recent',
        style: selectedStyle || undefined,
      });
      setGalleryItems(items as any);
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (itemId: string) => {
    try {
      await artProfileAPI.likeArtProfile(itemId);
      // 낙관적 업데이트
      setGalleryItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, isLiked: !item.isLiked, likeCount: item.isLiked ? (item.likeCount || 0) - 1 : (item.likeCount || 0) + 1 }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  return (
    <div className="min-h-screen sayu-gradient-bg p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            {language === 'ko' ? '아트 프로필 갤러리' : 'Art Profile Gallery'}
          </h1>
          <p className="text-gray-600">
            {language === 'ko' 
              ? '다른 사용자들의 멋진 아트 프로필을 구경해보세요' 
              : 'Explore amazing art profiles from other users'
            }
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setFilter('popular')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'popular' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/80 hover:bg-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            {language === 'ko' ? '인기' : 'Popular'}
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'recent' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/80 hover:bg-white'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            {language === 'ko' ? '최신' : 'Recent'}
          </button>
          <button
            onClick={() => setFilter('style')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'style' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/80 hover:bg-white'
            }`}
          >
            <Grid className="w-4 h-4 inline mr-2" />
            {language === 'ko' ? '스타일별' : 'By Style'}
          </button>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-purple-500" />
            </motion.div>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {galleryItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="sayu-liquid-glass rounded-xl overflow-hidden group cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <OptimizedImage 
                    src={item.artProfile?.transformedImage || item.imageUrl}
                    alt={`Art profile by ${item.user?.username || 'Unknown'}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" placeholder="blur" quality={90}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-semibold">
                        {item.artProfile?.styleUsed?.nameKo || item.artProfile?.styleUsed?.name || item.style}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Link 
                      href={`/profile/${item.userId}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {item.user?.username?.[0] || 'U'}
                      </div>
                      <span className="font-medium">{item.user?.username || 'Unknown'}</span>
                    </Link>
                    
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        item.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${item.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm">{item.likeCount || 0}</span>
                    </button>
                  </div>
                  
                  {item.style && (
                    <p className="text-sm text-gray-600">
                      {item.style}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Create Your Own CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link href="/profile/art-profile">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium hover:shadow-lg transition-shadow">
              <Sparkles className="w-5 h-5 inline mr-2" />
              {language === 'ko' ? '나도 만들어보기' : 'Create Your Own'}
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}