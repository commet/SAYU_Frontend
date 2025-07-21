/**
 * Badge Showcase Component
 * Displays user's earned badges and easter egg progress
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Lock, Sparkles } from 'lucide-react';
import { useEasterEgg } from '@/contexts/EasterEggContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '../../../shared/easterEggDefinitions';

export function BadgeShowcase() {
  const { language } = useLanguage();
  const { badges, totalPoints, currentTitle, progress } = useEasterEgg();

  const getRarityColor = (tier: number) => {
    switch (tier) {
      case 1: return 'from-gray-400 to-gray-600';
      case 2: return 'from-blue-400 to-blue-600';
      case 3: return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getCategoryName = (category: string) => {
    const names = {
      knowledge: { en: 'Knowledge', ko: '지식' },
      exploration: { en: 'Exploration', ko: '탐험' },
      emotion: { en: 'Emotion', ko: '감성' },
      special: { en: 'Special', ko: '특별' }
    };
    return language === 'ko' ? names[category as keyof typeof names]?.ko : names[category as keyof typeof names]?.en;
  };

  // Group badges by category
  const badgesByCategory = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ko' ? '뱃지 & 업적' : 'Badges & Achievements'}
            </h2>
            <p className="text-sm text-gray-600">
              {language === 'ko' 
                ? `${badges.length}개 획득 · ${totalPoints} 포인트`
                : `${badges.length} earned · ${totalPoints} points`}
            </p>
          </div>
        </div>
        
        {/* Current Title */}
        <div className="text-right">
          <p className="text-xs text-gray-600 uppercase tracking-wide">
            {language === 'ko' ? '현재 타이틀' : 'Current Title'}
          </p>
          <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {language === 'ko' ? currentTitle.titleKo : currentTitle.title}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>{language === 'ko' ? '다음 타이틀까지' : 'To Next Title'}</span>
          <span>{totalPoints} / {getNextTitlePoints(totalPoints)}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(totalPoints / getNextTitlePoints(totalPoints)) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
      </div>

      {/* Badge Categories */}
      <div className="space-y-6">
        {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              {getCategoryName(category)}
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {categoryBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group cursor-pointer"
                >
                  <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${getRarityColor(badge.tier)} p-3 flex items-center justify-center shadow-lg transform transition-all duration-200 group-hover:shadow-xl`}>
                    <span className="text-2xl">{badge.icon}</span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                      <p className="font-semibold">
                        {language === 'ko' ? badge.nameKo : badge.name}
                      </p>
                      <p className="text-gray-300 text-[10px] mt-1">
                        +{badge.points} {language === 'ko' ? '포인트' : 'points'}
                      </p>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Tier stars */}
                  <div className="absolute -bottom-1 -right-1 flex">
                    {Array.from({ length: badge.tier }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Discovery Stats */}
      {progress && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            {language === 'ko' ? '발견 통계' : 'Discovery Stats'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {progress.statistics.totalDiscoveries}
              </p>
              <p className="text-xs text-gray-600">
                {language === 'ko' ? '총 발견' : 'Total Found'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {progress.statistics.rareDiscoveries}
              </p>
              <p className="text-xs text-gray-600">
                {language === 'ko' ? '레어' : 'Rare'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {progress.statistics.epicDiscoveries}
              </p>
              <p className="text-xs text-gray-600">
                {language === 'ko' ? '에픽' : 'Epic'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {progress.statistics.legendaryDiscoveries}
              </p>
              <p className="text-xs text-gray-600">
                {language === 'ko' ? '레전더리' : 'Legendary'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hint Section */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-purple-900 mb-1">
              {language === 'ko' ? '힌트' : 'Hint'}
            </p>
            <p className="text-xs text-purple-700">
              {language === 'ko' 
                ? '숨겨진 이스터에그가 더 있습니다. 호기심을 가지고 탐험해보세요!'
                : 'There are more hidden easter eggs. Stay curious and explore!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getNextTitlePoints(currentPoints: number): number {
  if (currentPoints < 50) return 50;
  if (currentPoints < 100) return 100;
  if (currentPoints < 200) return 200;
  if (currentPoints < 300) return 300;
  return 500;
}