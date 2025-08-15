const sharp = require('sharp');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');
const { hybridDB } = require('../config/hybridDatabase');

/**
 * 무료 AI 대안 서비스 - 실제 작동하는 Canvas 기반 효과
 */
class FreeArtService {
  constructor() {
    // Cloudinary 설정
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // 스타일별 이미지 변환 설정
    this.artStyles = {
      'monet-impressionism': {
        name: 'Monet Impressionism',
        cloudinaryTransform: 'e_art:incognito,e_blur:300,e_saturation:20,e_vibrance:30',
        description: '부드러운 인상주의 효과'
      },
      'vangogh-postimpressionism': {
        name: 'Van Gogh Style',
        cloudinaryTransform: 'e_art:sizzle,e_saturation:30,e_contrast:20,e_sharpen:100',
        description: '강렬한 후기인상주의 효과'
      },
      'picasso-cubism': {
        name: 'Picasso Cubism',
        cloudinaryTransform: 'e_art:primavera,e_pixelate:10,e_contrast:30',
        description: '기하학적 큐비즘 효과'
      },
      'warhol-popart': {
        name: 'Warhol Pop Art',
        cloudinaryTransform: 'e_art:sizzle,e_saturation:50,e_contrast:40,e_colorize:60',
        description: '대담한 팝아트 효과'
      },
      'klimt-artnouveau': {
        name: 'Klimt Art Nouveau',
        cloudinaryTransform: 'e_art:peacock,e_sepia:80,e_saturation:30',
        description: '황금빛 아르누보 효과'
      },
      'ghibli-anime': {
        name: 'Studio Ghibli',
        cloudinaryTransform: 'e_art:incognito,e_blur:200,e_saturation:10,e_brightness:10',
        description: '부드러운 애니메이션 효과'
      },
      'korean-webtoon': {
        name: 'Korean Webtoon',
        cloudinaryTransform: 'e_art:al_dente,e_saturation:20,e_sharpen:80,e_brightness:5',
        description: '깔끔한 웹툰 효과'
      },
      'pixel-art': {
        name: 'Pixel Art',
        cloudinaryTransform: 'e_pixelate:20,e_saturation:20,e_contrast:20',
        description: '픽셀아트 효과'
      }
    };
  }

  /**
   * 이미지를 base64에서 처리 가능한 형태로 변환
   */
  async processInputImage(base64Image) {
    try {
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // 512x512로 리사이즈
      const processedBuffer = await sharp(imageBuffer)
        .resize(512, 512, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toBuffer();
      
      return processedBuffer;
    } catch (error) {
      logger.error('Error processing input image:', error);
      throw new Error('Failed to process input image');
    }
  }

  /**
   * Cloudinary를 사용한 이미지 변환
   */
  async generateArtProfile(imageBuffer, styleId) {
    try {
      const style = this.artStyles[styleId];
      if (!style) {
        throw new Error(`Unsupported style: ${styleId}`);
      }

      // 1. 원본 이미지를 Cloudinary에 업로드
      const uploadResult = await this.uploadToCloudinary(imageBuffer, 'originals');
      const originalUrl = uploadResult.secure_url;
      
      // 2. Cloudinary 변환 적용
      const transformedUrl = cloudinary.url(uploadResult.public_id, {
        transformation: style.cloudinaryTransform,
        format: 'jpg',
        quality: 'auto:good'
      });

      // 3. 변환된 이미지 다운로드
      const response = await fetch(transformedUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch transformed image');
      }
      
      const transformedBuffer = await response.arrayBuffer();
      
      return {
        originalUrl,
        transformedUrl,
        transformedBuffer: Buffer.from(transformedBuffer)
      };

    } catch (error) {
      logger.error('Error generating art profile:', error);
      throw new Error(`Failed to generate art profile: ${error.message}`);
    }
  }

  /**
   * Cloudinary에 이미지 업로드
   */
  uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `art-profiles/${folder}`,
          resource_type: 'image',
          format: 'jpg',
          transformation: {
            width: 512,
            height: 512,
            crop: 'fill',
            quality: 'auto:good'
          }
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            reject(new Error('Failed to upload image'));
          } else {
            resolve(result);
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  }

  /**
   * 사용 가능한 아트 스타일 목록
   */
  getAvailableStyles() {
    return Object.keys(this.artStyles).map(styleId => ({
      id: styleId,
      name: this.artStyles[styleId].name,
      description: this.artStyles[styleId].description,
      example: `/samples/preview-${styleId.split('-')[0]}.png`
    }));
  }

  /**
   * 스타일 표시명 반환
   */
  getStyleDisplayName(styleId) {
    return this.artStyles[styleId]?.name || styleId;
  }

  /**
   * 실제 작동하는 아트 프로필 생성 (Cloudinary 변환 사용)
   */
  async createArtProfile(userId, imageBuffer, styleId) {
    try {
      const startTime = Date.now();
      
      // 스타일 확인
      const style = this.artStyles[styleId];
      if (!style) {
        throw new Error(`Unsupported style: ${styleId}`);
      }

      // 이미지 변환
      const result = await this.generateArtProfile(imageBuffer, styleId);
      
      const processingTime = Date.now() - startTime;
      
      logger.info('Successfully created art profile', {
        userId,
        styleId,
        processingTime
      });

      return {
        originalImage: result.originalUrl,
        transformedImage: result.transformedUrl,
        style: style.name,
        processingTime,
        createdAt: new Date()
      };

    } catch (error) {
      logger.error('Error creating art profile:', error);
      throw error;
    }
  }

  /**
   * API 상태 (항상 사용 가능)
   */
  async checkApiStatus() {
    return { 
      status: 'available', 
      service: 'cloudinary-transform',
      message: 'Free art effects ready'
    };
  }
}

module.exports = new FreeArtService();