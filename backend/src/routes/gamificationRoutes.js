const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { body, param, query } = require('express-validator');
const gamificationController = require('../controllers/gamificationController');

// 미들웨어: 모든 라우트에 인증 적용
router.use(authenticateToken);

// 대시보드 데이터 조회
router.get('/dashboard',
  gamificationController.getDashboard
);

// 포인트 획득 (활동 기록)
router.post('/earn-points',
  [
    body('activity').isString().isIn([
      'EXHIBITION_START',
      'EXHIBITION_COMPLETE',
      'WRITE_REVIEW',
      'UPLOAD_PHOTO',
      'DAILY_CHECKIN',
      'SHARE_SOCIAL'
    ]),
    body('metadata').optional().isObject()
  ],
  validateRequest,
  gamificationController.earnPoints
);

// 전시 세션 시작
router.post('/exhibition/start',
  [
    body('exhibitionId').isUUID(),
    body('exhibitionName').isString().notEmpty(),
    body('location').optional().isObject()
  ],
  validateRequest,
  gamificationController.startExhibitionSession
);

// 전시 세션 종료
router.post('/exhibition/end',
  [
    body('sessionId').isUUID()
  ],
  validateRequest,
  gamificationController.endExhibitionSession
);

// 현재 진행 중인 세션 조회
router.get('/exhibition/current',
  gamificationController.getCurrentSession
);

// 칭호 목록 조회
router.get('/titles',
  gamificationController.getTitles
);

// 메인 칭호 설정
router.put('/titles/main',
  [
    body('titleId').isString().notEmpty()
  ],
  validateRequest,
  gamificationController.setMainTitle
);

// 도전 과제 목록
router.get('/challenges',
  [
    query('status').optional().isIn(['active', 'completed', 'all'])
  ],
  gamificationController.getChallenges
);

// 리더보드 조회
router.get('/leaderboard',
  [
    query('type').optional().isIn(['weekly', 'monthly', 'all-time']).default('weekly'),
    query('limit').optional().isInt({ min: 1, max: 100 }).default(50)
  ],
  validateRequest,
  gamificationController.getLeaderboard
);

// 친구 리더보드
router.get('/leaderboard/friends',
  gamificationController.getFriendsLeaderboard
);

// 사용자 통계 조회
router.get('/stats/:userId?',
  [
    param('userId').optional().isUUID()
  ],
  validateRequest,
  gamificationController.getUserStats
);

// 활동 기록 조회
router.get('/activities',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).default(20),
    query('offset').optional().isInt({ min: 0 }).default(0),
    query('type').optional().isString()
  ],
  validateRequest,
  gamificationController.getActivityHistory
);

// 주간 진행도
router.get('/weekly-progress',
  gamificationController.getWeeklyProgress
);

// 레벨 정보 조회
router.get('/levels',
  gamificationController.getLevelInfo
);

// 이벤트 목록
router.get('/events',
  gamificationController.getActiveEvents
);

// 프로필 뱃지 공유 카드 생성
router.post('/share-card',
  [
    body('type').isIn(['monthly', 'achievement', 'level-up']),
    body('data').optional().isObject()
  ],
  validateRequest,
  gamificationController.generateShareCard
);

// 관리자 전용 라우트
router.use('/admin', require('./admin/gamificationAdminRoutes'));

// 웹소켓 연결을 위한 SSE 엔드포인트
router.get('/stream',
  gamificationController.streamUpdates
);

module.exports = router;
