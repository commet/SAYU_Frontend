const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const gamificationController = require('../controllers/gamificationOptimizedController');
const { authenticateToken } = require('../middleware/auth');

// 미들웨어: 게이미피케이션 이벤트 트리거
const triggerGamificationEvent = (eventType) => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        // 비동기로 처리하여 API 응답 속도에 영향을 주지 않음
        process.nextTick(async () => {
          try {
            await gamificationController.earnXP({
              user: req.user,
              body: { eventType, metadata: req.gamificationMetadata || {} }
            }, { json: () => {} });
          } catch (error) {
            console.error(`Gamification event error (${eventType}):`, error);
          }
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// 사용자 통계
router.get('/stats', authenticateToken, gamificationController.getUserStats);

// 일일 퀘스트
router.get('/quests/daily', authenticateToken, gamificationController.getDailyQuests);

// 리더보드
router.get('/leaderboard', [
  query('type').optional().isIn(['weekly', 'monthly', 'all-time']),
  query('limit').optional().isInt({ min: 1, max: 100 })
], gamificationController.getLeaderboard);

// 특정 사용자 프로필
router.get('/profile/:userId', [
  param('userId').isInt()
], gamificationController.getUserProfile);

// XP 획득 엔드포인트
router.post('/earn-xp', authenticateToken, [
  body('eventType').notEmpty().isString(),
  body('metadata').optional().isObject()
], gamificationController.earnXP);

// 일일 로그인
router.post('/daily-login', authenticateToken, gamificationController.dailyLogin);

// 작품 감상
router.post('/view-artwork', authenticateToken, [
  body('artworkId').notEmpty()
], gamificationController.viewArtwork);

// 퀴즈 완료
router.post('/complete-quiz', authenticateToken, [
  body('quizType').notEmpty(),
  body('score').optional().isInt()
], gamificationController.completeQuiz);

// 팔로우
router.post('/follow-user', authenticateToken, [
  body('targetUserId').notEmpty().isInt()
], gamificationController.followUser);

// 작품 공유
router.post('/share-artwork', authenticateToken, [
  body('artworkId').notEmpty(),
  body('platform').notEmpty().isIn(['twitter', 'facebook', 'instagram', 'kakao'])
], gamificationController.shareArtwork);

// AI 프로필 생성
router.post('/create-ai-profile', authenticateToken, gamificationController.createAIProfile);

// 전시 방문
router.post('/visit-exhibition', authenticateToken, [
  body('exhibitionId').notEmpty(),
  body('exhibitionName').notEmpty()
], gamificationController.visitExhibition);

// 리뷰 작성
router.post('/write-review', authenticateToken, [
  body('targetId').notEmpty(),
  body('targetType').notEmpty().isIn(['artwork', 'exhibition', 'artist']),
  body('reviewLength').optional().isInt()
], gamificationController.writeReview);

// 좋아요 받기 (시스템 내부용)
router.post('/receive-like', authenticateToken, [
  body('contentId').notEmpty(),
  body('contentType').notEmpty().isIn(['review', 'artwork', 'profile'])
], gamificationController.receiveLike);

// 사용자 초기화 (회원가입 시)
router.post('/initialize', authenticateToken, gamificationController.initializeUser);

module.exports = { router, triggerGamificationEvent };
