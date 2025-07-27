// 작가 APT 매칭 API 클라이언트

import { apiClient } from '../apiClient';
import type { 
  APTMatchResult, 
  ArtistWithAPT, 
  APTCompatibility,
  APTStatistics 
} from '@/types/artist-apt';

interface MatchResponse {
  userAPT: {
    type: string;
    animal: string;
    title: string;
    color: string;
  };
  matches: APTMatchResult[];
  totalCount: number;
}

interface CompatibilityResponse extends APTCompatibility {
  recommendation: string;
}

interface StatisticsResponse {
  statistics: APTStatistics[];
  totalArtists: number;
}

export const artistAPTApi = {
  // 사용자 APT와 매칭되는 작가 찾기
  async getMatches(limit = 10, offset = 0): Promise<MatchResponse> {
    const response = await apiClient.get('/artist-apt/match', {
      params: { limit, offset }
    });
    return response.data;
  },

  // 특정 작가의 APT 프로필 조회
  async getArtistProfile(artistId: string): Promise<{ artist: any; aptProfile: any }> {
    const response = await apiClient.get(`/artist-apt/artist/${artistId}`);
    return response.data;
  },

  // APT 유형별 통계
  async getStatistics(): Promise<StatisticsResponse> {
    const response = await apiClient.get('/artist-apt/statistics');
    return response.data;
  },

  // 사용자와 작가의 호환성 계산
  async calculateCompatibility(artistId: string): Promise<CompatibilityResponse> {
    const response = await apiClient.post('/artist-apt/compatibility', {
      artistId
    });
    return response.data;
  }
};