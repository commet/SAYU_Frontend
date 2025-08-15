'use client';

import { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles } from 'lucide-react';
import { PersonalityAnimalImage } from '@/components/ui/PersonalityAnimalImage';
import type { PersonalityAnimal } from '@/data/personality-animals';

// 동물 캐릭터 플로팅 버튼 - 최적화 버전
export const ChatbotFloatingButton = memo(({ 
  onClick, 
  animalData,
  position = 'bottom-right' 
}: {
  onClick: () => void;
  animalData?: PersonalityAnimal | null;
  position?: 'bottom-left' | 'bottom-right';
}) => {
  const positionClasses = position === 'bottom-left' 
    ? 'left-4 sm:left-6' 
    : 'right-4 sm:right-6';

  return (
    <motion.div
      className={`fixed bottom-20 sm:bottom-24 ${positionClasses} z-50`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.5 
      }}
    >
      <motion.button
        onClick={onClick}
        className="relative group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* 배경 광채 효과 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* 동물 아바타 */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-lg flex items-center justify-center border border-white/20">
          {animalData ? (
            <PersonalityAnimalImage 
              animal={animalData}
              variant="avatar"
              size="sm"
              className="scale-110 !rounded-full"
              showFallback={true}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-purple-400" />
            </div>
          )}
          
          {/* 호버시 오버레이 (제거 - 깨끗한 UI) */}
        </div>
        
        {/* 상태 인디케이터 */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        
        {/* 툴팁 (제거 - 깨끗한 UI) */}
      </motion.button>
      
      {/* 파티클 효과 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/50 rounded-full"
            animate={{
              x: [0, (i - 1) * 30],
              y: [0, -50],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut"
            }}
            style={{
              left: '50%',
              bottom: '20%',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
});

ChatbotFloatingButton.displayName = 'ChatbotFloatingButton';

// 메시지 아이템 최적화
export const OptimizedMessage = memo(({ 
  message, 
  isUser,
  animalAvatar 
}: {
  message: any;
  isUser: boolean;
  animalAvatar?: string;
}) => {
  const messageClasses = useMemo(() => 
    `flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`,
    [isUser]
  );

  const bubbleClasses = useMemo(() => 
    `max-w-[80%] px-4 py-2 rounded-2xl ${
      isUser 
        ? 'bg-primary text-white rounded-br-sm' 
        : 'bg-gray-100 dark:bg-gray-800 rounded-bl-sm'
    }`,
    [isUser]
  );

  return (
    <motion.div
      className={messageClasses}
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && animalAvatar && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={animalAvatar}
            alt="AI Curator"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      
      <div className={bubbleClasses}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <time className="text-xs opacity-70 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </time>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
      )}
    </motion.div>
  );
});

OptimizedMessage.displayName = 'OptimizedMessage';

// 입력창 최적화
export const OptimizedInput = memo(({ 
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "작품에 대해 궁금한 점을 물어보세요..."
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }, [onSubmit]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    </div>
  );
});

OptimizedInput.displayName = 'OptimizedInput';