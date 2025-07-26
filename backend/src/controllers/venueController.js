const GlobalVenueModel = require('../models/globalVenueModel');
const { validationResult } = require('express-validator');
const { log } = require('../config/logger');

// 언어별 필드 매핑
const getLocalizedFields = (lang = 'ko') => {
  if (lang === 'ko') {
    return {
      name: 'COALESCE(name_ko, name)',
      city: 'COALESCE(city_ko, city)',
      address: 'COALESCE(address_ko, address)',
      description: 'COALESCE(description_ko, description)',
      admission_info: 'COALESCE(admission_info_ko, admission_info)'
    };
  } else {
    return {
      name: 'COALESCE(name_en, name)',
      city: 'COALESCE(city_en, city)',
      address: 'COALESCE(address_en, address)',
      description: 'COALESCE(description_en, description)',
      admission_info: 'COALESCE(admission_info_en, admission_info)'
    };
  }
};

const venueController = {
  // Get venues with language support
  async getVenues(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        page = 1,
        limit = 20,
        lang = 'ko', // 기본 언어는 한국어
        country,
        city,
        type,
        search,
        tier,
        sortBy = 'rating',
        order = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;
      const filters = {};

      if (country) filters.country = country;
      if (city) filters.city = city;
      if (type) filters.type = type;
      if (search) filters.search = search;
      if (tier) filters.tier = tier;

      // 언어별 필드 선택
      const localizedFields = getLocalizedFields(lang);
      
      // 커스텀 쿼리로 언어별 데이터 가져오기
      const query = `
        SELECT 
          id,
          ${localizedFields.name} as name,
          name_en,
          name_ko,
          name_local,
          ${localizedFields.city} as city,
          city_en,
          city_ko,
          country,
          district,
          ${localizedFields.address} as address,
          latitude,
          longitude,
          phone,
          email,
          website,
          social_media,
          venue_type,
          venue_category,
          tier,
          rating,
          review_count,
          opening_hours,
          ${localizedFields.admission_info} as admission_info,
          features,
          images,
          ${localizedFields.description} as description,
          google_place_id,
          data_quality_score,
          created_at,
          updated_at
        FROM global_venues
        WHERE (is_active = true OR is_active IS NULL)
        ${country ? `AND country = '${country}'` : ''}
        ${city ? `AND (city = '${city}' OR city_ko = '${city}' OR city_en = '${city}')` : ''}
        ${type ? `AND venue_type = '${type}'` : ''}
        ${search ? `AND (
          name ILIKE '%${search}%' OR 
          name_ko ILIKE '%${search}%' OR 
          name_en ILIKE '%${search}%' OR
          city ILIKE '%${search}%' OR
          city_ko ILIKE '%${search}%' OR
          city_en ILIKE '%${search}%'
        )` : ''}
        ${tier ? `AND tier = ${tier}` : ''}
        ORDER BY 
          CASE WHEN country = 'South Korea' THEN 0 ELSE 1 END,
          ${sortBy} ${order} NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM global_venues
        WHERE (is_active = true OR is_active IS NULL)
        ${country ? `AND country = '${country}'` : ''}
        ${city ? `AND (city = '${city}' OR city_ko = '${city}' OR city_en = '${city}')` : ''}
        ${type ? `AND venue_type = '${type}'` : ''}
        ${search ? `AND (
          name ILIKE '%${search}%' OR 
          name_ko ILIKE '%${search}%' OR 
          name_en ILIKE '%${search}%' OR
          city ILIKE '%${search}%' OR
          city_ko ILIKE '%${search}%' OR
          city_en ILIKE '%${search}%'
        )` : ''}
        ${tier ? `AND tier = ${tier}` : ''}
      `;

      const { pool } = require('../config/database');
      const client = await pool.connect();
      
      try {
        const [venuesResult, countResult] = await Promise.all([
          client.query(query),
          client.query(countQuery)
        ]);

        const venues = venuesResult.rows;
        const totalCount = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
          success: true,
          data: venues,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          },
          language: lang
        });
      } finally {
        client.release();
      }
    } catch (error) {
      log.error('Error fetching venues:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch venues'
      });
    }
  },

  // Get single venue by ID with language support
  async getVenueById(req, res) {
    try {
      const { id } = req.params;
      const { lang = 'ko' } = req.query;

      const localizedFields = getLocalizedFields(lang);

      const query = `
        SELECT 
          id,
          ${localizedFields.name} as name,
          name_en,
          name_ko,
          name_local,
          ${localizedFields.city} as city,
          city_en,
          city_ko,
          country,
          district,
          province,
          ${localizedFields.address} as address,
          latitude,
          longitude,
          phone,
          email,
          website,
          social_media,
          venue_type,
          venue_category,
          tier,
          rating,
          review_count,
          opening_hours,
          ${localizedFields.admission_info} as admission_info,
          admission_fee,
          features,
          images,
          ${localizedFields.description} as description,
          description_en,
          description_ko,
          google_place_id,
          google_maps_uri,
          data_quality_score,
          verification_status,
          created_at,
          updated_at
        FROM global_venues
        WHERE id = $1
      `;

      const { pool } = require('../config/database');
      const client = await pool.connect();
      
      try {
        const result = await client.query(query, [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Venue not found'
          });
        }

        res.json({
          success: true,
          data: result.rows[0],
          language: lang
        });
      } finally {
        client.release();
      }
    } catch (error) {
      log.error('Error fetching venue:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch venue'
      });
    }
  },

  // Get cities with venue counts (with translation)
  async getCitiesWithCounts(req, res) {
    try {
      const { country, lang = 'ko' } = req.query;

      const cityField = lang === 'ko' ? 'COALESCE(city_ko, city)' : 'COALESCE(city_en, city)';

      let query = `
        SELECT 
          ${cityField} as city,
          city as city_original,
          city_ko,
          city_en,
          country,
          COUNT(*) as venue_count,
          COUNT(CASE WHEN venue_type = 'museum' THEN 1 END) as museum_count,
          COUNT(CASE WHEN venue_type = 'gallery' THEN 1 END) as gallery_count
        FROM global_venues
        WHERE (is_active = true OR is_active IS NULL)
        ${country ? `AND country = '${country}'` : ''}
        GROUP BY city, city_ko, city_en, country
        ORDER BY venue_count DESC
      `;

      const { pool } = require('../config/database');
      const client = await pool.connect();
      
      try {
        const result = await client.query(query);
        
        res.json({
          success: true,
          data: result.rows,
          language: lang
        });
      } finally {
        client.release();
      }
    } catch (error) {
      log.error('Error fetching cities:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch cities'
      });
    }
  },

  // Get countries with venue counts
  async getCountriesWithCounts(req, res) {
    try {
      const { lang = 'ko' } = req.query;

      // 국가명 번역 매핑
      const countryTranslations = {
        'South Korea': { ko: '한국', en: 'South Korea' },
        'United States': { ko: '미국', en: 'United States' },
        'Japan': { ko: '일본', en: 'Japan' },
        'China': { ko: '중국', en: 'China' },
        'United Kingdom': { ko: '영국', en: 'United Kingdom' },
        'France': { ko: '프랑스', en: 'France' },
        'Germany': { ko: '독일', en: 'Germany' },
        'Italy': { ko: '이탈리아', en: 'Italy' },
        'Spain': { ko: '스페인', en: 'Spain' },
        'Netherlands': { ko: '네덜란드', en: 'Netherlands' },
        'Hong Kong': { ko: '홍콩', en: 'Hong Kong' },
        'Singapore': { ko: '싱가포르', en: 'Singapore' },
        'Australia': { ko: '호주', en: 'Australia' },
        'Canada': { ko: '캐나다', en: 'Canada' },
        'Brazil': { ko: '브라질', en: 'Brazil' },
        'Mexico': { ko: '멕시코', en: 'Mexico' },
        'Russia': { ko: '러시아', en: 'Russia' },
        'India': { ko: '인도', en: 'India' },
        'Thailand': { ko: '태국', en: 'Thailand' },
        'United Arab Emirates': { ko: '아랍에미리트', en: 'United Arab Emirates' }
      };

      const query = `
        SELECT 
          country,
          COUNT(*) as venue_count,
          COUNT(DISTINCT city) as city_count,
          COUNT(CASE WHEN venue_type = 'museum' THEN 1 END) as museum_count,
          COUNT(CASE WHEN venue_type = 'gallery' THEN 1 END) as gallery_count
        FROM global_venues
        WHERE (is_active = true OR is_active IS NULL)
        GROUP BY country
        ORDER BY venue_count DESC
      `;

      const { pool } = require('../config/database');
      const client = await pool.connect();
      
      try {
        const result = await client.query(query);
        
        // 국가명 번역 추가
        const data = result.rows.map(row => ({
          ...row,
          country_display: countryTranslations[row.country]?.[lang] || row.country,
          country_ko: countryTranslations[row.country]?.ko || row.country,
          country_en: countryTranslations[row.country]?.en || row.country
        }));
        
        res.json({
          success: true,
          data,
          language: lang
        });
      } finally {
        client.release();
      }
    } catch (error) {
      log.error('Error fetching countries:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch countries'
      });
    }
  },

  // Search venues with multi-language support
  async searchVenues(req, res) {
    try {
      const { q, lang = 'ko', limit = 10 } = req.query;

      if (!q || q.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search query must be at least 2 characters'
        });
      }

      const localizedFields = getLocalizedFields(lang);

      const query = `
        SELECT 
          id,
          ${localizedFields.name} as name,
          ${localizedFields.city} as city,
          country,
          venue_type,
          rating,
          CASE 
            WHEN name ILIKE $1 THEN 1
            WHEN name_ko ILIKE $1 THEN 2
            WHEN name_en ILIKE $1 THEN 3
            WHEN city ILIKE $1 THEN 4
            WHEN city_ko ILIKE $1 THEN 5
            WHEN city_en ILIKE $1 THEN 6
            ELSE 7
          END as relevance
        FROM global_venues
        WHERE (is_active = true OR is_active IS NULL)
        AND (
          name ILIKE $1 OR 
          name_ko ILIKE $1 OR 
          name_en ILIKE $1 OR
          city ILIKE $1 OR
          city_ko ILIKE $1 OR
          city_en ILIKE $1 OR
          address ILIKE $1 OR
          address_ko ILIKE $1 OR
          address_en ILIKE $1
        )
        ORDER BY relevance, rating DESC NULLS LAST
        LIMIT $2
      `;

      const { pool } = require('../config/database');
      const client = await pool.connect();
      
      try {
        const result = await client.query(query, [`%${q}%`, limit]);
        
        res.json({
          success: true,
          data: result.rows,
          query: q,
          language: lang
        });
      } finally {
        client.release();
      }
    } catch (error) {
      log.error('Error searching venues:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search venues'
      });
    }
  }
};

module.exports = venueController;