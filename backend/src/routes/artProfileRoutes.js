const express = require('express');
const router = express.Router();
const artProfileController = require('../controllers/artProfileController');
const authMiddleware = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

// 모든 라우트는 인증 필요
router.use(authMiddleware);

/**
 * POST /api/art-profile/generate
 * AI 아트 프로필 생성
 */
router.post('/generate',
  [
    body('imageUrl').notEmpty().withMessage('Image is required'),
    body('styleId').notEmpty().withMessage('Style ID is required'),
    body('customSettings').optional().isObject()
  ],
  validateRequest,
  artProfileController.generateArtProfile
);

/**
 * GET /api/art-profile/status/:generationId
 * 생성 상태 확인
 */
router.get('/status/:generationId',
  [
    param('generationId').isUUID().withMessage('Invalid generation ID')
  ],
  validateRequest,
  artProfileController.checkGenerationStatus
);

/**
 * GET /api/art-profile/recommendations/:userId
 * 사용자 맞춤 스타일 추천
 */
router.get('/recommendations/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID')
  ],
  validateRequest,
  artProfileController.getRecommendedStyles
);

/**
 * GET /api/art-profile/user/:userId
 * 사용자의 아트 프로필 목록
 */
router.get('/user/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID')
  ],
  validateRequest,
  artProfileController.getUserArtProfiles
);

/**
 * GET /api/art-profile/gallery
 * 갤러리 (다른 사용자들의 아트 프로필)
 */
router.get('/gallery',
  [
    query('style').optional().isString(),
    query('period').optional().isIn(['today', 'week', 'month']),
    query('sort').optional().isIn(['recent', 'popular'])
  ],
  validateRequest,
  artProfileController.getGallery
);

/**
 * POST /api/art-profile/:profileId/like
 * 아트 프로필 좋아요
 */
router.post('/:profileId/like',
  [
    param('profileId').isUUID().withMessage('Invalid profile ID')
  ],
  validateRequest,
  artProfileController.likeArtProfile
);

/**
 * GET /api/art-profile/preferences/:userId
 * 사용자 선호도 및 크레딧 정보
 */
router.get('/preferences/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID')
  ],
  validateRequest,
  artProfileController.getUserPreferences
);

/**
 * POST /api/art-profile/:profileId/set-profile
 * 프로필 이미지로 설정
 */
router.post('/:profileId/set-profile',
  [
    param('profileId').isUUID().withMessage('Invalid profile ID')
  ],
  validateRequest,
  artProfileController.setAsProfileImage
);

module.exports = router;
