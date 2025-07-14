const db = require('../config/database');
const Redis = require('ioredis');
const { log } = require('../config/logger');
const vectorSimilarityService = require('./vectorSimilarityService');

class AIRecommendationService {
  constructor() {
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL);
        this.redis.on('error', (error) => {
          log.error('Redis error in AI Recommendation service:', error);
          this.redis = null;
        });
      } catch (error) {
        log.warn('Redis connection failed in AI Recommendation service, running without cache:', error.message);
        this.redis = null;
      }
    } else {
      this.redis = null;
      log.warn('AI Recommendation service running without Redis cache - REDIS_URL not configured');
    }
    this.initializeService();
  }

  async initializeService() {
    try {
      if (this.redis) {
        await this.redis.ping();
        log.info('AI Recommendation service initialized with Redis');
      } else {
        log.info('AI Recommendation service initialized without Redis (cache disabled)');
      }
    } catch (error) {
      log.error('Redis connection failed:', error);
      this.redis = null;
    }
  }

  // 개인화된 전시 추천
  async getPersonalizedExhibitions(userId, options = {}) {
    const {
      limit = 10,
      offset = 0,
      includeVisited = false,
      location = null,
      preferences = null
    } = options;

    try {
      // 캐시 확인
      const cacheKey = `recommendations:exhibitions:${userId}:${limit}:${offset}`;
      if (this.redis) {
        try {
          const cached = await this.redis.get(cacheKey);
          if (cached) return JSON.parse(cached);
        } catch (error) {
          log.warn('Redis cache read failed:', error.message);
        }
      }

      // 사용자 프로필 정보 수집
      const userProfile = await this.getUserProfile(userId);
      
      // 하이브리드 추천 알고리즘 실행
      const contentBased = await this.getContentBasedRecommendations(userProfile, limit / 3);
      const collaborative = await this.getCollaborativeRecommendations(userId, limit / 3);
      const knowledgeBased = await this.getKnowledgeBasedRecommendations(userProfile, limit / 3);

      // 결과 병합 및 순위 조정
      const recommendations = this.mergeAndRankRecommendations([
        ...contentBased,
        ...collaborative,
        ...knowledgeBased
      ], userProfile);

      // 캐시 저장 (5분)
      if (this.redis) {
        try {
          await this.redis.setex(cacheKey, 300, JSON.stringify(recommendations));
        } catch (error) {
          log.warn('Redis cache write failed:', error.message);
        }
      }

      return recommendations;
    } catch (error) {
      log.error('Exhibition recommendation error:', error);
      throw error;
    }
  }

  // 콘텐츠 기반 필터링
  async getContentBasedRecommendations(userProfile, limit) {
    const { personalityType, preferredGenres, artistPreferences, visitHistory } = userProfile;

    // 성격 유형별 선호도 매핑
    const personalityMappings = {
      'LAEF': { // 꿈꾸는 예술가
        genres: ['contemporary', 'abstract', 'conceptual'],
        styles: ['impressionism', 'expressionism'],
        moods: ['peaceful', 'dreamy', 'introspective']
      },
      'SRMC': { // 체계적 큐레이터
        genres: ['classical', 'renaissance', 'neoclassical'],
        styles: ['realism', 'academic'],
        moods: ['structured', 'harmonious', 'refined']
      },
      'GREF': { // 혁신적 탐험가
        genres: ['contemporary', 'experimental', 'digital'],
        styles: ['avant-garde', 'pop-art'],
        moods: ['bold', 'provocative', 'energetic']
      },
      'CREF': { // 창조적 실험가
        genres: ['mixed-media', 'installation', 'performance'],
        styles: ['surrealism', 'dadaism'],
        moods: ['unconventional', 'thought-provoking', 'innovative']
      }
    };

    const preferences = personalityMappings[personalityType] || personalityMappings['LAEF'];

    const query = `
      SELECT DISTINCT e.*, 
             i.name as institution_name,
             i.city, i.country,
             ARRAY_AGG(DISTINCT ea.artist_name) as artists,
             (
               CASE 
                 WHEN e.genres && $1::text[] THEN 3
                 ELSE 0
               END +
               CASE 
                 WHEN e.mood_tags && $2::text[] THEN 2
                 ELSE 0
               END +
               CASE 
                 WHEN e.artists && $3::text[] THEN 4
                 ELSE 0
               END
             ) as relevance_score
      FROM exhibitions e
      JOIN institutions i ON e.institution_id = i.id
      LEFT JOIN exhibition_artists ea ON e.id = ea.exhibition_id
      WHERE e.status = 'ongoing'
        AND e.end_date > CURRENT_DATE
        AND (NOT $4 OR e.id NOT IN (
          SELECT exhibition_id FROM user_exhibition_visits 
          WHERE user_id = $5
        ))
      GROUP BY e.id, i.id
      HAVING (
        e.genres && $1::text[] OR
        e.mood_tags && $2::text[] OR
        e.artists && $3::text[]
      )
      ORDER BY relevance_score DESC, e.start_date ASC
      LIMIT $6
    `;

    const result = await db.query(query, [
      preferences.genres,
      preferences.moods,
      artistPreferences,
      !includeVisited,
      userId,
      limit
    ]);

    return result.rows.map(row => ({
      ...row,
      recommendation_type: 'content_based',
      recommendation_reason: this.generateContentReason(row, preferences)
    }));
  }

  // 협업 필터링 (Enhanced with Vector Similarity)
  async getCollaborativeRecommendations(userId, limit) {
    try {
      // Try vector-based similarity first (more accurate)
      const vectorUsers = await vectorSimilarityService.findSimilarUsers(userId, {
        threshold: 0.7,
        limit: 20
      });
      
      // Fall back to traditional method if vector search fails
      const similarUsers = vectorUsers.length > 0 
        ? vectorUsers 
        : await this.findSimilarUsers(userId);
      
      log.info('Collaborative filtering using vectors', {
        userId,
        vectorUsersFound: vectorUsers.length,
        totalSimilarUsers: similarUsers.length,
        method: vectorUsers.length > 0 ? 'vector_similarity' : 'traditional'
      });
    
    if (similarUsers.length === 0) {
      return [];
    }

    const query = `
      SELECT DISTINCT e.*, 
             i.name as institution_name,
             i.city, i.country,
             COUNT(*) as similar_user_visits,
             AVG(uev.rating) as avg_rating
      FROM exhibitions e
      JOIN institutions i ON e.institution_id = i.id
      JOIN user_exhibition_visits uev ON e.id = uev.exhibition_id
      WHERE e.status = 'ongoing'
        AND e.end_date > CURRENT_DATE
        AND uev.user_id = ANY($1::uuid[])
        AND e.id NOT IN (
          SELECT exhibition_id FROM user_exhibition_visits 
          WHERE user_id = $2
        )
      GROUP BY e.id, i.id
      ORDER BY similar_user_visits DESC, avg_rating DESC
      LIMIT $3
    `;

    const result = await db.query(query, [
      similarUsers.map(u => u.user_id),
      userId,
      limit
    ]);

    return result.rows.map(row => ({
      ...row,
      recommendation_type: 'collaborative',
      recommendation_reason: `비슷한 취향의 ${row.similar_user_visits}명이 방문한 전시예요`
    }));
  }

  // 지식 기반 추천
  async getKnowledgeBasedRecommendations(userProfile, limit) {
    const { seasonalPreferences, timePreferences, locationPreferences } = userProfile;

    // 현재 계절, 시간, 위치 고려
    const currentSeason = this.getCurrentSeason();
    const currentTime = new Date().getHours();

    const query = `
      SELECT DISTINCT e.*, 
             i.name as institution_name,
             i.city, i.country,
             (
               CASE 
                 WHEN $1 = ANY(e.seasonal_tags) THEN 2
                 ELSE 0
               END +
               CASE 
                 WHEN i.city = $2 THEN 3
                 ELSE 0
               END +
               CASE 
                 WHEN e.ticket_price->>'adult' IS NULL THEN 1
                 ELSE 0
               END
             ) as knowledge_score
      FROM exhibitions e
      JOIN institutions i ON e.institution_id = i.id
      WHERE e.status = 'ongoing'
        AND e.end_date > CURRENT_DATE + INTERVAL '7 days'
      ORDER BY knowledge_score DESC, e.view_count DESC
      LIMIT $3
    `;

    const result = await db.query(query, [
      currentSeason,
      locationPreferences?.preferredCity || 'Seoul',
      limit
    ]);

    return result.rows.map(row => ({
      ...row,
      recommendation_type: 'knowledge_based',
      recommendation_reason: this.generateKnowledgeReason(row, currentSeason)
    }));
  }

  // 사용자 프로필 정보 수집
  async getUserProfile(userId) {
    const profileQuery = `
      SELECT 
        u.personality_type,
        ug.level,
        ug.total_points,
        ARRAY_AGG(DISTINCT e.genres) FILTER (WHERE e.genres IS NOT NULL) as preferred_genres,
        ARRAY_AGG(DISTINCT ea.artist_name) FILTER (WHERE ea.artist_name IS NOT NULL) as artist_preferences,
        COUNT(DISTINCT uev.exhibition_id) as total_visits,
        AVG(uev.rating) as avg_rating,
        AVG(uev.duration_minutes) as avg_duration
      FROM users u
      LEFT JOIN user_gamification ug ON u.id = ug.user_id
      LEFT JOIN user_exhibition_visits uev ON u.id = uev.user_id
      LEFT JOIN exhibitions e ON uev.exhibition_id = e.id
      LEFT JOIN exhibition_artists ea ON e.id = ea.exhibition_id
      WHERE u.id = $1
      GROUP BY u.id, ug.level, ug.total_points
    `;

    const result = await db.query(profileQuery, [userId]);
    const profile = result.rows[0] || {};

    return {
      personalityType: profile.personality_type || 'LAEF',
      level: profile.level || 1,
      totalPoints: profile.total_points || 0,
      preferredGenres: profile.preferred_genres || [],
      artistPreferences: profile.artist_preferences || [],
      totalVisits: profile.total_visits || 0,
      avgRating: parseFloat(profile.avg_rating) || 0,
      avgDuration: parseInt(profile.avg_duration) || 0,
      visitHistory: await this.getUserVisitHistory(userId)
    };
  }

  // 유사한 사용자 찾기
  async findSimilarUsers(userId, limit = 50) {
    const query = `
      WITH user_profile AS (
        SELECT 
          personality_type,
          ARRAY_AGG(DISTINCT e.genres) as preferred_genres,
          AVG(uev.rating) as avg_rating
        FROM users u
        LEFT JOIN user_exhibition_visits uev ON u.id = uev.user_id
        LEFT JOIN exhibitions e ON uev.exhibition_id = e.id
        WHERE u.id = $1
        GROUP BY u.id, personality_type
      ),
      similar_users AS (
        SELECT DISTINCT u2.id as user_id,
               u2.personality_type,
               (
                 CASE 
                   WHEN u2.personality_type = up.personality_type THEN 3
                   ELSE 0
                 END +
                 CASE 
                   WHEN ARRAY_LENGTH(
                     ARRAY(SELECT UNNEST(ARRAY_AGG(DISTINCT e2.genres)) 
                           INTERSECT 
                           SELECT UNNEST(up.preferred_genres))
                   , 1) > 0 THEN 2
                   ELSE 0
                 END
               ) as similarity_score
        FROM users u2
        LEFT JOIN user_exhibition_visits uev2 ON u2.id = uev2.user_id
        LEFT JOIN exhibitions e2 ON uev2.exhibition_id = e2.id
        CROSS JOIN user_profile up
        WHERE u2.id != $1
        GROUP BY u2.id, u2.personality_type, up.personality_type, up.preferred_genres
        HAVING similarity_score > 2
        ORDER BY similarity_score DESC
        LIMIT $2
      )
      SELECT * FROM similar_users
    `;

    const result = await db.query(query, [userId, limit]);
    return result.rows;
  }

  // 추천 결과 병합 및 순위 조정
  mergeAndRankRecommendations(recommendations, userProfile) {
    // 중복 제거
    const uniqueRecommendations = recommendations.reduce((acc, rec) => {
      if (!acc.find(r => r.id === rec.id)) {
        acc.push(rec);
      }
      return acc;
    }, []);

    // 다양성 점수 계산 및 적용
    return uniqueRecommendations
      .map(rec => ({
        ...rec,
        final_score: this.calculateFinalScore(rec, userProfile),
        diversity_bonus: this.calculateDiversityBonus(rec, uniqueRecommendations)
      }))
      .sort((a, b) => (b.final_score + b.diversity_bonus) - (a.final_score + a.diversity_bonus))
      .slice(0, 10);
  }

  // 최종 점수 계산
  calculateFinalScore(recommendation, userProfile) {
    let score = recommendation.relevance_score || 0;
    
    // 사용자 레벨에 따른 난이도 조정
    if (userProfile.level < 10) {
      // 초보자는 접근하기 쉬운 전시 선호
      if (recommendation.genres?.includes('contemporary')) score += 1;
      if (recommendation.ticket_price?.adult < 15000) score += 1;
    } else if (userProfile.level > 50) {
      // 고수는 도전적인 전시 선호
      if (recommendation.genres?.includes('experimental')) score += 2;
      if (recommendation.artists?.length > 5) score += 1;
    }

    // 평점 기반 보정
    if (recommendation.avg_rating > 4.0) score += 1;
    if (recommendation.view_count > 1000) score += 0.5;

    return score;
  }

  // 다양성 보너스 계산
  calculateDiversityBonus(recommendation, allRecommendations) {
    const genreCount = {};
    const cityCount = {};

    allRecommendations.forEach(rec => {
      rec.genres?.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
      cityCount[rec.city] = (cityCount[rec.city] || 0) + 1;
    });

    let bonus = 0;
    
    // 장르 다양성
    recommendation.genres?.forEach(genre => {
      if (genreCount[genre] <= 2) bonus += 0.5;
    });

    // 지역 다양성
    if (cityCount[recommendation.city] <= 1) bonus += 0.3;

    return bonus;
  }

  // 아트웍 기반 추천
  async getArtworkRecommendations(userId, options = {}) {
    const { limit = 20, artworkId = null } = options;

    try {
      const userProfile = await this.getUserProfile(userId);
      
      let baseQuery;
      let queryParams;

      if (artworkId) {
        // 특정 작품과 유사한 작품 추천
        baseQuery = `
          SELECT a.*, 
                 SIMILARITY(a.style_tags, ref.style_tags) as style_similarity,
                 SIMILARITY(a.color_tags, ref.color_tags) as color_similarity
          FROM artworks a
          CROSS JOIN (SELECT style_tags, color_tags FROM artworks WHERE id = $1) ref
          WHERE a.id != $1
          ORDER BY (style_similarity + color_similarity) DESC
          LIMIT $2
        `;
        queryParams = [artworkId, limit];
      } else {
        // 사용자 취향 기반 작품 추천
        baseQuery = `
          SELECT a.*,
                 (
                   CASE 
                     WHEN a.personality_tags && $1::text[] THEN 3
                     ELSE 0
                   END +
                   CASE 
                     WHEN a.mood_tags && $2::text[] THEN 2
                     ELSE 0
                   END
                 ) as relevance_score
          FROM artworks a
          WHERE a.personality_tags && $1::text[] OR a.mood_tags && $2::text[]
          ORDER BY relevance_score DESC, a.created_at DESC
          LIMIT $3
        `;
        
        const personalityTags = [userProfile.personalityType];
        const moodTags = this.getPersonalityMoodTags(userProfile.personalityType);
        queryParams = [personalityTags, moodTags, limit];
      }

      const result = await db.query(baseQuery, queryParams);
      return result.rows;
    } catch (error) {
      log.error('Artwork recommendation error:', error);
      throw error;
    }
  }

  // 실시간 추천 업데이트
  async updateRecommendationsRealtime(userId, activityData) {
    try {
      const { activityType, exhibitionId, rating, duration } = activityData;

      // 활동 기반 프로필 업데이트
      await this.updateUserProfile(userId, activityData);

      // 관련 캐시 무효화
      if (this.redis) {
        try {
          const cacheKeys = await this.redis.keys(`recommendations:*:${userId}:*`);
          if (cacheKeys.length > 0) {
            await this.redis.del(...cacheKeys);
          }
        } catch (error) {
          log.warn('Redis cache invalidation failed:', error.message);
        }
      }

      // 실시간 추천 재계산 (백그라운드)
      setImmediate(() => {
        this.getPersonalizedExhibitions(userId, { limit: 5 });
      });

      log.info(`Updated recommendations for user ${userId} based on ${activityType}`);
    } catch (error) {
      log.error('Real-time recommendation update error:', error);
    }
  }

  // 헬퍼 메소드들
  generateContentReason(exhibition, preferences) {
    const reasons = [];
    
    if (exhibition.genres?.some(g => preferences.genres.includes(g))) {
      reasons.push('선호하는 장르');
    }
    if (exhibition.mood_tags?.some(m => preferences.moods.includes(m))) {
      reasons.push('취향에 맞는 분위기');
    }
    
    return reasons.length > 0 
      ? `${reasons.join(', ')}가 잘 맞는 전시예요`
      : '당신의 성격 유형에 추천하는 전시입니다';
  }

  generateKnowledgeReason(exhibition, season) {
    const reasons = [];
    
    if (exhibition.seasonal_tags?.includes(season)) {
      reasons.push(`${season} 시즌에 어울리는`);
    }
    if (!exhibition.ticket_price?.adult) {
      reasons.push('무료 관람 가능한');
    }
    
    return reasons.length > 0
      ? `${reasons.join(', ')} 전시예요`
      : '지금 시기에 추천하는 전시입니다';
  }

  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  getPersonalityMoodTags(personalityType) {
    const moodMap = {
      'LAEF': ['dreamy', 'peaceful', 'artistic'],
      'SRMC': ['structured', 'harmonious', 'elegant'],
      'GREF': ['bold', 'energetic', 'innovative'],
      'CREF': ['experimental', 'unique', 'thought-provoking']
    };
    return moodMap[personalityType] || moodMap['LAEF'];
  }

  async getUserVisitHistory(userId, limit = 20) {
    const query = `
      SELECT uev.*, e.title, e.genres, ea.artist_name
      FROM user_exhibition_visits uev
      JOIN exhibitions e ON uev.exhibition_id = e.id
      LEFT JOIN exhibition_artists ea ON e.id = ea.exhibition_id
      WHERE uev.user_id = $1
      ORDER BY uev.visited_at DESC
      LIMIT $2
    `;
    
    const result = await db.query(query, [userId, limit]);
    return result.rows;
  }

  async updateUserProfile(userId, activityData) {
    // 사용자 활동 기반 프로필 업데이트 로직
    // 실제 구현에서는 머신러닝 모델을 활용할 수 있음
    log.info(`Profile updated for user ${userId}`);
  }
}

module.exports = new AIRecommendationService();