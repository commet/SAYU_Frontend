const { redisClient } = require('../config/redis');

class CacheService {
  // Cache key generators
  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }

  // User profile caching
  async getUserProfile(userId) {
    const key = this.generateKey('profile', userId);
    try {
      const cached = await redisClient().get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async setUserProfile(userId, profile, ttl = 3600) {
    const key = this.generateKey('profile', userId);
    try {
      await redisClient().setEx(key, ttl, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async invalidateUserProfile(userId) {
    const key = this.generateKey('profile', userId);
    try {
      await redisClient().del(key);
      return true;
    } catch (error) {
      console.error('Cache invalidate error:', error);
      return false;
    }
  }

  // AI response caching
  async getAIResponse(prompt, context = {}) {
    const contextHash = this.hashObject(context);
    const key = this.generateKey('ai', this.hashString(prompt), contextHash);
    try {
      const cached = await redisClient().get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('AI cache get error:', error);
      return null;
    }
  }

  async setAIResponse(prompt, context = {}, response, ttl = 1800) {
    const contextHash = this.hashObject(context);
    const key = this.generateKey('ai', this.hashString(prompt), contextHash);
    try {
      const cacheData = {
        response,
        timestamp: Date.now(),
        context: contextHash
      };
      await redisClient().setEx(key, ttl, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('AI cache set error:', error);
      return false;
    }
  }

  // Met Museum API caching
  async getMuseumSearch(query, departmentId, options = {}) {
    const key = this.generateKey('museum', 'search', departmentId, this.hashString(query), this.hashObject(options));
    try {
      const cached = await redisClient().get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Museum cache get error:', error);
      return null;
    }
  }

  async setMuseumSearch(query, departmentId, options = {}, results, ttl = 7200) {
    const key = this.generateKey('museum', 'search', departmentId, this.hashString(query), this.hashObject(options));
    try {
      const cacheData = {
        results,
        timestamp: Date.now(),
        query,
        departmentId,
        options
      };
      await redisClient().setEx(key, ttl, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Museum cache set error:', error);
      return false;
    }
  }

  async getArtworkDetails(artworkId) {
    const key = this.generateKey('artwork', artworkId);
    try {
      const cached = await redisClient().get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Artwork cache get error:', error);
      return null;
    }
  }

  async setArtworkDetails(artworkId, artwork, ttl = 86400) {
    const key = this.generateKey('artwork', artworkId);
    try {
      const cacheData = {
        artwork,
        timestamp: Date.now()
      };
      await redisClient().setEx(key, ttl, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Artwork cache set error:', error);
      return false;
    }
  }

  // Quiz response caching
  async getQuizAnalysis(responses) {
    const key = this.generateKey('quiz', this.hashObject(responses));
    try {
      const cached = await redisClient().get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Quiz cache get error:', error);
      return null;
    }
  }

  async setQuizAnalysis(responses, analysis, ttl = 3600) {
    const key = this.generateKey('quiz', this.hashObject(responses));
    try {
      const cacheData = {
        analysis,
        timestamp: Date.now(),
        responses: this.hashObject(responses)
      };
      await redisClient().setEx(key, ttl, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Quiz cache set error:', error);
      return false;
    }
  }

  // Recommendation caching
  async getRecommendations(userId, category) {
    const key = this.generateKey('recommendations', userId, category);
    try {
      const cached = await redisClient().get(key);
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache is less than 1 hour old
        if (Date.now() - data.timestamp < 3600000) {
          return data.recommendations;
        }
      }
      return null;
    } catch (error) {
      console.error('Recommendations cache get error:', error);
      return null;
    }
  }

  async setRecommendations(userId, category, recommendations, ttl = 3600) {
    const key = this.generateKey('recommendations', userId, category);
    try {
      const cacheData = {
        recommendations,
        timestamp: Date.now(),
        category
      };
      await redisClient().setEx(key, ttl, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Recommendations cache set error:', error);
      return false;
    }
  }

  // Batch operations
  async getMultiple(keys) {
    try {
      const values = await redisClient().mGet(keys);
      return keys.reduce((acc, key, index) => {
        acc[key] = values[index] ? JSON.parse(values[index]) : null;
        return acc;
      }, {});
    } catch (error) {
      console.error('Batch get error:', error);
      return {};
    }
  }

  async setMultiple(keyValuePairs, ttl = 3600) {
    try {
      const pipeline = redisClient().multi();
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        pipeline.setEx(key, ttl, JSON.stringify(value));
      });
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Batch set error:', error);
      return false;
    }
  }

  // Cache warming
  async warmUserCache(userId, profile) {
    try {
      // Cache user profile
      await this.setUserProfile(userId, profile);
      
      // Pre-cache common recommendations
      const categories = ['paintings', 'sculpture', 'modern', 'photography'];
      const promises = categories.map(category => 
        this.setRecommendations(userId, category, {
          searchTerms: this.getSearchTermsForProfile(profile),
          departmentIds: this.getDepartmentIdsForProfile(profile),
          category
        })
      );
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Cache warming error:', error);
      return false;
    }
  }

  // Cache statistics
  async getCacheStats() {
    try {
      const info = await redisClient().info('memory');
      const keyspace = await redisClient().info('keyspace');
      
      return {
        memory: this.parseRedisInfo(info),
        keyspace: this.parseRedisInfo(keyspace),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }

  // Clear specific cache patterns (using SCAN instead of KEYS for better performance)
  async clearPattern(pattern) {
    try {
      let cursor = 0;
      let deletedCount = 0;
      
      do {
        const result = await redisClient().scan(cursor, {
          MATCH: pattern,
          COUNT: 100
        });
        
        cursor = result.cursor;
        const keys = result.keys;
        
        if (keys.length > 0) {
          await redisClient().del(keys);
          deletedCount += keys.length;
        }
      } while (cursor !== 0);
      
      return deletedCount;
    } catch (error) {
      console.error('Clear pattern error:', error);
      return 0;
    }
  }

  // Utility methods
  hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  hashObject(obj) {
    return this.hashString(JSON.stringify(obj));
  }

  parseRedisInfo(info) {
    const lines = info.split('\r\n');
    const result = {};
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = isNaN(value) ? value : Number(value);
      }
    });
    return result;
  }

  getSearchTermsForProfile(profile) {
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
    
    let terms = [];
    
    emotionalTags.forEach(tag => {
      if (searchMapping[tag.toLowerCase()]) {
        terms.push(...searchMapping[tag.toLowerCase()]);
      }
    });
    
    if (typeCode.includes('A')) terms.push('abstract', 'modern');
    if (typeCode.includes('R')) terms.push('realistic', 'portrait');
    if (typeCode.includes('E')) terms.push('expressive', 'emotional');
    if (typeCode.includes('M')) terms.push('classical', 'detailed');
    
    return terms.length > 0 ? [...new Set(terms)] : ['art', 'painting'];
  }

  getDepartmentIdsForProfile(profile) {
    if (!profile) return [11];
    
    const typeCode = profile.type_code || '';
    const emotionalTags = profile.emotional_tags || [];
    
    let departments = [11]; // Always include American Paintings
    
    if (typeCode.includes('A')) departments.push(21); // Modern Art
    if (typeCode.includes('S')) departments.push(6);  // Asian Art
    if (emotionalTags.includes('traditional')) departments.push(14); // European Paintings
    
    return [...new Set(departments)];
  }
}

module.exports = new CacheService();