'use client';

import { useState, useEffect } from 'react';
import { venueApi } from '@/lib/api/venue';
import { Venue, VenueQueryParams } from '@/types/venue';
import { useLanguage } from '@/hooks/useLanguage'; // 언어 훅 (구현 필요)
import Image from 'next/image';

interface VenueListProps {
  initialCountry?: string;
  initialCity?: string;
  initialType?: 'museum' | 'gallery' | 'art_center' | 'cultural_center';
}

export default function VenueList({ 
  initialCountry = 'South Korea',
  initialCity,
  initialType
}: VenueListProps) {
  const { language } = useLanguage(); // 'ko' | 'en'
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // 필터 상태
  const [filters, setFilters] = useState<VenueQueryParams>({
    country: initialCountry,
    city: initialCity,
    type: initialType,
    limit: 20,
    lang: language
  });

  useEffect(() => {
    loadVenues();
  }, [filters, page, language]);

  const loadVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await venueApi.getVenues({
        ...filters,
        page,
        lang: language
      });
      
      setVenues(response.data);
      setHasMore(response.pagination.hasNext);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<VenueQueryParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // 필터 변경 시 첫 페이지로
  };

  if (loading && venues.length === 0) {
    return <VenueListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={loadVenues}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 필터 섹션 */}
      <VenueFilters 
        filters={filters}
        onChange={handleFilterChange}
        language={language}
      />
      
      {/* 장소 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map(venue => (
          <VenueCard 
            key={venue.id} 
            venue={venue} 
            language={language}
          />
        ))}
      </div>
      
      {/* 페이지네이션 */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '로딩 중...' : '더 보기'}
          </button>
        </div>
      )}
    </div>
  );
}

// 장소 카드 컴포넌트
function VenueCard({ venue, language }: { venue: Venue; language: 'ko' | 'en' }) {
  const getLocalizedName = () => {
    if (language === 'ko') {
      return venue.name_ko || venue.name;
    }
    return venue.name_en || venue.name;
  };

  const getLocalizedCity = () => {
    if (language === 'ko') {
      return venue.city_ko || venue.city;
    }
    return venue.city_en || venue.city;
  };

  const typeLabels = {
    ko: {
      museum: '박물관',
      gallery: '갤러리',
      art_center: '아트센터',
      cultural_center: '문화센터'
    },
    en: {
      museum: 'Museum',
      gallery: 'Gallery',
      art_center: 'Art Center',
      cultural_center: 'Cultural Center'
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {venue.images?.[0] && (
        <div className="relative w-full h-48">
          <Image 
            src={venue.images[0]} 
            alt={getLocalizedName()}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold line-clamp-1">
          {getLocalizedName()}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="px-2 py-1 bg-gray-100 rounded">
            {typeLabels[language][venue.venue_type]}
          </span>
          {venue.tier && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
              Tier {venue.tier}
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600">
          {getLocalizedCity()}, {venue.country}
        </p>
        
        {venue.rating && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm">{venue.rating.toFixed(1)}</span>
            {venue.review_count && (
              <span className="text-sm text-gray-500">
                ({venue.review_count})
              </span>
            )}
          </div>
        )}
        
        <div className="pt-2 flex gap-2">
          <button
            onClick={() => window.open(`/venues/${venue.id}`, '_blank')}
            className="text-blue-500 hover:underline text-sm font-medium"
          >
            {language === 'ko' ? '상세보기' : 'View Details'}
          </button>
          {venue.website && (
            <a 
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm"
            >
              {language === 'ko' ? '웹사이트' : 'Website'}
            </a>
          )}
          {venue.google_maps_uri && (
            <a 
              href={venue.google_maps_uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm"
            >
              {language === 'ko' ? '지도' : 'Map'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// 필터 컴포넌트
function VenueFilters({ 
  filters, 
  onChange,
  language 
}: { 
  filters: VenueQueryParams;
  onChange: (filters: Partial<VenueQueryParams>) => void;
  language: 'ko' | 'en';
}) {
  // 필터 UI 구현
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      {/* 필터 구현 */}
    </div>
  );
}

// 스켈레톤 로딩
function VenueListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
      ))}
    </div>
  );
}