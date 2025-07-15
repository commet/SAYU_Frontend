'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';
import { personalityGradients, getGradientStyle } from '@/constants/personality-gradients';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { personalityAnimals } from '@/data/personality-animals';

interface IDCardEnhancedProps {
  personalityType: string;
  userName?: string;
  userHandle?: string;
  profileImage?: string;
  joinDate?: Date;
  stats?: {
    exhibitionsVisited: number;
    artworksViewed: number;
    hoursSpent: number;
  };
  level?: number;
  experience?: number;
  nextLevelExp?: number;
  badges?: Array<{
    id: string;
    name: string;
    icon: string;
    earned: boolean;
  }>;
  achievements?: Array<{
    title: string;
    description: string;
    date: Date;
  }>;
  language?: 'ko' | 'en';
  onClose?: () => void;
  onShareClick?: () => void;
}

export default function IDCardEnhanced({
  personalityType,
  userName = 'SAYU Explorer',
  userHandle = '@sayu_user',
  profileImage,
  joinDate = new Date(),
  stats = {
    exhibitionsVisited: 0,
    artworksViewed: 0,
    hoursSpent: 0
  },
  level = 1,
  experience = 0,
  nextLevelExp = 100,
  badges = [],
  achievements = [],
  language = 'ko',
  onClose,
  onShareClick
}: IDCardEnhancedProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardView, setCardView] = useState<'profile' | 'stats' | 'achievements'>('profile');
  const cardRef = useRef<HTMLDivElement>(null);

  const personality = personalityDescriptions[personalityType];
  const animal = personalityAnimals[personalityType];
  const gradient = personalityGradients[personalityType as keyof typeof personalityGradients] || personalityGradients.LAEF;
  
  const progressPercentage = (experience / nextLevelExp) * 100;

  const generateAndShare = async () => {
    setIsGenerating(true);
    try {
      if (!cardRef.current) return;

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        logging: false,
        useCORS: true,
        width: 450,
        height: 600
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (onShareClick) {
          onShareClick();
        }

        if (navigator.share && navigator.canShare({ files: [new File([blob], 'sayu-profile.png', { type: 'image/png' })] })) {
          try {
            await navigator.share({
              title: language === 'ko' ? 'SAYU - 나의 예술 성격' : 'SAYU - My Art Personality',
              text: language === 'ko' 
                ? `나는 ${personality?.title_ko || personality?.title} (${personalityType})! 당신의 예술 성격은?` 
                : `I'm ${personality?.title} (${personalityType})! What's your art personality?`,
              files: [new File([blob], 'sayu-profile.png', { type: 'image/png' })]
            });
          } catch (error) {
            console.error('Error sharing:', error);
          }
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `SAYU_${personalityType}_profile.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="relative max-w-[450px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <span className="text-white text-xl">✕</span>
        </button>

        {/* View Selector */}
        <div className="flex gap-2 mb-4 justify-center">
          {(['profile', 'stats', 'achievements'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCardView(view)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                cardView === view 
                  ? 'bg-white text-black' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {view === 'profile' && (language === 'ko' ? '👤 프로필' : '👤 Profile')}
              {view === 'stats' && (language === 'ko' ? '📊 통계' : '📊 Stats')}
              {view === 'achievements' && (language === 'ko' ? '🏆 업적' : '🏆 Achievements')}
            </button>
          ))}
        </div>

        {/* Card Container */}
        <div 
          ref={cardRef}
          className="relative w-[450px] h-[600px] overflow-hidden rounded-3xl shadow-2xl"
          style={{ background: getGradientStyle(personalityType as keyof typeof personalityGradients, 135) }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

          <AnimatePresence mode="wait">
            {/* Profile View */}
            {cardView === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="relative h-full p-8 flex flex-col text-white"
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold mb-1">SAYU</h1>
                  <p className="text-sm opacity-80">
                    {language === 'ko' ? '예술 성격 프로필' : 'Art Personality Profile'}
                  </p>
                </div>

                {/* Avatar & Type */}
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center ring-4 ring-white/30">
                    <span className="text-5xl">{animal?.emoji}</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{userName}</h2>
                  <p className="text-sm opacity-80 mb-3">{userHandle}</p>
                  
                  <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                    <div className="text-2xl font-bold">{personalityType}</div>
                    <div className="text-sm">
                      {language === 'ko' ? personality?.title_ko : personality?.title}
                    </div>
                  </div>
                </div>

                {/* Level & Progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm opacity-80">
                      {language === 'ko' ? '아트 레벨' : 'Art Level'}
                    </span>
                    <span className="text-lg font-bold">Lv.{level}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-xs text-right mt-1 opacity-70">
                    {experience} / {nextLevelExp} XP
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center bg-white/10 rounded-xl p-3">
                    <div className="text-xl font-bold">{stats.exhibitionsVisited}</div>
                    <div className="text-xs opacity-70">
                      {language === 'ko' ? '전시' : 'Shows'}
                    </div>
                  </div>
                  <div className="text-center bg-white/10 rounded-xl p-3">
                    <div className="text-xl font-bold">{stats.artworksViewed}</div>
                    <div className="text-xs opacity-70">
                      {language === 'ko' ? '작품' : 'Works'}
                    </div>
                  </div>
                  <div className="text-center bg-white/10 rounded-xl p-3">
                    <div className="text-xl font-bold">{stats.hoursSpent}h</div>
                    <div className="text-xs opacity-70">
                      {language === 'ko' ? '시간' : 'Hours'}
                    </div>
                  </div>
                </div>

                {/* Recent Badges */}
                <div className="mt-auto">
                  <p className="text-sm opacity-80 mb-2">
                    {language === 'ko' ? '최근 획득 배지' : 'Recent Badges'}
                  </p>
                  <div className="flex gap-2">
                    {badges.filter(b => b.earned).slice(0, 5).map((badge) => (
                      <div 
                        key={badge.id}
                        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg"
                        title={badge.name}
                      >
                        {badge.icon}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stats View */}
            {cardView === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="relative h-full p-8 flex flex-col text-white"
              >
                <h2 className="text-2xl font-bold mb-6 text-center">
                  {language === 'ko' ? '나의 예술 여정' : 'My Art Journey'}
                </h2>

                {/* Detailed Stats */}
                <div className="space-y-4 mb-6">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">🏛️</span>
                        <span>{language === 'ko' ? '전시 관람' : 'Exhibitions'}</span>
                      </span>
                      <span className="text-2xl font-bold">{stats.exhibitionsVisited}</span>
                    </div>
                    <div className="text-xs opacity-70">
                      {language === 'ko' 
                        ? '다양한 전시를 통해 예술 세계를 탐험했어요' 
                        : 'Explored the art world through various exhibitions'}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">🖼️</span>
                        <span>{language === 'ko' ? '작품 감상' : 'Artworks'}</span>
                      </span>
                      <span className="text-2xl font-bold">{stats.artworksViewed}</span>
                    </div>
                    <div className="text-xs opacity-70">
                      {language === 'ko' 
                        ? '수많은 작품과의 만남을 통해 감성을 키웠어요' 
                        : 'Developed sensitivity through encounters with artworks'}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">⏰</span>
                        <span>{language === 'ko' ? '감상 시간' : 'Time Spent'}</span>
                      </span>
                      <span className="text-2xl font-bold">{stats.hoursSpent}h</span>
                    </div>
                    <div className="text-xs opacity-70">
                      {language === 'ko' 
                        ? '예술과 함께한 소중한 시간들' 
                        : 'Precious moments spent with art'}
                    </div>
                  </div>
                </div>

                {/* Art Style Distribution */}
                <div className="mt-auto">
                  <p className="text-sm opacity-80 mb-3">
                    {language === 'ko' ? '선호 예술 스타일' : 'Preferred Art Styles'}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-20">{language === 'ko' ? '추상' : 'Abstract'}</span>
                      <div className="flex-1 bg-white/20 rounded-full h-2">
                        <div className="bg-white h-2 rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-20">{language === 'ko' ? '구상' : 'Figurative'}</span>
                      <div className="flex-1 bg-white/20 rounded-full h-2">
                        <div className="bg-white h-2 rounded-full" style={{ width: '30%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Achievements View */}
            {cardView === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="relative h-full p-8 flex flex-col text-white"
              >
                <h2 className="text-2xl font-bold mb-6 text-center">
                  {language === 'ko' ? '나의 업적' : 'My Achievements'}
                </h2>

                {/* Badges Grid */}
                <div className="mb-6">
                  <p className="text-sm opacity-80 mb-3">
                    {language === 'ko' ? '획득한 배지' : 'Earned Badges'}
                  </p>
                  <div className="grid grid-cols-6 gap-2">
                    {badges.map((badge) => (
                      <div 
                        key={badge.id}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                          badge.earned 
                            ? 'bg-white/20 scale-100' 
                            : 'bg-white/5 scale-90 opacity-30'
                        }`}
                        title={badge.name}
                      >
                        {badge.icon}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Achievements */}
                <div className="flex-1">
                  <p className="text-sm opacity-80 mb-3">
                    {language === 'ko' ? '최근 달성' : 'Recent Achievements'}
                  </p>
                  <div className="space-y-2">
                    {achievements.slice(0, 3).map((achievement, i) => (
                      <div key={i} className="bg-white/10 rounded-lg p-3">
                        <div className="font-medium text-sm">{achievement.title}</div>
                        <div className="text-xs opacity-70">{achievement.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personality Keywords */}
                <div className="mt-auto">
                  <p className="text-sm opacity-80 mb-2">
                    {language === 'ko' ? '나의 키워드' : 'My Keywords'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {personality?.strengths?.slice(0, 3).map((strength, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 bg-white/15 rounded-full text-xs"
                      >
                        {language === 'ko' && strength.title_ko ? strength.title_ko : strength.title}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-xs opacity-60">
            <span>sayu.app</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>

        {/* Share Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateAndShare}
          disabled={isGenerating}
          className="mt-6 w-full bg-white text-black rounded-full py-4 px-6 font-bold flex items-center justify-center gap-3 hover:shadow-xl transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
              {language === 'ko' ? '이미지 생성 중...' : 'Generating...'}
            </>
          ) : (
            <>
              <span className="text-xl">📸</span>
              {language === 'ko' ? '프로필 카드 공유하기' : 'Share Profile Card'}
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}