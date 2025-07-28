'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Heart, 
  Map, 
  Clock,
  Sparkles,
  BarChart3,
  Users,
  Palette
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Dynamic imports for heavy chart components
const ViewingPatternsChart = lazy(() => import('./ViewingPatternsChart'));
const EmotionalJourneyMap = lazy(() => import('./EmotionalJourneyMap'));
const GrowthTracker = lazy(() => import('./GrowthTracker'));
const PersonalityEvolution = lazy(() => import('./PersonalityEvolution'));

interface InsightsSummary {
  patterns: any;
  emotionalJourney: any;
  growthMetrics: any;
  insights: Array<{
    type: string;
    title: string;
    description: string;
    metric: string;
  }>;
}

export default function BehavioralInsightsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [activeView, setActiveView] = useState<'patterns' | 'emotions' | 'growth'>('patterns');
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    fetchInsightsSummary();
  }, [timeframe]);

  const fetchInsightsSummary = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/insights/summary?timeframe=${timeframe}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-pulse text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-4" />
          <p>Analyzing your art journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 
                     bg-clip-text text-transparent"
        >
          Your Art Journey Insights
        </motion.h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover how your aesthetic personality shapes your art exploration
        </p>
      </div>

      {/* Quick Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {summary?.insights.map((insight, index) => (
            <motion.div
              key={insight.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card p-6 rounded-2xl border shadow-sm hover:shadow-md 
                         transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  {getInsightIcon(insight.type)}
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {insight.metric}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{insight.title}</h3>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center gap-2">
        {['7d', '30d', '90d', 'all'].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              timeframe === tf
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {tf === 'all' ? 'All Time' : `Last ${tf.replace('d', ' days')}`}
          </button>
        ))}
      </div>

      {/* Main Dashboard Tabs */}
      <div className="bg-card rounded-2xl border overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveView('patterns')}
            className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 
                       transition-all duration-300 ${
              activeView === 'patterns'
                ? 'bg-primary/5 border-b-2 border-primary'
                : 'hover:bg-secondary/50'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium">Viewing Patterns</span>
          </button>
          <button
            onClick={() => setActiveView('emotions')}
            className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 
                       transition-all duration-300 ${
              activeView === 'emotions'
                ? 'bg-primary/5 border-b-2 border-primary'
                : 'hover:bg-secondary/50'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="font-medium">Emotional Journey</span>
          </button>
          <button
            onClick={() => setActiveView('growth')}
            className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 
                       transition-all duration-300 ${
              activeView === 'growth'
                ? 'bg-primary/5 border-b-2 border-primary'
                : 'hover:bg-secondary/50'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Growth & Evolution</span>
          </button>
        </div>

        <div className="p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse">
                <BarChart3 className="w-12 h-12 text-gray-300" />
                <p className="text-sm text-gray-500 mt-2">Loading chart...</p>
              </div>
            </div>
          }>
            <AnimatePresence mode="wait">
            {activeView === 'patterns' && (
              <motion.div
                key="patterns"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ViewingPatternsChart data={summary?.patterns} />
              </motion.div>
            )}

            {activeView === 'emotions' && (
              <motion.div
                key="emotions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <EmotionalJourneyMap data={summary?.emotionalJourney} />
              </motion.div>
            )}

            {activeView === 'growth' && (
              <motion.div
                key="growth"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GrowthTracker data={summary?.growthMetrics} />
              </motion.div>
            )}
          </AnimatePresence>
          </Suspense>
        </div>
      </div>

      {/* Personality Evolution */}
      {summary?.growthMetrics?.personalityEvolution && (
        <Suspense fallback={
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse">
              <Sparkles className="w-8 h-8 text-gray-300" />
            </div>
          </div>
        }>
          <PersonalityEvolution evolution={summary.growthMetrics.personalityEvolution} />
        </Suspense>
      )}
    </div>
  );
}

function getInsightIcon(type: string) {
  const icons = {
    viewing_pattern: <Clock className="w-6 h-6 text-blue-600" />,
    emotional_pattern: <Heart className="w-6 h-6 text-red-600" />,
    growth_pattern: <TrendingUp className="w-6 h-6 text-green-600" />,
    social_pattern: <Users className="w-6 h-6 text-purple-600" />,
    style_pattern: <Palette className="w-6 h-6 text-orange-600" />
  };

  return icons[type] || <Sparkles className="w-6 h-6 text-primary" />;
}