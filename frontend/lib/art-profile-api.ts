import { ArtProfileRequest, ArtProfileResult, ArtStyle, UserArtPreference } from '@/types/art-profile';
import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.baseUrl;

class ArtProfileAPI {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * AI를 사용해 프로필 이미지를 예술 작품으로 변환
   */
  async generateArtProfile(request: ArtProfileRequest): Promise<ArtProfileResult> {
    const response = await fetch(`${API_BASE_URL}/api/art-profile/generate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate art profile');
    }

    return response.json();
  }

  /**
   * 사용자의 전시 관람 기록을 바탕으로 추천 스타일 가져오기
   */
  async getRecommendedStyles(userId: string): Promise<ArtStyle[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/art-profile/recommendations/${userId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recommended styles');
    }

    return response.json();
  }

  /**
   * 생성 상태 확인 (긴 처리 시간이 필요한 경우)
   */
  async checkGenerationStatus(generationId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: ArtProfileResult;
    progress?: number;
    error?: string;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/api/art-profile/status/${generationId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check generation status');
    }

    return response.json();
  }

  /**
   * 사용자의 아트 프로필 히스토리
   */
  async getUserArtProfiles(userId: string): Promise<ArtProfileResult[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/art-profile/user/${userId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user art profiles');
    }

    return response.json();
  }

  /**
   * 아트 프로필 갤러리 (다른 사용자들의 작품)
   */
  async getGallery(filter?: {
    style?: string;
    period?: 'today' | 'week' | 'month';
    sort?: 'recent' | 'popular';
  }): Promise<ArtProfileResult[]> {
    const params = new URLSearchParams();
    if (filter?.style) params.append('style', filter.style);
    if (filter?.period) params.append('period', filter.period);
    if (filter?.sort) params.append('sort', filter.sort);

    const response = await fetch(
      `${API_BASE_URL}/api/art-profile/gallery?${params}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch gallery');
    }

    return response.json();
  }

  /**
   * 아트 프로필 좋아요
   */
  async likeArtProfile(profileId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/art-profile/${profileId}/like`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to like art profile');
    }
  }

  /**
   * 사용자의 월간 크레딧 및 선호도 정보
   */
  async getUserPreferences(userId: string): Promise<UserArtPreference> {
    const response = await fetch(
      `${API_BASE_URL}/api/art-profile/preferences/${userId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user preferences');
    }

    return response.json();
  }

  /**
   * 이미지를 base64로 변환 (업로드 전 처리)
   */
  async imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 이미지 리사이징 (업로드 최적화)
   */
  async resizeImage(file: File, maxWidth: number = 1024): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to resize image'));
          }
        }, 'image/jpeg', 0.9);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
}

export const artProfileAPI = new ArtProfileAPI();

// AI 스타일 전송을 위한 헬퍼 함수
export const styleToPrompt = (style: ArtStyle, customSettings?: any): string => {
  let prompt = `Transform image in the style of ${style.name}`;
  
  if (style.artist) {
    prompt += `, inspired by ${style.artist}`;
  }
  
  if (style.movement) {
    prompt += `, ${style.movement} movement`;
  }
  
  if (customSettings?.brushStroke) {
    prompt += `, brush stroke intensity: ${customSettings.brushStroke}%`;
  }
  
  if (customSettings?.saturation) {
    prompt += `, color saturation: ${customSettings.saturation}%`;
  }
  
  if (customSettings?.abstraction) {
    prompt += `, abstraction level: ${customSettings.abstraction}%`;
  }
  
  return prompt;
};