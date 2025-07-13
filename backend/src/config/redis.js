const Redis = require('ioredis');
const { log } = require('./logger');

let redisClient = null;
let connectionAttempted = false;

function createRedisClient() {
  if (redisClient || connectionAttempted) return redisClient;
  
  connectionAttempted = true;
  
  // Skip Redis if not available in development
  if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL) {
    log.warn('Redis URL not configured - running without Redis cache');
    return null;
  }
  
  try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryStrategy: () => null, // Don't retry
      reconnectOnError: () => false,
      enableOfflineQueue: false,
      lazyConnect: true,
      showFriendlyErrorStack: false,
      maxRetriesPerRequest: 0
    });
    
    redisClient.on('error', (err) => {
      // Silently handle errors
      if (err.code === 'ECONNREFUSED') {
        log.warn('Redis connection refused - running without cache');
      }
      redisClient = null;
    });
    
    redisClient.on('connect', () => {
      log.info('Redis connected successfully');
    });
    
    // Try to connect
    redisClient.connect().catch((err) => {
      if (err.code === 'ECONNREFUSED') {
        log.warn('Redis not available - continuing without cache');
      }
      redisClient = null;
    });
    
    return redisClient;
  } catch (error) {
    log.warn('Redis initialization failed - continuing without cache');
    return null;
  }
}

module.exports = {
  getRedisClient: createRedisClient
};