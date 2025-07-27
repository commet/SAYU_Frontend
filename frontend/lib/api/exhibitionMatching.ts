// 전시 동행 매칭 API 클라이언트
import { ApiResponse, api } from './base';

// ==================== 타입 정의 ====================

export interface ExhibitionMatchRequest {
  exhibitionId: string;
  preferredDate: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  preferredAptTypes?: string[];
  ageRange?: { min: number; max: number };
  genderPreference?: 'male' | 'female' | 'any';
  maxDistance?: number;
  language?: string[];
  interests?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'any';
}

export interface MatchCandidate {
  id: string;
  nickname: string;
  age: number;
  aptType: string;
  archetype: string;
  imageUrl?: string;
  matchScore: number;
  distanceKm: number;
  learningAdjustment?: number;
}

export interface ExhibitionMatch {
  id: string;
  exhibitionId: string;
  exhibitionName: string;
  exhibitionLocation: string;
  exhibitionImage?: string;
  preferredDate: string;
  timeSlot: string;
  status: 'open' | 'matched' | 'completed' | 'cancelled';
  isHost: boolean;
  matchedUser?: {
    nickname: string;
    aptType: string;
    imageUrl?: string;
  };
  matchedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export interface MatchingAnalytics {
  totalRequests: number;
  successfulMatches: number;
  completedMatches: number;
  averageMatchTimeHours: number;
  averageRating: number;
  totalFeedback: number;
  successRate: number;
}

export interface AptCompatibility {
  userAptType: string;
  targetAptType: string;
  compatibilityScore: number;
  compatibilityLevel: 'perfect' | 'excellent' | 'good' | 'fair' | 'moderate' | 'low';
}

// ==================== API 함수들 ====================

export class ExhibitionMatchingAPI {
  
  /**
   * 전시 동행 매칭 요청 생성
   */
  static async createMatchRequest(request: ExhibitionMatchRequest): Promise<ApiResponse<{
    matchRequest: {
      id: string;
      exhibitionId: string;
      preferredDate: string;
      timeSlot: string;
      status: string;
      expiresAt: string;
      createdAt: string;
    };
  }>> {
    return api.post('/matching/exhibition', request);
  }

  /**
   * 매칭 요청에 대한 호환 가능한 사용자 찾기
   */
  static async findMatches(matchRequestId: string): Promise<ApiResponse<{
    matchRequestId: string;
    matches: MatchCandidate[];
    total: number;
  }>> {
    return api.get(`/matching/exhibition/${matchRequestId}/matches`);
  }

  /**
   * 매칭 수락
   */
  static async acceptMatch(matchRequestId: string, candidateUserId: string): Promise<ApiResponse<{
    message: string;
    matchId: string;
  }>> {
    return api.post('/matching/exhibition/accept', {
      matchRequestId,
      candidateUserId
    });
  }

  /**
   * 매칭 거절
   */
  static async rejectMatch(matchRequestId: string, candidateUserId: string): Promise<ApiResponse<{
    message: string;
  }>> {
    return api.post('/matching/exhibition/reject', {
      matchRequestId,
      candidateUserId
    });
  }

  /**
   * 내 전시 동행 매칭 목록 조회
   */
  static async getMyMatches(params?: {
    status?: 'open' | 'matched' | 'completed' | 'cancelled';
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{
    matches: ExhibitionMatch[];
    total: number;
  }>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    return api.get(`/matching/exhibition/my-matches?${searchParams.toString()}`);
  }

  /**
   * 매칭 분석 데이터 조회
   */
  static async getAnalytics(): Promise<ApiResponse<{
    analytics: MatchingAnalytics;
  }>> {
    return api.get('/matching/analytics');
  }

  /**
   * APT 타입 간 호환성 점수 조회
   */
  static async getAptCompatibility(targetAptType: string): Promise<ApiResponse<AptCompatibility>> {
    return api.get(`/matching/apt-compatibility/${targetAptType}`);
  }

  /**
   * 실시간 매칭 알림 구독 (Server-Sent Events)
   */
  static subscribeToMatchingNotifications(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void
  ): EventSource {
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/matching/sse/notifications`, {
      withCredentials: true
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('SSE 메시지 파싱 오류:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE 연결 오류:', error);
      if (onError) onError(error);
    };

    return eventSource;
  }

  /**
   * WebSocket을 통한 실시간 매칭 알림
   */
  static connectToMatchingWebSocket(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') + '/matching/ws';
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('WebSocket 메시지 파싱 오류:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket 연결 오류:', error);
      if (onError) onError(error);
    };

    return ws;
  }
}

// ==================== React Hook 헬퍼 ====================

export interface UseExhibitionMatchingOptions {
  enableRealtime?: boolean;
  realtimeMethod?: 'websocket' | 'sse';
}

/**
 * 전시 동행 매칭을 위한 React Hook
 */
export function useExhibitionMatching(options: UseExhibitionMatchingOptions = {}) {
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [myMatches, setMyMatches] = useState<ExhibitionMatch[]>([]);
  const [analytics, setAnalytics] = useState<MatchingAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnection, setRealtimeConnection] = useState<EventSource | WebSocket | null>(null);

  // 매칭 요청 생성
  const createMatchRequest = useCallback(async (request: ExhibitionMatchRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ExhibitionMatchingAPI.createMatchRequest(request);
      if (response.success) {
        // 내 매칭 목록 새로고침
        await refreshMyMatches();
        return response.data.matchRequest;
      } else {
        throw new Error(response.error || 'Failed to create match request');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 매칭 찾기
  const findMatches = useCallback(async (matchRequestId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ExhibitionMatchingAPI.findMatches(matchRequestId);
      if (response.success) {
        setMatches(response.data.matches);
        return response.data.matches;
      } else {
        throw new Error(response.error || 'Failed to find matches');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 매칭 수락
  const acceptMatch = useCallback(async (matchRequestId: string, candidateUserId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ExhibitionMatchingAPI.acceptMatch(matchRequestId, candidateUserId);
      if (response.success) {
        // 내 매칭 목록 새로고침
        await refreshMyMatches();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to accept match');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 매칭 거절
  const rejectMatch = useCallback(async (matchRequestId: string, candidateUserId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ExhibitionMatchingAPI.rejectMatch(matchRequestId, candidateUserId);
      if (response.success) {
        // 매칭 목록에서 해당 후보자 제거
        setMatches(prev => prev.filter(match => match.id !== candidateUserId));
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to reject match');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 내 매칭 목록 새로고침
  const refreshMyMatches = useCallback(async () => {
    try {
      const response = await ExhibitionMatchingAPI.getMyMatches();
      if (response.success) {
        setMyMatches(response.data.matches);
      }
    } catch (err) {
      console.error('내 매칭 목록 로드 오류:', err);
    }
  }, []);

  // 분석 데이터 로드
  const loadAnalytics = useCallback(async () => {
    try {
      const response = await ExhibitionMatchingAPI.getAnalytics();
      if (response.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (err) {
      console.error('분석 데이터 로드 오류:', err);
    }
  }, []);

  // 실시간 알림 연결
  const connectRealtime = useCallback(() => {
    if (!options.enableRealtime) return;

    const handleMessage = (data: any) => {
      switch (data.type) {
        case 'matches_found':
          // 새로운 매칭이 발견되었을 때
          if (data.matchRequestId) {
            findMatches(data.matchRequestId);
          }
          break;
        case 'match_confirmed':
          // 매칭이 확정되었을 때
          refreshMyMatches();
          break;
        case 'new_match_opportunity':
          // 새로운 매칭 기회 알림
          refreshMyMatches();
          break;
      }
    };

    const handleError = (error: Event) => {
      console.error('실시간 연결 오류:', error);
      setError('실시간 연결에 문제가 발생했습니다.');
    };

    if (options.realtimeMethod === 'websocket') {
      const ws = ExhibitionMatchingAPI.connectToMatchingWebSocket(handleMessage, handleError);
      setRealtimeConnection(ws);
    } else {
      const sse = ExhibitionMatchingAPI.subscribeToMatchingNotifications(handleMessage, handleError);
      setRealtimeConnection(sse);
    }
  }, [options.enableRealtime, options.realtimeMethod, findMatches, refreshMyMatches]);

  // 실시간 연결 해제
  const disconnectRealtime = useCallback(() => {
    if (realtimeConnection) {
      if (realtimeConnection instanceof WebSocket) {
        realtimeConnection.close();
      } else if (realtimeConnection instanceof EventSource) {
        realtimeConnection.close();
      }
      setRealtimeConnection(null);
    }
  }, [realtimeConnection]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    refreshMyMatches();
    loadAnalytics();
    
    if (options.enableRealtime) {
      connectRealtime();
    }

    return () => {
      disconnectRealtime();
    };
  }, [options.enableRealtime]);

  return {
    // 상태
    matches,
    myMatches,
    analytics,
    isLoading,
    error,
    isRealtimeConnected: !!realtimeConnection,

    // 액션
    createMatchRequest,
    findMatches,
    acceptMatch,
    rejectMatch,
    refreshMyMatches,
    loadAnalytics,
    connectRealtime,
    disconnectRealtime,

    // 유틸리티
    clearError: () => setError(null)
  };
}

// ==================== 유틸리티 함수 ====================

export const matchingUtils = {
  /**
   * 호환성 점수를 색상으로 변환
   */
  getCompatibilityColor(score: number): string {
    if (score >= 90) return '#10B981'; // green
    if (score >= 80) return '#3B82F6'; // blue
    if (score >= 70) return '#8B5CF6'; // purple
    if (score >= 60) return '#F59E0B'; // amber
    if (score >= 50) return '#EF4444'; // red
    return '#6B7280'; // gray
  },

  /**
   * 호환성 레벨을 한국어로 변환
   */
  getCompatibilityLevelText(level: string): string {
    const levelTexts = {
      perfect: '완벽한 매칭',
      excellent: '매우 좋음',
      good: '좋음',
      fair: '보통',
      moderate: '적당함',
      low: '낮음'
    };
    return levelTexts[level as keyof typeof levelTexts] || '알 수 없음';
  },

  /**
   * 매칭 상태를 한국어로 변환
   */
  getMatchStatusText(status: string): string {
    const statusTexts = {
      open: '매칭 대기중',
      matched: '매칭 완료',
      completed: '만남 완료',
      cancelled: '취소됨'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  },

  /**
   * 시간대를 한국어로 변환
   */
  getTimeSlotText(timeSlot: string): string {
    const timeSlotTexts = {
      morning: '오전 (9:00-12:00)',
      afternoon: '오후 (13:00-17:00)',
      evening: '저녁 (18:00-21:00)'
    };
    return timeSlotTexts[timeSlot as keyof typeof timeSlotTexts] || timeSlot;
  },

  /**
   * 거리를 읽기 쉬운 형태로 포맷
   */
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  }
};

export default ExhibitionMatchingAPI;