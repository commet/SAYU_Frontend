'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  requirements: Record<string, any>;
  points: number;
  badge_icon: string;
  badge_color: string;
  rarity: string;
  unlock_message: string;
  unlocked: boolean;
  unlocked_at?: string;
}

interface AchievementStats {
  total_achievements: number;
  total_points: number;
  completion_rate: number;
  level: number;
  next_level_points: number;
  points_to_next_level: number;
  common_badges: number;
  rare_badges: number;
  epic_badges: number;
  legendary_badges: number;
  recent_achievements: Achievement[];
}

interface UserProgress {
  quizzes_completed: number;
  artworks_viewed: number;
  artworks_liked: number;
  chat_messages: number;
  login_streak: number;
  total_logins: number;
  exploration_days: number;
  profile_completed: boolean;
}

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Record<string, Achievement[]>>({});
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  // Fetch all achievements
  const fetchAchievements = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/achievements`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch achievements');
      
      const data = await response.json();
      setAchievements(data.achievements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements');
    }
  }, [user, getAuthHeaders]);

  // Fetch achievement stats
  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/achievements/stats`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch achievement stats');
      
      const data = await response.json();
      setStats(data);
      setUserProgress(data.progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch achievement stats');
    }
  }, [user, getAuthHeaders]);

  // Update user progress
  const updateProgress = useCallback(async (action: string, metadata: Record<string, any> = {}) => {
    if (!user) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/achievements/progress`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, metadata })
      });

      if (!response.ok) throw new Error('Failed to update progress');
      
      const data = await response.json();
      
      // Refresh stats and achievements to reflect any new unlocks
      await Promise.all([fetchStats(), fetchAchievements()]);
      
      return data;
    } catch (err) {
      console.error('Failed to update progress:', err);
      // Don't throw error for progress updates to avoid breaking user flow
    }
  }, [user, getAuthHeaders, fetchStats, fetchAchievements]);

  // Get recent achievements
  const fetchRecentAchievements = useCallback(async (limit = 5) => {
    if (!user) return [];

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/achievements/recent?limit=${limit}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch recent achievements');
      
      const data = await response.json();
      return data.achievements;
    } catch (err) {
      console.error('Failed to fetch recent achievements:', err);
      return [];
    }
  }, [user, getAuthHeaders]);

  // Check for new achievements and show notifications
  const checkForNewAchievements = useCallback(async () => {
    if (!user) return;

    try {
      const recent = await fetchRecentAchievements(3);
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const newAchievements = recent.filter((achievement: Achievement) => {
        const unlockedAt = new Date(achievement.unlocked_at || '');
        return unlockedAt > fiveMinutesAgo;
      });

      newAchievements.forEach((achievement: Achievement) => {
        toast.success(
          `🏆 Achievement Unlocked: ${achievement.name}!\n+${achievement.points} points`,
          {
            duration: 5000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #8b5cf6'
            }
          }
        );
      });
    } catch (err) {
      console.error('Failed to check for new achievements:', err);
    }
  }, [user, fetchRecentAchievements]);

  // Initialize data
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchAchievements(),
        fetchStats()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [user, fetchAchievements, fetchStats]);

  // Check for new achievements periodically
  useEffect(() => {
    if (user) {
      // Check immediately on load
      const initialCheck = setTimeout(() => {
        checkForNewAchievements();
      }, 2000);

      // Then check periodically
      const interval = setInterval(() => {
        checkForNewAchievements();
      }, 30000); // Check every 30 seconds

      return () => {
        clearTimeout(initialCheck);
        clearInterval(interval);
      };
    }
  }, [user, checkForNewAchievements]);

  // Convenience methods for common progress updates
  const trackQuizCompleted = useCallback(() => updateProgress('quiz_completed'), [updateProgress]);
  const trackArtworkViewed = useCallback(() => updateProgress('artwork_viewed'), [updateProgress]);
  const trackArtworkLiked = useCallback(() => updateProgress('artwork_liked'), [updateProgress]);
  const trackChatMessage = useCallback(() => updateProgress('chat_message_sent'), [updateProgress]);
  const trackDailyLogin = useCallback(() => updateProgress('daily_login', { login_date: new Date().toISOString() }), [updateProgress]);
  const trackProfileCompleted = useCallback(() => updateProgress('profile_completed'), [updateProgress]);
  const trackExplorationDay = useCallback(() => updateProgress('exploration_day'), [updateProgress]);
  const trackExhibitionArchived = useCallback(() => updateProgress('exhibition_archived'), [updateProgress]);
  const trackArtworkDocumented = useCallback((artworkCount = 1) => updateProgress('artwork_documented', { artwork_count: artworkCount }), [updateProgress]);

  return {
    achievements,
    stats,
    userProgress,
    loading,
    error,
    updateProgress,
    checkForNewAchievements,
    fetchRecentAchievements,
    
    // Convenience methods
    trackQuizCompleted,
    trackArtworkViewed,
    trackArtworkLiked,
    trackChatMessage,
    trackDailyLogin,
    trackProfileCompleted,
    trackExplorationDay,
    trackExhibitionArchived,
    trackArtworkDocumented,
    
    // Refresh methods
    refresh: () => Promise.all([fetchAchievements(), fetchStats()])
  };
}