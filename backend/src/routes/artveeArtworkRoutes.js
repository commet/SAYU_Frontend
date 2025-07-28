/**
 * Artvee 작품 API 라우트
 * Cloudinary에 저장된 Artvee 이미지와 Artists DB 연결된 데이터 제공
 */

const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// 특정 작가의 Artvee 작품 가져오기
router.get('/artists/:artistId/artworks', async (req, res) => {
  try {
    const { artistId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT 
        aa.id,
        aa.title,
        aa.url as artvee_url,
        aa.thumbnail_url,
        aa.full_image_url,
        aa.sayu_type,
        aa.personality_tags,
        aa.emotion_tags,
        a.name as artist_name,
        a.name_ko as artist_name_ko,
        aam.confidence_score,
        aam.mapping_method
      FROM artvee_artworks aa
      INNER JOIN artvee_artwork_artists aaa ON aa.id = aaa.artwork_id
      INNER JOIN artists a ON aaa.artist_id = a.id
      INNER JOIN artvee_artist_mappings aam ON a.id = aam.artist_id
      WHERE a.id = $1
      ORDER BY aa.created_at DESC
      LIMIT $2 OFFSET $3
    `, [artistId, limit, offset]);

    res.json({
      success: true,
      data: {
        artworks: result.rows,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: result.rowCount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching artist artworks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch artist artworks'
    });
  }
});

// 성격 유형별 Artvee 작품 추천
router.get('/recommendations/personality/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 20, includeArtist = true } = req.query;

    const result = await pool.query(`
      SELECT 
        aa.id,
        aa.title,
        aa.url as artvee_url,
        aa.thumbnail_url,
        aa.full_image_url,
        aa.sayu_type,
        aa.personality_tags,
        aa.emotion_tags,
        ${includeArtist === 'true' ? `
        a.name as artist_name,
        a.name_ko as artist_name_ko,
        aam.confidence_score,
        ` : ''}
        CASE 
          WHEN $1 = ANY(aa.personality_tags) THEN 1.0
          ELSE 0.5
        END as relevance_score
      FROM artvee_artworks aa
      ${includeArtist === 'true' ? `
      LEFT JOIN artvee_artwork_artists aaa ON aa.id = aaa.artwork_id
      LEFT JOIN artists a ON aaa.artist_id = a.id
      LEFT JOIN artvee_artist_mappings aam ON a.id = aam.artist_id
      ` : ''}
      WHERE $1 = ANY(aa.personality_tags) 
         OR aa.sayu_type = $1
      ORDER BY relevance_score DESC, RANDOM()
      LIMIT $2
    `, [type, limit]);

    res.json({
      success: true,
      data: {
        personality_type: type,
        artworks: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Error fetching personality recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personality recommendations'
    });
  }
});

// 랜덤 Artvee 작품 (매칭된 작가 정보 포함)
router.get('/random', async (req, res) => {
  try {
    const { count = 1, matchedOnly = false } = req.query;

    const whereClause = matchedOnly === 'true'
      ? 'WHERE aaa.artist_id IS NOT NULL'
      : '';

    const result = await pool.query(`
      SELECT 
        aa.id,
        aa.title,
        aa.url as artvee_url,
        aa.thumbnail_url,
        aa.full_image_url,
        aa.sayu_type,
        aa.personality_tags,
        aa.emotion_tags,
        a.name as artist_name,
        a.name_ko as artist_name_ko,
        aam.confidence_score,
        aam.mapping_method
      FROM artvee_artworks aa
      LEFT JOIN artvee_artwork_artists aaa ON aa.id = aaa.artwork_id
      LEFT JOIN artists a ON aaa.artist_id = a.id
      LEFT JOIN artvee_artist_mappings aam ON a.id = aam.artist_id
      ${whereClause}
      ORDER BY RANDOM()
      LIMIT $1
    `, [count]);

    res.json({
      success: true,
      data: {
        artworks: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Error fetching random artworks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random artworks'
    });
  }
});

// 작가 검색 (Artvee 작품 보유 작가만)
router.get('/artists/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const result = await pool.query(`
      SELECT 
        a.id,
        a.name,
        a.name_ko,
        a.nationality,
        a.birth_year,
        a.death_year,
        COUNT(aaa.artwork_id) as artvee_artwork_count,
        aam.confidence_score,
        aam.mapping_method
      FROM artists a
      INNER JOIN artvee_artist_mappings aam ON a.id = aam.artist_id
      INNER JOIN artvee_artwork_artists aaa ON a.id = aaa.artist_id
      WHERE (
        LOWER(a.name) LIKE LOWER($1) 
        OR LOWER(a.name_ko) LIKE LOWER($1)
      )
      AND aam.artist_id IS NOT NULL
      GROUP BY a.id, a.name, a.name_ko, a.nationality, a.birth_year, a.death_year, aam.confidence_score, aam.mapping_method
      ORDER BY artvee_artwork_count DESC, aam.confidence_score DESC
      LIMIT $2
    `, [`%${q}%`, limit]);

    res.json({
      success: true,
      data: {
        artists: result.rows,
        query: q,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Error searching artists:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search artists'
    });
  }
});

// 매칭 통계
router.get('/stats', async (req, res) => {
  try {
    const [
      totalStats,
      matchingStats,
      topArtists
    ] = await Promise.all([
      // 전체 통계
      pool.query(`
        SELECT 
          COUNT(*) as total_artworks,
          COUNT(DISTINCT aa.artist) as total_artists,
          COUNT(DISTINCT aaa.artist_id) as matched_artists,
          COUNT(CASE WHEN aaa.artist_id IS NOT NULL THEN 1 END) as matched_artworks
        FROM artvee_artworks aa
        LEFT JOIN artvee_artwork_artists aaa ON aa.id = aaa.artwork_id
      `),

      // 매칭 방법별 통계
      pool.query(`
        SELECT 
          mapping_method,
          COUNT(*) as count,
          ROUND(AVG(confidence_score)::numeric, 2) as avg_confidence
        FROM artvee_artist_mappings
        WHERE artist_id IS NOT NULL
        GROUP BY mapping_method
        ORDER BY count DESC
      `),

      // 상위 작가들
      pool.query(`
        SELECT 
          a.name,
          a.name_ko,
          COUNT(aaa.artwork_id) as artwork_count
        FROM artists a
        INNER JOIN artvee_artwork_artists aaa ON a.id = aaa.artist_id
        GROUP BY a.id, a.name, a.name_ko
        ORDER BY artwork_count DESC
        LIMIT 10
      `)
    ]);

    res.json({
      success: true,
      data: {
        overview: totalStats.rows[0],
        matching_methods: matchingStats.rows,
        top_artists: topArtists.rows
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// 특정 작품 상세 정보
router.get('/artworks/:artworkId', async (req, res) => {
  try {
    const { artworkId } = req.params;

    const result = await pool.query(`
      SELECT 
        aa.id,
        aa.artvee_id,
        aa.title,
        aa.artist as original_artist_name,
        aa.url as artvee_url,
        aa.thumbnail_url,
        aa.full_image_url,
        aa.sayu_type,
        aa.personality_tags,
        aa.emotion_tags,
        aa.usage_tags,
        aa.created_at,
        a.id as artist_id,
        a.name as artist_name,
        a.name_ko as artist_name_ko,
        a.nationality,
        a.birth_year,
        a.death_year,
        a.bio,
        aam.confidence_score,
        aam.mapping_method,
        aam.verified
      FROM artvee_artworks aa
      LEFT JOIN artvee_artwork_artists aaa ON aa.id = aaa.artwork_id
      LEFT JOIN artists a ON aaa.artist_id = a.id
      LEFT JOIN artvee_artist_mappings aam ON a.id = aam.artist_id
      WHERE aa.id = $1
    `, [artworkId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Artwork not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching artwork:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch artwork'
    });
  }
});

module.exports = router;
