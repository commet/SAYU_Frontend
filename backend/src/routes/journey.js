const express = require('express');
const router = express.Router();
const journeyNudgeService = require('../services/journeyNudgeService');
const authMiddleware = require('../middleware/auth');
const { rateLimits } = require('../middleware/validation');

// 사용자 여정 상태 조회
router.get('/status', authMiddleware, rateLimits.moderate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const status = await journeyNudgeService.getUserJourneyStatus(userId);
    
    res.json({
      journey_days: status,
      total_days: 7,
      completed_days: status.filter(day => day.status === 'completed').length
    });
  } catch (error) {
    console.error('Journey status error:', error);
    res.status(500).json({ error: 'Failed to fetch journey status' });
  }
});

// 오늘의 안내 메시지 조회
router.get('/todays-nudge', authMiddleware, rateLimits.lenient, async (req, res) => {
  try {
    const userId = req.user.userId;
    const nudge = await journeyNudgeService.getTodaysNudge(userId);
    
    if (!nudge) {
      return res.json({ nudge: null, message: 'No nudge for today' });
    }
    
    res.json({ nudge });
  } catch (error) {
    console.error('Todays nudge error:', error);
    res.status(500).json({ error: 'Failed to fetch todays nudge' });
  }
});

// nudge 확인 처리
router.post('/nudge/:dayNumber/view', authMiddleware, rateLimits.moderate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const dayNumber = parseInt(req.params.dayNumber);
    
    if (dayNumber < 1 || dayNumber > 7) {
      return res.status(400).json({ error: 'Invalid day number' });
    }
    
    const result = await journeyNudgeService.markNudgeAsViewed(userId, dayNumber);
    
    res.json({
      message: 'Nudge marked as viewed',
      nudge: result
    });
  } catch (error) {
    console.error('Mark nudge viewed error:', error);
    res.status(500).json({ error: 'Failed to mark nudge as viewed' });
  }
});

// nudge 클릭 처리
router.post('/nudge/:dayNumber/click', authMiddleware, rateLimits.moderate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const dayNumber = parseInt(req.params.dayNumber);
    
    if (dayNumber < 1 || dayNumber > 7) {
      return res.status(400).json({ error: 'Invalid day number' });
    }
    
    const result = await journeyNudgeService.markNudgeAsClicked(userId, dayNumber);
    
    res.json({
      message: 'Nudge action completed',
      nudge: result
    });
  } catch (error) {
    console.error('Mark nudge clicked error:', error);
    res.status(500).json({ error: 'Failed to mark nudge as clicked' });
  }
});

// 여정 통계 (관리자용)
router.get('/stats', rateLimits.strict, async (req, res) => {
  try {
    const stats = await journeyNudgeService.getJourneyStats();
    res.json(stats);
  } catch (error) {
    console.error('Journey stats error:', error);
    res.status(500).json({ error: 'Failed to fetch journey statistics' });
  }
});

module.exports = router;