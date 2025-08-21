import { useState, useEffect, useCallback } from 'react';

export interface CloudinaryArtwork {
  id: string;
  title: string;
  artist: string;
  year?: string;
  imageUrl: string;
  thumbnail: string;
  style?: string;
  museum?: string;
  description?: string;
  curatorNote?: string;
  matchPercent?: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  tags?: string[];
}

interface UseCloudinaryArtworksOptions {
  userType?: string;
  limit?: number;
  offset?: number;
  random?: boolean;
  autoLoad?: boolean;
}

interface UseCloudinaryArtworksReturn {
  artworks: CloudinaryArtwork[];
  loading: boolean;
  error: Error | null;
  total: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCloudinaryArtworks(
  options: UseCloudinaryArtworksOptions = {}
): UseCloudinaryArtworksReturn {
  const {
    userType = 'DEFAULT',
    limit = 20,  // 기본값을 50에서 20으로 줄여서 초기 로딩 속도 개선
    offset: initialOffset = 0,
    random = false,
    autoLoad = true
  } = options;

  const [artworks, setArtworks] = useState<CloudinaryArtwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(true);

  const fetchArtworks = useCallback(async (
    currentOffset: number,
    append: boolean = false
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userType,
        limit: limit.toString(),
        offset: currentOffset.toString(),
        random: random.toString()
      });

      const response = await fetch(`/api/gallery/artworks?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch artworks');
      }

      const data = await response.json();
      
      if (data.success) {
        setArtworks(prev => append ? [...prev, ...data.data] : data.data);
        setTotal(data.total);
        setHasMore((currentOffset + limit) < data.total);
      } else {
        throw new Error(data.error || 'Failed to fetch artworks');
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching artworks:', err);
    } finally {
      setLoading(false);
    }
  }, [userType, limit, random]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    const newOffset = offset + limit;
    setOffset(newOffset);
    await fetchArtworks(newOffset, true);
  }, [offset, limit, loading, hasMore, fetchArtworks]);

  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchArtworks(0, false);
  }, [fetchArtworks]);

  useEffect(() => {
    if (autoLoad) {
      fetchArtworks(initialOffset, false);
    }
  }, [userType, autoLoad]); // fetchArtworks는 의존성에서 제외 (무한 루프 방지)

  return {
    artworks,
    loading,
    error,
    total,
    hasMore,
    loadMore,
    refresh
  };
}

// 특정 유형에 최적화된 작품 가져오기
export function usePersonalizedArtworks(userType: string, limit: number = 20) {
  return useCloudinaryArtworks({
    userType,
    limit,
    random: true,
    autoLoad: true
  });
}

// 무한 스크롤용 Hook
export function useInfiniteArtworks(userType: string = 'DEFAULT') {
  const [allArtworks, setAllArtworks] = useState<CloudinaryArtwork[]>([]);
  const { artworks, loading, hasMore, loadMore } = useCloudinaryArtworks({
    userType,
    limit: 20,
    autoLoad: true
  });

  useEffect(() => {
    setAllArtworks(prev => {
      const newIds = new Set(prev.map(a => a.id));
      const uniqueNew = artworks.filter(a => !newIds.has(a.id));
      return [...prev, ...uniqueNew];
    });
  }, [artworks]);

  return {
    artworks: allArtworks,
    loading,
    hasMore,
    loadMore
  };
}

// 검색용 Hook
export function useSearchArtworks(query: string) {
  const [results, setResults] = useState<CloudinaryArtwork[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const searchArtworks = async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/gallery/artworks/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchArtworks, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { results, searching };
}