import { PaginationResponse } from '@/types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Artwork {
  id: string;
  artveeId: string;
  title: string;
  artist: string;
  url: string;
  sayuType: string;
  isLiked: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  metadata?: {
    medium?: string;
    dimensions?: string;
    year?: string;
    description?: string;
  };
}

export interface ArtworkFilters {
  artist?: string;
  sayuType?: string;
  search?: string;
  isLiked?: boolean;
  isArchived?: boolean;
  sortBy?: 'title' | 'artist' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ArtworkListParams extends ArtworkFilters {
  page?: number;
  limit?: number;
}

export interface FollowingArtist {
  id: string;
  name: string;
  artworkCount: number;
  isFollowing: boolean;
  lastArtworkAt?: string;
}

class GalleryApiClient {
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
   * Get user's personal gallery artworks
   */
  async getPersonalGallery(params: ArtworkListParams = {}): Promise<PaginationResponse<Artwork>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/gallery/personal${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginationResponse<Artwork>>(endpoint);
  }

  /**
   * Get liked artworks
   */
  async getLikedArtworks(params: ArtworkListParams = {}): Promise<PaginationResponse<Artwork>> {
    const queryParams = new URLSearchParams({
      ...params,
      isLiked: 'true'
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/gallery/liked${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginationResponse<Artwork>>(endpoint);
  }

  /**
   * Get archived artworks
   */
  async getArchivedArtworks(params: ArtworkListParams = {}): Promise<PaginationResponse<Artwork>> {
    const queryParams = new URLSearchParams({
      ...params,
      isArchived: 'true'
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/gallery/archived${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginationResponse<Artwork>>(endpoint);
  }

  /**
   * Like an artwork
   */
  async likeArtwork(artworkId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/gallery/artworks/${artworkId}/like`, {
      method: 'POST',
    });
  }

  /**
   * Unlike an artwork
   */
  async unlikeArtwork(artworkId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/gallery/artworks/${artworkId}/unlike`, {
      method: 'DELETE',
    });
  }

  /**
   * Archive an artwork
   */
  async archiveArtwork(artworkId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/gallery/artworks/${artworkId}/archive`, {
      method: 'POST',
    });
  }

  /**
   * Unarchive an artwork
   */
  async unarchiveArtwork(artworkId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/gallery/artworks/${artworkId}/unarchive`, {
      method: 'DELETE',
    });
  }

  /**
   * Get followed artists with artwork counts
   */
  async getFollowedArtists(): Promise<FollowingArtist[]> {
    return this.request<FollowingArtist[]>('/api/gallery/followed-artists');
  }

  /**
   * Get artworks by specific artist
   */
  async getArtworksByArtist(artistName: string, params: ArtworkListParams = {}): Promise<PaginationResponse<Artwork>> {
    const queryParams = new URLSearchParams({
      ...params,
      artist: artistName
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/gallery/by-artist${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginationResponse<Artwork>>(endpoint);
  }

  /**
   * Search artworks in user's gallery
   */
  async searchArtworks(query: string, filters: ArtworkFilters = {}): Promise<Artwork[]> {
    const params = new URLSearchParams({
      search: query,
      ...filters
    });
    
    return this.request<Artwork[]>(`/api/gallery/search?${params}`);
  }

  /**
   * Get artwork details
   */
  async getArtwork(artworkId: string): Promise<Artwork> {
    return this.request<Artwork>(`/api/gallery/artworks/${artworkId}`);
  }

  /**
   * Get gallery statistics
   */
  async getGalleryStats(): Promise<{
    totalArtworks: number;
    likedCount: number;
    archivedCount: number;
    byArtist: Record<string, number>;
    bySayuType: Record<string, number>;
    recentActivity: {
      date: string;
      count: number;
    }[];
  }> {
    return this.request<{
      totalArtworks: number;
      likedCount: number;
      archivedCount: number;
      byArtist: Record<string, number>;
      bySayuType: Record<string, number>;
      recentActivity: {
        date: string;
        count: number;
      }[];
    }>('/api/gallery/stats');
  }

  /**
   * Bulk operations
   */
  async bulkLikeArtworks(artworkIds: string[]): Promise<{ success: boolean; processedCount: number }> {
    return this.request<{ success: boolean; processedCount: number }>('/api/gallery/bulk/like', {
      method: 'POST',
      body: JSON.stringify({ artworkIds }),
    });
  }

  async bulkArchiveArtworks(artworkIds: string[]): Promise<{ success: boolean; processedCount: number }> {
    return this.request<{ success: boolean; processedCount: number }>('/api/gallery/bulk/archive', {
      method: 'POST',
      body: JSON.stringify({ artworkIds }),
    });
  }

  /**
   * Export gallery data
   */
  async exportGallery(format: 'json' | 'csv' = 'json'): Promise<{ downloadUrl: string }> {
    return this.request<{ downloadUrl: string }>(`/api/gallery/export?format=${format}`);
  }
}

// Create singleton instance
export const galleryApi = new GalleryApiClient();

// Export types for convenience
export type { Artwork, ArtworkFilters, ArtworkListParams, FollowingArtist };