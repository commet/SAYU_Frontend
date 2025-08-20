// Replicate 최적화 서비스 - 용도별 최적 모델 자동 선택
import Replicate from 'replicate';
import { selectBestModel, REPLICATE_MODELS } from './replicate-models-catalog';

export class OptimizedReplicateService {
  private replicate: Replicate | null = null;

  constructor() {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (apiToken && apiToken !== 'r8_YOUR_TOKEN_HERE') {
      this.replicate = new Replicate({ auth: apiToken });
    }
  }

  /**
   * 스마트 스타일 변환 - 자동으로 최적 모델 선택
   */
  async smartStyleTransfer(
    imageFile: File,
    options: {
      style: string;
      quality?: 'fast' | 'balanced' | 'best';
      preserveFace?: boolean;
      budget?: 'low' | 'medium' | 'high';
    }
  ) {
    const { style, quality = 'balanced', preserveFace = false, budget = 'medium' } = options;

    // 스타일별 최적 모델 자동 선택
    let model: string;
    let config: any = {};

    // 프로필 사진 + 얼굴 보존
    if (preserveFace) {
      model = 'tencentarc/photomaker:ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4';
      config = {
        num_steps: 20,
        style_strength: 20,
        num_outputs: 1,
      };
    }
    // 지브리/애니메 스타일
    else if (style.includes('ghibli') || style.includes('anime')) {
      model = 'cjwbw/anything-v3-better-vae:09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65';
      config = {
        prompt: `${style} style, masterpiece, best quality`,
        negative_prompt: 'lowres, bad anatomy, bad hands',
        strength: 0.6,
        guidance_scale: 7,
        num_inference_steps: quality === 'fast' ? 20 : 30,
      };
    }
    // 초고속 생성 (Lightning)
    else if (quality === 'fast' && budget === 'low') {
      model = 'bytedance/sdxl-lightning-2step:0cd8e8e95eab6d87ebbce322cc850856b4c5170b5d0c0f8c80fe87fb7e7d02e7';
      config = {
        prompt: `${style} style`,
        num_inference_steps: 2,
        guidance_scale: 0, // Lightning은 guidance 불필요
      };
    }
    // 최고 품질 (FLUX Pro)
    else if (quality === 'best' && budget === 'high') {
      model = 'black-forest-labs/flux-pro';
      config = {
        prompt: `${style} style, ultra detailed, masterpiece`,
        steps: 25,
        guidance: 3,
      };
    }
    // 기본: SDXL (균형잡힌 선택)
    else {
      model = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
      config = {
        prompt: `${style} style, high quality`,
        negative_prompt: 'lowres, bad anatomy',
        refine: 'expert_ensemble_refiner',
        num_inference_steps: 25,
        guidance_scale: 7.5,
        prompt_strength: 0.6,
      };
    }

    // 이미지 준비
    const imageDataUrl = await this.fileToDataUrl(imageFile);

    // 모델 실행
    console.log(`Using model: ${model.split('/')[1]?.split(':')[0]}`);
    
    const input = {
      image: imageDataUrl,
      ...config
    };

    const output = await this.replicate!.run(model, { input });
    
    // 결과 처리
    let resultUrl = Array.isArray(output) ? output[0] : output;
    if (typeof resultUrl === 'string' && resultUrl.startsWith('http')) {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      resultUrl = await this.blobToDataUrl(blob);
    }

    return {
      imageUrl: resultUrl as string,
      model: model.split('/')[1]?.split(':')[0],
      cost: this.estimateCost(model),
    };
  }

  /**
   * 프리셋 스타일 패키지
   */
  async applyPreset(imageFile: File, preset: string) {
    const presets: Record<string, any> = {
      // 인스타그램 프로필용
      'instagram-profile': {
        model: 'tencentarc/photomaker',
        style: 'professional portrait, soft lighting',
        preserveFace: true,
        quality: 'best',
      },
      
      // 링크드인 프로필용
      'linkedin-professional': {
        model: 'zsxkib/instant-id',
        style: 'corporate headshot, clean background',
        preserveFace: true,
        quality: 'balanced',
      },

      // 아트 포트폴리오용
      'art-portfolio': {
        model: 'stability-ai/sdxl',
        style: 'artistic interpretation, creative',
        quality: 'best',
        budget: 'medium',
      },

      // 게임 아바타용
      'game-avatar': {
        model: 'cjwbw/anything-v3-better-vae',
        style: 'anime game character, vibrant colors',
        quality: 'balanced',
      },

      // NFT 아트용
      'nft-art': {
        model: 'black-forest-labs/flux-pro',
        style: 'unique digital art, collectible quality',
        quality: 'best',
        budget: 'high',
      },

      // 빠른 테스트용
      'quick-preview': {
        model: 'bytedance/sdxl-lightning-2step',
        style: 'quick artistic style',
        quality: 'fast',
        budget: 'low',
      },
    };

    const config = presets[preset] || presets['instagram-profile'];
    return this.smartStyleTransfer(imageFile, config);
  }

  /**
   * 배치 처리 - 여러 스타일 동시 생성
   */
  async batchGenerate(imageFile: File, styles: string[]) {
    const promises = styles.map(style => 
      this.smartStyleTransfer(imageFile, { 
        style, 
        quality: 'fast',
        budget: 'low' 
      })
    );

    return Promise.all(promises);
  }

  /**
   * 비용 추정
   */
  private estimateCost(model: string): string {
    const costs: Record<string, number> = {
      'photomaker': 0.01,
      'instant-id': 0.008,
      'sdxl': 0.002,
      'anything-v3': 0.002,
      'flux-pro': 0.055,
      'flux-schnell': 0.003,
      'lightning-2step': 0.0005,
      'lightning-4step': 0.001,
    };

    const modelName = model.split('/')[1]?.split(':')[0] || 'unknown';
    const cost = costs[modelName] || 0.002;
    
    return `$${cost.toFixed(4)}`;
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
}

export const optimizedReplicateService = new OptimizedReplicateService();