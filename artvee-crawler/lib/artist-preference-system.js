const { Pool } = require('pg');

/**
 * 작가 및 작품 유형 기반 선호도 시스템
 * 사용자의 취향 히스토리를 학습하고 유사 작가/작품을 추천
 */
class ArtistPreferenceSystem {
  constructor(databaseUrl) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // 작가 관계 맵 (미술사적 연관성)
    this.artistRelations = {
      // 인상주의 그룹
      'monet': {
        movement: 'impressionism',
        related: ['renoir', 'degas', 'pissarro', 'sisley', 'caillebotte'],
        influenced_by: ['manet', 'boudin'],
        influenced: ['signac', 'seurat']
      },
      'van-gogh': {
        movement: 'post-impressionism',
        related: ['gauguin', 'cezanne', 'toulouse-lautrec'],
        influenced_by: ['millet', 'daumier', 'hiroshige'],
        influenced: ['matisse', 'vlaminck', 'kirchner']
      },
      'picasso': {
        movement: 'cubism',
        related: ['braque', 'gris', 'leger'],
        influenced_by: ['cezanne', 'gauguin', 'african-art'],
        influenced: ['duchamp', 'de-kooning', 'bacon']
      },
      'rembrandt': {
        movement: 'baroque',
        related: ['vermeer', 'hals', 'jan-steen'],
        influenced_by: ['caravaggio', 'lastman'],
        influenced: ['bol', 'flinck', 'hoogstraten']
      },
      // 더 많은 작가 관계 추가...
    };
    
    // 작품 유형(장르) 계층 구조
    this.genreHierarchy = {
      'figurative': {
        subgenres: ['portrait', 'self-portrait', 'group-portrait', 'nude'],
        related: ['genre-painting', 'history-painting']
      },
      'landscape': {
        subgenres: ['seascape', 'cityscape', 'pastoral', 'wilderness'],
        related: ['marine', 'veduta', 'topographical']
      },
      'still-life': {
        subgenres: ['vanitas', 'floral', 'food', 'trompe-loeil'],
        related: ['interior', 'botanical']
      },
      'abstract': {
        subgenres: ['geometric', 'lyrical', 'color-field', 'gestural'],
        related: ['non-objective', 'concrete']
      },
      'religious': {
        subgenres: ['biblical', 'mythological', 'devotional', 'icon'],
        related: ['allegorical', 'spiritual']
      }
    };
    
    // SAYU 예술 성격 유형별 초기 선호도 설정
    this.sayuInitialPreferences = {
      // L(Lone) + A(Atmospheric) 그룹 - 혼자서 분위기를 음미하는
      'LAEF': { // 여우 - 몽환적 방랑자
        artists: ['van-gogh', 'turner', 'blake', 'redon', 'moreau'],
        genres: ['dreamlike', 'visionary', 'emotional', 'mystical'],
        movements: ['symbolism', 'romanticism', 'surrealism']
      },
      'LAEC': { // 고양이 - 감성 큐레이터
        artists: ['monet', 'degas', 'cassatt', 'sargent', 'whistler'],
        genres: ['elegant', 'refined', 'atmospheric', 'poetic'],
        movements: ['impressionism', 'aestheticism', 'tonalism']
      },
      'LAMF': { // 올빼미 - 직관적 탐구자
        artists: ['vermeer', 'hammershoi', 'hopper', 'wyeth', 'balthus'],
        genres: ['contemplative', 'introspective', 'mysterious', 'psychological'],
        movements: ['realism', 'magic-realism', 'new-objectivity']
      },
      'LAMC': { // 거북이 - 철학적 수집가
        artists: ['chardin', 'morandi', 'cezanne', 'braque', 'klee'],
        genres: ['still-life', 'meditative', 'structured', 'harmonious'],
        movements: ['post-impressionism', 'cubism', 'bauhaus']
      },
      
      // L(Lone) + R(Realistic) 그룹 - 혼자서 정밀하게 관찰하는
      'LREF': { // 카멜레온 - 고독한 관찰자
        artists: ['velazquez', 'manet', 'courbet', 'eakins', 'lucian-freud'],
        genres: ['observational', 'naturalistic', 'psychological-realism'],
        movements: ['realism', 'impressionism', 'contemporary-realism']
      },
      'LREC': { // 고슴도치 - 섬세한 감정가
        artists: ['renoir', 'fragonard', 'boucher', 'gainsborough', 'greuze'],
        genres: ['gentle', 'delicate', 'pastoral', 'intimate'],
        movements: ['rococo', 'english-romanticism', 'genre-painting']
      },
      'LRMF': { // 문어 - 디지털 탐험가
        artists: ['caravaggio', 'ribera', 'goya', 'bacon', 'lucian-freud'],
        genres: ['dramatic', 'intense', 'psychological', 'raw'],
        movements: ['baroque', 'romanticism', 'expressionism']
      },
      'LRMC': { // 비버 - 학구적 연구자
        artists: ['durer', 'van-eyck', 'holbein', 'ingres', 'david'],
        genres: ['precise', 'detailed', 'technical', 'classical'],
        movements: ['northern-renaissance', 'neoclassicism', 'academic-art']
      },
      
      // S(Shared) + A(Atmospheric) 그룹 - 함께 분위기를 느끼는
      'SAEF': { // 나비 - 감성 나눔이
        artists: ['matisse', 'chagall', 'dufy', 'delaunay', 'kirchner'],
        genres: ['vibrant', 'joyful', 'colorful', 'expressive'],
        movements: ['fauvism', 'orphism', 'expressionism']
      },
      'SAEC': { // 펭귄 - 예술 네트워커
        artists: ['mondrian', 'kandinsky', 'malevich', 'albers', 'vasarely'],
        genres: ['geometric', 'systematic', 'harmonious', 'rhythmic'],
        movements: ['de-stijl', 'bauhaus', 'constructivism', 'op-art']
      },
      'SAMF': { // 앵무새 - 영감 전도사
        artists: ['basquiat', 'haring', 'koons', 'murakami', 'kaws'],
        genres: ['pop', 'street-art', 'contemporary', 'communicative'],
        movements: ['neo-expressionism', 'pop-art', 'street-art']
      },
      'SAMC': { // 사슴 - 문화 기획자
        artists: ['warhol', 'lichtenstein', 'rauschenberg', 'johns', 'hockney'],
        genres: ['pop-culture', 'systematic', 'cultural-commentary'],
        movements: ['pop-art', 'neo-pop', 'contemporary-art']
      },
      
      // S(Shared) + R(Realistic) 그룹 - 함께 정확히 감상하는
      'SREF': { // 강아지 - 열정적 관람자
        artists: ['rockwell', 'leyendecker', 'parrish', 'alma-tadema', 'bouguereau'],
        genres: ['narrative', 'sentimental', 'accessible', 'decorative'],
        movements: ['american-realism', 'academic-art', 'golden-age-illustration']
      },
      'SREC': { // 오리 - 따뜻한 안내자
        artists: ['millais', 'rossetti', 'waterhouse', 'burne-jones', 'mucha'],
        genres: ['romantic', 'narrative', 'decorative', 'symbolic'],
        movements: ['pre-raphaelite', 'art-nouveau', 'symbolism']
      },
      'SRMF': { // 코끼리 - 지식 멘토
        artists: ['rembrandt', 'titian', 'rubens', 'velazquez', 'poussin'],
        genres: ['masterful', 'monumental', 'narrative', 'classical'],
        movements: ['baroque', 'high-renaissance', 'venetian-school']
      },
      'SRMC': { // 독수리 - 체계적 교육자
        artists: ['raphael', 'leonardo', 'michelangelo', 'botticelli', 'giotto'],
        genres: ['classical', 'systematic', 'educational', 'ideal'],
        movements: ['high-renaissance', 'early-renaissance', 'mannerism']
      }
    };
  }

  /**
   * 사용자 선호도 학습
   */
  async learnUserPreference(userId, interactionData) {
    const { artworkId, interactionType, duration, rating } = interactionData;
    
    // 작품 정보 조회
    const artworkResult = await this.pool.query(
      'SELECT * FROM artvee_artworks WHERE id = $1',
      [artworkId]
    );
    
    if (artworkResult.rows.length === 0) return;
    
    const artwork = artworkResult.rows[0];
    
    // 상호작용 점수 계산
    const score = this.calculateInteractionScore(interactionType, duration, rating);
    
    // 사용자 선호도 업데이트
    await this.updateUserPreferences(userId, {
      artist: artwork.artist,
      genre: artwork.genre,
      period: artwork.period,
      style: artwork.style,
      score: score
    });
    
    // 선호도 전파 (연관 작가/장르로 확산)
    await this.propagatePreferences(userId, artwork, score);
  }

  /**
   * 상호작용 점수 계산
   */
  calculateInteractionScore(type, duration, rating) {
    let score = 0;
    
    // 상호작용 유형별 기본 점수
    const typeScores = {
      'view': 1,
      'like': 3,
      'save': 5,
      'share': 4,
      'purchase': 10
    };
    
    score += typeScores[type] || 0;
    
    // 감상 시간 보너스 (30초 이상)
    if (duration) {
      if (duration > 180) score += 3;      // 3분 이상
      else if (duration > 60) score += 2;  // 1분 이상
      else if (duration > 30) score += 1;  // 30초 이상
    }
    
    // 평점 반영
    if (rating) {
      score += (rating - 3); // 3점 기준으로 가감
    }
    
    return score;
  }

  /**
   * 사용자 선호도 업데이트
   */
  async updateUserPreferences(userId, preferenceData) {
    const { artist, genre, period, style, score } = preferenceData;
    
    // 아티스트 선호도
    if (artist) {
      await this.upsertPreference('user_artist_preferences', {
        user_id: userId,
        artist: artist,
        score: score
      });
    }
    
    // 장르 선호도
    if (genre) {
      await this.upsertPreference('user_genre_preferences', {
        user_id: userId,
        genre: genre,
        score: score
      });
    }
    
    // 시대 선호도
    if (period) {
      await this.upsertPreference('user_period_preferences', {
        user_id: userId,
        period: period,
        score: score
      });
    }
  }

  /**
   * 선호도 전파 (연관 항목으로 확산)
   */
  async propagatePreferences(userId, artwork, baseScore) {
    // 작가 연관성 전파
    if (artwork.artist) {
      const artistKey = this.normalizeArtistName(artwork.artist);
      const relations = this.artistRelations[artistKey];
      
      if (relations) {
        // 같은 운동의 다른 작가들
        for (const relatedArtist of relations.related || []) {
          await this.upsertPreference('user_artist_preferences', {
            user_id: userId,
            artist: relatedArtist,
            score: baseScore * 0.5, // 50% 전파
            is_inferred: true
          });
        }
        
        // 영향을 준 작가들
        for (const influencer of relations.influenced_by || []) {
          await this.upsertPreference('user_artist_preferences', {
            user_id: userId,
            artist: influencer,
            score: baseScore * 0.3, // 30% 전파
            is_inferred: true
          });
        }
      }
    }
    
    // 장르 계층 전파
    if (artwork.genre) {
      const genreInfo = this.findGenreInHierarchy(artwork.genre);
      if (genreInfo) {
        // 상위 장르로 전파
        if (genreInfo.parent) {
          await this.upsertPreference('user_genre_preferences', {
            user_id: userId,
            genre: genreInfo.parent,
            score: baseScore * 0.4,
            is_inferred: true
          });
        }
        
        // 관련 장르로 전파
        for (const related of genreInfo.related || []) {
          await this.upsertPreference('user_genre_preferences', {
            user_id: userId,
            genre: related,
            score: baseScore * 0.3,
            is_inferred: true
          });
        }
      }
    }
  }

  /**
   * 선호도 기반 작품 추천
   */
  async getPersonalizedRecommendations(userId, options = {}) {
    const {
      limit = 20,
      diversityFactor = 0.3, // 다양성 비율
      excludeViewed = true
    } = options;
    
    // 사용자 선호도 프로필 로드
    const userProfile = await this.loadUserProfile(userId);
    
    // 추천 전략 믹스
    const recommendations = [];
    
    // 1. 선호 작가 기반 (40%)
    const artistBasedCount = Math.floor(limit * 0.4);
    const artistRecs = await this.getArtistBasedRecommendations(
      userId, 
      userProfile.topArtists,
      artistBasedCount,
      excludeViewed
    );
    recommendations.push(...artistRecs);
    
    // 2. 선호 장르 기반 (30%)
    const genreBasedCount = Math.floor(limit * 0.3);
    const genreRecs = await this.getGenreBasedRecommendations(
      userId,
      userProfile.topGenres,
      genreBasedCount,
      excludeViewed
    );
    recommendations.push(...genreRecs);
    
    // 3. 유사 사용자 기반 (20%)
    const collaborativeCount = Math.floor(limit * 0.2);
    const collabRecs = await this.getCollaborativeRecommendations(
      userId,
      userProfile,
      collaborativeCount,
      excludeViewed
    );
    recommendations.push(...collabRecs);
    
    // 4. 탐색적 추천 (10% - 다양성)
    const exploratoryCount = limit - recommendations.length;
    const exploreRecs = await this.getExploratoryRecommendations(
      userId,
      exploratoryCount,
      excludeViewed
    );
    recommendations.push(...exploreRecs);
    
    // 중복 제거 및 스코어링
    return this.rankAndDiversify(recommendations, userProfile, diversityFactor);
  }

  /**
   * 작가 기반 추천
   */
  async getArtistBasedRecommendations(userId, topArtists, limit, excludeViewed) {
    if (!topArtists || topArtists.length === 0) return [];
    
    // 선호 작가들의 작품 조회
    const query = `
      WITH viewed_artworks AS (
        SELECT DISTINCT artwork_id 
        FROM image_usage_log 
        WHERE user_id = $1 AND usage_type = 'view'
      ),
      artist_scores AS (
        SELECT artist, SUM(score) as total_score
        FROM user_artist_preferences
        WHERE user_id = $1
        GROUP BY artist
        ORDER BY total_score DESC
        LIMIT 10
      )
      SELECT DISTINCT
        a.*,
        'artist_based' as recommendation_type,
        asp.total_score as artist_score,
        CASE 
          WHEN a.artist = ANY($2::text[]) THEN 1.0
          ELSE 0.7
        END as relevance_score
      FROM artvee_artworks a
      JOIN artist_scores asp ON 
        a.artist = asp.artist OR
        a.artist = ANY(
          SELECT unnest(related) 
          FROM artist_relations 
          WHERE artist = asp.artist
        )
      WHERE 
        a.is_active = true
        ${excludeViewed ? 'AND a.id NOT IN (SELECT artwork_id FROM viewed_artworks)' : ''}
      ORDER BY 
        relevance_score DESC,
        artist_score DESC,
        a.image_quality_score DESC
      LIMIT $3
    `;
    
    const result = await this.pool.query(query, [
      userId,
      topArtists.map(a => a.artist),
      limit
    ]);
    
    return result.rows;
  }

  /**
   * 장르 기반 추천
   */
  async getGenreBasedRecommendations(userId, topGenres, limit, excludeViewed) {
    if (!topGenres || topGenres.length === 0) return [];
    
    const query = `
      WITH viewed_artworks AS (
        SELECT DISTINCT artwork_id 
        FROM image_usage_log 
        WHERE user_id = $1 AND usage_type = 'view'
      ),
      user_genre_prefs AS (
        SELECT genre, SUM(score) as total_score
        FROM user_genre_preferences
        WHERE user_id = $1
        GROUP BY genre
      )
      SELECT DISTINCT
        a.*,
        'genre_based' as recommendation_type,
        ugp.total_score as genre_score,
        RANDOM() as diversity_factor
      FROM artvee_artworks a
      JOIN user_genre_prefs ugp ON a.genre = ugp.genre
      WHERE 
        a.is_active = true
        AND a.image_quality_score >= 0.6
        ${excludeViewed ? 'AND a.id NOT IN (SELECT artwork_id FROM viewed_artworks)' : ''}
      ORDER BY 
        genre_score DESC,
        a.image_quality_score DESC,
        diversity_factor
      LIMIT $2
    `;
    
    const result = await this.pool.query(query, [userId, limit]);
    return result.rows;
  }

  /**
   * 협업 필터링 추천 (유사 사용자 기반)
   */
  async getCollaborativeRecommendations(userId, userProfile, limit, excludeViewed) {
    // 유사한 선호도를 가진 사용자 찾기
    const query = `
      WITH user_vector AS (
        -- 현재 사용자의 선호도 벡터
        SELECT 
          array_agg(artist ORDER BY artist) as artists,
          array_agg(score ORDER BY artist) as scores
        FROM user_artist_preferences
        WHERE user_id = $1
      ),
      similar_users AS (
        -- 코사인 유사도로 유사 사용자 찾기
        SELECT 
          uap.user_id,
          COUNT(*) as common_artists,
          SUM(uap.score * up.score) / 
            (SQRT(SUM(uap.score^2)) * SQRT(SUM(up.score^2))) as similarity
        FROM user_artist_preferences uap
        JOIN user_artist_preferences up ON 
          uap.artist = up.artist AND up.user_id = $1
        WHERE uap.user_id != $1
        GROUP BY uap.user_id
        HAVING COUNT(*) >= 3 -- 최소 3명의 공통 작가
        ORDER BY similarity DESC
        LIMIT 10
      ),
      viewed_artworks AS (
        SELECT DISTINCT artwork_id 
        FROM image_usage_log 
        WHERE user_id = $1 AND usage_type = 'view'
      )
      -- 유사 사용자들이 좋아한 작품 추천
      SELECT DISTINCT
        a.*,
        'collaborative' as recommendation_type,
        COUNT(DISTINCT iul.user_id) as liked_by_similar_users,
        AVG(su.similarity) as avg_similarity
      FROM artvee_artworks a
      JOIN image_usage_log iul ON a.id = iul.artwork_id
      JOIN similar_users su ON iul.user_id = su.user_id
      WHERE 
        a.is_active = true
        AND iul.usage_type IN ('like', 'save')
        ${excludeViewed ? 'AND a.id NOT IN (SELECT artwork_id FROM viewed_artworks)' : ''}
      GROUP BY a.id
      ORDER BY 
        liked_by_similar_users DESC,
        avg_similarity DESC
      LIMIT $2
    `;
    
    const result = await this.pool.query(query, [userId, limit]);
    return result.rows;
  }

  /**
   * 탐색적 추천 (새로운 발견)
   */
  async getExploratoryRecommendations(userId, limit, excludeViewed) {
    // 사용자가 아직 경험하지 않은 스타일/시대의 고품질 작품
    const query = `
      WITH user_explored AS (
        SELECT DISTINCT 
          a.period,
          a.style,
          a.genre
        FROM image_usage_log iul
        JOIN artvee_artworks a ON iul.artwork_id = a.id
        WHERE iul.user_id = $1
      ),
      viewed_artworks AS (
        SELECT DISTINCT artwork_id 
        FROM image_usage_log 
        WHERE user_id = $1 AND usage_type = 'view'
      )
      SELECT 
        a.*,
        'exploratory' as recommendation_type,
        CASE 
          WHEN a.period NOT IN (SELECT period FROM user_explored WHERE period IS NOT NULL) THEN 0.3
          WHEN a.style NOT IN (SELECT style FROM user_explored WHERE style IS NOT NULL) THEN 0.2
          WHEN a.genre NOT IN (SELECT genre FROM user_explored WHERE genre IS NOT NULL) THEN 0.1
          ELSE 0
        END as novelty_score
      FROM artvee_artworks a
      WHERE 
        a.is_active = true
        AND a.image_quality_score >= 0.8
        ${excludeViewed ? 'AND a.id NOT IN (SELECT artwork_id FROM viewed_artworks)' : ''}
        AND (
          a.period NOT IN (SELECT period FROM user_explored WHERE period IS NOT NULL)
          OR a.style NOT IN (SELECT style FROM user_explored WHERE style IS NOT NULL)
        )
      ORDER BY 
        novelty_score DESC,
        a.image_quality_score DESC,
        RANDOM()
      LIMIT $2
    `;
    
    const result = await this.pool.query(query, [userId, limit]);
    return result.rows;
  }

  /**
   * 사용자 프로필 로드
   */
  async loadUserProfile(userId) {
    // 사용자 정보
    const userResult = await this.pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = userResult.rows[0];
    
    // 선호 작가 Top 10
    const artistPrefs = await this.pool.query(`
      SELECT artist, SUM(score) as total_score
      FROM user_artist_preferences
      WHERE user_id = $1
      GROUP BY artist
      ORDER BY total_score DESC
      LIMIT 10
    `, [userId]);
    
    // 선호 장르 Top 5
    const genrePrefs = await this.pool.query(`
      SELECT genre, SUM(score) as total_score
      FROM user_genre_preferences
      WHERE user_id = $1
      GROUP BY genre
      ORDER BY total_score DESC
      LIMIT 5
    `, [userId]);
    
    // SAYU 타입별 초기 선호도 추가
    const sayuType = user.personality_type;
    const sayuPrefs = this.sayuInitialPreferences[sayuType] || {};
    
    return {
      userId: userId,
      sayuType: sayuType,
      topArtists: artistPrefs.rows,
      topGenres: genrePrefs.rows,
      sayuPreferences: sayuPrefs,
      joinDate: user.created_at
    };
  }

  /**
   * 추천 결과 순위 조정 및 다양성 확보
   */
  rankAndDiversify(recommendations, userProfile, diversityFactor) {
    // 중복 제거
    const uniqueMap = new Map();
    recommendations.forEach(rec => {
      if (!uniqueMap.has(rec.id) || uniqueMap.get(rec.id).relevance_score < rec.relevance_score) {
        uniqueMap.set(rec.id, rec);
      }
    });
    
    let uniqueRecs = Array.from(uniqueMap.values());
    
    // 스코어 계산
    uniqueRecs = uniqueRecs.map(rec => {
      let score = 0;
      
      // 추천 유형별 가중치
      const typeWeights = {
        'artist_based': 1.0,
        'genre_based': 0.8,
        'collaborative': 0.9,
        'exploratory': 0.6
      };
      
      score += (rec.relevance_score || 0) * (typeWeights[rec.recommendation_type] || 0.5);
      score += (rec.image_quality_score || 0) * 0.2;
      
      // SAYU 타입 부합도
      if (userProfile.sayuPreferences) {
        if (userProfile.sayuPreferences.artists?.includes(rec.artist)) score += 0.3;
        if (userProfile.sayuPreferences.genres?.includes(rec.genre)) score += 0.2;
      }
      
      rec.final_score = score;
      return rec;
    });
    
    // 정렬
    uniqueRecs.sort((a, b) => b.final_score - a.final_score);
    
    // 다양성 적용
    if (diversityFactor > 0) {
      const diversified = [];
      const usedArtists = new Set();
      const usedGenres = new Set();
      
      for (const rec of uniqueRecs) {
        // 이미 추천된 작가/장르 체크
        const artistPenalty = usedArtists.has(rec.artist) ? diversityFactor : 0;
        const genrePenalty = usedGenres.has(rec.genre) ? diversityFactor * 0.5 : 0;
        
        rec.diversity_adjusted_score = rec.final_score * (1 - artistPenalty - genrePenalty);
        
        diversified.push(rec);
        usedArtists.add(rec.artist);
        usedGenres.add(rec.genre);
      }
      
      // 다양성 조정 점수로 재정렬
      diversified.sort((a, b) => b.diversity_adjusted_score - a.diversity_adjusted_score);
      return diversified;
    }
    
    return uniqueRecs;
  }

  /**
   * 선호도 DB 업데이트
   */
  async upsertPreference(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${table} (${keys.join(', ')}, updated_at)
      VALUES (${placeholders}, NOW())
      ON CONFLICT (user_id, ${table.includes('artist') ? 'artist' : 'genre'})
      DO UPDATE SET
        score = ${table}.score + EXCLUDED.score,
        updated_at = NOW()
    `;
    
    await this.pool.query(query, values);
  }

  /**
   * 유틸리티 메서드들
   */
  normalizeArtistName(artist) {
    return artist.toLowerCase().replace(/\s+/g, '-');
  }

  findGenreInHierarchy(genre) {
    for (const [parent, info] of Object.entries(this.genreHierarchy)) {
      if (parent === genre) {
        return { parent: null, ...info };
      }
      if (info.subgenres?.includes(genre)) {
        return { parent, ...info };
      }
    }
    return null;
  }

  /**
   * 초기 선호도 설정 (신규 사용자)
   */
  async initializeUserPreferences(userId, sayuType) {
    const prefs = this.sayuInitialPreferences[sayuType];
    if (!prefs) return;
    
    // 초기 작가 선호도
    for (const artist of prefs.artists || []) {
      await this.upsertPreference('user_artist_preferences', {
        user_id: userId,
        artist: artist,
        score: 5, // 초기 점수
        is_initial: true
      });
    }
    
    // 초기 장르 선호도
    for (const genre of prefs.genres || []) {
      await this.upsertPreference('user_genre_preferences', {
        user_id: userId,
        genre: genre,
        score: 5,
        is_initial: true
      });
    }
    
    console.log(`✅ Initialized preferences for ${sayuType} user ${userId}`);
  }

  /**
   * 추천 설명 생성
   */
  generateRecommendationExplanation(artwork, userProfile, recommendationType) {
    const explanations = {
      'artist_based': `${artwork.artist}의 작품으로, 당신이 좋아하는 작가와 유사한 스타일입니다.`,
      'genre_based': `${artwork.genre} 장르의 작품으로, 당신의 취향과 잘 맞습니다.`,
      'collaborative': '당신과 비슷한 취향을 가진 사용자들이 좋아한 작품입니다.',
      'exploratory': '새로운 스타일을 탐험해보세요. 당신의 예술적 지평을 넓혀줄 작품입니다.'
    };
    
    let explanation = explanations[recommendationType] || '당신을 위한 추천 작품입니다.';
    
    // SAYU 타입 기반 추가 설명
    if (userProfile.sayuType && userProfile.sayuPreferences) {
      const sayuMatch = 
        userProfile.sayuPreferences.artists?.includes(artwork.artist) ||
        userProfile.sayuPreferences.genres?.includes(artwork.genre);
      
      if (sayuMatch) {
        explanation += ` ${userProfile.sayuType} 유형에 특히 잘 어울리는 작품입니다.`;
      }
    }
    
    return explanation;
  }
}

module.exports = ArtistPreferenceSystem;