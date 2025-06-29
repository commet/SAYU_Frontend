'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Palette, 
  Users, 
  Calendar,
  Award,
  Sparkles,
  Eye,
  Share2
} from 'lucide-react';

interface GrowthTrackerProps {
  data: any;
}

export default function GrowthTracker({ data }: GrowthTrackerProps) {
  const growthData = useMemo(() => {
    if (!data?.monthlyProgress) return [];

    return data.monthlyProgress.map((month: any) => ({
      month: new Date(month.month).toLocaleDateString('en', { 
        month: 'short',
        year: '2-digit'
      }),
      styles: month.uniqueStyles,
      artists: month.uniqueArtists,
      periods: month.uniquePeriods,
      social: month.socialShares,
      connections: month.socialConnections,
      cumulative: month.cumulativeStyles
    }));
  }, [data]);

  const expansionMetrics = useMemo(() => {
    if (!growthData.length) return null;

    const latest = growthData[growthData.length - 1];
    const previous = growthData[growthData.length - 2];
    
    return {
      totalStyles: latest?.cumulative || 0,
      monthlyGrowth: previous 
        ? ((latest?.cumulative - previous?.cumulative) / previous?.cumulative * 100) || 0
        : 0,
      socialActivity: latest?.social || 0,
      artistsDiscovered: latest?.artists || 0
    };
  }, [growthData]);

  const getExpansionInsight = (pattern: string) => {
    const insights = {
      'rapidly_expanding': {
        title: '🚀 Rapid Explorer',
        description: 'You\'re discovering new artistic territories at an impressive pace!',
        tip: 'Consider diving deeper into your favorite discoveries.'
      },
      'steadily_exploring': {
        title: '🎯 Steady Discoverer', 
        description: 'Your consistent exploration shows thoughtful artistic growth.',
        tip: 'Try exploring contrasting styles to expand your palette.'
      },
      'socially_active': {
        title: '🤝 Social Curator',
        description: 'You excel at sharing and connecting through art.',
        tip: 'Lead community discussions about your favorite pieces.'
      },
      'focused_appreciation': {
        title: '🎨 Refined Connoisseur',
        description: 'Your deep appreciation for specific styles shows expertise.',
        tip: 'Consider exploring related movements or periods.'
      }
    };

    return insights[pattern] || insights.focused_appreciation;
  };

  if (!data || !growthData.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Continue exploring to track your artistic growth!</p>
      </div>
    );
  }

  const expansionInsight = getExpansionInsight(data.expansionPattern);

  return (
    <div className="space-y-8">
      {/* Growth Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-muted-foreground">Art Styles</span>
          </div>
          <p className="text-2xl font-bold">{expansionMetrics?.totalStyles}</p>
          <p className="text-xs text-muted-foreground">
            +{Math.round(expansionMetrics?.monthlyGrowth || 0)}% this month
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-muted-foreground">Artists</span>
          </div>
          <p className="text-2xl font-bold">{expansionMetrics?.artistsDiscovered}</p>
          <p className="text-xs text-muted-foreground">discovered</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-500/10 to-green-600/5 p-4 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-muted-foreground">Shares</span>
          </div>
          <p className="text-2xl font-bold">{expansionMetrics?.socialActivity}</p>
          <p className="text-xs text-muted-foreground">this month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-4 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-muted-foreground">Journey</span>
          </div>
          <p className="text-2xl font-bold">
            {Math.round((new Date().getTime() - new Date(data.journeyStart).getTime()) 
              / (1000 * 60 * 60 * 24))}
          </p>
          <p className="text-xs text-muted-foreground">days</p>
        </motion.div>
      </div>

      {/* Expansion Pattern Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 p-6 rounded-xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <Award className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold">{expansionInsight.title}</h3>
        </div>
        <p className="text-muted-foreground mb-2">{expansionInsight.description}</p>
        <p className="text-sm text-primary font-medium">💡 {expansionInsight.tip}</p>
      </motion.div>

      {/* Growth Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-secondary/10 p-6 rounded-xl"
      >
        <h3 className="text-lg font-semibold mb-4">Artistic Horizon Expansion</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={growthData}>
            <defs>
              <linearGradient id="stylesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="artistsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stackId="1"
              stroke="#8b5cf6"
              fill="url(#stylesGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="artists"
              stackId="2"
              stroke="#06b6d4"
              fill="url(#artistsGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Social Growth */}
      {growthData.some(d => d.social > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-secondary/10 p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-4">Social Engagement</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="social"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="connections"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Journey Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 rounded-xl">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-600" />
            First Discovery
          </h3>
          <p className="text-sm text-muted-foreground">
            Your journey began {new Date(data.journeyStart).toLocaleDateString('en', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 p-6 rounded-xl">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Growth Rate
          </h3>
          <p className="text-sm text-muted-foreground">
            You discover an average of {Math.round(
              (expansionMetrics?.totalStyles || 0) / 
              Math.max(growthData.length, 1)
            )} new styles per month
          </p>
        </div>
      </motion.div>
    </div>
  );
}