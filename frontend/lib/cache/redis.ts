// Redis is optional - will use memory cache if not available
let Redis: any = null;

// Only try to load Redis if available
if (typeof window === 'undefined') {
  try {
    // Dynamic import to avoid bundling issues
    Redis = null; // Disable Redis for now to fix build
  } catch (error) {
    console.log('Redis not available, using memory cache only');
    Redis = null;
  }
}

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Singleton Redis client for Next.js
class RedisClient {
  private static instance: Redis | null = null;
  private static isConnecting = false;

  static getInstance(): Redis | null {
    if (typeof window !== 'undefined') {
      // Don't initialize Redis on client side
      return null;
    }

    if (!this.instance && !this.isConnecting) {
      this.isConnecting = true;
      try {
        if (!Redis) {
          this.instance = null;
          return null;
        }
        this.instance = new Redis(REDIS_URL, {
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          connectTimeout: 10000,
          commandTimeout: 5000,
        });

        this.instance.on('error', (err) => {
          console.warn('Redis connection error (falling back to memory cache):', err.message);
          // Don't throw error, just log and continue without Redis
        });

        this.instance.on('connect', () => {
          console.log('✨ Redis connected for caching');
        });

      } catch (error) {
        console.warn('Redis initialization failed (using memory cache):', error);
        this.instance = null;
      } finally {
        this.isConnecting = false;
      }
    }
    return this.instance;
  }

  static async disconnect() {
    if (this.instance) {
      await this.instance.disconnect();
      this.instance = null;
    }
  }
}

// Cache interface that works with or without Redis
export class CacheManager {
  private redis: Redis | null;
  private memoryCache = new Map<string, { data: any; timestamp: number }>();
  private readonly defaultTTL = 300; // 5 minutes

  constructor() {
    this.redis = RedisClient.getInstance();
  }

  async get(key: string): Promise<any> {
    try {
      // Try Redis first if available
      if (this.redis) {
        const cached = await this.redis.get(key);
        if (cached) {
          const data = JSON.parse(cached);
          console.log(`📦 Cache hit (Redis): ${key}`);
          return data;
        }
      }

      // Fallback to memory cache
      const memCached = this.memoryCache.get(key);
      if (memCached && (Date.now() - memCached.timestamp) < this.defaultTTL * 1000) {
        console.log(`📦 Cache hit (Memory): ${key}`);
        return memCached.data;
      }

      return null;
    } catch (error) {
      console.warn(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, data: any, ttlSeconds = this.defaultTTL): Promise<void> {
    try {
      // Try Redis first if available
      if (this.redis) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
        console.log(`📋 Cache set (Redis): ${key}`);
        return;
      }

      // Fallback to memory cache
      this.memoryCache.set(key, {
        data,
        timestamp: Date.now()
      });
      console.log(`📋 Cache set (Memory): ${key}`);

      // Cleanup old memory cache entries periodically
      if (Math.random() < 0.1) {
        this.cleanupMemoryCache();
      }
    } catch (error) {
      console.warn(`Cache set error for key ${key}:`, error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          console.log(`🖼️ Cache invalidated (Redis): ${keys.length} keys matching ${pattern}`);
        }
      }

      // Clear memory cache for matching patterns
      for (const [key] of this.memoryCache.entries()) {
        if (key.includes(pattern.replace('*', ''))) {
          this.memoryCache.delete(key);
        }
      }
    } catch (error) {
      console.warn(`Cache invalidate error for pattern ${pattern}:`, error);
    }
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    const maxAge = this.defaultTTL * 1000 * 10; // Keep for 10x TTL

    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Health check method
  async healthCheck(): Promise<{ redis: boolean; memory: boolean }> {
    let redisHealthy = false;
    
    try {
      if (this.redis) {
        await this.redis.ping();
        redisHealthy = true;
      }
    } catch (error) {
      console.warn('Redis health check failed:', error);
    }

    return {
      redis: redisHealthy,
      memory: this.memoryCache.size >= 0 // Memory cache is always available
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Helper functions for common cache patterns
export const cacheKeys = {
  dashboardStats: (userId?: string) => `dashboard:stats:${userId || 'global'}`,
  exhibitions: (filters?: string) => `exhibitions:${filters || 'all'}`,
  artworks: (category?: string) => `artworks:${category || 'all'}`,
  userProfile: (userId: string) => `user:${userId}`,
  trending: () => 'trending:artists',
  community: () => 'community:highlights'
};

// Cache with automatic key generation
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 300
): Promise<T> {
  const cached = await cacheManager.get(key);
  if (cached) {
    return cached;
  }

  const data = await fetcher();
  await cacheManager.set(key, data, ttl);
  return data;
}
