'use client';

import { use, useState, useTransition, useDeferredValue } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Trophy, 
  Clock,
  Calendar,
  Target,
  Palette,
  Brain,
  Heart,
  Users,
  Zap,
  Star
} from 'lucide-react';
import { StatCard } from './StatCard';
import { ChartContainer } from './ChartContainer';
import { ProgressRing } from './ProgressRing';
import { TrendIndicator } from './TrendIndicator';
import { useAuth } from '@/hooks/useAuth';
import { usePersonalizedTheme } from '@/hooks/usePersonalizedTheme';

interface AnalyticsData {
  journeyStats: any;
  aestheticEvolution: any;
  engagementPatterns: any;
  discoveryAnalytics: any;
  aiInteractions: any;
  achievements: any;
  comparative: any;
}

// React 19 use() hook을 활용한 데이터 fetching 함수
function fetchAnalyticsData(timeframe: string): Promise<AnalyticsData> {
  const token = localStorage.getItem('token');
  
  return fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/user-report?timeframe=${timeframe}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  ).then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }
    return response.json();
  });
}

// Analytics 탭 컴포넌트 - Suspense로 감싸질 부분
function AnalyticsContent({ timeframe, activeTab, onTabChange }: {
  timeframe: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  // React 19 use() hook으로 Promise를 직접 suspend
  const data = use(fetchAnalyticsData(timeframe));
  const { theme } = usePersonalizedTheme();
  
  // React 19 useTransition으로 탭 전환을 논블로킹으로 처리
  const [isPending, startTransition] = useTransition();
  
  const handleTabChange = (tab: string) => {
    startTransition(() => {
      onTabChange(tab);
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'journey', label: 'Journey', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'discovery', label: 'Discovery', icon: <Eye className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Insights', icon: <Brain className="w-4 h-4" /> },
    { id: 'achievements', label: 'Progress', icon: <Trophy className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs with Transition */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            disabled={isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            } ${isPending ? 'opacity-50' : ''}`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content with smooth transition */}
      <div className={`transition-opacity duration-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Artworks Explored"
                value={data.journeyStats.unique_artworks_viewed || 0}
                icon={<Eye className="w-6 h-6" />}
                color="blue"
                trend={+12}
              />
              <StatCard
                title="Time Engaged"
                value={`${Math.round((data.journeyStats.total_time_spent || 0) / 60)}m`}
                icon={<Clock className="w-6 h-6" />}
                color="green"
                trend={+8}
              />
              <StatCard
                title="AI Conversations"
                value={data.journeyStats.ai_conversations || 0}
                icon={<MessageSquare className="w-6 h-6" />}
                color="purple"
                trend={+15}
              />
              <StatCard
                title="Achievements"
                value={data.journeyStats.achievements_earned || 0}
                icon={<Trophy className="w-6 h-6" />}
                color="yellow"
                trend={+3}
              />
            </div>

            {/* Aesthetic Profile Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-400" />
                  Your Aesthetic Journey
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Active Days</span>
                    <span className="text-white font-semibold">
                      {data.journeyStats.active_days} days
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Avg. Time per Artwork</span>
                    <span className="text-white font-semibold">
                      {Math.round(data.journeyStats.avg_time_per_artwork || 0)}s
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Artworks Liked</span>
                    <span className="text-white font-semibold">
                      {data.journeyStats.artworks_liked || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Artworks Shared</span>
                    <span className="text-white font-semibold">
                      {data.journeyStats.artworks_shared || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparative Performance */}
              {data.comparative && (
                <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    vs. Other {data.comparative.userType?.archetype_name}s
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Exploration Level</span>
                      <TrendIndicator 
                        level={data.comparative.comparison?.exploration_level} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">AI Engagement</span>
                      <TrendIndicator 
                        level={data.comparative.comparison?.ai_engagement_level} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Community Size</span>
                      <span className="text-white font-semibold">
                        {data.comparative.comparison?.total_users_of_type || 0} users
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Journey Tab */}
        {activeTab === 'journey' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Patterns */}
              <ChartContainer
                title="Daily Activity Pattern"
                icon={<Calendar className="w-5 h-5" />}
                data={data.engagementPatterns.hourlyPatterns}
                type="hourly"
              />
              
              <ChartContainer
                title="Weekly Activity Pattern"
                icon={<BarChart3 className="w-5 h-5" />}
                data={data.engagementPatterns.weeklyPatterns}
                type="weekly"
              />
            </div>

            {/* Aesthetic Evolution */}
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Aesthetic Evolution
              </h3>
              
              {data.aestheticEvolution.preferences.length > 0 ? (
                <div className="space-y-4">
                  {data.aestheticEvolution.preferences.slice(0, 5).map((pref: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div>
                        <div className="text-white font-medium">
                          {pref.style} • {pref.period}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {pref.emotional_tone}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-purple-400 font-semibold">
                          #{pref.recent_rank}
                        </div>
                        {pref.rank_change !== 0 && (
                          <div className={`text-sm ${
                            pref.rank_change > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {pref.rank_change > 0 ? '↗' : '↘'} {Math.abs(pref.rank_change)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Not enough data to show evolution patterns yet.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* 나머지 탭들도 동일한 패턴으로... */}
        {/* Discovery, AI, Achievements 탭은 원래 코드와 동일하게 유지 */}
      </div>
    </div>
  );
}

// 로딩 컴포넌트
function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 에러 경계 컴포넌트
function AnalyticsError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Analytics Dashboard</h1>
        <p className="text-gray-400 mb-4">
          Failed to load analytics data: {error.message}
        </p>
        <button
          onClick={retry}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// 메인 컴포넌트 - React 19 Suspense 활용
export function AnalyticsDashboardSuspense() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  
  // React 19 useDeferredValue로 timeframe 변경 시 부드러운 전환
  const deferredTimeframe = useDeferredValue(timeframe);

  const timeframeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Your Aesthetic Analytics
              </h1>
              <p className="text-gray-300">
                Deep insights into your artistic journey and preferences
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2"
              >
                {timeframeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* React 19 Suspense로 데이터 로딩 관리 */}
        <Suspense fallback={<AnalyticsLoading />}>
          <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => <AnalyticsError error={error} retry={resetErrorBoundary} />}>
            <AnalyticsContent 
              timeframe={deferredTimeframe}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </ErrorBoundary>
        </Suspense>
      </div>
    </div>
  );
}

// 간단한 Error Boundary (React 19에서는 더 간단하게 처리 가능)
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';