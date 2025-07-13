const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { BehavioralInsightsService } = require('../services/behavioralInsightsService');
// const { captureException } = require('../config/sentry');
const captureException = (error, context) => {
  console.error('Insights error:', error.message, context);
};

// Track viewing behavior
router.post('/track-viewing', authenticate, async (req, res, next) => {
  try {
    const { artworkId, ...behaviorData } = req.body;
    
    await BehavioralInsightsService.trackViewingBehavior(
      req.userId,
      artworkId,
      behaviorData
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get viewing patterns analysis
router.get('/viewing-patterns', authenticate, async (req, res, next) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const patterns = await BehavioralInsightsService.analyzeViewingPatterns(
      req.userId,
      timeframe
    );

    res.json({ patterns });
  } catch (error) {
    next(error);
  }
});

// Get gallery path analysis
router.get('/gallery-path/:sessionId', authenticate, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const pathAnalysis = await BehavioralInsightsService.getGalleryPathAnalysis(
      req.userId,
      sessionId
    );

    res.json({ pathAnalysis });
  } catch (error) {
    next(error);
  }
});

// Get emotional journey mapping
router.get('/emotional-journey', authenticate, async (req, res, next) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const emotionalJourney = await BehavioralInsightsService.mapEmotionalJourney(
      req.userId,
      timeframe
    );

    res.json({ emotionalJourney });
  } catch (error) {
    next(error);
  }
});

// Get growth metrics
router.get('/growth-metrics', authenticate, async (req, res, next) => {
  try {
    const growthMetrics = await BehavioralInsightsService.analyzeGrowthMetrics(
      req.userId
    );

    res.json({ growthMetrics });
  } catch (error) {
    next(error);
  }
});

// Get personalized insights summary
router.get('/summary', authenticate, async (req, res, next) => {
  try {
    const [patterns, emotionalJourney, growthMetrics] = await Promise.all([
      BehavioralInsightsService.analyzeViewingPatterns(req.userId, '7d'),
      BehavioralInsightsService.mapEmotionalJourney(req.userId, '7d'),
      BehavioralInsightsService.analyzeGrowthMetrics(req.userId)
    ]);

    // Generate insights based on data
    const insights = generatePersonalizedInsights({
      patterns,
      emotionalJourney,
      growthMetrics
    });

    res.json({ 
      summary: {
        patterns,
        emotionalJourney,
        growthMetrics,
        insights
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to generate personalized insights
function generatePersonalizedInsights(data) {
  const insights = [];

  // Viewing pattern insights
  if (data.patterns?.dailyAverages) {
    const avgTime = Object.values(data.patterns.dailyAverages)
      .reduce((sum, day) => sum + day.avgTimeSpent, 0) / 
      Object.keys(data.patterns.dailyAverages).length;

    if (avgTime > 120) {
      insights.push({
        type: 'viewing_pattern',
        title: 'Deep Art Appreciator',
        description: 'You spend quality time with each artwork, truly absorbing the details.',
        metric: `${Math.round(avgTime)}s average viewing time`
      });
    }
  }

  // Emotional journey insights
  if (data.emotionalJourney?.dominantEmotions?.length) {
    const topEmotion = data.emotionalJourney.dominantEmotions[0];
    insights.push({
      type: 'emotional_pattern',
      title: `${topEmotion.emotion} Seeker`,
      description: `Your art journey is dominated by feelings of ${topEmotion.emotion.toLowerCase()}.`,
      metric: `${topEmotion.count} artworks evoked this emotion`
    });
  }

  // Growth insights
  if (data.growthMetrics?.expansionPattern) {
    const patterns = {
      'rapidly_expanding': {
        title: 'Artistic Explorer',
        description: 'You\'re rapidly expanding your artistic horizons!'
      },
      'steadily_exploring': {
        title: 'Steady Discoverer',
        description: 'You\'re consistently discovering new styles and artists.'
      },
      'socially_active': {
        title: 'Social Curator',
        description: 'You love sharing your art discoveries with others.'
      },
      'focused_appreciation': {
        title: 'Focused Connoisseur',
        description: 'You have refined taste and deep appreciation for specific styles.'
      }
    };

    const pattern = patterns[data.growthMetrics.expansionPattern] || patterns.focused_appreciation;
    insights.push({
      type: 'growth_pattern',
      ...pattern,
      metric: data.growthMetrics.expansionPattern
    });
  }

  return insights;
}

module.exports = router;