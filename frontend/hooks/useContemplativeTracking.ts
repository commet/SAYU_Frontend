import { useEffect, useRef, useState, useCallback } from 'react';

interface ViewingData {
  artworkId: string;
  startTime: number;
  totalTime: number;
  depth: 'glance' | 'observe' | 'contemplate' | 'immerse';
  interactions: Array<{
    type: 'zoom' | 'detail' | 'info' | 'pause';
    timestamp: number;
  }>;
}

interface ContemplativeState {
  currentArtwork: string | null;
  viewingDepth: ViewingData['depth'];
  contemplationTime: number;
  isContemplating: boolean;
  shouldPrompt: boolean;
  promptType: 'pause' | 'discover' | 'connect' | 'reflect' | null;
}

export function useContemplativeTracking() {
  const [state, setState] = useState<ContemplativeState>({
    currentArtwork: null,
    viewingDepth: 'glance',
    contemplationTime: 0,
    isContemplating: false,
    shouldPrompt: false,
    promptType: null
  });

  const viewingDataRef = useRef<Map<string, ViewingData>>(new Map());
  const contemplationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef<number>(Date.now());
  const scrollSpeed = useRef<number>(0);

  // 깊이 단계 판단
  const getViewingDepth = (seconds: number): ViewingData['depth'] => {
    if (seconds < 5) return 'glance';
    if (seconds < 30) return 'observe';
    if (seconds < 120) return 'contemplate';
    return 'immerse';
  };

  // 프롬프트 타입 결정
  const determinePromptType = (depth: ViewingData['depth'], interactions: number): ContemplativeState['promptType'] => {
    if (depth === 'observe' && interactions === 0) return 'discover';
    if (depth === 'contemplate' && interactions < 2) return 'connect';
    if (depth === 'immerse') return 'reflect';
    return 'pause';
  };

  // 작품 감상 시작
  const startViewing = useCallback((artworkId: string) => {
    // 이전 작품 감상 종료
    if (state.currentArtwork) {
      endViewing(state.currentArtwork);
    }

    const viewingData: ViewingData = {
      artworkId,
      startTime: Date.now(),
      totalTime: 0,
      depth: 'glance',
      interactions: []
    };

    viewingDataRef.current.set(artworkId, viewingData);
    
    setState(prev => ({
      ...prev,
      currentArtwork: artworkId,
      viewingDepth: 'glance',
      contemplationTime: 0,
      isContemplating: true,
      shouldPrompt: false,
      promptType: null
    }));

    // 시간 추적 시작
    contemplationTimerRef.current = setInterval(() => {
      const data = viewingDataRef.current.get(artworkId);
      if (!data) return;

      const elapsed = (Date.now() - data.startTime) / 1000;
      data.totalTime = elapsed;
      data.depth = getViewingDepth(elapsed);

      setState(prev => ({
        ...prev,
        contemplationTime: elapsed,
        viewingDepth: data.depth
      }));

      // 특정 시점에 프롬프트 표시
      if (elapsed === 30 || elapsed === 60 || elapsed === 120) {
        const promptType = determinePromptType(data.depth, data.interactions.length);
        setState(prev => ({
          ...prev,
          shouldPrompt: true,
          promptType
        }));
      }
    }, 1000);
  }, [state.currentArtwork]);

  // 작품 감상 종료
  const endViewing = useCallback((artworkId: string) => {
    const data = viewingDataRef.current.get(artworkId);
    if (!data) return;

    // 타이머 정리
    if (contemplationTimerRef.current) {
      clearInterval(contemplationTimerRef.current);
      contemplationTimerRef.current = null;
    }

    // 의미 있는 감상인 경우 저장
    if (data.totalTime > 5) {
      saveViewingSession(data);
    }

    setState({
      currentArtwork: null,
      viewingDepth: 'glance',
      contemplationTime: 0,
      isContemplating: false,
      shouldPrompt: false,
      promptType: null
    });
  }, []);

  // 상호작용 기록
  const recordInteraction = useCallback((type: ViewingData['interactions'][0]['type']) => {
    if (!state.currentArtwork) return;

    const data = viewingDataRef.current.get(state.currentArtwork);
    if (!data) return;

    data.interactions.push({
      type,
      timestamp: Date.now()
    });
  }, [state.currentArtwork]);

  // 스크롤 속도 추적
  const trackScrollSpeed = useCallback(() => {
    const now = Date.now();
    const timeDelta = now - lastScrollTime.current;
    
    if (timeDelta > 0) {
      scrollSpeed.current = 1000 / timeDelta; // 초당 스크롤 횟수
    }
    
    lastScrollTime.current = now;

    // 빠른 스크롤 중이면 감상 종료
    if (scrollSpeed.current > 5 && state.currentArtwork) {
      endViewing(state.currentArtwork);
    }
  }, [state.currentArtwork, endViewing]);

  // 감상 세션 저장 (with retry logic)
  const saveViewingSession = async (data: ViewingData) => {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // 로그인하지 않은 경우 로컬에 저장
          const localSessions = JSON.parse(localStorage.getItem('localViewingSessions') || '[]');
          localSessions.push(data);
          localStorage.setItem('localViewingSessions', JSON.stringify(localSessions));
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contemplative/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            artworkId: data.artworkId,
            duration: data.totalTime,
            depth: data.depth,
            interactions: data.interactions,
            timestamp: new Date()
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return; // 성공 시 종료
        
      } catch (error) {
        retryCount++;
        console.error(`Failed to save viewing session (attempt ${retryCount}/${maxRetries}):`, error);
        
        if (retryCount < maxRetries) {
          // 지수 백오프로 재시도
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
        } else {
          // 최종 실패 시 로컬 저장
          const failedSessions = JSON.parse(localStorage.getItem('failedViewingSessions') || '[]');
          failedSessions.push({ ...data, failedAt: new Date() });
          localStorage.setItem('failedViewingSessions', JSON.stringify(failedSessions));
        }
      }
    }
  };

  // 프롬프트 닫기
  const dismissPrompt = useCallback(() => {
    setState(prev => ({
      ...prev,
      shouldPrompt: false,
      promptType: null
    }));
  }, []);

  // 클린업
  useEffect(() => {
    return () => {
      if (contemplationTimerRef.current) {
        clearInterval(contemplationTimerRef.current);
      }
      if (state.currentArtwork) {
        endViewing(state.currentArtwork);
      }
    };
  }, []);

  return {
    ...state,
    startViewing,
    endViewing,
    recordInteraction,
    trackScrollSpeed,
    dismissPrompt,
    getViewingHistory: () => Array.from(viewingDataRef.current.values())
  };
}