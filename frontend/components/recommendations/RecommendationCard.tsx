'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Calendar, Clock, Star, Users } from 'lucide-react';
import Image from 'next/image';

interface Recommendation {
  id: string;
  title: string;
  subtitle?: string;
  institution_name: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  poster_url?: string;
  genres: string[];
  artists: string[];
  ticket_price?: {
    adult?: number;
    student?: number;
  };
  recommendation_type: 'content_based' | 'collaborative' | 'knowledge_based';
  recommendation_reason: string;
  avg_rating?: number;
  view_count?: number;
  final_score?: number;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onLike?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onView?: (id: string) => void;
  compact?: boolean;
}

export default function RecommendationCard({
  recommendation,
  onLike,
  onBookmark,
  onView,
  compact = false
}: RecommendationCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(recommendation.id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.(recommendation.id);
  };

  const handleCardClick = () => {
    onView?.(recommendation.id);
  };

  const getRecommendationTypeIcon = () => {
    switch (recommendation.recommendation_type) {
      case 'content_based':
        return '🎯';
      case 'collaborative':
        return '👥';
      case 'knowledge_based':
        return '🧠';
      default:
        return '✨';
    }
  };

  const getRecommendationTypeColor = () => {
    switch (recommendation.recommendation_type) {
      case 'content_based':
        return 'bg-blue-100 text-blue-800';
      case 'collaborative':
        return 'bg-green-100 text-green-800';
      case 'knowledge_based':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return '무료';
    return `₩${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getGenreEmoji = (genre: string) => {
    const genreEmojis: Record<string, string> = {
      'contemporary': '🎨',
      'classical': '🏛️',
      'photography': '📸',
      'sculpture': '🗿',
      'digital': '💻',
      'installation': '🎪',
      'abstract': '🌀',
      'realism': '🖼️'
    };
    return genreEmojis[genre] || '🎭';
  };

  if (compact) {
    return (
      <motion.div
        className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-all"
        whileHover={{ scale: 1.02 }}
        onClick={handleCardClick}
      >
        <div className="flex gap-3">
          {recommendation.poster_url && (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={recommendation.poster_url}
                alt={recommendation.title}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate">{recommendation.title}</h3>
            <p className="text-xs text-gray-600 truncate">{recommendation.institution_name}</p>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                {formatDate(recommendation.start_date)} - {formatDate(recommendation.end_date)}
              </span>
              {recommendation.avg_rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{recommendation.avg_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleLike}
            className={`p-1 rounded ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.03, y: -5 }}
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 이미지 섹션 */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
        {recommendation.poster_url ? (
          <Image
            src={recommendation.poster_url}
            alt={recommendation.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl opacity-50">🎨</div>
          </div>
        )}
        
        {/* 추천 타입 배지 */}
        <div className="absolute top-3 left-3">
          <span className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            ${getRecommendationTypeColor()}
          `}>
            <span>{getRecommendationTypeIcon()}</span>
            AI 추천
          </span>
        </div>

        {/* 액션 버튼들 */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full bg-white/90 backdrop-blur-sm ${
              isBookmarked ? 'text-blue-500' : 'text-gray-600'
            } hover:bg-white transition-colors`}
          >
            <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button
            onClick={handleLike}
            className={`p-2 rounded-full bg-white/90 backdrop-blur-sm ${
              isLiked ? 'text-red-500' : 'text-gray-600'
            } hover:bg-white transition-colors`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* 평점 표시 */}
        {recommendation.avg_rating && (
          <div className="absolute bottom-3 right-3">
            <div className="bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{recommendation.avg_rating.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* 정보 섹션 */}
      <div className="p-5">
        {/* 제목 및 기관 */}
        <div className="mb-3">
          <h3 className="font-bold text-lg mb-1 line-clamp-2">{recommendation.title}</h3>
          {recommendation.subtitle && (
            <p className="text-gray-600 text-sm mb-2">{recommendation.subtitle}</p>
          )}
          <p className="text-gray-700 font-medium">{recommendation.institution_name}</p>
        </div>

        {/* 위치 및 날짜 */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{recommendation.city}, {recommendation.country}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(recommendation.start_date)} - {formatDate(recommendation.end_date)}
            </span>
          </div>
        </div>

        {/* 장르 태그 */}
        {recommendation.genres && recommendation.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {recommendation.genres.slice(0, 3).map((genre, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                <span>{getGenreEmoji(genre)}</span>
                {genre}
              </span>
            ))}
            {recommendation.genres.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{recommendation.genres.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 추천 이유 */}
        <div className="bg-purple-50 p-3 rounded-lg mb-3">
          <p className="text-sm text-purple-800">
            <span className="font-medium">추천 이유:</span> {recommendation.recommendation_reason}
          </p>
        </div>

        {/* 하단 정보 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {recommendation.ticket_price && (
              <div className="flex items-center gap-1">
                <span>💰</span>
                <span>{formatPrice(recommendation.ticket_price.adult)}</span>
              </div>
            )}
            {recommendation.view_count && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recommendation.view_count.toLocaleString()}</span>
              </div>
            )}
          </div>
          
          {recommendation.final_score && (
            <div className="text-xs text-gray-500">
              매칭도: {Math.round(recommendation.final_score * 20)}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}