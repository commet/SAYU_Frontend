'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Star, Camera, Heart } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface ExhibitionVisit {
  id: string;
  exhibitionId: string;
  exhibitionTitle: string;
  museum: string;
  visitDate: string;
  duration: number; // in minutes
  rating?: number;
  photos?: string[];
  notes?: string;
  artworks: {
    id: string;
    title: string;
    artist: string;
    liked: boolean;
  }[];
  badges?: string[];
  points?: number;
}

interface ExhibitionRecordProps {
  visit: ExhibitionVisit;
  onEdit?: () => void;
  onShare?: () => void;
}

export default function ExhibitionRecord({ visit, onEdit, onShare }: ExhibitionRecordProps) {
  const { language } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return language === 'ko' ? `${hours}시간 ${mins}분` : `${hours}h ${mins}m`;
    }
    return language === 'ko' ? `${mins}분` : `${mins}m`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sayu-card mb-4"
      whileHover={{ scale: 1.01 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">{visit.exhibitionTitle}</h3>
          <p className="text-sm opacity-70 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {visit.museum}
          </p>
        </div>
        
        {visit.rating && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < visit.rating! ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Visit Info */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
          <Calendar className="w-4 h-4" />
          {formatDate(visit.visitDate)}
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
          <Clock className="w-4 h-4" />
          {formatDuration(visit.duration)}
        </div>
        {visit.photos && visit.photos.length > 0 && (
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
            <Camera className="w-4 h-4" />
            {visit.photos.length} {language === 'ko' ? '사진' : 'photos'}
          </div>
        )}
      </div>

      {/* Liked Artworks Preview */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-pink-500" />
          <span className="text-sm font-medium">
            {language === 'ko' ? '좋아한 작품' : 'Liked Artworks'} 
            ({visit.artworks.filter(a => a.liked).length})
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {visit.artworks.filter(a => a.liked).slice(0, 3).map((artwork) => (
            <motion.div
              key={artwork.id}
              className="flex-shrink-0 bg-white/10 px-3 py-2 rounded-lg text-xs"
              whileHover={{ scale: 1.05 }}
            >
              <div className="font-medium truncate max-w-[150px]">{artwork.title}</div>
              <div className="opacity-70">{artwork.artist}</div>
            </motion.div>
          ))}
          {visit.artworks.filter(a => a.liked).length > 3 && (
            <div className="flex-shrink-0 bg-white/10 px-3 py-2 rounded-lg text-xs flex items-center">
              +{visit.artworks.filter(a => a.liked).length - 3} more
            </div>
          )}
        </div>
      </div>

      {/* Badges & Points */}
      {(visit.badges || visit.points) && (
        <div className="flex items-center justify-between mb-4">
          {visit.badges && visit.badges.length > 0 && (
            <div className="flex gap-2">
              {visit.badges.map((badge, index) => (
                <motion.div
                  key={index}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  {badge[0]}
                </motion.div>
              ))}
            </div>
          )}
          
          {visit.points && (
            <div className="text-sm font-medium text-purple-400">
              +{visit.points} {language === 'ko' ? '포인트' : 'points'}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 sayu-button sayu-button-primary py-2 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {showDetails 
            ? (language === 'ko' ? '접기' : 'Hide Details')
            : (language === 'ko' ? '자세히 보기' : 'View Details')
          }
        </motion.button>
        
        {onShare && (
          <motion.button
            onClick={onShare}
            className="sayu-button py-2 px-4 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {language === 'ko' ? '공유' : 'Share'}
          </motion.button>
        )}
      </div>

      {/* Expanded Details */}
      <motion.div
        initial={false}
        animate={{ height: showDetails ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        {visit.notes && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg">
            <h4 className="text-sm font-medium mb-2">
              {language === 'ko' ? '메모' : 'Notes'}
            </h4>
            <p className="text-sm opacity-80">{visit.notes}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}