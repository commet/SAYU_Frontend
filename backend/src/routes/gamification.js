// 🎨 SAYU Gamification API Routes
// 포인트, 미션, 업적 관련 API 엔드포인트

const express = require('express');
const router = express.Router();
const gamificationService = require('../services/gamificationService');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// 사용자 포인트 정보 조회
router.get('/points', authenticate, async (req, res) => {
  try {
    const userPoints = await gamificationService.getUserPoints(req.user.id);
    res.json(userPoints);
  } catch (error) {
    console.error('Error fetching user points:', error);
    res.status(500).json({ error: 'Failed to fetch user points' });
  }
});

// 포인트 추가 (관리자용 또는 시스템 이벤트)
router.post('/points/add', 
  authenticate,
  [
    body('activity').isString().notEmpty(),
    body('metadata').optional().isObject()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { activity, metadata } = req.body;
      const result = await gamificationService.addPoints(
        req.user.id,
        activity,
        metadata
      );
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error adding points:', error);
      res.status(500).json({ error: 'Failed to add points' });
    }
  }
);

// 미션 진행도 업데이트
router.post('/missions/progress',
  authenticate,
  [
    body('missionId').isUUID(),
    body('progress').isInt({ min: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { missionId, progress } = req.body;
      const result = await gamificationService.updateMissionProgress(
        req.user.id,
        missionId,
        progress
      );
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error updating mission:', error);
      res.status(500).json({ error: 'Failed to update mission progress' });
    }
  }
);

// 업적 잠금 해제
router.post('/achievements/unlock',
  authenticate,
  [
    body('achievementId').isString().notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { achievementId } = req.body;
      const achievement = await gamificationService.unlockAchievement(
        req.user.id,
        achievementId
      );
      
      if (achievement) {
        res.json({
          success: true,
          achievement
        });
      } else {
        res.json({
          success: false,
          message: 'Achievement already unlocked'
        });
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      res.status(500).json({ error: 'Failed to unlock achievement' });
    }
  }
);

// 전시 방문 기록
router.post('/exhibitions/visit',
  authenticate,
  [
    body('exhibitionId').isString().notEmpty(),
    body('exhibitionName').isString().notEmpty(),
    body('companionId').optional().isUUID(),
    body('companionType').optional().isString().isLength({ min: 4, max: 4 }),
    body('compatibilityLevel').optional().isIn(['platinum', 'gold', 'silver', 'bronze']),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('review').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const visit = await gamificationService.recordExhibitionVisit(
        req.user.id,
        req.body
      );
      
      res.json({
        success: true,
        visit
      });
    } catch (error) {
      console.error('Error recording exhibition visit:', error);
      res.status(500).json({ error: 'Failed to record exhibition visit' });
    }
  }
);

// 리더보드 조회
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const { period = 'all', limit = 50 } = req.query;
    
    const UserPoints = require('../models/Gamification').UserPoints;
    const User = require('../models/User').User;
    
    let whereClause = {};
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      whereClause.updatedAt = { [Op.gte]: weekAgo };
    } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      whereClause.updatedAt = { [Op.gte]: monthAgo };
    }
    
    const leaderboard = await UserPoints.findAll({
      where: whereClause,
      order: [['totalPoints', 'DESC']],
      limit: parseInt(limit),
      include: [{
        model: User,
        attributes: ['id', 'nickname', 'email']
      }]
    });
    
    // 현재 사용자 순위
    const userRank = await UserPoints.count({
      where: {
        totalPoints: {
          [Op.gt]: leaderboard.find(u => u.userId === req.user.id)?.totalPoints || 0
        }
      }
    }) + 1;
    
    res.json({
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        nickname: entry.User.nickname,
        totalPoints: entry.totalPoints,
        level: entry.level,
        levelName: entry.levelName,
        levelNameKo: entry.levelNameKo
      })),
      userRank
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// 사용자 통계
router.get('/stats', authenticate, async (req, res) => {
  try {
    const PointActivity = require('../models/Gamification').PointActivity;
    const { Op } = require('sequelize');
    
    // 최근 30일 활동
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activities = await PointActivity.findAll({
      where: {
        userId: req.user.id,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      order: [['createdAt', 'DESC']]
    });
    
    // 활동 유형별 통계
    const activityStats = {};
    activities.forEach(activity => {
      if (!activityStats[activity.activityType]) {
        activityStats[activity.activityType] = {
          count: 0,
          totalPoints: 0
        };
      }
      activityStats[activity.activityType].count++;
      activityStats[activity.activityType].totalPoints += activity.points;
    });
    
    res.json({
      recentActivities: activities.slice(0, 10),
      activityStats,
      totalActivities: activities.length,
      pointsLast30Days: activities.reduce((sum, a) => sum + a.points, 0)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;