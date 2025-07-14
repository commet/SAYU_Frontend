import { PaginationResponse } from '@/types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Museum {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  visitCount: number;
  lastVisit?: string;
  favorite?: boolean;
  type: 'visited' | 'wishlist' | 'nearby';
  distance?: number;
  rating?: number;
  notes?: string;
}

export interface ExhibitionVisit {
  id: string;
  exhibitionId: string;
  exhibitionTitle: string;
  museum: string;
  visitDate: string;
  duration: number;
  rating: number;
  photos?: string[];
  notes?: string;
  artworks: {
    id: string;
    title: string;
    artist: string;
    liked: boolean;
  }[];
  badges?: string[];
  points: number;
  companions?: string[];
  tags?: string[];
}

export interface Badge {
  id: string;
  name: {
    en: string;
    ko: string;
  };
  description: {
    en: string;
    ko: string;
  };
  icon: string;
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  sayuType?: string;
  archetypeName?: string;
  evolutionStage?: number;
  evolutionPoints?: number;
  level?: number;
  joinDate: string;
  lastActive: string;
  preferences: {
    language: 'en' | 'ko';
    theme: 'light' | 'dark';
    emailNotifications: boolean;
    pushNotifications: boolean;
    privacy: 'public' | 'friends' | 'private';
  };
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  stats: {
    totalVisits: number;
    totalArtworks: number;
    totalBadges: number;
    totalPoints: number;
    streakDays: number;
    favoriteMuseums: number;
    averageRating: number;
    totalDuration: number;
  };
}

export interface ProfileVisitParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  museum?: string;
  rating?: number;
  sortBy?: 'date' | 'rating' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

class ProfileApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/api/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Get user's visited museums
   */
  async getVisitedMuseums(): Promise<Museum[]> {
    return this.request<Museum[]>('/api/profile/museums/visited');
  }

  /**
   * Get user's wishlist museums
   */
  async getWishlistMuseums(): Promise<Museum[]> {
    return this.request<Museum[]>('/api/profile/museums/wishlist');
  }

  /**
   * Get nearby museums
   */
  async getNearbyMuseums(lat: number, lng: number, radius: number = 10): Promise<Museum[]> {
    return this.request<Museum[]>(`/api/profile/museums/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }

  /**
   * Add museum to wishlist
   */
  async addToWishlist(museumId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/profile/museums/${museumId}/wishlist`, {
      method: 'POST',
    });
  }

  /**
   * Remove museum from wishlist
   */
  async removeFromWishlist(museumId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/profile/museums/${museumId}/wishlist`, {
      method: 'DELETE',
    });
  }

  /**
   * Mark museum as favorite
   */
  async toggleFavoriteMuseum(museumId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/profile/museums/${museumId}/favorite`, {
      method: 'POST',
    });
  }

  /**
   * Get exhibition visits
   */
  async getExhibitionVisits(params: ProfileVisitParams = {}): Promise<PaginationResponse<ExhibitionVisit>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/profile/visits${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginationResponse<ExhibitionVisit>>(endpoint);
  }

  /**
   * Get single exhibition visit
   */
  async getExhibitionVisit(visitId: string): Promise<ExhibitionVisit> {
    return this.request<ExhibitionVisit>(`/api/profile/visits/${visitId}`);
  }

  /**
   * Create exhibition visit
   */
  async createExhibitionVisit(visit: Omit<ExhibitionVisit, 'id'>): Promise<ExhibitionVisit> {
    return this.request<ExhibitionVisit>('/api/profile/visits', {
      method: 'POST',
      body: JSON.stringify(visit),
    });
  }

  /**
   * Update exhibition visit
   */
  async updateExhibitionVisit(visitId: string, updates: Partial<ExhibitionVisit>): Promise<ExhibitionVisit> {
    return this.request<ExhibitionVisit>(`/api/profile/visits/${visitId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete exhibition visit
   */
  async deleteExhibitionVisit(visitId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/profile/visits/${visitId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get user badges
   */
  async getBadges(): Promise<Badge[]> {
    return this.request<Badge[]>('/api/profile/badges');
  }

  /**
   * Get available badges (all badges with progress)
   */
  async getAvailableBadges(): Promise<Badge[]> {
    return this.request<Badge[]>('/api/profile/badges/available');
  }

  /**
   * Get profile statistics
   */
  async getProfileStats(): Promise<{
    visitStats: {
      totalVisits: number;
      thisMonth: number;
      lastMonth: number;
      averageRating: number;
      averageDuration: number;
      favoriteMuseum: string;
      streakDays: number;
    };
    artworkStats: {
      totalViewed: number;
      totalLiked: number;
      topArtists: { name: string; count: number }[];
      topGenres: { name: string; count: number }[];
    };
    badgeStats: {
      totalBadges: number;
      recentBadges: Badge[];
      progressBadges: Badge[];
    };
    activityTimeline: {
      date: string;
      activities: {
        type: 'visit' | 'badge' | 'artwork' | 'follow';
        description: string;
        points?: number;
      }[];
    }[];
  }> {
    return this.request<{
      visitStats: {
        totalVisits: number;
        thisMonth: number;
        lastMonth: number;
        averageRating: number;
        averageDuration: number;
        favoriteMuseum: string;
        streakDays: number;
      };
      artworkStats: {
        totalViewed: number;
        totalLiked: number;
        topArtists: { name: string; count: number }[];
        topGenres: { name: string; count: number }[];
      };
      badgeStats: {
        totalBadges: number;
        recentBadges: Badge[];
        progressBadges: Badge[];
      };
      activityTimeline: {
        date: string;
        activities: {
          type: 'visit' | 'badge' | 'artwork' | 'follow';
          description: string;
          points?: number;
        }[];
      }[];
    }>('/api/profile/stats');
  }

  /**
   * Upload profile avatar
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.request<{ avatarUrl: string }>('/api/profile/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header for FormData
      },
    });
  }

  /**
   * Get OAuth linked accounts
   */
  async getOAuthAccounts(): Promise<{
    accounts: {
      provider: string;
      linked: boolean;
      profileImage?: string;
    }[];
  }> {
    return this.request<{
      accounts: {
        provider: string;
        linked: boolean;
        profileImage?: string;
      }[];
    }>('/api/profile/oauth-accounts');
  }

  /**
   * Export profile data
   */
  async exportProfile(format: 'json' | 'csv' = 'json'): Promise<{ downloadUrl: string }> {
    return this.request<{ downloadUrl: string }>(`/api/profile/export?format=${format}`);
  }

  /**
   * Delete profile account
   */
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/profile/delete-account', {
      method: 'DELETE',
    });
  }
}

// Create singleton instance
export const profileApi = new ProfileApiClient();

// Export types for convenience
export type { UserProfile, Museum, ExhibitionVisit, Badge, ProfileVisitParams };