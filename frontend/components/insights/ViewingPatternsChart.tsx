'use client';

import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { motion } from 'framer-motion';
import { Clock, Eye, MousePointer, Maximize2 } from 'lucide-react';

interface ViewingPatternsProps {
  data: any;
}

export default function ViewingPatternsChart({ data }: ViewingPatternsProps) {
  const chartData = useMemo(() => {
    if (!data?.dailyAverages) return [];

    return Object.entries(data.dailyAverages)
      .map(([date, metrics]: [string, any]) => ({
        date: new Date(date).toLocaleDateString('en', { 
          month: 'short', 
          day: 'numeric' 
        }),
        timeSpent: Math.round(metrics.avgTimeSpent),
        artworks: metrics.artworksViewed,
        engagement: Math.round(metrics.avgScrollDepth * 100),
        zoom: Math.round((metrics.avgZoomLevel - 1) * 100)
      }))
      .reverse();
  }, [data]);

  const engagementMetrics = useMemo(() => {
    if (!chartData.length) return [];

    const avgTimeSpent = chartData.reduce((sum, d) => sum + d.timeSpent, 0) / chartData.length;
    const avgEngagement = chartData.reduce((sum, d) => sum + d.engagement, 0) / chartData.length;
    const avgZoom = chartData.reduce((sum, d) => sum + d.zoom, 0) / chartData.length;

    return [
      { metric: 'Time Spent', value: avgTimeSpent, max: 300 },
      { metric: 'Scroll Depth', value: avgEngagement, max: 100 },
      { metric: 'Zoom Usage', value: avgZoom, max: 100 },
      { metric: 'Daily Views', value: chartData[0]?.artworks || 0, max: 20 }
    ];
  }, [chartData]);

  if (!data || !chartData.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No viewing data available yet. Start exploring artworks!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-secondary/30 p-4 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-muted-foreground">Avg. Time</span>
          </div>
          <p className="text-2xl font-bold">
            {Math.round(engagementMetrics[0]?.value || 0)}s
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-secondary/30 p-4 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-green-600" />
            <span className="text-sm text-muted-foreground">Total Views</span>
          </div>
          <p className="text-2xl font-bold">
            {chartData.reduce((sum, d) => sum + d.artworks, 0)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-secondary/30 p-4 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <MousePointer className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-muted-foreground">Engagement</span>
          </div>
          <p className="text-2xl font-bold">
            {Math.round(engagementMetrics[1]?.value || 0)}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-secondary/30 p-4 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Maximize2 className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-muted-foreground">Zoom Usage</span>
          </div>
          <p className="text-2xl font-bold">
            {Math.round(engagementMetrics[2]?.value || 0)}%
          </p>
        </motion.div>
      </div>

      {/* Time Spent Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-secondary/10 p-6 rounded-xl"
      >
        <h3 className="text-lg font-semibold mb-4">Daily Viewing Patterns</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" />
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
              dataKey="timeSpent"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#timeGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Engagement Radar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-secondary/10 p-6 rounded-xl"
      >
        <h3 className="text-lg font-semibold mb-4">Engagement Profile</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={engagementMetrics}>
            <PolarGrid strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
            <Radar
              name="Your Profile"
              dataKey="value"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Personality Comparison */}
      {data.personalityComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-2">
            How You Compare to Other {data.personalityComparison.userType}s
          </h3>
          <p className="text-muted-foreground">
            You spend {Math.round(
              (engagementMetrics[0]?.value / data.personalityComparison.avgTimeVsPeers) * 100
            )}% 
            {engagementMetrics[0]?.value > data.personalityComparison.avgTimeVsPeers ? ' more' : ' less'} 
            time with each artwork compared to others with your personality type.
          </p>
        </motion.div>
      )}
    </div>
  );
}