'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ExhibitionSession {
  id: string;
  exhibitionId: string;
  exhibitionName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export default function ExhibitionMode() {
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<ExhibitionSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const router = useRouter();

  // 타이머 업데이트
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && currentSession) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - currentSession.startTime);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, currentSession]);

  // 관람 시작
  const startSession = async () => {
    try {
      // TODO: 현재 전시 정보 가져오기
      const exhibitionData = {
        id: 'temp-id',
        name: '현재 전시명'
      };

      const session: ExhibitionSession = {
        id: `session-${Date.now()}`,
        exhibitionId: exhibitionData.id,
        exhibitionName: exhibitionData.name,
        startTime: Date.now()
      };

      setCurrentSession(session);
      setIsActive(true);
      
      // 로컬 스토리지에 저장 (앱 종료 대비)
      localStorage.setItem('activeSession', JSON.stringify(session));
      
      toast.success('전시 관람을 시작합니다! 🎨');
      
      // 포인트 획득
      await earnPoints('startExhibition', 10);
      
    } catch (error) {
      toast.error('관람 시작에 실패했습니다');
    }
  };

  // 관람 종료
  const endSession = async () => {
    if (!currentSession) return;
    
    try {
      const duration = Date.now() - currentSession.startTime;
      const minutes = Math.floor(duration / 60000);
      
      // 세션 종료
      const completedSession = {
        ...currentSession,
        endTime: Date.now(),
        duration: minutes
      };
      
      // API 호출
      await saveSession(completedSession);
      
      // 포인트 획득
      await earnPoints('completeExhibition', 50);
      
      // 상태 초기화
      setIsActive(false);
      setCurrentSession(null);
      setElapsedTime(0);
      localStorage.removeItem('activeSession');
      
      // 결과 표시
      toast.success(
        <div>
          <div>관람을 완료했습니다! 🎉</div>
          <div className="text-sm">관람 시간: {minutes}분</div>
          <div className="text-sm">+50 포인트 획득!</div>
        </div>
      );
      
      // 칭호 체크
      checkAchievements();
      
    } catch (error) {
      toast.error('관람 종료 처리에 실패했습니다');
    }
  };

  // 시간 포맷팅
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // API 함수들
  const earnPoints = async (activity: string, points: number) => {
    // TODO: 실제 API 호출
    console.log(`Earned ${points} points for ${activity}`);
  };

  const saveSession = async (session: ExhibitionSession) => {
    // TODO: 실제 API 호출
    console.log('Session saved:', session);
  };

  const checkAchievements = async () => {
    // TODO: 칭호 달성 체크 API
    console.log('Checking achievements...');
  };

  return (
    <>
      {/* 플로팅 위젯 */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isActive ? (
          <button
            onClick={startSession}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white 
                     rounded-full shadow-lg hover:bg-gray-800 transition-all
                     hover:scale-105"
          >
            <span className="text-xl">🎨</span>
            <span className="font-medium">전시 관람 시작</span>
          </button>
        ) : (
          <div className="bg-black text-white rounded-full shadow-lg 
                        flex items-center gap-4 px-6 py-3">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">{formatTime(elapsedTime)}</span>
              <span className="text-xs opacity-80">관람 중</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <button
              onClick={endSession}
              className="px-4 py-2 bg-white/20 rounded-full 
                       hover:bg-white/30 transition-colors text-sm"
            >
              종료
            </button>
          </div>
        )}
      </div>

      {/* 상단 미니 상태바 (선택적) */}
      {isActive && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-40">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 
                     transition-all duration-1000"
            style={{
              width: `${Math.min((elapsedTime / (120 * 60 * 1000)) * 100, 100)}%`
            }}
          />
        </div>
      )}
    </>
  );
}