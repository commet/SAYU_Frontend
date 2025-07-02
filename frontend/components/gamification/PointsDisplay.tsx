'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap, Target, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserPoints } from '@/types/gamification';
import { calculateProgress } from '@/data/levels';

interface PointsDisplayProps {
  userPoints: UserPoints;
  compact?: boolean;
}

export function PointsDisplay({ userPoints, compact = false }: PointsDisplayProps) {
  const { language } = useLanguage();
  const progress = calculateProgress(userPoints.totalPoints);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm"
      >
        <Trophy className="w-4 h-4 text-amber-500" />
        <span className="font-medium text-sm">
          {userPoints.totalPoints.toLocaleString()}
        </span>
        <span className="text-xs text-gray-500">
          Lv.{userPoints.level}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            {userPoints.totalPoints.toLocaleString()}
            <span className="text-sm font-normal text-gray-600 ml-2">
              {language === 'ko' ? '포인트' : 'points'}
            </span>
          </h3>
          <p className="text-gray-600 mt-1">
            {language === 'ko' ? userPoints.levelName_ko : userPoints.levelName}
          </p>
        </div>
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">
              {userPoints.level}
            </span>
          </div>
          <Trophy className="absolute -bottom-1 -right-1 w-6 h-6 text-amber-600" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Level {userPoints.level}</span>
          <span>
            {progress.nextLevel 
              ? `${progress.pointsToNext} ${language === 'ko' ? '포인트 남음' : 'points to go'}`
              : language === 'ko' ? '최고 레벨' : 'Max Level'
            }
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {userPoints.achievements.filter(a => a.unlockedAt).length}
          </p>
          <p className="text-xs text-gray-600">
            {language === 'ko' ? '업적' : 'Achievements'}
          </p>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <Target className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {userPoints.missions.filter(m => m.completed).length}
          </p>
          <p className="text-xs text-gray-600">
            {language === 'ko' ? '완료 미션' : 'Missions'}
          </p>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {userPoints.exhibitionHistory.length}
          </p>
          <p className="text-xs text-gray-600">
            {language === 'ko' ? '전시 방문' : 'Exhibitions'}
          </p>
        </div>
      </div>

      {/* Next Level Preview */}
      {progress.nextLevel && (
        <div className="mt-6 p-4 bg-white/50 rounded-xl">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {language === 'ko' 
              ? `다음 레벨: ${progress.nextLevel.name_ko}`
              : `Next Level: ${progress.nextLevel.name}`
            }
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            {(language === 'ko' ? progress.nextLevel.perks_ko : progress.nextLevel.perks)
              .slice(0, 2)
              .map((perk, index) => (
                <li key={index} className="flex items-center gap-1">
                  <span className="text-amber-500">•</span>
                  {perk}
                </li>
              ))
            }
          </ul>
        </div>
      )}
    </motion.div>
  );
}