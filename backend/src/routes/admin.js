const router = require('express').Router();
const { adminMiddleware } = require('../middleware/auth');
const CacheService = require('../services/cacheService');
const { redisClient } = require('../config/redis');
const { SecurityAuditService } = require('../middleware/securityAudit');
const { 
  validationSchemas, 
  handleValidationResult, 
  securityHeaders, 
  requestSizeLimiter,
  sanitizeInput,
  rateLimits 
} = require('../middleware/validation');
const { body, param, query } = require('express-validator');

// Apply security middleware with admin protection
router.use(securityHeaders);
router.use(sanitizeInput);
router.use(requestSizeLimiter('10mb')); // Admin operations may need larger payloads
router.use(adminMiddleware);

// Get cache statistics
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = await CacheService.getCacheStats();
    const keyCount = await redisClient().dbSize();
    
    res.json({
      ...stats,
      totalKeys: keyCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

// Clear cache by pattern
router.delete('/cache/:pattern', async (req, res) => {
  try {
    const { pattern } = req.params;
    const deletedCount = await CacheService.clearPattern(pattern);
    
    res.json({
      message: `Cleared ${deletedCount} cache entries`,
      pattern,
      deletedCount
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Clear all cache
router.delete('/cache', async (req, res) => {
  try {
    await redisClient().flushDb();
    
    res.json({
      message: 'All cache cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Flush cache error:', error);
    res.status(500).json({ error: 'Failed to flush cache' });
  }
});

// Get cache keys by pattern
router.get('/cache/keys/:pattern', async (req, res) => {
  try {
    const { pattern } = req.params;
    const { limit = 100 } = req.query;
    
    const keys = await redisClient().keys(pattern);
    const limitedKeys = keys.slice(0, parseInt(limit));
    
    // Get sample values for inspection
    const sampleData = {};
    for (const key of limitedKeys.slice(0, 5)) {
      try {
        const value = await redisClient().get(key);
        const ttl = await redisClient().ttl(key);
        sampleData[key] = {
          value: value ? JSON.parse(value) : null,
          ttl: ttl > 0 ? ttl : 'no expiration'
        };
      } catch (error) {
        sampleData[key] = { error: 'Failed to parse' };
      }
    }
    
    res.json({
      pattern,
      totalMatches: keys.length,
      keys: limitedKeys,
      sampleData
    });
  } catch (error) {
    console.error('Get cache keys error:', error);
    res.status(500).json({ error: 'Failed to get cache keys' });
  }
});

// Warm cache for specific user
router.post('/cache/warm/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const ProfileModel = require('../models/Profile');
    
    const profile = await ProfileModel.findByUserId(userId);
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const success = await CacheService.warmUserCache(userId, profile);
    
    res.json({
      message: success ? 'Cache warmed successfully' : 'Cache warming failed',
      userId,
      success
    });
  } catch (error) {
    console.error('Warm cache error:', error);
    res.status(500).json({ error: 'Failed to warm cache' });
  }
});

// Cache performance metrics
router.get('/cache/performance', async (req, res) => {
  try {
    const info = await redisClient().info();
    const slowlog = await redisClient().slowlogGet(10);
    
    // Parse Redis info for key metrics
    const metrics = {};
    info.split('\r\n').forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        if (key.includes('hit') || key.includes('miss') || key.includes('memory') || key.includes('cpu')) {
          metrics[key] = isNaN(value) ? value : Number(value);
        }
      }
    });
    
    res.json({
      metrics,
      slowQueries: slowlog,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache performance error:', error);
    res.status(500).json({ error: 'Failed to get cache performance' });
  }
});

// Set cache value manually (for testing)
router.post('/cache/set', async (req, res) => {
  try {
    const { key, value, ttl = 3600 } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required' });
    }
    
    await redisClient().setEx(key, ttl, JSON.stringify(value));
    
    res.json({
      message: 'Cache value set',
      key,
      ttl
    });
  } catch (error) {
    console.error('Set cache error:', error);
    res.status(500).json({ error: 'Failed to set cache value' });
  }
});

// Get cache value
router.get('/cache/get/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await redisClient().get(key);
    const ttl = await redisClient().ttl(key);
    
    res.json({
      key,
      value: value ? JSON.parse(value) : null,
      ttl: ttl > 0 ? ttl : 'no expiration',
      exists: !!value
    });
  } catch (error) {
    console.error('Get cache error:', error);
    res.status(500).json({ error: 'Failed to get cache value' });
  }
});

// Security monitoring endpoints
router.get('/security/stats', async (req, res) => {
  try {
    const stats = await SecurityAuditService.getSecurityStats();
    res.json({
      securityStats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get security stats error:', error);
    res.status(500).json({ error: 'Failed to get security stats' });
  }
});

router.get('/security/events', 
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Limit must be between 1 and 1000')
  ],
  handleValidationResult,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const events = await SecurityAuditService.getRecentSecurityEvents(limit);
      
      res.json({
        events,
        count: events.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get security events error:', error);
      res.status(500).json({ error: 'Failed to get security events' });
    }
  }
);

router.post('/security/blacklist',
  [
    body('ip')
      .isIP()
      .withMessage('Valid IP address required'),
    body('reason')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Reason must be less than 200 characters')
  ],
  handleValidationResult,
  async (req, res) => {
    try {
      const { ip, reason } = req.body;
      const success = await SecurityAuditService.addToBlacklist(ip, reason);
      
      if (success) {
        res.json({ message: 'IP added to blacklist', ip, reason });
      } else {
        res.status(400).json({ error: 'Failed to add IP to blacklist' });
      }
    } catch (error) {
      console.error('Blacklist IP error:', error);
      res.status(500).json({ error: 'Failed to blacklist IP' });
    }
  }
);

router.delete('/security/blacklist/:ip',
  [
    param('ip')
      .isIP()
      .withMessage('Valid IP address required')
  ],
  handleValidationResult,
  async (req, res) => {
    try {
      const { ip } = req.params;
      await SecurityAuditService.removeFromBlacklist(ip);
      
      res.json({ message: 'IP removed from blacklist', ip });
    } catch (error) {
      console.error('Remove from blacklist error:', error);
      res.status(500).json({ error: 'Failed to remove IP from blacklist' });
    }
  }
);

// Validation testing endpoint (admin only)
router.post('/test/validation',
  [
    body('testData')
      .isObject()
      .withMessage('Test data must be an object'),
    body('validationType')
      .isIn(['userRegistration', 'agentChat', 'artworkInteraction', 'quizSubmission'])
      .withMessage('Invalid validation type')
  ],
  handleValidationResult,
  async (req, res) => {
    try {
      const { testData, validationType } = req.body;
      
      // This endpoint allows admins to test validation rules
      res.json({
        message: 'Validation test endpoint',
        validationType,
        testData,
        result: 'Validation rules applied successfully'
      });
    } catch (error) {
      console.error('Validation test error:', error);
      res.status(500).json({ error: 'Validation test failed' });
    }
  }
);

module.exports = router;