// OpenAI DALL-E Art Generation Service
// High-quality AI art generation using OpenAI's DALL-E

import OpenAI from 'openai';

export class OpenAIArtService {
  private openai: OpenAI | null = null;
  
  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // For client-side usage
      });
    }
  }

  async generateArt(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file');
    }

    onProgress?.(10);

    try {
      // First, convert the image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      onProgress?.(20);

      // Get the style prompt
      const stylePrompt = this.getStylePrompt(styleId);
      
      // Create the prompt for DALL-E
      const prompt = `Transform this image into ${stylePrompt}. Maintain the general composition and subject matter but apply the artistic style completely. High quality, masterpiece level artwork.`;

      onProgress?.(30);

      // Use DALL-E 3 for best quality
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
        response_format: "b64_json"
      });

      onProgress?.(80);

      if (!response.data[0].b64_json) {
        throw new Error('No image generated');
      }

      // Convert base64 to data URL
      const dataUrl = `data:image/png;base64,${response.data[0].b64_json}`;
      
      onProgress?.(100);
      
      return dataUrl;
    } catch (error) {
      console.error('OpenAI DALL-E error:', error);
      
      // If DALL-E fails, try image edit endpoint
      return this.editWithGPT4Vision(imageFile, styleId, onProgress);
    }
  }

  // Alternative: Use GPT-4 Vision for style transformation description
  private async editWithGPT4Vision(
    imageFile: File,
    styleId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API not initialized');
    }

    try {
      onProgress?.(40);
      
      const base64Image = await this.fileToBase64WithDataUrl(imageFile);
      const stylePrompt = this.getStylePrompt(styleId);
      
      // First, analyze the image with GPT-4 Vision
      const visionResponse = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Describe this image in detail for recreation in ${stylePrompt} style. Focus on composition, subjects, colors, and mood.`
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });

      onProgress?.(60);

      const imageDescription = visionResponse.choices[0].message.content;
      
      // Generate new image based on the description
      const enhancedPrompt = `${imageDescription}\n\nRecreate this scene in ${stylePrompt} style. Masterpiece quality, highly detailed, museum-worthy artwork.`;
      
      const dalleResponse = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
        response_format: "b64_json"
      });

      onProgress?.(90);

      if (!dalleResponse.data[0].b64_json) {
        throw new Error('No image generated');
      }

      const dataUrl = `data:image/png;base64,${dalleResponse.data[0].b64_json}`;
      
      onProgress?.(100);
      
      return dataUrl;
    } catch (error) {
      console.error('GPT-4 Vision + DALL-E error:', error);
      throw error;
    }
  }

  private getStylePrompt(styleId: string): string {
    const styles: Record<string, string> = {
      'vangogh-postimpressionism': 'Vincent van Gogh post-impressionist style with bold swirling brushstrokes, vibrant yellows and blues, thick impasto texture, emotional intensity, starry night aesthetic',
      'monet-impressionism': 'Claude Monet impressionist painting with soft brushstrokes, delicate light effects, water lily pond aesthetic, pastel colors, atmospheric perspective, plein air feeling',
      'picasso-cubism': 'Pablo Picasso cubist style with geometric fragmentation, multiple simultaneous perspectives, angular forms, bold colors, abstract deconstruction, analytical cubism',
      'warhol-popart': 'Andy Warhol pop art style with bright vivid colors, screen printing effect, commercial art aesthetic, bold contrast, repetitive patterns, celebrity portrait style',
      'klimt-artnouveau': 'Gustav Klimt art nouveau style with golden decorative patterns, ornamental elements, byzantine mosaics influence, sensual elegance, symbolic imagery',
      'anime-style': 'high-quality anime art style with vibrant colors, cel-shading, detailed character design, Studio Ghibli quality, beautiful backgrounds, emotional expression',
      'cyberpunk-digital': 'cyberpunk digital art with neon colors, futuristic cityscape, holographic effects, dystopian atmosphere, blade runner aesthetic, high-tech low-life',
      'pixelart-digital': 'pixel art style with 16-bit aesthetic, retro gaming feel, limited color palette, crisp pixel definition, nostalgic video game art',
      'rembrandt-baroque': 'Rembrandt baroque style with dramatic chiaroscuro lighting, rich earth tones, psychological depth, masterful brushwork, Dutch Golden Age painting',
      'dali-surrealism': 'Salvador Dali surrealist style with melting objects, dreamlike imagery, precise technique, bizarre juxtapositions, subconscious symbolism',
      'hokusai-ukiyoe': 'Katsushika Hokusai ukiyo-e style with Japanese woodblock print aesthetic, wave patterns, Mount Fuji elements, bold outlines, traditional Japanese art',
      'rothko-abstract': 'Mark Rothko abstract expressionist style with color field painting, emotional color blocks, soft edges, meditative quality, spiritual depth'
    };
    
    return styles[styleId] || 'artistic masterpiece painting with enhanced colors and creative interpretation';
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
}

// Export singleton instance
export const openAIArtService = new OpenAIArtService();