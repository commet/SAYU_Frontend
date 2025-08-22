'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, ArrowLeft, Calendar, MapPin, Clock, ExternalLink,
  Trash2, Eye, Users, Share2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SavedExhibition {
  id: string;
  exhibition_id: string;
  saved_at: string;
  notes?: string;
  reminder_date?: string;
  tags?: string[];
  exhibition?: {
    id: string;
    title: string;
    venues?: {
      name: string;
      location: string;
    };
    start_date: string;
    end_date: string;
    description?: string;
    image_url?: string;
    category?: string;
  };
}

export default function SavedExhibitionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [savedExhibitions, setSavedExhibitions] = useState<SavedExhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchSavedExhibitions();
  }, [user, router]);

  const fetchSavedExhibitions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exhibitions/save');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`HTTP ${response.status}: 저장된 전시를 불러오는데 실패했습니다`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Expected JSON but got:', contentType);
        const text = await response.text();
        console.error('Response text:', text.substring(0, 200));
        throw new Error('서버에서 올바르지 않은 응답을 받았습니다');
      }

      const result = await response.json();
      console.log('Saved exhibitions API response:', result);
      setSavedExhibitions(result.data || []);
    } catch (error) {
      console.error('Error fetching saved exhibitions:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (exhibitionId: string) => {
    try {
      const response = await fetch('/api/exhibitions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exhibitionId, action: 'unsave' })
      });

      if (response.ok) {
        setSavedExhibitions(prev => prev.filter(item => item.exhibition_id !== exhibitionId));
        toast.success('관심 전시에서 제거되었습니다');
      } else {
        throw new Error('제거하는데 실패했습니다');
      }
    } catch (error) {
      console.error('Error unsaving exhibition:', error);
      toast.error('제거하는데 실패했습니다');
    }
  };

  const getStatusColor = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'text-blue-300'; // upcoming
    if (now > end) return 'text-gray-400'; // ended
    return 'text-green-300'; // ongoing
  };

  const getStatusText = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return '예정';
    if (now > end) return '종료';
    return '진행중';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">저장된 전시를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={() => fetchSavedExhibitions()}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pb-20 relative"
      style={{ 
        backgroundImage: "url('/images/backgrounds/family-viewing-corner-gallery-intimate.jpg')" 
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white/10 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">내 관심 전시</h1>
              <p className="text-sm text-white/70">
                {savedExhibitions.length}개의 저장된 전시
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-6">
        {savedExhibitions.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              아직 저장된 전시가 없습니다
            </h2>
            <p className="text-white/70 mb-6">
              관심 있는 전시에 하트 버튼을 눌러 저장해보세요
            </p>
            <button
              onClick={() => router.push('/exhibitions')}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              전시 둘러보기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {savedExhibitions.map((item, index) => (
                <motion.div
                  key={`saved-${item.id}-${item.exhibition_id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20"
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => router.push(`/exhibitions/${item.exhibition_id}`)}
                  >
                      <div className="flex gap-4">
                        {/* Exhibition Image */}
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                          {item.exhibition?.image_url ? (
                            <img
                              src={item.exhibition.image_url}
                              alt={item.exhibition.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Calendar className="w-8 h-8 text-white/30" />
                            </div>
                          )}
                        </div>

                        {/* Exhibition Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">
                              {item.exhibition?.title || '전시 제목 없음'}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnsave(item.exhibition_id);
                              }}
                              className="p-1 rounded-full hover:bg-white/10 transition-colors ml-2"
                            >
                              <Heart className="w-4 h-4 text-pink-400 fill-current" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-white/60" />
                              <span className="text-xs text-white/80 truncate">
                                {item.exhibition?.venues?.name || '장소 정보 없음'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-white/60" />
                                <span className="text-xs text-white/80">
                                  {item.exhibition?.end_date 
                                    ? `${new Date(item.exhibition.end_date).toLocaleDateString('ko-KR')}까지`
                                    : '종료일 정보 없음'
                                  }
                                </span>
                              </div>
                              {item.exhibition?.start_date && item.exhibition?.end_date && (
                                <span className={`text-xs font-medium ${getStatusColor(item.exhibition.start_date, item.exhibition.end_date)}`}>
                                  {getStatusText(item.exhibition.start_date, item.exhibition.end_date)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-white/50">
                              {new Date(item.saved_at).toLocaleDateString('ko-KR')} 저장
                            </span>
                            <ExternalLink className="w-3 h-3 text-white/40" />
                          </div>
                        </div>
                      </div>
                    </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}