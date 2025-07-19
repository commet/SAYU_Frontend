// APT Evolution Routes - 진화 시스템 API 라우트
const express = require('express');
const router = express.Router();
const aptEvolutionController = require('../controllers/aptEvolutionController');
const { authMiddleware } = require('../middleware/authMiddleware');

// 모든 진화 관련 엔드포인트는 인증 필요
router.use(authMiddleware);

// ==================== 진화 상태 조회 ====================
// GET /api/evolution/state
router.get('/state', aptEvolutionController.getUserEvolutionState);

// ==================== 행동 기록 ====================
// POST /api/evolution/action
router.post('/action', aptEvolutionController.recordAction);

// ==================== 일일 체크인 ====================
// POST /api/evolution/daily-checkin
router.post('/daily-checkin', aptEvolutionController.dailyCheckIn);

// ==================== 리더보드 ====================
// GET /api/evolution/leaderboard?aptType=LAEF&period=weekly
router.get('/leaderboard', aptEvolutionController.getLeaderboard);

// ==================== 마일스톤 ====================
// GET /api/evolution/milestones
router.get('/milestones', aptEvolutionController.getMilestones);

// ==================== 진화 애니메이션 ====================
// GET /api/evolution/animation?fromStage=2&toStage=3
router.get('/animation', aptEvolutionController.getEvolutionAnimation);

// ==================== 특정 행동 엔드포인트 ====================
// POST /api/evolution/artwork/view
router.post('/artwork/view', aptEvolutionController.viewArtwork);

// POST /api/evolution/exhibition/complete
router.post('/exhibition/complete', aptEvolutionController.completeExhibition);

module.exports = router;