/**
 * Easter Egg Discovery Notification Component
 * Shows a celebratory notification when user discovers an easter egg
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Trophy, Star } from 'lucide-react';
import { EasterEgg, Badge, getBadgeById } from '@/types/sayu-shared';
import { useLanguage } from '@/contexts/LanguageContext';
import confetti from 'canvas-confetti';

interface EasterEggNotificationProps {
  discovery: {
    egg: EasterEgg;
    badge?: Badge;
  } | null;
  onClose: () => void;
}

export function EasterEggNotification({ discovery, onClose }: EasterEggNotificationProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (discovery) {
      setIsVisible(true);
      
      // Trigger confetti
      if (discovery.egg.rarity === 'legendary' || discovery.egg.rarity === 'epic') {
        fireConfetti();
      }
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [discovery]);

  const fireConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        spread: 26,
        startVelocity: 55,
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!discovery) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-900/95';
      case 'rare': return 'bg-blue-900/95';
      case 'epic': return 'bg-purple-900/95';
      case 'legendary': return 'bg-yellow-900/95';
      default: return 'bg-gray-900/95';
    }
  };

  const getRarityStars = (rarity: string) => {
    switch (rarity) {
      case 'common': return 1;
      case 'rare': return 2;
      case 'epic': return 3;
      case 'legendary': return 4;
      default: return 1;
    }
  };

  const badge = discovery.egg.reward.type === 'badge' 
    ? getBadgeById(discovery.egg.reward.id) 
    : null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] max-w-md w-full px-4"
        >
          <div className={`${getRarityBgColor(discovery.egg.rarity)} backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden`}>
            {/* Animated gradient background */}
            <div className="absolute inset-0 opacity-30">
              <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(discovery.egg.rarity)} animate-pulse`} />
            </div>

            {/* Content */}
            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-4xl"
                  >
                    {discovery.egg.icon}
                  </motion.div>
                  <div>
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg font-bold text-white flex items-center gap-2"
                    >
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      {language === 'ko' ? '이스터에그 발견!' : 'Easter Egg Found!'}
                    </motion.h3>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-1 mt-1"
                    >
                      {Array.from({ length: getRarityStars(discovery.egg.rarity) }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </motion.div>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Easter Egg Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-4"
              >
                <h4 className="text-xl font-bold text-white mb-1">
                  {language === 'ko' ? discovery.egg.nameKo : discovery.egg.name}
                </h4>
                <p className="text-white/80 text-sm">
                  {language === 'ko' ? discovery.egg.descriptionKo : discovery.egg.description}
                </p>
              </motion.div>

              {/* Badge Reward */}
              {badge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/10 rounded-lg p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{badge.icon}</div>
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wide">
                          {language === 'ko' ? '뱃지 획득' : 'Badge Earned'}
                        </p>
                        <p className="text-white font-semibold">
                          {language === 'ko' ? badge.nameKo : badge.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-400">
                        +{badge.points}
                      </p>
                      <p className="text-xs text-white/60">
                        {language === 'ko' ? '포인트' : 'points'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Rarity indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 flex items-center justify-center"
              >
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-gradient-to-r ${getRarityColor(discovery.egg.rarity)} text-white`}>
                  {discovery.egg.rarity}
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}