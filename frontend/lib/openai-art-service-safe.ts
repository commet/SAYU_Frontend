// OpenAI DALL-E Art Generation Service (Security Enhanced)
// 보안상 API Route만 사용

export class OpenAIArtService {
  constructor() {
    // 보안상 클라이언트에서는 더 이상 직접 API 키를 사용하지 않음
    console.log('OpenAI service initialized for API Route usage only');
  }

  async generateArt(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // API Route를 통한 안전한 처리
    return this.generateViaAPIRoute(imageFile, styleId, onProgress);
  }

  private async generateViaAPIRoute(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(10);

      // Convert image to base64
      const base64Image = await this.fileToBase64WithDataUrl(imageFile);
      onProgress?.(20);

      // API Route 호출
      const response = await fetch('/api/openai/generate-art', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Image,
          styleId
        })
      });

      onProgress?.(70);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API Route error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      onProgress?.(90);

      if (data.success && data.dataUrl) {
        onProgress?.(100);
        return data.dataUrl;
      } else {
        throw new Error('Invalid response from OpenAI API Route');
      }
    } catch (error) {
      console.error('OpenAI API Route error:', error);
      throw error;
    }
  }

  private async fileToBase64WithDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 스타일 목록 조회
  getAvailableStyles(): string[] {
    return [
      'vangogh-postimpressionism',
      'monet-impressionism', 
      'picasso-cubism',
      'warhol-popart',
      'klimt-artnouveau',
      'anime-style',
      'cyberpunk-digital',
      'pixelart-digital',
      'rembrandt-baroque',
      'dali-surrealism',
      'hokusai-ukiyoe',
      'rothko-abstract'
    ];
  }
}

// Export singleton instance
export const openAIArtService = new OpenAIArtService();