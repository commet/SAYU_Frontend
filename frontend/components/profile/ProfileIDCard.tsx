'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { RotateCcw, Download, Share2, Trophy, MapPin, Palette, Zap, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { personalityAnimals } from '@/data/personality-animals';
import { PersonalityAnimalImageRobust } from '@/components/ui/PersonalityAnimalImageRobust';
import { personalityGradients, getGradientStyle } from '@/constants/personality-gradients';
import '@/styles/profile-card.css';

interface ProfileIDCardProps {
  personalityType: string;
  userName?: string;
  userLevel?: number;
  userPoints?: number;
  stats?: {
    exhibitionsVisited: number;
    achievementsUnlocked: number;
    companionsMetCount: number;
  };
  recentExhibitions?: Array<{
    name: string;
    date: string;
  }>;
  plannedExhibitions?: Array<{
    name: string;
    venue: string;
  }>;
  topAchievements?: Array<{
    name: string;
    icon: string;
  }>;
  onClose?: () => void;
}

export default function ProfileIDCard({
  personalityType,
  userName = 'SAYU Explorer',
  userLevel = 1,
  userPoints = 0,
  stats = {
    exhibitionsVisited: 0,
    achievementsUnlocked: 0,
    companionsMetCount: 0
  },
  recentExhibitions = [],
  plannedExhibitions = [],
  topAchievements = [],
  onClose
}: ProfileIDCardProps) {
  const { language } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const personality = personalityDescriptions[personalityType];
  const animal = personalityAnimals[personalityType];
  const gradientStyle = getGradientStyle(personalityType);

  // Level 정보
  const getLevelInfo = (level: number) => {
    const levels = {
      1: { name: 'Art Curious', nameKo: '예술 입문자' },
      2: { name: 'Gallery Explorer', nameKo: '갤러리 탐험가' },
      3: { name: 'Art Enthusiast', nameKo: '예술 애호가' },
      4: { name: 'Culture Connoisseur', nameKo: '문화 감식가' },
      5: { name: 'Art Maestro', nameKo: '예술 마에스트로' },
      6: { name: 'Legendary Aesthete', nameKo: '전설의 미학자' }
    };
    return levels[level as keyof typeof levels] || levels[1];
  };

  const levelInfo = getLevelInfo(userLevel);

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true
      });
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      if (navigator.share && navigator.canShare({ files: [new File([blob], 'my-art-personality.png', { type: 'image/png' })] })) {
        await navigator.share({
          title: `${userName}의 예술 성격 - ${personalityType}`,
          text: `나는 ${personality?.title_ko || personality?.title}입니다! 내 예술 성격을 확인해보세요.`,
          files: [new File([blob], 'my-art-personality.png', { type: 'image/png' })]
        });
      } else {
        // Fallback to download
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-art-personality-card.png';
        a.click();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Controls */}
        <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'ko' ? '뒤집기' : 'Flip'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {language === 'ko' ? '공유하기' : 'Share'}
          </button>
        </div>

        {/* Card */}
        <div 
          className="perspective-1000"
          style={{ perspective: '1000px' }}
        >
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            className="preserve-3d relative w-80 h-[500px]"
          >
            {/* Front of Card */}
            <div
              ref={cardRef}
              className="backface-hidden absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: gradientStyle,
                backfaceVisibility: 'hidden'
              }}
            >
              <div className="relative h-full p-6 text-white">
                {/* Header */}
                <div className="text-center mb-6">
                  {animal ? (
                    <div className="mb-3">
                      <PersonalityAnimalImageRobust 
                        animal={animal}
                        variant="avatar"
                        size="lg"
                        className="mx-auto border-4 border-white/30"
                      />
                    </div>
                  ) : (
                    <div className="text-5xl mb-3">{animal?.emoji}</div>
                  )}
                  <h2 className="text-2xl font-bold mb-1">{userName}</h2>
                  <div className="flex items-center justify-center gap-2 text-sm opacity-90">
                    <Trophy className="w-4 h-4" />
                    {language === 'ko' ? levelInfo.nameKo : levelInfo.name}
                  </div>
                </div>

                {/* Personality Type */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6">
                  <div className="text-center">
                    <div className="font-mono text-3xl font-bold mb-2">{personalityType}</div>
                    <div className="text-lg font-medium">
                      {language === 'ko' && personality?.title_ko ? personality.title_ko : personality?.title}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center bg-white/15 rounded-xl p-3">
                    <div className="text-xl font-bold">{stats.exhibitionsVisited}</div>
                    <div className="text-xs opacity-80">
                      {language === 'ko' ? '전시' : 'Exhibitions'}
                    </div>
                  </div>
                  <div className="text-center bg-white/15 rounded-xl p-3">
                    <div className="text-xl font-bold">{stats.achievementsUnlocked}</div>
                    <div className="text-xs opacity-80">
                      {language === 'ko' ? '업적' : 'Achievements'}
                    </div>
                  </div>
                  <div className="text-center bg-white/15 rounded-xl p-3">
                    <div className="text-xl font-bold">{userPoints}</div>
                    <div className="text-xs opacity-80">
                      {language === 'ko' ? '포인트' : 'Points'}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/15 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {language === 'ko' ? '최근 활동' : 'Recent Activity'}
                    </span>
                  </div>
                  {recentExhibitions.slice(0, 2).map((exhibition, index) => (
                    <div key={index} className="text-xs opacity-80 mb-1">
                      {exhibition.name}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <div className="text-xs opacity-70">SAYU • Art Personality</div>
                </div>
              </div>
            </div>

            {/* Back of Card */}
            <div
              className="backface-hidden absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="relative h-full p-6 text-white">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">
                    {language === 'ko' ? '나의 예술 여정' : 'My Art Journey'}
                  </h3>
                  <div className="text-sm opacity-90">
                    {language === 'ko' ? '더 자세한 정보' : 'More Details'}
                  </div>
                </div>

                {/* Achievements */}
                {topAchievements.length > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {language === 'ko' ? '주요 업적' : 'Top Achievements'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {topAchievements.slice(0, 3).map((achievement, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span>{achievement.icon}</span>
                          <span>{achievement.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Planned Exhibitions */}
                {plannedExhibitions.length > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Palette className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {language === 'ko' ? '가고 싶은 전시' : 'Wishlist'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {plannedExhibitions.slice(0, 3).map((exhibition, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium">{exhibition.name}</div>
                          <div className="text-xs opacity-70">{exhibition.venue}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personality Dimensions */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-sm font-medium mb-3">
                    {language === 'ko' ? '나의 예술 성향' : 'My Art Style'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-mono font-bold">{personalityType[0]}</span>
                      <span className="ml-1">
                        {personalityType[0] === 'L' 
                          ? (language === 'ko' ? '고독한' : 'Lone')
                          : (language === 'ko' ? '사교적' : 'Social')
                        }
                      </span>
                    </div>
                    <div>
                      <span className="font-mono font-bold">{personalityType[1]}</span>
                      <span className="ml-1">
                        {personalityType[1] === 'A'
                          ? (language === 'ko' ? '추상' : 'Abstract')
                          : (language === 'ko' ? '구상' : 'Representational')
                        }
                      </span>
                    </div>
                    <div>
                      <span className="font-mono font-bold">{personalityType[2]}</span>
                      <span className="ml-1">
                        {personalityType[2] === 'E'
                          ? (language === 'ko' ? '감정적' : 'Emotional')
                          : (language === 'ko' ? '의미추구' : 'Meaning')
                        }
                      </span>
                    </div>
                    <div>
                      <span className="font-mono font-bold">{personalityType[3]}</span>
                      <span className="ml-1">
                        {personalityType[3] === 'F'
                          ? (language === 'ko' ? '흐름따라' : 'Flow')
                          : (language === 'ko' ? '체계적' : 'Constructive')
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <div className="text-xs opacity-70">
                    {language === 'ko' ? 'sayu.vercel.app에서 당신의 예술 성격을 발견하세요' : 'Discover your art personality at sayu.vercel.app'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}