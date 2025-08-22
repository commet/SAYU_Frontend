'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { getActivityTracker, ActivityType, trackActivityImmediate } from '@/lib/activity-tracker';
import { useAuth } from '@/hooks/useAuth';

export interface TrackingOptions {
  immediate?: boolean; // Send immediately instead of batching
}

export function useActivityTracker() {
  const { user } = useAuth();
  const tracker = useMemo(() => getActivityTracker(), []);

  // Track generic activity
  const trackActivity = useCallback((
    type: ActivityType,
    target?: {
      id?: string;
      type?: string;
      title?: string;
      subtitle?: string;
      image?: string;
    },
    metadata?: Record<string, any>,
    options?: TrackingOptions
  ) => {
    if (!user) return; // Don't track if not authenticated

    const activity = {
      activity_type: type,
      target_id: target?.id,
      target_type: target?.type,
      target_title: target?.title,
      target_subtitle: target?.subtitle,
      target_image_url: target?.image,
      metadata
    };

    if (options?.immediate) {
      trackActivityImmediate(activity);
    } else {
      tracker.track(activity);
    }
  }, [tracker, user]);

  // Convenience methods for common activities
  const trackArtworkView = useCallback((artwork: {
    id: string;
    title: string;
    artist?: string;
    image?: string;
  }) => {
    if (!user) return;
    tracker.trackArtworkView(artwork);
  }, [tracker, user]);

  const trackExhibitionView = useCallback((exhibition: {
    id: string;
    title: string;
    venue?: string;
    image?: string;
  }) => {
    if (!user) return;
    tracker.trackExhibitionView(exhibition);
  }, [tracker, user]);

  const trackCollectionSave = useCallback((collection: {
    id: string;
    name: string;
    artworkCount?: number;
  }) => {
    if (!user) return;
    tracker.trackCollectionSave(collection);
  }, [tracker, user]);

  const trackQuizComplete = useCallback((
    quizType: string,
    result?: string
  ) => {
    if (!user) return;
    tracker.trackQuizComplete(quizType, result);
  }, [tracker, user]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (tracker) {
        tracker.flush();
      }
    };
  }, [tracker]);

  return {
    trackActivity,
    trackArtworkView,
    trackExhibitionView,
    trackCollectionSave,
    trackQuizComplete,
    // Expose queue size for debugging
    getQueueSize: () => tracker?.getQueueSize() || 0
  };
}

// Hook to fetch recent activities
import useSWR from 'swr';

export function useRecentActivities(limit: number = 20) {
  const { user } = useAuth();
  
  const { data, error, mutate } = useSWR(
    user ? `/api/activities/recent?limit=${limit}` : null,
    async (url) => {
      console.log('Fetching activities for user:', user?.id);
      const res = await fetch(url, {
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Activities fetch failed:', res.status, errorData);
        throw new Error(errorData.error || 'Failed to fetch activities');
      }
      
      return res.json();
    },
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      onError: (error) => {
        console.error('SWR Error fetching activities:', error);
      }
    }
  );

  return {
    activities: data || [],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  };
}

// Hook to fetch activity statistics
export function useActivityStats() {
  const { user } = useAuth();
  
  const { data, error } = useSWR(
    user ? '/api/activities/recent' : null,
    async (url) => {
      console.log('Fetching activity stats for user:', user?.id);
      const res = await fetch(url, { 
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Activity stats fetch failed:', res.status, errorData);
        throw new Error(errorData.error || 'Failed to fetch stats');
      }
      
      return res.json();
    },
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('SWR Error fetching activity stats:', error);
      }
    }
  );

  return {
    stats: data || { total: 0, byType: {} },
    isLoading: !error && !data,
    isError: error
  };
}