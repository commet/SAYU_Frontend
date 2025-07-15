const { pool } = require('../config/database');

class VenueModel {
  // Create venue
  static async create(venueData) {
    const {
      name, nameEn, type, tier, address, addressDetail, city, region, country,
      latitude, longitude, phone, email, website, instagram, facebook,
      operatingHours, closedDays, features, logoImage, coverImage, images,
      description, descriptionEn, crawlUrl, crawlSelector, crawlFrequency
    } = venueData;

    const query = `
      INSERT INTO venues (
        name, name_en, type, tier, address, address_detail, city, region, country,
        latitude, longitude, phone, email, website, instagram, facebook,
        operating_hours, closed_days, features, logo_image, cover_image, images,
        description, description_en, crawl_url, crawl_selector, crawl_frequency
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      ) RETURNING *`;

    const values = [
      name, nameEn, type, tier || '2', address, addressDetail, city, region,
      country || 'KR', latitude, longitude, phone, email, website, instagram,
      facebook, JSON.stringify(operatingHours || {}), JSON.stringify(closedDays || []),
      JSON.stringify(features || []), logoImage, coverImage, JSON.stringify(images || []),
      description, descriptionEn, crawlUrl, JSON.stringify(crawlSelector || {}),
      crawlFrequency || 'weekly'
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find by ID
  static async findById(id) {
    const query = 'SELECT * FROM venues WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find by name
  static async findByName(name) {
    const query = 'SELECT * FROM venues WHERE name = $1';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  // Find with filters
  static async find(filters = {}, options = {}) {
    const { limit = 50 } = options;
    
    let whereConditions = ['is_active = true'];
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
      whereConditions.push(`type = $${valueIndex}`);
      values.push(filters.type);
      valueIndex++;
    }

    if (filters.tier) {
      whereConditions.push(`tier = $${valueIndex}`);
      values.push(filters.tier);
      valueIndex++;
    }

    if (filters.search) {
      whereConditions.push(`(name ILIKE $${valueIndex} OR name_en ILIKE $${valueIndex})`);
      values.push(`%${filters.search}%`);
      valueIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    values.push(limit);

    const query = `
      SELECT id, name, name_en, type, city, country, address, website, tier
      FROM venues
      WHERE ${whereClause}
      ORDER BY tier ASC, name ASC
      LIMIT $${valueIndex}`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get venues for crawling
  static async getVenuesForCrawling(crawlFrequency) {
    const query = `
      SELECT * FROM venues 
      WHERE is_active = true 
      AND crawl_frequency = $1
      ORDER BY last_crawled_at ASC NULLS FIRST`;
    
    const result = await pool.query(query, [crawlFrequency]);
    return result.rows;
  }

  // Update last crawled timestamp
  static async updateLastCrawled(id) {
    const query = `
      UPDATE venues 
      SET last_crawled_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING last_crawled_at`;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Increment exhibition count
  static async incrementExhibitionCount(id) {
    const query = `
      UPDATE venues 
      SET exhibition_count = exhibition_count + 1 
      WHERE id = $1 
      RETURNING exhibition_count`;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Seed initial venues
  static async seedVenues(venues) {
    const results = [];
    
    for (const venue of venues) {
      try {
        // Check if venue already exists
        const existing = await this.findByName(venue.name);
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
}

module.exports = VenueModel;