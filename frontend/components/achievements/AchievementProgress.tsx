'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import { AchievementBadge } from './AchievementBadge';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  requirements: Record<string, any>;
  points: number;
  badge_icon: string;
  badge_color: string;
  rarity: string;
  unlock_message: string;
  unlocked: boolean;
  unlocked_at?: string;
}

interface AchievementProgressProps {
  achievements: Record<string, Achievement[]>;
  userProgress?: Record<string, any>;
}

const categoryInfo = {
  profile: {
    title: 'Profile & Setup',
    description: 'Complete your aesthetic journey foundation',
    color: 'from-purple-500 to-pink-500',
    icon: '👤'
  },
  discovery: {
    title: 'Art Discovery',
    description: 'Explore and discover beautiful artworks',
    color: 'from-blue-500 to-cyan-500',
    icon: '🎨'
  },
  engagement: {
    title: 'Engagement',
    description: 'Show appreciation for art you love',
    color: 'from-red-500 to-pink-500',
    icon: '❤️'
  },
  social: {
    title: 'Social & Chat',
    description: 'Connect with your AI curator',
    color: 'from-green-500 to-teal-500',
    icon: '💬'
  },
  consistency: {
    title: 'Consistency',
    description: 'Build lasting aesthetic habits',
    color: 'from-orange-500 to-red-500',
    icon: '🔥'
  },
  special: {
    title: 'Special',
    description: 'Rare and unique achievements',
    color: 'from-yellow-500 to-orange-500',
    icon: '⭐'
  }
};

export function AchievementProgress({ achievements, userProgress }: AchievementProgressProps) {
  const categories = Object.keys(achievements).sort();

  const getProgressText = (achievement: Achievement) => {
    if (achievement.unlocked) return 'Completed';
    if (!userProgress) return 'Not started';

    const reqs = achievement.requirements;
    const progress = [];

    for (const [key, target] of Object.entries(reqs)) {
      const current = userProgress[key] || 0;
      if (typeof target === 'number') {
        progress.push(`${Math.min(current, target)}/${target} ${key.replace('_', ' ')}`);
      } else if (typeof target === 'boolean') {
        progress.push(current ? 'Completed' : 'Pending');
      }
    }

    return progress.join(', ');
  };

  const getProgressPercentage = (achievement: Achievement) => {
    if (achievement.unlocked) return 100;
    if (!userProgress) return 0;

    const reqs = achievement.requirements;
    let totalProgress = 0;
    let totalRequirements = 0;

    for (const [key, target] of Object.entries(reqs)) {
      const current = userProgress[key] || 0;
      if (typeof target === 'number') {
        totalProgress += Math.min(current / target, 1);
        totalRequirements++;
      } else if (typeof target === 'boolean') {
        totalProgress += current ? 1 : 0;
        totalRequirements++;
      }
    }

    return totalRequirements > 0 ? (totalProgress / totalRequirements) * 100 : 0;
  };

  return (
    <div className="space-y-8">
      {categories.map((category, categoryIndex) => {
        const categoryData = categoryInfo[category as keyof typeof categoryInfo];
        const categoryAchievements = achievements[category] || [];
        const completedCount = categoryAchievements.filter(a => a.unlocked).length;
        const totalCount = categoryAchievements.length;

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
          >
            {/* Category Header */}
            <div className={`bg-gradient-to-r ${categoryData?.color || 'from-gray-600 to-gray-700'} p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categoryData?.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{categoryData?.title}</h3>
                    <p className="text-white/80 text-sm">{categoryData?.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{completedCount}/{totalCount}</div>
                  <div className="text-white/80 text-sm">Completed</div>
                </div>
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryAchievements.map((achievement, achievementIndex) => {
                  const progressPercentage = getProgressPercentage(achievement);
                  const progressText = getProgressText(achievement);

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (categoryIndex * 0.1) + (achievementIndex * 0.05) }}
                      className={`
                        p-4 rounded-lg border transition-all duration-200 hover:shadow-lg
                        ${achievement.unlocked 
                          ? 'bg-green-900/20 border-green-700 hover:bg-green-900/30' 
                          : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'
                        }
                      `}
                    >
                      <div className="flex items-start gap-4">
                        {/* Achievement Badge */}
                        <div className="flex-shrink-0">
                          <AchievementBadge achievement={achievement} size="sm" />
                        </div>

                        {/* Achievement Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold truncate">{achievement.name}</h4>
                            {achievement.unlocked ? (
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            ) : progressPercentage > 0 ? (
                              <Circle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            )}
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-2">{achievement.description}</p>
                          
                          {/* Progress Bar */}
                          {!achievement.unlocked && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{progressText}</span>
                                <span className="text-gray-500">{Math.round(progressPercentage)}%</span>
                              </div>
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercentage}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className={`h-full bg-gradient-to-r ${categoryData?.color || 'from-gray-500 to-gray-600'}`}
                                />
                              </div>
                            </div>
                          )}

                          {/* Points and Rarity */}
                          <div className="flex items-center justify-between mt-2 text-xs">
                            <span className={`
                              px-2 py-1 rounded font-semibold
                              ${achievement.rarity === 'common' ? 'bg-gray-700 text-gray-300' :
                                achievement.rarity === 'rare' ? 'bg-blue-700 text-blue-300' :
                                achievement.rarity === 'epic' ? 'bg-purple-700 text-purple-300' :
                                'bg-yellow-700 text-yellow-300'}
                            `}>
                              {achievement.rarity.toUpperCase()}
                            </span>
                            <span className="text-purple-400 font-semibold">{achievement.points} pts</span>
                          </div>

                          {/* Unlock Date */}
                          {achievement.unlocked && achievement.unlocked_at && (
                            <div className="text-xs text-green-400 mt-1">
                              Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}