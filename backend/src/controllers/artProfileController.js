const artProfileService = require('../services/artProfileService');
const huggingFaceArtService = require('../services/huggingFaceArtService');
const freeArtService = require('../services/freeArtService');
const logger = require('../utils/logger');
const db = require('../config/database');

class ArtProfileController {
  /**
   * AI 아트 프로필 생성 (멀티 서비스 폴백)
   */
  async generateArtProfileWithFallback(req, res) {
    try {
      const { userId } = req;
      const { base64Image, styleId, customSettings = {} } = req.body;

      // 입력 검증
      if (!base64Image || !styleId) {
        return res.status(400).json({
          success: false,
          message: 'Base64 image and style are required'
        });
      }

      // 크레딧 확인
      const credits = await artProfileService.checkUserCredits(userId);
      if (credits.remaining <= 0) {
        return res.status(403).json({
          success: false,
          message: 'No credits remaining this month',
          credits: {
            used: credits.used,
            limit: credits.limit,
            remaining: 0
          }
        });
      }

      logger.info(`Starting AI art generation with fallback for user: ${userId}, style: ${styleId}`);

      let result = null;
      let usedService = null;
      let errors = [];

      // 서비스 우선순위: HuggingFace > Replicate > Free/Cloudinary
      const services = [
        {
          name: 'HuggingFace',
          fn: async () => {
            const imageBuffer = await huggingFaceArtService.processInputImage(base64Image);
            const resultBuffer = await huggingFaceArtService.generateArtProfile(imageBuffer, styleId);
            
            // Cloudinary에 업로드
            const uploadResult = await this.uploadBufferToCloudinary(resultBuffer, 'huggingface');
            
            return {
              originalImage: null, // 원본은 클라이언트에 있음
              transformedImage: uploadResult.secure_url,
              style: huggingFaceArtService.getStyleDisplayName(styleId),
              aiProvider: 'huggingface',
              processingTime: 0,
              createdAt: new Date()
            };
          }
        },
        {
          name: 'Replicate',
          fn: async () => {
            return await artProfileService.generateArtProfile(userId, base64Image, styleId, customSettings);
          }
        },
        {
          name: 'Cloudinary',
          fn: async () => {
            const imageBuffer = await freeArtService.processInputImage(base64Image);
            return await freeArtService.createArtProfile(userId, imageBuffer, styleId);
          }
        }
      ];

      // 각 서비스를 순서대로 시도
      for (const service of services) {
        try {
          logger.info(`Trying ${service.name} for art generation...`);
          result = await service.fn();
          usedService = service.name;
          logger.info(`✅ ${service.name} succeeded!`);
          break;
        } catch (error) {
          logger.warn(`❌ ${service.name} failed: ${error.message}`);
          errors.push({
            service: service.name,
            error: error.message
          });
        }
      }

      if (!result) {
        logger.error('All AI services failed', { errors });
        return res.status(500).json({
          success: false,
          message: 'All AI services are currently unavailable. Please try again later.',
          serviceErrors: errors
        });
      }

      // 성공한 경우 DB에 저장 (Cloudinary는 이미 저장됨)
      if (usedService !== 'Cloudinary') {
        await this.saveArtProfileToDB(userId, result, styleId, usedService);
      }

      res.json({
        success: true,
        data: {
          ...result,
          usedService
        },
        credits: {
          used: credits.used + 1,
          limit: credits.limit,
          remaining: credits.remaining - 1
        }
      });
    } catch (error) {
      logger.error('Error in generateArtProfileWithFallback:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate art profile'
      });
    }
  }

  /**
   * AI 아트 프로필 생성 (기존 URL 방식)
   */
  async generateArtProfile(req, res) {
    try {
      const { userId } = req;
      const { imageUrl, styleId, customSettings } = req.body;

      // 입력 검증
      if (!imageUrl || !styleId) {
        return res.status(400).json({
          success: false,
          message: 'Image and style are required'
        });
      }

      // 크레딧 확인
      const credits = await artProfileService.checkUserCredits(userId);
      if (credits.remaining <= 0) {
        return res.status(403).json({
          success: false,
          message: 'No credits remaining this month',
          credits: {
            used: credits.used,
            limit: credits.limit,
            remaining: 0
          }
        });
      }

      // 무료 아트 효과를 사용한 프로필 생성 (API 키 불필요)
      const imageBuffer = await freeArtService.processInputImage(imageUrl);
      const result = await freeArtService.createArtProfile(userId, imageBuffer, styleId);

      res.json({
        success: true,
        data: result,
        credits: {
          used: credits.used + 1,
          limit: credits.limit,
          remaining: credits.remaining - 1
        }
      });
    } catch (error) {
      logger.error('Error in generateArtProfile:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate art profile'
      });
    }
  }

  /**
   * Buffer를 Cloudinary에 업로드하는 헬퍼 메서드
   */
  async uploadBufferToCloudinary(buffer, folder) {
    const cloudinary = require('cloudinary').v2;
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `art-profiles/${folder}`,
          resource_type: 'image',
          format: 'jpg',
          transformation: {
            width: 1024,
            height: 1024,
            crop: 'fill',
            quality: 'auto:good'
          }
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
  }

  /**
   * 아트 프로필을 DB에 저장하는 헬퍼 메서드
   */
  async saveArtProfileToDB(userId, result, styleId, aiProvider) {
    try {
      const insertQuery = `
        INSERT INTO art_profiles (
          id, user_id, original_image, transformed_image, 
          style_id, ai_provider, created_at, is_public
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const { v4: uuidv4 } = require('uuid');
      const values = [
        uuidv4(),
        userId,
        result.originalImage || null,
        result.transformedImage,
        styleId,
        aiProvider,
        new Date(),
        true // 기본적으로 공개
      ];

      await db.query(insertQuery, values);
      logger.info(`Saved art profile to DB for user: ${userId}, provider: ${aiProvider}`);
    } catch (error) {
      logger.error('Failed to save art profile to DB:', error);
      // DB 저장 실패해도 생성 결과는 반환
    }
  }

  /**
   * 생성 상태 확인 (폴링용)
   */
  async checkGenerationStatus(req, res) {
    try {
      const { generationId } = req.params;

      // 실제 구현에서는 생성 작업의 상태를 추적
      // 여기서는 간단히 완료된 것으로 처리
      res.json({
        success: true,
        data: {
          status: 'completed',
          progress: 100
        }
      });
    } catch (error) {
      logger.error('Error in checkGenerationStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check generation status'
      });
    }
  }

  /**
   * 추천 스타일 가져오기
   */
  async getRecommendedStyles(req, res) {
    try {
      const { userId } = req.params;

      // 권한 확인 (자신의 추천만 볼 수 있음)
      if (req.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const recommendations = await artProfileService.getRecommendedStyles(userId);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      logger.error('Error in getRecommendedStyles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recommended styles'
      });
    }
  }

  /**
   * 사용자의 아트 프로필 목록
   */
  async getUserArtProfiles(req, res) {
    try {
      const { userId } = req.params;

      // 다른 사용자의 프로필도 볼 수 있지만, 공개된 것만
      const isOwnProfile = req.userId === userId;

      const query = `
        SELECT 
          ap.*,
          u.nickname,
          COUNT(apl.id) as like_count
        FROM art_profiles ap
        JOIN users u ON ap.user_id = u.id
        LEFT JOIN art_profile_likes apl ON ap.id = apl.art_profile_id
        WHERE ap.user_id = $1
          ${!isOwnProfile ? 'AND ap.is_public = true' : ''}
        GROUP BY ap.id, u.id
        ORDER BY ap.created_at DESC
      `;

      const result = await db.query(query, [userId]);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      logger.error('Error in getUserArtProfiles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user art profiles'
      });
    }
  }

  /**
   * 갤러리 목록
   */
  async getGallery(req, res) {
    try {
      const { style, period, sort } = req.query;

      const gallery = await artProfileService.getGallery({
        style,
        period,
        sort
      });

      // 현재 사용자가 좋아요한 항목 표시
      if (req.userId) {
        const likedQuery = `
          SELECT art_profile_id 
          FROM art_profile_likes 
          WHERE user_id = $1 AND art_profile_id = ANY($2)
        `;
        const likedResult = await db.query(
          likedQuery,
          [req.userId, gallery.map(item => item.id)]
        );

        const likedIds = new Set(likedResult.rows.map(row => row.art_profile_id));
        gallery.forEach(item => {
          item.isLiked = likedIds.has(item.id);
        });
      }

      res.json({
        success: true,
        data: gallery
      });
    } catch (error) {
      logger.error('Error in getGallery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get gallery'
      });
    }
  }

  /**
   * 아트 프로필 좋아요
   */
  async likeArtProfile(req, res) {
    try {
      const { profileId } = req.params;
      const { userId } = req;

      const result = await artProfileService.likeArtProfile(profileId, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in likeArtProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to like art profile'
      });
    }
  }

  /**
   * 사용자 선호도 정보
   */
  async getUserPreferences(req, res) {
    try {
      const { userId } = req.params;

      if (req.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const credits = await artProfileService.checkUserCredits(userId);

      // 사용자의 선호 스타일 통계
      const styleStatsQuery = `
        SELECT 
          style_id,
          COUNT(*) as count
        FROM art_profiles
        WHERE user_id = $1
        GROUP BY style_id
        ORDER BY count DESC
      `;
      const styleStats = await db.query(styleStatsQuery, [userId]);

      res.json({
        success: true,
        data: {
          userId,
          favoriteStyles: styleStats.rows.map(row => row.style_id),
          generatedCount: credits.used,
          monthlyCredits: credits.remaining,
          isPremium: credits.isPremium,
          creditInfo: {
            used: credits.used,
            limit: credits.limit,
            remaining: credits.remaining
          }
        }
      });
    } catch (error) {
      logger.error('Error in getUserPreferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user preferences'
      });
    }
  }

  /**
   * 프로필 이미지로 설정
   */
  async setAsProfileImage(req, res) {
    try {
      const { profileId } = req.params;
      const { userId } = req;

      // 소유권 확인
      const checkQuery = `
        SELECT transformed_image 
        FROM art_profiles 
        WHERE id = $1 AND user_id = $2
      `;
      const result = await db.query(checkQuery, [profileId, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Art profile not found or unauthorized'
        });
      }

      // 사용자 프로필 이미지 업데이트
      await db.query(
        'UPDATE users SET profile_image = $1 WHERE id = $2',
        [result.rows[0].transformed_image, userId]
      );

      res.json({
        success: true,
        message: 'Profile image updated successfully'
      });
    } catch (error) {
      logger.error('Error in setAsProfileImage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set as profile image'
      });
    }
  }
}

module.exports = new ArtProfileController();
