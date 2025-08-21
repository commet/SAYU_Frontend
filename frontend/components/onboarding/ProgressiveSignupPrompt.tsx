'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Heart, Bookmark, UserPlus, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGuestTracking } from '@/hooks/useGuestTracking';
import { GuestStorage } from '@/lib/guest-storage';

interface ProgressiveSignupPromptProps {
  trigger: 'collection_engagement' | 'high_interaction' | 'time_spent' | 'artwork_saves';
  onSignup: () => void;
  onDismiss: () => void;
  customMessage?: string;
}

interface PromptVariant {
  title: string;
  description: string;
  benefits: string[];
  urgency: 'low' | 'medium' | 'high';
  icon: React.ComponentType<any>;
}

export function ProgressiveSignupPrompt({ 
  trigger, 
  onSignup, 
  onDismiss, 
  customMessage 
}: ProgressiveSignupPromptProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [variant, setVariant] = useState<PromptVariant | null>(null);
  const [stats, setStats] = useState({ savedCount: 0, likedCount: 0, sessionTime: 0 });
  
  const { getInteractionData, getPersonalizationInsights } = useGuestTracking();

  useEffect(() => {
    // Get user stats
    const guestData = GuestStorage.getData();
    const interactionData = getInteractionData();
    const insights = getPersonalizationInsights();
    
    setStats({
      savedCount: guestData.savedArtworks.length,
      likedCount: guestData.savedArtworks.length, // Using saved as proxy for liked for now
      sessionTime: Math.floor(interactionData.sessionDuration / 60)
    });

    // Determine prompt variant based on trigger and stats
    setVariant(getPromptVariant(trigger, guestData, insights));
  }, [trigger, getInteractionData, getPersonalizationInsights]);

  const getPromptVariant = (trigger: string, guestData: any, insights: any): PromptVariant => {
    const savedCount = guestData.savedArtworks.length;
    const engagementLevel = insights.engagementPattern;

    switch (trigger) {
      case 'collection_engagement':
        if (savedCount >= 5) {
          return {
            title: '와! 벌써 컬렉터가 되셨네요! 🎨',
            description: `${savedCount}개의 작품을 저장하셨습니다. 이제 AI가 당신만의 예술 취향을 분석할 준비가 되었어요.`,
            benefits: [
              '개인화된 작품 추천 받기',
              '컬렉션 안전하게 보관하기',
              '나와 비슷한 취향의 사람들과 연결'
            ],
            urgency: 'high',
            icon: TrendingUp
          };
        } else if (savedCount >= 3) {
          return {
            title: '당신의 예술 감각이 보입니다! ✨',
            description: `${savedCount}개의 작품으로 취향 패턴이 형성되고 있어요. 계정을 만들면 더 정확한 추천을 받을 수 있습니다.`,
            benefits: [
              'AI 맞춤 추천 시작하기',
              '작품 컬렉션 영구 보관',
              '성격별 큐레이션 받기'
            ],
            urgency: 'medium',
            icon: Heart
          };
        } else {
          return {
            title: '첫 번째 작품을 저장하셨네요! 📌',
            description: '좋은 시작이에요! 계정을 만들어 더 많은 작품을 탐색하고 개인화된 경험을 시작해보세요.',
            benefits: [
              '무제한 작품 저장하기',
              '취향 기반 추천 받기',
              '예술 여정 기록하기'
            ],
            urgency: 'low',
            icon: Bookmark
          };
        }

      case 'high_interaction':
        return {
          title: '당신은 진정한 아트 러버네요! 🎭',
          description: '활발한 탐색 활동이 인상적이에요. 이제 당신만을 위한 맞춤 경험을 만들어드릴게요.',
          benefits: [
            '고급 개인화 기능 이용',
            '아트 커뮤니티 참여',
            '전문 큐레이터 추천'
          ],
          urgency: 'high',
          icon: Sparkles
        };

      case 'time_spent':
        return {
          title: `${stats.sessionTime}분 동안 함께해주셨네요! ⏰`,
          description: '충분한 탐색을 통해 당신의 취향을 파악할 수 있게 되었어요. 이제 더 깊은 경험을 시작해보세요.',
          benefits: [
            '시간 투자에 대한 보상',
            '개인화된 아트 여정',
            '취향 분석 리포트'
          ],
          urgency: 'medium',
          icon: Clock
        };

      default:
        return {
          title: '무료로 시작하는 나만의 아트 여정',
          description: '몇 초면 계정을 만들고 개인화된 예술 경험을 시작할 수 있어요.',
          benefits: [
            '완전 무료 서비스',
            '개인화된 추천',
            '작품 컬렉션 관리'
          ],
          urgency: 'low',
          icon: UserPlus
        };
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleSignup = () => {
    setIsVisible(false);
    setTimeout(onSignup, 300);
  };

  if (!variant) return null;

  const IconComponent = variant.icon;
  const urgencyColors = {
    low: 'from-blue-600/20 to-purple-600/20 border-blue-500/30',
    medium: 'from-purple-600/20 to-pink-600/20 border-purple-500/30',
    high: 'from-pink-600/20 to-red-600/20 border-pink-500/30'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`
              relative max-w-md w-full bg-gradient-to-br ${urgencyColors[variant.urgency]} 
              backdrop-blur-md rounded-2xl p-6 border shadow-2xl
            `}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-slate-300" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {variant.title}
                </h3>
                <p className="text-sm text-slate-200">
                  {customMessage || variant.description}
                </p>
              </div>
            </div>

            {/* Stats */}
            {(stats.savedCount > 0 || stats.sessionTime > 0) && (
              <div className="flex gap-3 mb-4">
                {stats.savedCount > 0 && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    <Bookmark className="w-3 h-3 mr-1" />
                    {stats.savedCount}개 저장됨
                  </Badge>
                )}
                {stats.sessionTime > 0 && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    <Clock className="w-3 h-3 mr-1" />
                    {stats.sessionTime}분 탐색
                  </Badge>
                )}
              </div>
            )}

            {/* Benefits */}
            <div className="mb-6">
              <p className="text-sm text-slate-300 mb-3">계정을 만들면:</p>
              <ul className="space-y-2">
                {variant.benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-slate-200"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                onClick={handleSignup}
                className="flex-1 bg-white text-slate-900 hover:bg-slate-100 font-medium"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                무료 가입하기
              </Button>
              <Button 
                onClick={handleDismiss}
                variant="ghost" 
                className="text-slate-300 hover:text-white hover:bg-white/10"
              >
                나중에
              </Button>
            </div>

            {/* Fine print */}
            <p className="text-xs text-slate-400 text-center mt-4">
              가입은 완전 무료이며 언제든지 탈퇴할 수 있습니다
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}