import { Artist } from '@/types/artist';
import { PaginationResponse } from '@/types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ArtistFilters {
  copyrightStatus?: 'public_domain' | 'licensed' | 'contemporary' | 'verified_artist';
  nationality?: string;
  era?: string;
  search?: string;
  sortBy?: 'name' | 'popularity' | 'birth_year' | 'follow_count';
  sortOrder?: 'asc' | 'desc';
}

export interface ArtistListParams extends ArtistFilters {
  page?: number;
  limit?: number;
}

class ArtistsApiClient {
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
   * Get paginated list of artists
   */
  async getArtists(params: ArtistListParams = {}): Promise<PaginationResponse<Artist>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/artists${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginationResponse<Artist>>(endpoint);
  }

  /**
   * Get single artist by ID
   */
  async getArtist(id: string): Promise<Artist> {
    return this.request<Artist>(`/api/artists/${id}`);
  }

  /**
   * Search artists
   */
  async searchArtists(query: string, filters: ArtistFilters = {}): Promise<Artist[]> {
    const params = new URLSearchParams({
      search: query,
      ...filters
    });
    
    return this.request<Artist[]>(`/api/artists/search?${params}`);
  }

  /**
   * Get featured artists
   */
  async getFeaturedArtists(): Promise<Artist[]> {
    return this.request<Artist[]>('/api/artists/featured');
  }

  /**
   * Get followed artists for current user
   */
  async getFollowedArtists(): Promise<Artist[]> {
    return this.request<Artist[]>('/api/artists/followed');
  }

  /**
   * Follow an artist
   */
  async followArtist(artistId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/artists/${artistId}/follow`, {
      method: 'POST',
    });
  }

  /**
   * Unfollow an artist
   */
  async unfollowArtist(artistId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/artists/${artistId}/unfollow`, {
      method: 'DELETE',
    });
  }

  /**
   * Get artist statistics
   */
  async getArtistStats(): Promise<{
    totalArtists: number;
    byStatus: Record<string, number>;
    byNationality: Record<string, number>;
    byEra: Record<string, number>;
  }> {
    return this.request<{
      totalArtists: number;
      byStatus: Record<string, number>;
      byNationality: Record<string, number>;
      byEra: Record<string, number>;
    }>('/api/artists/stats');
  }
}

// Create singleton instance
export const artistsApi = new ArtistsApiClient();

// Export types for convenience
export type { Artist, ArtistFilters, ArtistListParams };