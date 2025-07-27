const router = require('express').Router();
const matchingController = require('../controllers/matchingController');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimiter');

// ==================== 기존 매칭 시스템 (레거시) ====================

// Get compatible users based on purpose
router.get('/compatible', 
  authMiddleware,
  matchingController.getCompatibleUsers
);

// Get users by specific purpose
router.get('/purpose/:purpose', 
  authMiddleware,
  matchingController.getUsersByPurpose
);

// ==================== 전시 동행 매칭 시스템 ====================

// 전시 동행 매칭 요청 생성
router.post('/exhibition',
  authMiddleware,
  rateLimit.createMatchRequest, // 시간당 5개 요청 제한
  matchingController.createExhibitionMatch
);

// 특정 매칭 요청에 대한 호환 가능한 사용자 찾기
router.get('/exhibition/:matchRequestId/matches',
  authMiddleware,
  rateLimit.findMatches, // 분당 10개 요청 제한
  matchingController.findExhibitionMatches
);

// 매칭 수락
router.post('/exhibition/accept',
  authMiddleware,
  rateLimit.matchAction, // 분당 5개 요청 제한
  matchingController.acceptExhibitionMatch
);

// 매칭 거절
router.post('/exhibition/reject',
  authMiddleware,
  rateLimit.matchAction, // 분당 5개 요청 제한
  matchingController.rejectExhibitionMatch
);

// 내 전시 동행 매칭 목록 조회
router.get('/exhibition/my-matches',
  authMiddleware,
  matchingController.getMyExhibitionMatches
);

// 매칭 분석 데이터 조회
router.get('/analytics',
  authMiddleware,
  matchingController.getMatchingAnalytics
);

// ==================== APT 호환성 시스템 ====================

// APT 타입 간 호환성 점수 조회
router.get('/apt-compatibility/:targetAptType',
  authMiddleware,
  matchingController.getAptCompatibility
);

module.exports = router;