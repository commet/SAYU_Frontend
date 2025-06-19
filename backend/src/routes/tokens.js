const express = require('express');
const router = express.Router();
const quizTokenService = require('../services/quizTokenService');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

// Middleware to ensure user is authenticated
router.use(authMiddleware);

// Get user's token balance and status
router.get('/balance', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const balance = await quizTokenService.getBalance(userId);
    const canTakeQuiz = await quizTokenService.canTakeQuiz(userId);
    
    res.json({
      success: true,
      balance,
      canTakeQuiz: canTakeQuiz.canTake,
      quizEligibility: canTakeQuiz
    });
  } catch (error) {
    logger.error('Error getting token balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Award tokens for activity
router.post('/award', async (req, res) => {
  try {
    const { activityType, activityData } = req.body;
    const userId = req.user.id;

    if (!activityType) {
      return res.status(400).json({ error: 'Activity type is required' });
    }

    const result = await quizTokenService.awardTokens(userId, activityType, activityData);
    
    if (!result) {
      return res.json({ 
        success: false,
        message: 'Unknown activity type'
      });
    }

    if (result.limitReached && result.awarded === 0) {
      return res.json({
        success: false,
        message: 'Daily limit reached for this activity',
        limitReached: true
      });
    }

    res.json({
      success: true,
      tokensAwarded: result.awarded,
      newBalance: result.newBalance,
      limitReached: result.limitReached,
      maxReached: result.maxReached
    });
  } catch (error) {
    logger.error('Error awarding tokens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process quiz payment
router.post('/pay-for-quiz', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await quizTokenService.processQuizPayment(userId);
    
    if (result.success === false) {
      return res.status(400).json({
        error: result.error || result.reason,
        ...result
      });
    }
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error processing quiz payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction history
router.get('/transactions', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    
    const transactions = await quizTokenService.getTransactionHistory(userId, limit);
    
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    logger.error('Error getting transaction history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get earning opportunities
router.get('/earning-opportunities', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const opportunities = await quizTokenService.getEarningOpportunities(userId);
    
    res.json({
      success: true,
      opportunities
    });
  } catch (error) {
    logger.error('Error getting earning opportunities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simulate token purchase (for UI preview)
router.get('/purchase-options', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const packages = ['single', 'bundle', 'unlimited_month'];
    const options = [];
    
    for (const packageType of packages) {
      try {
        const option = await quizTokenService.simulatePurchase(userId, packageType);
        options.push(option);
      } catch (error) {
        logger.warn(`Error simulating purchase for ${packageType}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      packages: options,
      note: 'Purchase functionality not yet implemented'
    });
  } catch (error) {
    logger.error('Error getting purchase options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check quiz eligibility
router.get('/quiz-eligibility', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const eligibility = await quizTokenService.canTakeQuiz(userId);
    
    res.json({
      success: true,
      ...eligibility
    });
  } catch (error) {
    logger.error('Error checking quiz eligibility:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Daily login bonus
router.post('/daily-login', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await quizTokenService.awardTokens(userId, 'DAILY_LOGIN', {
      loginTime: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    });
    
    if (!result || (result.limitReached && result.awarded === 0)) {
      return res.json({
        success: true,
        message: 'Daily login already claimed today',
        alreadyClaimed: true
      });
    }
    
    res.json({
      success: true,
      message: 'Daily login bonus awarded!',
      tokensAwarded: result.awarded,
      newBalance: result.newBalance
    });
  } catch (error) {
    logger.error('Error processing daily login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Activity tracking endpoints
router.post('/track/gallery-visit', async (req, res) => {
  try {
    const userId = req.user.id;
    const { galleryName, location } = req.body;
    
    const result = await quizTokenService.awardTokens(userId, 'GALLERY_VISIT', {
      galleryName,
      location,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Gallery visit tracked',
      tokensAwarded: result?.awarded || 0,
      newBalance: result?.newBalance
    });
  } catch (error) {
    logger.error('Error tracking gallery visit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/track/artwork-interaction', async (req, res) => {
  try {
    const userId = req.user.id;
    const { artworkId, artworkTitle, interactionType } = req.body;
    
    const result = await quizTokenService.awardTokens(userId, 'ARTWORK_INTERACTION', {
      artworkId,
      artworkTitle,
      interactionType,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Artwork interaction tracked',
      tokensAwarded: result?.awarded || 0,
      newBalance: result?.newBalance
    });
  } catch (error) {
    logger.error('Error tracking artwork interaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/track/community-activity', async (req, res) => {
  try {
    const userId = req.user.id;
    const { activityType, details } = req.body; // 'COMMUNITY_POST' or 'COMMUNITY_COMMENT'
    
    if (!['COMMUNITY_POST', 'COMMUNITY_COMMENT'].includes(activityType)) {
      return res.status(400).json({ error: 'Invalid community activity type' });
    }
    
    const result = await quizTokenService.awardTokens(userId, activityType, {
      ...details,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Community activity tracked',
      tokensAwarded: result?.awarded || 0,
      newBalance: result?.newBalance
    });
  } catch (error) {
    logger.error('Error tracking community activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/track/card-exchange', async (req, res) => {
  try {
    const userId = req.user.id;
    const { partnerId, partnerName } = req.body;
    
    const result = await quizTokenService.awardTokens(userId, 'CARD_EXCHANGE', {
      partnerId,
      partnerName,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Card exchange tracked',
      tokensAwarded: result?.awarded || 0,
      newBalance: result?.newBalance
    });
  } catch (error) {
    logger.error('Error tracking card exchange:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;