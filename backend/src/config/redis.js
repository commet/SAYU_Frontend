const Redis = require('ioredis');
const { log } = require('./logger');

let redisClient = null;
let connectionAttempted = false;
let pubClient = null;
let subClient = null;

function createRedisClient() {
  if (redisClient || connectionAttempted) return redisClient;
  
  connectionAttempted = true;
  
  // Skip Redis if not available in development
  if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL) {
    log.warn('Redis URL not configured - running without Redis cache');
    return null;
  }
  
  try {
    // 최적화된 Redis 설정
    const redisOptions = {
      // 커넥션 풀 최적화
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      
      // 성능 최적화
      connectTimeout: 10000,
      commandTimeout: 5000,
      keepAlive: 10000,
      
      // 메모리 최적화
      dropBufferSupport: true,
      
      // 파이프라이닝 설정
      enableAutoPipelining: true,
      autoPipeliningIgnoredCommands: ['info', 'ping'],
      
      // 재시도 전략
      retryStrategy: (times) => {
        if (times > 3) {
          log.error('Redis connection failed after 3 attempts');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      
      // 에러 핸들링
      reconnectOnError: (err) => {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
        if (targetErrors.includes(err.code)) {
          return true;
        }
        return false;
      }
    };
    
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', redisOptions);
    
    // 클러스터 모드 지원 (필요한 경우)
    if (process.env.REDIS_CLUSTER === 'true') {
      redisClient = new Redis.Cluster(
        [{host: process.env.REDIS_HOST, port: process.env.REDIS_PORT}],
        { redisOptions }
      );
    }
    
    // 이벤트 핸들러
    redisClient.on('error', (err) => {
      log.error('Redis error:', err);
      // 연결 실패 시 자동 폴백
      if (err.code === 'ECONNREFUSED' && process.env.NODE_ENV === 'development') {
        redisClient = null;
      }
    });
    
    redisClient.on('connect', () => {
      log.info('Redis connected successfully');
    });
    
    redisClient.on('ready', () => {
      log.info('Redis ready to accept commands');
      // 초기 설정
      setupRedisOptimizations();
    });
    
    redisClient.on('close', () => {
      log.warn('Redis connection closed');
    });
    
    redisClient.on('reconnecting', (delay) => {
      log.info(`Redis reconnecting in ${delay}ms`);
    });
    
    // Pub/Sub 클라이언트 (필요한 경우)
    if (process.env.ENABLE_PUBSUB === 'true') {
      pubClient = redisClient.duplicate();
      subClient = redisClient.duplicate();
    }
    
    return redisClient;
  } catch (error) {
    log.error('Redis initialization failed:', error);
    return null;
  }
}

// Redis 최적화 설정
async function setupRedisOptimizations() {
  if (!redisClient) return;
  
  try {
    // 메모리 최적화 설정
    await redisClient.config('SET', 'maxmemory-policy', 'allkeys-lru');
    await redisClient.config('SET', 'maxmemory', '512mb');
    
    // 성능 최적화
    await redisClient.config('SET', 'tcp-keepalive', '60');
    await redisClient.config('SET', 'timeout', '300');
    
    // 레플리카 설정 (필요한 경우)
    if (process.env.REDIS_REPLICA) {
      await redisClient.readonly();
    }
    
    log.info('Redis optimizations applied');
  } catch (error) {
    log.warn('Failed to apply Redis optimizations:', error);
  }
}

// Redis 헬퍼 함수들
const redisHelpers = {
  // 안전한 get
  async safeGet(key) {
    try {
      if (!redisClient) return null;
      return await redisClient.get(key);
    } catch (error) {
      log.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  },
  
  // 안전한 set
  async safeSet(key, value, ttl) {
    try {
      if (!redisClient) return false;
      if (ttl) {
        await redisClient.setex(key, ttl, value);
      } else {
        await redisClient.set(key, value);
      }
      return true;
    } catch (error) {
      log.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  },
  
  // 배치 작업
  async batchGet(keys) {
    try {
      if (!redisClient || !keys.length) return [];
      return await redisClient.mget(keys);
    } catch (error) {
      log.error('Redis MGET error:', error);
      return [];
    }
  },
  
  // 파이프라인 실행
  async executePipeline(commands) {
    try {
      if (!redisClient) return [];
      const pipeline = redisClient.pipeline();
      commands.forEach(cmd => pipeline[cmd.method](...cmd.args));
      return await pipeline.exec();
    } catch (error) {
      log.error('Redis pipeline error:', error);
      return [];
    }
  },
  
  // 스캔 작업 (메모리 효율적)
  async* scan(pattern, count = 100) {
    if (!redisClient) return;
    
    let cursor = '0';
    do {
      try {
        const [newCursor, keys] = await redisClient.scan(
          cursor,
          'MATCH', pattern,
          'COUNT', count
        );
        cursor = newCursor;
        
        for (const key of keys) {
          yield key;
        }
      } catch (error) {
        log.error('Redis SCAN error:', error);
        break;
      }
    } while (cursor !== '0');
  }
};

module.exports = {
  getRedisClient: createRedisClient,
  getPubClient: () => pubClient,
  getSubClient: () => subClient,
  redisHelpers
};