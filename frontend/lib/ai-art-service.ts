// Enhanced AI Art Generation Service
// Supports multiple AI providers for better reliability

export interface ArtGenerationOptions {
  prompt: string;
  style?: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  model?: string;
}

export class AIArtService {
  private static instance: AIArtService;
  private baseUrl: string;
  
  private constructor() {
    // 현재 도메인 사용 (Next.js API Route 우선)
    if (typeof window !== 'undefined') {
      this.baseUrl = window.location.origin;
    } else {
      this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    }
    console.log('AIArtService initialized with Next.js API Routes URL:', this.baseUrl);
  }
  
  static getInstance(): AIArtService {
    if (!AIArtService.instance) {
      AIArtService.instance = new AIArtService();
    }
    return AIArtService.instance;
  }

  // Main generation method using Next.js API Route with canvas fallback
  async generateArt(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    console.log('=== AIArtService.generateArt Debug ===');
    console.log('Using Next.js API Route for Replicate image generation');
    console.log('Style ID:', styleId);
    console.log('API URL:', this.baseUrl);
    onProgress?.(5);
    
    // Try Next.js API Route first (no CORS issues)
    console.log('Trying Next.js API Route...');
    try {
      const result = await this.generateWithNextjsAPI(imageFile, styleId, onProgress);
      if (result) {
        console.log('✅ Next.js API Route succeeded!');
        return result;
      }
    } catch (error) {
      console.warn('❌ Next.js API Route failed:', error);
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    throw new Error('AI generation failed: No result returned');
  }

  // Backend API generation (Supabase Edge Function or Local)
  private async generateWithBackendAPI(
    base64Image: string,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(20);
      
      const isEdgeFunction = process.env.NEXT_PUBLIC_USE_EDGE_FUNCTION === 'true';
      let headers: any = { 'Content-Type': 'application/json' };
      let endpoint = '';
      
      if (isEdgeFunction) {
        // Supabase Edge Function
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';
        headers['Authorization'] = `Bearer ${anonKey}`;
        headers['apikey'] = anonKey;
        endpoint = `${this.baseUrl}/generate-art`;
      } else {
        // Local backend
        endpoint = `${this.baseUrl}/api/art-profile/generate`;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          base64Image,
          styleId
        })
      });
      
      onProgress?.(60);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Supabase Edge Function error:', errorData);
        } catch (e) {
          console.error('Failed to parse error response');
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      onProgress?.(90);
      
      if (data.success && data.data?.transformedImage) {
        return data.data.transformedImage;
      } else {
        throw new Error('Invalid response from Supabase Edge Function');
      }
      
    } catch (error) {
      console.error('Supabase Edge Function error:', error);
      throw error;
    }
  }

  // Get auth token from localStorage or cookie
  private getAuthToken(): string {
    // Try localStorage first
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) return token;
      
      // Try session storage
      const sessionToken = sessionStorage.getItem('authToken') || sessionStorage.getItem('token');
      if (sessionToken) return sessionToken;
      
      // Try to get from cookie
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'authToken' || name === 'token') {
          return value;
        }
      }
    }
    
    // Return empty string if no token found (will cause 401 error)
    return '';
  }

  // [DEPRECATED] Stability AI - 보안상 사용 안함
  private async generateWithStabilityAI(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    throw new Error('Stability AI direct access deprecated for security. Use API Route instead.');

    onProgress?.(10);
    
    const formData = new FormData();
    formData.append('init_image', imageFile);
    formData.append('text_prompts[0][text]', this.getPromptForStyle(styleId));
    formData.append('text_prompts[0][weight]', '1');
    formData.append('text_prompts[1][text]', this.getNegativePromptForStyle(styleId));
    formData.append('text_prompts[1][weight]', '-1');
    formData.append('cfg_scale', '12'); // Increased for stronger style adherence
    formData.append('samples', '1');
    formData.append('steps', '50'); // Increased for better quality
    formData.append('style_preset', this.getStabilityStylePreset(styleId));
    
    onProgress?.(30);
    
    const response = await fetch(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        body: formData
      }
    );
    
    onProgress?.(70);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Stability AI Error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    const image = data.artifacts[0];
    
    onProgress?.(90);
    
    // Convert base64 to data URL
    const dataUrl = `data:image/png;base64,${image.base64}`;
    
    onProgress?.(100);
    
    return dataUrl;
  }

  // [DEPRECATED] Hugging Face - 보안상 사용 안함
  private async generateWithHuggingFace(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    throw new Error('HuggingFace direct access deprecated for security. Use API Route instead.');

    onProgress?.(10);
    
    // Convert image to base64
    const base64 = await this.fileToBase64(imageFile);
    
    onProgress?.(20);
    
    // Use a more reliable model
    const model = 'timbrooks/instruct-pix2pix';
    const prompt = this.getPromptForStyle(styleId);
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: this.getNegativePromptForStyle(styleId),
            num_inference_steps: 30,
            guidance_scale: 7.5,
            image: base64
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        })
      }
    );
    
    onProgress?.(70);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face Error: ${response.status} - ${errorText}`);
    }
    
    const blob = await response.blob();
    
    onProgress?.(90);
    
    const dataUrl = await this.blobToDataURL(blob);
    
    onProgress?.(100);
    
    return dataUrl;
  }

  // Next.js API Route - CORS 우회를 위한 서버사이드 Replicate 호출
  private async generateWithNextjsAPI(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    console.log('Next.js API Route: Processing with style:', styleId);
    onProgress?.(10);
    
    const base64 = await this.fileToBase64(imageFile);
    onProgress?.(20);
    
    // 진행률 시뮬레이션을 위한 인터벌
    let currentProgress = 20;
    const progressInterval = setInterval(() => {
      currentProgress = Math.min(currentProgress + 2, 85);
      onProgress?.(currentProgress);
    }, 1000); // 1초마다 2%씩 증가
    
    try {
      // 상대 경로 사용 (Same-Origin)
      const apiUrl = '/api/generate-art';
      console.log('🎯 API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base64Image: base64,
          styleId
        })
      });
      
      // 진행률 시뮬레이션 중단
      clearInterval(progressInterval);
      onProgress?.(90);
      
      if (!response.ok) {
        let errorMessage = `API Route error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse API Route error response');
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      onProgress?.(95);
      
      if (data.success && data.data?.transformedImage) {
        onProgress?.(100);
        return data.data.transformedImage;
      } else {
        throw new Error('Invalid response from Next.js API Route');
      }
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  }

  // [DEPRECATED] Direct Replicate AI - 보안상 사용 안함
  private async generateWithReplicateAI(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    throw new Error('Replicate direct access deprecated for security. Use API Route instead.');

    console.log('Replicate: Processing with style:', styleId);
    onProgress?.(10);
    
    const base64 = await this.fileToBase64(imageFile);
    const dataUrl = `data:${imageFile.type};base64,${base64}`;
    
    onProgress?.(20);
    
    // 스타일별 최적 모델 선택
    const modelConfig = this.getReplicateModelForStyle(styleId);
    console.log('Using Replicate model:', modelConfig.name);
    
    // Start prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: modelConfig.version,
        input: {
          ...modelConfig.baseInput,
          image: dataUrl,
          prompt: this.getPromptForStyle(styleId),
          ...(modelConfig.supportNegativePrompt && {
            negative_prompt: this.getNegativePromptForStyle(styleId)
          })
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Replicate Error: ${response.status}`);
    }
    
    const prediction = await response.json();
    
    onProgress?.(40);
    
    // Poll for result
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${apiKey}`
          }
        }
      );
      
      result = await pollResponse.json();
      onProgress?.(40 + (result.progress || 0) * 50);
    }
    
    if (result.status === 'failed') {
      throw new Error('Replicate prediction failed');
    }
    
    onProgress?.(100);
    
    return result.output[0];
  }

  // Enhanced Canvas fallback with better effects
  private async generateWithEnhancedCanvas(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      const img = new Image();

      // 진행률 시뮬레이션
      let currentProgress = 20;
      const progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 3, 85);
        onProgress?.(currentProgress);
      }, 200); // 200ms마다 3%씩 증가

      img.onload = () => {
        canvas.width = 1024;
        canvas.height = 1024;
        
        // Draw and apply advanced filters
        ctx.drawImage(img, 0, 0, 1024, 1024);
        
        // Apply style-specific transformations with progress updates
        setTimeout(() => {
          clearInterval(progressInterval);
          onProgress?.(90);
          
          this.applyAdvancedStyleEffect(ctx, styleId);
          
          onProgress?.(95);
          
          // Get result
          const result = canvas.toDataURL('image/jpeg', 0.95);
          
          onProgress?.(100);
          resolve(result);
        }, 100);
      };

      img.onerror = () => {
        clearInterval(progressInterval);
        resolve(''); // 빈 결과 반환
      };

      img.src = URL.createObjectURL(imageFile);
      onProgress?.(10);
    });
  }

  // Advanced style effects using Canvas API
  private applyAdvancedStyleEffect(ctx: CanvasRenderingContext2D, styleId: string) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Save original image
    const originalImageData = ctx.getImageData(0, 0, width, height);
    
    switch (styleId) {
      case 'vangogh-postimpressionism':
        this.applyVanGoghEffect(ctx, originalImageData);
        break;
      case 'monet-impressionism':
        this.applyMonetEffect(ctx, originalImageData);
        break;
      case 'picasso-cubism':
        this.applyPicassoEffect(ctx, originalImageData);
        break;
      case 'warhol-popart':
        this.applyWarholEffect(ctx, originalImageData);
        break;
      case 'klimt-artnouveau':
        this.applyKlimtEffect(ctx, originalImageData);
        break;
      case 'anime-style':
        this.applyAnimeEffect(ctx, originalImageData);
        break;
      case 'cyberpunk-digital':
        this.applyCyberpunkEffect(ctx, originalImageData);
        break;
      default:
        this.applyArtisticFilter(ctx, originalImageData);
    }
  }

  private applyVanGoghEffect(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Create swirl effect
    ctx.putImageData(imageData, 0, 0);
    
    // Apply multiple layers with different blend modes
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.3;
      
      // Create brush strokes
      for (let y = 0; y < height; y += 15) {
        for (let x = 0; x < width; x += 15) {
          const angle = Math.atan2(y - height/2, x - width/2);
          const length = 20 + Math.random() * 20;
          
          ctx.strokeStyle = this.getPixelColor(imageData, x, y);
          ctx.lineWidth = 3 + Math.random() * 5;
          ctx.lineCap = 'round';
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x + Math.cos(angle + Math.random() - 0.5) * length,
            y + Math.sin(angle + Math.random() - 0.5) * length
          );
          ctx.stroke();
        }
      }
      
      ctx.restore();
    }
    
    // Final color adjustment
    ctx.filter = 'contrast(1.4) saturate(1.8) brightness(1.1)';
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.filter = 'none';
  }

  private applyMonetEffect(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Apply gaussian blur for impressionist effect
    ctx.putImageData(imageData, 0, 0);
    ctx.filter = 'blur(3px)';
    ctx.drawImage(ctx.canvas, 0, 0);
    
    // Add dabs of color
    ctx.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 5 + Math.random() * 15;
      
      const color = this.getPixelColor(imageData, Math.floor(x), Math.floor(y));
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'brightness(1.2) saturate(1.3)';
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.filter = 'none';
  }

  private applyPicassoEffect(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Create geometric fragments
    const fragments = 30;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.putImageData(imageData, 0, 0);
    
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < fragments; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      const sw = 50 + Math.random() * 200;
      const sh = 50 + Math.random() * 200;
      
      const dx = Math.random() * width - sw/2;
      const dy = Math.random() * height - sh/2;
      
      ctx.save();
      ctx.translate(dx + sw/2, dy + sh/2);
      ctx.rotate((Math.random() - 0.5) * 0.5);
      ctx.scale(0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.4);
      
      // Draw triangular or rectangular fragment
      if (Math.random() > 0.5) {
        ctx.beginPath();
        ctx.moveTo(-sw/2, -sh/2);
        ctx.lineTo(sw/2, -sh/2);
        ctx.lineTo(0, sh/2);
        ctx.closePath();
        ctx.clip();
      }
      
      ctx.drawImage(tempCanvas, sx, sy, sw, sh, -sw/2, -sh/2, sw, sh);
      ctx.restore();
    }
    
    // Apply color shifts
    ctx.filter = 'contrast(1.5) saturate(1.4) hue-rotate(10deg)';
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.filter = 'none';
  }

  private applyWarholEffect(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Create pop art grid
    const gridSize = 2;
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;
    
    const colors = [
      { filter: 'hue-rotate(0deg) saturate(2) contrast(1.5)' },
      { filter: 'hue-rotate(90deg) saturate(2) contrast(1.5)' },
      { filter: 'hue-rotate(180deg) saturate(2) contrast(1.5)' },
      { filter: 'hue-rotate(270deg) saturate(2) contrast(1.5)' }
    ];
    
    ctx.putImageData(imageData, 0, 0);
    const originalCanvas = document.createElement('canvas');
    const originalCtx = originalCanvas.getContext('2d')!;
    originalCanvas.width = width;
    originalCanvas.height = height;
    originalCtx.drawImage(ctx.canvas, 0, 0);
    
    ctx.clearRect(0, 0, width, height);
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const index = row * gridSize + col;
        const x = col * cellWidth;
        const y = row * cellHeight;
        
        ctx.save();
        ctx.filter = colors[index % colors.length].filter;
        ctx.drawImage(originalCanvas, 0, 0, width, height, x, y, cellWidth, cellHeight);
        ctx.restore();
      }
    }
  }

  private applyKlimtEffect(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    ctx.putImageData(imageData, 0, 0);
    
    // Add golden overlay
    ctx.globalCompositeOperation = 'overlay';
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 193, 37, 0.2)');
    gradient.addColorStop(1, 'rgba(184, 134, 11, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add decorative patterns
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 10 + Math.random() * 30;
      
      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.filter = 'contrast(1.2) saturate(1.4) brightness(1.1)';
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.filter = 'none';
  }

  private applyAnimeEffect(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    const data = imageData.data;
    
    // Posterize colors for cel-shading effect
    const levels = 8;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.round(data[i] / (256 / levels)) * (256 / levels);
      data[i + 1] = Math.round(data[i + 1] / (256 / levels)) * (256 / levels);
      data[i + 2] = Math.round(data[i + 2] / (256 / levels)) * (256 / levels);
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Enhance edges
    ctx.filter = 'contrast(1.8) saturate(2) brightness(1.2)';
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.filter = 'none';
    
    // Add soft glow
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.1;
    ctx.filter = 'blur(20px)';
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  private applyCyberpunkEffect(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    ctx.putImageData(imageData, 0, 0);
    
    // Apply neon colors
    ctx.filter = 'contrast(1.5) saturate(2) hue-rotate(180deg)';
    ctx.drawImage(ctx.canvas, 0, 0);
    
    // Add scan lines
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.1;
    for (let y = 0; y < ctx.canvas.height; y += 4) {
      ctx.fillStyle = y % 8 === 0 ? 'cyan' : 'magenta';
      ctx.fillRect(0, y, ctx.canvas.width, 2);
    }
    
    // Add glow effect
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.2;
    ctx.filter = 'blur(10px)';
    ctx.drawImage(ctx.canvas, 0, 0);
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
  }

  private applyArtisticFilter(ctx: CanvasRenderingContext2D, imageData: ImageData) {
    ctx.putImageData(imageData, 0, 0);
    ctx.filter = 'contrast(1.3) saturate(1.5) brightness(1.1) sepia(0.1)';
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.filter = 'none';
  }

  // Helper methods
  private getPixelColor(imageData: ImageData, x: number, y: number): string {
    const index = (y * imageData.width + x) * 4;
    const r = imageData.data[index];
    const g = imageData.data[index + 1];
    const b = imageData.data[index + 2];
    return `rgb(${r}, ${g}, ${b})`;
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Return full data URL including header (data:image/jpeg;base64,...)
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private getPromptForStyle(styleId: string): string {
    const prompts: Record<string, string> = {
      'vangogh-postimpressionism': 'Van Gogh painting style, swirling brushstrokes, thick paint texture, keep original composition and pose',
      'monet-impressionism': 'Monet impressionist style, soft brushwork, light and shadow, maintain original subject and layout',
      'picasso-cubism': 'Picasso cubist style, geometric shapes, angular forms, preserve original figure and pose',
      'warhol-popart': 'Andy Warhol pop art style, bright colors, high contrast, keep original portrait composition',
      'klimt-artnouveau': 'Gustav Klimt art nouveau style, golden patterns, decorative elements, maintain original pose and figure',
      'anime-style': 'Anime art style, cel shading, clean lines, preserve original facial features and pose',
      'cyberpunk-digital': 'Cyberpunk style, neon lighting effects, futuristic colors, keep original composition',
      'pixelart-digital': 'Pixel art style, 16-bit aesthetic, pixelated effect, maintain original figure'
    };
    
    return prompts[styleId] || 'Apply artistic style while keeping original composition and pose';
  }

  private getNegativePromptForStyle(styleId: string): string {
    const negativePrompts: Record<string, string> = {
      'vangogh-postimpressionism': 'different person, different pose, different composition, new scene, different background, extra people',
      'monet-impressionism': 'different person, different pose, different composition, new scene, different background, extra people',
      'picasso-cubism': 'different person, different pose, different composition, new scene, different background, extra people',
      'warhol-popart': 'different person, different pose, different composition, new scene, different background, extra people',
      'klimt-artnouveau': 'different person, different pose, different composition, new scene, different background, extra people',
      'anime-style': 'different person, different pose, different composition, new scene, different background, extra people',
      'cyberpunk-digital': 'different person, different pose, different composition, new scene, different background, extra people',
      'pixelart-digital': 'different person, different pose, different composition, new scene, different background, extra people'
    };
    
    return negativePrompts[styleId] || 'different person, different pose, different composition, new scene, low quality';
  }

  private getStabilityStylePreset(styleId: string): string {
    const presets: Record<string, string> = {
      'vangogh-postimpressionism': 'enhance',
      'monet-impressionism': 'photographic',
      'picasso-cubism': 'digital-art',
      'warhol-popart': 'comic-book',
      'klimt-artnouveau': 'fantasy-art',
      'anime-style': 'anime',
      'cyberpunk-digital': 'neon-punk',
      'pixelart-digital': 'pixel-art'
    };
    
    return presets[styleId] || 'enhance';
  }

  // Replicate 모델 설정 - 스타일별 최적 모델 선택
  private getReplicateModelForStyle(styleId: string): any {
    const models = {
      // SDXL-Lightning - 빠르고 품질 좋은 일반 스타일 변환
      'default': {
        name: 'SDXL-Lightning Image-to-Image',
        version: '527d2a6296facb8e47ba1eaf17f142c240c19a30894f437feee9b91cc29d8e4f',
        supportNegativePrompt: true,
        baseInput: {
          num_inference_steps: 8,
          guidance_scale: 7.5,
          strength: 0.65, // 명확한 스타일 변환
          scheduler: 'K_EULER'
        }
      },
      
      // 예술적 스타일
      'vangogh-postimpressionism': {
        name: 'Stable Diffusion Img2Img',
        version: '15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d',
        supportNegativePrompt: true,
        baseInput: {
          num_inference_steps: 50,
          guidance_scale: 12,
          prompt_strength: 0.75, // 강한 반 고흐 스타일 적용
          scheduler: 'DPMSolverMultistep'
        }
      },
      
      'monet-impressionism': {
        name: 'SDXL Img2Img',
        version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        supportNegativePrompt: true,
        baseInput: {
          num_inference_steps: 40,
          guidance_scale: 10,
          strength: 0.6, // 인상주의 붓터치 명확히
          refine: 'expert_ensemble_refiner'
        }
      },
      
      'picasso-cubism': {
        name: 'ControlNet SDXL',
        version: 'f9b9e5bdd896922a8ef17377801e93c9867216b40f95bbc12eff20e20265d665',
        supportNegativePrompt: true,
        baseInput: {
          num_inference_steps: 50,
          guidance_scale: 11,
          controlnet_conditioning_scale: 0.7,
          strength: 0.7 // 큐비즘 특징 강화
        }
      },
      
      'warhol-popart': {
        name: 'SDXL-Lightning Fast',
        version: '527d2a6296facb8e47ba1eaf17f142c240c19a30894f437feee9b91cc29d8e4f',
        supportNegativePrompt: true,
        baseInput: {
          num_inference_steps: 8,
          guidance_scale: 9,
          strength: 0.65, // 팝아트 대비 강화
          scheduler: 'K_EULER'
        }
      },
      
      'klimt-artnouveau': {
        name: 'Stable Diffusion XL',
        version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        supportNegativePrompt: true,
        baseInput: {
          num_inference_steps: 60,
          guidance_scale: 11,
          strength: 0.65, // 황금빛 장식 패턴 강화
          refine: 'expert_ensemble_refiner',
          high_noise_frac: 0.8
        }
      },
      
      // 디지털 아트 스타일
      'anime-style': {
        name: 'Anything V5 (Anime)',
        version: '42a996d39a96aedc57b2e0aa8105dea39c9c89d9d266caf6bb4327a1c191b061',
        supportNegativePrompt: true,
        baseInput: {
          num_inference_steps: 35,
          guidance_scale: 10,
          strength: 0.55, // 명확한 애니메이션 스타일
          scheduler: 'K_EULER_ANCESTRAL'
        }
      },
      
      'cyberpunk-digital': {
        name: 'SDXL CyberRealistic',
        version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        supportNegativePrompt: true,
        baseInput: {
          num_inference_steps: 40,
          guidance_scale: 12,
          strength: 0.6, // 강한 사이버펑크 분위기
          refine: 'expert_ensemble_refiner'
        }
      },
      
      'pixelart-digital': {
        name: 'Pixel Art Style',
        version: '527d2a6296facb8e47ba1eaf17f142c240c19a30894f437feee9b91cc29d8e4f',
        supportNegativePrompt: true,
        baseInput: {
          num_inference_steps: 12,
          guidance_scale: 8,
          strength: 0.7, // 명확한 픽셀아트 변환
          scheduler: 'K_EULER'
        }
      }
    };
    
    return models[styleId] || models['default'];
  }
}

// Export singleton instance
export const aiArtService = AIArtService.getInstance();