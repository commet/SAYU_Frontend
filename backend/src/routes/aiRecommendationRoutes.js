const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { body, query, param } = require('express-validator');
const aiRecommendationService = require('../services/aiRecommendationService');

// 미들웨어: 모든 라우트에 인증 적용
router.use(authenticateToken);

// 개인화된 전시 추천
router.get('/exhibitions',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).default(10),
    query('offset').optional().isInt({ min: 0 }).default(0),
    query('location').optional().isString(),
    query('genres').optional().isString(), // comma-separated
    query('includeVisited').optional().isBoolean().default(false),
    query('minRating').optional().isFloat({ min: 0, max: 5 }),
    query('maxDistance').optional().isFloat({ min: 0 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { 
        limit, offset, location, genres, includeVisited, 
        minRating, maxDistance 
      } = req.query;
      
      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        includeVisited: includeVisited === 'true',
        location,
        genres: genres ? genres.split(',') : [],
        minRating: minRating ? parseFloat(minRating) : null,
        maxDistance: maxDistance ? parseFloat(maxDistance) : null
      };

      const recommendations = await aiRecommendationService.getPersonalizedExhibitions(
        req.user.id, 
        options
      );

      res.json({
        success: true,
        recommendations,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: recommendations.length
        }
      });
    } catch (error) {
      console.error('Exhibition recommendations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get exhibition recommendations'
      });
    }
  }
);

// 아트웍 추천
router.get('/artworks',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
    query('artworkId').optional().isUUID(), // 유사한 작품 추천용
    query('personalityType').optional().isString(),
    query('mood').optional().isString(),
    query('colorMood').optional().isString()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { limit, artworkId, personalityType, mood, colorMood } = req.query;
      
      const options = {
        limit: parseInt(limit),
        artworkId,
        personalityType: personalityType || req.user.personality_type,
        mood,
        colorMood
      };

      const artworks = await aiRecommendationService.getArtworkRecommendations(
        req.user.id,
        options
      );

      res.json({
        success: true,
        artworks,
        total: artworks.length
      });
    } catch (error) {
      console.error('Artwork recommendations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get artwork recommendations'
      });
    }
  }
);

// 추천 피드백 제출
router.post('/feedback',
  [
    body('recommendationId').isUUID(),
    body('feedbackType').isIn(['like', 'dislike', 'not_interested', 'report']),
    body('feedbackValue').optional().isFloat({ min: -1, max: 1 }),
    body('feedbackReason').optional().isString(),
    body('feedbackText').optional().isString()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const {
        recommendationId,
        feedbackType,
        feedbackValue,
        feedbackReason,
        feedbackText
      } = req.body;

      // 피드백 저장 로직
      const feedbackResult = await aiRecommendationService.submitFeedback(
        req.user.id,
        {
          recommendationId,
          feedbackType,
          feedbackValue,
          feedbackReason,
          feedbackText
        }
      );

      // 실시간 추천 업데이트
      await aiRecommendationService.updateRecommendationsRealtime(
        req.user.id,
        {
          activityType: 'feedback',
          feedbackType,
          feedbackValue
        }
      );

      res.json({
        success: true,
        message: 'Feedback submitted successfully',
        feedbackId: feedbackResult.id
      });
    } catch (error) {
      console.error('Feedback submission error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit feedback'
      });
    }
  }
);

// 북마크 추가/제거
router.post('/bookmark',
  [
    body('recommendationId').isUUID()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { recommendationId } = req.body;

      const bookmarkResult = await aiRecommendationService.toggleBookmark(
        req.user.id,
        recommendationId
      );

      res.json({
        success: true,
        isBookmarked: bookmarkResult.isBookmarked,
        message: bookmarkResult.isBookmarked ? 'Bookmarked' : 'Bookmark removed'
      });
    } catch (error) {
      console.error('Bookmark toggle error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle bookmark'
      });
    }
  }
);

// 추천 조회 기록
router.post('/view',
  [
    body('recommendationId').isUUID(),
    body('viewDuration').optional().isInt({ min: 0 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { recommendationId, viewDuration } = req.body;

      await aiRecommendationService.recordView(
        req.user.id,
        recommendationId,
        { viewDuration }
      );

      res.json({
        success: true,
        message: 'View recorded'
      });
    } catch (error) {
      console.error('View recording error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record view'
      });
    }
  }
);

// 사용자 추천 히스토리
router.get('/history',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).default(20),
    query('offset').optional().isInt({ min: 0 }).default(0),
    query('type').optional().isString(), // 'exhibition', 'artwork'
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { limit, offset, type, dateFrom, dateTo } = req.query;

      const history = await aiRecommendationService.getRecommendationHistory(
        req.user.id,
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          type,
          dateFrom: dateFrom ? new Date(dateFrom) : null,
          dateTo: dateTo ? new Date(dateTo) : null
        }
      );

      res.json({
        success: true,
        history: history.items,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: history.total
        }
      });
    } catch (error) {
      console.error('Recommendation history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get recommendation history'
      });
    }
  }
);

// 사용자 선호도 프로필 조회
router.get('/profile',
  async (req, res) => {
    try {
      const profile = await aiRecommendationService.getUserPreferenceProfile(
        req.user.id
      );

      res.json({
        success: true,
        profile
      });
    } catch (error) {
      console.error('Profile retrieval error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user profile'
      });
    }
  }
);

// 사용자 선호도 프로필 업데이트
router.put('/profile',
  [
    body('preferredGenres').optional().isArray(),
    body('preferredArtists').optional().isArray(),
    body('preferredPeriods').optional().isArray(),
    body('preferredLocations').optional().isArray(),
    body('priceSensitivity').optional().isFloat({ min: 0, max: 1 }),
    body('weekendPreference').optional().isFloat({ min: 0, max: 1 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const profileUpdates = req.body;

      const updatedProfile = await aiRecommendationService.updateUserPreferenceProfile(
        req.user.id,
        profileUpdates
      );

      res.json({
        success: true,
        profile: updatedProfile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }
);

// 추천 알고리즘 성능 메트릭 (관리자용)
router.get('/metrics',
  [
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('algorithm').optional().isString(),
    query('type').optional().isString()
  ],
  // TODO: 관리자 권한 체크 미들웨어 추가
  async (req, res) => {
    try {
      const { dateFrom, dateTo, algorithm, type } = req.query;

      const metrics = await aiRecommendationService.getRecommendationMetrics({
        dateFrom: dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo: dateTo ? new Date(dateTo) : new Date(),
        algorithm,
        type
      });

      res.json({
        success: true,
        metrics
      });
    } catch (error) {
      console.error('Metrics retrieval error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get recommendation metrics'
      });
    }
  }
);

// 유사한 사용자 찾기
router.get('/similar-users',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).default(10)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { limit } = req.query;

      const similarUsers = await aiRecommendationService.findSimilarUsers(
        req.user.id,
        parseInt(limit)
      );

      res.json({
        success: true,
        similarUsers,
        total: similarUsers.length
      });
    } catch (error) {
      console.error('Similar users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to find similar users'
      });
    }
  }
);

// 추천 재생성 요청
router.post('/refresh',
  [
    body('type').optional().isIn(['exhibition', 'artwork', 'all']).default('all'),
    body('clearCache').optional().isBoolean().default(false)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { type, clearCache } = req.body;

      if (clearCache) {
        await aiRecommendationService.clearUserRecommendationCache(req.user.id);
      }

      let refreshResults = {};

      if (type === 'exhibition' || type === 'all') {
        refreshResults.exhibitions = await aiRecommendationService.getPersonalizedExhibitions(
          req.user.id,
          { limit: 10 }
        );
      }

      if (type === 'artwork' || type === 'all') {
        refreshResults.artworks = await aiRecommendationService.getArtworkRecommendations(
          req.user.id,
          { limit: 10 }
        );
      }

      res.json({
        success: true,
        message: 'Recommendations refreshed',
        results: refreshResults
      });
    } catch (error) {
      console.error('Recommendation refresh error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refresh recommendations'
      });
    }
  }
);

module.exports = router;