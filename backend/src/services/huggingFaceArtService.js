const axios = require('axios');
const sharp = require('sharp');
const FormData = require('form-data');
const logger = require('../utils/logger');

class HuggingFaceArtService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    
    // 스타일별 최적 모델과 프롬프트
    this.artStyles = {
      'vangogh-postimpressionism': {
        model: 'runwayml/stable-diffusion-v1-5',
        prompt: 'oil painting in the style of Vincent van Gogh, swirling brushstrokes, vibrant colors, expressive texture, post-impressionist masterpiece',
        negativePrompt: 'photograph, realistic, modern, digital art, cartoon, anime',
        strength: 0.75
      },
      'picasso-cubism': {
        model: 'runwayml/stable-diffusion-v1-5', 
        prompt: 'cubist painting in the style of Pablo Picasso, geometric shapes, fragmented forms, multiple perspectives, angular faces, abstract portrait',
        negativePrompt: 'realistic, photograph, smooth, detailed, photorealistic',
        strength: 0.8
      },
      'monet-impressionism': {
        model: 'runwayml/stable-diffusion-v1-5',
        prompt: 'impressionist painting in the style of Claude Monet, soft brushstrokes, pastel colors, light and shadow, dreamy atmosphere, plein air',
        negativePrompt: 'sharp, detailed, realistic, photograph, digital',
        strength: 0.7
      },
      'warhol-popart': {
        model: 'runwayml/stable-diffusion-v1-5',
        prompt: 'pop art in the style of Andy Warhol, bright bold colors, high contrast, screen print effect, commercial art style, repetitive patterns',
        negativePrompt: 'subtle, muted, realistic, photograph, classical',
        strength: 0.75
      },
      'klimt-artnouveau': {
        model: 'runwayml/stable-diffusion-v1-5',
        prompt: 'art nouveau painting in the style of Gustav Klimt, gold leaf patterns, decorative motifs, ornate details, byzantine influence, symbolist',
        negativePrompt: 'simple, minimal, modern, photograph, realistic',
        strength: 0.8
      },
      'ghibli-anime': {
        model: 'runwayml/stable-diffusion-v1-5',
        prompt: 'Studio Ghibli anime style, soft watercolor painting, gentle facial features, magical atmosphere, Miyazaki style character design',
        negativePrompt: 'realistic, photograph, western cartoon, 3d render',
        strength: 0.85
      },
      'korean-webtoon': {
        model: 'runwayml/stable-diffusion-v1-5',
        prompt: 'Korean webtoon style, clean digital art, soft shading, beautiful character design, manhwa illustration, K-beauty aesthetic',
        negativePrompt: 'realistic, photograph, western style, rough sketch',
        strength: 0.8
      },
      'pixel-art': {
        model: 'runwayml/stable-diffusion-v1-5',
        prompt: '8-bit pixel art style, retro video game character, limited color palette, blocky design, nostalgic gaming aesthetic',
        negativePrompt: 'smooth, high resolution, realistic, photograph',
        strength: 0.9
      }
    };
  }

  /**
   * 이미지를 base64에서 처리 가능한 형태로 변환
   */
  async processInputImage(base64Image) {
    try {
      // base64 데이터에서 실제 이미지 데이터 추출
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // 512x512로 리사이즈 (Stable Diffusion 최적 크기)
      const processedBuffer = await sharp(imageBuffer)
        .resize(512, 512, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      return processedBuffer;
    } catch (error) {
      logger.error('Error processing input image:', error);
      throw new Error('Failed to process input image');
    }
  }

  /**
   * Hugging Face API로 이미지 변환 요청
   */
  async generateArtProfile(imageBuffer, styleId) {
    try {
      const style = this.artStyles[styleId];
      if (!style) {
        throw new Error(`Unsupported style: ${styleId}`);
      }

      const modelUrl = `${this.baseUrl}/${style.model}`;
      
      // img2img를 위한 프롬프트 구성
      const fullPrompt = `${style.prompt}, portrait, high quality, detailed face`;
      
      // FormData로 이미지와 파라미터 전송
      const formData = new FormData();
      formData.append('inputs', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });
      
      // API 요청
      const response = await axios.post(modelUrl, formData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
          ...formData.getHeaders()
        },
        params: {
          // img2img 파라미터
          prompt: fullPrompt,
          negative_prompt: style.negativePrompt,
          strength: style.strength,
          guidance_scale: 7.5,
          num_inference_steps: 30
        },
        responseType: 'arraybuffer',
        timeout: 60000 // 60초 타임아웃
      });

      // 응답이 이미지인지 확인
      if (response.headers['content-type']?.includes('image')) {
        return Buffer.from(response.data);
      } else {
        // 에러 응답 처리
        const errorText = Buffer.from(response.data).toString();
        logger.error('HuggingFace API Error:', errorText);
        throw new Error('Failed to generate image: API returned non-image response');
      }

    } catch (error) {
      logger.error('Error calling HuggingFace API:', error);
      
      if (error.response?.status === 503) {
        throw new Error('AI model is currently loading. Please try again in a few minutes.');
      } else if (error.response?.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your Hugging Face configuration.');
      }
      
      throw new Error(error.message || 'Failed to generate art profile');
    }
  }

  /**
   * 대체 방법: Text-to-Image with 얼굴 설명
   */
  async generateWithDescription(faceDescription, styleId) {
    try {
      const style = this.artStyles[styleId];
      if (!style) {
        throw new Error(`Unsupported style: ${styleId}`);
      }

      const modelUrl = `${this.baseUrl}/${style.model}`;
      
      // 얼굴 특징을 포함한 프롬프트 생성
      const fullPrompt = `${style.prompt}, ${faceDescription}, portrait, masterpiece, high quality`;
      
      const response = await axios.post(modelUrl, {
        inputs: fullPrompt,
        parameters: {
          negative_prompt: style.negativePrompt,
          guidance_scale: 7.5,
          num_inference_steps: 30,
          width: 512,
          height: 512
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 60000
      });

      if (response.headers['content-type']?.includes('image')) {
        return Buffer.from(response.data);
      } else {
        throw new Error('Failed to generate image');
      }

    } catch (error) {
      logger.error('Error generating with description:', error);
      throw error;
    }
  }

  /**
   * 사용 가능한 아트 스타일 목록 반환
   */
  getAvailableStyles() {
    return Object.keys(this.artStyles).map(styleId => ({
      id: styleId,
      name: this.getStyleDisplayName(styleId),
      description: this.getStyleDescription(styleId),
      example: `/samples/preview-${styleId.split('-')[0]}.png`
    }));
  }

  /**
   * 스타일 표시명 반환
   */
  getStyleDisplayName(styleId) {
    const displayNames = {
      'vangogh-postimpressionism': 'Van Gogh Style',
      'picasso-cubism': 'Picasso Cubism',
      'monet-impressionism': 'Monet Impressionism',
      'warhol-popart': 'Warhol Pop Art',
      'klimt-artnouveau': 'Klimt Art Nouveau',
      'ghibli-anime': 'Studio Ghibli',
      'korean-webtoon': 'Korean Webtoon',
      'pixel-art': 'Pixel Art'
    };
    return displayNames[styleId] || styleId;
  }

  /**
   * 스타일 설명 반환
   */
  getStyleDescription(styleId) {
    const descriptions = {
      'vangogh-postimpressionism': '소용돌이치는 붓터치와 강렬한 색채의 고흐 스타일',
      'picasso-cubism': '기하학적 형태와 다면적 시각의 피카소 큐비즘',
      'monet-impressionism': '부드러운 빛과 색채의 모네 인상주의',
      'warhol-popart': '대담한 색상과 대중적 이미지의 워홀 팝아트',
      'klimt-artnouveau': '황금빛 장식과 화려한 패턴의 클림트 아르누보',
      'ghibli-anime': '따뜻하고 마법적인 지브리 애니메이션 스타일',
      'korean-webtoon': '깔끔하고 아름다운 한국 웹툰 스타일',
      'pixel-art': '레트로 게임의 8비트 픽셀 아트 스타일'
    };
    return descriptions[styleId] || 'Artistic transformation';
  }

  /**
   * API 상태 확인
   */
  async checkApiStatus() {
    try {
      const response = await axios.get(`${this.baseUrl}/runwayml/stable-diffusion-v1-5`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 10000
      });
      return { status: 'available', model: 'stable-diffusion-v1-5' };
    } catch (error) {
      logger.error('API status check failed:', error);
      return { 
        status: 'unavailable', 
        error: error.response?.status === 401 ? 'Invalid API key' : 'Service unavailable' 
      };
    }
  }
}

module.exports = new HuggingFaceArtService();