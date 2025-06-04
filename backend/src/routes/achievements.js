const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { Achievement, UserAchievement, ProgressTracker } = require('../models/Achievement');
const { 
  validationSchemas, 
  handleValidationResult, 
  securityHeaders, 
  requestSizeLimiter,
  sanitizeInput,
  rateLimits 
} = require('../middleware/validation');
const { log } = require('../config/logger');

// Apply security middleware
router.use(securityHeaders);
router.use(sanitizeInput);
router.use(requestSizeLimiter('1mb'));
router.use(authMiddleware);

// Get all achievements with user progress
router.get('/', 
  rateLimits.lenient,
  async (req, res) => {
    try {
      const userId = req.userId;
      
      // Get all achievements
      const allAchievements = await Achievement.findAll();
      
      // Get user's unlocked achievements
      const userAchievements = await UserAchievement.findByUserId(userId);
      const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));
      
      // Combine data
      const achievementsWithProgress = allAchievements.map(achievement => ({
        ...achievement,
        unlocked: unlockedIds.has(achievement.id),
        unlocked_at: userAchievements.find(ua => ua.achievement_id === achievement.id)?.unlocked_at || null
      }));
      
      // Group by category
      const grouped = achievementsWithProgress.reduce((acc, achievement) => {
        if (!acc[achievement.category]) {
          acc[achievement.category] = [];
        }
        acc[achievement.category].push(achievement);
        return acc;
      }, {});
      
      res.json({
        achievements: grouped,
        total_achievements: allAchievements.length,
        unlocked_count: userAchievements.length
      });
      
    } catch (error) {
      log.error('Get achievements error', error, {
        userId: req.userId,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to fetch achievements' });
    }
  }
);

// Get user's achievement stats and progress
router.get('/stats',
  rateLimits.lenient,
  async (req, res) => {
    try {
      const userId = req.userId;
      
      // Get comprehensive stats
      const stats = await UserAchievement.getUserStats(userId);
      const progress = await ProgressTracker.getUserProgress(userId);
      
      // Calculate completion percentage
      const totalAchievements = await Achievement.findAll();
      const completionRate = totalAchievements.length > 0 
        ? (stats.total_achievements / totalAchievements.length * 100).toFixed(1)
        : 0;
      
      // Determine user level based on points
      const level = Math.floor(Math.sqrt(stats.total_points / 10)) + 1;
      const nextLevelPoints = Math.pow(level, 2) * 10;
      const pointsToNext = nextLevelPoints - stats.total_points;
      
      res.json({
        ...stats,
        progress: progress || {},
        completion_rate: parseFloat(completionRate),
        level,
        next_level_points: nextLevelPoints,
        points_to_next_level: Math.max(0, pointsToNext)
      });
      
    } catch (error) {
      log.error('Get achievement stats error', error, {
        userId: req.userId,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to fetch achievement stats' });
    }
  }
);

// Get user's recent achievements
router.get('/recent',
  rateLimits.lenient,
  async (req, res) => {
    try {
      const userId = req.userId;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      
      const achievements = await UserAchievement.findByUserId(userId);
      const recent = achievements
        .sort((a, b) => new Date(b.unlocked_at) - new Date(a.unlocked_at))
        .slice(0, limit);
      
      res.json({
        achievements: recent,
        count: recent.length
      });
      
    } catch (error) {
      log.error('Get recent achievements error', error, {
        userId: req.userId,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to fetch recent achievements' });
    }
  }
);

// Get achievements by category
router.get('/category/:category',
  rateLimits.lenient,
  async (req, res) => {
    try {
      const userId = req.userId;
      const { category } = req.params;
      
      const achievements = await Achievement.findByCategory(category);
      const userAchievements = await UserAchievement.findByUserId(userId);
      const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));
      
      const achievementsWithProgress = achievements.map(achievement => ({
        ...achievement,
        unlocked: unlockedIds.has(achievement.id),
        unlocked_at: userAchievements.find(ua => ua.achievement_id === achievement.id)?.unlocked_at || null
      }));
      
      res.json({
        category,
        achievements: achievementsWithProgress,
        total: achievements.length,
        unlocked: achievementsWithProgress.filter(a => a.unlocked).length
      });
      
    } catch (error) {
      log.error('Get achievements by category error', error, {
        userId: req.userId,
        category: req.params.category,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to fetch category achievements' });
    }
  }
);

// Update user progress (called by other parts of the app)
router.post('/progress',
  rateLimits.moderate,
  [
    validationSchemas.progressUpdate || [
      // Basic validation for progress updates
      require('express-validator').body('action')
        .isIn(['quiz_completed', 'artwork_viewed', 'artwork_liked', 'chat_message_sent', 'daily_login', 'profile_completed', 'exploration_day'])
        .withMessage('Invalid action type'),
      require('express-validator').body('metadata')
        .optional()
        .isObject()
        .withMessage('Metadata must be an object')
    ]
  ],
  handleValidationResult,
  async (req, res) => {
    try {
      const userId = req.userId;
      const { action, metadata = {} } = req.body;
      
      // Update progress and check for new achievements
      const updatedProgress = await ProgressTracker.updateUserProgress(userId, action, metadata);
      
      // Log user action for analytics
      log.userAction(userId, action, {
        metadata,
        progressUpdate: true
      });
      
      res.json({
        message: 'Progress updated successfully',
        progress: updatedProgress,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      log.error('Update progress error', error, {
        userId: req.userId,
        action: req.body.action,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to update progress' });
    }
  }
);

// Get leaderboard (top users by points)
router.get('/leaderboard',
  rateLimits.lenient,
  async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);
      const userId = req.userId;
      
      // Get top users by points
      const result = await require('../config/database').pool.query(`
        SELECT 
          u.id,
          u.username,
          u.nickname,
          COALESCE(SUM(a.points), 0) as total_points,
          COUNT(ua.achievement_id) as achievement_count,
          up.level
        FROM users u
        LEFT JOIN user_achievements ua ON u.id = ua.user_id
        LEFT JOIN achievements a ON ua.achievement_id = a.id
        LEFT JOIN (
          SELECT 
            user_id,
            FLOOR(SQRT(COALESCE(SUM(a.points), 0) / 10)) + 1 as level
          FROM user_achievements ua
          JOIN achievements a ON ua.achievement_id = a.id
          GROUP BY user_id
        ) up ON u.id = up.user_id
        WHERE u.created_at > NOW() - INTERVAL '90 days'
        GROUP BY u.id, u.username, u.nickname, up.level
        HAVING COUNT(ua.achievement_id) > 0
        ORDER BY total_points DESC, achievement_count DESC
        LIMIT $1
      `, [limit]);
      
      const leaderboard = result.rows.map((user, index) => ({
        rank: index + 1,
        ...user,
        total_points: parseInt(user.total_points),
        achievement_count: parseInt(user.achievement_count),
        level: parseInt(user.level) || 1,
        is_current_user: user.id === userId
      }));
      
      // Find current user's rank if not in top list
      let userRank = null;
      if (!leaderboard.find(u => u.is_current_user)) {
        const userRankResult = await require('../config/database').pool.query(`
          WITH ranked_users AS (
            SELECT 
              u.id,
              COALESCE(SUM(a.points), 0) as total_points,
              COUNT(ua.achievement_id) as achievement_count,
              ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(a.points), 0) DESC, COUNT(ua.achievement_id) DESC) as rank
            FROM users u
            LEFT JOIN user_achievements ua ON u.id = ua.user_id
            LEFT JOIN achievements a ON ua.achievement_id = a.id
            WHERE u.created_at > NOW() - INTERVAL '90 days'
            GROUP BY u.id
            HAVING COUNT(ua.achievement_id) > 0
          )
          SELECT rank, total_points, achievement_count
          FROM ranked_users
          WHERE id = $1
        `, [userId]);
        
        if (userRankResult.rows.length > 0) {
          userRank = {
            rank: parseInt(userRankResult.rows[0].rank),
            total_points: parseInt(userRankResult.rows[0].total_points),
            achievement_count: parseInt(userRankResult.rows[0].achievement_count)
          };
        }
      }
      
      res.json({
        leaderboard,
        user_rank: userRank,
        total_users: result.rowCount
      });
      
    } catch (error) {
      log.error('Get leaderboard error', error, {
        userId: req.userId,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  }
);

module.exports = router;