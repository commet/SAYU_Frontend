'use client';

import React, { useState, useEffect } from 'react';
import { followAPI } from '@/lib/follow-api';
import { FollowUser } from '../../../shared';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from './FollowButton';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface FollowListProps {
  userId: string;
  type: 'followers' | 'following';
  className?: string;
}

const animalEmojis: Record<string, string> = {
  fox: '🦊',
  eagle: '🦅',
  owl: '🦉',
  dolphin: '🐬',
  elephant: '🐘',
  wolf: '🐺',
  butterfly: '🦋',
  turtle: '🐢',
  cat: '🐱',
  dog: '🐕',
  rabbit: '🐰',
  bear: '🐻',
  penguin: '🐧',
  deer: '🦌',
  peacock: '🦚',
  koala: '🐨',
};

export function FollowList({ userId, type, className = '' }: FollowListProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [userId, type]);

  const loadUsers = async (loadMore = false) => {
    try {
      setIsLoading(true);
      const currentPage = loadMore ? page + 1 : 1;
      
      const response = type === 'followers' 
        ? await followAPI.getFollowers(userId, currentPage)
        : await followAPI.getFollowing(userId, currentPage);

      if (loadMore) {
        setUsers([...users, ...response.users]);
      } else {
        setUsers(response.users);
      }
      
      setTotal(response.total);
      setPage(currentPage);
      setHasMore(response.users.length === response.limit);
    } catch (error) {
      console.error(`Failed to load ${type}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadUsers(true);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {type === 'followers' ? '아직 팔로워가 없습니다' : '아직 팔로우한 사람이 없습니다'}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {type === 'followers' ? '팔로워' : '팔로잉'} ({total})
        </h3>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
          >
            <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profileImage} alt={user.nickname} />
                <AvatarFallback>
                  {user.animalType && animalEmojis[user.animalType] || user.nickname[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user.nickname}</span>
                  {user.animalType && (
                    <span className="text-sm text-gray-500">
                      {animalEmojis[user.animalType]} {user.personalityType}
                    </span>
                  )}
                </div>
                {user.followerCount !== undefined && (
                  <div className="text-sm text-gray-500">
                    팔로워 {user.followerCount} · 팔로잉 {user.followingCount}
                  </div>
                )}
              </div>
            </Link>

            <FollowButton
              userId={user.id}
              initialFollowing={user.isFollowing}
              size="sm"
              showIcon={false}
            />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                로딩 중...
              </>
            ) : (
              '더 보기'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}