// Database-powered recommendation system
// Connects to the backend's database recommendation service

interface Artist {
  name: string;
}

interface DatabaseArtwork {
  id: number;
  title: string;
  description: string;
  creation_date: string;
  medium: string;
  style: string;
  classification: string;
  image_url: string;
  thumbnail_url: string;
  cloudinary_url: string;
  source: string;
  source_url: string;
  institution_name: string;
  artists: string[];
  view_count: number;
  like_count: number;
  recommendationScore?: number;
  matchingFactors?: string[];
}

interface RecommendationResponse {
  success: boolean;
  personalityType: string;
  totalCount: number;
  recommendations: DatabaseArtwork[];
  recommendationReason: string;
}

interface SimilarArtworksResponse {
  success: boolean;
  baseArtwork: {
    id: number;
    title: string;
    artist: string;
  };
  similarArtworks: DatabaseArtwork[];
  personalityType?: string;
}

interface RecommendationStats {
  success: boolean;
  stats: {
    total_artworks: number;
    unique_styles: number;
    unique_institutions: number;
    unique_artists: number;
  };
}

class DatabaseRecommendationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  // 성격 유형별 맞춤 추천
  async getPersonalityRecommendations(
    personalityType: string, 
    limit: number = 10
  ): Promise<RecommendationResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/db-recommendations/personality/${personalityType}?limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching personality recommendations:', error);
      throw error;
    }
  }

  // 기본 추천 (성격 유형 없음)
  async getDefaultRecommendations(limit: number = 10): Promise<RecommendationResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/db-recommendations/default?limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching default recommendations:', error);
      throw error;
    }
  }

  // 유사 작품 추천
  async getSimilarArtworks(
    artworkId: number,
    personalityType?: string,
    limit: number = 5
  ): Promise<SimilarArtworksResponse> {
    try {
      let url = `${this.baseUrl}/api/db-recommendations/similar/${artworkId}?limit=${limit}`;
      if (personalityType) {
        url += `&personalityType=${personalityType}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching similar artworks:', error);
      throw error;
    }
  }

  // 사용자 맞춤 추천 (인증 필요)
  async getUserRecommendations(
    token: string,
    personalityType?: string,
    limit: number = 10
  ): Promise<RecommendationResponse> {
    try {
      let url = `${this.baseUrl}/api/db-recommendations/user?limit=${limit}`;
      if (personalityType) {
        url += `&personalityType=${personalityType}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user recommendations:', error);
      throw error;
    }
  }

  // 추천 시스템 통계
  async getRecommendationStats(): Promise<RecommendationStats> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/db-recommendations/stats`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recommendation stats:', error);
      throw error;
    }
  }

  // 추천 시스템 테스트
  async testRecommendationSystem(): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/db-recommendations/test`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing recommendation system:', error);
      throw error;
    }
  }

  // 이미지 URL 처리 (Cloudinary 우선, fallback 처리)
  getOptimizedImageUrl(artwork: DatabaseArtwork, size: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
    // Cloudinary URL이 있으면 우선 사용
    if (artwork.cloudinary_url) {
      const sizeTransforms = {
        thumbnail: 'w_200,h_200,c_fill',
        medium: 'w_400,h_400,c_fit',
        large: 'w_800,h_800,c_fit'
      };
      
      // Cloudinary URL에 변환 파라미터 추가
      return artwork.cloudinary_url.replace('/upload/', `/upload/${sizeTransforms[size]}/`);
    }

    // thumbnail_url이 있고 thumbnail 크기를 요청했으면 사용
    if (size === 'thumbnail' && artwork.thumbnail_url) {
      return artwork.thumbnail_url;
    }

    // 기본 image_url 사용
    return artwork.image_url || '/placeholder-artwork.jpg';
  }

  // 작품 정보 포맷팅
  formatArtworkForDisplay(artwork: DatabaseArtwork) {
    return {
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artists.length > 0 ? artwork.artists.join(', ') : 'Unknown Artist',
      year: artwork.creation_date ? new Date(artwork.creation_date).getFullYear() : null,
      medium: artwork.medium,
      style: artwork.style,
      description: artwork.description,
      institution: artwork.institution_name,
      source: artwork.source,
      sourceUrl: artwork.source_url,
      imageUrl: this.getOptimizedImageUrl(artwork, 'medium'),
      thumbnailUrl: this.getOptimizedImageUrl(artwork, 'thumbnail'),
      largeImageUrl: this.getOptimizedImageUrl(artwork, 'large'),
      stats: {
        views: artwork.view_count,
        likes: artwork.like_count
      },
      recommendation: {
        score: artwork.recommendationScore,
        factors: artwork.matchingFactors || []
      }
    };
  }

  // LocalStorage에서 성격 유형 가져오기
  getStoredPersonalityType(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const quizResult = localStorage.getItem('quizResult');
      if (quizResult) {
        const result = JSON.parse(quizResult);
        return result.personalityType || null;
      }
    } catch (error) {
      console.error('Error reading personality type from localStorage:', error);
    }
    
    return null;
  }

  // 자동 추천 (성격 유형 자동 감지)
  async getAutoRecommendations(limit: number = 10): Promise<RecommendationResponse> {
    const personalityType = this.getStoredPersonalityType();
    
    if (personalityType) {
      return this.getPersonalityRecommendations(personalityType, limit);
    } else {
      return this.getDefaultRecommendations(limit);
    }
  }
}

// 싱글톤 인스턴스 생성
const databaseRecommendationService = new DatabaseRecommendationService();

export default databaseRecommendationService;
export type { DatabaseArtwork, RecommendationResponse, SimilarArtworksResponse, RecommendationStats };