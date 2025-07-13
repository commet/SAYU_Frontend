const artProfileService = require('../services/artProfileService');
const logger = require('../utils/logger');
const db = require('../config/database');

class ArtProfileController {
  /**
   * AI 아트 프로필 생성
   */
  async generateArtProfile(req, res) {
    try {
      const userId = req.userId;
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

      // 아트 프로필 생성
      const result = await artProfileService.generateArtProfile(
        userId,
        imageUrl,
        styleId,
        customSettings
      );

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
      const userId = req.userId;

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
      const userId = req.userId;

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