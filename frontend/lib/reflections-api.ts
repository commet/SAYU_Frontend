import { API_CONFIG } from '@/config/api';

export interface Reflection {
  id: string;
  user_id: string;
  exhibition_id?: string;
  exhibition_name: string;
  museum_name?: string;
  visit_date: string;
  overall_rating?: number;
  emotion?: string;
  reflection_text?: string;
  favorite_artwork?: string;
  key_takeaway?: string;
  companion_id?: string;
  companion_name?: string;
  voice_note_url?: string;
  photos?: string[];
  visit_duration?: number;
  weather?: string;
  mood_before?: string;
  mood_after?: string;
  tags?: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReflectionStats {
  totalReflections: number;
  averageRating: number;
  totalVisitTime: number;
  topEmotions: Record<string, number>;
  topTags: Record<string, number>;
}

export interface CreateReflectionData {
  exhibition_id?: string;
  exhibition_name: string;
  museum_name?: string;
  overall_rating?: number;
  emotion?: string;
  reflection_text?: string;
  favorite_artwork?: string;
  key_takeaway?: string;
  companion_id?: string;
  companion_name?: string;
  visit_duration?: number;
  weather?: string;
  mood_before?: string;
  mood_after?: string;
  tags?: string[];
  is_public?: boolean;
}

class ReflectionsAPI {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getReflections(params?: {
    limit?: number;
    offset?: number;
    exhibition_id?: string;
  }): Promise<{ reflections: Reflection[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.exhibition_id) queryParams.append('exhibition_id', params.exhibition_id);

    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/reflections?${queryParams}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch reflections');
    }

    return response.json();
  }

  async getReflection(id: string): Promise<Reflection> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/reflections/${id}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch reflection');
    }

    return response.json();
  }

  async createReflection(data: CreateReflectionData): Promise<Reflection> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/reflections`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create reflection');
    }

    return response.json();
  }

  async updateReflection(
    id: string,
    data: Partial<CreateReflectionData>
  ): Promise<Reflection> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/reflections/${id}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update reflection');
    }

    return response.json();
  }

  async deleteReflection(id: string): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/reflections/${id}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete reflection');
    }
  }

  async getPublicFeed(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ reflections: any[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/reflections/feed/public?${queryParams}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch public reflections');
    }

    return response.json();
  }

  async getStats(): Promise<ReflectionStats> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/reflections/stats/summary`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch reflection stats');
    }

    return response.json();
  }

  // Helper to upload photos to Supabase Storage
  async uploadPhoto(file: File): Promise<string> {
    // This would need to be implemented with Supabase Storage
    // For now, return a placeholder
    return URL.createObjectURL(file);
  }

  // Upload voice note for a reflection
  async uploadVoiceNote(reflectionId: string, audioBlob: Blob): Promise<{
    message: string;
    voice_note_url: string;
    reflection: Reflection;
  }> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-note.webm');

    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/reflections/${reflectionId}/voice-note`,
      {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload voice note');
    }

    return response.json();
  }

  // Delete voice note from a reflection
  async deleteVoiceNote(reflectionId: string): Promise<{ message: string }> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}/api/reflections/${reflectionId}/voice-note`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete voice note');
    }

    return response.json();
  }
}

export const reflectionsAPI = new ReflectionsAPI();