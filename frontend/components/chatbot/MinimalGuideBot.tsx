'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';

// 핵심 도움말만 제공하는 최소한의 가이드봇
interface GuidePoint {
  trigger: 'first-visit' | 'confusion' | 'idle' | 'completion';
  message: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

// 페이지별 핵심 가이드 포인트
const GUIDE_POINTS: Record<string, GuidePoint[]> = {
  '/': [
    {
      trigger: 'first-visit',
      message: 'SAYU는 당신의 예술 취향을 발견하는 여정입니다',
      action: { label: '3분 테스트 시작하기', href: '/quiz' }
    }
  ],
  '/quiz': [
    {
      trigger: 'idle',
      message: '편안한 마음으로 선택해주세요. 정답은 없어요',
    }
  ],
  '/quiz/results': [
    {
      trigger: 'completion',
      message: '축하해요! 이제 당신만의 예술 여정이 시작됩니다',
      action: { label: '갤러리 둘러보기', href: '/gallery' }
    }
  ],
  '/gallery': [
    {
      trigger: 'first-visit',
      message: '마음에 드는 작품을 클릭해 자세히 감상해보세요',
    }
  ],
  '/profile': [
    {
      trigger: 'confusion',
      message: 'AI가 당신만의 특별한 아트 프로필을 만들어드려요',
      action: { label: 'AI 프로필 만들기', href: '/profile/art-profile' }
    }
  ]
};

export const MinimalGuideBot = () => {
  const pathname = usePathname();
  const { personalityType } = useUserProfile();
  const [isVisible, setIsVisible] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<GuidePoint | null>(null);
  const [hasInteracted, setHasInteracted] = useState<Set<string>>(new Set());
  const [idleTime, setIdleTime] = useState(0);

  // 페이지별 첫 방문 체크
  useEffect(() => {
    const visitedPages = localStorage.getItem('sayu_visited_pages');
    const visited = visitedPages ? JSON.parse(visitedPages) : [];
    
    if (!visited.includes(pathname)) {
      // 첫 방문
      const guides = GUIDE_POINTS[pathname] || [];
      const firstVisitGuide = guides.find(g => g.trigger === 'first-visit');
      
      if (firstVisitGuide && !hasInteracted.has(`${pathname}-first-visit`)) {
        setTimeout(() => {
          setCurrentGuide(firstVisitGuide);
          setIsVisible(true);
        }, 2000); // 2초 후 표시
      }
      
      // 방문 기록
      visited.push(pathname);
      localStorage.setItem('sayu_visited_pages', JSON.stringify(visited));
    }
  }, [pathname]);

  // Idle 감지 (15초)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const resetTimer = () => {
      setIdleTime(0);
      if (timer) clearTimeout(timer);
      
      timer = setTimeout(() => {
        const guides = GUIDE_POINTS[pathname] || [];
        const idleGuide = guides.find(g => g.trigger === 'idle');
        
        if (idleGuide && !hasInteracted.has(`${pathname}-idle`)) {
          setCurrentGuide(idleGuide);
          setIsVisible(true);
        }
      }, 15000);
    };

    // 사용자 활동 감지
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [pathname]);

  const handleClose = () => {
    if (currentGuide) {
      hasInteracted.add(`${pathname}-${currentGuide.trigger}`);
      setHasInteracted(new Set(hasInteracted));
    }
    setIsVisible(false);
    setCurrentGuide(null);
  };

  // 심플한 플로팅 헬프 버튼 (항상 표시)
  const HelpButton = () => (
    <motion.button
      className="fixed bottom-6 right-6 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-40"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        // 현재 페이지의 도움말 표시
        const guides = GUIDE_POINTS[pathname] || [];
        if (guides.length > 0) {
          setCurrentGuide(guides[0]);
          setIsVisible(true);
        }
      }}
    >
      <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    </motion.button>
  );

  return (
    <>
      {/* 항상 표시되는 헬프 버튼 */}
      <HelpButton />

      {/* 가이드 메시지 */}
      <AnimatePresence>
        {isVisible && currentGuide && (
          <motion.div
            className="fixed bottom-20 right-6 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 메시지 */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {currentGuide.message}
            </p>

            {/* 액션 버튼 */}
            {currentGuide.action && (
              <a
                href={currentGuide.action.href}
                onClick={currentGuide.action.onClick}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {currentGuide.action.label}
                <ChevronRight className="w-4 h-4" />
              </a>
            )}

            {/* 성격 유형 표시 (있을 경우) */}
            {personalityType && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {personalityType} 큐레이터가 안내 중
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// 특정 이벤트에서 가이드 트리거하는 훅
export const useGuideBot = () => {
  const [showGuide, setShowGuide] = useState(false);
  
  const triggerGuide = (message: string, action?: GuidePoint['action']) => {
    // 커스텀 가이드 표시 로직
    setShowGuide(true);
  };
  
  return { triggerGuide };
};