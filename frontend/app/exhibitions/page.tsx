'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Grid, List, MapPin } from 'lucide-react';
import ExhibitionCalendar from '@/components/calendar/ExhibitionCalendar';
import { AddToCalendarButton } from '@/components/calendar/AddToCalendarButton';
import FeedbackButton from '@/components/feedback/FeedbackButton';
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
  venues: {
    name: string;
    city: string;
    website?: string;
  };
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const personalityDescriptions: Record<string, string> = {
  'LAEF': '감성적이고 자유로운 예술 애호가',
  'LAEC': '감성적이고 체계적인 예술 애호가',
  'LSEF': '사교적이고 자유로운 예술 애호가',
  'LSEC': '사교적이고 체계적인 예술 애호가',
  'LREF': '이성적이고 자유로운 예술 애호가',
  'LREC': '이성적이고 체계적인 예술 애호가',
  'LMEF': '신비로운 자유로운 예술 애호가',
  'LMEC': '신비롭고 체계적인 예술 애호가',
  'SAEF': '감성적이고 자유로운 예술 탐험가',
  'SAEC': '감성적이고 체계적인 예술 탐험가',
  'SSEF': '사교적이고 자유로운 예술 탐험가',
  'SSEC': '사교적이고 체계적인 예술 탐험가',
  'SREF': '이성적이고 자유로운 예술 탐험가',
  'SREC': '이성적이고 체계적인 예술 탐험가',
  'SMEF': '신비롭고 자유로운 예술 탐험가',
  'SMEC': '신비롭고 체계적인 예술 탐험가'
};

export default function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [filteredExhibitions, setFilteredExhibitions] = useState<Exhibition[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userPersonality, setUserPersonality] = useState<string | null>(null);
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user personality from localStorage
    const storedResult = localStorage.getItem('quizResult');
    if (storedResult) {
      const result = JSON.parse(storedResult);
      setUserPersonality(result.personalityType);
    }
    
    // Fetch exhibitions from API
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/exhibitions?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch exhibitions');
      
      const data = await response.json();
      setExhibitions(data.data || []);
      setFilteredExhibitions(data.data || []);
    } catch (err) {
      setError('전시 정보를 불러오는데 실패했습니다');
      console.error('Error fetching exhibitions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter exhibitions
    let filtered = [...exhibitions];

    // Filter by status (show ongoing and upcoming first)
    if (showOnlyRecommended) {
      filtered = filtered.filter(ex => ex.status === 'ongoing' || ex.status === 'upcoming');
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(ex => 
        ex.tags.some(tag => selectedTags.includes(tag))
      );
    }

    // Sort by status priority (ongoing > upcoming > ended)
    filtered.sort((a, b) => {
      const statusOrder = { ongoing: 0, upcoming: 1, ended: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    setFilteredExhibitions(filtered);
  }, [exhibitions, selectedTags, showOnlyRecommended]);

  const allTags = Array.from(new Set(exhibitions.flatMap(ex => ex.tags)));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">오류가 발생했습니다</h2>
          <p className="text-white/80 mb-8">{error}</p>
          <button
            onClick={fetchExhibitions}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            다시 시도
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
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            전시 둘러보기 🎨
          </h1>
          <p className="text-xl text-white/80">
            전국 주요 미술관의 전시를 확인하세요
          </p>
        </motion.div>

        {/* Filter Section */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            {/* View Mode Toggle */}
            <div className="flex bg-white/20 rounded-full p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-800'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Grid className="w-4 h-4" />
                그리드
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-800'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Calendar className="w-4 h-4" />
                캘린더
              </button>
            </div>
            
            <button
              onClick={() => setShowOnlyRecommended(!showOnlyRecommended)}
              className={`px-6 py-2 rounded-full transition-all ${
                showOnlyRecommended
                  ? 'bg-green-600 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {showOnlyRecommended ? '✅ 진행중/예정 전시만' : '📅 진행중/예정 전시만'}
            </button>
            <Link
              href="/exhibitions/submit"
              className="px-6 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all"
            >
              ➕ 전시 정보 제보
            </Link>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">태그로 필터링</h3>
          <div className="flex flex-wrap gap-3">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <ExhibitionCalendar 
            initialDate={new Date()}
            viewMode="month"
            showFilters={true}
            userId={userPersonality || undefined}
          />
        )}

        {/* Exhibition Grid - only show when viewMode is 'grid' */}
        {viewMode === 'grid' && (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExhibitions.map((exhibition, index) => (
              <motion.div
                key={exhibition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer group"
              >
                {/* Exhibition Image */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400" />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(exhibition.status)}`}>
                      {getStatusText(exhibition.status)}
                    </span>
                  </div>
                </div>

                {/* Exhibition Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {exhibition.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-white/60" />
                    <span className="text-white/80">{exhibition.venues.name}</span>
                  </div>
                  
                  <p className="text-white/60 text-sm mb-4">
                    {formatDate(exhibition.start_date)} - {formatDate(exhibition.end_date)}
                  </p>
                  
                  <p className="text-white/80 text-sm mb-4 line-clamp-3">
                    {exhibition.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {exhibition.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-white/20 px-2 py-1 rounded-full text-xs text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between items-center mb-4 text-sm text-white/60">
                    <span>👀 {exhibition.view_count}</span>
                    <span>❤️ {exhibition.like_count}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link
                      href={`/exhibitions/${exhibition.id}`}
                      className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
                    >
                      자세히 보기 →
                    </Link>
                    
                    {/* Add to Calendar Button */}
                    <AddToCalendarButton
                      exhibition={{
                        id: exhibition.id,
                        title: exhibition.title,
                        institution_name: exhibition.venue_name,
                        address: exhibition.venues?.name || exhibition.venue_name,
                        city: exhibition.venue_city,
                        start_date: exhibition.start_date,
                        end_date: exhibition.end_date,
                        description: exhibition.description,
                        website_url: exhibition.venues?.website || `${window.location.origin}/exhibitions/${exhibition.id}`
                      }}
                      variant="minimal"
                      size="sm"
                    />
                  </div>
                </div>
              </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Empty State - only show for grid view */}
        {viewMode === 'grid' && filteredExhibitions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🎭</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              조건에 맞는 전시가 없습니다
            </h2>
            <p className="text-white/80 mb-8">
              다른 필터를 선택해보세요
            </p>
            <button
              onClick={() => {
                setSelectedTags([]);
                setShowOnlyRecommended(false);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full transition-colors"
            >
              필터 초기화
            </button>
          </motion.div>
        )}

        {/* Fixed Feedback Button */}
        <FeedbackButton
          position="fixed"
          variant="primary"
          contextData={{
            page: 'exhibitions',
            personalityType: userPersonality || undefined,
            feature: 'exhibition-browsing'
          }}
        />
      </div>
    </div>
  );
}