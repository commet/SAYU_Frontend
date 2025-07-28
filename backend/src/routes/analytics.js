const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');
const { logger } = require('../config/logger');

router.use(authMiddleware);

// Get comprehensive user analytics report
router.get('/user-report', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const report = await analyticsService.generateUserReport(req.userId, timeframe);

    res.json(report);
  } catch (error) {
    logger.error('Failed to get user analytics report:', error);
    res.status(500).json({ error: 'Failed to get analytics report' });
  }
});

// Get user journey statistics
router.get('/journey-stats', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const stats = await analyticsService.getUserJourneyStats(req.userId, timeframe);

    res.json({ stats });
  } catch (error) {
    logger.error('Failed to get journey stats:', error);
    res.status(500).json({ error: 'Failed to get journey statistics' });
  }
});

// Get aesthetic evolution data
router.get('/aesthetic-evolution', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const evolution = await analyticsService.getAestheticEvolution(req.userId, timeframe);

    res.json(evolution);
  } catch (error) {
    logger.error('Failed to get aesthetic evolution:', error);
    res.status(500).json({ error: 'Failed to get aesthetic evolution data' });
  }
});

// Get engagement patterns
router.get('/engagement-patterns', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const patterns = await analyticsService.getEngagementPatterns(req.userId, timeframe);

    res.json(patterns);
  } catch (error) {
    logger.error('Failed to get engagement patterns:', error);
    res.status(500).json({ error: 'Failed to get engagement patterns' });
  }
});

// Get discovery analytics
router.get('/discovery', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const discovery = await analyticsService.getDiscoveryAnalytics(req.userId, timeframe);

    res.json(discovery);
  } catch (error) {
    logger.error('Failed to get discovery analytics:', error);
    res.status(500).json({ error: 'Failed to get discovery analytics' });
  }
});

// Get AI interaction analytics
router.get('/ai-interactions', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const aiAnalytics = await analyticsService.getAIInteractionAnalytics(req.userId, timeframe);

    res.json(aiAnalytics);
  } catch (error) {
    logger.error('Failed to get AI interaction analytics:', error);
    res.status(500).json({ error: 'Failed to get AI interaction analytics' });
  }
});

// Get achievement analytics
router.get('/achievements', async (req, res) => {
  try {
    const achievements = await analyticsService.getAchievementAnalytics(req.userId);

    res.json(achievements);
  } catch (error) {
    logger.error('Failed to get achievement analytics:', error);
    res.status(500).json({ error: 'Failed to get achievement analytics' });
  }
});

// Get comparative analytics (vs others with same type)
router.get('/comparative', async (req, res) => {
  try {
    const comparative = await analyticsService.getComparativeAnalytics(req.userId);

    res.json(comparative);
  } catch (error) {
    logger.error('Failed to get comparative analytics:', error);
    res.status(500).json({ error: 'Failed to get comparative analytics' });
  }
});

// Get platform-wide analytics (admin only)
router.get('/platform', async (req, res) => {
  try {
    // Check if user is admin
    const userQuery = 'SELECT role FROM users WHERE id = $1';
    const { pool } = require('../config/database');
    const userResult = await pool.query(userQuery, [req.userId]);

    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { timeframe = '30d' } = req.query;
    const platformAnalytics = await analyticsService.getPlatformAnalytics(timeframe);

    res.json(platformAnalytics);
  } catch (error) {
    logger.error('Failed to get platform analytics:', error);
    res.status(500).json({ error: 'Failed to get platform analytics' });
  }
});

// Track user interaction
router.post('/track-interaction', async (req, res) => {
  try {
    const {
      artwork_id,
      interaction_type,
      time_spent = 0,
      discovery_source = 'direct'
    } = req.body;

    if (!artwork_id || !interaction_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { pool } = require('../config/database');

    const query = `
      INSERT INTO user_artwork_interactions 
      (user_id, artwork_id, interaction_type, time_spent, discovery_source)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const result = await pool.query(query, [
      req.userId,
      artwork_id,
      interaction_type,
      time_spent,
      discovery_source
    ]);

    logger.info(`User interaction tracked: ${interaction_type} on ${artwork_id} by user ${req.userId}`);
    res.json({ success: true, interactionId: result.rows[0].id });
  } catch (error) {
    logger.error('Failed to track interaction:', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
});

// Track AI conversation
router.post('/track-conversation', async (req, res) => {
  try {
    const {
      conversation_id,
      message_count = 1,
      topics = [],
      sentiment = 'neutral'
    } = req.body;

    const { pool } = require('../config/database');

    const query = `
      INSERT INTO agent_conversations 
      (user_id, conversation_id, message_count, topics, sentiment, last_message_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (conversation_id) 
      DO UPDATE SET 
        message_count = $3,
        topics = $4,
        sentiment = $5,
        last_message_at = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const result = await pool.query(query, [
      req.userId,
      conversation_id,
      message_count,
      topics,
      sentiment
    ]);

    logger.info(`AI conversation tracked: ${conversation_id} by user ${req.userId}`);
    res.json({ success: true, conversationId: result.rows[0].id });
  } catch (error) {
    logger.error('Failed to track conversation:', error);
    res.status(500).json({ error: 'Failed to track conversation' });
  }
});

module.exports = router;
