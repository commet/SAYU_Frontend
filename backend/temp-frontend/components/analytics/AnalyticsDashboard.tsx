'use client';

import { useState, useEffect } from 'react';
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

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const { theme } = usePersonalizedTheme();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/user-report?timeframe=${timeframe}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeframeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'journey', label: 'Journey', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'discovery', label: 'Discovery', icon: <Eye className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Insights', icon: <Brain className="w-4 h-4" /> },
    { id: 'achievements', label: 'Progress', icon: <Trophy className="w-4 h-4" /> }
  ];

  if (loading) {
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

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Analytics Dashboard</h1>
          <p className="text-gray-400">No analytics data available yet. Start exploring to see your insights!</p>
        </div>
      </div>
    );
  }

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

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

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

        {/* Discovery Tab */}
        {activeTab === 'discovery' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Discovery Sources */}
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Discovery Sources
                </h3>
                
                <div className="space-y-3">
                  {data.discoveryAnalytics.discoverySources.map((source: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">
                        {source.discovery_source || 'Direct'}
                      </span>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {source.discoveries}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {Math.round(source.avg_engagement)}s avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Familiarity Breakdown */}
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  Viewing Patterns
                </h3>
                
                <div className="space-y-4">
                  {data.discoveryAnalytics.familiarityBreakdown.map((item: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 capitalize">
                          {item.familiarity_level.replace('_', ' ')}
                        </span>
                        <span className="text-white font-semibold">
                          {item.artwork_count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ 
                            width: `${(item.artwork_count / data.discoveryAnalytics.familiarityBreakdown.reduce((sum: number, i: any) => sum + i.artwork_count, 0)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Most Engaging Discoveries */}
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Most Engaging Discoveries
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.discoveryAnalytics.mostEngaging.slice(0, 6).map((artwork: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-white font-medium mb-1">
                      {artwork.title}
                    </div>
                    <div className="text-gray-400 text-sm mb-2">
                      by {artwork.artist}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {artwork.period} • {artwork.style}
                      </span>
                      <span className="text-purple-400 font-semibold">
                        {Math.round(artwork.time_spent)}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Conversations"
                value={data.aiInteractions.conversationStats?.total_conversations || 0}
                icon={<MessageSquare className="w-6 h-6" />}
                color="purple"
              />
              <StatCard
                title="Total Messages"
                value={data.aiInteractions.conversationStats?.total_messages || 0}
                icon={<Zap className="w-6 h-6" />}
                color="blue"
              />
              <StatCard
                title="Avg. Conversation Length"
                value={`${Math.round(data.aiInteractions.conversationStats?.avg_conversation_length_minutes || 0)}m`}
                icon={<Clock className="w-6 h-6" />}
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Discussion Topics */}
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Top Discussion Topics
                </h3>
                
                <div className="space-y-3">
                  {data.aiInteractions.topTopics.slice(0, 8).map((topic: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">
                        {topic.topic}
                      </span>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {topic.frequency}x
                        </div>
                        <div className="text-gray-400 text-sm">
                          {Math.round(topic.avg_messages_when_discussed)} msgs avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  Conversation Sentiment
                </h3>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                      {data.aiInteractions.conversationStats?.dominant_sentiment || 'Neutral'}
                    </div>
                    <div className="text-gray-400">
                      Overall Conversation Tone
                    </div>
                  </div>
                  
                  {data.aiInteractions.sentimentTrend.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400 mb-2">Recent Trends:</div>
                      {data.aiInteractions.sentimentTrend.slice(0, 3).map((trend: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">
                            {new Date(trend.week).toLocaleDateString()}
                          </span>
                          <span className={`capitalize ${
                            trend.sentiment === 'positive' ? 'text-green-400' :
                            trend.sentiment === 'negative' ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {trend.sentiment} ({trend.conversation_count})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Achievement Progress by Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.achievements.categoryProgress.map((category: any, index: number) => (
                <div key={index} className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {category.category}
                    </h3>
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <ProgressRing 
                      percentage={category.completion_percentage}
                      size={80}
                      color="purple"
                    />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Completed</span>
                        <span className="text-white">
                          {category.earned_in_category}/{category.total_in_category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Points</span>
                        <span className="text-purple-400 font-semibold">
                          {category.points_earned}/{category.total_possible_points}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Achievements */}
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Recent Achievements
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.achievements.achievements
                  .filter((achievement: any) => achievement.earned)
                  .slice(0, 6)
                  .map((achievement: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">🏆</div>
                      <div>
                        <div className="text-white font-medium">
                          {achievement.name}
                        </div>
                        <div className="text-purple-400 text-sm">
                          +{achievement.points} points
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {achievement.description}
                    </div>
                    {achievement.earned_at && (
                      <div className="text-gray-500 text-xs mt-2">
                        Earned {new Date(achievement.earned_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}