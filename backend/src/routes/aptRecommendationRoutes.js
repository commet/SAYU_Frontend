// APT Recommendation Routes
const express = require('express');
const router = express.Router();
const aptRecommendationController = require('../controllers/aptRecommendationController');
const authMiddleware = require('../middleware/auth');
const { optionalAuth } = require('../middleware/authHelpers');
const { asyncHandler } = require('../middleware/errorHandler');

// ==================== 공개 엔드포인트 ====================

/**
 * GET /api/apt/artworks
 * APT 기반 작품 추천 (로그인 선택적)
 * 
 * Query params:
 * - aptType: APT 유형 (필수, 로그인하지 않은 경우)
 * - limit: 결과 개수 (기본 20)
 * - offset: 시작 위치 (기본 0)
 * - context: general, trending, seasonal, new (기본 general)
 */
router.get('/artworks', 
  optionalAuth,
  asyncHandler(async (req, res) => {
    await aptRecommendationController.getArtworkRecommendations(req, res);
  })
);

/**
 * GET /api/apt/exhibitions
 * APT 기반 전시 추천
 * 
 * Query params:
 * - aptType: APT 유형 (필수)
 * - location: 지역 (기본 seoul)
 * - dateRange: current, upcoming, thisWeek, thisMonth
 * - limit: 결과 개수 (기본 10)
 */
router.get('/exhibitions',
  optionalAuth,
  asyncHandler(async (req, res) => {
    await aptRecommendationController.getExhibitionRecommendations(req, res);
  })
);

/**
 * GET /api/apt/trending
 * APT별 인기 콘텐츠
 * 
 * Query params:
 * - aptType: APT 유형 (필수)
 * - period: daily, weekly, monthly (기본 daily)
 */
router.get('/trending',
  asyncHandler(async (req, res) => {
    await aptRecommendationController.getTrendingContent(req, res);
  })
);

/**
 * GET /api/apt/artwork/:artworkId/match
 * 특정 작품과 APT의 매칭 점수
 * 
 * Query params:
 * - aptType: APT 유형 (필수)
 */
router.get('/artwork/:artworkId/match',
  asyncHandler(async (req, res) => {
    await aptRecommendationController.getArtworkMatchScore(req, res);
  })
);

// ==================== 인증 필요 엔드포인트 ====================

/**
 * POST /api/apt/behavior
 * 사용자 행동 기록 및 벡터 업데이트
 * 
 * Body:
 * {
 *   actions: [
 *     { type: 'artwork_like', artwork: {...}, timestamp: '...' },
 *     { type: 'exhibition_visit', exhibition: {...}, duration: 30 }
 *   ]
 * }
 */
router.post('/behavior',
  authMiddleware,
  asyncHandler(async (req, res) => {
    await aptRecommendationController.updateUserBehavior(req, res);
  })
);

// ==================== 관리자 엔드포인트 ====================

/**
 * GET /api/apt/cache/stats
 * 캐시 통계 조회 (관리자용)
 */
router.get('/cache/stats',
  authMiddleware,
  asyncHandler(async (req, res) => {
    // TODO: 관리자 권한 체크
    await aptRecommendationController.getCacheStatistics(req, res);
  })
);

/**
 * POST /api/apt/cache/warmup
 * 캐시 워밍업 트리거 (관리자용)
 */
router.post('/cache/warmup',
  authMiddleware,
  asyncHandler(async (req, res) => {
    // TODO: 관리자 권한 체크
    const { aptTypes = Object.keys(require('../../../shared/SAYUTypeDefinitions').SAYU_TYPES) } = req.body;
    
    // 백그라운드에서 실행
    setImmediate(async () => {
      const cacheService = require('../services/aptCacheService');
      const service = new cacheService();
      await service.initialize();
      
      for (const aptType of aptTypes) {
        await service.warmupArtworksForAPT(aptType);
        await service.warmupExhibitionsForAPT(aptType);
      }
    });
    
    res.json({
      success: true,
      message: `Cache warmup started for ${aptTypes.length} APT types`
    });
  })
);

/**
 * DELETE /api/apt/cache/:aptType
 * 특정 APT 캐시 무효화 (관리자용)
 */
router.delete('/cache/:aptType',
  authMiddleware,
  asyncHandler(async (req, res) => {
    // TODO: 관리자 권한 체크
    const { aptType } = req.params;
    const cacheService = require('../services/aptCacheService');
    const service = new cacheService();
    
    await service.invalidateAPTCache(aptType);
    
    res.json({
      success: true,
      message: `Cache invalidated for APT type: ${aptType}`
    });
  })
);

// ==================== APT 정보 엔드포인트 ====================

/**
 * GET /api/apt/types
 * 모든 APT 유형 정보
 */
router.get('/types', (req, res) => {
  const { SAYU_TYPES } = require('../../../shared/SAYUTypeDefinitions');
  
  res.json({
    success: true,
    data: {
      types: Object.entries(SAYU_TYPES).map(([code, data]) => ({
        code,
        name: data.name,
        nameEn: data.nameEn,
        animal: data.animal,
        emoji: data.emoji,
        description: data.description,
        characteristics: data.characteristics
      }))
    }
  });
});

/**
 * GET /api/apt/types/:aptType
 * 특정 APT 유형 상세 정보
 */
router.get('/types/:aptType', (req, res) => {
  const { SAYU_TYPES } = require('../../../shared/SAYUTypeDefinitions');
  const { aptType } = req.params;
  
  if (!SAYU_TYPES[aptType]) {
    return res.status(404).json({
      error: 'APT type not found',
      validTypes: Object.keys(SAYU_TYPES)
    });
  }
  
  res.json({
    success: true,
    data: SAYU_TYPES[aptType]
  });
});

module.exports = router;