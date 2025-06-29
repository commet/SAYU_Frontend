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
  PieChart,
  Pie,
  Cell,
  Sankey
} from 'recharts';
import { Heart, Smile, Frown, Meh, Star, Zap } from 'lucide-react';

interface EmotionalJourneyProps {
  data: any;
}

const emotionIcons = {
  joy: <Smile className="w-5 h-5" />,
  awe: <Star className="w-5 h-5" />,
  peace: <Heart className="w-5 h-5" />,
  curiosity: <Zap className="w-5 h-5" />,
  melancholy: <Frown className="w-5 h-5" />,
  contemplation: <Meh className="w-5 h-5" />
};

const emotionColors = {
  joy: '#fbbf24',
  awe: '#8b5cf6',
  peace: '#10b981',
  curiosity: '#f97316',
  melancholy: '#6366f1',
  contemplation: '#64748b'
};

export default function EmotionalJourneyMap({ data }: EmotionalJourneyProps) {
  const timelineData = useMemo(() => {
    if (!data?.timeline) return [];

    return Object.entries(data.timeline)
      .map(([date, dayData]: [string, any]) => ({
        date: new Date(date).toLocaleDateString('en', { 
          month: 'short', 
          day: 'numeric' 
        }),
        ...Object.fromEntries(
          Object.entries(dayData.emotions).map(([emotion, info]: [string, any]) => [
            emotion,
            info.count * info.avgEngagement
          ])
        ),
        totalEngagement: dayData.totalEngagement
      }))
      .reverse()
      .slice(-14); // Last 14 days
  }, [data]);

  const dominantEmotionsData = useMemo(() => {
    if (!data?.dominantEmotions) return [];

    return data.dominantEmotions.map((emotion: any) => ({
      name: emotion.emotion,
      value: emotion.count,
      color: emotionColors[emotion.emotion] || '#64748b'
    }));
  }, [data]);

  const transitionFlow = useMemo(() => {
    if (!data?.transitions?.mostCommon) return [];

    return data.transitions.mostCommon.slice(0, 5).map((transition: any) => ({
      from: transition.from,
      to: transition.to,
      value: transition.count
    }));
  }, [data]);

  if (!data || (!timelineData.length && !dominantEmotionsData.length)) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Start exploring artworks to map your emotional journey!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Emotional Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dominant Emotions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-secondary/10 p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-4">Your Emotional Palette</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dominantEmotionsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {dominantEmotionsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {dominantEmotionsData.map((emotion) => (
              <div key={emotion.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: emotion.color }}
                />
                <span className="text-sm capitalize">{emotion.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Emotional Stability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-secondary/10 p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-4">Emotional Journey Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Emotional Stability</span>
              <span className="text-lg font-semibold">
                {Math.round((data.transitions?.emotionalStability || 0) * 100)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(data.transitions?.emotionalStability || 0) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {(data.transitions?.emotionalStability || 0) > 0.7 
                ? "You tend to maintain consistent emotional responses to art."
                : "Your emotional responses vary widely, showing openness to diverse experiences."
              }
            </p>
          </div>

          {/* Most Common Transitions */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Common Emotional Transitions</h4>
            <div className="space-y-2">
              {transitionFlow.map((transition, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="capitalize">{transition.from}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="capitalize">{transition.to}</span>
                  <span className="ml-auto text-muted-foreground">
                    {transition.value}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Emotional Timeline */}
      {timelineData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-secondary/10 p-6 rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-4">Emotional Journey Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
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
              {Object.keys(emotionColors).map((emotion) => (
                <Line
                  key={emotion}
                  type="monotone"
                  dataKey={emotion}
                  stroke={emotionColors[emotion]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Personal Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-xl">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600" />
            Peak Emotional Moments
          </h3>
          <p className="text-sm text-muted-foreground">
            {dominantEmotionsData[0] ? (
              `Your most common emotional response is ${dominantEmotionsData[0].name}, 
               suggesting you're drawn to artworks that evoke ${dominantEmotionsData[0].name.toLowerCase()}.`
            ) : (
              "Continue exploring to discover your emotional patterns."
            )}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 rounded-xl">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Emotional Range
          </h3>
          <p className="text-sm text-muted-foreground">
            {dominantEmotionsData.length > 3 ? (
              "You experience a rich range of emotions through art, showing deep aesthetic sensitivity."
            ) : dominantEmotionsData.length > 1 ? (
              "You respond to art with varied emotions, indicating growing aesthetic awareness."
            ) : (
              "Try exploring different art styles to expand your emotional palette."
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}