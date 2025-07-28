// 작가 APT 매칭 API 라우터
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { handleError } = require('../utils/errorHandler');

// APT 유형 정보
const APT_TYPES = {
  'LAEF': { animal: '여우', title: '몽환적 방랑자', color: '#FF6B6B' },
  'LAEC': { animal: '고양이', title: '감성 큐레이터', color: '#845EC2' },
  'LAMF': { animal: '올빼미', title: '직관적 탐구자', color: '#4E8397' },
  'LAMC': { animal: '거북이', title: '고독한 철학자', color: '#00C9A7' },
  'LREF': { animal: '카멜레온', title: '고독한 관찰자', color: '#C34A36' },
  'LREC': { animal: '고슴도치', title: '섬세한 감정가', color: '#FF8066' },
  'LRMF': { animal: '문어', title: '침묵의 관찰자', color: '#3C1874' },
  'LRMC': { animal: '비버', title: '학구적 연구자', color: '#845EC2' },
  'SAEF': { animal: '나비', title: '감성 나눔이', color: '#FFD93D' },
  'SAEC': { animal: '펭귄', title: '감성 조율사', color: '#6BCB77' },
  'SAMF': { animal: '앵무새', title: '영감 전도사', color: '#FF6B6B' },
  'SAMC': { animal: '사슴', title: '문화 기획자', color: '#4D8B9F' },
  'SREF': { animal: '강아지', title: '친근한 공감자', color: '#FFD93D' },
  'SREC': { animal: '오리', title: '세심한 조화자', color: '#42C2FF' },
  'SRMF': { animal: '코끼리', title: '지혜로운 안내자', color: '#85C88A' },
  'SRMC': { animal: '독수리', title: '체계적 교육자', color: '#7C73E6' }
};

// 사용자의 APT와 작가 매칭
router.get('/match', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    // 사용자의 APT 프로필 가져오기
    const userResult = await pool.query(
      'SELECT apt_results FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows[0]?.apt_results) {
      return res.status(400).json({ error: 'APT 테스트를 먼저 완료해주세요.' });
    }

    const userAPT = userResult.rows[0].apt_results;
    const userType = userAPT.primaryType;

    // 유사한 APT 유형의 작가 찾기
    const matchingArtists = await pool.query(`
      WITH apt_matches AS (
        SELECT 
          a.*,
          apt_profile->'primary_types'->0->>'type' as primary_type,
          apt_profile->'primary_types'->0->>'weight' as type_weight,
          apt_profile->'dimensions' as dimensions,
          apt_profile->'meta'->>'confidence' as confidence,
          CASE 
            WHEN apt_profile->'primary_types'->0->>'type' = $1 THEN 100
            WHEN SUBSTRING(apt_profile->'primary_types'->0->>'type', 1, 3) = SUBSTRING($1, 1, 3) THEN 70
            WHEN SUBSTRING(apt_profile->'primary_types'->0->>'type', 1, 2) = SUBSTRING($1, 1, 2) THEN 50
            WHEN SUBSTRING(apt_profile->'primary_types'->0->>'type', 1, 1) = SUBSTRING($1, 1, 1) THEN 30
            ELSE 10
          END as match_score
        FROM artists a
        WHERE apt_profile IS NOT NULL
          AND apt_profile->'primary_types' IS NOT NULL
      )
      SELECT 
        id,
        name,
        nationality,
        era,
        image_url,
        primary_type,
        dimensions,
        confidence,
        match_score
      FROM apt_matches
      WHERE confidence::float > 0.7
      ORDER BY match_score DESC, confidence::float DESC
      LIMIT $2 OFFSET $3
    `, [userType, limit, offset]);

    // 결과 포맷팅
    const results = matchingArtists.rows.map(artist => {
      const aptInfo = APT_TYPES[artist.primary_type] || {};
      return {
        id: artist.id,
        name: artist.name,
        nationality: artist.nationality,
        era: artist.era,
        imageUrl: artist.image_url,
        apt: {
          type: artist.primary_type,
          animal: aptInfo.animal,
          title: aptInfo.title,
          color: aptInfo.color,
          dimensions: artist.dimensions,
          matchScore: artist.match_score,
          confidence: parseFloat(artist.confidence)
        }
      };
    });

    res.json({
      userAPT: {
        type: userType,
        ...APT_TYPES[userType]
      },
      matches: results,
      totalCount: matchingArtists.rows.length
    });

  } catch (error) {
    handleError(res, error, '작가 매칭 조회 실패');
  }
});

// 특정 작가의 APT 프로필 조회
router.get('/artist/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;

    const result = await pool.query(`
      SELECT 
        id,
        name,
        nationality,
        era,
        bio,
        image_url,
        apt_profile
      FROM artists
      WHERE id = $1
    `, [artistId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '작가를 찾을 수 없습니다.' });
    }

    const artist = result.rows[0];
    const aptProfile = artist.apt_profile;

    if (!aptProfile) {
      return res.status(404).json({ error: '이 작가의 APT 프로필이 없습니다.' });
    }

    // 주 성향과 부 성향 정보 추출
    const primaryTypes = aptProfile.primary_types || [];
    const formattedTypes = primaryTypes.map(type => ({
      ...type,
      ...APT_TYPES[type.type]
    }));

    res.json({
      artist: {
        id: artist.id,
        name: artist.name,
        nationality: artist.nationality,
        era: artist.era,
        bio: artist.bio,
        imageUrl: artist.image_url
      },
      aptProfile: {
        dimensions: aptProfile.dimensions,
        primaryTypes: formattedTypes,
        periods: aptProfile.periods,
        meta: aptProfile.meta
      }
    });

  } catch (error) {
    handleError(res, error, '작가 APT 프로필 조회 실패');
  }
});

// APT 유형별 작가 통계
router.get('/statistics', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as apt_type,
        COUNT(*) as count,
        AVG((apt_profile->'meta'->>'confidence')::float) as avg_confidence,
        ARRAY_AGG(
          DISTINCT jsonb_build_object(
            'id', id,
            'name', name,
            'imageUrl', image_url
          )
          ORDER BY (apt_profile->'meta'->>'confidence')::float DESC
        ) FILTER (WHERE (apt_profile->'meta'->>'confidence')::float > 0.8) as top_artists
      FROM artists
      WHERE apt_profile IS NOT NULL
        AND apt_profile->'primary_types' IS NOT NULL
      GROUP BY apt_profile->'primary_types'->0->>'type'
      ORDER BY count DESC
    `);

    const formattedStats = stats.rows.map(row => ({
      type: row.apt_type,
      ...APT_TYPES[row.apt_type],
      count: parseInt(row.count),
      avgConfidence: parseFloat(row.avg_confidence),
      topArtists: row.top_artists?.slice(0, 5) || []
    }));

    res.json({
      statistics: formattedStats,
      totalArtists: formattedStats.reduce((sum, stat) => sum + stat.count, 0)
    });

  } catch (error) {
    handleError(res, error, 'APT 통계 조회 실패');
  }
});

// APT 호환성 계산
router.post('/compatibility', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { artistId } = req.body;

    if (!artistId) {
      return res.status(400).json({ error: 'artistId가 필요합니다.' });
    }

    // 사용자와 작가의 APT 정보 가져오기
    const [userResult, artistResult] = await Promise.all([
      pool.query('SELECT apt_results FROM users WHERE id = $1', [userId]),
      pool.query('SELECT apt_profile FROM artists WHERE id = $1', [artistId])
    ]);

    const userAPT = userResult.rows[0]?.apt_results;
    const artistAPT = artistResult.rows[0]?.apt_profile;

    if (!userAPT || !artistAPT) {
      return res.status(400).json({ error: 'APT 정보가 부족합니다.' });
    }

    // 차원별 호환성 계산
    const userDimensions = userAPT.dimensions || {};
    const artistDimensions = artistAPT.dimensions || {};

    const compatibility = {
      overall: 0,
      dimensions: {}
    };

    // 각 차원의 차이 계산
    ['L_S', 'A_R', 'E_M', 'F_C'].forEach(dimension => {
      const [first, second] = dimension.split('_');
      const userScore = (userDimensions[first] || 50) - (userDimensions[second] || 50);
      const artistScore = (artistDimensions[first] || 50) - (artistDimensions[second] || 50);

      // 차이가 작을수록 호환성이 높음 (최대 100점)
      const diff = Math.abs(userScore - artistScore);
      const score = Math.max(0, 100 - diff);

      compatibility.dimensions[dimension] = {
        userScore,
        artistScore,
        compatibility: score,
        interpretation: getCompatibilityInterpretation(dimension, score)
      };

      compatibility.overall += score;
    });

    compatibility.overall = Math.round(compatibility.overall / 4);

    res.json({
      compatibility,
      recommendation: getRecommendationMessage(compatibility.overall)
    });

  } catch (error) {
    handleError(res, error, '호환성 계산 실패');
  }
});

// 호환성 해석 메시지
function getCompatibilityInterpretation(dimension, score) {
  const interpretations = {
    'L_S': {
      high: '작품 감상 스타일이 매우 유사합니다',
      medium: '서로 다른 관점을 공유할 수 있습니다',
      low: '새로운 감상 방식을 발견할 기회입니다'
    },
    'A_R': {
      high: '예술적 취향이 잘 맞습니다',
      medium: '다양한 표현 방식을 경험할 수 있습니다',
      low: '예술적 시야를 넓힐 수 있는 기회입니다'
    },
    'E_M': {
      high: '감정적 공감대가 높습니다',
      medium: '균형잡힌 감상이 가능합니다',
      low: '새로운 해석의 깊이를 발견할 수 있습니다'
    },
    'F_C': {
      high: '창작 과정에 대한 이해가 비슷합니다',
      medium: '다양한 기법을 이해할 수 있습니다',
      low: '예술적 접근법을 확장할 기회입니다'
    }
  };

  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  return interpretations[dimension][level];
}

// 추천 메시지
function getRecommendationMessage(overall) {
  if (overall >= 80) {
    return '매우 높은 호환성! 이 작가의 작품이 당신의 마음에 깊이 울릴 것입니다.';
  } else if (overall >= 60) {
    return '좋은 호환성! 공감하면서도 새로운 발견이 있을 것입니다.';
  } else if (overall >= 40) {
    return '흥미로운 대조! 당신의 예술적 시야를 넓혀줄 작가입니다.';
  } else {
    return '도전적인 만남! 완전히 새로운 예술 세계를 경험하게 될 것입니다.';
  }
}

module.exports = router;
