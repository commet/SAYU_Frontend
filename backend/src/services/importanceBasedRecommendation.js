// 중요도 기반 작가 추천 서비스
// 미술사적 중요도와 사용자 성향을 결합한 추천 시스템

const { pool } = require('../config/database');

class ImportanceBasedRecommendation {
  constructor() {
    this.defaultWeights = {
      importance: 0.4,      // 미술사적 중요도
      aptMatch: 0.3,        // APT 성향 매칭
      diversity: 0.2,       // 다양성 (시대, 지역, 스타일)
      popularity: 0.1       // 대중성
    };
  }

  /**
   * 중요도 기반 작가 추천
   * @param {Object} options - 추천 옵션
   * @param {string} options.userAPT - 사용자 APT 유형
   * @param {number} options.limit - 추천 수 (기본 20)
   * @param {boolean} options.includeModern - 현대 작가 포함 여부
   * @param {boolean} options.educationalMode - 교육 모드 (중요 작가 우선)
   * @param {Array} options.excludeIds - 제외할 작가 ID
   */
  async recommendArtists(options = {}) {
    const {
      userAPT = null,
      limit = 20,
      includeModern = true,
      educationalMode = false,
      excludeIds = []
    } = options;

    try {
      // 교육 모드일 경우 중요도 가중치 증가
      const weights = educationalMode
        ? { ...this.defaultWeights, importance: 0.6, aptMatch: 0.2 }
        : this.defaultWeights;

      // 기본 쿼리 구성
      const query = `
        WITH artist_scores AS (
          SELECT 
            a.id,
            a.name,
            a.nationality,
            a.era,
            a.birth_year,
            a.death_year,
            a.bio,
            a.importance_score,
            a.importance_tier,
            a.apt_profile,
            -- 중요도 점수
            a.importance_score * ${weights.importance} as importance_weight,
            -- APT 매칭 점수 (사용자 APT가 있을 경우)
            CASE 
              WHEN $1::text IS NOT NULL AND a.apt_profile IS NOT NULL THEN
                CASE 
                  WHEN a.apt_profile->'primary_types'->0->>'type' = $1 THEN 100
                  WHEN a.apt_profile->'primary_types'->1->>'type' = $1 THEN 80
                  WHEN a.apt_profile->'primary_types'->2->>'type' = $1 THEN 60
                  ELSE 40
                END * ${weights.aptMatch}
              ELSE 0
            END as apt_match_weight,
            -- 다양성 점수 (랜덤 요소)
            RANDOM() * 100 * ${weights.diversity} as diversity_weight,
            -- 대중성 점수 (전시 횟수 등 기반)
            COALESCE(a.popularity_score, 30) * ${weights.popularity} as popularity_weight
          FROM artists a
          WHERE 1=1
            ${excludeIds.length > 0 ? `AND a.id NOT IN (${excludeIds.join(',')})` : ''}
            ${!includeModern ? 'AND (a.birth_year < 1900 OR a.birth_year IS NULL)' : ''}
            AND a.importance_score > 0
        )
        SELECT 
          id,
          name,
          nationality,
          era,
          birth_year,
          death_year,
          CASE 
            WHEN LENGTH(bio) > 200 THEN SUBSTRING(bio, 1, 200) || '...'
            ELSE bio
          END as bio_excerpt,
          importance_score,
          importance_tier,
          apt_profile,
          (importance_weight + apt_match_weight + diversity_weight + popularity_weight) as total_score,
          importance_weight,
          apt_match_weight,
          diversity_weight,
          popularity_weight
        FROM artist_scores
        ORDER BY 
          CASE 
            WHEN importance_tier = 1 THEN 0
            WHEN importance_tier = 2 THEN 1
            WHEN importance_tier = 3 THEN 2
            ELSE 3
          END,
          total_score DESC
        LIMIT $2
      `;

      const result = await pool.query(query, [userAPT, limit]);

      // 결과 포맷팅
      return this.formatRecommendations(result.rows, weights);

    } catch (error) {
      console.error('추천 오류:', error);
      throw error;
    }
  }

  /**
   * 시대별 중요 작가 추천
   */
  async recommendByEra(era, limit = 10) {
    const query = `
      SELECT 
        id, name, nationality, era, birth_year, death_year,
        bio, importance_score, importance_tier, apt_profile
      FROM artists
      WHERE importance_score >= 70
        AND era ILIKE $1
      ORDER BY importance_score DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [`%${era}%`, limit]);
    return result.rows;
  }

  /**
   * 학습 경로 추천 (미술사 교육용)
   */
  async getEducationalPath(level = 'beginner') {
    const levels = {
      beginner: { minTier: 1, maxTier: 1, limit: 10 },
      intermediate: { minTier: 1, maxTier: 2, limit: 20 },
      advanced: { minTier: 1, maxTier: 3, limit: 30 }
    };

    const config = levels[level] || levels.beginner;

    const query = `
      WITH era_representatives AS (
        SELECT DISTINCT ON (era) 
          id, name, era, importance_score, importance_tier,
          birth_year, death_year, nationality
        FROM artists
        WHERE importance_tier BETWEEN $1 AND $2
          AND era IS NOT NULL
        ORDER BY era, importance_score DESC
      )
      SELECT * FROM era_representatives
      ORDER BY 
        CASE 
          WHEN birth_year IS NOT NULL THEN birth_year
          ELSE 1900
        END
      LIMIT $3
    `;

    const result = await pool.query(query, [
      config.minTier,
      config.maxTier,
      config.limit
    ]);

    return {
      level,
      path: result.rows,
      totalArtists: result.rows.length,
      eras: [...new Set(result.rows.map(a => a.era))]
    };
  }

  /**
   * 다양성을 고려한 추천
   */
  async getDiverseRecommendations(limit = 20) {
    const query = `
      WITH diverse_selection AS (
        SELECT DISTINCT ON (nationality, EXTRACT(CENTURY FROM birth_year)) 
          id, name, nationality, era, birth_year, death_year,
          importance_score, importance_tier, apt_profile
        FROM artists
        WHERE importance_score >= 50
          AND nationality IS NOT NULL
        ORDER BY 
          nationality, 
          EXTRACT(CENTURY FROM birth_year),
          importance_score DESC
      )
      SELECT * FROM diverse_selection
      ORDER BY importance_score DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  /**
   * 추천 결과 포맷팅
   */
  formatRecommendations(artists, weights) {
    return {
      recommendations: artists.map((artist, index) => ({
        rank: index + 1,
        artist: {
          id: artist.id,
          name: artist.name,
          nationality: artist.nationality,
          era: artist.era,
          lifespan: artist.birth_year && artist.death_year
            ? `${artist.birth_year}-${artist.death_year}`
            : null,
          bio: artist.bio_excerpt,
          importance: {
            score: artist.importance_score,
            tier: artist.importance_tier,
            tierName: this.getTierName(artist.importance_tier)
          },
          apt: artist.apt_profile?.primary_types?.[0] || null
        },
        scores: {
          total: Math.round(artist.total_score),
          breakdown: {
            importance: Math.round(artist.importance_weight),
            aptMatch: Math.round(artist.apt_match_weight),
            diversity: Math.round(artist.diversity_weight),
            popularity: Math.round(artist.popularity_weight)
          }
        },
        reason: this.generateRecommendationReason(artist)
      })),
      metadata: {
        totalCount: artists.length,
        weights,
        timestamp: new Date().toISOString()
      }
    };
  }

  getTierName(tier) {
    const tierNames = {
      1: '거장 (Master)',
      2: '매우 중요 (Very Important)',
      3: '중요 (Important)',
      4: '일반 (General)',
      5: '기타 (Other)'
    };
    return tierNames[tier] || '미분류';
  }

  generateRecommendationReason(artist) {
    const reasons = [];

    if (artist.importance_tier === 1) {
      reasons.push('미술사의 핵심 인물');
    } else if (artist.importance_tier === 2) {
      reasons.push('미술사적으로 중요한 작가');
    }

    if (artist.apt_match_weight > 20) {
      reasons.push('당신의 성향과 잘 맞음');
    }

    if (artist.era) {
      reasons.push(`${artist.era} 시대 대표 작가`);
    }

    return reasons.join(', ') || '다양한 관점에서 추천';
  }
}

module.exports = ImportanceBasedRecommendation;
