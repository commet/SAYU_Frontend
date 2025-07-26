// APT Cache Service - APT별 스마트 캐싱 시스템
const { getRedisClient } = require('../config/redis');
const APTVectorSystem = require('../models/aptVectorSystem');
const { SAYU_TYPES } = require('../../../shared/SAYUTypeDefinitions');
const aptDataAccess = require('../models/aptDataAccess');

class APTCacheService {
  constructor() {
    this.vectorSystem = new APTVectorSystem();
    this.cacheConfig = {
      artworkTTL: 3600,        // 1시간 (작품 추천)
      exhibitionTTL: 7200,     // 2시간 (전시 추천)
      profileTTL: 86400,       // 24시간 (APT 프로필 데이터)
      trendingTTL: 1800,       // 30분 (인기 콘텐츠)
      vectorTTL: 604800,       // 7일 (벡터 데이터)
      warmupBatchSize: 50      // 워밍업 시 배치 크기
    };
    
    // 캐시 키 패턴
    this.cacheKeys = {
      aptArtworks: 'apt:artworks:',          // apt:artworks:LAEF
      aptExhibitions: 'apt:exhibitions:',    // apt:exhibitions:SRMC
      aptProfile: 'apt:profile:',            // apt:profile:LAEF
      aptVector: 'apt:vector:',              // apt:vector:LAEF
      aptTrending: 'apt:trending:',          // apt:trending:LAEF:daily
      userVector: 'user:vector:',            // user:vector:userId
      artworkVector: 'artwork:vector:',      // artwork:vector:artworkId
      globalStats: 'apt:stats:global'       // 전체 통계
    };
  }

  // ==================== 초기화 및 워밍업 ====================
  
  async initialize() {
    console.log('🚀 APT 캐시 시스템 초기화 시작...');
    
    // 벡터 시스템 초기화
    await this.vectorSystem.initializePrototypes();
    
    // 각 APT 유형별 프로토타입 벡터 캐싱
    await this.cachePrototypeVectors();
    
    // 인기 작품/전시 사전 캐싱
    await this.warmupPopularContent();
    
    console.log('✅ APT 캐시 시스템 초기화 완료');
  }

  async cachePrototypeVectors() {
    const redis = getRedisClient();
    if (!redis) return null;
    const pipeline = redis.pipeline();
    
    for (const typeCode of Object.keys(SAYU_TYPES)) {
      const vector = this.vectorSystem.prototypeVectors[typeCode];
      if (vector) {
        pipeline.setex(
          `${this.cacheKeys.aptVector}${typeCode}`,
          this.cacheConfig.vectorTTL,
          JSON.stringify(vector)
        );
      }
    }
    
    await pipeline.exec();
    console.log(`✓ ${Object.keys(SAYU_TYPES).length}개 APT 프로토타입 벡터 캐싱 완료`);
  }

  async warmupPopularContent() {
    // 각 APT별로 인기 있는 콘텐츠 미리 계산하여 캐싱
    for (const typeCode of Object.keys(SAYU_TYPES)) {
      await this.warmupArtworksForAPT(typeCode);
      await this.warmupExhibitionsForAPT(typeCode);
    }
  }

  // ==================== APT별 작품 추천 캐싱 ====================
  
  async getArtworkRecommendations(aptType, options = {}) {
    const {
      limit = 20,
      offset = 0,
      forceRefresh = false,
      context = 'general' // general, trending, seasonal, new
    } = options;
    
    const cacheKey = `${this.cacheKeys.aptArtworks}${aptType}:${context}:${limit}:${offset}`;
    const redis = getRedisClient();
    if (!redis) return null;
    
    // 캐시 확인
    if (!forceRefresh) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }
    
    // 캐시 미스 - 새로 계산
    const recommendations = await this.calculateArtworkRecommendations(aptType, options);
    
    // 결과 캐싱
    await redis.setex(
      cacheKey,
      this.cacheConfig.artworkTTL,
      JSON.stringify(recommendations)
    );
    
    // 통계 업데이트
    await this.updateCacheStats('artwork', aptType, 'miss');
    
    return recommendations;
  }

  async calculateArtworkRecommendations(aptType, options) {
    const { limit, offset, context } = options;
    
    // APT 벡터 가져오기
    const aptVector = await this.getAPTVector(aptType);
    
    // 작품 벡터와 매칭
    const artworks = await this.getArtworkPool(context);
    const artworkVectors = await this.getArtworkVectors(artworks);
    
    // 벡터 유사도 계산
    const recommendations = await this.vectorSystem.findBestArtworks(
      aptVector,
      artworkVectors,
      limit + offset
    );
    
    // 컨텍스트별 추가 처리
    const processed = await this.processRecommendations(recommendations, aptType, context);
    
    // 페이지네이션 적용
    return processed.slice(offset, offset + limit);
  }

  async processRecommendations(recommendations, aptType, context) {
    // APT 특성에 맞게 추천 결과 조정
    const typeData = SAYU_TYPES[aptType];
    
    return recommendations.map(rec => {
      let score = rec.matchScore;
      
      // 컨텍스트별 점수 조정
      if (context === 'trending' && rec.viewCount > 1000) {
        score += 5; // 인기 작품 보너스
      } else if (context === 'new' && this.isNewArtwork(rec.createdAt)) {
        score += 3; // 신규 작품 보너스
      }
      
      // APT 특성별 조정
      if (aptType[0] === 'L' && rec.solitudeScore > 7) {
        score += 2; // 혼자 감상하기 좋은 작품
      } else if (aptType[0] === 'S' && rec.discussionPotential > 7) {
        score += 2; // 토론하기 좋은 작품
      }
      
      return {
        ...rec,
        finalScore: Math.min(100, score),
        matchReason: this.generateMatchReason(rec, typeData, score)
      };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }

  generateMatchReason(artwork, typeData, score) {
    const reasons = [];
    
    if (score > 90) {
      reasons.push(`${typeData.name}님께 완벽한 작품이에요!`);
    } else if (score > 75) {
      reasons.push(`${typeData.name}의 취향과 잘 맞아요`);
    }
    
    // 구체적인 이유 추가
    if (artwork.isAbstract && typeData.code[1] === 'A') {
      reasons.push('추상적 표현이 매력적');
    }
    if (artwork.emotionalImpact > 7 && typeData.code[2] === 'E') {
      reasons.push('감정적 울림이 깊은 작품');
    }
    
    return reasons.join(' · ');
  }

  // ==================== 전시 추천 캐싱 ====================
  
  async getExhibitionRecommendations(aptType, options = {}) {
    const {
      limit = 10,
      location = 'all',
      dateRange = 'current'
    } = options;
    
    const cacheKey = `${this.cacheKeys.aptExhibitions}${aptType}:${location}:${dateRange}`;
    const redis = getRedisClient();
    if (!redis) return null;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      await this.updateCacheStats('exhibition', aptType, 'hit');
      return JSON.parse(cached);
    }
    
    // 새로 계산
    const exhibitions = await this.calculateExhibitionRecommendations(aptType, options);
    
    await redis.setex(
      cacheKey,
      this.cacheConfig.exhibitionTTL,
      JSON.stringify(exhibitions)
    );
    
    return exhibitions;
  }

  // ==================== 사용자 벡터 캐싱 ====================
  
  async getUserVector(userId) {
    const redis = getRedisClient();
    if (!redis) return null;
    const cacheKey = `${this.cacheKeys.userVector}${userId}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // DB에서 사용자 정보 조회 후 벡터 생성
    const userProfile = await this.getUserProfile(userId);
    const userVector = await this.vectorSystem.createUserVector(
      userProfile.quizResponses,
      userProfile.aptType
    );
    
    // 캐싱
    await redis.setex(
      cacheKey,
      this.cacheConfig.vectorTTL,
      JSON.stringify(userVector)
    );
    
    return userVector;
  }

  async updateUserVector(userId, newActions) {
    const redis = getRedisClient();
    if (!redis) return null;
    const currentVector = await this.getUserVector(userId);
    const userProfile = await this.getUserProfile(userId);
    
    // 벡터 진화
    const evolvedVector = await this.vectorSystem.evolveUserVector(
      currentVector,
      newActions,
      userProfile.aptType
    );
    
    // 캐시 업데이트
    const cacheKey = `${this.cacheKeys.userVector}${userId}`;
    await redis.setex(
      cacheKey,
      this.cacheConfig.vectorTTL,
      JSON.stringify(evolvedVector)
    );
    
    // 관련 추천 캐시 무효화
    await this.invalidateUserRecommendations(userId);
    
    return evolvedVector;
  }

  // ==================== 인기 콘텐츠 캐싱 ====================
  
  async getTrendingForAPT(aptType, period = 'daily') {
    const redis = getRedisClient();
    if (!redis) return null;
    const cacheKey = `${this.cacheKeys.aptTrending}${aptType}:${period}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // 인기 콘텐츠 계산
    const trending = await this.calculateTrending(aptType, period);
    
    await redis.setex(
      cacheKey,
      this.cacheConfig.trendingTTL,
      JSON.stringify(trending)
    );
    
    return trending;
  }

  async calculateTrending(aptType, period) {
    // 해당 APT 사용자들이 많이 본 콘텐츠 집계
    const viewStats = await this.getViewStatsByAPT(aptType, period);
    const likeStats = await this.getLikeStatsByAPT(aptType, period);
    
    // 가중치 적용
    const scores = {};
    
    viewStats.forEach(item => {
      scores[item.id] = (scores[item.id] || 0) + item.count * 1;
    });
    
    likeStats.forEach(item => {
      scores[item.id] = (scores[item.id] || 0) + item.count * 3;
    });
    
    // 상위 항목 선택
    const trending = Object.entries(scores)
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
    
    return trending;
  }

  // ==================== 캐시 무효화 ====================
  
  async invalidateAPTCache(aptType) {
    const redis = getRedisClient();
    if (!redis) return null;
    const pattern = `apt:*:${aptType}*`;
    
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    
    console.log(`✓ ${aptType} 관련 ${keys.length}개 캐시 키 무효화`);
  }

  async invalidateUserRecommendations(userId) {
    const redis = getRedisClient();
    if (!redis) return null;
    // 사용자 관련 추천 캐시 제거
    const patterns = [
      `user:recommendations:${userId}:*`,
      `user:vector:${userId}`
    ];
    
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }

  // ==================== 캐시 통계 ====================
  
  async updateCacheStats(type, aptType, result) {
    const redis = getRedisClient();
    if (!redis) return null;
    const statsKey = `${this.cacheKeys.globalStats}:${type}`;
    
    await redis.hincrby(statsKey, `${aptType}:${result}`, 1);
    await redis.hincrby(statsKey, `total:${result}`, 1);
    
    // 히트율 계산을 위한 만료 시간 설정
    await redis.expire(statsKey, 86400); // 24시간
  }

  async getCacheStats() {
    const redis = getRedisClient();
    if (!redis) return null;
    const stats = {
      artwork: {},
      exhibition: {},
      hitRate: {}
    };
    
    // 각 타입별 통계 수집
    for (const type of ['artwork', 'exhibition']) {
      const statsKey = `${this.cacheKeys.globalStats}:${type}`;
      const data = await redis.hgetall(statsKey);
      
      stats[type] = data;
      
      // 히트율 계산
      const totalHits = parseInt(data['total:hit'] || 0);
      const totalMisses = parseInt(data['total:miss'] || 0);
      const total = totalHits + totalMisses;
      
      if (total > 0) {
        stats.hitRate[type] = Math.round((totalHits / total) * 100);
      }
    }
    
    return stats;
  }

  // ==================== 헬퍼 함수 ====================
  
  async getAPTVector(aptType) {
    const redis = getRedisClient();
    if (!redis) return null;
    const cacheKey = `${this.cacheKeys.aptVector}${aptType}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    return this.vectorSystem.prototypeVectors[aptType];
  }

  async getArtworkVectors(artworks) {
    const redis = getRedisClient();
    if (!redis) return null;
    const vectors = [];
    
    for (const artwork of artworks) {
      const cacheKey = `${this.cacheKeys.artworkVector}${artwork.id}`;
      let vector = await redis.get(cacheKey);
      
      if (!vector) {
        // 벡터 생성 및 캐싱
        vector = await this.vectorSystem.createArtworkVector(artwork);
        await redis.setex(
          cacheKey,
          this.cacheConfig.vectorTTL,
          JSON.stringify(vector)
        );
      } else {
        vector = JSON.parse(vector);
      }
      
      vectors.push({
        ...artwork,
        vector
      });
    }
    
    return vectors;
  }

  isNewArtwork(createdAt) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(createdAt) > thirtyDaysAgo;
  }

  // 워밍업 헬퍼
  async warmupArtworksForAPT(typeCode) {
    try {
      // 각 컨텍스트별로 미리 계산
      const contexts = ['general', 'trending', 'new'];
      
      for (const context of contexts) {
        await this.getArtworkRecommendations(typeCode, {
          limit: this.cacheConfig.warmupBatchSize,
          context
        });
      }
      
      console.log(`✓ ${typeCode} 작품 추천 워밍업 완료`);
    } catch (error) {
      console.error(`${typeCode} 작품 워밍업 실패:`, error);
    }
  }

  async warmupExhibitionsForAPT(typeCode) {
    try {
      await this.getExhibitionRecommendations(typeCode, {
        limit: 10,
        location: 'seoul',
        dateRange: 'current'
      });
      
      console.log(`✓ ${typeCode} 전시 추천 워밍업 완료`);
    } catch (error) {
      console.error(`${typeCode} 전시 워밍업 실패:`, error);
    }
  }

  // DB 접근 함수들
  async getUserProfile(userId) {
    return aptDataAccess.getUserProfile(userId);
  }

  async getArtworkPool(context) {
    return aptDataAccess.getArtworkPool(context);
  }

  async getViewStatsByAPT(aptType, period) {
    return aptDataAccess.getViewStatsByAPT(aptType, period);
  }

  async getLikeStatsByAPT(aptType, period) {
    return aptDataAccess.getLikeStatsByAPT(aptType, period);
  }

  async calculateExhibitionRecommendations(aptType, options) {
    return aptDataAccess.calculateExhibitionRecommendations(aptType, options);
  }
}

module.exports = APTCacheService;