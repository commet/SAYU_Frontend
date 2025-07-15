const { pool } = require('../config/database');

class ExhibitionModel {
  // Create exhibition
  static async create(exhibitionData) {
    const {
      title, titleEn, description, venueId, venueName, venueCity, venueCountry,
      startDate, endDate, artists, type, posterImage, images, officialUrl,
      ticketUrl, admissionFee, admissionNote, source, sourceUrl, submittedBy,
      verificationStatus, tags, featured, openingDate, openingTime
    } = exhibitionData;

    const query = `
      INSERT INTO exhibitions (
        title, title_en, description, venue_id, venue_name, venue_city, venue_country,
        start_date, end_date, artists, type, poster_image, images, official_url,
        ticket_url, admission_fee, admission_note, source, source_url, submitted_by,
        verification_status, tags, featured, opening_date, opening_time
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25
      ) RETURNING *`;

    const values = [
      title, titleEn, description, venueId, venueName, venueCity, venueCountry || 'KR',
      startDate, endDate, JSON.stringify(artists || []), type || 'group',
      posterImage, JSON.stringify(images || []), officialUrl, ticketUrl,
      admissionFee || 0, admissionNote, source || 'manual', sourceUrl, submittedBy,
      verificationStatus || 'pending', JSON.stringify(tags || []), featured || false,
      openingDate, openingTime
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find by ID
  static async findById(id) {
    const query = `
      SELECT e.*, v.name as venue_name, v.name_en as venue_name_en, 
             v.type as venue_type, v.address as venue_address
      FROM exhibitions e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.id = $1`;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find with filters
  static async find(filters = {}, options = {}) {
    const { page = 1, limit = 20, orderBy = 'start_date', order = 'ASC' } = options;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let values = [];
    let valueIndex = 1;

    // Build WHERE conditions
    if (filters.city) {
      whereConditions.push(`e.venue_city = $${valueIndex}`);
      values.push(filters.city);
      valueIndex++;
    }

    if (filters.country) {
      whereConditions.push(`e.venue_country = $${valueIndex}`);
      values.push(filters.country);
      valueIndex++;
    }

    if (filters.status) {
      whereConditions.push(`e.status = $${valueIndex}`);
      values.push(filters.status);
      valueIndex++;
    }

    if (filters.venueId) {
      whereConditions.push(`e.venue_id = $${valueIndex}`);
      values.push(filters.venueId);
      valueIndex++;
    }

    if (filters.featured !== undefined) {
      whereConditions.push(`e.featured = $${valueIndex}`);
      values.push(filters.featured);
      valueIndex++;
    }

    if (filters.verificationStatus) {
      whereConditions.push(`e.verification_status = $${valueIndex}`);
      values.push(filters.verificationStatus);
      valueIndex++;
    }

    if (filters.search) {
      whereConditions.push(`(e.title ILIKE $${valueIndex} OR e.description ILIKE $${valueIndex})`);
      values.push(`%${filters.search}%`);
      valueIndex++;
    }

    // Date range
    if (filters.startDate) {
      whereConditions.push(`e.start_date >= $${valueIndex}`);
      values.push(filters.startDate);
      valueIndex++;
    }

    if (filters.endDate) {
      whereConditions.push(`e.start_date <= $${valueIndex}`);
      values.push(filters.endDate);
      valueIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Count query
    const countQuery = `
      SELECT COUNT(*) 
      FROM exhibitions e 
      ${whereClause}`;
    
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Data query
    values.push(limit, offset);
    const dataQuery = `
      SELECT e.*, v.name as venue_name, v.name_en as venue_name_en, 
             v.type as venue_type, v.address as venue_address
      FROM exhibitions e
      LEFT JOIN venues v ON e.venue_id = v.id
      ${whereClause}
      ORDER BY e.featured DESC, e.${orderBy} ${order}
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;

    const dataResult = await pool.query(dataQuery, values);

    return {
      exhibitions: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update exhibition
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let valueIndex = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${columnName} = $${valueIndex}`);
        
        if (['artists', 'images', 'tags'].includes(columnName)) {
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
      UPDATE exhibitions 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${valueIndex}
      RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Increment view count
  static async incrementViewCount(id) {
    const query = `
      UPDATE exhibitions 
      SET view_count = view_count + 1 
      WHERE id = $1 
      RETURNING view_count`;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get trending exhibitions
  static async getTrending(limit = 10) {
    const query = `
      SELECT e.*, v.name as venue_name, v.type as venue_type
      FROM exhibitions e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.status = 'ongoing' 
      AND e.verification_status = 'verified'
      ORDER BY e.view_count DESC, e.like_count DESC
      LIMIT $1`;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // Get upcoming exhibitions
  static async getUpcoming(days = 7) {
    const query = `
      SELECT e.*, v.name as venue_name, v.type as venue_type, v.city as venue_city
      FROM exhibitions e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.status = 'upcoming'
      AND e.start_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
      AND e.verification_status = 'verified'
      ORDER BY e.start_date ASC`;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Update exhibition status based on dates
  static async updateStatuses() {
    // Mark ended exhibitions
    await pool.query(`
      UPDATE exhibitions 
      SET status = 'ended' 
      WHERE end_date < CURRENT_DATE 
      AND status != 'ended'
    `);

    // Mark ongoing exhibitions
    await pool.query(`
      UPDATE exhibitions 
      SET status = 'ongoing' 
      WHERE start_date <= CURRENT_DATE 
      AND end_date >= CURRENT_DATE 
      AND status != 'ongoing'
    `);

    // Mark upcoming exhibitions
    await pool.query(`
      UPDATE exhibitions 
      SET status = 'upcoming' 
      WHERE start_date > CURRENT_DATE 
      AND status != 'upcoming'
    `);
  }
}

module.exports = ExhibitionModel;