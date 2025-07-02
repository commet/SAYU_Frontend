// Image Optimization Service for Museum Artworks
// Handles caching, resizing, and format optimization

import { Artwork } from './api-client';

export interface OptimizedImage {
  original: string;
  large: string;     // 1200px wide
  medium: string;    // 800px wide
  small: string;     // 400px wide
  thumbnail: string; // 200px wide
  placeholder: string; // base64 LQIP
}

export class ImageOptimizationService {
  private cache: Map<string, OptimizedImage> = new Map();
  private placeholderCache: Map<string, string> = new Map();
  
  // Get optimized image URLs
  async getOptimizedImages(artwork: Artwork): Promise<OptimizedImage> {
    // Check cache first
    if (this.cache.has(artwork.id)) {
      return this.cache.get(artwork.id)!;
    }
    
    // Generate optimized URLs based on museum source
    const optimized = this.generateOptimizedUrls(artwork);
    
    // Generate placeholder
    optimized.placeholder = await this.generatePlaceholder(
      artwork.thumbnailUrl || artwork.imageUrl
    );
    
    // Cache result
    this.cache.set(artwork.id, optimized);
    
    return optimized;
  }
  
  // Generate optimized URLs based on museum API capabilities
  private generateOptimizedUrls(artwork: Artwork): OptimizedImage {
    const baseOptimized: OptimizedImage = {
      original: artwork.imageUrl,
      large: artwork.imageUrl,
      medium: artwork.imageUrl,
      small: artwork.thumbnailUrl || artwork.imageUrl,
      thumbnail: artwork.thumbnailUrl || artwork.imageUrl,
      placeholder: ''
    };
    
    // Museum-specific optimizations
    if (artwork.sourceMuseum === 'Art Institute of Chicago') {
      // Chicago Art Institute supports IIIF image API
      const imageId = this.extractChicagoImageId(artwork.imageUrl);
      if (imageId) {
        baseOptimized.large = `https://www.artic.edu/iiif/2/${imageId}/full/1200,/0/default.jpg`;
        baseOptimized.medium = `https://www.artic.edu/iiif/2/${imageId}/full/800,/0/default.jpg`;
        baseOptimized.small = `https://www.artic.edu/iiif/2/${imageId}/full/400,/0/default.jpg`;
        baseOptimized.thumbnail = `https://www.artic.edu/iiif/2/${imageId}/full/200,/0/default.jpg`;
      }
    } else if (artwork.sourceMuseum === 'Rijksmuseum') {
      // Rijksmuseum supports size parameters
      const baseUrl = artwork.imageUrl.split('=')[0];
      if (baseUrl) {
        baseOptimized.large = `${baseUrl}=s1200`;
        baseOptimized.medium = `${baseUrl}=s800`;
        baseOptimized.small = `${baseUrl}=s400`;
        baseOptimized.thumbnail = `${baseUrl}=s200`;
      }
    }
    // Met Museum images are already optimized with primaryImage and primaryImageSmall
    
    return baseOptimized;
  }
  
  // Extract Chicago image ID from URL
  private extractChicagoImageId(url: string): string | null {
    const match = url.match(/\/iiif\/2\/([^\/]+)\//);
    return match ? match[1] : null;
  }
  
  // Generate low-quality image placeholder (LQIP)
  private async generatePlaceholder(imageUrl: string): Promise<string> {
    // Check cache
    if (this.placeholderCache.has(imageUrl)) {
      return this.placeholderCache.get(imageUrl)!;
    }
    
    try {
      // For client-side, we'll use a simple gradient based on image analysis
      // In production, this would be done server-side with proper image processing
      const placeholder = await this.createGradientPlaceholder(imageUrl);
      this.placeholderCache.set(imageUrl, placeholder);
      return placeholder;
    } catch (error) {
      // Fallback to default gradient
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }
  
  // Create gradient placeholder based on image
  private async createGradientPlaceholder(imageUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
            return;
          }
          
          // Sample image at very low resolution
          canvas.width = 10;
          canvas.height = 10;
          ctx.drawImage(img, 0, 0, 10, 10);
          
          // Get dominant colors
          const imageData = ctx.getImageData(0, 0, 10, 10);
          const colors = this.extractDominantColors(imageData);
          
          // Create gradient
          const gradient = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
          resolve(gradient);
        } catch (error) {
          resolve('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
        }
      };
      
      img.onerror = () => {
        resolve('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
      };
      
      img.src = imageUrl;
    });
  }
  
  // Extract dominant colors from image data
  private extractDominantColors(imageData: ImageData): string[] {
    const data = imageData.data;
    const colorCounts: { [key: string]: number } = {};
    
    // Sample colors
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.round(data[i] / 51) * 51;
      const g = Math.round(data[i + 1] / 51) * 51;
      const b = Math.round(data[i + 2] / 51) * 51;
      const rgb = `rgb(${r},${g},${b})`;
      colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
    }
    
    // Sort by frequency
    const sortedColors = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([color]) => color);
    
    // Return top 2 colors
    return [
      sortedColors[0] || 'rgb(102,126,234)',
      sortedColors[1] || 'rgb(118,75,162)'
    ];
  }
  
  // Preload images for better performance
  async preloadImages(artworks: Artwork[]): Promise<void> {
    const promises = artworks.map(async (artwork) => {
      const optimized = await this.getOptimizedImages(artwork);
      
      // Preload thumbnail and small versions
      const preloadPromises = [
        this.preloadImage(optimized.thumbnail),
        this.preloadImage(optimized.small)
      ];
      
      return Promise.all(preloadPromises);
    });
    
    await Promise.all(promises);
  }
  
  // Preload single image
  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  }
  
  // Get responsive image srcset
  getResponsiveSrcSet(optimized: OptimizedImage): string {
    return `
      ${optimized.thumbnail} 200w,
      ${optimized.small} 400w,
      ${optimized.medium} 800w,
      ${optimized.large} 1200w
    `.trim();
  }
  
  // Get sizes attribute for responsive images
  getResponsiveSizes(): string {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  }
  
  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.placeholderCache.clear();
  }
}