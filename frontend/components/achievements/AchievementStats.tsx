'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Crown, Zap } from 'lucide-react';

interface AchievementStatsProps {
  stats: {
    total_achievements: number;
    total_points: number;
    completion_rate: number;
    level: number;
    next_level_points: number;
    points_to_next_level: number;
    common_badges: number;
    rare_badges: number;
    epic_badges: number;
    legendary_badges: number;
  };
}

export function AchievementStats({ stats }: AchievementStatsProps) {
  const progressPercentage = stats.next_level_points > 0 
    ? ((stats.total_points - (Math.pow(stats.level - 1, 2) * 10)) / (stats.next_level_points - (Math.pow(stats.level - 1, 2) * 10))) * 100
    : 0;

  const badgeData = [
    { 
      label: 'Common', 
      count: stats.common_badges, 
      color: 'text-gray-400', 
      bg: 'bg-gray-800',
      icon: Star 
    },
    { 
      label: 'Rare', 
      count: stats.rare_badges, 
      color: 'text-blue-400', 
      bg: 'bg-blue-900/30',
      icon: Star 
    },
    { 
      label: 'Epic', 
      count: stats.epic_badges, 
      color: 'text-purple-400', 
      bg: 'bg-purple-900/30',
      icon: Crown 
    },
    { 
      label: 'Legendary', 
      count: stats.legendary_badges, 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-900/30',
      icon: Crown 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Level {stats.level}</div>
              <div className="text-sm text-purple-300">Aesthetic Explorer</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-white">{stats.total_points}</div>
            <div className="text-xs text-purple-300">Total Points</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress to Level {stats.level + 1}</span>
            <span className="text-purple-300">{stats.points_to_next_level} points needed</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Achievement Overview */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Achievements</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.total_achievements}</div>
          <div className="text-xs text-gray-500">{stats.completion_rate}% Complete</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Total Points</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.total_points}</div>
          <div className="text-xs text-gray-500">Earned from achievements</div>
        </motion.div>
      </div>

      {/* Badge Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          Badge Collection
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badgeData.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`${badge.bg} rounded-lg p-4 text-center border border-gray-700`}
            >
              <badge.icon className={`w-6 h-6 ${badge.color} mx-auto mb-2`} />
              <div className={`text-xl font-bold ${badge.color}`}>{badge.count}</div>
              <div className="text-xs text-gray-400">{badge.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}