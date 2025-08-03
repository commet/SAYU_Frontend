'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePersonalizedTheme } from '@/hooks/usePersonalizedTheme';

interface ExhibitionRecord {
  id: string;
  title: string;
  venue: string;
  visitDate: string;
  rating: number;
  review: string;
  images?: string[];
  badges?: string[];
  isWishlisted: boolean;
}

export default function ExhibitionHistoryPage() {
  const { user } = useAuth();
  const { theme } = usePersonalizedTheme();
  const [exhibitions, setExhibitions] = useState<ExhibitionRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'visited' | 'wishlist'>('all');
  const [loading, setLoading] = useState(true);

  // 임시 데이터
  useEffect(() => {
    const mockExhibitions: ExhibitionRecord[] = [
      {
        id: '1',
        title: '모네: 빛의 순간들',
        venue: '국립현대미술관',
        visitDate: '2024-01-15',
        rating: 5,
        review: '인상파의 거장 모네의 작품들을 직접 볼 수 있어서 감동적이었습니다. 특히 수련 연작은 정말 압도적이었어요.',
        badges: ['첫 관람', '5점 만점'],
        isWishlisted: false
      },
      {
        id: '2', 
        title: '디지털 아트의 미래',
        venue: '서울시립미술관',
        visitDate: '',
        rating: 0,
        review: '',
        isWishlisted: true
      },
      {
        id: '3',
        title: '한국 현대조각 100년',
        venue: '예술의전당',
        visitDate: '2024-02-03',
        rating: 4,
        review: '한국 조각사의 흐름을 한눈에 볼 수 있는 좋은 전시였습니다.',
        badges: ['미술관 애호가'],
        isWishlisted: false
      }
    ];
    
    setExhibitions(mockExhibitions);
    setLoading(false);
  }, []);

  const filteredExhibitions = exhibitions.filter(exhibition => {
    if (filter === 'visited') return exhibition.visitDate;
    if (filter === 'wishlist') return exhibition.isWishlisted;
    return true;
  });

  const visitedCount = exhibitions.filter(ex => ex.visitDate).length;
  const wishlistCount = exhibitions.filter(ex => ex.isWishlisted).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-lg text-slate-600">전시 기록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">전시 히스토리</h1>
          <p className="text-slate-600">나의 예술 여정을 기록하고 돌아보세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-blue-600">{visitedCount}</div>
            <div className="text-slate-600">방문한 전시</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-purple-600">{wishlistCount}</div>
            <div className="text-slate-600">관심 전시</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-green-600">{exhibitions.filter(ex => ex.badges?.length).length}</div>
            <div className="text-slate-600">획득한 뱃지</div>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('visited')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'visited' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            방문 완료
          </button>
          <button
            onClick={() => setFilter('wishlist')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'wishlist' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            관심 목록
          </button>
        </div>

        {/* 전시 목록 */}
        <div className="space-y-4">
          {filteredExhibitions.map((exhibition) => (
            <div key={exhibition.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-1">{exhibition.title}</h3>
                  <p className="text-slate-600">{exhibition.venue}</p>
                </div>
                {exhibition.isWishlisted && !exhibition.visitDate && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    관심 전시
                  </span>
                )}
              </div>

              {exhibition.visitDate && (
                <div className="mb-4">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm text-slate-500">방문일: {exhibition.visitDate}</span>
                    {exhibition.rating > 0 && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < exhibition.rating ? 'text-yellow-500' : 'text-slate-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {exhibition.review && (
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{exhibition.review}</p>
                  )}
                </div>
              )}

              {exhibition.badges && exhibition.badges.length > 0 && (
                <div className="flex gap-2">
                  {exhibition.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      🏆 {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredExhibitions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">
              {filter === 'visited' && '아직 방문한 전시가 없습니다.'}
              {filter === 'wishlist' && '관심 전시를 추가해보세요.'}
              {filter === 'all' && '전시 기록이 없습니다.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}