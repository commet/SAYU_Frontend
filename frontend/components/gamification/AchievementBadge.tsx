'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Achievement } from '@/types/gamification';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export function AchievementBadge({ 
  achievement, 
  unlocked, 
  size = 'medium',
  showDetails = true 
}: AchievementBadgeProps) {
  const { language } = useLanguage();
  
  const sizeClasses = {
    small: 'w-16 h-16 text-2xl',
    medium: 'w-20 h-20 text-3xl',
    large: 'w-24 h-24 text-4xl'
  };
  
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={unlocked ? { scale: 1.05 } : {}}
      className={`relative ${showDetails ? 'text-center' : ''}`}
    >
      {/* Badge */}
      <div className={`relative mx-auto ${sizeClasses[size]}`}>
        <div className={`
          ${sizeClasses[size]} 
          rounded-full flex items-center justify-center
          ${unlocked 
            ? 'bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg' 
            : 'bg-gray-200'
          }
          transition-all duration-300
        `}>
          {unlocked ? (
            <span className="relative z-10">{achievement.icon}</span>
          ) : (
            <Lock className="w-1/3 h-1/3 text-gray-400" />
          )}
        </div>
        
        {/* Shine effect for unlocked achievements */}
        {unlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent"
          />
        )}
        
        {/* Points badge */}
        {unlocked && size !== 'small' && (
          <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-amber-600 text-white text-xs font-bold rounded-full">
            +{achievement.points}
          </div>
        )}
      </div>

      {/* Details */}
      {showDetails && (
        <div className="mt-3 space-y-1">
          <h4 className={`font-medium ${textSizeClasses[size]} ${
            unlocked ? 'text-gray-800' : 'text-gray-500'
          }`}>
            {language === 'ko' ? achievement.name_ko : achievement.name}
          </h4>
          <p className={`${textSizeClasses[size]} ${
            unlocked ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {language === 'ko' ? achievement.description_ko : achievement.description}
          </p>
          {unlocked && achievement.unlockedAt && (
            <p className="text-xs text-gray-500">
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}