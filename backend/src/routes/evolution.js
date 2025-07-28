const express = require('express');
const router = express.Router();
const evolutionService = require('../services/evolutionService');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

// Middleware to ensure user is authenticated
router.use(authMiddleware);

// Award points for an activity
router.post('/award-points', async (req, res) => {
  try {
    const { activityType, activityData } = req.body;
    const userId = req.user.id;

    if (!activityType) {
      return res.status(400).json({ error: 'Activity type is required' });
    }

    const result = await evolutionService.awardPoints(userId, activityType, activityData);

    if (!result) {
      return res.status(429).json({
        error: 'Activity limited',
        message: 'You have already performed this activity recently'
      });
    }

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error awarding points:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process identity evolution
router.post('/evolve', async (req, res) => {
  try {
    const { newIdentityType, reason = 'quiz_retake' } = req.body;
    const userId = req.user.id;

    if (!newIdentityType || newIdentityType.length !== 4) {
      return res.status(400).json({ error: 'Valid identity type required' });
    }

    const result = await evolutionService.processEvolution(userId, newIdentityType, reason);

    res.json({
      success: true,
      evolution: result
    });
  } catch (error) {
    logger.error('Error processing evolution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's evolution history
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await evolutionService.getEvolutionHistory(userId);

    res.json({
      success: true,
      history
    });
  } catch (error) {
    logger.error('Error getting evolution history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activities for timeline
router.get('/activities', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const activities = await evolutionService.getRecentActivities(userId, limit);

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    logger.error('Error getting activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get evolution statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await evolutionService.getEvolutionStats(userId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Error getting evolution stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user can evolve
router.get('/can-evolve', async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await evolutionService.getEvolutionStats(userId);

    const canEvolve = stats.currentUser &&
      stats.currentUser.evolution_points >= 100;

    res.json({
      success: true,
      canEvolve,
      currentPoints: stats.currentUser?.evolution_points || 0,
      pointsNeeded: Math.max(0, 100 - (stats.currentUser?.evolution_points || 0))
    });
  } catch (error) {
    logger.error('Error checking evolution eligibility:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to track common activities automatically
router.use('/track/:activityType', async (req, res, next) => {
  try {
    const { activityType } = req.params;
    const userId = req.user.id;
    const activityData = req.body;

    // Award points in background (don't wait)
    evolutionService.awardPoints(userId, activityType.toUpperCase(), activityData)
      .catch(error => logger.error('Background point award failed:', error));

    next();
  } catch (error) {
    logger.error('Error in activity tracking middleware:', error);
    next();
  }
});

// Track gallery visit
router.post('/track/gallery-visit', (req, res) => {
  res.json({ success: true, message: 'Gallery visit tracked' });
});

// Track artwork view
router.post('/track/artwork-view', (req, res) => {
  res.json({ success: true, message: 'Artwork view tracked' });
});

// Track community activity
router.post('/track/community-activity', (req, res) => {
  res.json({ success: true, message: 'Community activity tracked' });
});

// Daily login tracking
router.post('/daily-login', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await evolutionService.awardPoints(userId, 'DAILY_LOGIN', {
      loginTime: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    });

    if (!result) {
      return res.json({
        success: true,
        message: 'Already logged in today',
        alreadyAwarded: true
      });
    }

    res.json({
      success: true,
      message: 'Daily login bonus awarded',
      pointsAwarded: result.pointsAwarded,
      totalPoints: result.totalPoints
    });
  } catch (error) {
    logger.error('Error tracking daily login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
