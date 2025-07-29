const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const ProfileModel = require('../models/Profile');
const { redisClient } = require('../config/redis');
const CacheService = require('../services/cacheService');
const {
  validationSchemas,
  handleValidationResult,
  securityHeaders,
  requestSizeLimiter,
  sanitizeInput,
  rateLimits
} = require('../middleware/validation');
const { query, param } = require('express-validator');

// Apply security middleware
router.use(securityHeaders);
router.use(sanitizeInput);
router.use(requestSizeLimiter('2mb'));
router.use(authMiddleware);

// Validation schemas for artwork routes
const recommendationsValidation = [
  query('category')
    .optional()
    .isIn([
      'paintings', 'sculpture', 'modern', 'contemporary', 'photography',
      // 아시아 미술 세분화
      'asian-art', 'korean-art', 'japanese-art', 'chinese-art', 'indian-art', 'southeast-asian-art',
      // 3D 미술 및 조각
      'sculpture-classical', 'sculpture-modern', 'installation-art', 'ceramic-art',
      // 현대 미디어 아트
      'digital-art', 'video-art', 'interactive-art', 'new-media',
      // 사진 예술 세분화
      'photography-portrait', 'photography-landscape', 'photography-documentary', 'photography-conceptual',
      // 기타 전통 및 민속 예술
      'folk-art', 'textile-art', 'calligraphy', 'printmaking'
    ])
    .withMessage('Invalid category'),

  query('count')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Count must be between 1 and 50')
];

const interactionsValidation = [
  query('action')
    .optional()
    .isIn(['view', 'like', 'unlike', 'dislike', 'share', 'save'])
    .withMessage('Invalid action filter'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Get personalized artwork recommendations
router.get('/recommendations',
  rateLimits.lenient,
  recommendationsValidation,
  handleValidationResult,
  async (req, res) => {
    try {
      const { userId } = req;
      const { category, count = 20 } = req.query;

      // Check cache first
      const cached = await CacheService.getRecommendations(userId, category || 'paintings');
      if (cached) {
        return res.json(cached);
      }

      // Get user profile for personalization
      const profile = await ProfileModel.findByUserId(userId);

      const recommendations = {
        category: category || 'paintings',
        searchTerms: getSearchTermsForProfile(profile),
        suggestions: [
          'Try exploring abstract art based on your preference for conceptual thinking',
          'Landscapes might resonate with your contemplative nature',
          'Consider browsing modern art for fresh perspectives'
        ],
        metApiConfig: {
          departmentIds: getDepartmentIdsForProfile(profile),
          hasImages: true,
          isHighlight: category === 'highlights'
        }
      };

      // Cache recommendations for 1 hour
      await CacheService.setRecommendations(userId, category || 'paintings', recommendations, 3600);

      res.json(recommendations);
    } catch (error) {
      console.error('Get artwork recommendations error:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  });

// Track user artwork interactions
router.post('/interactions',
  rateLimits.lenient,
  validationSchemas.artworkInteraction,
  handleValidationResult,
  async (req, res) => {
    try {
      const { userId } = req;
      const { artworkId, action, metadata } = req.body;

      // Store interaction in Redis for quick access
      const interactionKey = `interactions:${userId}`;
      const interaction = {
        artworkId,
        action, // 'view', 'like', 'dislike', 'share'
        timestamp: new Date().toISOString(),
        metadata: metadata || {}
      };

      // Add to user's interaction list (keep last 100)
      const interactions = await redisClient().lRange(interactionKey, 0, -1);
      const parsedInteractions = interactions.map(i => JSON.parse(i));
      parsedInteractions.unshift(interaction);

      // Keep only last 100 interactions
      const limitedInteractions = parsedInteractions.slice(0, 100);

      // Clear and repopulate
      await redisClient().del(interactionKey);
      for (const inter of limitedInteractions) {
        await redisClient().lPush(interactionKey, JSON.stringify(inter));
      }

      // Set expiration (30 days)
      await redisClient().expire(interactionKey, 30 * 24 * 60 * 60);

      res.json({
        message: 'Interaction recorded',
        totalInteractions: limitedInteractions.length
      });
    } catch (error) {
      console.error('Record interaction error:', error);
      res.status(500).json({ error: 'Failed to record interaction' });
    }
  });

// Get user's artwork interactions
router.get('/interactions',
  rateLimits.lenient,
  interactionsValidation,
  handleValidationResult,
  async (req, res) => {
    try {
      const { userId } = req;
      const { action, limit = 50 } = req.query;

      const interactionKey = `interactions:${userId}`;
      const interactions = await redisClient().lRange(interactionKey, 0, parseInt(limit) - 1);

      let parsedInteractions = interactions.map(i => JSON.parse(i));

      // Filter by action if specified
      if (action) {
        parsedInteractions = parsedInteractions.filter(i => i.action === action);
      }

      // Group by action for summary
      const summary = parsedInteractions.reduce((acc, interaction) => {
        acc[interaction.action] = (acc[interaction.action] || 0) + 1;
        return acc;
      }, {});

      res.json({
        interactions: parsedInteractions,
        summary,
        total: parsedInteractions.length
      });
    } catch (error) {
      console.error('Get interactions error:', error);
      res.status(500).json({ error: 'Failed to get interactions' });
    }
  });

// Get daily personalized artwork recommendation
router.get('/daily', async (req, res) => {
  try {
    const { userId } = req;
    const profile = await ProfileModel.findByUserId(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Check if user has a daily recommendation cached
    const dailyKey = `daily:${userId}:${new Date().toDateString()}`;
    const cached = await redisClient().get(dailyKey);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Get user's interaction history to avoid repeats
    const interactionKey = `interactions:${userId}`;
    const interactions = await redisClient().lRange(interactionKey, 0, -1);
    const viewedArtworkIds = interactions
      .map(i => JSON.parse(i))
      .filter(i => i.action === 'view')
      .map(i => i.artworkId);

    // Generate personalized recommendation
    const searchTerms = getSearchTermsForProfile(profile);
    const departmentIds = getDepartmentIdsForProfile(profile);

    // Rotate search terms based on day of year to ensure variety
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const selectedTerm = searchTerms[dayOfYear % searchTerms.length];
    const selectedDept = departmentIds[dayOfYear % departmentIds.length];

    const recommendation = {
      date: new Date().toISOString(),
      profile: {
        typeCode: profile.type_code,
        archetypeName: profile.archetype_name
      },
      recommendation: {
        searchTerm: selectedTerm,
        departmentId: selectedDept,
        category: getDailyCategoryForProfile(profile, dayOfYear),
        theme: getDailyThemeForProfile(profile, dayOfYear),
        message: generateDailyMessage(profile, selectedTerm)
      },
      suggestions: [
        'Explore this artwork in detail',
        'Find similar pieces',
        'Save to your favorites',
        'Share your thoughts with the curator'
      ]
    };

    // Cache for 24 hours
    await redisClient().setEx(dailyKey, 24 * 60 * 60, JSON.stringify(recommendation));

    res.json(recommendation);
  } catch (error) {
    console.error('Get daily recommendation error:', error);
    res.status(500).json({ error: 'Failed to get daily recommendation' });
  }
});

// Get weekly art journey insights
router.get('/weekly-journey', async (req, res) => {
  try {
    const { userId } = req;
    const profile = await ProfileModel.findByUserId(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get past week's interactions
    const interactionKey = `interactions:${userId}`;
    const interactions = await redisClient().lRange(interactionKey, 0, -1);
    const parsedInteractions = interactions.map(i => JSON.parse(i));

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyInteractions = parsedInteractions.filter(i =>
      new Date(i.timestamp) > oneWeekAgo
    );

    const weeklyStats = {
      viewedCount: weeklyInteractions.filter(i => i.action === 'view').length,
      likedCount: weeklyInteractions.filter(i => i.action === 'like').length,
      explorationDays: [...new Set(
        weeklyInteractions.map(i => new Date(i.timestamp).toDateString())
      )].length
    };

    const journey = {
      week: new Date().toISOString(),
      profile: {
        typeCode: profile.type_code,
        archetypeName: profile.archetype_name
      },
      stats: weeklyStats,
      insights: generateWeeklyInsights(profile, weeklyStats, weeklyInteractions),
      nextWeekSuggestions: generateNextWeekSuggestions(profile, weeklyStats),
      streak: calculateExplorationStreak(parsedInteractions)
    };

    res.json(journey);
  } catch (error) {
    console.error('Get weekly journey error:', error);
    res.status(500).json({ error: 'Failed to get weekly journey' });
  }
});

// Get artwork insights based on user behavior
router.get('/insights', async (req, res) => {
  try {
    const { userId } = req;
    const profile = await ProfileModel.findByUserId(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const interactionKey = `interactions:${userId}`;
    const interactions = await redisClient().lRange(interactionKey, 0, -1);
    const parsedInteractions = interactions.map(i => JSON.parse(i));

    // Analyze user preferences
    const likedArtworks = parsedInteractions.filter(i => i.action === 'like');
    const viewedArtworks = parsedInteractions.filter(i => i.action === 'view');

    const insights = {
      profile: {
        typeCode: profile.type_code,
        archetypeName: profile.archetype_name,
        emotionalTags: profile.emotional_tags
      },
      behavior: {
        totalViews: viewedArtworks.length,
        totalLikes: likedArtworks.length,
        engagementRate: viewedArtworks.length > 0 ? (likedArtworks.length / viewedArtworks.length) * 100 : 0
      },
      recommendations: {
        exploreMore: getExplorationSuggestions(profile, parsedInteractions),
        personalizedTips: getPersonalizedTips(profile, parsedInteractions)
      }
    };

    res.json(insights);
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

// Helper functions
function getSearchTermsForProfile(profile) {
  if (!profile) return ['art', 'painting', 'masterpiece'];

  const emotionalTags = profile.emotional_tags || [];
  const typeCode = profile.type_code || '';

  const searchMapping = {
    'contemplative': ['meditation', 'peaceful', 'serene'],
    'energetic': ['dynamic', 'vibrant', 'movement'],
    'introspective': ['portrait', 'solitude', 'reflection'],
    'curious': ['landscape', 'exploration', 'discovery'],
    'emotional': ['expressionism', 'abstract', 'color'],
    'analytical': ['geometric', 'structure', 'composition']
  };

  const terms = [];

  // Add terms based on emotional tags
  emotionalTags.forEach(tag => {
    if (searchMapping[tag.toLowerCase()]) {
      terms.push(...searchMapping[tag.toLowerCase()]);
    }
  });

  // Add terms based on type code
  if (typeCode.includes('A')) terms.push('abstract', 'modern');
  if (typeCode.includes('R')) terms.push('realistic', 'portrait');
  if (typeCode.includes('E')) terms.push('expressive', 'emotional');
  if (typeCode.includes('M')) terms.push('classical', 'detailed');

  return terms.length > 0 ? [...new Set(terms)] : ['art', 'painting'];
}

function getDepartmentIdsForProfile(profile) {
  if (!profile) return [11]; // Default to American Paintings

  const typeCode = profile.type_code || '';
  const emotionalTags = profile.emotional_tags || [];

  const departments = [11]; // Always include American Paintings

  // Add departments based on type preferences
  if (typeCode.includes('A')) departments.push(21); // Modern Art
  if (typeCode.includes('S')) departments.push(6);  // Asian Art (social/shared experiences)
  if (emotionalTags.includes('traditional')) departments.push(14); // European Paintings

  return [...new Set(departments)];
}

function getExplorationSuggestions(profile, interactions) {
  const suggestions = [
    'Try exploring a new art period to expand your aesthetic horizons',
    'Consider viewing sculpture to experience art in three dimensions',
    'Browse photography for a different perspective on visual storytelling'
  ];

  const likedCount = interactions.filter(i => i.action === 'like').length;

  if (likedCount < 5) {
    suggestions.unshift('Spend more time exploring to discover your preferences');
  }

  return suggestions.slice(0, 3);
}

function getPersonalizedTips(profile, interactions) {
  const tips = [];

  if (profile.type_code?.includes('G')) {
    tips.push('You prefer personal art experiences - try visiting smaller galleries');
  }

  if (profile.type_code?.includes('E')) {
    tips.push('Your emotional nature might enjoy expressionist and abstract works');
  }

  const viewedCount = interactions.filter(i => i.action === 'view').length;
  if (viewedCount > 20) {
    tips.push('You\'re an active art explorer! Consider documenting your journey');
  }

  return tips.slice(0, 2);
}

function getDailyCategoryForProfile(profile, dayOfYear) {
  const baseCategories = [
    'paintings', 'sculpture', 'modern', 'contemporary', 'photography',
    'asian-art', 'korean-art', 'japanese-art', 'chinese-art', 'indian-art',
    'sculpture-classical', 'sculpture-modern', 'installation-art', 'ceramic-art',
    'digital-art', 'video-art', 'interactive-art', 'new-media',
    'photography-portrait', 'photography-landscape', 'photography-documentary',
    'folk-art', 'textile-art', 'calligraphy', 'printmaking'
  ];
  
  const typeCode = profile.type_code || '';
  const emotionalTags = profile.emotional_tags || [];

  // Bias categories based on profile
  let weightedCategories = [...baseCategories];

  // APT 유형별 선호 카테고리 추가
  if (typeCode.includes('A')) {
    weightedCategories.push('modern', 'contemporary', 'digital-art', 'interactive-art', 'new-media');
  }
  if (typeCode.includes('R')) {
    weightedCategories.push('paintings', 'photography-portrait', 'sculpture-classical');
  }
  if (typeCode.includes('S')) {
    weightedCategories.push('asian-art', 'korean-art', 'japanese-art', 'installation-art', 'folk-art');
  }
  if (typeCode.includes('E')) {
    weightedCategories.push('contemporary', 'video-art', 'photography-conceptual', 'textile-art');
  }

  // 감정 태그별 추가 가중치
  if (emotionalTags.includes('contemplative')) {
    weightedCategories.push('calligraphy', 'photography-landscape', 'sculpture-classical');
  }
  if (emotionalTags.includes('traditional')) {
    weightedCategories.push('folk-art', 'textile-art', 'ceramic-art', 'printmaking');
  }
  if (emotionalTags.includes('innovative')) {
    weightedCategories.push('digital-art', 'new-media', 'interactive-art', 'video-art');
  }

  return weightedCategories[dayOfYear % weightedCategories.length];
}

function getDailyThemeForProfile(profile, dayOfYear) {
  const themes = [
    'Contemplative Moments',
    'Vibrant Expressions',
    'Timeless Beauty',
    'Modern Perspectives',
    'Cultural Heritage',
    'Emotional Resonance',
    'Artistic Innovation'
  ];

  const emotionalTags = profile.emotional_tags || [];

  // Customize themes based on emotional tags
  if (emotionalTags.includes('contemplative')) {
    themes.unshift('Meditative Spaces', 'Quiet Reflections');
  }
  if (emotionalTags.includes('energetic')) {
    themes.unshift('Dynamic Movement', 'Bold Colors');
  }

  return themes[dayOfYear % themes.length];
}

function generateDailyMessage(profile, searchTerm) {
  const messages = [
    `Today's art journey focuses on "${searchTerm}" - perfect for your ${profile.archetype_name} nature.`,
    `As a ${profile.archetype_name}, you'll find deep meaning in today's "${searchTerm}" exploration.`,
    `Your aesthetic sensibility as a ${profile.archetype_name} aligns beautifully with "${searchTerm}" art.`,
    `Discover how "${searchTerm}" speaks to your ${profile.archetype_name} personality today.`
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

function generateWeeklyInsights(profile, stats, interactions) {
  const insights = [];

  if (stats.viewedCount > 20) {
    insights.push('You\'ve been very active in exploring art this week - your curiosity is inspiring!');
  } else if (stats.viewedCount > 10) {
    insights.push('You\'re developing a steady rhythm of art exploration.');
  } else {
    insights.push('There\'s so much more art waiting to be discovered!');
  }

  if (stats.likedCount > stats.viewedCount * 0.3) {
    insights.push('You have a discerning eye - you really connect with the pieces you view.');
  }

  if (stats.explorationDays >= 5) {
    insights.push('Consistency is key to aesthetic growth - you\'re building a beautiful daily practice.');
  }

  return insights;
}

function generateNextWeekSuggestions(profile, stats) {
  const suggestions = [];

  if (stats.viewedCount < 10) {
    suggestions.push('Try to explore at least 2-3 artworks daily next week');
  }

  suggestions.push('Experiment with a new art category you haven\'t explored much');
  suggestions.push('Share your favorite discoveries with the AI curator');

  if (profile.type_code?.includes('S')) {
    suggestions.push('Consider how the artworks might look in a shared space');
  }

  return suggestions.slice(0, 3);
}

function calculateExplorationStreak(interactions) {
  if (interactions.length === 0) return 0;

  const sortedInteractions = interactions
    .filter(i => i.action === 'view')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const interaction of sortedInteractions) {
    const interactionDate = new Date(interaction.timestamp);
    interactionDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate - interactionDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
}

module.exports = router;
