// APT Data Access Layer - 실제 DB 접근 함수들
const db = require('../config/database');

class APTDataAccess {
  // ==================== 사용자 관련 ====================
  
  async getUserProfile(userId) {
    try {
      const result = await db.query(
        `SELECT 
          u.id,
          u.name,
          u.email,
          COALESCE(sp.type_code, 'LAEF') as apt_type,
          sp.created_at as apt_determined_at,
          sp.confidence_score,
          sp.archetype_evolution_stage as level,
          sp.cognitive_vector,
          sp.emotional_vector,
          sp.aesthetic_vector
        FROM users u
        LEFT JOIN sayu_profiles sp ON u.id = sp.user_id
        WHERE u.id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const profile = result.rows[0];
      
      // 퀴즈 응답 가져오기
      const quizResponses = await this.getUserQuizResponses(userId);
      
      return {
        userId: profile.id,
        name: profile.name,
        email: profile.email,
        aptType: profile.apt_type,
        aptDeterminedAt: profile.apt_determined_at,
        confidence: profile.confidence_score,
        level: profile.level || 1,
        quizResponses,
        vectors: {
          cognitive: profile.cognitive_vector,
          emotional: profile.emotional_vector,
          aesthetic: profile.aesthetic_vector
        }
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      // 기본값 반환
      return {
        userId,
        aptType: 'LAEF',
        level: 1,
        quizResponses: []
      };
    }
  }

  async getUserQuizResponses(userId) {
    try {
      const result = await db.query(
        `SELECT 
          question_id,
          answer_id,
          weights,
          time_spent
        FROM quiz_responses
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 15`,
        [userId]
      );

      return result.rows.map(row => ({
        questionId: row.question_id,
        answerId: row.answer_id,
        weight: row.weights?.dominant || 1.0,
        axis: this.extractAxisFromWeights(row.weights),
        timeSpent: row.time_spent
      }));
    } catch (error) {
      console.error('Error getting quiz responses:', error);
      return [];
    }
  }

  async getUserHistory(userId) {
    try {
      // 조회한 작품들
      const viewedResult = await db.query(
        `SELECT DISTINCT artwork_id 
        FROM image_usage_log 
        WHERE user_id = $1 AND view_count > 0
        LIMIT 1000`,
        [userId]
      );

      // 좋아요한 작품들
      const likedResult = await db.query(
        `SELECT DISTINCT artwork_id 
        FROM user_artwork_interactions 
        WHERE user_id = $1 AND interaction_type = 'like'
        LIMIT 500`,
        [userId]
      );

      // 좋아한 작가들
      const likedArtistsResult = await db.query(
        `SELECT DISTINCT artist, score
        FROM user_artist_preferences
        WHERE user_id = $1 AND score > 0
        ORDER BY score DESC
        LIMIT 100`,
        [userId]
      );

      // 선호 스타일들
      const likedStylesResult = await db.query(
        `SELECT DISTINCT genre, score
        FROM user_genre_preferences
        WHERE user_id = $1 AND score > 0
        ORDER BY score DESC
        LIMIT 50`,
        [userId]
      );

      return {
        viewedArtworks: viewedResult.rows.map(r => r.artwork_id),
        likedArtworks: likedResult.rows.map(r => r.artwork_id),
        likedArtists: likedArtistsResult.rows.map(r => r.artist),
        likedStyles: likedStylesResult.rows.map(r => r.genre)
      };
    } catch (error) {
      console.error('Error getting user history:', error);
      return {
        viewedArtworks: [],
        likedArtworks: [],
        likedArtists: [],
        likedStyles: []
      };
    }
  }

  // ==================== 작품 관련 ====================
  
  async getArtworkById(artworkId) {
    try {
      const result = await db.query(
        `SELECT 
          a.*,
          ae.personality_tags,
          ae.mood_tags,
          ae.composition_analysis,
          ae.cultural_context,
          ae.emotional_impact,
          ae.intellectual_depth,
          ae.technical_mastery,
          ae.historical_significance
        FROM artworks a
        LEFT JOIN artworks_extended ae ON a.id = ae.artwork_id
        WHERE a.id = $1`,
        [artworkId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const artwork = result.rows[0];
      
      // APT 매칭을 위한 추가 점수 계산
      return {
        ...artwork,
        solitudeScore: this.calculateSolitudeScore(artwork),
        discussionPotential: this.calculateDiscussionPotential(artwork),
        emotionalImpact: artwork.emotional_impact || 5,
        intellectualStimulation: artwork.intellectual_depth || 5,
        viewingFreedom: this.calculateViewingFreedom(artwork),
        isAbstract: this.isAbstractArtwork(artwork),
        emotionalTone: this.extractEmotionalTone(artwork.mood_tags),
        colorPalette: artwork.color_palette || 'varied'
      };
    } catch (error) {
      console.error('Error getting artwork:', error);
      return null;
    }
  }

  async getArtworkPool(context = 'general', limit = 1000) {
    try {
      let query;
      let params = [limit];

      switch (context) {
        case 'trending':
          query = `
            SELECT DISTINCT a.*, 
              COUNT(iul.id) as view_count,
              COUNT(uai.id) FILTER (WHERE uai.interaction_type = 'like') as like_count
            FROM artworks a
            LEFT JOIN image_usage_log iul ON a.id = iul.artwork_id 
              AND iul.created_at > NOW() - INTERVAL '7 days'
            LEFT JOIN user_artwork_interactions uai ON a.id = uai.artwork_id
              AND uai.created_at > NOW() - INTERVAL '7 days'
            WHERE a.image_url IS NOT NULL
            GROUP BY a.id
            ORDER BY (COUNT(iul.id) + COUNT(uai.id) * 3) DESC
            LIMIT $1
          `;
          break;

        case 'new':
          query = `
            SELECT * FROM artworks
            WHERE image_url IS NOT NULL
              AND created_at > NOW() - INTERVAL '30 days'
            ORDER BY created_at DESC
            LIMIT $1
          `;
          break;

        case 'seasonal':
          const currentMonth = new Date().getMonth() + 1;
          query = `
            SELECT * FROM artworks
            WHERE image_url IS NOT NULL
              AND (
                EXTRACT(MONTH FROM TO_DATE(date, 'YYYY')) = $2
                OR tags @> ARRAY[$3]
              )
            ORDER BY RANDOM()
            LIMIT $1
          `;
          params = [limit, currentMonth, this.getSeasonalTag()];
          break;

        default: // general
          query = `
            SELECT * FROM artworks
            WHERE image_url IS NOT NULL
              AND quality_score > 0.5
            ORDER BY quality_score DESC, RANDOM()
            LIMIT $1
          `;
      }

      const result = await db.query(query, params);
      
      // 추가 점수 계산
      return result.rows.map(artwork => ({
        ...artwork,
        solitudeScore: this.calculateSolitudeScore(artwork),
        discussionPotential: this.calculateDiscussionPotential(artwork),
        emotionalImpact: 5,
        intellectualStimulation: 5,
        viewingFreedom: 5,
        isAbstract: this.isAbstractArtwork(artwork)
      }));
    } catch (error) {
      console.error('Error getting artwork pool:', error);
      return [];
    }
  }

  // ==================== 통계 관련 ====================
  
  async getViewStatsByAPT(aptType, period = 'daily') {
    try {
      const intervalMap = {
        'daily': '1 day',
        'weekly': '7 days',
        'monthly': '30 days'
      };
      const interval = intervalMap[period] || '1 day';

      const result = await db.query(
        `SELECT 
          iul.artwork_id as id,
          COUNT(*) as count,
          a.title,
          a.artist
        FROM image_usage_log iul
        JOIN users u ON iul.user_id = u.id
        JOIN sayu_profiles sp ON u.id = sp.user_id
        JOIN artworks a ON iul.artwork_id = a.id
        WHERE sp.type_code = $1
          AND iul.created_at > NOW() - INTERVAL $2
          AND iul.view_count > 0
        GROUP BY iul.artwork_id, a.title, a.artist
        ORDER BY COUNT(*) DESC
        LIMIT 100`,
        [aptType, interval]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting view stats:', error);
      return [];
    }
  }

  async getLikeStatsByAPT(aptType, period = 'daily') {
    try {
      const intervalMap = {
        'daily': '1 day',
        'weekly': '7 days',
        'monthly': '30 days'
      };
      const interval = intervalMap[period] || '1 day';

      const result = await db.query(
        `SELECT 
          uai.artwork_id as id,
          COUNT(*) as count,
          a.title,
          a.artist
        FROM user_artwork_interactions uai
        JOIN users u ON uai.user_id = u.id
        JOIN sayu_profiles sp ON u.id = sp.user_id
        JOIN artworks a ON uai.artwork_id = a.id
        WHERE sp.type_code = $1
          AND uai.interaction_type = 'like'
          AND uai.created_at > NOW() - INTERVAL $2
        GROUP BY uai.artwork_id, a.title, a.artist
        ORDER BY COUNT(*) DESC
        LIMIT 50`,
        [aptType, interval]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting like stats:', error);
      return [];
    }
  }

  // ==================== 전시 관련 ====================
  
  async calculateExhibitionRecommendations(aptType, options) {
    try {
      const { location, dateRange, limit = 10 } = options;
      
      let query = `
        SELECT 
          e.*,
          m.name as museum_name,
          m.location as museum_location,
          COUNT(DISTINCT er.id) as review_count,
          AVG(er.rating) as avg_rating
        FROM exhibitions e
        JOIN museums m ON e.museum_id = m.id
        LEFT JOIN exhibition_reviews er ON e.id = er.exhibition_id
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;

      // 위치 필터
      if (location && location !== 'all') {
        query += ` AND LOWER(m.location) LIKE LOWER($${paramIndex})`;
        params.push(`%${location}%`);
        paramIndex++;
      }

      // 날짜 필터
      const dateFilters = {
        'current': `AND e.start_date <= NOW() AND e.end_date >= NOW()`,
        'upcoming': `AND e.start_date > NOW() AND e.start_date <= NOW() + INTERVAL '30 days'`,
        'thisWeek': `AND e.start_date <= NOW() + INTERVAL '7 days' AND e.end_date >= NOW()`,
        'thisMonth': `AND e.start_date <= NOW() + INTERVAL '30 days' AND e.end_date >= NOW()`
      };
      
      if (dateFilters[dateRange]) {
        query += ` ${dateFilters[dateRange]}`;
      }

      query += `
        GROUP BY e.id, m.name, m.location
        ORDER BY 
          CASE 
            WHEN $${paramIndex} = 'LAEF' THEN e.tags @> ARRAY['abstract', 'emotional']
            WHEN $${paramIndex} = 'SRMC' THEN e.tags @> ARRAY['educational', 'structured']
            ELSE false
          END DESC,
          avg_rating DESC NULLS LAST,
          e.start_date ASC
        LIMIT $${paramIndex + 1}
      `;
      
      params.push(aptType, limit);
      
      const result = await db.query(query, params);
      
      return result.rows.map(exhibition => ({
        ...exhibition,
        matchReason: this.generateExhibitionMatchReason(exhibition, aptType)
      }));
    } catch (error) {
      console.error('Error calculating exhibition recommendations:', error);
      return [];
    }
  }

  // ==================== 헬퍼 함수 ====================
  
  extractAxisFromWeights(weights) {
    if (!weights) return null;
    
    // weights 객체에서 가장 높은 값을 가진 축 찾기
    const axes = ['L_S', 'A_R', 'E_M', 'F_C'];
    let maxAxis = null;
    let maxValue = 0;
    
    for (const axis of axes) {
      const value = (weights[axis.split('_')[0]] || 0) + (weights[axis.split('_')[1]] || 0);
      if (value > maxValue) {
        maxValue = value;
        maxAxis = axis;
      }
    }
    
    return maxAxis;
  }

  calculateSolitudeScore(artwork) {
    // 혼자 감상하기 좋은 정도 (1-10)
    let score = 5; // 기본값
    
    if (artwork.genre?.includes('portrait')) score += 2;
    if (artwork.genre?.includes('landscape')) score += 2;
    if (artwork.genre?.includes('still life')) score += 1;
    if (artwork.tags?.includes('contemplative')) score += 2;
    if (artwork.tags?.includes('meditative')) score += 2;
    if (artwork.subject?.includes('solitude')) score += 1;
    
    return Math.min(10, Math.max(1, score));
  }

  calculateDiscussionPotential(artwork) {
    // 토론 유발 가능성 (1-10)
    let score = 5;
    
    if (artwork.genre?.includes('abstract')) score += 2;
    if (artwork.genre?.includes('contemporary')) score += 2;
    if (artwork.tags?.includes('controversial')) score += 3;
    if (artwork.tags?.includes('political')) score += 2;
    if (artwork.tags?.includes('social')) score += 1;
    if (artwork.cultural_context) score += 1;
    
    return Math.min(10, Math.max(1, score));
  }

  calculateViewingFreedom(artwork) {
    // 자유로운 감상 가능 정도 (1-10)
    let score = 5;
    
    if (artwork.genre?.includes('abstract')) score += 2;
    if (artwork.genre?.includes('surreal')) score += 2;
    if (!artwork.subject || artwork.subject === 'Unknown') score += 1;
    if (artwork.composition_analysis?.includes('open')) score += 1;
    
    return Math.min(10, Math.max(1, score));
  }

  isAbstractArtwork(artwork) {
    const abstractIndicators = [
      'abstract', 'non-representational', 'conceptual', 
      'minimalist', 'expressionist', 'color field'
    ];
    
    const genre = (artwork.genre || '').toLowerCase();
    const style = (artwork.style || '').toLowerCase();
    const tags = (artwork.tags || []).map(t => t.toLowerCase());
    
    return abstractIndicators.some(indicator => 
      genre.includes(indicator) || 
      style.includes(indicator) || 
      tags.includes(indicator)
    );
  }

  extractEmotionalTone(moodTags) {
    if (!moodTags || moodTags.length === 0) return 'neutral';
    
    // 첫 번째 무드 태그를 주요 톤으로 사용
    return moodTags[0].toLowerCase();
  }

  getSeasonalTag() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  generateExhibitionMatchReason(exhibition, aptType) {
    const typeData = require('../../../shared/SAYUTypeDefinitions').SAYU_TYPES[aptType];
    const reasons = [];
    
    if (aptType[0] === 'L' && exhibition.tags?.includes('quiet')) {
      reasons.push('조용한 관람 환경');
    }
    if (aptType[0] === 'S' && exhibition.has_docent) {
      reasons.push('도슨트 투어 제공');
    }
    if (aptType[1] === 'A' && exhibition.tags?.includes('contemporary')) {
      reasons.push('현대적 작품 전시');
    }
    if (aptType[2] === 'E' && exhibition.tags?.includes('emotional')) {
      reasons.push('감성적인 작품 구성');
    }
    
    return reasons.join(' · ') || `${typeData.name}님께 추천`;
  }
}

module.exports = new APTDataAccess();