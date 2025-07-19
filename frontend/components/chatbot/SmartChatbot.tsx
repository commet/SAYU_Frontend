'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useArtworkViewing } from '@/contexts/ArtworkViewingContext';
import { 
  detectPageType, 
  getContextualMessage, 
  EXPOSURE_STRATEGY,
  UNIDENTIFIED_USER_MESSAGES 
} from '@/lib/chatbot-context';
import { MysteryCharacter } from './MysteryCharacter';
import { ChatbotFloatingButton } from './ChatbotOptimized';
import { ArtCuratorChatbot } from './ArtCuratorChatbot';
import { MessageCircle, X } from 'lucide-react';

export const SmartChatbot = () => {
  const pathname = usePathname();
  const { personalityType, user } = useUserProfile();
  const { currentArtwork } = useArtworkViewing();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('subtle');
  const [bubbleMessage, setBubbleMessage] = useState('');
  const [pageLoadTime] = useState(Date.now());
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const phaseTimerRef = useRef<NodeJS.Timeout>();
  
  // 페이지 컨텍스트 감지
  const pageContext = detectPageType(pathname);
  
  // 메타데이터 추가
  if (currentArtwork) {
    pageContext.metadata = {
      artworkId: currentArtwork.id,
      artworkTitle: currentArtwork.title,
      artistName: currentArtwork.artist,
    };
  }
  
  // 점진적 노출 전략 적용
  useEffect(() => {
    if (hasInteracted) return; // 이미 상호작용한 경우 중단
    
    const checkPhase = () => {
      const elapsed = Date.now() - pageLoadTime;
      
      for (const phase of EXPOSURE_STRATEGY.phases) {
        if (elapsed >= phase.startTime && (!phase.endTime || elapsed < phase.endTime)) {
          setCurrentPhase(phase.name);
          
          // 페이즈별 액션 실행
          if (phase.name === 'notice' && !showHint) {
            setShowHint(true);
            const message = personalityType 
              ? getContextualMessage(pageContext, 'idlePrompts', 0)
              : UNIDENTIFIED_USER_MESSAGES.prompts[0];
            setBubbleMessage(message);
          } else if (phase.name === 'engage') {
            const message = personalityType 
              ? getContextualMessage(pageContext, 'idlePrompts', 1)
              : UNIDENTIFIED_USER_MESSAGES.prompts[1];
            setBubbleMessage(message);
          } else if (phase.name === 'active') {
            const message = personalityType 
              ? getContextualMessage(pageContext, 'idlePrompts', 2)
              : UNIDENTIFIED_USER_MESSAGES.hints[0];
            setBubbleMessage(message);
          }
          
          break;
        }
      }
    };
    
    // 초기 체크
    checkPhase();
    
    // 주기적 체크
    phaseTimerRef.current = setInterval(checkPhase, 1000);
    
    return () => {
      if (phaseTimerRef.current) {
        clearInterval(phaseTimerRef.current);
      }
    };
  }, [pageLoadTime, hasInteracted, personalityType, pageContext, showHint]);
  
  // 상호작용 처리
  const handleInteraction = () => {
    setHasInteracted(true);
    setIsOpen(true);
    setShowHint(false);
  };
  
  // 페이지 변경시 리셋
  useEffect(() => {
    setHasInteracted(false);
    setShowHint(false);
    setCurrentPhase('subtle');
  }, [pathname]);
  
  // 애니메이션 변형
  const getAnimationVariants = () => {
    switch (currentPhase) {
      case 'subtle':
        return {
          animate: {
            scale: [1, 1.1, 1],
            transition: { duration: 2, repeat: Infinity }
          }
        };
      case 'notice':
        return {
          animate: {
            y: [0, -10, 0],
            transition: { duration: 1.5, repeat: Infinity }
          }
        };
      case 'engage':
        return {
          animate: {
            rotate: [-5, 5, -5],
            transition: { duration: 2, repeat: Infinity }
          }
        };
      case 'active':
        return {
          animate: {
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
            transition: { duration: 3, repeat: Infinity }
          }
        };
      default:
        return {};
    }
  };
  
  const animationVariants = getAnimationVariants();
  
  return (
    <>
      {/* 플로팅 버튼 - 개인화된 또는 미스터리 캐릭터 */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        {...animationVariants}
      >
        {personalityType ? (
          <div className="relative">
            <ChatbotFloatingButton
              onClick={handleInteraction}
              animalType={personalityType.toLowerCase()}
            />
            
            {/* 말풍선 */}
            <AnimatePresence>
              {showHint && bubbleMessage && (
                <motion.div
                  className="absolute bottom-full mb-2 right-0"
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 max-w-xs">
                    <p className="text-sm">{bubbleMessage}</p>
                    <button
                      onClick={() => setShowHint(false)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute top-full right-4 w-0 h-0 border-4 border-transparent border-t-white dark:border-t-gray-800" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="relative">
            <MysteryCharacter
              onClick={handleInteraction}
              showHint={showHint}
              progress={0} // 퀴즈 진행도 연동 필요
            />
            
            {/* 미판정 유저 말풍선 */}
            <AnimatePresence>
              {showHint && bubbleMessage && (
                <motion.div
                  className="absolute bottom-full mb-2 right-0"
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-lg px-4 py-2 max-w-xs border border-purple-200 dark:border-purple-700">
                    <p className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {bubbleMessage}
                    </p>
                    <button
                      onClick={() => setShowHint(false)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-purple-200 dark:bg-purple-700 rounded-full flex items-center justify-center hover:bg-purple-300 dark:hover:bg-purple-600"
                    >
                      <X className="w-3 h-3 text-purple-700 dark:text-purple-200" />
                    </button>
                    <div className="absolute top-full right-4 w-0 h-0 border-4 border-transparent border-t-purple-200 dark:border-t-purple-700" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
      
      {/* 챗봇 대화창 */}
      <AnimatePresence>
        {isOpen && (
          <ArtCuratorChatbot
            defaultOpen={true}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};