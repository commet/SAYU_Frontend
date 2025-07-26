// Evolving Animal Image Component - 기존 이미지를 활용한 진화 시각화
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EvolvingAnimalImageProps {
  aptType: string;
  evolutionStage: number;
  achievements?: string[];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showProgress?: boolean;
  progress?: number;
  recentActions?: Array<{
    type: string;
    timestamp: Date;
  }>;
  onInteract?: () => void;
}

const IMAGE_PATHS: Record<string, string> = {
  'LAEF': '/images/personality-animals/main/1. LAEF (Fox).png',
  'LAEC': '/images/personality-animals/main/2. LAEC (Cat).png',
  'LAMF': '/images/personality-animals/main/3. LAMF (Owl).png',
  'LAMC': '/images/personality-animals/main/4. LAMC (Turtle).png',
  'LREF': '/images/personality-animals/main/5. LREF (Chameleon).png',
  'LREC': '/images/personality-animals/main/6. LREC (Hedgehog).png',
  'LRMF': '/images/personality-animals/main/7. LRMF (Octopus).png',
  'LRMC': '/images/personality-animals/main/8. LRMC (Beaver).png',
  'SAEF': '/images/personality-animals/main/9. SAEF (Butterfly).png',
  'SAEC': '/images/personality-animals/main/10. SAEC (Penguin).png',
  'SAMF': '/images/personality-animals/main/11. SAMF (Parrot).png',
  'SAMC': '/images/personality-animals/main/12. SAMC (Deer).png',
  'SREF': '/images/personality-animals/main/13. SREF (Dog).png',
  'SREC': '/images/personality-animals/main/14. SREC (Duck).png',
  'SRMF': '/images/personality-animals/main/15. SRMF (Elephant).png',
  'SRMC': '/images/personality-animals/main/16. SRMC (Eagle).png'
};

const STAGE_FILTERS = {
  1: 'brightness(1.2) contrast(0.8) saturate(0.7) blur(0.5px)',
  2: 'brightness(1.1) contrast(0.9) saturate(0.9)',
  3: 'none',
  4: 'contrast(1.1) saturate(1.1)',
  5: 'contrast(1.2) saturate(1.2) hue-rotate(10deg)'
};

const SIZE_CONFIG = {
  sm: { width: 120, height: 120 },
  md: { width: 200, height: 200 },
  lg: { width: 300, height: 300 },
  xl: { width: 400, height: 400 }
};

export function EvolvingAnimalImage({
  aptType,
  evolutionStage,
  achievements = [],
  size = 'md',
  showProgress = true,
  progress = 0,
  recentActions = [],
  onInteract
}: EvolvingAnimalImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeEffects, setActiveEffects] = useState<string[]>([]);
  const imageRef = useRef<HTMLDivElement>(null);

  const dimensions = SIZE_CONFIG[size];
  const scale = 0.7 + (evolutionStage * 0.075); // 0.7 → 1.075

  // 최근 행동에 따른 효과 처리
  useEffect(() => {
    const now = Date.now();
    const newEffects: string[] = [];

    recentActions.forEach(action => {
      const timeSince = now - action.timestamp.getTime();
      if (timeSince < 3000) { // 3초 이내 행동만
        newEffects.push(action.type);
      }
    });

    setActiveEffects(newEffects);
  }, [recentActions]);

  // 진화 단계별 오버레이 그라데이션
  const getOverlayGradient = () => {
    const gradients = {
      1: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
      2: 'radial-gradient(circle, rgba(255,220,100,0.2) 0%, transparent 70%)',
      3: 'radial-gradient(circle, rgba(100,200,255,0.15) 0%, transparent 70%)',
      4: 'radial-gradient(circle, rgba(200,100,255,0.2) 0%, transparent 60%)',
      5: 'conic-gradient(from 0deg, rgba(255,100,200,0.3), rgba(100,200,255,0.3), rgba(255,200,100,0.3), rgba(255,100,200,0.3))'
    };
    return gradients[evolutionStage as keyof typeof gradients];
  };

  return (
    <div className="relative inline-block">
      <motion.div
        ref={imageRef}
        className={cn(
          "relative cursor-pointer select-none rounded-full overflow-hidden",
          "transition-all duration-300"
        )}
        style={{
          width: dimensions.width * scale,
          height: dimensions.height * scale
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onInteract}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* 메인 동물 이미지 */}
        <div
          className="relative w-full h-full"
          style={{
            filter: STAGE_FILTERS[evolutionStage as keyof typeof STAGE_FILTERS]
          }}
        >
          <Image
            src={IMAGE_PATHS[aptType]}
            alt={`${aptType} Animal`}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* 진화 단계 오버레이 */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: getOverlayGradient() }}
          animate={evolutionStage >= 3 ? {
            opacity: [0.5, 0.8, 0.5]
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* 오라 효과 (3단계 이상) */}
        {evolutionStage >= 3 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className={cn(
              "absolute inset-[-20%] rounded-full",
              evolutionStage === 3 && "bg-blue-400/20 blur-xl",
              evolutionStage === 4 && "bg-purple-400/30 blur-2xl",
              evolutionStage === 5 && "bg-gradient-to-r from-pink-400/30 to-blue-400/30 blur-3xl"
            )} />
          </motion.div>
        )}

        {/* 업적 뱃지 */}
        <AnimatePresence>
          {achievements.includes('first_evolution') && (
            <motion.div
              className="absolute bottom-2 right-2 text-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              🌟
            </motion.div>
          )}
          {achievements.includes('taste_expansion') && (
            <motion.div
              className="absolute top-2 right-2 text-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              🎨
            </motion.div>
          )}
          {achievements.includes('art_connoisseur') && (
            <motion.div
              className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              👑
            </motion.div>
          )}
        </AnimatePresence>

        {/* 단계별 액세서리 SVG 오버레이 */}
        {evolutionStage >= 2 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
          >
            {/* 스카프 (2단계) */}
            {evolutionStage >= 2 && (
              <motion.path
                d="M30,70 Q50,75 70,70"
                stroke="#E74C3C"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />
            )}
            {/* 왕관 (4단계 이상) */}
            {evolutionStage >= 4 && (
              <motion.path
                d="M35,20 L40,15 L45,20 L50,15 L55,20 L60,15 L65,20 L65,25 L35,25 Z"
                fill="#F1C40F"
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </svg>
        )}

        {/* 특수 효과 (최근 행동) */}
        <AnimatePresence>
          {activeEffects.includes('artwork_like') && (
            <HeartSparkles />
          )}
          {activeEffects.includes('exhibition_visit') && (
            <CultureAura />
          )}
        </AnimatePresence>

        {/* 호버 시 정보 표시 */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <p className="text-sm font-semibold">
                {evolutionStage}단계 {getStageName(evolutionStage)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 진행률 표시 */}
      {showProgress && progress !== undefined && (
        <div className="mt-4 w-full">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>{getStageName(evolutionStage)}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// 특수 효과 컴포넌트들
function HeartSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-pink-500"
          style={{
            left: `${20 + i * 15}%`,
            top: `${60 + Math.random() * 20}%`,
          }}
          initial={{ y: 0, opacity: 1, scale: 0 }}
          animate={{
            y: -50,
            opacity: 0,
            scale: [0, 1, 0.5]
          }}
          transition={{
            duration: 2,
            delay: i * 0.2,
            ease: "easeOut"
          }}
        >
          ❤️
        </motion.span>
      ))}
    </div>
  );
}

function CultureAura() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl"
          style={{
            left: '50%',
            top: '50%',
          }}
          initial={{ scale: 0, rotate: 0 }}
          animate={{
            scale: [0, 1, 0],
            rotate: 360,
            x: [0, (i - 1) * 60, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 3,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        >
          🎭
        </motion.span>
      ))}
    </div>
  );
}

function getStageName(stage: number): string {
  const names = {
    1: '아기',
    2: '청소년',
    3: '성체',
    4: '숙련가',
    5: '마스터'
  };
  return names[stage as keyof typeof names] || '성장중';
}