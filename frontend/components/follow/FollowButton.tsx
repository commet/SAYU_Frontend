'use client';

import React, { useState, useEffect } from 'react';
import { followAPI } from '@/lib/follow-api';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
}

export function FollowButton({
  userId,
  initialFollowing = false,
  onFollowChange,
  variant = 'default',
  size = 'default',
  showIcon = true,
  className = '',
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !initialFollowing) {
      checkFollowStatus();
    }
  }, [userId, isAuthenticated]);

  const checkFollowStatus = async () => {
    try {
      const status = await followAPI.checkFollowStatus(userId);
      setIsFollowing(status);
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error('팔로우하려면 먼저 로그인해주세요.');
      return;
    }

    if (user?.id === userId) {
      toast.error('자기 자신을 팔로우할 수 없습니다');
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowing) {
        await followAPI.unfollowUser(userId);
        setIsFollowing(false);
        toast.success('언팔로우했습니다');
      } else {
        await followAPI.followUser(userId);
        setIsFollowing(true);
        toast.success('팔로우했습니다');
      }
      onFollowChange?.(isFollowing);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || user?.id === userId) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={className}
    >
      {showIcon && (
        <>
          {isFollowing ? (
            <UserMinus className="w-4 h-4 mr-2" />
          ) : (
            <UserPlus className="w-4 h-4 mr-2" />
          )}
        </>
      )}
      {isFollowing ? '팔로잉' : '팔로우'}
    </Button>
  );
}