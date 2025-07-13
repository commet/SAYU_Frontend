'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Star, Heart, MessageSquare, ChevronRight, Globe, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { reflectionsAPI, type Reflection } from '@/lib/reflections-api';
import { formatDistanceToNow } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ReflectionsListProps {
  userId?: string;
  exhibitionId?: string;
  limit?: number;
  showPublicFeed?: boolean;
}

export default function ReflectionsList({ 
  userId, 
  exhibitionId, 
  limit = 10,
  showPublicFeed = false 
}: ReflectionsListProps) {
  const { language } = useLanguage();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadReflections();
  }, [exhibitionId, page, showPublicFeed]);

  const loadReflections = async () => {
    try {
      setLoading(true);
      
      const response = showPublicFeed
        ? await reflectionsAPI.getPublicFeed({ limit, offset: page * limit })
        : await reflectionsAPI.getReflections({ 
            limit, 
            offset: page * limit,
            exhibition_id: exhibitionId 
          });

      if (page === 0) {
        setReflections(response.reflections);
      } else {
        setReflections(prev => [...prev, ...response.reflections]);
      }
      
      setHasMore(response.reflections.length === limit);
    } catch (error) {
      console.error('Error loading reflections:', error);
      toast.error(language === 'ko' ? '성찰을 불러오지 못했습니다' : 'Failed to load reflections');
    } finally {
      setLoading(false);
    }
  };

  const getEmotionEmoji = (emotion?: string) => {
    const emotionMap: Record<string, string> = {
      inspired: '✨',
      peaceful: '🕊️',
      thoughtful: '🤔',
      joyful: '😊',
      moved: '🥺',
      curious: '🔍'
    };
    return emotion ? emotionMap[emotion] || '💭' : '💭';
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading && page === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (!loading && reflections.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-semibold mb-2">
          {language === 'ko' ? '아직 성찰이 없습니다' : 'No reflections yet'}
        </h3>
        <p className="text-muted-foreground">
          {language === 'ko' 
            ? '전시 관람 후 느낀 점을 기록해보세요' 
            : 'Record your thoughts after visiting exhibitions'
          }
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {reflections.map((reflection, index) => (
          <motion.div
            key={reflection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {reflection.exhibition_name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {reflection.museum_name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {reflection.museum_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(reflection.visit_date), {
                          addSuffix: true,
                          locale: language === 'ko' ? ko : enUS
                        })}
                      </span>
                      {reflection.visit_duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {reflection.visit_duration}분
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Privacy & Rating */}
                  <div className="flex items-center gap-3">
                    {reflection.is_public ? (
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                    {reflection.overall_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{reflection.overall_rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emotion & Key Takeaway */}
                <div className="space-y-3 mb-4">
                  {reflection.emotion && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getEmotionEmoji(reflection.emotion)}</span>
                      <span className="text-sm capitalize">{reflection.emotion}</span>
                    </div>
                  )}
                  
                  {reflection.key_takeaway && (
                    <p className="text-sm font-medium italic text-primary">
                      "{reflection.key_takeaway}"
                    </p>
                  )}
                </div>

                {/* Reflection Text Preview */}
                {reflection.reflection_text && (
                  <div className="mb-4">
                    <p className={`text-sm leading-relaxed ${
                      !expandedId || expandedId !== reflection.id ? 'line-clamp-3' : ''
                    }`}>
                      {reflection.reflection_text}
                    </p>
                    {reflection.reflection_text.length > 150 && (
                      <button
                        onClick={() => toggleExpanded(reflection.id)}
                        className="text-sm text-primary hover:underline mt-1"
                      >
                        {expandedId === reflection.id 
                          ? (language === 'ko' ? '접기' : 'Show less')
                          : (language === 'ko' ? '더 보기' : 'Show more')
                        }
                      </button>
                    )}
                  </div>
                )}

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === reflection.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {reflection.favorite_artwork && (
                        <div className="pt-3 border-t">
                          <p className="text-sm text-muted-foreground mb-1">
                            {language === 'ko' ? '인상 깊었던 작품' : 'Favorite Artwork'}
                          </p>
                          <p className="text-sm">{reflection.favorite_artwork}</p>
                        </div>
                      )}
                      
                      {reflection.companion_name && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {language === 'ko' ? '함께한 사람' : 'Companion'}
                          </p>
                          <p className="text-sm">{reflection.companion_name}</p>
                        </div>
                      )}
                      
                      {(reflection.mood_before || reflection.mood_after) && (
                        <div className="flex gap-4">
                          {reflection.mood_before && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {language === 'ko' ? '관람 전' : 'Before'}
                              </p>
                              <p className="text-sm">{reflection.mood_before}</p>
                            </div>
                          )}
                          {reflection.mood_after && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {language === 'ko' ? '관람 후' : 'After'}
                              </p>
                              <p className="text-sm">{reflection.mood_after}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tags */}
                {reflection.tags && reflection.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {reflection.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    {showPublicFeed && reflection.profiles && (
                      <Link 
                        href={`/profile/${reflection.user_id}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                        <span>{reflection.profiles.username || 'Anonymous'}</span>
                      </Link>
                    )}
                  </div>
                  
                  <Link href={`/reflections/${reflection.id}`}>
                    <Button variant="ghost" size="sm">
                      {language === 'ko' ? '자세히 보기' : 'View Details'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
          >
            {loading 
              ? (language === 'ko' ? '불러오는 중...' : 'Loading...') 
              : (language === 'ko' ? '더 보기' : 'Load More')
            }
          </Button>
        </div>
      )}
    </div>
  );
}