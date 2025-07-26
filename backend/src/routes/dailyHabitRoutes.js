const express = require('express');
const router = express.Router();
const dailyHabitController = require('../controllers/dailyHabitController');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트는 인증 필요
router.use(authenticateToken);

// 습관 설정
router.get('/settings', dailyHabitController.getHabitSettings);
router.put('/settings', dailyHabitController.updateHabitSettings);

// 일일 기록
router.get('/today', dailyHabitController.getTodayEntry);
router.get('/entry/:date', dailyHabitController.getDateEntry);

// 시간대별 활동 기록
router.post('/morning', dailyHabitController.recordMorning);
router.post('/lunch', dailyHabitController.recordLunch);
router.post('/night', dailyHabitController.recordNight);

// 추천 작품
router.get('/recommendation/:timeSlot', dailyHabitController.getDailyRecommendation);

// 감정 체크인
router.post('/emotion/checkin', dailyHabitController.checkInEmotion);

// 푸시 알림
router.post('/push/subscribe', dailyHabitController.subscribePush);
router.post('/push/test', dailyHabitController.sendTestPush);

// 통계 및 분석
router.get('/streak', dailyHabitController.getStreak);
router.get('/patterns', dailyHabitController.getActivityPatterns);
router.get('/stats/:year/:month', dailyHabitController.getMonthlyStats);

module.exports = router;