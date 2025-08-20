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
  
  private constructor() {}
  
  static getInstance(): AIArtService {
    if (!AIArtService.instance) {
      AIArtService.instance = new AIArtService();
    }
    return AIArtService.instance;
  }

  // Main generation method that tries multiple services
  async generateArt(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    onProgress?.(5);
    
    // Try different AI services in order of preference
    const services = [
      () => this.generateWithStabilityAI(imageFile, styleId, onProgress),
      () => this.generateWithHuggingFace(imageFile, styleId, onProgress),
      () => this.generateWithReplicateAI(imageFile, styleId, onProgress),
      () => this.generateWithEnhancedCanvas(imageFile, styleId, onProgress)
    ];
    
    for (const service of services) {
      try {
        const result = await service();
        if (result) {
          return result;
        }
      } catch (error) {
        console.warn('Service failed, trying next:', error);
      }
    }
    
    // If all services fail, use the enhanced canvas fallback
    return this.generateWithEnhancedCanvas(imageFile, styleId, onProgress);
  }

  // Stability AI (Stable Diffusion) - High Quality
  private async generateWithStabilityAI(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_STABILITY_API_KEY;
    if (!apiKey) {
      throw new Error('Stability AI API key not configured');
    }

    onProgress?.(10);
    
    const formData = new FormData();
    formData.append('init_image', imageFile);
    formData.append('text_prompts[0][text]', this.getPromptForStyle(styleId));
    formData.append('text_prompts[0][weight]', '1');
    formData.append('text_prompts[1][text]', this.getNegativePromptForStyle(styleId));
    formData.append('text_prompts[1][weight]', '-1');
    formData.append('cfg_scale', '7');
    formData.append('samples', '1');
    formData.append('steps', '30');
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

  // Hugging Face with better error handling
  private async generateWithHuggingFace(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
    if (!apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

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

  // Replicate AI - Alternative service
  private async generateWithReplicateAI(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_REPLICATE_API_KEY;
    if (!apiKey) {
      throw new Error('Replicate API key not configured');
    }

    onProgress?.(10);
    
    const base64 = await this.fileToBase64(imageFile);
    const dataUrl = `data:${imageFile.type};base64,${base64}`;
    
    onProgress?.(20);
    
    // Start prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: '435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117', // instruct-pix2pix
        input: {
          image: dataUrl,
          prompt: this.getPromptForStyle(styleId),
          negative_prompt: this.getNegativePromptForStyle(styleId),
          num_inference_steps: 30,
          guidance_scale: 7.5,
          image_guidance_scale: 1.5
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

      img.onload = () => {
        canvas.width = 1024;
        canvas.height = 1024;
        
        onProgress?.(20);
        
        // Draw and apply advanced filters
        ctx.drawImage(img, 0, 0, 1024, 1024);
        
        onProgress?.(40);
        
        // Apply style-specific transformations
        this.applyAdvancedStyleEffect(ctx, styleId);
        
        onProgress?.(80);
        
        // Get result
        const result = canvas.toDataURL('image/jpeg', 0.95);
        
        onProgress?.(100);
        resolve(result);
      };

      img.src = URL.createObjectURL(imageFile);
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
        const base64 = result.split(',')[1];
        resolve(base64);
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
      'vangogh-postimpressionism': 'Transform into Van Gogh style painting with swirling brushstrokes, vibrant yellows and blues, thick impasto texture, post-impressionist masterpiece',
      'monet-impressionism': 'Transform into Claude Monet impressionist painting, soft brushstrokes, water lilies style, natural lighting, beautiful color harmony',
      'picasso-cubism': 'Transform into Pablo Picasso cubist painting, geometric fragmentation, multiple perspectives, bold angular shapes, abstract forms',
      'warhol-popart': 'Transform into Andy Warhol pop art style, bright vivid colors, screen printing effect, commercial art aesthetic, bold contrast',
      'klimt-artnouveau': 'Transform into Gustav Klimt art nouveau style, golden decorative patterns, ornamental elements, byzantine influence',
      'anime-style': 'Transform into beautiful anime art style, cel-shading, vibrant colors, studio ghibli quality, detailed character design',
      'cyberpunk-digital': 'Transform into cyberpunk digital art, neon colors, futuristic aesthetic, holographic effects, blade runner style',
      'pixelart-digital': 'Transform into 16-bit pixel art style, retro gaming aesthetic, crisp pixels, limited color palette'
    };
    
    return prompts[styleId] || 'Transform into artistic painting with enhanced colors and creative style';
  }

  private getNegativePromptForStyle(styleId: string): string {
    const negativePrompts: Record<string, string> = {
      'vangogh-postimpressionism': 'photographic, smooth, digital, modern, minimalist',
      'monet-impressionism': 'sharp edges, digital art, photography, geometric',
      'picasso-cubism': 'realistic, photographic, smooth, traditional',
      'warhol-popart': 'muted colors, traditional painting, realistic, dark',
      'klimt-artnouveau': 'modern, minimalist, plain, simple',
      'anime-style': 'realistic, photographic, western style, 3D render',
      'cyberpunk-digital': 'vintage, classical, natural, traditional',
      'pixelart-digital': 'smooth, high resolution, photorealistic, blurry'
    };
    
    return negativePrompts[styleId] || 'low quality, blurry, distorted, amateur';
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
}

// Export singleton instance
export const aiArtService = AIArtService.getInstance();