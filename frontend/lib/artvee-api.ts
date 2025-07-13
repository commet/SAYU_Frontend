/**
 * Artvee API 클라이언트
 * SAYU 플랫폼에서 Artvee 작품을 사용하기 위한 API
 */

interface ArtveeArtwork {
  id: string;
  title: string;
  artist: string;
  year_created?: string;
  period?: string;
  genre?: string;
  cdn_url?: string;
  thumbnail_url?: string;
  personality_tags: string[];
  emotion_tags: string[];
  relevance_score?: number;
}

interface ArtveeSearchParams {
  q?: string;
  artist?: string;
  period?: string;
  genre?: string;
  personalityType?: string;
  limit?: number;
  offset?: number;
}

interface ArtveeStats {
  total_artworks: number;
  active_artworks: number;
  processed_artworks: number;
  tagged_artworks: number;
  avg_quality_score: number;
  unique_artists: number;
  unique_periods: number;
  unique_genres: number;
}

interface PersonalityDistribution {
  personality_type: string;
  artwork_count: number;
  unique_artists: number;
  unique_periods: number;
  avg_quality: number;
}

class ArtveeAPI {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') {
    this.baseUrl = `${baseUrl}/api/artvee`;
  }

  /**
   * 성격 유형별 작품 조회
   */
  async getPersonalityArtworks(
    type: string, 
    limit: number = 10, 
    usage?: string
  ): Promise<ArtveeArtwork[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(usage && { usage })
    });

    const response = await fetch(`${this.baseUrl}/personality/${type}?${params}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch personality artworks');
    }

    const data = await response.json();
    return data.artworks;
  }

  /**
   * 퀴즈용 랜덤 작품
   */
  async getQuizArtworks(count: number = 4): Promise<ArtveeArtwork[]> {
    const response = await fetch(`${this.baseUrl}/quiz/random?count=${count}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quiz artworks');
    }

    const data = await response.json();
    return data.artworks;
  }

  /**
   * 작품 상세 정보
   */
  async getArtworkDetails(id: string): Promise<ArtveeArtwork & {
    dominant_color?: string;
    brightness_score?: number;
    saturation_score?: number;
    warmth_score?: number;
    detailed_description?: string;
    historical_context?: string;
    similar_artworks?: ArtveeArtwork[];
  }> {
    const response = await fetch(`${this.baseUrl}/artwork/${id}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Artwork not found');
    }

    const data = await response.json();
    return data.artwork;
  }

  /**
   * 개인화된 추천
   */
  async getRecommendations(limit: number = 20): Promise<{
    personalityType: string;
    recommendations: ArtveeArtwork[];
  }> {
    const response = await fetch(`${this.baseUrl}/recommendations?limit=${limit}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }

    const data = await response.json();
    return {
      personalityType: data.personalityType,
      recommendations: data.recommendations
    };
  }

  /**
   * 작품 검색
   */
  async searchArtworks(params: ArtveeSearchParams): Promise<{
    artworks: ArtveeArtwork[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/search?${searchParams}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    return data;
  }

  /**
   * 통계 조회
   */
  async getStats(): Promise<{
    stats: ArtveeStats;
    distribution: PersonalityDistribution[];
  }> {
    const response = await fetch(`${this.baseUrl}/stats`);

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    const data = await response.json();
    return data;
  }
}

// 싱글톤 인스턴스
export const artveeAPI = new ArtveeAPI();

// React Query 훅들
import { useQuery } from '@tanstack/react-query';

/**
 * 성격 유형별 작품 조회 훅
 */
export function usePersonalityArtworks(
  type: string, 
  limit?: number, 
  usage?: string
) {
  return useQuery({
    queryKey: ['artvee', 'personality', type, limit, usage],
    queryFn: () => artveeAPI.getPersonalityArtworks(type, limit, usage),
    staleTime: 5 * 60 * 1000, // 5분
    enabled: !!type
  });
}

/**
 * 퀴즈 작품 조회 훅
 */
export function useQuizArtworks(count?: number) {
  return useQuery({
    queryKey: ['artvee', 'quiz', count],
    queryFn: () => artveeAPI.getQuizArtworks(count),
    staleTime: 60 * 1000 // 1분
  });
}

/**
 * 작품 상세 조회 훅
 */
export function useArtworkDetails(id: string) {
  return useQuery({
    queryKey: ['artvee', 'artwork', id],
    queryFn: () => artveeAPI.getArtworkDetails(id),
    staleTime: 10 * 60 * 1000, // 10분
    enabled: !!id
  });
}

/**
 * 개인화 추천 훅
 */
export function useArtveeRecommendations(limit?: number) {
  return useQuery({
    queryKey: ['artvee', 'recommendations', limit],
    queryFn: () => artveeAPI.getRecommendations(limit),
    staleTime: 5 * 60 * 1000 // 5분
  });
}

/**
 * Artvee 통계 훅
 */
export function useArtveeStats() {
  return useQuery({
    queryKey: ['artvee', 'stats'],
    queryFn: () => artveeAPI.getStats(),
    staleTime: 30 * 60 * 1000 // 30분
  });
}