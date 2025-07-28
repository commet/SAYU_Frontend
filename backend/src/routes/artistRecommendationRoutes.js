// 작가 추천 API 라우트
// 중요도 기반 추천 시스템

const express = require('express');
const router = express.Router();
const ImportanceBasedRecommendation = require('../services/importanceBasedRecommendation');
const { authenticateToken } = require('../middleware/auth');

const recommender = new ImportanceBasedRecommendation();

/**
 * @route GET /api/artists/recommend
 * @desc 중요도 기반 작가 추천
 * @query {string} apt - 사용자 APT 유형
 * @query {number} limit - 추천 수 (기본 20)
 * @query {boolean} modern - 현대 작가 포함 (기본 true)
 * @query {boolean} educational - 교육 모드 (기본 false)
 */
router.get('/recommend', authenticateToken, async (req, res) => {
  try {
    const {
      apt,
      limit = 20,
      modern = true,
      educational = false
    } = req.query;

    // 사용자가 이미 본 작가 제외
    const userId = req.user?.id;
    const excludeIds = [];

    if (userId) {
      // 사용자 활동 기록에서 최근 본 작가 가져오기
      // TODO: user_artist_interactions 테이블 구현
    }

    const recommendations = await recommender.recommendArtists({
      userAPT: apt,
      limit: parseInt(limit),
      includeModern: modern === 'true',
      educationalMode: educational === 'true',
      excludeIds
    });

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('추천 오류:', error);
    res.status(500).json({
      success: false,
      error: '작가 추천 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route GET /api/artists/recommend/era/:era
 * @desc 시대별 중요 작가 추천
 */
router.get('/recommend/era/:era', async (req, res) => {
  try {
    const { era } = req.params;
    const { limit = 10 } = req.query;

    const artists = await recommender.recommendByEra(era, parseInt(limit));

    res.json({
      success: true,
      data: {
        era,
        artists,
        count: artists.length
      }
    });

  } catch (error) {
    console.error('시대별 추천 오류:', error);
    res.status(500).json({
      success: false,
      error: '시대별 작가 추천 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route GET /api/artists/educational-path
 * @desc 미술사 학습 경로 추천
 * @query {string} level - beginner, intermediate, advanced
 */
router.get('/educational-path', async (req, res) => {
  try {
    const { level = 'beginner' } = req.query;

    const path = await recommender.getEducationalPath(level);

    res.json({
      success: true,
      data: path
    });

  } catch (error) {
    console.error('학습 경로 오류:', error);
    res.status(500).json({
      success: false,
      error: '학습 경로 생성 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route GET /api/artists/diverse
 * @desc 다양성을 고려한 작가 추천
 */
router.get('/diverse', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const artists = await recommender.getDiverseRecommendations(parseInt(limit));

    res.json({
      success: true,
      data: {
        artists,
        diversity: {
          nationalities: [...new Set(artists.map(a => a.nationality))].length,
          eras: [...new Set(artists.map(a => a.era))].length
        }
      }
    });

  } catch (error) {
    console.error('다양성 추천 오류:', error);
    res.status(500).json({
      success: false,
      error: '다양성 추천 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route GET /api/artists/masters
 * @desc 거장 작가 목록 (티어 1)
 */
router.get('/masters', async (req, res) => {
  try {
    const { pool } = require('../config/database');

    const masters = await pool.query(`
      SELECT 
        id, name, nationality, era, birth_year, death_year,
        importance_score, apt_profile
      FROM artists
      WHERE importance_tier = 1
      ORDER BY importance_score DESC, name
    `);

    res.json({
      success: true,
      data: {
        masters: masters.rows,
        count: masters.rows.length
      }
    });

  } catch (error) {
    console.error('거장 목록 오류:', error);
    res.status(500).json({
      success: false,
      error: '거장 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
