'use client';

import { motion } from 'framer-motion';
import { Star, Users, TrendingUp, Award, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { EvaluationSummary } from '@/types/companion-evaluation';
import { companionTitles } from '@/data/companion-titles';

interface EvaluationSummaryCardProps {
  summary: EvaluationSummary;
  compact?: boolean;
}

export function EvaluationSummaryCard({ summary, compact = false }: EvaluationSummaryCardProps) {
  const { language } = useLanguage();
  
  const overallAverage = (
    summary.averageRatings.exhibitionEngagement +
    summary.averageRatings.communication +
    summary.averageRatings.paceMatching +
    summary.averageRatings.newPerspectives +
    summary.averageRatings.overallSatisfaction
  ) / 5;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="font-bold text-lg">{overallAverage.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-600">
              ({summary.totalEvaluations} {language === 'ko' ? '평가' : 'reviews'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {summary.wouldGoAgainPercentage}% {language === 'ko' ? '재방문 희망' : 'would go again'}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-6 shadow-lg"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {language === 'ko' ? '동반자 평가 요약' : 'Companion Evaluation Summary'}
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            <span className="text-2xl font-bold">{overallAverage.toFixed(1)}</span>
            <span className="text-gray-600">/5.0</span>
          </div>
          <span className="text-gray-500">
            {summary.totalEvaluations} {language === 'ko' ? '개의 평가' : 'evaluations'}
          </span>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="space-y-3 mb-6">
        {Object.entries(summary.averageRatings).map(([key, value]) => {
          const labels = {
            exhibitionEngagement: language === 'ko' ? '전시 몰입도' : 'Exhibition Engagement',
            communication: language === 'ko' ? '소통과 공유' : 'Communication',
            paceMatching: language === 'ko' ? '페이스 맞추기' : 'Pace Matching',
            newPerspectives: language === 'ko' ? '새로운 시각' : 'New Perspectives',
            overallSatisfaction: language === 'ko' ? '전반적 만족도' : 'Overall Satisfaction'
          };
          
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-32">
                {labels[key as keyof typeof labels]}
              </span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / 5) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
                />
              </div>
              <span className="text-sm font-medium w-10 text-right">
                {value.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-2xl">{summary.wouldGoAgainPercentage}%</span>
          </div>
          <p className="text-sm text-gray-600">
            {language === 'ko' ? '다시 함께 가고 싶음' : 'Would go again'}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="font-bold text-2xl">
              {Object.keys(summary.chemistryStats).length}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {language === 'ko' ? '다양한 유형과 경험' : 'Different types'}
          </p>
        </div>
      </div>

      {/* Earned Titles */}
      {summary.earnedTitles.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            {language === 'ko' ? '획득한 타이틀' : 'Earned Titles'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {summary.earnedTitles.map(title => (
              <div
                key={title.id}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full"
              >
                <span className="text-sm font-medium">
                  {title.icon} {language === 'ko' ? title.name_ko : title.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Feedback */}
      {(summary.receivedHighlights.length > 0 || summary.receivedImprovements.length > 0) && (
        <div className="bg-white rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-500" />
            {language === 'ko' ? '최근 피드백' : 'Recent Feedback'}
          </h4>
          
          {summary.receivedHighlights.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-green-700 mb-1">
                {language === 'ko' ? '좋았던 점' : 'Highlights'}
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                {summary.receivedHighlights.slice(0, 3).map((highlight, index) => (
                  <li key={index} className="pl-4 relative">
                    <span className="absolute left-0 text-green-500">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {summary.receivedImprovements.length > 0 && (
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">
                {language === 'ko' ? '개선 제안' : 'Suggestions'}
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                {summary.receivedImprovements.slice(0, 2).map((improvement, index) => (
                  <li key={index} className="pl-4 relative">
                    <span className="absolute left-0 text-blue-500">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}