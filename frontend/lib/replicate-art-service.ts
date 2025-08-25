// Replicate AI Art Profile Service
// 진짜 image-to-image 스타일 변환을 위한 서비스

import Replicate from 'replicate';

// 스타일별 최적 모델과 프롬프트 매핑
const STYLE_CONFIGS = {
  'vangogh-postimpressionism': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'in the style of van gogh, post-impressionist painting, bold swirling brushstrokes, vibrant yellows and blues, thick impasto texture, emotional intensity, starry night aesthetic',
    strength: 0.65,
    guidance_scale: 7.5,
  },
  'monet-impressionism': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'in the style of claude monet, impressionist painting, soft brushstrokes, delicate light effects, water lily aesthetic, pastel colors, atmospheric perspective',
    strength: 0.6,
    guidance_scale: 7,
  },
  'picasso-cubism': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'in the style of pablo picasso, cubist art, geometric fragmentation, multiple perspectives, angular forms, bold colors, abstract deconstruction',
    strength: 0.7,
    guidance_scale: 8,
  },
  'warhol-popart': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'in the style of andy warhol, pop art, bright vivid colors, screen printing effect, commercial art aesthetic, bold contrast, repetitive patterns',
    strength: 0.65,
    guidance_scale: 7.5,
  },
  'klimt-artnouveau': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'in the style of gustav klimt, art nouveau, golden decorative patterns, ornamental elements, byzantine mosaics, sensual elegance, symbolic imagery',
    strength: 0.6,
    guidance_scale: 7.5,
  },
  'anime-style': {
    model: 'cjwbw/anything-v3-better-vae:09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65',
    prompt: 'anime style, high quality anime art, cel-shading, detailed character design, vibrant colors, beautiful backgrounds',
    strength: 0.55,
    guidance_scale: 7,
  },
  'ghibli-style': {
    model: 'cjwbw/anything-v3-better-vae:09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65',
    prompt: 'studio ghibli style, hayao miyazaki art style, watercolor aesthetic, soft colors, dreamy atmosphere, detailed backgrounds, fantasy art',
    strength: 0.6,
    guidance_scale: 7.5,
  },
  'cyberpunk-digital': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'cyberpunk style, neon colors, futuristic, holographic effects, dystopian atmosphere, blade runner aesthetic, high-tech',
    strength: 0.7,
    guidance_scale: 8,
  },
  'pixelart-digital': {
    model: 'andreasjansson/pixelart:8f4b79fe6f3e8189b5e93ca883ac0a392e319ad1b00fa426a5e5901c7e1593ce',
    prompt: 'pixel art style, 16-bit aesthetic, retro gaming, limited color palette, crisp pixels',
    strength: 0.8,
    guidance_scale: 7,
  },
  'rembrandt-baroque': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'in the style of rembrandt, baroque painting, dramatic chiaroscuro lighting, rich earth tones, psychological depth, dutch golden age',
    strength: 0.6,
    guidance_scale: 7.5,
  },
  'dali-surrealism': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'in the style of salvador dali, surrealist art, melting objects, dreamlike imagery, bizarre juxtapositions, subconscious symbolism',
    strength: 0.7,
    guidance_scale: 8,
  },
  'hokusai-ukiyoe': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'in the style of hokusai, ukiyo-e art, japanese woodblock print, wave patterns, mount fuji, bold outlines, traditional japanese art',
    strength: 0.65,
    guidance_scale: 7.5,
  },
  'rothko-abstract': {
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    prompt: 'in the style of mark rothko, abstract expressionist, color field painting, emotional color blocks, soft edges, meditative quality',
    strength: 0.75,
    guidance_scale: 7,
  }
};

export class ReplicateArtService {
  private replicate: Replicate | null = null;

  constructor() {
    // 클라이언트에서는 더 이상 직접 API 키를 사용하지 않음
    // 대신 API Route를 통해 서버사이드에서 처리
    this.replicate = null;
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
      const base64Image = await this.fileToDataUrl(imageFile);
      onProgress?.(20);

      // API Route 호출
      const response = await fetch('/api/replicate/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Image,
          styleId
        })
      });

      onProgress?.(50);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Route error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      onProgress?.(90);

      if (data.success && data.dataUrl) {
        onProgress?.(100);
        return data.dataUrl;
      } else {
        throw new Error('Invalid response from Replicate API Route');
      }
    } catch (error) {
      console.error('Replicate API Route error:', error);
      throw error;
    }
  }

  private async generateArtWithFallback(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (!this.replicate) {
      throw new Error('Replicate not initialized');
    }

    const imageDataUrl = await this.fileToDataUrl(imageFile);
    const styleConfig = STYLE_CONFIGS[styleId as keyof typeof STYLE_CONFIGS];
    
    onProgress?.(40);

    // Use simpler, more reliable model
    const output = await this.replicate.run(
      'rossjillian/controlnet:795433b19458d0f4fa172a7ccf93178d2adb1cb8ab2ad6c8fdc33fdbcd49f477',
      {
        input: {
          image: imageDataUrl,
          prompt: styleConfig.prompt,
          ddim_steps: 20,
          strength: 0.5,
          scale: 7,
        }
      }
    );

    onProgress?.(90);

    let resultUrl = Array.isArray(output) ? output[1] as string : output as string;
    
    if (resultUrl.startsWith('http')) {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      resultUrl = await this.blobToDataUrl(blob);
    }

    onProgress?.(100);
    return resultUrl;
  }

  private async fileToDataUrl(file: File): Promise<string> {
    // 서버 사이드에서는 실행하지 않음
    if (typeof window === 'undefined') {
      throw new Error('FileReader is only available in browser environment');
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async blobToDataUrl(blob: Blob): Promise<string> {
    // 서버 사이드에서는 실행하지 않음
    if (typeof window === 'undefined') {
      throw new Error('FileReader is only available in browser environment');
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // 사용 가능한 스타일 목록 조회
  getAvailableStyles() {
    return Object.keys(STYLE_CONFIGS).map(key => ({
      id: key,
      name: key.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      available: !!this.replicate
    }));
  }

  // 예상 비용 계산 (Replicate는 초당 과금)
  getEstimatedCost(styleId: string): string {
    // 평균 처리 시간: 2-5초
    // 비용: $0.00055 per second (SDXL)
    const avgTime = 3.5;
    const costPerSecond = 0.00055;
    const estimatedCost = avgTime * costPerSecond;
    
    return `$${estimatedCost.toFixed(4)} (약 ${(estimatedCost * 1300).toFixed(0)}원)`;
  }
}

// Export singleton instance
export const replicateArtService = new ReplicateArtService();