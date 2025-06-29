'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TrendingUp, Eye, Heart, Calendar, Target, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface WeeklyJourney {
  week: string;
  profile: {
    typeCode: string;
    archetypeName: string;
  };
  stats: {
    viewedCount: number;
    likedCount: number;
    explorationDays: number;
  };
  insights: string[];
  nextWeekSuggestions: string[];
  streak: number;
}

export function WeeklyInsightsCard() {
  const { user } = useAuth();
  const [journey, setJourney] = useState<WeeklyJourney | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWeeklyJourney();
    }
  }, [user]);

  const fetchWeeklyJourney = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artworks/weekly-journey`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJourney(data);
      }
    } catch (error) {
      console.error('Error fetching weekly journey:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border shadow-sm text-center">
        <TrendingUp className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">Your weekly insights will appear here</p>
        <Button onClick={fetchWeeklyJourney} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
    );
  }

  const engagementRate = journey.stats.viewedCount > 0 
    ? Math.round((journey.stats.likedCount / journey.stats.viewedCount) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-6 border shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Weekly Art Journey</h3>
            <p className="text-xs text-muted-foreground">
              Your aesthetic exploration progress
            </p>
          </div>
        </div>
        {journey.streak > 0 && (
          <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full">
            <Zap className="w-3 h-3" />
            <span className="text-xs font-medium">{journey.streak} day streak</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
            <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{journey.stats.viewedCount}</div>
          <div className="text-xs text-muted-foreground">Artworks Viewed</div>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-2">
            <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{journey.stats.likedCount}</div>
          <div className="text-xs text-muted-foreground">Favorites</div>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{journey.stats.explorationDays}</div>
          <div className="text-xs text-muted-foreground">Active Days</div>
        </div>
      </div>

      {/* Engagement Rate */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Engagement Rate</span>
          <span className="text-sm text-muted-foreground">{engagementRate}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(engagementRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Insights */}
      {journey.insights.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            This Week's Insights
          </h4>
          <div className="space-y-2">
            {journey.insights.map((insight, index) => (
              <div key={index} className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg">
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Week Suggestions */}
      {journey.nextWeekSuggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Next Week Goals</h4>
          <div className="space-y-2">
            {journey.nextWeekSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}