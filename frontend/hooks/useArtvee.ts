import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';

const API_URL = API_CONFIG.baseUrl;

interface Artwork {
  artveeId: string;
  title: string;
  artist: string;
  year?: string;
  style?: string;
  period?: string;
  url: string;
  sayuType?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  cdnUrl?: string;
  cdnThumbnailUrl?: string;
  imageUrls?: {
    thumbnail: string;
    medium: string;
    full: string;
  };
}

interface ArtworkResponse {
  artworks: Artwork[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 성격 유형별 작품 가져오기
export function usePersonalityArtworks(sayuType: string, limit = 10) {
  return useQuery<{ success: boolean; data: Artwork[]; personality_type: string; count: number }>({
    queryKey: ['artvee', 'personality', sayuType, limit],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/api/artvee/personality/${sayuType}`,
        {
          params: { limit }
        }
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 30 * 60 * 1000, // 30분
    enabled: !!sayuType
  });
}

// 단일 작품 정보 가져오기
export function useArtwork(artveeId: string) {
  return useQuery<Artwork>({
    queryKey: ['artvee', 'artwork', artveeId],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/api/artvee/artworks/${artveeId}`
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10분
    cacheTime: 60 * 60 * 1000, // 1시간
    enabled: !!artveeId
  });
}

// 퀴즈용 작품 추천
export function useQuizArtworks(personalityType: string) {
  return useQuery<Artwork[]>({
    queryKey: ['artvee', 'quiz', personalityType],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/api/artvee/personality/${personalityType}`,
        {
          params: { limit: 6, usageType: 'personality_result' }
        }
      );
      return response.data.data || [];
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    enabled: !!personalityType
  });
}

// 작품 검색
export function useArtworkSearch(searchParams: {
  q?: string;
  artist?: string;
  style?: string;
  period?: string;
  limit?: number;
  offset?: number;
}) {
  const queryKey = ['artvee', 'search', searchParams];
  
  return useQuery<{
    results: Artwork[];
    total: number;
  }>({
    queryKey,
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/artvee/search`, {
        params: searchParams
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    enabled: !!(searchParams.q || searchParams.artist || searchParams.style || searchParams.period)
  });
}

// 인기 작품
export function usePopularArtworks(period: 'day' | 'week' | 'month' | 'all' = 'week') {
  return useQuery<Artwork[]>({
    queryKey: ['artvee', 'popular', period],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/artvee/popular`, {
        params: { period, limit: 20 }
      });
      return response.data.artworks;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000
  });
}

// 이미지 URL 생성 헬퍼
export function getArtworkImageUrl(artveeId: string, size: 'thumbnail' | 'medium' | 'full' = 'medium') {
  return `${API_URL}/api/artvee/images/${artveeId}?size=${size}`;
}