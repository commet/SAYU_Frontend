'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Eye, Calendar, Clock, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CompactStatsProps {
  stats: {
    level: number;
    currentExp: number;
    nextLevelExp: number;
    totalPoints: number;
    visitStreak: number;
    totalArtworks: number;
    averageVisitDuration?: number;
    followerCount?: number;
    followingCount?: number;
  };
}

export default function CompactStats({ stats }: CompactStatsProps) {
  const { language } = useLanguage();
  
  const progressPercentage = (stats.currentExp / stats.nextLevelExp) * 100;
  
  const statItems = [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: language === 'ko' ? '레벨' : 'Level',
      value: stats.level,
      subValue: `${progressPercentage.toFixed(0)}%`,
      showProgress: true
    },
    {
      icon: <Eye className="w-4 h-4" />,
      label: language === 'ko' ? '작품' : 'Artworks',
      value: stats.totalArtworks.toLocaleString()
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: language === 'ko' ? '연속' : 'Streak',
      value: `${stats.visitStreak}${language === 'ko' ? '일' : 'd'}`
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: language === 'ko' ? '평균' : 'Avg',
      value: `${stats.averageVisitDuration || 90}${language === 'ko' ? '분' : 'm'}`
    }
  ];
  
  // Add follow stats if available
  if (stats.followerCount !== undefined) {
    statItems.push({
      icon: <Users className="w-4 h-4" />,
      label: language === 'ko' ? '팔로워' : 'Followers',
      value: stats.followerCount.toLocaleString()
    });
  }

  return (
    <motion.div
      className="sayu-liquid-glass rounded-xl p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="flex items-center gap-3 min-w-fit px-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="text-purple-500 dark:text-purple-400">
              {stat.icon}
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="font-semibold text-lg">{stat.value}</span>
                {stat.subValue && (
                  <span className="text-xs opacity-60">{stat.subValue}</span>
                )}
              </div>
              <span className="text-xs opacity-60">{stat.label}</span>
              
              {/* Mini progress bar for level */}
              {stat.showProgress && (
                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {/* Separator */}
        <div className="mx-2 h-8 w-px bg-white/10" />
        
        {/* Total Points */}
        <motion.div
          className="flex items-center gap-2 px-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: statItems.length * 0.05 }}
        >
          <span className="text-sm opacity-60">{language === 'ko' ? '총' : 'Total'}</span>
          <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {stats.totalPoints.toLocaleString()}
          </span>
          <span className="text-sm opacity-60">{language === 'ko' ? '포인트' : 'pts'}</span>
        </motion.div>
      </div>
    </motion.div>
  );
}