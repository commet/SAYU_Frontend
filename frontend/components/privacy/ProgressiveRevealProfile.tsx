'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Eye, EyeOff, Sparkles, Palette, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PrivacyLevel, UserPrivacyState } from '@/types/art-persona-matching';
import { PersonalityType } from '@/types/sayu-shared';
import { APT_TO_ART_MOVEMENT } from '@/types/art-persona-matching';
import { ART_MOVEMENT_PROFILES } from '@/lib/art-movement-profiles';
import Image from 'next/image';
import { useTheme } from '@/hooks/usePersonalizedTheme';

// 프라이버시 레벨 정의
const PRIVACY_LEVELS: Record<number, PrivacyLevel> = {
  1: {
    level: 1,
    name: '예술적 페르소나',
    description: '당신의 APT 동물 캐릭터와 예술 성향만 공개',
    reveals: ['APT 동물 캐릭터', '선호 예술 사조', '기본 성향'],
    visualEffect: { blur: 100, opacity: 0, artFilter: true }
  },
  2: {
    level: 2,
    name: '취향 프로필',
    description: '예술적 취향과 관심사를 공개',
    reveals: ['좋아하는 작가', '선호 미술관', '예술 감상 스타일', '관심 전시'],
    visualEffect: { blur: 70, opacity: 0.3, artFilter: true }
  },
  3: {
    level: 3,
    name: '부분 공개',
    description: '예술적 필터가 적용된 프로필 공개',
    reveals: ['이름', '도시', '직업', '예술 필터 적용 사진'],
    visualEffect: { blur: 30, opacity: 0.7, artFilter: true }
  },
  4: {
    level: 4,
    name: '완전 공개',
    description: '모든 프로필 정보 공개',
    reveals: ['실제 사진', '전체 프로필', '연락처', '소셜 미디어'],
    visualEffect: { blur: 0, opacity: 1, artFilter: false }
  }
};

interface ProgressiveRevealProfileProps {
  userId: string;
  aptType: PersonalityType;
  userName?: string;
  userPhoto?: string;
  matchedUserId?: string;
  onPrivacyLevelChange?: (level: number) => void;
}

export function ProgressiveRevealProfile({
  userId,
  aptType,
  userName,
  userPhoto,
  matchedUserId,
  onPrivacyLevelChange
}: ProgressiveRevealProfileProps) {
  const theme = useTheme();
  const [privacyState, setPrivacyState] = useState<UserPrivacyState>({
    userId,
    currentLevel: 1,
    revealedInfo: PRIVACY_LEVELS[1].reveals,
    lastUpdated: new Date()
  });
  
  const [isRevealing, setIsRevealing] = useState(false);
  const [mutualRevealRequest, setMutualRevealRequest] = useState(false);
  
  const artMovement = APT_TO_ART_MOVEMENT[aptType];
  const artProfile = ART_MOVEMENT_PROFILES[artMovement];
  const animalInfo = theme.getAnimalInfo(aptType);

  // 다음 레벨로 공개
  const handleRevealNext = async () => {
    if (privacyState.currentLevel >= 4) return;
    
    setIsRevealing(true);
    const nextLevel = (privacyState.currentLevel + 1) as PrivacyLevel['level'];
    
    setTimeout(() => {
      setPrivacyState({
        ...privacyState,
        currentLevel: nextLevel,
        revealedInfo: [
          ...privacyState.revealedInfo,
          ...PRIVACY_LEVELS[nextLevel].reveals
        ],
        lastUpdated: new Date()
      });
      
      setIsRevealing(false);
      onPrivacyLevelChange?.(nextLevel);
    }, 1000);
  };

  // 아바타 렌더링
  const renderAvatar = () => {
    const { currentLevel } = privacyState;
    const { blur, opacity, artFilter } = PRIVACY_LEVELS[currentLevel].visualEffect;
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        <AnimatePresence mode="wait">
          {/* 레벨 1: APT 동물 캐릭터 */}
          {currentLevel === 1 && (
            <motion.div
              key="animal-avatar"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full h-full"
            >
              <div 
                className="relative w-full h-full rounded-full overflow-hidden border-4 shadow-xl"
                style={{
                  borderColor: artProfile.colorPalette[0],
                  background: `linear-gradient(135deg, ${artProfile.colorPalette.slice(0, 3).join(', ')})`
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-7xl drop-shadow-lg">{animalInfo.emoji}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur">
                  <p className="text-white text-center text-sm">{artProfile.koreanName}</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* 레벨 2-3: 블러/필터 적용 사진 */}
          {currentLevel >= 2 && currentLevel < 4 && userPhoto && (
            <motion.div
              key="filtered-photo"
              initial={{ opacity: 0, rotateY: 180 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -180 }}
              className="w-full h-full"
            >
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl">
                <Image
                  src={userPhoto}
                  alt="Profile"
                  fill
                  className="object-cover"
                  style={{ 
                    filter: `blur(${blur}px)`,
                    opacity
                  }}
                />
                {artFilter && (
                  <div 
                    className="absolute inset-0 mix-blend-overlay"
                    style={{
                      background: `radial-gradient(circle, ${artProfile.colorPalette[0]}40, transparent)`,
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}
          
          {/* 레벨 4: 완전 공개 */}
          {currentLevel === 4 && userPhoto && (
            <motion.div
              key="full-photo"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full"
            >
              <Image
                src={userPhoto}
                alt="Profile"
                fill
                className="object-cover rounded-full border-4 border-white shadow-xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 프라이버시 레벨 인디케이터 */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-white px-3 py-1 rounded-full shadow-md">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                level <= privacyState.currentLevel
                  ? "bg-primary scale-110"
                  : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>
    );
  };

  // 공개된 정보 표시
  const renderRevealedInfo = () => {
    const currentLevelInfo = PRIVACY_LEVELS[privacyState.currentLevel];
    
    return (
      <div className="space-y-4 mt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
            <Shield className="w-5 h-5" />
            {currentLevelInfo.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {currentLevelInfo.description}
          </p>
        </div>
        
        {/* APT 정보 표시 (레벨 1부터) */}
        {privacyState.currentLevel >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/20 rounded-lg p-4"
          >
            <h4 className="font-medium mb-2">{animalInfo.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{animalInfo.subtitle}</p>
            <div className="flex items-center gap-2 text-sm">
              <Palette className="w-4 h-4" />
              <span>{artProfile.koreanName} 성향</span>
            </div>
          </motion.div>
        )}
        
        {/* 취향 정보 (레벨 2부터) */}
        {privacyState.currentLevel >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium">예술적 특성</h4>
            <div className="flex flex-wrap gap-2">
              {artProfile.characteristics.map((trait, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-primary/10 rounded-full text-xs"
                  style={{ backgroundColor: `${artProfile.colorPalette[i % artProfile.colorPalette.length]}20` }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* 개인 정보 (레벨 3부터) */}
        {privacyState.currentLevel >= 3 && userName && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="font-medium">{userName}</p>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6 max-w-md mx-auto glass-panel">
      <div className="space-y-6">
        {renderAvatar()}
        {renderRevealedInfo()}
        
        {/* 액션 버튼 */}
        {privacyState.currentLevel < 4 && (
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRevealNext}
              disabled={isRevealing}
              className="w-full"
              variant="default"
            >
              {isRevealing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                  </motion.div>
                  공개 중...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  다음 단계 공개
                </>
              )}
            </Button>
            
            {matchedUserId && (
              <Button
                variant="outline"
                onClick={() => setMutualRevealRequest(true)}
                className="w-full"
              >
                <Heart className="w-4 h-4 mr-2" />
                상호 공개 요청
              </Button>
            )}
          </div>
        )}
        
        {/* 현재 공개/비공개 항목 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium mb-2 flex items-center gap-1">
              <Eye className="w-4 h-4" />
              공개됨
            </h5>
            <ul className="space-y-1 text-muted-foreground">
              {privacyState.revealedInfo.map((info, i) => (
                <motion.li
                  key={info}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-1"
                >
                  <span className="text-primary">•</span>
                  <span>{info}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          
          {privacyState.currentLevel < 4 && (
            <div>
              <h5 className="font-medium mb-2 flex items-center gap-1">
                <EyeOff className="w-4 h-4" />
                비공개
              </h5>
              <ul className="space-y-1 text-muted-foreground">
                {Array.from({ length: 4 }, (_, i) => i + 1)
                  .filter(level => level > privacyState.currentLevel)
                  .flatMap(level => PRIVACY_LEVELS[level].reveals)
                  .slice(0, 4)
                  .map((info, i) => (
                    <li key={i} className="flex items-start gap-1 opacity-60">
                      <span>•</span>
                      <span>{info}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}