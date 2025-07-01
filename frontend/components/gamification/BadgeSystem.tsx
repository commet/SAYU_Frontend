'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap, Heart, Camera, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

export interface Badge {
  id: string;
  name: { en: string; ko: string };
  description: { en: string; ko: string };
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface UserStats {
  level: number;
  currentExp: number;
  nextLevelExp: number;
  totalPoints: number;
  visitStreak: number;
  totalVisits: number;
  totalArtworks: number;
  totalPhotos: number;
}

interface BadgeSystemProps {
  badges: Badge[];
  userStats: UserStats;
  onBadgeClick?: (badge: Badge) => void;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600',
};

export default function BadgeSystem({ badges, userStats, onBadgeClick }: BadgeSystemProps) {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredBadges = badges.filter(badge => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'unlocked') return badge.unlocked;
    return !badge.unlocked;
  });

  const progressPercentage = (userStats.currentExp / userStats.nextLevelExp) * 100;

  return (
    <div className="space-y-6">
      {/* User Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sayu-liquid-glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              {language === 'ko' ? '레벨' : 'Level'} {userStats.level}
            </h2>
            <p className="text-sm opacity-70">
              {userStats.totalPoints.toLocaleString()} {language === 'ko' ? '포인트' : 'points'}
            </p>
          </div>
          
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {userStats.level}
          </motion.div>
        </div>

        {/* Level Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>{language === 'ko' ? '경험치' : 'Experience'}</span>
            <span>{userStats.currentExp} / {userStats.nextLevelExp}</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-lg font-bold">{userStats.visitStreak}</div>
            <div className="text-xs opacity-70">
              {language === 'ko' ? '연속 방문' : 'Day Streak'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <MapPin className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-lg font-bold">{userStats.totalVisits}</div>
            <div className="text-xs opacity-70">
              {language === 'ko' ? '총 방문' : 'Total Visits'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-lg font-bold">{userStats.totalArtworks}</div>
            <div className="text-xs opacity-70">
              {language === 'ko' ? '좋아한 작품' : 'Liked Art'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Camera className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-lg font-bold">{userStats.totalPhotos}</div>
            <div className="text-xs opacity-70">
              {language === 'ko' ? '사진' : 'Photos'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badge Categories */}
      <div className="flex gap-2">
        {(['all', 'unlocked', 'locked'] as const).map((category) => (
          <motion.button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category
                ? 'bg-purple-500 text-white'
                : 'sayu-liquid-glass hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category === 'all' && (language === 'ko' ? '전체' : 'All')}
            {category === 'unlocked' && (language === 'ko' ? '획득함' : 'Unlocked')}
            {category === 'locked' && (language === 'ko' ? '미획득' : 'Locked')}
            <span className="ml-2 opacity-70">
              ({category === 'all' ? badges.length : 
                category === 'unlocked' ? badges.filter(b => b.unlocked).length :
                badges.filter(b => !b.unlocked).length})
            </span>
          </motion.button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onBadgeClick?.(badge)}
            className={`relative sayu-card p-4 cursor-pointer ${
              !badge.unlocked ? 'opacity-60 grayscale' : ''
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Badge Icon */}
            <div
              className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-gradient-to-br ${
                badge.unlocked ? rarityColors[badge.rarity] : 'from-gray-300 to-gray-400'
              }`}
            >
              <div className="text-white">
                {badge.icon}
              </div>
            </div>

            {/* Badge Name */}
            <h4 className="text-sm font-bold text-center mb-1">
              {badge.name[language]}
            </h4>

            {/* Progress Bar (if applicable) */}
            {badge.maxProgress && !badge.unlocked && (
              <div className="mt-2">
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${(badge.progress || 0) / badge.maxProgress * 100}%` }}
                  />
                </div>
                <p className="text-xs text-center mt-1 opacity-70">
                  {badge.progress || 0} / {badge.maxProgress}
                </p>
              </div>
            )}

            {/* Unlocked Date */}
            {badge.unlocked && badge.unlockedAt && (
              <p className="text-xs text-center opacity-60 mt-1">
                {new Date(badge.unlockedAt).toLocaleDateString(
                  language === 'ko' ? 'ko-KR' : 'en-US'
                )}
              </p>
            )}

            {/* Rarity Indicator */}
            <div className={`absolute top-2 right-2 text-xs font-bold ${
              badge.unlocked ? '' : 'opacity-50'
            }`}>
              {badge.rarity === 'legendary' && '⭐'}
              {badge.rarity === 'epic' && '💎'}
              {badge.rarity === 'rare' && '💠'}
            </div>

            {/* Lock Icon for locked badges */}
            {!badge.unlocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                  🔒
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Achievement Toast (would appear when unlocking new badge) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="sayu-liquid-glass rounded-2xl p-4 flex items-center gap-4 min-w-[300px]">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold">
              {language === 'ko' ? '새로운 배지 획득!' : 'New Badge Unlocked!'}
            </h4>
            <p className="text-sm opacity-70">
              {language === 'ko' ? '첫 전시 방문' : 'First Exhibition Visit'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}