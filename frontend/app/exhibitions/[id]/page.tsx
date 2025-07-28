'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Heart, Eye, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import VenueInfoCard from '@/components/venue/VenueInfoCard';

interface Exhibition {
  id: string;
  title: string;
  venue_name: string;
  venue_city: string;
  start_date: string;
  end_date: string;
  description: string;
  tags: string[];
  status: 'ongoing' | 'upcoming' | 'ended';
  like_count: number;
  view_count: number;
  admission_fee: number;
  source_url?: string;
  venues: {
    name: string;
    city: string;
    website?: string;
    instagram?: string;
  };
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ExhibitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (params?.id) {
      fetchExhibition(params.id as string);
    }
  }, [params?.id]);

  const fetchExhibition = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/exhibitions/${id}`);
      if (!response.ok) throw new Error('Failed to fetch exhibition');
      
      const data = await response.json();
      setExhibition(data.data);
      setLikeCount(data.data.like_count);
    } catch (err) {
      setError('전시 정보를 불러오는데 실패했습니다');
      console.error('Error fetching exhibition:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!exhibition) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/exhibitions/${exhibition.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
      }
    } catch (err) {
      console.error('Error liking exhibition:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-500 text-white';
      case 'upcoming':
        return 'bg-blue-500 text-white';
      case 'ended':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing':
        return '진행중';
      case 'upcoming':
        return '예정';
      case 'ended':
        return '종료';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">전시 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !exhibition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">전시를 찾을 수 없습니다</h2>
          <p className="text-white/80 mb-8">{error}</p>
          <button
            onClick={() => router.push('/exhibitions')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            전시 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            뒤로가기
          </button>
        </motion.div>

        {/* Exhibition Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden"
        >
          {/* Hero Section */}
          <div className="relative h-64 bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(exhibition.status)}`}>
                    {getStatusText(exhibition.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  {exhibition.title}
                </h1>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-white/80">
                    <Calendar className="w-5 h-5" />
                    <span>{formatDate(exhibition.start_date)} - {formatDate(exhibition.end_date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-white/80">
                    <Clock className="w-5 h-5" />
                    <span>상태: {getStatusText(exhibition.status)}</span>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-white/80 leading-relaxed">
                    {exhibition.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {exhibition.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-white/20 px-3 py-1 rounded-full text-sm text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Venue Information */}
                <VenueInfoCard 
                  venueName={exhibition.venues.name}
                  venueCity={exhibition.venues.city}
                  venueWebsite={exhibition.venues.website}
                />

                {/* Stats */}
                <div className="bg-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">통계</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        조회수
                      </span>
                      <span className="text-white font-semibold">{exhibition.view_count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        좋아요
                      </span>
                      <span className="text-white font-semibold">{likeCount}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleLike}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                      liked
                        ? 'bg-red-500 text-white'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    {liked ? '좋아요 취소' : '좋아요'}
                  </button>

                  {exhibition.venues.website && (
                    <a
                      href={exhibition.venues.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      미술관 홈페이지
                    </a>
                  )}

                  {exhibition.source_url && (
                    <a
                      href={exhibition.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                      원본 소스
                    </a>
                  )}
                </div>

                {/* Admission */}
                <div className="bg-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">입장료</h3>
                  <p className="text-white/80">
                    {exhibition.admission_fee === 0 ? '무료' : `${exhibition.admission_fee.toLocaleString()}원`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <Link
            href="/exhibitions"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            다른 전시 보기
          </Link>
        </motion.div>
      </div>
    </div>
  );
}