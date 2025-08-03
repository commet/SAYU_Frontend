const { pool } = require('../config/database');

/**
 * Unified Exhibition Model
 * 모든 exhibition 데이터를 통합한 새로운 모델
 */
class UnifiedExhibitionModel {
  // Create exhibition
  static async create(exhibitionData) {
    const {
      title, titleEn, titleKo, subtitle, description, descriptionEn, descriptionKo,
      venueId, venueName, venueCity, venueCountry, startDate, endDate, openingDate, openingTime,
      artists, curator, curatorEn, type, artMedium, themes, posterImage, images,
      galleryImages, promotionalVideoUrl, virtualTourUrl, officialUrl, ticketUrl,
      bookingUrl, catalogUrl, pressKitUrl, admissionFee, admissionNote, ticketPrice,
      ticketRequired, bookingRequired, source, sourceUrl, dataSource, dataQualityScore,
      externalExhibitionId, submittedBy, verificationStatus, verifiedBy, verifiedAt,
      status, visibility, featured, tags, personalityMatches, emotionSignatures,
      aiGeneratedDescription, recommendationScore
    } = exhibitionData;

    const query = `
      INSERT INTO exhibitions_unified (
        title, title_en, title_ko, subtitle, description, description_en, description_ko,
        venue_id, venue_name, venue_city, venue_country, start_date, end_date, opening_date, opening_time,
        artists, curator, curator_en, type, art_medium, themes, poster_image, images,
        gallery_images, promotional_video_url, virtual_tour_url, official_url, ticket_url,
        booking_url, catalog_url, press_kit_url, admission_fee, admission_note, ticket_price,
        ticket_required, booking_required, source, source_url, data_source, data_quality_score,
        external_exhibition_id, submitted_by, verification_status, verified_by, verified_at,
        status, visibility, featured, tags, personality_matches, emotion_signatures,
        ai_generated_description, recommendation_score
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41,
        $42, $43, $44, $45, $46, $47, $48, $49, $50, $51
      ) RETURNING *`;

    const values = [
      title, titleEn, titleKo, subtitle, description, descriptionEn, descriptionKo,
      venueId, venueName, venueCity, venueCountry || 'KR', startDate, endDate, openingDate, openingTime,
      JSON.stringify(artists || []), curator, curatorEn, type || 'group', artMedium, themes,
      posterImage, JSON.stringify(images || []), JSON.stringify(galleryImages || []),
      promotionalVideoUrl, virtualTourUrl, officialUrl, ticketUrl, bookingUrl, catalogUrl, pressKitUrl,
      admissionFee || 0, admissionNote, JSON.stringify(ticketPrice || {}), ticketRequired || false,
      bookingRequired || false, source || 'manual', sourceUrl, dataSource || 'manual',
      dataQualityScore || 50, externalExhibitionId, submittedBy, verificationStatus || 'pending',
      verifiedBy, verifiedAt, status || 'upcoming', visibility || 'public', featured || false,
      JSON.stringify(tags || []), personalityMatches, JSON.stringify(emotionSignatures || {}),
      aiGeneratedDescription, recommendationScore || 50
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find by ID with venue details
  static async findById(id) {
    const query = `
      SELECT e.*, 
             v.name as venue_full_name, v.name_en as venue_name_en, v.type as venue_type,
             v.address as venue_address, v.website as venue_website, 
             v.social_media->>'instagram' as venue_instagram,
             v.operating_hours as venue_operating_hours, v.features as venue_features
      FROM exhibitions_unified e
      LEFT JOIN venues_unified v ON e.venue_id = v.id
      WHERE e.id = $1`;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find with comprehensive filters
  static async find(filters = {}, options = {}) {
    const { page = 1, limit = 20, orderBy = 'start_date', order = 'DESC' } = options;
    const offset = (page - 1) * limit;

    const whereConditions = [];
    const values = [];
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
      if (Array.isArray(filters.status)) {
        whereConditions.push(`e.status = ANY($${valueIndex})`);
        values.push(filters.status);
      } else {
        whereConditions.push(`e.status = $${valueIndex}`);
        values.push(filters.status);
      }
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

    if (filters.visibility) {
      whereConditions.push(`e.visibility = $${valueIndex}`);
      values.push(filters.visibility);
      valueIndex++;
    }

    if (filters.type) {
      whereConditions.push(`e.type = $${valueIndex}`);
      values.push(filters.type);
      valueIndex++;
    }

    if (filters.search) {
      whereConditions.push(`(
        e.title ILIKE $${valueIndex} OR 
        e.title_en ILIKE $${valueIndex} OR 
        e.title_ko ILIKE $${valueIndex} OR
        e.description ILIKE $${valueIndex} OR 
        e.venue_name ILIKE $${valueIndex}
      )`);
      values.push(`%${filters.search}%`);
      valueIndex++;
    }

    // Date range filters
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

    // Current status filters
    if (filters.ongoing) {
      whereConditions.push(`e.start_date <= CURRENT_DATE AND e.end_date >= CURRENT_DATE`);
    }

    if (filters.upcoming) {
      whereConditions.push(`e.start_date > CURRENT_DATE`);
    }

    if (filters.ended) {
      whereConditions.push(`e.end_date < CURRENT_DATE`);
    }

    // Theme filter
    if (filters.themes && filters.themes.length > 0) {
      whereConditions.push(`e.themes && $${valueIndex}`);
      values.push(filters.themes);
      valueIndex++;
    }

    // Personality matching filter
    if (filters.personalityTypes && filters.personalityTypes.length > 0) {
      whereConditions.push(`e.personality_matches && $${valueIndex}`);
      values.push(filters.personalityTypes);
      valueIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Count query
    const countQuery = `
      SELECT COUNT(*) 
      FROM exhibitions_unified e 
      ${whereClause}`;

    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Data query
    values.push(limit, offset);
    const validOrderBy = ['start_date', 'end_date', 'created_at', 'title', 'view_count', 'recommendation_score'];
    const safeOrderBy = validOrderBy.includes(orderBy) ? orderBy : 'start_date';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const dataQuery = `
      SELECT e.*, 
             v.name as venue_full_name, v.name_en as venue_name_en, v.type as venue_type,
             v.address as venue_address, v.district as venue_district, v.city as venue_city_full,
             v.website as venue_website, v.social_media->>'instagram' as venue_instagram,
             v.rating as venue_rating, v.tier as venue_tier
      FROM exhibitions_unified e
      LEFT JOIN venues_unified v ON e.venue_id = v.id
      ${whereClause}
      ORDER BY e.featured DESC, e.${safeOrderBy} ${safeOrder}
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

    const fieldMapping = {
      title: 'title',
      titleEn: 'title_en',
      titleKo: 'title_ko',
      subtitle: 'subtitle',
      description: 'description',
      descriptionEn: 'description_en',
      descriptionKo: 'description_ko',
      venueId: 'venue_id',
      venueName: 'venue_name',
      venueCity: 'venue_city',
      venueCountry: 'venue_country',
      startDate: 'start_date',
      endDate: 'end_date',
      openingDate: 'opening_date',
      openingTime: 'opening_time',
      artists: 'artists',
      curator: 'curator',
      curatorEn: 'curator_en',
      type: 'type',
      artMedium: 'art_medium',
      themes: 'themes',
      posterImage: 'poster_image',
      images: 'images',
      galleryImages: 'gallery_images',
      promotionalVideoUrl: 'promotional_video_url',
      virtualTourUrl: 'virtual_tour_url',
      officialUrl: 'official_url',
      ticketUrl: 'ticket_url',
      bookingUrl: 'booking_url',
      catalogUrl: 'catalog_url',
      pressKitUrl: 'press_kit_url',
      admissionFee: 'admission_fee',
      admissionNote: 'admission_note',
      ticketPrice: 'ticket_price',
      ticketRequired: 'ticket_required',
      bookingRequired: 'booking_required',
      source: 'source',
      sourceUrl: 'source_url',
      dataSource: 'data_source',
      dataQualityScore: 'data_quality_score',
      externalExhibitionId: 'external_exhibition_id',
      submittedBy: 'submitted_by',
      verificationStatus: 'verification_status',
      verifiedBy: 'verified_by',
      verifiedAt: 'verified_at',
      status: 'status',
      visibility: 'visibility',
      featured: 'featured',
      tags: 'tags',
      personalityMatches: 'personality_matches',
      emotionSignatures: 'emotion_signatures',
      aiGeneratedDescription: 'ai_generated_description',
      recommendationScore: 'recommendation_score'
    };

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && fieldMapping[key]) {
        const columnName = fieldMapping[key];
        fields.push(`${columnName} = $${valueIndex}`);

        // JSON fields
        if (['artists', 'themes', 'images', 'galleryImages', 'ticketPrice', 'tags', 'emotionSignatures'].includes(key)) {
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
      UPDATE exhibitions_unified 
      SET ${fields.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Increment view count
  static async incrementViewCount(id) {
    const query = `
      UPDATE exhibitions_unified 
      SET view_count = view_count + 1 
      WHERE id = $1 
      RETURNING view_count`;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get trending exhibitions
  static async getTrending(limit = 10) {
    const query = `
      SELECT e.*, v.name as venue_full_name, v.type as venue_type, v.tier as venue_tier
      FROM exhibitions_unified e
      LEFT JOIN venues_unified v ON e.venue_id = v.id
      WHERE e.status = 'ongoing' 
      AND e.verification_status = 'verified'
      AND e.visibility = 'public'
      ORDER BY e.view_count DESC, e.like_count DESC, e.recommendation_score DESC
      LIMIT $1`;

    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // Get upcoming exhibitions
  static async getUpcoming(days = 7, limit = 20) {
    const query = `
      SELECT e.*, v.name as venue_full_name, v.type as venue_type, v.city as venue_city_full,
             v.tier as venue_tier, v.rating as venue_rating
      FROM exhibitions_unified e
      LEFT JOIN venues_unified v ON e.venue_id = v.id
      WHERE e.status = 'upcoming'
      AND e.start_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
      AND e.verification_status = 'verified'
      AND e.visibility = 'public'
      ORDER BY e.start_date ASC, v.tier ASC
      LIMIT $1`;

    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // Get ongoing exhibitions
  static async getOngoing(limit = 20) {
    const query = `
      SELECT e.*, v.name as venue_full_name, v.type as venue_type, v.city as venue_city_full,
             v.tier as venue_tier, v.rating as venue_rating
      FROM exhibitions_unified e
      LEFT JOIN venues_unified v ON e.venue_id = v.id
      WHERE e.start_date <= CURRENT_DATE 
      AND e.end_date >= CURRENT_DATE
      AND e.verification_status = 'verified'
      AND e.visibility = 'public'
      ORDER BY e.featured DESC, v.tier ASC, e.end_date ASC
      LIMIT $1`;

    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // Update exhibition statuses based on dates
  static async updateStatuses() {
    const results = {
      ended: 0,
      ongoing: 0,
      upcoming: 0
    };

    // Mark ended exhibitions
    const endedResult = await pool.query(`
      UPDATE exhibitions_unified 
      SET status = 'ended' 
      WHERE end_date < CURRENT_DATE 
      AND status != 'ended'
      AND status != 'cancelled'
    `);
    results.ended = endedResult.rowCount;

    // Mark ongoing exhibitions
    const ongoingResult = await pool.query(`
      UPDATE exhibitions_unified 
      SET status = 'ongoing' 
      WHERE start_date <= CURRENT_DATE 
      AND end_date >= CURRENT_DATE 
      AND status != 'ongoing'
      AND status != 'cancelled'
    `);
    results.ongoing = ongoingResult.rowCount;

    // Mark upcoming exhibitions
    const upcomingResult = await pool.query(`
      UPDATE exhibitions_unified 
      SET status = 'upcoming' 
      WHERE start_date > CURRENT_DATE 
      AND status != 'upcoming'
      AND status != 'cancelled'
    `);
    results.upcoming = upcomingResult.rowCount;

    return results;
  }

  // Get statistics
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_count,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing_count,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming_count,
        COUNT(CASE WHEN status = 'ended' THEN 1 END) as ended_count,
        COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_count,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured_count,
        COUNT(CASE WHEN venue_country = 'KR' THEN 1 END) as korean_count,
        COUNT(CASE WHEN venue_country != 'KR' THEN 1 END) as international_count,
        AVG(view_count)::NUMERIC(10,2) as avg_views,
        AVG(recommendation_score)::NUMERIC(5,2) as avg_recommendation_score,
        COUNT(DISTINCT venue_city) as city_count,
        COUNT(DISTINCT venue_id) as venue_count
      FROM exhibitions_unified
      WHERE visibility = 'public'`;

    const result = await pool.query(query);
    return result.rows[0];
  }

  // Find exhibitions by personality type (for SAYU's recommendation system)
  static async findByPersonality(personalityTypes, limit = 10) {
    const query = `
      SELECT e.*, v.name as venue_full_name, v.type as venue_type, v.tier as venue_tier
      FROM exhibitions_unified e
      LEFT JOIN venues_unified v ON e.venue_id = v.id
      WHERE e.personality_matches && $1
      AND e.status IN ('upcoming', 'ongoing')
      AND e.verification_status = 'verified'
      AND e.visibility = 'public'
      ORDER BY e.recommendation_score DESC, e.featured DESC
      LIMIT $2`;

    const result = await pool.query(query, [personalityTypes, limit]);
    return result.rows;
  }

  // Delete exhibition (soft delete)
  static async delete(id) {
    const query = `
      UPDATE exhibitions_unified 
      SET visibility = 'private', status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *`;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = UnifiedExhibitionModel;