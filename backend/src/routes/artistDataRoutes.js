const express = require('express');
const router = express.Router();
const artistDataController = require('../controllers/artistDataController');
const { authenticateToken } = require('../middleware/auth');

/**
 * 아티스트 데이터 수집 및 관리 API 라우트
 * 
 * Base URL: /api/artist-data
 */

// ==================== 데이터 수집 엔드포인트 ====================

/**
 * POST /collect-single
 * 단일 아티스트 정보 수집
 * 
 * Body:
 * {
 *   "artistName": "Pablo Picasso",
 *   "method": "enhanced|python|hybrid",
 *   "forceUpdate": false
 * }
 */
router.post('/collect-single', authenticateToken, artistDataController.collectSingleArtist);

/**
 * POST /collect-batch
 * 배치 아티스트 정보 수집
 * 
 * Body:
 * {
 *   "artistNames": ["Artist 1", "Artist 2", ...],
 *   "method": "enhanced|python|hybrid",
 *   "batchSize": 10,
 *   "delay": 2000,
 *   "forceUpdate": false
 * }
 */
router.post('/collect-batch', authenticateToken, artistDataController.collectArtistsBatch);

// ==================== 조회 및 검색 엔드포인트 ====================

/**
 * GET /search
 * 아티스트 검색
 * 
 * Query params:
 * - query: 검색어 (필수)
 * - nationality: 국적 필터 (선택)
 * - era: 시대 필터 (선택)
 * - limit: 결과 개수 (기본: 20)
 * - offset: 오프셋 (기본: 0)
 * - sortBy: 정렬 방식 (relevance|popularity|alphabetical|chronological)
 */
router.get('/search', artistDataController.searchArtists);

/**
 * GET /stats
 * 수집 통계 조회
 * 
 * Query params:
 * - period: 통계 기간 (기본: 30일)
 */
router.get('/stats', artistDataController.getCollectionStats);

/**
 * GET /quality-report
 * 데이터 품질 리포트
 */
router.get('/quality-report', artistDataController.getDataQualityReport);

/**
 * GET /setup-guide
 * Python 환경 설정 가이드
 */
router.get('/setup-guide', artistDataController.getSetupGuide);

// ==================== 관리자 전용 엔드포인트 ====================

/**
 * POST /admin/rebuild-index
 * 검색 인덱스 재구성 (관리자만)
 */
router.post('/admin/rebuild-index', authenticateToken, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // 검색 인덱스 재구성
    const { pool } = require('../config/database');
    
    await pool.query(`
      REINDEX INDEX idx_artists_search;
      REINDEX INDEX idx_artists_name;
      VACUUM ANALYZE artists;
    `);

    res.json({
      success: true,
      message: 'Search index rebuilt successfully'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to rebuild index',
      message: error.message
    });
  }
});

/**
 * POST /admin/cleanup-duplicates
 * 중복 아티스트 정리 (관리자만)
 */
router.post('/admin/cleanup-duplicates', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { pool } = require('../config/database');
    const { logger } = require('../config/logger');

    // 중복 아티스트 찾기 및 병합
    const duplicatesQuery = `
      SELECT name, COUNT(*) as count
      FROM artists
      GROUP BY LOWER(name)
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    const duplicates = await pool.query(duplicatesQuery);
    let mergedCount = 0;

    for (const duplicate of duplicates.rows) {
      // 같은 이름의 아티스트들 조회
      const artistsQuery = `
        SELECT * FROM artists
        WHERE LOWER(name) = LOWER($1)
        ORDER BY created_at ASC
      `;
      
      const artists = await pool.query(artistsQuery, [duplicate.name]);
      
      if (artists.rows.length > 1) {
        // 첫 번째(가장 오래된) 아티스트를 기본으로 하고 나머지 병합
        const primary = artists.rows[0];
        const toMerge = artists.rows.slice(1);

        for (const artist of toMerge) {
          // 더 완성도 높은 데이터로 업데이트
          await pool.query(`
            UPDATE artists SET
              bio = CASE WHEN $2 IS NOT NULL AND length($2) > length(COALESCE(bio, '')) THEN $2 ELSE bio END,
              birth_year = COALESCE(birth_year, $3),
              death_year = COALESCE(death_year, $4),
              nationality = COALESCE(nationality, $5),
              images = CASE WHEN $6 != '{}' THEN $6 ELSE images END,
              sources = $7,
              follow_count = follow_count + $8,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `, [
            primary.id,
            artist.bio,
            artist.birth_year,
            artist.death_year,
            artist.nationality,
            artist.images,
            JSON.stringify({
              ...JSON.parse(primary.sources || '{}'),
              ...JSON.parse(artist.sources || '{}')
            }),
            artist.follow_count || 0
          ]);

          // 중복 아티스트 삭제
          await pool.query('DELETE FROM artists WHERE id = $1', [artist.id]);
          mergedCount++;
        }
      }
    }

    logger.info(`중복 아티스트 정리 완료: ${mergedCount}개 병합`);

    res.json({
      success: true,
      duplicatesFound: duplicates.rows.length,
      artistsMerged: mergedCount,
      message: 'Duplicate cleanup completed'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to cleanup duplicates',
      message: error.message
    });
  }
});

/**
 * GET /admin/collection-logs
 * 수집 로그 조회 (관리자만)
 */
router.get('/admin/collection-logs', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { limit = 50, offset = 0 } = req.query;
    const { pool } = require('../config/database');

    const logsQuery = `
      SELECT *
      FROM artist_collection_logs
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const logs = await pool.query(logsQuery, [limit, offset]);

    res.json({
      logs: logs.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch collection logs',
      message: error.message
    });
  }
});

module.exports = router;