'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Eye, Clock, Calendar, Award, Image } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfileStatsProps {
  stats: {
    level: number;
    currentExp: number;
    nextLevelExp: number;
    totalPoints: number;
    visitStreak: number;
    totalVisits: number;
    totalArtworks: number;
    totalPhotos: number;
    averageVisitDuration?: number;
    favoriteArtStyle?: string;
    lastVisitDate?: string;
  };
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  const { language } = useLanguage();
  
  const progressPercentage = (stats.currentExp / stats.nextLevelExp) * 100;
  
  const statItems = [
    {
      icon: <Eye className="w-5 h-5" />,
      label: language === 'ko' ? '감상한 작품' : 'Artworks Viewed',
      value: stats.totalArtworks.toLocaleString(),
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: language === 'ko' ? '방문 일수' : 'Visit Streak',
      value: `${stats.visitStreak} ${language === 'ko' ? '일' : 'days'}`,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: language === 'ko' ? '평균 관람 시간' : 'Avg. Visit Time',
      value: `${stats.averageVisitDuration || 90} ${language === 'ko' ? '분' : 'min'}`,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Image className="w-5 h-5" />,
      label: language === 'ko' ? '사진 기록' : 'Photos Taken',
      value: stats.totalPhotos.toLocaleString(),
      color: 'from-amber-500 to-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <motion.div
        className="sayu-liquid-glass rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {language === 'ko' ? '레벨' : 'Level'} {stats.level}
              </h3>
              <p className="text-sm opacity-70">
                {stats.totalPoints.toLocaleString()} {language === 'ko' ? '포인트' : 'points'}
              </p>
            </div>
          </div>
          <TrendingUp className="w-5 h-5 opacity-50" />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm opacity-70">
            <span>{stats.currentExp.toLocaleString()} XP</span>
            <span>{stats.nextLevelExp.toLocaleString()} XP</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs opacity-60 text-center">
            {language === 'ko' 
              ? `다음 레벨까지 ${(stats.nextLevelExp - stats.currentExp).toLocaleString()} XP`
              : `${(stats.nextLevelExp - stats.currentExp).toLocaleString()} XP to next level`
            }
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="sayu-liquid-glass rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm opacity-70">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Achievement */}
      {stats.favoriteArtStyle && (
        <motion.div
          className="sayu-liquid-glass rounded-xl p-4 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm opacity-70 mb-1">
            {language === 'ko' ? '선호하는 예술 스타일' : 'Favorite Art Style'}
          </p>
          <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {stats.favoriteArtStyle}
          </p>
        </motion.div>
      )}
    </div>
  );
}