'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Bookmark, ExternalLink, Calendar, MapPin, Palette, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ArtworkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: {
    id: string;
    title: string;
    artist: string;
    year: string;
    imageUrl: string;
    museum: string;
    medium?: string;
    department?: string;
    description?: string;
    curatorNote?: string;
    matchPercent?: number;
    isPublicDomain?: boolean;
  } | null;
  onLike?: (artworkId: string) => void;
  onSave?: (artworkId: string) => void;
  isLiked?: boolean;
  isSaved?: boolean;
  userType?: string;
}

export function ArtworkDetailModal({
  isOpen,
  onClose,
  artwork,
  onLike,
  onSave,
  isLiked = false,
  isSaved = false,
  userType = 'SREF'
}: ArtworkDetailModalProps) {
  const { language } = useLanguage();

  if (!artwork) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLike = () => {
    if (onLike) onLike(artwork.id);
  };

  const handleSave = () => {
    if (onSave) onSave(artwork.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-700">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Palette className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-base md:text-xl font-bold text-white">
                    {language === 'ko' ? '작품 상세 정보' : 'Artwork Details'}
                  </h2>
                  {artwork.matchPercent && (
                    <p className="text-xs md:text-sm text-purple-400">
                      {userType} 매치 {artwork.matchPercent}%
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Action buttons */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className="p-1.5 md:p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors"
                  title={language === 'ko' ? '좋아요' : 'Like'}
                >
                  <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-slate-400'}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="p-1.5 md:p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors"
                  title={language === 'ko' ? '컬렉션에 저장' : 'Save to Collection'}
                >
                  <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${isSaved ? 'text-green-500 fill-green-500' : 'text-slate-400'}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-1.5 md:p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row max-h-[calc(90vh-100px)] overflow-y-auto">
              {/* Image Section */}
              <div className="lg:w-1/2 p-3 md:p-6">
                <div className="aspect-square bg-slate-800 rounded-xl overflow-hidden">
                  <img
                    src={artwork.imageUrl || `https://picsum.photos/800/800?random=${artwork.id}`}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info Section */}
              <div className="lg:w-1/2 p-3 md:p-6 space-y-3 md:space-y-6">
                {/* Basic Info */}
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{artwork.title}</h1>
                  <p className="text-sm md:text-lg text-purple-400 mb-1">{artwork.artist}</p>
                  <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-400">
                    {artwork.year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{artwork.year}</span>
                      </div>
                    )}
                    {artwork.museum && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="truncate">{artwork.museum}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medium & Department */}
                {(artwork.medium || artwork.department) && (
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {artwork.medium && (
                      <span className="px-2 py-1 md:px-3 bg-slate-800 text-slate-300 rounded-full text-xs md:text-sm">
                        {artwork.medium}
                      </span>
                    )}
                    {artwork.department && (
                      <span className="px-2 py-1 md:px-3 bg-slate-800 text-slate-300 rounded-full text-xs md:text-sm">
                        {artwork.department}
                      </span>
                    )}
                    {artwork.isPublicDomain && (
                      <span className="px-2 py-1 md:px-3 bg-green-900/30 text-green-400 rounded-full text-xs md:text-sm border border-green-700">
                        Public Domain
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                {artwork.description && (
                  <div>
                    <h3 className="text-sm md:text-lg font-semibold text-white mb-2 md:mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                      {language === 'ko' ? '작품 설명' : 'Description'}
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-xs md:text-sm">
                      {artwork.description}
                    </p>
                  </div>
                )}

                {/* Curator Note - Why recommended */}
                {artwork.curatorNote && (
                  <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-700/30 rounded-xl p-3 md:p-4">
                    <h3 className="text-sm md:text-lg font-semibold text-white mb-2 md:mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                      {language === 'ko' ? '왜 이 작품을 추천하나요?' : 'Why This Artwork?'}
                    </h3>
                    <p className="text-slate-300 leading-relaxed italic text-xs md:text-sm">
                      "{artwork.curatorNote}"
                    </p>
                  </div>
                )}

                {/* Match Information */}
                {artwork.matchPercent && (
                  <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-700/30 rounded-xl p-3 md:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold text-sm md:text-base">
                        {language === 'ko' ? '성격 매치도' : 'Personality Match'}
                      </span>
                      <span className="text-lg md:text-2xl font-bold text-blue-400">{artwork.matchPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 md:h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 md:h-2 rounded-full transition-all duration-700"
                        style={{ width: `${artwork.matchPercent}%` }}
                      />
                    </div>
                    <p className="text-slate-400 text-xs md:text-sm mt-1 md:mt-2">
                      {language === 'ko' 
                        ? `${userType} 유형과의 호환도를 나타냅니다`
                        : `Compatibility with ${userType} personality type`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}