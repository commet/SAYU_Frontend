'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sparkles, HelpCircle, Wand2 } from 'lucide-react';

interface MysteryCharacterProps {
  onClick?: () => void;
  showHint?: boolean;
  progress?: number; // 0-100 퀴즈 진행도
}

export const MysteryCharacter = ({ 
  onClick, 
  showHint = false,
  progress = 0 
}: MysteryCharacterProps) => {
  const [currentHint, setCurrentHint] = useState(0);
  const hints = [
    "나는 누구일까요? 🤔",
    "당신을 알아가고 있어요...",
    "곧 모습을 드러낼게요!",
    "16가지 모습 중 하나예요"
  ];

  // 힌트 로테이션
  useEffect(() => {
    if (!showHint) return;
    
    const interval = setInterval(() => {
      setCurrentHint((prev) => (prev + 1) % hints.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [showHint]);

  return (
    <motion.div
      className="relative cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 신비로운 실루엣 */}
      <motion.div
        className="relative w-16 h-16 sm:w-20 sm:h-20"
        animate={{
          filter: [
            'blur(8px)',
            'blur(4px)',
            'blur(8px)'
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* 그라데이션 배경 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from ${progress * 3.6}deg, #E2E8F0 0deg, #CBD5E1 ${progress * 3.6}deg, #E2E8F0 360deg)`,
          }}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* 중앙 물음표 또는 진행도 */}
        <div className="absolute inset-2 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center backdrop-blur-sm">
          {progress > 0 ? (
            <motion.div
              className="text-lg font-bold text-primary"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {progress}%
            </motion.div>
          ) : (
            <motion.div
              animate={{
                y: [-2, 2, -2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <HelpCircle className="w-8 h-8 text-gray-400" />
            </motion.div>
          )}
        </div>
        
        {/* 반짝이는 파티클 */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, (i - 1) * 40],
              y: [0, -30 - i * 10],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut"
            }}
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </motion.div>
        ))}
      </motion.div>
      
      {/* 호버 힌트 */}
      <motion.div
        className="absolute -top-2 -right-2"
        initial={{ opacity: 0, scale: 0 }}
        whileHover={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-primary text-white rounded-full p-1">
          <Wand2 className="w-3 h-3" />
        </div>
      </motion.div>
      
      {/* 말풍선 힌트 */}
      {showHint && (
        <motion.div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 whitespace-nowrap">
            <p className="text-sm">{hints[currentHint]}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-white dark:border-t-gray-800" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// 변신 애니메이션 컴포넌트
export const TransformAnimation = ({ 
  from = 'mystery',
  to,
  onComplete
}: {
  from?: string;
  to: string;
  onComplete?: () => void;
}) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.5, 0.8, 1],
          rotate: [0, 180, 360, 720],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          onComplete
        }}
      >
        {/* 변신 효과 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(255, 255, 255, 0)',
              '0 0 40px 40px rgba(255, 255, 255, 0.5)',
              '0 0 80px 80px rgba(255, 255, 255, 0)',
            ]
          }}
          transition={{
            duration: 1.5,
            repeat: 1,
          }}
        />
        
        {/* 캐릭터 이미지 전환 */}
        <motion.div
          className="w-32 h-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <img
            src={`/images/personality-animals/avatars/${to}-avatar.png`}
            alt="Your AI Curator"
            className="w-full h-full object-cover rounded-full"
          />
        </motion.div>
        
        {/* 축하 메시지 */}
        <motion.div
          className="absolute top-full mt-4 left-1/2 -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <h3 className="text-xl font-bold text-white mb-2">
            축하합니다! 🎉
          </h3>
          <p className="text-white/80">
            당신의 AI 큐레이터가 탄생했어요!
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};