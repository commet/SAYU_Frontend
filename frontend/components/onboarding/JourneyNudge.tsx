'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Calendar, Heart, Users, Palette, Sparkles, BookOpen, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard, GlassButton } from '@/components/ui/glass';

interface JourneyNudge {
  day_number: number;
  nudge_type: string;
  title: string;
  message: string;
  cta_text?: string;
  cta_link?: string;
  sent_at: string;
}

interface JourneyNudgeProps {
  nudge: JourneyNudge | null;
  onViewed: (dayNumber: number) => void;
  onClicked: (dayNumber: number) => void;
  onDismiss: () => void;
}

const nudgeIcons = {
  welcome: Heart,
  first_art: Palette,
  community: Users,
  deep_dive: BookOpen,
  discovery: Sparkles,
  reflection: Calendar,
  celebration: Trophy
};

export function JourneyNudgeModal({ nudge, onViewed, onClicked, onDismiss }: JourneyNudgeProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (nudge) {
      setIsVisible(true);
      // 자동으로 viewed 처리
      setTimeout(() => {
        onViewed(nudge.day_number);
      }, 1000);
    }
  }, [nudge, onViewed]);

  if (!nudge) return null;

  const IconComponent = nudgeIcons[nudge.nudge_type as keyof typeof nudgeIcons] || Heart;

  const handleAction = () => {
    onClicked(nudge.day_number);
    if (nudge.cta_link) {
      window.location.href = nudge.cta_link;
    }
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />
          
          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <GlassCard variant="heavy" className="p-6 relative">
              {/* 닫기 버튼 */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Day 표시기 */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-purple-100 rounded-full p-2">
                  <span className="text-xs font-medium text-purple-600">
                    {language === 'ko' ? `${nudge.day_number}일차` : `Day ${nudge.day_number}`}
                  </span>
                </div>
              </div>

              {/* 아이콘 */}
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-4">
                  <IconComponent className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              {/* 제목 */}
              <h3 className="text-xl font-bold text-center mb-4 text-gray-900">
                {nudge.title}
              </h3>

              {/* 메시지 */}
              <p className="text-gray-700 text-center mb-6 leading-relaxed">
                {nudge.message}
              </p>

              {/* 액션 버튼들 */}
              <div className="flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {language === 'ko' ? '나중에' : 'Later'}
                </button>
                
                {nudge.cta_text && (
                  <GlassButton
                    onClick={handleAction}
                    variant="primary"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {nudge.cta_text}
                    <ChevronRight className="w-4 h-4" />
                  </GlassButton>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// 미니 여정 진행 표시기 (상단바용)
interface JourneyProgressProps {
  currentDay: number;
  totalDays?: number;
  completedDays: number;
}

export function JourneyProgress({ currentDay, totalDays = 7, completedDays }: JourneyProgressProps) {
  const { language } = useLanguage();
  const progress = (completedDays / totalDays) * 100;

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-purple-200"
      whileHover={{ scale: 1.05 }}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-purple-600" />
          <span className="text-xs font-medium text-purple-700">
            {language === 'ko' ? `${currentDay}/7일` : `${currentDay}/7 days`}
          </span>
        </div>
        
        {/* 미니 진행률 바 */}
        <div className="w-12 h-1.5 bg-purple-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
}