'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Trophy, Star, Crown } from 'lucide-react';
import { AchievementBadge } from './AchievementBadge';

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  badge_color: string;
  rarity: string;
  points: number;
  unlock_message: string;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  autoCloseDelay?: number;
}

const rarityConfig = {
  common: {
    bgColor: 'from-gray-800 to-gray-900',
    borderColor: 'border-gray-600',
    textColor: 'text-gray-300',
    icon: Star,
    iconColor: 'text-gray-400'
  },
  rare: {
    bgColor: 'from-blue-800 to-blue-900',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-300',
    icon: Star,
    iconColor: 'text-blue-400'
  },
  epic: {
    bgColor: 'from-purple-800 to-purple-900',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-300',
    icon: Crown,
    iconColor: 'text-purple-400'
  },
  legendary: {
    bgColor: 'from-yellow-800 to-orange-900',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-300',
    icon: Crown,
    iconColor: 'text-yellow-400'
  }
};

export function AchievementNotification({ 
  achievement, 
  onClose, 
  autoCloseDelay = 8000 
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = rarityConfig[achievement.rarity as keyof typeof rarityConfig] || rarityConfig.common;
  const RarityIcon = config.icon;

  useEffect(() => {
    if (autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.3, 
            x: 100,
            rotate: -10
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            x: 0,
            rotate: 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.3, 
            x: 100,
            rotate: 10
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.6
          }}
          className={`
            fixed top-4 right-4 z-50 max-w-sm w-full
            bg-gradient-to-r ${config.bgColor}
            border-2 ${config.borderColor}
            rounded-xl shadow-2xl backdrop-blur-sm
            ${config.textColor} p-4
          `}
          style={{
            boxShadow: `0 0 30px ${achievement.badge_color}40, 0 10px 40px rgba(0,0,0,0.3)`
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Trophy className={`w-5 h-5 ${config.iconColor}`} />
              <span className="text-sm font-semibold opacity-80">Achievement Unlocked!</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex items-start gap-4">
            {/* Achievement Badge */}
            <div className="flex-shrink-0">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              >
                <AchievementBadge 
                  achievement={{ ...achievement, unlocked: true }} 
                  size="md" 
                />
              </motion.div>
            </div>

            {/* Achievement Details */}
            <div className="flex-1 min-w-0">
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-bold text-white mb-1 truncate"
              >
                {achievement.name}
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm opacity-90 mb-2 line-clamp-2"
              >
                {achievement.unlock_message || achievement.description}
              </motion.p>

              {/* Points and Rarity */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <RarityIcon className={`w-3 h-3 ${config.iconColor}`} />
                  <span className="font-semibold capitalize">{achievement.rarity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-purple-400 font-bold">+{achievement.points}</span>
                  <span className="opacity-60">pts</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Progress Bar Animation */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1, duration: autoCloseDelay / 1000 - 1 }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing achievement notifications
export function useAchievementNotifications() {
  const [notifications, setNotifications] = useState<(Achievement & { notificationId: string })[]>([]);

  const showNotification = (achievement: Achievement) => {
    const notificationId = `${achievement.id}-${Date.now()}`;
    const notificationWithId = { ...achievement, notificationId };
    
    setNotifications(prev => [...prev, notificationWithId]);
  };

  const closeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    showNotification,
    closeNotification,
    clearAll
  };
}

// Component to render all active notifications
export function AchievementNotifications() {
  const { notifications, closeNotification } = useAchievementNotifications();

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.notificationId} className="pointer-events-auto">
          <AchievementNotification
            achievement={notification}
            onClose={() => closeNotification(notification.notificationId)}
          />
        </div>
      ))}
    </div>
  );
}