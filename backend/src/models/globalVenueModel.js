const { pool } = require('../config/database');

class GlobalVenueModel {
  // Create venue
  static async create(venueData) {
    const {
      name, nameEn, nameLocal, type, category, tier, 
      address, district, city, country,
      latitude, longitude, phone, email, website, socialMedia,
      operatingHours, admissionInfo, features, images,
      description, descriptionEn, 
      googlePlaceId, dataSource, dataQualityScore,
      crawlUrl, crawlSelector, crawlFrequency
    } = venueData;

    const query = `
      INSERT INTO global_venues (
        name, name_en, name_local, venue_type, venue_category, tier,
        address, district, city, country,
        latitude, longitude, phone, email, website, social_media,
        opening_hours, admission_info, features, images,
        description, description_en,
        google_place_id, data_source, data_quality_score,
        crawl_url, crawl_selector, crawl_frequency,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, 'system'
      ) RETURNING *`;

    const values = [
      name, nameEn, nameLocal, type || 'gallery', category || 'commercial', tier || 2,
      address, district, city, country || 'South Korea',
      latitude, longitude, phone, email, website, 
      socialMedia ? JSON.stringify(socialMedia) : null,
      operatingHours ? JSON.stringify(operatingHours) : null,
      admissionInfo, 
      features ? JSON.stringify(features) : null,
      images ? JSON.stringify(images) : null,
      description, descriptionEn,
      googlePlaceId, dataSource || 'manual', dataQualityScore || 50,
      crawlUrl, 
      crawlSelector ? JSON.stringify(crawlSelector) : null,
      crawlFrequency || 'weekly'
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find by ID
  static async findById(id) {
    const query = 'SELECT * FROM global_venues WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find by name
  static async findByName(name, city = null) {
    let query = 'SELECT * FROM global_venues WHERE name = $1';
    const values = [name];
    
    if (city) {
      query += ' AND city = $2';
      values.push(city);
    }
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find by Google Place ID
  static async findByGooglePlaceId(googlePlaceId) {
    const query = 'SELECT * FROM global_venues WHERE google_place_id = $1';
    const result = await pool.query(query, [googlePlaceId]);
    return result.rows[0];
  }

  // Find with filters
  static async find(filters = {}, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    let whereConditions = ['(is_active = true OR is_active IS NULL)'];
    let values = [];
    let valueIndex = 1;

    if (filters.city) {
      whereConditions.push(`city = $${valueIndex}`);
      values.push(filters.city);
      valueIndex++;
    }

    if (filters.country) {
      whereConditions.push(`country = $${valueIndex}`);
      values.push(filters.country);
      valueIndex++;
    }

    if (filters.type) {
      whereConditions.push(`venue_type = $${valueIndex}`);
      values.push(filters.type);
      valueIndex++;
    }

    if (filters.category) {
      whereConditions.push(`venue_category = $${valueIndex}`);
      values.push(filters.category);
      valueIndex++;
    }

    if (filters.tier) {
      whereConditions.push(`tier = $${valueIndex}`);
      values.push(filters.tier);
      valueIndex++;
    }

    if (filters.search) {
      whereConditions.push(`(name ILIKE $${valueIndex} OR name_en ILIKE $${valueIndex} OR name_local ILIKE $${valueIndex})`);
      values.push(`%${filters.search}%`);
      valueIndex++;
    }

    if (filters.district) {
      whereConditions.push(`district = $${valueIndex}`);
      values.push(filters.district);
      valueIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    values.push(limit, offset);

    const query = `
      SELECT id, name, name_en, name_local, venue_type, venue_category, 
             city, country, district, address, website, tier, rating, 
             google_place_id, data_quality_score
      FROM global_venues
      WHERE ${whereClause}
      ORDER BY 
        CASE WHEN country = 'South Korea' THEN 0 ELSE 1 END,
        tier ASC, 
        rating DESC NULLS LAST,
        name ASC
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get venues for crawling
  static async getVenuesForCrawling(crawlFrequency) {
    const query = `
      SELECT * FROM global_venues 
      WHERE (is_active = true OR is_active IS NULL)
      AND crawl_frequency = $1
      AND crawl_url IS NOT NULL
      ORDER BY last_crawled_at ASC NULLS FIRST`;
    
    const result = await pool.query(query, [crawlFrequency]);
    return result.rows;
  }

  // Update last crawled timestamp
  static async updateLastCrawled(id) {
    const query = `
      UPDATE global_venues 
      SET last_crawled_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING last_crawled_at`;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Increment exhibition count
  static async incrementExhibitionCount(id) {
    const query = `
      UPDATE global_venues 
      SET exhibition_count = exhibition_count + 1 
      WHERE id = $1 
      RETURNING exhibition_count`;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update venue metadata
  static async updateMetadata(id, metadata) {
    const {
      rating, reviewCount, socialMedia, openingHours,
      admissionInfo, features, dataQualityScore
    } = metadata;

    const updates = [];
    const values = [];
    let valueIndex = 1;

    if (rating !== undefined) {
      updates.push(`rating = $${valueIndex}`);
      values.push(rating);
      valueIndex++;
    }

    if (reviewCount !== undefined) {
      updates.push(`review_count = $${valueIndex}`);
      values.push(reviewCount);
      valueIndex++;
    }

    if (socialMedia !== undefined) {
      updates.push(`social_media = $${valueIndex}`);
      values.push(JSON.stringify(socialMedia));
      valueIndex++;
    }

    if (openingHours !== undefined) {
      updates.push(`opening_hours = $${valueIndex}`);
      values.push(JSON.stringify(openingHours));
      valueIndex++;
    }

    if (admissionInfo !== undefined) {
      updates.push(`admission_info = $${valueIndex}`);
      values.push(admissionInfo);
      valueIndex++;
    }

    if (features !== undefined) {
      updates.push(`features = $${valueIndex}`);
      values.push(JSON.stringify(features));
      valueIndex++;
    }

    if (dataQualityScore !== undefined) {
      updates.push(`data_quality_score = $${valueIndex}`);
      values.push(dataQualityScore);
      valueIndex++;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE global_venues 
      SET ${updates.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get statistics
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_count,
        COUNT(DISTINCT country) as country_count,
        COUNT(DISTINCT city) as city_count,
        COUNT(CASE WHEN country = 'South Korea' THEN 1 END) as korean_count,
        COUNT(CASE WHEN country != 'South Korea' THEN 1 END) as international_count,
        COUNT(CASE WHEN venue_type = 'museum' THEN 1 END) as museum_count,
        COUNT(CASE WHEN venue_type = 'gallery' THEN 1 END) as gallery_count,
        AVG(data_quality_score)::NUMERIC(5,2) as avg_quality_score
      FROM global_venues
      WHERE is_active = true OR is_active IS NULL`;
    
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = GlobalVenueModel;