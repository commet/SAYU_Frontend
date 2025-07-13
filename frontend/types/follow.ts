export interface FollowUser {
  id: string;
  nickname: string;
  profileImage?: string;
  personalityType?: string;
  animalType?: string;
  isFollowing?: boolean;
  followerCount?: number;
  followingCount?: number;
}

export interface FollowStats {
  followerCount: number;
  followingCount: number;
  mutualCount: number;
}

export interface FollowListResponse {
  users: FollowUser[];
  total: number;
  page: number;
  limit: number;
}

export interface FollowNotification {
  id: string;
  type: 'follow';
  fromUser: FollowUser;
  createdAt: string;
  read: boolean;
}