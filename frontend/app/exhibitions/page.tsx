'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Exhibition {
  id: string;
  title: string;
  museum: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  description: string;
  recommendedFor: string[];
  tags: string[];
  bookingUrl: string;
}

const mockExhibitions: Exhibition[] = [
  {
    id: '1',
    title: '모네와 빛의 정원',
    museum: '국립현대미술관',
    location: '서울',
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    imageUrl: '/api/placeholder/400/300',
    description: '인상주의의 거장 클로드 모네의 대표작을 만나보세요. 빛과 색채의 마법을 경험할 수 있습니다.',
    recommendedFor: ['LAEF', 'LSEF', 'SAEF'],
    tags: ['인상주의', '자연', '빛'],
    bookingUrl: 'https://www.mmca.go.kr'
  },
  {
    id: '2',
    title: '피카소: 큐비즘의 혁명',
    museum: '서울시립미술관',
    location: '서울',
    startDate: '2024-02-15',
    endDate: '2024-05-15',
    imageUrl: '/api/placeholder/400/300',
    description: '20세기 미술을 혁신한 피카소의 큐비즘 작품을 중심으로 그의 예술 세계를 탐험합니다.',
    recommendedFor: ['LREC', 'LREF', 'SREC'],
    tags: ['큐비즘', '현대미술', '혁신'],
    bookingUrl: 'https://sema.seoul.go.kr'
  },
  {
    id: '3',
    title: '한국 현대미술의 흐름',
    museum: '리움미술관',
    location: '서울',
    startDate: '2024-04-01',
    endDate: '2024-07-31',
    imageUrl: '/api/placeholder/400/300',
    description: '1950년대부터 현재까지 한국 현대미술의 발전과 변화를 조망하는 대규모 기획전입니다.',
    recommendedFor: ['LMEC', 'SMEC', 'LREC'],
    tags: ['한국미술', '현대미술', '역사'],
    bookingUrl: 'https://www.leeum.org'
  },
  {
    id: '4',
    title: '반 고흐: 별이 빛나는 밤',
    museum: '예술의전당',
    location: '서울',
    startDate: '2024-03-15',
    endDate: '2024-06-15',
    imageUrl: '/api/placeholder/400/300',
    description: '후기 인상주의의 거장 반 고흐의 삶과 예술을 조명하는 특별전입니다.',
    recommendedFor: ['LAEF', 'LMEF', 'SAEF'],
    tags: ['후기인상주의', '감정', '색채'],
    bookingUrl: 'https://www.sac.or.kr'
  },
  {
    id: '5',
    title: '미디어 아트: 디지털 캔버스',
    museum: '아모레퍼시픽미술관',
    location: '서울',
    startDate: '2024-05-01',
    endDate: '2024-08-31',
    imageUrl: '/api/placeholder/400/300',
    description: '최신 기술과 예술이 만나는 미디어 아트의 현재와 미래를 탐구합니다.',
    recommendedFor: ['SSEF', 'SAEF', 'LSEF'],
    tags: ['미디어아트', '기술', '미래'],
    bookingUrl: 'https://www.apma.kr'
  },
  {
    id: '6',
    title: '조선시대 민화전',
    museum: '국립중앙박물관',
    location: '서울',
    startDate: '2024-04-15',
    endDate: '2024-07-15',
    imageUrl: '/api/placeholder/400/300',
    description: '조선시대 서민들의 소망과 해학이 담긴 민화를 통해 우리 전통 미술의 아름다움을 재발견합니다.',
    recommendedFor: ['LMEC', 'LREC', 'SMEC'],
    tags: ['전통미술', '민화', '한국'],
    bookingUrl: 'https://www.museum.go.kr'
  }
];

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
  const [exhibitions, setExhibitions] = useState<Exhibition[]>(mockExhibitions);
  const [filteredExhibitions, setFilteredExhibitions] = useState<Exhibition[]>(mockExhibitions);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userPersonality, setUserPersonality] = useState<string | null>(null);
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);

  useEffect(() => {
    // Get user personality from localStorage
    const storedResult = localStorage.getItem('quizResult');
    if (storedResult) {
      const result = JSON.parse(storedResult);
      setUserPersonality(result.personalityType);
    }
  }, []);

  useEffect(() => {
    // Filter exhibitions
    let filtered = [...exhibitions];

    // Filter by personality recommendation
    if (showOnlyRecommended && userPersonality) {
      filtered = filtered.filter(ex => ex.recommendedFor.includes(userPersonality));
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(ex => 
        ex.tags.some(tag => selectedTags.includes(tag))
      );
    }

    setFilteredExhibitions(filtered);
  }, [exhibitions, selectedTags, showOnlyRecommended, userPersonality]);

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
            당신의 취향에 맞는 전시를 찾아보세요
          </p>
        </motion.div>

        {/* User Personality Display */}
        {userPersonality && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 text-center"
          >
            <p className="text-white/80 mb-2">당신의 미술 성향</p>
            <h2 className="text-3xl font-bold text-white mb-2">{userPersonality}</h2>
            <p className="text-white/70">{personalityDescriptions[userPersonality]}</p>
            
            <button
              onClick={() => setShowOnlyRecommended(!showOnlyRecommended)}
              className={`mt-4 px-6 py-2 rounded-full transition-all ${
                showOnlyRecommended
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {showOnlyRecommended ? '✅ 추천 전시만 보기' : '⭐ 추천 전시만 보기'}
            </button>
          </motion.div>
        )}

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

        {/* Exhibition Grid */}
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
                  {userPersonality && exhibition.recommendedFor.includes(userPersonality) && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                      추천 ⭐
                    </div>
                  )}
                </div>

                {/* Exhibition Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {exhibition.title}
                  </h3>
                  <p className="text-white/80 mb-1">{exhibition.museum}</p>
                  <p className="text-white/60 text-sm mb-4">
                    {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                  </p>
                  
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">
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

                  {/* Booking Button */}
                  <a
                    href={exhibition.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
                  >
                    예약하기 →
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredExhibitions.length === 0 && (
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
      </div>
    </div>
  );
}