const { pool } = require('../config/database');
const { body, validationResult } = require('express-validator');
const { log } = require('../config/logger');

// 메모리 캐시 설정
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

function getCacheKey(req) {
  const params = new URLSearchParams(req.query);
  return `exhibitions:${params.toString()}`;
}

function getFromCache(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // 캐시 정리 (10분마다)
  if (cache.size > 100) {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_DURATION * 2) {
        cache.delete(key);
      }
    }
  }
}

const exhibitionController = {
  // Get exhibitions with filters
  async getExhibitions(req, res) {
    try {
      // 캐시 확인
      const cacheKey = getCacheKey(req);
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const { 
        page = 1, 
        limit = 20, 
        status,
        city,
        institution_id,
        search,
        sort = 'start_date',
        order = 'desc'
      } = req.query;

      // 페이지네이션 설정
      const offset = (page - 1) * limit;

      // 기본 쿼리
      let query = `
        SELECT 
          e.*,
          i.id as institution_id,
          i.name_en as institution_name_en,
          i.name_local as institution_name_local,
          i.city as institution_city,
          i.country as institution_country,
          i.type as institution_type,
          i.website as institution_website
        FROM exhibitions e
        INNER JOIN institutions i ON e.institution_id = i.id
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;

      // 필터링
      if (status) {
        query += ` AND e.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (city) {
        query += ` AND i.city = $${paramIndex}`;
        params.push(city);
        paramIndex++;
      }

      if (institution_id) {
        query += ` AND e.institution_id = $${paramIndex}`;
        params.push(institution_id);
        paramIndex++;
      }

      if (search) {
        query += ` AND (
          e.title_en ILIKE $${paramIndex} OR 
          e.title_local ILIKE $${paramIndex} OR 
          e.description ILIKE $${paramIndex} OR
          i.name_en ILIKE $${paramIndex} OR
          i.name_local ILIKE $${paramIndex}
        )`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      // 전체 개수 구하기
      const countQuery = `SELECT COUNT(*) as total FROM (${query}) as count_query`;
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // 정렬 및 페이지네이션
      const orderDirection = order === 'asc' ? 'ASC' : 'DESC';
      query += ` ORDER BY e.${sort} ${orderDirection}`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      // 통계 데이터
      const statsQuery = `
        SELECT status, COUNT(*) as count 
        FROM exhibitions 
        GROUP BY status
      `;
      const statsResult = await pool.query(statsQuery);
      const stats = {};
      statsResult.rows.forEach(row => {
        stats[row.status] = parseInt(row.count);
      });

      // 데이터 포맷팅
      const exhibitions = result.rows.map(row => ({
        id: row.id,
        title_en: row.title_en,
        title_local: row.title_local,
        subtitle: row.subtitle,
        start_date: row.start_date,
        end_date: row.end_date,
        status: row.status,
        description: row.description,
        curator: row.curator,
        artists: row.artists,
        artworks_count: row.artworks_count,
        ticket_price: row.ticket_price,
        official_url: row.official_url,
        press_release_url: row.press_release_url,
        virtual_tour_url: row.virtual_tour_url,
        exhibition_type: row.exhibition_type,
        genres: row.genres,
        tags: row.tags,
        view_count: row.view_count,
        created_at: row.created_at,
        updated_at: row.updated_at,
        institution: {
          id: row.institution_id,
          name_en: row.institution_name_en,
          name_local: row.institution_name_local,
          city: row.institution_city,
          country: row.institution_country,
          type: row.institution_type,
          website: row.institution_website
        }
      }));

      const response = {
        success: true,
        exhibitions: exhibitions,
        data: exhibitions, // for compatibility
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        },
        stats
      };

      // 캐시에 저장
      setCache(cacheKey, response);
      
      res.json(response);

    } catch (error) {
      log.error('Error fetching exhibitions:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch exhibitions',
        error: error.message 
      });
    }
  },

  // Get single exhibition
  async getExhibition(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          e.*,
          i.id as institution_id,
          i.name_en as institution_name_en,
          i.name_local as institution_name_local,
          i.city as institution_city,
          i.country as institution_country,
          i.type as institution_type,
          i.website as institution_website
        FROM exhibitions e
        INNER JOIN institutions i ON e.institution_id = i.id
        WHERE e.id = $1
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Exhibition not found'
        });
      }

      // View count 증가
      await pool.query(
        'UPDATE exhibitions SET view_count = view_count + 1 WHERE id = $1',
        [id]
      );

      const row = result.rows[0];
      const exhibition = {
        id: row.id,
        title_en: row.title_en,
        title_local: row.title_local,
        subtitle: row.subtitle,
        start_date: row.start_date,
        end_date: row.end_date,
        status: row.status,
        description: row.description,
        curator: row.curator,
        artists: row.artists,
        artworks_count: row.artworks_count,
        ticket_price: row.ticket_price,
        official_url: row.official_url,
        press_release_url: row.press_release_url,
        virtual_tour_url: row.virtual_tour_url,
        exhibition_type: row.exhibition_type,
        genres: row.genres,
        tags: row.tags,
        view_count: row.view_count + 1,
        created_at: row.created_at,
        updated_at: row.updated_at,
        institution: {
          id: row.institution_id,
          name_en: row.institution_name_en,
          name_local: row.institution_name_local,
          city: row.institution_city,
          country: row.institution_country,
          type: row.institution_type,
          website: row.institution_website
        }
      };

      res.json({
        success: true,
        exhibition
      });

    } catch (error) {
      log.error('Error fetching exhibition:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch exhibition'
      });
    }
  },

  // Get city stats
  async getCityStats(req, res) {
    try {
      const query = `
        SELECT 
          i.city,
          i.country,
          COUNT(e.id) as exhibition_count,
          COUNT(CASE WHEN e.status = 'current' THEN 1 END) as current_count,
          COUNT(CASE WHEN e.status = 'upcoming' THEN 1 END) as upcoming_count
        FROM institutions i
        LEFT JOIN exhibitions e ON i.id = e.institution_id
        GROUP BY i.city, i.country
        ORDER BY exhibition_count DESC
      `;

      const result = await pool.query(query);

      res.json({
        success: true,
        cities: result.rows
      });

    } catch (error) {
      log.error('Error fetching city stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch city statistics'
      });
    }
  },

  // Get popular exhibitions
  async getPopularExhibitions(req, res) {
    try {
      const { limit = 10 } = req.query;

      const query = `
        SELECT 
          e.*,
          i.name_en as institution_name,
          i.city as institution_city
        FROM exhibitions e
        INNER JOIN institutions i ON e.institution_id = i.id
        WHERE e.status IN ('current', 'upcoming')
        ORDER BY e.view_count DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);

      res.json({
        success: true,
        exhibitions: result.rows
      });

    } catch (error) {
      log.error('Error fetching popular exhibitions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch popular exhibitions'
      });
    }
  },

  // Get venues (institutions)
  async getVenues(req, res) {
    try {
      const { city, type } = req.query;

      let query = `
        SELECT 
          i.*,
          COUNT(e.id) as exhibition_count
        FROM institutions i
        LEFT JOIN exhibitions e ON i.id = e.institution_id
        WHERE 1=1
      `;

      const params = [];
      let paramIndex = 1;

      if (city) {
        query += ` AND i.city = $${paramIndex}`;
        params.push(city);
        paramIndex++;
      }

      if (type) {
        query += ` AND i.type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      query += ` GROUP BY i.id ORDER BY exhibition_count DESC`;

      const result = await pool.query(query, params);

      res.json({
        success: true,
        venues: result.rows
      });

    } catch (error) {
      log.error('Error fetching venues:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch venues'
      });
    }
  },

  // Like/unlike exhibition (placeholder - needs user system)
  async likeExhibition(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId; // from auth middleware

      // This would need a likes table to track user likes
      res.json({
        success: true,
        message: 'Like functionality not yet implemented'
      });

    } catch (error) {
      log.error('Error liking exhibition:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to like exhibition'
      });
    }
  },

  // Submit exhibition (placeholder)
  async submitExhibition(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      // This would need proper validation and moderation
      res.json({
        success: true,
        message: 'Exhibition submission not yet implemented'
      });

    } catch (error) {
      log.error('Error submitting exhibition:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit exhibition'
      });
    }
  }
};

module.exports = exhibitionController;