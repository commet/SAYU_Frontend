// Universal Replicate Service - 모든 케이스를 하나의 모델로 처리
// FLUX Schnell을 메인으로, SDXL을 폴백으로 사용

import Replicate from 'replicate';

// 이미지 타입 자동 감지를 위한 프롬프트 프리셋
const IMAGE_TYPE_PROMPTS = {
  portrait: {
    prefix: 'portrait photography style',
    suffix: 'detailed facial features, natural skin tone, preserve identity',
    strength: 0.55,  // 얼굴 보존을 위해 낮은 strength
  },
  animal: {
    prefix: 'adorable pet portrait',
    suffix: 'soft fur texture, expressive eyes, cute and fluffy',
    strength: 0.6,
  },
  landscape: {
    prefix: 'scenic masterpiece',
    suffix: 'natural lighting, atmospheric perspective, vibrant colors',
    strength: 0.65,
  },
  object: {
    prefix: 'artistic still life',
    suffix: 'detailed textures, dramatic lighting, professional composition',
    strength: 0.7,
  }
};

// 아트 스타일 정의 (심플하게)
const ART_STYLES = {
  // 주요 스타일만 유지
  'oil-painting': 'classical oil painting, thick brushstrokes, rich colors',
  'watercolor': 'soft watercolor painting, flowing colors, artistic wash',
  'anime': 'anime art style, vibrant colors, cel-shading',
  'sketch': 'pencil sketch drawing, artistic line work, monochrome',
  'popart': 'pop art style, bold colors, high contrast, andy warhol inspired',
  'impressionist': 'impressionist painting, soft brushstrokes, light and color',
  'digital-art': 'modern digital art, vibrant and clean, concept art quality',
  'vintage': 'vintage photograph, nostalgic feel, faded colors, film grain',
};

export class UniversalReplicateService {
  private replicate: Replicate | null = null;
  
  // 주 모델: SDXL (안정적이고 메모리 효율적)
  private readonly PRIMARY_MODEL = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
  
  // 폴백 모델: SDXL-Lightning (더 빠른 버전)
  private readonly FALLBACK_MODEL = 'lucataco/sdxl-lightning-4step:727e49a643e999d602a896c774a0658ffefea21465756a6ce24b7ea4165eba6a';

  constructor() {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (apiToken && apiToken !== 'r8_YOUR_TOKEN_HERE') {
      this.replicate = new Replicate({ auth: apiToken });
    }
  }

  /**
   * 범용 스타일 변환 - 한 모델로 모든 케이스 처리
   */
  async transformStyle(
    imageFile: File,
    style: keyof typeof ART_STYLES,
    options?: {
      imageType?: 'portrait' | 'animal' | 'landscape' | 'object' | 'auto';
      quality?: 'fast' | 'balanced' | 'best';
      onProgress?: (progress: number) => void;
    }
  ) {
    if (!this.replicate) {
      throw new Error('Replicate API token not configured');
    }

    const { 
      imageType = 'auto', 
      quality = 'balanced',
      onProgress 
    } = options || {};

    try {
      onProgress?.(10);

      // 이미지를 Data URL로 변환
      const imageDataUrl = await this.fileToDataUrl(imageFile);
      
      onProgress?.(20);

      // 이미지 타입 자동 감지 또는 수동 설정
      const detectedType = imageType === 'auto' 
        ? await this.detectImageType(imageFile)
        : imageType;

      // 프롬프트 구성
      const stylePrompt = ART_STYLES[style];
      const typeConfig = IMAGE_TYPE_PROMPTS[detectedType];
      
      const fullPrompt = `${typeConfig.prefix}, ${stylePrompt}, ${typeConfig.suffix}, masterpiece, high quality`;

      onProgress?.(30);

      // SDXL 모델 실행
      console.log(`Processing with SDXL: ${detectedType} + ${style}`);
      
      const input = this.buildSDXLInput(imageDataUrl, fullPrompt, typeConfig.strength, quality);
      
      const output = await this.replicate.run(this.PRIMARY_MODEL, { input });
      
      onProgress?.(80);

      // 결과 처리
      let resultUrl = this.extractResultUrl(output);
      
      // URL을 Data URL로 변환
      if (resultUrl.startsWith('http')) {
        resultUrl = await this.urlToDataUrl(resultUrl);
      }

      onProgress?.(100);

      return {
        success: true,
        imageUrl: resultUrl,
        style: style,
        imageType: detectedType,
        model: 'sdxl',
        cost: '$0.002',
        processingTime: '2-3 seconds'
      };

    } catch (error) {
      console.error('Primary model failed, trying fallback...', error);
      
      // 폴백: SDXL 모델 사용
      return this.fallbackTransform(imageFile, style, options);
    }
  }

  /**
   * Base64 이미지로부터 스타일 변환 (서버 사이드용)
   */
  async transformStyleFromBase64(
    imageBase64: string,
    style: keyof typeof ART_STYLES,
    options?: {
      imageType?: 'portrait' | 'animal' | 'landscape' | 'object' | 'auto';
      quality?: 'fast' | 'balanced' | 'best';
      fileName?: string;
      onProgress?: (progress: number) => void;
    }
  ) {
    if (!this.replicate) {
      throw new Error('Replicate API token not configured');
    }

    const { 
      imageType = 'auto', 
      quality = 'balanced',
      fileName = 'image.jpg',
      onProgress 
    } = options || {};

    try {
      onProgress?.(10);

      // Base64 데이터는 이미 Data URL 형식
      const imageDataUrl = imageBase64;
      
      onProgress?.(20);

      // 이미지 타입 자동 감지 또는 수동 설정
      const detectedType = imageType === 'auto' 
        ? this.detectImageTypeFromName(fileName, imageType)
        : imageType;

      // 프롬프트 구성
      const stylePrompt = ART_STYLES[style];
      const typeConfig = IMAGE_TYPE_PROMPTS[detectedType];
      
      const fullPrompt = `${typeConfig.prefix}, ${stylePrompt}, ${typeConfig.suffix}, masterpiece, high quality`;

      onProgress?.(30);

      // SDXL 모델 실행
      console.log(`Processing with SDXL: ${detectedType} + ${style}`);
      
      const input = this.buildSDXLInput(imageDataUrl, fullPrompt, typeConfig.strength, quality);
      
      const output = await this.replicate.run(this.PRIMARY_MODEL, { input });
      
      console.log('SDXL output:', output);
      
      onProgress?.(80);

      // 결과 처리 - ReadableStream 처리
      let resultUrl: string;
      if (output && output[0] && typeof output[0] === 'object' && 'locked' in output[0]) {
        // ReadableStream인 경우 - 이미지 바이너리 데이터
        console.log('Processing ReadableStream as image...');
        const stream = output[0] as any;
        const response = new Response(stream);
        const blob = await response.blob();
        
        // 서버 사이드에서는 base64로 변환
        const buffer = await blob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        resultUrl = `data:image/png;base64,${base64}`;
        console.log('Created base64 data URL');
      } else {
        resultUrl = this.extractResultUrl(output);
      }
      
      console.log('Extracted URL:', resultUrl);
      
      // URL을 Data URL로 변환하지 않고 그대로 반환
      // Next.js Image 컴포넌트가 외부 URL을 처리할 수 있음

      onProgress?.(100);

      return {
        success: true,
        imageUrl: resultUrl,
        style: style,
        imageType: detectedType,
        model: 'sdxl',
        cost: '$0.002',
        processingTime: '2-3 seconds'
      };

    } catch (error: any) {
      console.error('SDXL failed, trying fallback...', error);
      
      // 폴백 처리
      return await this.fallbackTransformFromBase64(
        imageBase64,
        style,
        { imageType, quality, fileName, onProgress }
      );
    }
  }

  /**
   * 파일명으로부터 이미지 타입 추정
   */
  private detectImageTypeFromName(fileName: string, defaultType: string): 'portrait' | 'animal' | 'landscape' | 'object' {
    const name = fileName.toLowerCase();
    if (name.includes('selfie') || name.includes('portrait') || name.includes('face')) {
      return 'portrait';
    }
    if (name.includes('dog') || name.includes('cat') || name.includes('pet')) {
      return 'animal';
    }
    if (name.includes('landscape') || name.includes('nature') || name.includes('view')) {
      return 'landscape';
    }
    return defaultType === 'auto' ? 'portrait' : defaultType as any;
  }

  /**
   * 폴백 변환 - SDXL 사용 (Base64 버전)
   */
  private async fallbackTransformFromBase64(
    imageBase64: string,
    style: keyof typeof ART_STYLES,
    options?: any
  ) {
    if (!this.replicate) {
      throw new Error('Replicate not initialized');
    }

    const { imageType = 'auto', quality = 'balanced', fileName = 'image.jpg', onProgress } = options || {};
    
    onProgress?.(40);

    const imageDataUrl = imageBase64;
    const detectedType = imageType === 'auto' 
      ? this.detectImageTypeFromName(fileName, imageType)
      : imageType;

    const stylePrompt = ART_STYLES[style];
    const typeConfig = IMAGE_TYPE_PROMPTS[detectedType];
    
    const fullPrompt = `${typeConfig.prefix}, ${stylePrompt}, ${typeConfig.suffix}`;

    console.log('Using fallback SDXL-Lightning model...');

    // SDXL-Lightning은 4-step 모델
    const input = {
      prompt: `${fullPrompt}, img2img style transfer`,
      image: imageDataUrl,
      num_inference_steps: 4,  // Lightning은 4-step 고정
      guidance_scale: 0,  // Lightning은 guidance 0 권장
      strength: typeConfig.strength,
      scheduler: 'K_EULER',
      negative_prompt: 'lowres, bad anatomy, bad hands, text, error',
      width: 768,
      height: 768
    };

    onProgress?.(60);

    const output = await this.replicate.run(this.FALLBACK_MODEL, { input });
    
    onProgress?.(90);

    // ReadableStream 처리
    let resultUrl: string;
    if (output && output[0] && typeof output[0] === 'object' && 'locked' in output[0]) {
      // ReadableStream인 경우 - 이미지 바이너리 데이터
      const stream = output[0] as any;
      const response = new Response(stream);
      const blob = await response.blob();
      
      // 서버 사이드에서는 base64로 변환
      const buffer = await blob.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      resultUrl = `data:image/png;base64,${base64}`;
    } else {
      resultUrl = this.extractResultUrl(output);
    }

    onProgress?.(100);

    return {
      success: true,
      imageUrl: resultUrl,
      style: style,
      imageType: detectedType,
      model: 'sdxl-fallback',
      cost: '$0.002',
      processingTime: '2-4 seconds'
    };
  }

  /**
   * 폴백 변환 - SDXL 사용
   */
  private async fallbackTransform(
    imageFile: File,
    style: keyof typeof ART_STYLES,
    options?: any
  ) {
    if (!this.replicate) {
      throw new Error('Replicate not initialized');
    }

    const { imageType = 'auto', quality = 'balanced', onProgress } = options || {};
    
    onProgress?.(40);

    const imageDataUrl = await this.fileToDataUrl(imageFile);
    const detectedType = imageType === 'auto' 
      ? await this.detectImageType(imageFile)
      : imageType;

    const stylePrompt = ART_STYLES[style];
    const typeConfig = IMAGE_TYPE_PROMPTS[detectedType];
    
    const fullPrompt = `${typeConfig.prefix}, ${stylePrompt}, ${typeConfig.suffix}`;

    console.log('Using fallback SDXL-Lightning model...');

    // SDXL-Lightning은 4-step 모델
    const input = {
      prompt: `${fullPrompt}, img2img style transfer`,
      image: imageDataUrl,
      num_inference_steps: 4,  // Lightning은 4-step 고정
      guidance_scale: 0,  // Lightning은 guidance 0 권장
      strength: typeConfig.strength,
      scheduler: 'K_EULER',
      negative_prompt: 'lowres, bad anatomy, bad hands, text, error',
      width: 768,
      height: 768
    };

    onProgress?.(60);

    const output = await this.replicate.run(this.FALLBACK_MODEL, { input });
    
    onProgress?.(90);

    // ReadableStream 처리
    let resultUrl: string;
    if (output && output[0] && typeof output[0] === 'object' && 'locked' in output[0]) {
      // ReadableStream인 경우 - 이미지 바이너리 데이터
      const stream = output[0] as any;
      const response = new Response(stream);
      const blob = await response.blob();
      
      // 서버 사이드에서는 base64로 변환
      const buffer = await blob.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      resultUrl = `data:image/png;base64,${base64}`;
    } else {
      resultUrl = this.extractResultUrl(output);
    }
    
    if (resultUrl.startsWith('http')) {
      resultUrl = await this.urlToDataUrl(resultUrl);
    }

    onProgress?.(100);

    return {
      success: true,
      imageUrl: resultUrl,
      style: style,
      imageType: detectedType,
      model: 'sdxl-fallback',
      cost: '$0.002',
      processingTime: '2-4 seconds'
    };
  }

  /**
   * 이미지 타입 자동 감지 (간단한 휴리스틱)
   */
  private async detectImageType(file: File): Promise<'portrait' | 'animal' | 'landscape' | 'object'> {
    // 실제로는 AI 비전 모델을 사용할 수 있지만, 
    // 여기서는 간단한 휴리스틱 사용
    
    // 파일명 힌트
    const fileName = file.name.toLowerCase();
    if (fileName.includes('selfie') || fileName.includes('portrait') || fileName.includes('face')) {
      return 'portrait';
    }
    if (fileName.includes('dog') || fileName.includes('cat') || fileName.includes('pet')) {
      return 'animal';
    }
    if (fileName.includes('landscape') || fileName.includes('nature') || fileName.includes('view')) {
      return 'landscape';
    }

    // 이미지 비율로 추정 (세로가 긴 경우 인물일 가능성)
    const img = await this.loadImage(file);
    const aspectRatio = img.width / img.height;
    
    if (aspectRatio < 0.8) {
      return 'portrait';  // 세로 사진은 주로 인물
    } else if (aspectRatio > 1.5) {
      return 'landscape';  // 가로가 긴 사진은 주로 풍경
    }
    
    // 기본값
    return 'portrait';  // 가장 많은 케이스
  }

  /**
   * SDXL 모델 입력 구성
   */
  private buildSDXLInput(
    imageUrl: string, 
    prompt: string, 
    strength: number,
    quality: 'fast' | 'balanced' | 'best'
  ) {
    // SDXL img2img 모드를 위한 입력
    return {
      prompt: prompt,
      negative_prompt: 'lowres, bad anatomy, bad hands, text, error, missing fingers, worst quality, low quality',
      image: imageUrl,
      num_inference_steps: quality === 'fast' ? 20 : quality === 'best' ? 50 : 30,
      guidance_scale: 7.5,
      prompt_strength: strength,
      scheduler: 'K_EULER',
      seed: -1,
      refine: 'no_refiner',  // img2img에서는 refiner 사용 안함
      apply_watermark: false,
      lora_scale: 0.6
    };
  }

  /**
   * FLUX 모델 입력 구성 (레거시)
   */
  private buildFluxInput(
    imageUrl: string, 
    prompt: string, 
    strength: number,
    quality: 'fast' | 'balanced' | 'best'
  ) {
    const baseInput = {
      image: imageUrl,
      prompt: prompt,
      num_outputs: 1,
      aspect_ratio: '1:1',
      output_format: 'webp',
      output_quality: quality === 'best' ? 90 : 80,
    };

    // FLUX Schnell은 단순한 파라미터
    if (quality === 'fast') {
      return {
        ...baseInput,
        num_inference_steps: 4,  // 초고속
      };
    }

    return {
      ...baseInput,
      num_inference_steps: quality === 'best' ? 8 : 6,
    };
  }

  /**
   * 결과 URL 추출
   */
  private extractResultUrl(output: any): string {
    console.log('Raw output:', JSON.stringify(output, null, 2));
    
    // SDXL은 보통 배열로 반환
    if (Array.isArray(output) && output.length > 0) {
      // 첫 번째 요소가 문자열 URL인 경우
      if (typeof output[0] === 'string') {
        return output[0];
      }
      // 첫 번째 요소가 객체인 경우
      if (output[0]?.url) {
        return output[0].url;
      }
    }
    
    // 단일 문자열인 경우
    if (typeof output === 'string') {
      return output;
    }
    
    // 객체인 경우
    if (output?.url) {
      return output.url;
    }
    
    // output이 객체이고 output 속성을 가진 경우
    if (output?.output) {
      if (Array.isArray(output.output) && output.output[0]) {
        return output.output[0];
      }
      if (typeof output.output === 'string') {
        return output.output;
      }
    }
    
    console.error('Unexpected output format:', output);
    throw new Error('Unexpected output format');
  }

  /**
   * 유틸리티 함수들
   */
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

  private async urlToDataUrl(url: string): Promise<string> {
    // 서버 사이드에서는 실행하지 않음
    if (typeof window === 'undefined') {
      throw new Error('FileReader is only available in browser environment');
    }
    
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async loadImage(file: File): Promise<HTMLImageElement> {
    // 서버 사이드에서는 실행하지 않음
    if (typeof window === 'undefined') {
      throw new Error('Image is only available in browser environment');
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 사용 가능한 스타일 목록
   */
  getAvailableStyles() {
    return Object.keys(ART_STYLES).map(key => ({
      id: key,
      name: key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: ART_STYLES[key as keyof typeof ART_STYLES]
    }));
  }

  /**
   * 비용 정보
   */
  getCostInfo() {
    return {
      primary: { model: 'FLUX Schnell', cost: '$0.003', speed: '1-2s' },
      fallback: { model: 'SDXL', cost: '$0.002', speed: '2-4s' },
      average: '$0.003 per image',
      monthly: 'Estimated $30-50 for 10,000 images'
    };
  }
}

// 싱글톤 인스턴스
export const universalReplicateService = new UniversalReplicateService();