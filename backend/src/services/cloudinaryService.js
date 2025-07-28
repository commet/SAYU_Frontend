const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');
const sharp = require('sharp');
const { logger } = require('../config/logger');

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * 이미지를 다양한 크기로 생성하고 최적화하는 클래스
 */
class CloudinaryImageService {
  constructor() {
    this.folderStructure = {
      artist_profiles: 'sayu-artist-portal/profiles',
      artist_artworks: 'sayu-artist-portal/artworks',
      gallery_profiles: 'sayu-artist-portal/gallery-profiles',
      gallery_exhibitions: 'sayu-artist-portal/exhibitions'
    };

    this.imageSizes = {
      thumbnail: { width: 150, height: 150, quality: 80 },
      small: { width: 300, height: 300, quality: 85 },
      medium: { width: 600, height: 600, quality: 90 },
      large: { width: 1200, height: 1200, quality: 95 },
      original: { quality: 100 }
    };
  }

  /**
   * 이미지 업로드 및 다양한 크기 생성
   * @param {Buffer} imageBuffer - 이미지 버퍼
   * @param {string} category - 이미지 카테고리 (artist_profiles, artist_artworks 등)
   * @param {string} fileName - 파일명
   * @param {object} options - 추가 옵션
   * @returns {Promise<object>} 업로드된 이미지 정보
   */
  async uploadImage(imageBuffer, category, fileName, options = {}) {
    try {
      const folder = this.folderStructure[category] || 'sayu-artist-portal/misc';
      const publicId = `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '')}`;

      // 이미지 최적화 및 변환
      const optimizedBuffer = await this.optimizeImage(imageBuffer);

      // 메인 이미지 업로드
      const uploadResult = await this.uploadToCloudinary(optimizedBuffer, {
        folder,
        public_id: publicId,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
        ...options
      });

      // 다양한 크기의 썸네일 생성
      const sizes = await this.generateThumbnails(uploadResult.public_id);

      logger.info('Image uploaded successfully', {
        publicId,
        folder,
        sizes: Object.keys(sizes),
        originalSize: imageBuffer.length,
        optimizedSize: optimizedBuffer.length
      });

      return {
        success: true,
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        sizes,
        metadata: {
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          folder
        }
      };

    } catch (error) {
      logger.error('Image upload failed', {
        error: error.message,
        category,
        fileName
      });
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  /**
   * 이미지 최적화
   * @param {Buffer} imageBuffer
   * @returns {Promise<Buffer>}
   */
  async optimizeImage(imageBuffer) {
    try {
      return await sharp(imageBuffer)
        .resize(2048, 2048, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 90,
          progressive: true,
          mozjpeg: true
        })
        .toBuffer();
    } catch (error) {
      logger.warn('Image optimization failed, using original', { error: error.message });
      return imageBuffer;
    }
  }

  /**
   * Cloudinary로 업로드
   * @param {Buffer} imageBuffer
   * @param {object} options
   * @returns {Promise<object>}
   */
  async uploadToCloudinary(imageBuffer, options) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      streamifier.createReadStream(imageBuffer).pipe(uploadStream);
    });
  }

  /**
   * 다양한 크기의 썸네일 URL 생성
   * @param {string} publicId
   * @returns {Promise<object>}
   */
  async generateThumbnails(publicId) {
    const sizes = {};

    for (const [sizeName, config] of Object.entries(this.imageSizes)) {
      if (sizeName === 'original') {
        sizes[sizeName] = cloudinary.url(publicId, {
          quality: config.quality,
          fetch_format: 'auto'
        });
      } else {
        sizes[sizeName] = cloudinary.url(publicId, {
          width: config.width,
          height: config.height,
          crop: 'fill',
          gravity: 'auto',
          quality: config.quality,
          fetch_format: 'auto'
        });
      }
    }

    return sizes;
  }

  /**
   * 이미지 삭제
   * @param {string} publicId
   * @returns {Promise<boolean>}
   */
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      logger.info('Image deleted', { publicId, result: result.result });
      return result.result === 'ok';
    } catch (error) {
      logger.error('Image deletion failed', { publicId, error: error.message });
      return false;
    }
  }

  /**
   * 여러 이미지 동시 업로드
   * @param {Array} files - multer 파일 배열
   * @param {string} category
   * @param {object} options
   * @returns {Promise<Array>}
   */
  async uploadMultipleImages(files, category, options = {}) {
    const uploadPromises = files.map(async (file, index) => {
      try {
        const fileName = file.originalname || `image_${index}`;
        return await this.uploadImage(file.buffer, category, fileName, options);
      } catch (error) {
        logger.error(`Failed to upload image ${index}`, { error: error.message });
        return { success: false, error: error.message };
      }
    });

    const results = await Promise.allSettled(uploadPromises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason.message || 'Upload failed',
          index
        };
      }
    });
  }

  /**
   * 이미지 URL에서 public ID 추출
   * @param {string} imageUrl
   * @returns {string|null}
   */
  extractPublicIdFromUrl(imageUrl) {
    try {
      if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
        return null;
      }

      const parts = imageUrl.split('/');
      const uploadIndex = parts.findIndex(part => part === 'upload');

      if (uploadIndex === -1) return null;

      // v1234567890 형태의 버전 정보 건너뛰기
      const startIndex = uploadIndex + 1;
      const pathParts = parts.slice(startIndex).filter(part => !part.startsWith('v'));

      // 확장자 제거
      const fileName = pathParts[pathParts.length - 1];
      const publicIdPart = fileName.replace(/\.[^/.]+$/, '');

      // 폴더 경로 포함
      pathParts[pathParts.length - 1] = publicIdPart;

      return pathParts.join('/');
    } catch (error) {
      logger.error('Failed to extract public ID', { imageUrl, error: error.message });
      return null;
    }
  }

  /**
   * 이미지 변환 URL 생성
   * @param {string} publicId
   * @param {object} transformation
   * @returns {string}
   */
  getTransformedUrl(publicId, transformation = {}) {
    return cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto:good',
      ...transformation
    });
  }

  /**
   * Cloudinary 설정 검증
   * @returns {boolean}
   */
  validateConfig() {
    const requiredConfig = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missingConfig = requiredConfig.filter(key => !process.env[key]);

    if (missingConfig.length > 0) {
      logger.error('Missing Cloudinary configuration', { missing: missingConfig });
      return false;
    }

    return true;
  }

  /**
   * 이미지 메타데이터 조회
   * @param {string} publicId
   * @returns {Promise<object>}
   */
  async getImageMetadata(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: 'image'
      });

      return {
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        url: result.secure_url,
        createdAt: result.created_at,
        folder: result.folder
      };
    } catch (error) {
      logger.error('Failed to get image metadata', { publicId, error: error.message });
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
const cloudinaryService = new CloudinaryImageService();

// Cloudinary 설정 검증
if (!cloudinaryService.validateConfig()) {
  logger.warn('Cloudinary not properly configured. Image uploads will fail.');
}

module.exports = {
  cloudinaryService,
  CloudinaryImageService
};
