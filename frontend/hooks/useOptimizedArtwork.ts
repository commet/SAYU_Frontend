import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Artwork {
  artveeId: string;
  title: string;
  artist: string;
  imageUrl?: string;
  sayuType?: string;
}

interface UseOptimizedArtworkProps {
  sayuType: string;
  limit?: number;
}

// React 19에서는 컴파일러가 자동으로 메모이제이션하므로 
// 실제로 필요한 경우에만 명시적으로 사용
export function useOptimizedArtwork({ sayuType, limit = 10 }: UseOptimizedArtworkProps) {
  const [filters, setFilters] = useState({
    artist: '',
    period: '',
    style: ''
  });

  // React 19 컴파일러가 자동 최적화하므로 useCallback 불필요
  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // 복잡한 계산이나 API 호출 결과만 메모이제이션
  const queryKey = useMemo(() => 
    ['artworks', sayuType, limit, filters], 
    [sayuType, limit, filters]
  );

  const { data: artworks, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value)
        )
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/artvee/personality/${sayuType}?${params}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch artworks');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분 (React Query v5에서 cacheTime 대신 gcTime 사용)
    enabled: !!sayuType
  });

  // 간단한 계산은 메모이제이션하지 않음 (React 19 컴파일러가 처리)
  const hasFilters = Object.values(filters).some(Boolean);
  const artworkCount = artworks?.data?.length || 0;

  return {
    artworks: artworks?.data || [],
    isLoading,
    error,
    filters,
    updateFilter,
    hasFilters,
    artworkCount
  };
}