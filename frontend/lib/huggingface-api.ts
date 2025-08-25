// Hugging Face API for Real AI Image Generation

interface HuggingFaceResponse {
  blob: () => Promise<Blob>;
  ok: boolean;
  status: number;
  statusText: string;
}

export interface ArtStyleConfig {
  id: string;
  name: string;
  nameKo: string;
  model: string;
  prompt: string;
  negativePrompt?: string;
  params?: {
    guidance_scale?: number;
    num_inference_steps?: number;
    strength?: number;
  };
}

// 다양한 AI 아트 스타일 정의
export const AI_ART_STYLES: Record<string, ArtStyleConfig> = {
  'vangogh-postimpressionism': {
    id: 'vangogh-postimpressionism',
    name: 'Van Gogh Style',
    nameKo: '반 고흐 스타일',
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    prompt: 'in the style of Vincent van Gogh, swirling brushstrokes, vibrant colors, post-impressionist masterpiece, thick impasto technique',
    negativePrompt: 'blurry, low quality, distorted, amateur',
    params: {
      guidance_scale: 7.5,
      num_inference_steps: 50,
      strength: 0.8
    }
  },
  'monet-impressionism': {
    id: 'monet-impressionism',
    name: 'Monet Impressionism',
    nameKo: '모네 인상주의',
    model: 'runwayml/stable-diffusion-v1-5',
    prompt: 'Claude Monet impressionist painting, soft brushstrokes, natural lighting, plein air style, beautiful color harmony',
    negativePrompt: 'sharp edges, digital art, photography',
    params: {
      guidance_scale: 8.0,
      num_inference_steps: 40,
      strength: 0.75
    }
  },
  'picasso-cubism': {
    id: 'picasso-cubism',
    name: 'Picasso Cubism',
    nameKo: '피카소 큐비즘',
    model: 'prompthero/openjourney-v4',
    prompt: 'Pablo Picasso cubist painting, geometric shapes, fragmented forms, multiple perspectives, bold angular lines',
    negativePrompt: 'realistic, photographic, smooth',
    params: {
      guidance_scale: 9.0,
      num_inference_steps: 45,
      strength: 0.85
    }
  },
  'warhol-popart': {
    id: 'warhol-popart',
    name: 'Warhol Pop Art',
    nameKo: '워홀 팝아트',
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    prompt: 'Andy Warhol pop art style, bright vivid colors, screen printing effect, commercial art aesthetic, bold contrast',
    negativePrompt: 'muted colors, traditional painting, realistic',
    params: {
      guidance_scale: 7.0,
      num_inference_steps: 35,
      strength: 0.7
    }
  },
  'klimt-artnouveau': {
    id: 'klimt-artnouveau',
    name: 'Klimt Art Nouveau',
    nameKo: '클림트 아르누보',
    model: 'runwayml/stable-diffusion-v1-5',
    prompt: 'Gustav Klimt art nouveau style, golden ornamental patterns, decorative elements, byzantine influence, elegant composition',
    negativePrompt: 'modern, minimalist, plain',
    params: {
      guidance_scale: 8.5,
      num_inference_steps: 50,
      strength: 0.8
    }
  },
  'anime-style': {
    id: 'anime-style',
    name: 'Anime Style',
    nameKo: '애니메 스타일',
    model: 'prompthero/openjourney-v4',
    prompt: 'beautiful anime art style, detailed character design, vibrant colors, studio ghibli inspired, high quality anime illustration',
    negativePrompt: 'realistic, photographic, western cartoon',
    params: {
      guidance_scale: 7.5,
      num_inference_steps: 40,
      strength: 0.75
    }
  },
  'cyberpunk-digital': {
    id: 'cyberpunk-digital',
    name: 'Cyberpunk Digital',
    nameKo: '사이버펑크 디지털',
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    prompt: 'cyberpunk digital art, neon colors, futuristic aesthetic, high tech low life, synthwave style, glowing effects',
    negativePrompt: 'vintage, classical, natural',
    params: {
      guidance_scale: 8.0,
      num_inference_steps: 45,
      strength: 0.8
    }
  },
  'pixelart-digital': {
    id: 'pixelart-digital',
    name: 'Pixel Art',
    nameKo: '픽셀 아트',
    model: 'prompthero/openjourney-v4',
    prompt: '16-bit pixel art style, retro gaming aesthetic, crisp pixels, limited color palette, nostalgic video game art',
    negativePrompt: 'smooth, high resolution, photorealistic',
    params: {
      guidance_scale: 7.0,
      num_inference_steps: 30,
      strength: 0.9
    }
  }
};

// 이미지를 Base64로 변환
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data:image/jpeg;base64, 부분 제거
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Hugging Face API 호출
export async function generateAIArt(
  imageFile: File,
  styleId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // 보안상 클라이언트에서 직접 API 키를 사용하지 않고 API Route 사용
  try {
    return await generateViaAPIRoute(imageFile, styleId, onProgress);
  } catch (error) {
    console.warn('API Route failed, using fallback:', error);
    // API Route 실패 시 fallback으로 Canvas 효과 사용
    return await fallbackCanvasEffect(imageFile, styleId, onProgress);
  }

}

// API Route를 통한 안전한 생성
async function generateViaAPIRoute(
  imageFile: File,
  styleId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const style = AI_ART_STYLES[styleId];
  if (!style) {
    throw new Error(`Unknown style: ${styleId}`);
  }

  try {
    onProgress?.(10);

    // 이미지를 Base64로 변환
    const base64Image = await imageToBase64(imageFile);
    onProgress?.(20);

    // API Route 호출 (서버사이드에서 API 키 사용)
    const response = await fetch('/api/huggingface/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image,
        styleId,
        model: style.model,
        prompt: style.prompt,
        negativePrompt: style.negativePrompt || '',
        params: style.params
      })
    });

    onProgress?.(70);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Route Error: ${response.status} - ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    onProgress?.(90);

    if (data.success && data.dataUrl) {
      onProgress?.(100);
      return data.dataUrl;
    } else {
      throw new Error('Invalid response from API Route');
    }

  } catch (error) {
    console.error('API Route Error:', error);
    throw error;
  }
}

// 이미지 리사이즈 함수
async function resizeImage(file: File, width: number, height: number): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      
      // 비율 유지하면서 리사이즈
      const aspectRatio = img.width / img.height;
      let drawWidth = width;
      let drawHeight = height;
      
      if (aspectRatio > 1) {
        drawHeight = width / aspectRatio;
      } else {
        drawWidth = height * aspectRatio;
      }
      
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;
      
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      
      canvas.toBlob((blob) => {
        const resizedFile = new File([blob!], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        resolve(resizedFile);
      }, 'image/jpeg', 0.9);
    };

    img.src = URL.createObjectURL(file);
  });
}

// Blob을 Data URL로 변환
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Fallback Canvas 효과 (기존 Canvas 로직 개선된 버전)
async function fallbackCanvasEffect(
  imageFile: File,
  styleId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      
      onProgress?.(30);
      
      // 이미지 그리기
      ctx.drawImage(img, 0, 0, 512, 512);
      
      onProgress?.(50);
      
      // 개선된 스타일 효과 적용
      applyEnhancedCanvasEffect(ctx, styleId);
      
      onProgress?.(80);
      
      // 결과 반환
      const result = canvas.toDataURL('image/jpeg', 0.9);
      
      onProgress?.(100);
      resolve(result);
    };

    img.src = URL.createObjectURL(imageFile);
  });
}

// 개선된 Canvas 효과 (기존 것보다 더 강력함)
function applyEnhancedCanvasEffect(ctx: CanvasRenderingContext2D, styleId: string) {
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  
  switch (styleId) {
    case 'vangogh-postimpressionism':
      // 더 강력한 반 고흐 효과
      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % 512;
        const y = Math.floor((i / 4) / 512);
        
        // 소용돌이 왜곡
        const centerX = 256, centerY = 256;
        const angle = Math.atan2(y - centerY, x - centerX);
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const swirl = Math.sin(distance * 0.02 + angle * 3) * 0.3;
        
        // 색상 강화
        data[i] = Math.min(255, data[i] * (1.2 + swirl));     // Red
        data[i + 1] = Math.min(255, data[i + 1] * (1.1 + swirl * 0.5)); // Green
        data[i + 2] = Math.min(255, data[i + 2] * (0.8 + swirl)); // Blue
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // 추가 필터 효과
      ctx.filter = 'contrast(1.4) saturate(1.6) brightness(1.1)';
      ctx.drawImage(ctx.canvas, 0, 0);
      ctx.filter = 'none';
      break;
      
    case 'monet-impressionism':
      // 부드러운 인상주의 효과
      ctx.putImageData(imageData, 0, 0);
      ctx.filter = 'blur(1px) brightness(1.2) saturate(1.3)';
      ctx.drawImage(ctx.canvas, 0, 0);
      ctx.filter = 'none';
      
      // 물감 번짐 효과
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(255, 240, 200, 0.1)';
      ctx.fillRect(0, 0, 512, 512);
      ctx.globalCompositeOperation = 'source-over';
      break;
      
    case 'picasso-cubism':
      // 큐비즘 기하학적 분할
      const originalCanvas = document.createElement('canvas');
      const originalCtx = originalCanvas.getContext('2d')!;
      originalCanvas.width = 512;
      originalCanvas.height = 512;
      originalCtx.putImageData(imageData, 0, 0);
      
      ctx.clearRect(0, 0, 512, 512);
      
      // 삼각형으로 분할하여 재배치
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = 30 + Math.random() * 100;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.random() * Math.PI * 2);
        ctx.scale(0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.4);
        
        ctx.drawImage(originalCanvas, -size/2, -size/2, size, size);
        ctx.restore();
      }
      
      ctx.filter = 'contrast(1.3) saturate(1.4)';
      ctx.drawImage(ctx.canvas, 0, 0);
      ctx.filter = 'none';
      break;
      
    case 'anime-style':
      // 애니메이션 스타일 효과
      for (let i = 0; i < data.length; i += 4) {
        // 색상 평탄화 (셀 쉐이딩)
        data[i] = Math.round(data[i] / 32) * 32;
        data[i + 1] = Math.round(data[i + 1] / 32) * 32;
        data[i + 2] = Math.round(data[i + 2] / 32) * 32;
      }
      
      ctx.putImageData(imageData, 0, 0);
      ctx.filter = 'contrast(1.5) saturate(1.8) brightness(1.1)';
      ctx.drawImage(ctx.canvas, 0, 0);
      ctx.filter = 'none';
      break;
      
    default:
      // 기본 아트 필터
      ctx.putImageData(imageData, 0, 0);
      ctx.filter = 'contrast(1.2) saturate(1.3) brightness(1.05)';
      ctx.drawImage(ctx.canvas, 0, 0);
      ctx.filter = 'none';
  }
}

// 무료 체험용 함수 (API 키 없이도 사용 가능)
export async function generateDemoArt(
  imageFile: File,
  styleId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // 데모 모드에서는 항상 Canvas 효과 사용
  return await fallbackCanvasEffect(imageFile, styleId, onProgress);
}