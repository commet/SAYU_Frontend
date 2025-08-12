'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getAnimalByType } from '@/data/personality-animals';

export type CompanionMood = 'idle' | 'happy' | 'thinking' | 'sleeping' | 'excited';

interface AnimalCompanionProps {
  mood?: CompanionMood;
  onMoodChange?: (mood: CompanionMood) => void;
  message?: string;
  position?: 'bottom-left' | 'bottom-right';
  onClick?: () => void;
}

export const AnimalCompanion = ({ 
  mood: controlledMood,
  onMoodChange,
  message,
  position = 'bottom-left',
  onClick
}: AnimalCompanionProps) => {
  const { personalityType } = useUserProfile();
  const [internalMood, setInternalMood] = useState<CompanionMood>('idle');
  const [showMessage, setShowMessage] = useState(false);
  
  // Use controlled mood if provided, otherwise use internal state
  const currentMood = controlledMood || internalMood;
  
  // Get user's personality type and corresponding animal
  // personalityType is already available from useUserProfile
  const animalData = getAnimalByType(personalityType);
  
  if (!animalData) return null;

  // Auto-cycle through moods if not controlled
  useEffect(() => {
    if (!controlledMood) {
      const interval = setInterval(() => {
        const moods: CompanionMood[] = ['idle', 'happy', 'thinking'];
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        setInternalMood(randomMood);
      }, 10000); // Change mood every 10 seconds

      return () => clearInterval(interval);
    }
  }, [controlledMood]);

  // Show message when it changes
  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Animation variants for different moods
  const moodVariants = {
    idle: {
      y: [0, -5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    },
    happy: {
      scale: [1, 1.1, 1],
      rotate: [-5, 5, -5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    },
    thinking: {
      y: [0, -10, 0],
      x: [0, 5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    },
    sleeping: {
      scale: 0.9,
      opacity: 0.7,
      transition: {
        duration: 1,
        ease: "easeOut" as const
      }
    },
    excited: {
      y: [0, -20, 0],
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.5,
        repeat: 3,
        ease: "easeOut" as const
      }
    }
  };

  // Particle effects for different moods
  const ParticleEffects = () => {
    if (currentMood === 'happy') {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl"
              initial={{ scale: 0, x: 60, y: 60 }}
              animate={{ 
                scale: [0, 1, 0],
                x: 60 + (Math.random() * 100 - 50),
                y: 60 - (Math.random() * 100)
              }}
              transition={{ 
                delay: i * 0.2, 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              ✨
            </motion.span>
          ))}
        </div>
      );
    }
    
    if (currentMood === 'thinking') {
      return (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex gap-1"
          >
            <span className="text-gray-400">💭</span>
          </motion.div>
        </div>
      );
    }
    
    if (currentMood === 'sleeping') {
      return (
        <div className="absolute -top-4 right-0">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-2xl">💤</span>
          </motion.div>
        </div>
      );
    }
    
    return null;
  };

  const handleClick = () => {
    console.log('Animal clicked! onClick provided:', !!onClick);
    
    // If custom onClick is provided, use it (for opening chat)
    if (onClick) {
      onClick();
    } else {
      // Otherwise, show a happy reaction when clicked
      const reactionMood: CompanionMood = 'happy';
      
      if (controlledMood && onMoodChange) {
        onMoodChange(reactionMood);
      } else {
        setInternalMood(reactionMood);
        // Return to idle after 2 seconds
        setTimeout(() => {
          setInternalMood('idle');
        }, 2000);
      }
    }
  };

  const positionClasses = position === 'bottom-left' 
    ? 'fixed bottom-24 lg:bottom-4 left-4' 
    : 'fixed bottom-24 lg:bottom-4 right-4';

  return (
    <div className={`${positionClasses} z-40`}>
      <motion.div
        className="relative cursor-pointer select-none"
        variants={moodVariants}
        animate={currentMood}
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Main animal image */}
        <motion.img 
          src={animalData.avatar || animalData.image}
          alt={animalData.animal}
          className="w-24 h-24 drop-shadow-lg"
          draggable={false}
        />
        
        {/* Mood indicator emoji */}
        <motion.div
          className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <span className="text-lg">{animalData.emoji}</span>
        </motion.div>
        
        {/* Particle effects */}
        <ParticleEffects />
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence>
        {showMessage && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full mb-2 left-0 min-w-[200px]"
          >
            <div className="bg-white rounded-2xl shadow-lg p-3 relative">
              <p className="text-sm text-gray-700">{message}</p>
              <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white transform rotate-45 shadow-lg" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood label (for debugging, can be removed) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded">
          {currentMood}
        </div>
      )}
    </div>
  );
};

// Preset messages for different contexts
export const companionMessages = {
  welcome: {
    fox: "신비로운 예술의 세계로 어서오세요!",
    cat: "오늘은 어떤 작품이 마음에 드실까요?",
    owl: "지혜의 눈으로 예술을 봐요.",
    turtle: "천천히, 깊이 있게 감상해요.",
    chameleon: "작품의 색채에 빠져볼까요?",
    hedgehog: "섬세한 디테일을 찾아봐요.",
    octopus: "다양한 관점에서 탐험해요!",
    beaver: "체계적으로 살펴볼까요?",
    butterfly: "와! 정말 아름다워요!",
    penguin: "함께 감상하니 더 좋네요!",
    parrot: "이 작품의 메시지가 뭘까요?",
    deer: "우아한 감상 시간이에요.",
    dog: "신나는 전시 구경 가요!",
    duck: "편안하게 둘러봐요.",
    elephant: "흥미로운 이야기가 있어요.",
    eagle: "전체적인 맥락을 봐요."
  },
  artworkView: {
    fox: "이 색감이 마음에 스며드네요...",
    cat: "음, 이건 제 취향이에요.",
    owl: "숨겨진 의미가 보이시나요?",
    turtle: "이 시대의 걸작이군요.",
    chameleon: "빛에 따라 달라 보여요!",
    hedgehog: "이 붓질, 정말 섬세해요.",
    octopus: "AR로 보면 어떨까요?",
    beaver: "작가의 기법이 인상적이에요.",
    butterfly: "너무 예뻐서 가슴이 두근거려요!",
    penguin: "다같이 보니 더 멋져요!",
    parrot: "이 메시지, 정말 중요해요!",
    deer: "품격 있는 작품이네요.",
    dog: "와! 이거 정말 멋있어요!",
    duck: "차근차근 감상해봐요.",
    elephant: "이 작품에 얽힌 일화가...",
    eagle: "미술사적 가치가 높아요."
  },
  idle: {
    fox: "꿈결 같은 하루네요...",
    cat: "흠... 뭘 볼까요?",
    owl: "관찰 중...",
    turtle: "느긋하게...",
    chameleon: "주변을 살펴봐요.",
    hedgehog: "조심조심...",
    octopus: "탐색 모드!",
    beaver: "계획을 세워볼까요?",
    butterfly: "날아다니고 싶어요~",
    penguin: "친구들은 뭐하나?",
    parrot: "이야기하고 싶어요!",
    deer: "고요한 시간...",
    dog: "놀고 싶어요!",
    duck: "평화로워요.",
    elephant: "기억을 더듬어봐요.",
    eagle: "높은 곳에서 바라봐요."
  }
};

// Helper function to get message based on animal type
export const getCompanionMessage = (
  animalType: string, 
  context: keyof typeof companionMessages
): string => {
  const animal = animalType.toLowerCase();
  const messages = companionMessages[context];
  
  // Map personality type to animal name
  const typeToAnimal: Record<string, string> = {
    'LAEF': 'fox',
    'LAEC': 'cat',
    'LAMF': 'owl',
    'LAMC': 'turtle',
    'LREF': 'chameleon',
    'LREC': 'hedgehog',
    'LRMF': 'octopus',
    'LRMC': 'beaver',
    'SAEF': 'butterfly',
    'SAEC': 'penguin',
    'SAMF': 'parrot',
    'SAMC': 'deer',
    'SREF': 'dog',
    'SREC': 'duck',
    'SRMF': 'elephant',
    'SRMC': 'eagle'
  };
  
  const animalName = typeToAnimal[animalType] || 'fox';
  return messages[animalName as keyof typeof messages] || messages.fox;
};