const express = require('express');
const router = express.Router();
const databaseRecommendationService = require('../services/databaseRecommendationService');
const authMiddleware = require('../middleware/auth');
const { body, query, param, validationResult } = require('express-validator');

// 추천 시스템 통계 (공개 엔드포인트)
router.get('/stats', async (req, res) => {
  try {
    const stats = await databaseRecommendationService.getRecommendationStats();
    res.json(stats);
  } catch (error) {
    console.error('Recommendation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendation statistics'
    });
  }
});

// 성격 유형별 추천 작품 (공개 엔드포인트)
router.get('/personality/:type', [
  param('type').isLength({ min: 4, max: 4 }).withMessage('Personality type must be 4 characters'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { type } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const recommendations = await databaseRecommendationService.getPersonalizedRecommendations(
      type.toUpperCase(),
      limit
    );

    res.json(recommendations);
  } catch (error) {
    console.error('Personality recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get personality-based recommendations'
    });
  }
});

// 기본 추천 작품 (성격 유형 없음)
router.get('/default', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const limit = parseInt(req.query.limit) || 10;
    const recommendations = await databaseRecommendationService.getDefaultRecommendations(limit);

    res.json(recommendations);
  } catch (error) {
    console.error('Default recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get default recommendations'
    });
  }
});

// 유사 작품 추천
router.get('/similar/:artworkId', [
  param('artworkId').isInt().withMessage('Artwork ID must be an integer'),
  query('personalityType').optional().isLength({ min: 4, max: 4 }).withMessage('Personality type must be 4 characters'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { artworkId } = req.params;
    const personalityType = req.query.personalityType?.toUpperCase();
    const limit = parseInt(req.query.limit) || 5;

    const similarArtworks = await databaseRecommendationService.getSimilarArtworks(
      parseInt(artworkId),
      personalityType,
      limit
    );

    res.json(similarArtworks);
  } catch (error) {
    console.error('Similar artworks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get similar artworks'
    });
  }
});

// 사용자 맞춤 추천 (인증 필요)
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // 사용자의 성격 유형 가져오기 (세션이나 프로필에서)
    let personalityType = null;

    // req.user에서 성격 유형 확인
    if (req.user && req.user.personality_type) {
      personalityType = req.user.personality_type;
    }

    // 쿼리 파라미터에서 성격 유형 확인
    if (req.query.personalityType) {
      personalityType = req.query.personalityType.toUpperCase();
    }

    let recommendations;
    if (personalityType) {
      recommendations = await databaseRecommendationService.getPersonalizedRecommendations(
        personalityType,
        limit
      );
    } else {
      recommendations = await databaseRecommendationService.getDefaultRecommendations(limit);
    }

    res.json({
      ...recommendations,
      userId: req.user?.id,
      personalityTypeSource: req.user?.personality_type ? 'profile' : 'query'
    });

  } catch (error) {
    console.error('User recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user recommendations'
    });
  }
});

// 추천 시스템 테스트 엔드포인트 (개발용)
router.get('/test', async (req, res) => {
  try {
    const personalityTypes = ['LAEF', 'LAEC', 'LREF', 'LREC', 'SAEF', 'SREF', 'SRMC'];
    const testResults = {};

    for (const type of personalityTypes) {
      try {
        const recommendations = await databaseRecommendationService.getPersonalizedRecommendations(type, 3);
        testResults[type] = {
          success: true,
          count: recommendations.recommendations.length,
          reason: recommendations.recommendationReason
        };
      } catch (error) {
        testResults[type] = {
          success: false,
          error: error.message
        };
      }
    }

    // 통계 정보도 포함
    const stats = await databaseRecommendationService.getRecommendationStats();

    res.json({
      success: true,
      message: 'Database recommendation system test',
      testResults,
      systemStats: stats.stats,
      testedPersonalityTypes: personalityTypes.length
    });

  } catch (error) {
    console.error('Recommendation test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test recommendation system'
    });
  }
});

module.exports = router;
