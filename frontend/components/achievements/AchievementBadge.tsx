'use client';

import { motion } from 'framer-motion';
import { 
  Sparkles, Trophy, Star, Heart, Eye, Crown, GraduationCap, 
  MessageCircle, Calendar, Flame, Infinity, Zap, Flag, 
  Compass, User, Image, Bookmark, MessageSquare, Bot 
} from 'lucide-react';

const iconMap = {
  Sparkles, Trophy, Star, Heart, Eye, Crown, GraduationCap,
  MessageCircle, Calendar, Flame, Infinity, Zap, Flag,
  Compass, User, Image, Bookmark, MessageSquare, Bot
};

interface AchievementBadgeProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    badge_icon: string;
    badge_color: string;
    rarity: string;
    points: number;
    unlocked: boolean;
    unlocked_at?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: () => void;
}

const rarityStyles = {
  common: {
    border: 'border-gray-500',
    bg: 'bg-gray-800/50',
    glow: 'shadow-gray-500/20',
    text: 'text-gray-300'
  },
  rare: {
    border: 'border-blue-500',
    bg: 'bg-blue-900/30',
    glow: 'shadow-blue-500/30',
    text: 'text-blue-300'
  },
  epic: {
    border: 'border-purple-500',
    bg: 'bg-purple-900/30',
    glow: 'shadow-purple-500/30',
    text: 'text-purple-300'
  },
  legendary: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-900/30',
    glow: 'shadow-yellow-500/40',
    text: 'text-yellow-300'
  }
};

const sizeStyles = {
  sm: {
    container: 'w-16 h-16',
    icon: 'w-6 h-6',
    text: 'text-xs'
  },
  md: {
    container: 'w-20 h-20',
    icon: 'w-8 h-8',
    text: 'text-sm'
  },
  lg: {
    container: 'w-24 h-24',
    icon: 'w-10 h-10',
    text: 'text-base'
  }
};

export function AchievementBadge({ 
  achievement, 
  size = 'md', 
  showDetails = false,
  onClick 
}: AchievementBadgeProps) {
  const IconComponent = iconMap[achievement.badge_icon as keyof typeof iconMap] || Star;
  const rarity = rarityStyles[achievement.rarity as keyof typeof rarityStyles] || rarityStyles.common;
  const sizing = sizeStyles[size];

  if (!achievement.unlocked) {
    return (
      <motion.div
        className={`
          ${sizing.container} rounded-full border-2 border-dashed border-gray-700 
          bg-gray-900/30 flex items-center justify-center cursor-pointer
          hover:border-gray-600 transition-colors
        `}
        whileHover={{ scale: 1.05 }}
        onClick={onClick}
      >
        <IconComponent className={`${sizing.icon} text-gray-600`} />
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-10"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center min-w-48">
              <div className="text-sm font-semibold text-gray-400 mb-1">{achievement.name}</div>
              <div className="text-xs text-gray-500">{achievement.description}</div>
              <div className="text-xs text-gray-600 mt-1">🔒 Locked</div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`
        ${sizing.container} rounded-full border-2 ${rarity.border} 
        ${rarity.bg} flex items-center justify-center cursor-pointer
        shadow-lg ${rarity.glow} relative group
      `}
      style={{ backgroundColor: `${achievement.badge_color}20` }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <IconComponent 
        className={`${sizing.icon} ${rarity.text}`} 
        style={{ color: achievement.badge_color }}
      />
      
      {/* Points indicator */}
      <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
        {achievement.points}
      </div>

      {/* Rarity indicator */}
      <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-1 py-0.5 ${rarity.bg} border ${rarity.border} rounded text-xs ${rarity.text} font-semibold`}>
        {achievement.rarity.toUpperCase()[0]}
      </div>

      {/* Hover details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        >
          <div className={`${rarity.bg} border ${rarity.border} rounded-lg p-3 text-center min-w-48 shadow-lg backdrop-blur-sm`}>
            <div className={`text-sm font-semibold ${rarity.text} mb-1`}>{achievement.name}</div>
            <div className="text-xs text-gray-400 mb-2">{achievement.description}</div>
            <div className="flex justify-between items-center text-xs">
              <span className={rarity.text}>{achievement.rarity}</span>
              <span className="text-purple-400">{achievement.points} pts</span>
            </div>
            {achievement.unlocked_at && (
              <div className="text-xs text-gray-500 mt-1">
                Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function AchievementGrid({ achievements }: { achievements: any[] }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
      {achievements.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <AchievementBadge achievement={achievement} showDetails />
        </motion.div>
      ))}
    </div>
  );
}