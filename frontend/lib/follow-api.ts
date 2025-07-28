import { FollowUser, FollowListResponse, FollowStats } from '@sayu/shared';
import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.baseUrl;

class FollowAPI {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async followUser(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/community/users/${userId}/follow`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to follow user');
    }
  }

  async unfollowUser(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/community/users/${userId}/follow`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unfollow user');
    }
  }

  async getFollowers(userId: string, page = 1, limit = 20): Promise<FollowListResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/community/users/${userId}/followers?page=${page}&limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch followers');
    }

    return response.json();
  }

  async getFollowing(userId: string, page = 1, limit = 20): Promise<FollowListResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/community/users/${userId}/following?page=${page}&limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch following');
    }

    return response.json();
  }

  async getFollowStats(userId: string): Promise<FollowStats> {
    const [followers, following] = await Promise.all([
      this.getFollowers(userId, 1, 1),
      this.getFollowing(userId, 1, 1),
    ]);

    return {
      followerCount: followers.total,
      followingCount: following.total,
      mutualCount: 0, // This would need backend support to calculate efficiently
    };
  }

  async checkFollowStatus(userId: string): Promise<boolean> {
    try {
      // Get current user's following list and check if userId is in it
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      // For now, we'll rely on the initial following status from the user object
      // This could be improved by checking the following list
      return false;
    } catch {
      return false;
    }
  }
}

export const followAPI = new FollowAPI();