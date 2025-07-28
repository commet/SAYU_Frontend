const { pool } = require('../config/database');
const { log } = require('../config/logger');

class DatabaseRecommendationService {
  constructor() {
    this.personalityWeights = {
      // L-A-E-F: 감성적이고 자유로운 예술 애호가
      LAEF: {
        tags: ['impressionism', 'landscape', 'nature', 'abstract', 'dreamy'],
        styles: ['impressionism', 'abstract expressionism'],
        excludeStrictRealism: true,
        preferNature: true
      },
      // L-A-E-C: 감성적이고 체계적인 예술 애호가
      LAEC: {
        tags: ['geometric', 'composition', 'color theory', 'abstract', 'symbolic'],
        styles: ['abstract', 'constructivism', 'bauhaus'],
        preferStructured: true
      },
      // L-R-E-F: 감정적 순수주의자
      LREF: {
        tags: ['portrait', 'realism', 'emotional', 'intimate', 'classical'],
        styles: ['realism', 'classical', 'renaissance'],
        preferRealistic: true,
        preferIntimate: true
      },
      // L-R-E-C: 체계적 감정가
      LREC: {
        tags: ['technical', 'masterpiece', 'study', 'anatomy', 'classical'],
        styles: ['classical', 'academic', 'realism'],
        preferTechnical: true,
        preferMasterworks: true
      },
      // S-A-E-F: 사회적 몽상가
      SAEF: {
        tags: ['social', 'people', 'community', 'vibrant', 'impressionism'],
        styles: ['impressionism', 'post-impressionism', 'pointillism'],
        preferSocial: true,
        preferVibrant: true
      },
      // S-R-E-F: 진정한 연결자
      SREF: {
        tags: ['group', 'portrait', 'realistic', 'human', 'emotion'],
        styles: ['realism', 'baroque', 'dutch golden age'],
        preferGroupPortraits: true,
        preferRealistic: true
      },
      // S-R-M-C: 체계적 강연자
      SRMC: {
        tags: ['historical', 'political', 'symbolic', 'monumental', 'cubism'],
        styles: ['cubism', 'social realism', 'modern'],
        preferHistorical: true,
        preferSymbolic: true
      }
    };
  }

  // 성격 유형에 따른 작품 추천
  async getPersonalizedRecommendations(personalityType, limit = 10) {
    try {
      const weights = this.personalityWeights[personalityType];
      if (!weights) {
        // 기본 추천 로직
        return await this.getDefaultRecommendations(limit);
      }

      let query = `
        SELECT 
          a.id, a.title, a.description, a.creation_date, a.medium,
          a.style, a.classification, a.image_url, a.thumbnail_url,
          a.cloudinary_url, a.source, a.source_url,
          i.name as institution_name,
          ARRAY_AGG(DISTINCT ar.name) as artists,
          COALESCE(a.view_count, 0) as view_count,
          COALESCE(a.like_count, 0) as like_count
        FROM artworks a
        LEFT JOIN institutions i ON a.institution_id = i.id
        LEFT JOIN artwork_artists aa ON a.id = aa.artwork_id
        LEFT JOIN artists ar ON aa.artist_id = ar.id
        WHERE a.image_url IS NOT NULL
      `;

      const queryParams = [];
      let paramIndex = 1;

      // 스타일 필터링
      if (weights.styles && weights.styles.length > 0) {
        const styleConditions = weights.styles.map(() => `a.style ILIKE $${paramIndex++}`);
        query += ` AND (${styleConditions.join(' OR ')})`;
        weights.styles.forEach(style => queryParams.push(`%${style}%`));
      }

      // 매체 필터링 (선호도에 따라)
      if (weights.preferRealistic) {
        query += ` AND (a.medium ILIKE '%oil%' OR a.medium ILIKE '%canvas%' OR a.medium ILIKE '%painting%')`;
      }

      // 분류 필터링
      if (weights.preferPortraits) {
        query += ` AND a.classification ILIKE '%portrait%'`;
      }

      query += `
        GROUP BY a.id, i.name
        ORDER BY 
          CASE 
            WHEN a.view_count > 0 THEN a.view_count 
            ELSE RANDOM() * 100 
          END DESC,
          a.created_at DESC
        LIMIT $${paramIndex}
      `;
      queryParams.push(limit);

      const result = await pool.query(query, queryParams);

      // 결과를 성격 유형에 맞게 스코어링하고 재정렬
      const scoredRecommendations = this.scoreAndRankArtworks(result.rows, weights);

      return {
        success: true,
        personalityType,
        totalCount: scoredRecommendations.length,
        recommendations: scoredRecommendations,
        recommendationReason: this.getRecommendationReason(personalityType)
      };

    } catch (error) {
      log.error('Database recommendation error:', error);
      throw error;
    }
  }

  // 작품 스코어링 및 순위 매기기
  scoreAndRankArtworks(artworks, weights) {
    return artworks.map(artwork => {
      let score = 0;
      const factors = [];

      // 기본 점수 (조회수, 좋아요)
      score += Math.log(artwork.view_count + 1) * 0.1;
      score += Math.log(artwork.like_count + 1) * 0.2;

      // 스타일 매칭
      if (weights.styles) {
        const styleMatch = weights.styles.some(style =>
          artwork.style && artwork.style.toLowerCase().includes(style.toLowerCase())
        );
        if (styleMatch) {
          score += 2.0;
          factors.push('Style match');
        }
      }

      // 키워드 매칭 (제목, 설명)
      if (weights.tags) {
        weights.tags.forEach(tag => {
          const titleMatch = artwork.title && artwork.title.toLowerCase().includes(tag.toLowerCase());
          const descMatch = artwork.description && artwork.description.toLowerCase().includes(tag.toLowerCase());
          const mediumMatch = artwork.medium && artwork.medium.toLowerCase().includes(tag.toLowerCase());

          if (titleMatch) {
            score += 1.5;
            factors.push(`Title: ${tag}`);
          }
          if (descMatch) {
            score += 1.0;
            factors.push(`Description: ${tag}`);
          }
          if (mediumMatch) {
            score += 0.5;
            factors.push(`Medium: ${tag}`);
          }
        });
      }

      // 특별 선호도
      if (weights.preferNature && artwork.title) {
        const natureWords = ['water', 'garden', 'landscape', 'flower', 'tree', 'nature', 'lily'];
        const hasNature = natureWords.some(word =>
          artwork.title.toLowerCase().includes(word)
        );
        if (hasNature) {
          score += 1.5;
          factors.push('Nature theme');
        }
      }

      if (weights.preferIntimate) {
        const intimateWords = ['portrait', 'girl', 'woman', 'man', 'face', 'eyes'];
        const hasIntimate = intimateWords.some(word =>
          artwork.title.toLowerCase().includes(word)
        );
        if (hasIntimate) {
          score += 1.0;
          factors.push('Intimate subject');
        }
      }

      if (weights.preferSocial) {
        const socialWords = ['group', 'people', 'crowd', 'gathering', 'dance', 'party'];
        const hasSocial = socialWords.some(word =>
          artwork.title && artwork.title.toLowerCase().includes(word)
        );
        if (hasSocial) {
          score += 1.5;
          factors.push('Social theme');
        }
      }

      // 작가 명성 (간단한 구현)
      if (artwork.artists && artwork.artists.length > 0) {
        const famousArtists = ['monet', 'picasso', 'van gogh', 'rembrandt', 'da vinci', 'michelangelo'];
        const hasFamousArtist = artwork.artists.some(artist =>
          famousArtists.some(famous =>
            artist && artist.toLowerCase().includes(famous)
          )
        );
        if (hasFamousArtist) {
          score += 1.0;
          factors.push('Renowned artist');
        }
      }

      return {
        ...artwork,
        recommendationScore: parseFloat(score.toFixed(2)),
        matchingFactors: factors,
        artists: artwork.artists.filter(artist => artist !== null)
      };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  // 기본 추천 (성격 유형이 없거나 매칭되지 않을 때)
  async getDefaultRecommendations(limit = 10) {
    try {
      const query = `
        SELECT 
          a.id, a.title, a.description, a.creation_date, a.medium,
          a.style, a.classification, a.image_url, a.thumbnail_url,
          a.cloudinary_url, a.source, a.source_url,
          i.name as institution_name,
          ARRAY_AGG(DISTINCT ar.name) as artists,
          COALESCE(a.view_count, 0) as view_count,
          COALESCE(a.like_count, 0) as like_count
        FROM artworks a
        LEFT JOIN institutions i ON a.institution_id = i.id
        LEFT JOIN artwork_artists aa ON a.id = aa.artwork_id
        LEFT JOIN artists ar ON aa.artist_id = ar.id
        WHERE a.image_url IS NOT NULL
        GROUP BY a.id, i.name
        ORDER BY 
          (a.view_count + a.like_count) DESC,
          a.created_at DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);

      return {
        success: true,
        personalityType: 'default',
        totalCount: result.rows.length,
        recommendations: result.rows.map(artwork => ({
          ...artwork,
          recommendationScore: 1.0,
          matchingFactors: ['Popular artwork'],
          artists: artwork.artists.filter(artist => artist !== null)
        })),
        recommendationReason: 'Popular and highly-rated artworks from our collection'
      };

    } catch (error) {
      log.error('Default recommendation error:', error);
      throw error;
    }
  }

  // 성격 유형별 추천 이유 설명
  getRecommendationReason(personalityType) {
    const reasons = {
      LAEF: '당신의 감성적이고 자유로운 성향에 맞는 꿈같은 인상주의와 자연 작품들을 추천합니다.',
      LAEC: '당신의 체계적이면서도 감성적인 특성에 어울리는 구조적인 추상 작품들을 선별했습니다.',
      LREF: '당신의 감정적 순수성을 추구하는 성향에 맞는 사실적이고 친밀한 작품들입니다.',
      LREC: '당신의 체계적이고 감정적인 접근에 어울리는 기술적으로 뛰어난 고전 작품들을 추천합니다.',
      SAEF: '당신의 사회적이고 꿈같은 성향에 맞는 활기찬 사회적 장면들을 담은 작품들입니다.',
      SREF: '당신의 진정한 연결을 중시하는 성향에 어울리는 인간관계를 다룬 사실적 작품들입니다.',
      SRMC: '당신의 체계적 강연 스타일에 맞는 역사적, 상징적 의미가 깊은 작품들을 선별했습니다.'
    };

    return reasons[personalityType] || '당신의 취향을 고려한 다양한 작품들을 추천합니다.';
  }

  // 성격 유형별 유사 작품 추천
  async getSimilarArtworks(artworkId, personalityType, limit = 5) {
    try {
      // 기준 작품 정보 가져오기
      const baseArtworkQuery = `
        SELECT a.*, i.name as institution_name
        FROM artworks a
        LEFT JOIN institutions i ON a.institution_id = i.id
        WHERE a.id = $1
      `;

      const baseResult = await pool.query(baseArtworkQuery, [artworkId]);
      if (baseResult.rows.length === 0) {
        throw new Error('Base artwork not found');
      }

      const baseArtwork = baseResult.rows[0];
      const weights = this.personalityWeights[personalityType];

      let query = `
        SELECT 
          a.id, a.title, a.description, a.creation_date, a.medium,
          a.style, a.classification, a.image_url, a.thumbnail_url,
          a.cloudinary_url, a.source, a.source_url,
          i.name as institution_name,
          ARRAY_AGG(DISTINCT ar.name) as artists
        FROM artworks a
        LEFT JOIN institutions i ON a.institution_id = i.id
        LEFT JOIN artwork_artists aa ON a.id = aa.artwork_id
        LEFT JOIN artists ar ON aa.artist_id = ar.id
        WHERE a.id != $1 
        AND a.image_url IS NOT NULL
      `;

      const queryParams = [artworkId];
      let paramIndex = 2;

      // 같은 스타일 선호
      if (baseArtwork.style) {
        query += ` AND a.style ILIKE $${paramIndex}`;
        queryParams.push(`%${baseArtwork.style}%`);
        paramIndex++;
      }

      query += `
        GROUP BY a.id, i.name
        ORDER BY RANDOM()
        LIMIT $${paramIndex}
      `;
      queryParams.push(limit * 2); // 더 많이 가져와서 스코어링 후 선별

      const result = await pool.query(query, queryParams);

      let similarArtworks = result.rows;

      // 성격 유형에 따른 스코어링 적용
      if (weights) {
        similarArtworks = this.scoreAndRankArtworks(similarArtworks, weights).slice(0, limit);
      } else {
        similarArtworks = similarArtworks.slice(0, limit);
      }

      return {
        success: true,
        baseArtwork: {
          id: baseArtwork.id,
          title: baseArtwork.title,
          artist: baseArtwork.artist
        },
        similarArtworks,
        personalityType
      };

    } catch (error) {
      log.error('Similar artworks recommendation error:', error);
      throw error;
    }
  }

  // 통계 정보 제공
  async getRecommendationStats() {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_artworks,
          COUNT(DISTINCT a.style) as unique_styles,
          COUNT(DISTINCT i.name) as unique_institutions,
          COUNT(DISTINCT ar.name) as unique_artists
        FROM artworks a
        LEFT JOIN institutions i ON a.institution_id = i.id
        LEFT JOIN artwork_artists aa ON a.id = aa.artwork_id
        LEFT JOIN artists ar ON aa.artist_id = ar.id
        WHERE a.image_url IS NOT NULL
      `;

      const result = await pool.query(statsQuery);

      return {
        success: true,
        stats: result.rows[0]
      };

    } catch (error) {
      log.error('Recommendation stats error:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseRecommendationService();
