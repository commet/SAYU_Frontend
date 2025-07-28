'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Zap, TrendingUp, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGamificationDashboard } from '@/hooks/useGamification';
import { PointsDisplay } from '@/components/gamification/PointsDisplay';
import { MissionCard } from '@/components/gamification/MissionCard';
import { AchievementBadge } from '@/components/gamification/AchievementBadge';
import { achievements } from '@/data/achievements';
import { EvaluationSummaryCard } from '@/components/evaluation/EvaluationSummaryCard';
import LanguageToggle from '@/components/ui/LanguageToggle';

type TabType = 'overview' | 'missions' | 'achievements' | 'history' | 'evaluations';

export default function GamificationPage() {
  const { language } = useLanguage();
  const { dashboard, isLoading, error } = useGamificationDashboard();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-amber-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">
            {language === 'ko' ? '로딩 중...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            {language === 'ko' ? '오류가 발생했습니다' : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: language === 'ko' ? '개요' : 'Overview', icon: TrendingUp },
    { id: 'missions' as TabType, label: language === 'ko' ? '미션' : 'Missions', icon: Target },
    { id: 'achievements' as TabType, label: language === 'ko' ? '업적' : 'Achievements', icon: Zap },
    { id: 'history' as TabType, label: language === 'ko' ? '기록' : 'History', icon: Trophy },
    { id: 'evaluations' as TabType, label: language === 'ko' ? '평가' : 'Evaluations', icon: Star }
  ];

  const activeMissions = dashboard.challenges?.filter((c: any) => c.status === 'active') || [];
  const completedMissions = dashboard.challenges?.filter((c: any) => c.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              {language === 'ko' ? '나의 예술 여정' : 'My Art Journey'}
            </h1>
            <LanguageToggle variant="glass" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Points Display */}
        <div className="mb-8">
          <PointsDisplay userPoints={{
            userId: 'current-user',
            totalPoints: dashboard?.totalPoints || 0,
            level: dashboard?.level || 1,
            levelName: dashboard?.levelName || 'Beginner',
            levelName_ko: dashboard?.levelName_ko || '초보자',
            nextLevelPoints: dashboard?.nextLevelPoints || 100,
            achievements: dashboard?.achievements || [],
            missions: dashboard?.challenges || [],
            exhibitionHistory: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white shadow-md text-amber-600'
                    : 'bg-white/50 text-gray-600 hover:bg-white/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="w-8 h-8 text-blue-500" />
                    <span className="text-2xl font-bold">{dashboard?.challenges?.length || 0}</span>
                  </div>
                  <p className="text-gray-600">
                    {language === 'ko' ? '활성 미션' : 'Active Missions'}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="w-8 h-8 text-amber-500" />
                    <span className="text-2xl font-bold">
                      {dashboard?.achievements?.filter((a: any) => a.unlockedAt).length || 0}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {language === 'ko' ? '달성 업적' : 'Unlocked Achievements'}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <Trophy className="w-8 h-8 text-green-500" />
                    <span className="text-2xl font-bold">
                      {dashboard?.totalExhibitions || 0}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {language === 'ko' ? '전시 방문' : 'Exhibitions Visited'}
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">
                  {language === 'ko' ? '최근 활동' : 'Recent Activity'}
                </h3>
                {dashboard.recentActivities && dashboard.recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.recentActivities.slice(0, 5).map((activity: any) => (
                      <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-amber-600">
                            +{activity.points} {language === 'ko' ? '포인트' : 'points'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    {language === 'ko' 
                      ? '아직 활동 기록이 없습니다' 
                      : 'No activity yet'
                    }
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'missions' && (
            <div className="space-y-6">
              {/* Active Missions */}
              <div>
                <h3 className="text-lg font-bold mb-4">
                  {language === 'ko' ? '진행 중인 미션' : 'Active Missions'}
                </h3>
                {activeMissions.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {activeMissions.map((mission: any) => (
                      <MissionCard
                        key={mission.id}
                        mission={mission}
                        onComplete={() => console.log('Complete mission:', mission.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {language === 'ko' 
                        ? '모든 미션을 완료했습니다!' 
                        : 'All missions completed!'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Completed Missions */}
              {completedMissions.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">
                    {language === 'ko' ? '완료한 미션' : 'Completed Missions'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 opacity-60">
                    {completedMissions.map((mission: any) => (
                      <MissionCard key={mission.id} mission={mission} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {['exploration', 'social', 'knowledge', 'special'].map(category => {
                const categoryAchievements = dashboard.achievements?.filter((a: any) => a.category === category) || [];
                const unlockedCount = categoryAchievements.filter((a: any) => a.earnedAt).length;

                return (
                  <div key={category} className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 capitalize">
                      {language === 'ko' 
                        ? category === 'exploration' ? '탐험' 
                          : category === 'social' ? '소셜' 
                          : category === 'knowledge' ? '지식' 
                          : '특별'
                        : category
                      } ({unlockedCount}/{categoryAchievements.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {categoryAchievements.map((achievement: any) => {
                        const userAchievement = categoryAchievements.find((a: any) => a.id === achievement.id);
                        return (
                          <AchievementBadge
                            key={achievement.id}
                            achievement={{
                              ...achievement,
                              unlockedAt: userAchievement?.unlockedAt
                            }}
                            unlocked={!!userAchievement?.unlockedAt}
                            size="small"
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">
                {language === 'ko' ? '전시 방문 기록' : 'Exhibition History'}
              </h3>
              {dashboard.recentExhibitions && dashboard.recentExhibitions.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.recentExhibitions.map((visit: any) => (
                    <div key={visit.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{visit.exhibitionName}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(visit.visitDate).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          {visit.companionType && (
                            <p className="text-sm text-gray-600 mt-2">
                              {language === 'ko' ? '동반자: ' : 'Companion: '}
                              <span className="font-medium">{visit.companionType}</span>
                              {visit.compatibilityLevel && (
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                  visit.compatibilityLevel === 'platinum' ? 'bg-purple-100 text-purple-700' :
                                  visit.compatibilityLevel === 'gold' ? 'bg-amber-100 text-amber-700' :
                                  visit.compatibilityLevel === 'silver' ? 'bg-gray-100 text-gray-700' :
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  {visit.compatibilityLevel}
                                </span>
                              )}
                            </p>
                          )}
                          {visit.review && (
                            <p className="text-sm text-gray-700 mt-3 italic">
                              "{visit.review}"
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-amber-600">
                            +{visit.pointsEarned}
                          </p>
                          {visit.rating && (
                            <div className="flex gap-0.5 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-sm ${
                                  i < visit.rating! ? 'text-amber-400' : 'text-gray-300'
                                }`}>
                                  ★
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {language === 'ko' 
                    ? '아직 전시 방문 기록이 없습니다' 
                    : 'No exhibition visits yet'
                  }
                </p>
              )}
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div className="space-y-6">
              {/* Evaluation Summary */}
              {dashboard?.totalExhibitions ? (
                <EvaluationSummaryCard summary={{
                  userId: 'current-user',
                  personalityType: 'INFP',
                  averageRatings: {
                    exhibitionEngagement: 4.5,
                    communication: 4.2,
                    paceMatching: 4.0,
                    newPerspectives: 4.8,
                    overallSatisfaction: 4.5
                  },
                  totalEvaluations: dashboard?.totalExhibitions || 0,
                  wouldGoAgainPercentage: 85,
                  chemistryStats: {},
                  receivedHighlights: ['지식이 풍부함', '유머러스함', '배려심 깊음'],
                  receivedImprovements: ['시간 약속 지키기', '더 적극적인 소통'],
                  earnedTitles: []
                }} />
              ) : null}

              {/* Pending Evaluations */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">
                  {language === 'ko' ? '대기 중인 평가' : 'Pending Evaluations'}
                </h3>
                <p className="text-gray-500 text-center py-8">
                  {language === 'ko' 
                    ? '평가할 전시 방문이 없습니다' 
                    : 'No exhibition visits to evaluate'
                  }
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}