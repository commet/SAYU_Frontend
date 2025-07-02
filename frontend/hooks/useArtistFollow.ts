'use client';

import { useState, useEffect } from 'react';
import { Artist, ArtistFollow } from '@/types/artist';
import { useAuth } from './useAuth';

interface UseArtistFollowReturn {
  followedArtists: Artist[];
  followings: ArtistFollow[];
  followArtist: (artistId: string) => Promise<void>;
  unfollowArtist: (artistId: string) => Promise<void>;
  isFollowing: (artistId: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

export function useArtistFollow(): UseArtistFollowReturn {
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([]);
  const [followings, setFollowings] = useState<ArtistFollow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load user's followed artists on mount
  useEffect(() => {
    if (user?.id) {
      loadFollowedArtists();
    }
  }, [user?.id]);

  const loadFollowedArtists = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      const response = await fetch(`/api/users/${user.id}/followed-artists`);
      if (!response.ok) throw new Error('Failed to load followed artists');
      
      const data = await response.json();
      setFollowedArtists(data.artists || []);
      setFollowings(data.followings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load followed artists');
      console.error('Error loading followed artists:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const followArtist = async (artistId: string) => {
    if (!user?.id) {
      setError('You must be logged in to follow artists');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Optimistic update
      const newFollow: ArtistFollow = {
        id: `temp_${Date.now()}`,
        userId: user.id,
        artistId,
        followedAt: new Date(),
        notificationSettings: {
          newExhibitions: true,
          mediaUpdates: true,
          socialUpdates: false
        }
      };
      setFollowings(prev => [...prev, newFollow]);

      // In a real app, this would be an API call
      const response = await fetch(`/api/users/${user.id}/follow-artist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId })
      });

      if (!response.ok) throw new Error('Failed to follow artist');

      const data = await response.json();
      
      // Update with real data from server
      setFollowings(prev => 
        prev.map(follow => 
          follow.id === newFollow.id ? data.follow : follow
        )
      );

      // Add artist to followed list if not already there
      if (data.artist && !followedArtists.find(a => a.id === artistId)) {
        setFollowedArtists(prev => [...prev, data.artist]);
      }
    } catch (err) {
      // Rollback optimistic update
      setFollowings(prev => prev.filter(f => f.artistId !== artistId));
      setError(err instanceof Error ? err.message : 'Failed to follow artist');
      console.error('Error following artist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowArtist = async (artistId: string) => {
    if (!user?.id) {
      setError('You must be logged in to unfollow artists');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Optimistic update
      const originalFollowings = [...followings];
      setFollowings(prev => prev.filter(f => f.artistId !== artistId));

      // In a real app, this would be an API call
      const response = await fetch(`/api/users/${user.id}/unfollow-artist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId })
      });

      if (!response.ok) throw new Error('Failed to unfollow artist');

      // Remove from followed artists list
      setFollowedArtists(prev => prev.filter(a => a.id !== artistId));
    } catch (err) {
      // Rollback optimistic update
      setFollowings(originalFollowings);
      setError(err instanceof Error ? err.message : 'Failed to unfollow artist');
      console.error('Error unfollowing artist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFollowing = (artistId: string): boolean => {
    return followings.some(follow => follow.artistId === artistId);
  };

  return {
    followedArtists,
    followings,
    followArtist,
    unfollowArtist,
    isFollowing,
    isLoading,
    error
  };
}