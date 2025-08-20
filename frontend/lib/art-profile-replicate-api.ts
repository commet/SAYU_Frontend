// Replicate를 사용한 Art Profile API
// 프론트엔드에서 직접 호출하는 API 클라이언트

import { replicateArtService } from './replicate-art-service';

export interface ArtProfileGenerationOptions {
  styleId: string;
  image: File;
  onProgress?: (progress: number) => void;
}

export interface ArtProfileResult {
  success: boolean;
  artworkUrl: string;
  styleId: string;
  estimatedCost: string;
  service: string;
  timestamp?: string;
}

class ArtProfileReplicateAPI {
  
  /**
   * Replicate API를 사용한 아트 프로필 생성
   */
  async generateArtProfile(options: ArtProfileGenerationOptions): Promise<ArtProfileResult> {
    const { image, styleId, onProgress } = options;
    
    // FormData 생성
    const formData = new FormData();
    formData.append('image', image);
    formData.append('styleId', styleId);

    try {
      // API 엔드포인트 호출
      const response = await fetch('/api/art-profile/generate-replicate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate art profile');
      }

      const result = await response.json();
      
      return {
        ...result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Art profile generation error:', error);
      throw error;
    }
  }

  /**
   * 사용 가능한 스타일 목록 조회
   */
  async getAvailableStyles(): Promise<Array<{
    id: string;
    name: string;
    available: boolean;
  }>> {
    const response = await fetch('/api/art-profile/generate-replicate');
    
    if (!response.ok) {
      throw new Error('Failed to fetch available styles');
    }

    const data = await response.json();
    return data.styles;
  }

  /**
   * 클라이언트 사이드에서 직접 Replicate 호출 (선택적)
   * 주의: API 토큰이 노출되므로 개발 환경에서만 사용
   */
  async generateDirectly(
    image: File, 
    styleId: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // 브라우저 환경 체크
      if (typeof window === 'undefined') {
        throw new Error('This method can only be used in browser');
      }

      // 이미지 리사이즈 (최적화)
      const resizedImage = await this.resizeImage(image, 1024);
      
      // Replicate 서비스 직접 호출
      const artworkUrl = await replicateArtService.generateArt(
        resizedImage,
        styleId,
        onProgress
      );

      return artworkUrl;
    } catch (error) {
      console.error('Direct generation error:', error);
      throw error;
    }
  }

  /**
   * 이미지 리사이즈 유틸리티
   */
  private async resizeImage(file: File, maxWidth: number = 1024): Promise<File> {
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

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          }, 'image/jpeg', 0.9);
        } else {
          reject(new Error('Canvas context not available'));
        }
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 예상 비용 계산
   */
  getEstimatedCost(styleId: string): string {
    return replicateArtService.getEstimatedCost(styleId);
  }

  /**
   * 스타일 추천 (성격 유형 기반)
   */
  getRecommendedStyle(personalityType?: string): string {
    const recommendations: Record<string, string> = {
      'ENFP': 'vangogh-postimpressionism',
      'INFP': 'monet-impressionism',
      'ENTP': 'picasso-cubism',
      'ESTP': 'warhol-popart',
      'INFJ': 'klimt-artnouveau',
      'ISFP': 'ghibli-style',
      'INTJ': 'cyberpunk-digital',
      'ISTP': 'pixelart-digital',
      'ISTJ': 'rembrandt-baroque',
      'ENFJ': 'rothko-abstract',
      'INTP': 'dali-surrealism',
      'ESFJ': 'hokusai-ukiyoe',
    };

    return recommendations[personalityType || ''] || 'anime-style';
  }
}

export const artProfileReplicateAPI = new ArtProfileReplicateAPI();