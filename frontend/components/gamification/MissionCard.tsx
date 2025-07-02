'use client';

import { motion } from 'framer-motion';
import { Clock, Target, CheckCircle, Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mission } from '@/types/gamification';

interface MissionCardProps {
  mission: Mission;
  onComplete?: () => void;
}

export function MissionCard({ mission, onComplete }: MissionCardProps) {
  const { language } = useLanguage();
  const progress = (mission.progress / mission.target) * 100;
  const isCompleted = mission.completed;
  
  // 남은 시간 계산
  const getRemainingTime = () => {
    if (!mission.expiresAt) return null;
    
    const now = new Date();
    const expires = new Date(mission.expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return language === 'ko' ? '만료됨' : 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return language === 'ko' ? `${days}일 남음` : `${days}d left`;
    }
    return language === 'ko' ? `${hours}시간 남음` : `${hours}h left`;
  };

  const remainingTime = getRemainingTime();
  
  // 미션 타입 색상
  const typeColors = {
    daily: 'from-blue-400 to-blue-500',
    weekly: 'from-purple-400 to-purple-500',
    special: 'from-amber-400 to-amber-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl shadow-md transition-all ${
        isCompleted ? 'bg-gray-100' : 'bg-white'
      }`}
    >
      {/* Mission Type Badge */}
      <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-medium text-white bg-gradient-to-r ${
        typeColors[mission.type]
      } rounded-bl-lg`}>
        {language === 'ko' 
          ? mission.type === 'daily' ? '일일' : mission.type === 'weekly' ? '주간' : '특별'
          : mission.type.charAt(0).toUpperCase() + mission.type.slice(1)
        }
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-lg ${
            isCompleted ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Target className="w-5 h-5 text-gray-600" />
            )}
          </div>
          <div className="flex-1">
            <h4 className={`font-medium ${
              isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'
            }`}>
              {language === 'ko' ? mission.title_ko : mission.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {language === 'ko' ? mission.description_ko : mission.description}
            </p>
          </div>
        </div>

        {/* Progress */}
        {!isCompleted && (
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {mission.progress} / {mission.target}
              </span>
              <span className="text-gray-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Gift className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">
              +{mission.points} {language === 'ko' ? '포인트' : 'points'}
            </span>
          </div>
          
          {remainingTime && !isCompleted && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{remainingTime}</span>
            </div>
          )}
          
          {isCompleted && (
            <span className="text-sm font-medium text-green-600">
              {language === 'ko' ? '완료!' : 'Complete!'}
            </span>
          )}
        </div>
      </div>

      {/* Completed Overlay */}
      {isCompleted && (
        <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
      )}
    </motion.div>
  );
}