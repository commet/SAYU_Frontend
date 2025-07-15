const express = require('express');
const router = express.Router();
const exhibitionController = require('../controllers/exhibitionController');
const authMiddleware = require('../middleware/auth');

// Enhanced validation middleware
const {
  exhibitionValidation,
  exhibitionSubmissionValidation,
  exhibitionQueryValidation,
  exhibitionIdValidation,
  exhibitionInteractionValidation,
  handleExhibitionValidationResult,
  sanitizeExhibitionInput,
  submissionRateLimit
} = require('../middleware/exhibitionValidation');

// Security middleware
const {
  securityHeaders,
  requestSizeValidator,
  securityAuditLogger
} = require('../middleware/securityEnhancements');

// Apply security middleware to all routes
router.use(securityHeaders);
router.use(securityAuditLogger);
router.use(sanitizeExhibitionInput);

// 전시 목록 조회 (필터링, 페이지네이션 지원)
router.get('/exhibitions', 
  exhibitionQueryValidation,
  handleExhibitionValidationResult,
  exhibitionController.getExhibitions
);

// 특정 전시 조회
router.get('/exhibitions/:id', 
  exhibitionIdValidation,
  handleExhibitionValidationResult,
  exhibitionController.getExhibition
);

// 전시 좋아요/좋아요 취소 (인증 필요)
router.post('/exhibitions/:id/like', 
  authMiddleware,
  exhibitionInteractionValidation,
  handleExhibitionValidationResult,
  exhibitionController.likeExhibition
);

// 전시 제출 (사용자 제출) - 레이트 리미팅 적용
router.post('/exhibitions/submit', 
  submissionRateLimit,
  exhibitionSubmissionValidation,
  handleExhibitionValidationResult,
  exhibitionController.submitExhibition
);

// 도시별 전시 통계
router.get('/exhibitions/stats/cities', 
  exhibitionController.getCityStats
);

// 인기 전시 조회
router.get('/exhibitions/popular', 
  exhibitionQueryValidation,
  handleExhibitionValidationResult,
  exhibitionController.getPopularExhibitions
);

// 장소(venue) 목록 조회
router.get('/venues', 
  exhibitionQueryValidation,
  handleExhibitionValidationResult,
  exhibitionController.getVenues
);

module.exports = router;