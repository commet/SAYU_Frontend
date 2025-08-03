const { pool } = require('../config/database');

/**
 * Unified Venue Model
 * 모든 venue 데이터를 통합한 새로운 모델
 */
class UnifiedVenueModel {
  // Create venue
  static async create(venueData) {
    const {
      name, nameEn, nameKo, nameLocal, type, category, tier,
      address, addressEn, addressKo, district, city, cityEn, cityKo,
      region, country, latitude, longitude, phone, email, website,
      socialMedia, operatingHours, admissionInfo, features,
      logoImage, coverImage, images, description, descriptionEn, descriptionKo,
      googlePlaceId, dataSource, isActive, rating, reviewCount,
      dataQualityScore, crawlUrl, crawlSelector, crawlFrequency
    } = venueData;

    const query = `
      INSERT INTO venues_unified (
        name, name_en, name_ko, name_local, type, category, tier,
        address, address_en, address_ko, district, city, city_en, city_ko,
        region, country, latitude, longitude, phone, email, website,
        social_media, operating_hours, admission_info, features,
        logo_image, cover_image, images, description, description_en, description_ko,
        google_place_id, data_source, is_active, rating, review_count,
        data_quality_score, crawl_url, crawl_selector, crawl_frequency
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
        $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39
      ) RETURNING *`;

    const values = [
      name, nameEn, nameKo, nameLocal, type || 'gallery', category || 'commercial', tier || 2,
      address, addressEn, addressKo, district, city, cityEn, cityKo,
      region, country || 'KR', latitude, longitude, phone, email, website,
      JSON.stringify(socialMedia || {}), JSON.stringify(operatingHours || {}), 
      admissionInfo, JSON.stringify(features || []),
      logoImage, coverImage, JSON.stringify(images || []), 
      description, descriptionEn, descriptionKo,
      googlePlaceId, dataSource || 'manual', isActive !== false, rating, reviewCount,
      dataQualityScore || 50, crawlUrl, JSON.stringify(crawlSelector || {}), 
      crawlFrequency || 'weekly'
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find by ID
  static async findById(id) {
    const query = 'SELECT * FROM venues_unified WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find by name (with optional city for disambiguation)
  static async findByName(name, city = null) {
    let query = 'SELECT * FROM venues_unified WHERE name = $1';
    const values = [name];

    if (city) {
      query += ' AND city = $2';
      values.push(city);
    }

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find with advanced filters
  static async find(filters = {}, options = {}) {
    const { page = 1, limit = 50, orderBy = 'name', order = 'ASC' } = options;
    const offset = (page - 1) * limit;

    const whereConditions = ['is_active = true'];
    const values = [];
    let valueIndex = 1;

    // Build WHERE conditions
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
      whereConditions.push(`type = $${valueIndex}`);
      values.push(filters.type);
      valueIndex++;
    }

    if (filters.category) {
      whereConditions.push(`category = $${valueIndex}`);
      values.push(filters.category);
      valueIndex++;
    }

    if (filters.tier) {
      whereConditions.push(`tier = $${valueIndex}`);
      values.push(filters.tier);
      valueIndex++;
    }

    if (filters.search) {
      whereConditions.push(`(
        name ILIKE $${valueIndex} OR 
        name_en ILIKE $${valueIndex} OR 
        name_ko ILIKE $${valueIndex} OR 
        name_local ILIKE $${valueIndex}
      )`);
      values.push(`%${filters.search}%`);
      valueIndex++;
    }

    if (filters.district) {
      whereConditions.push(`district = $${valueIndex}`);
      values.push(filters.district);
      valueIndex++;
    }

    if (filters.minRating) {
      whereConditions.push(`rating >= $${valueIndex}`);
      values.push(filters.minRating);
      valueIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Count query
    const countQuery = `SELECT COUNT(*) FROM venues_unified WHERE ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Data query
    values.push(limit, offset);
    const validOrderBy = ['name', 'tier', 'rating', 'exhibition_count', 'created_at'];
    const safeOrderBy = validOrderBy.includes(orderBy) ? orderBy : 'name';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const dataQuery = `
      SELECT id, name, name_en, name_ko, type, category, tier, city, city_en, city_ko,
             district, country, address, website, rating, exhibition_count, data_quality_score,
             social_media, features, google_place_id, created_at
      FROM venues_unified
      WHERE ${whereClause}
      ORDER BY 
        CASE WHEN country = 'KR' THEN 0 ELSE 1 END,
        tier ASC,
        ${safeOrderBy} ${safeOrder}
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;

    const dataResult = await pool.query(dataQuery, values);

    return {
      venues: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update venue
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let valueIndex = 1;

    // Dynamic field building
    const fieldMapping = {
      name: 'name',
      nameEn: 'name_en',
      nameKo: 'name_ko',
      nameLocal: 'name_local',
      type: 'type',
      category: 'category',
      tier: 'tier',
      address: 'address',
      addressEn: 'address_en',
      addressKo: 'address_ko',
      district: 'district',
      city: 'city',
      cityEn: 'city_en',
      cityKo: 'city_ko',
      region: 'region',
      country: 'country',
      latitude: 'latitude',
      longitude: 'longitude',
      phone: 'phone',
      email: 'email',
      website: 'website',
      socialMedia: 'social_media',
      operatingHours: 'operating_hours',
      admissionInfo: 'admission_info',
      features: 'features',
      logoImage: 'logo_image',
      coverImage: 'cover_image',
      images: 'images',
      description: 'description',
      descriptionEn: 'description_en',
      descriptionKo: 'description_ko',
      googlePlaceId: 'google_place_id',
      dataSource: 'data_source',
      isActive: 'is_active',
      rating: 'rating',
      reviewCount: 'review_count',
      dataQualityScore: 'data_quality_score'
    };

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && fieldMapping[key]) {
        const columnName = fieldMapping[key];
        fields.push(`${columnName} = $${valueIndex}`);

        // JSON fields
        if (['socialMedia', 'operatingHours', 'features', 'images'].includes(key)) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        valueIndex++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE venues_unified 
      SET ${fields.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get venues for crawling
  static async getVenuesForCrawling(crawlFrequency) {
    const query = `
      SELECT * FROM venues_unified 
      WHERE is_active = true 
      AND crawl_frequency = $1
      AND crawl_url IS NOT NULL
      ORDER BY last_crawled_at ASC NULLS FIRST`;

    const result = await pool.query(query, [crawlFrequency]);
    return result.rows;
  }

  // Update last crawled timestamp
  static async updateLastCrawled(id) {
    const query = `
      UPDATE venues_unified 
      SET last_crawled_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING last_crawled_at`;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Increment exhibition count
  static async incrementExhibitionCount(id) {
    const query = `
      UPDATE venues_unified 
      SET exhibition_count = exhibition_count + 1 
      WHERE id = $1 
      RETURNING exhibition_count`;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get statistics
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_count,
        COUNT(DISTINCT country) as country_count,
        COUNT(DISTINCT city) as city_count,
        COUNT(CASE WHEN country = 'KR' THEN 1 END) as korean_count,
        COUNT(CASE WHEN country != 'KR' THEN 1 END) as international_count,
        COUNT(CASE WHEN type = 'museum' THEN 1 END) as museum_count,
        COUNT(CASE WHEN type = 'gallery' THEN 1 END) as gallery_count,
        COUNT(CASE WHEN type = 'alternative_space' THEN 1 END) as alternative_count,
        AVG(rating)::NUMERIC(5,2) as avg_rating,
        AVG(data_quality_score)::NUMERIC(5,2) as avg_quality_score,
        SUM(exhibition_count) as total_exhibitions
      FROM venues_unified
      WHERE is_active = true`;

    const result = await pool.query(query);
    return result.rows[0];
  }

  // Search by location (with radius)
  static async findNearby(lat, lng, radiusKm = 5, limit = 20) {
    const query = `
      SELECT *, 
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians($2)) + 
          sin(radians($1)) * sin(radians(latitude))
        )) AS distance
      FROM venues_unified
      WHERE is_active = true 
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
      HAVING distance <= $3
      ORDER BY distance ASC
      LIMIT $4`;

    const result = await pool.query(query, [lat, lng, radiusKm, limit]);
    return result.rows;
  }

  // Batch operations for migration
  static async batchInsert(venues) {
    if (!venues || venues.length === 0) return [];

    const results = [];
    for (const venue of venues) {
      try {
        // Check if venue already exists
        const existing = await this.findByName(venue.name, venue.city);
        if (!existing) {
          const created = await this.create(venue);
          results.push({ venue: venue.name, status: 'created', id: created.id });
        } else {
          results.push({ venue: venue.name, status: 'exists', id: existing.id });
        }
      } catch (error) {
        results.push({ venue: venue.name, status: 'error', error: error.message });
      }
    }
    return results;
  }

  // Delete venue (soft delete)
  static async delete(id) {
    const query = `
      UPDATE venues_unified 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *`;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = UnifiedVenueModel;