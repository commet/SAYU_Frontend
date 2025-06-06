const { pool } = require('../config/database');
const logger = require('../utils/logger');

class ArtistPortalService {
  // Artist Profile Management
  async createArtistProfile(userId, profileData) {
    const {
      artist_name,
      bio,
      website_url,
      social_links = {},
      contact_email,
      phone,
      address,
      specialties = [],
      profile_image_url,
      banner_image_url
    } = profileData;

    const query = `
      INSERT INTO artist_profiles (
        user_id, artist_name, bio, website_url, social_links, 
        contact_email, phone, address, specialties, 
        profile_image_url, banner_image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId, artist_name, bio, website_url, social_links,
      contact_email, phone, address, specialties,
      profile_image_url, banner_image_url
    ]);

    return result.rows[0];
  }

  async updateArtistProfile(profileId, userId, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'artist_name', 'bio', 'website_url', 'social_links',
      'contact_email', 'phone', 'address', 'specialties',
      'profile_image_url', 'banner_image_url'
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(updateData[field]);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(profileId, userId);

    const query = `
      UPDATE artist_profiles 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getArtistProfile(userId) {
    const query = `
      SELECT ap.*, 
             COUNT(sa.id) as submitted_artworks_count,
             COUNT(CASE WHEN sa.submission_status = 'approved' THEN 1 END) as approved_artworks_count
      FROM artist_profiles ap
      LEFT JOIN submitted_artworks sa ON ap.id = sa.artist_profile_id
      WHERE ap.user_id = $1
      GROUP BY ap.id
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Gallery Profile Management
  async createGalleryProfile(userId, profileData) {
    const {
      gallery_name,
      description,
      website_url,
      contact_email,
      phone,
      address,
      opening_hours,
      gallery_type = 'independent',
      established_year,
      specializations = [],
      profile_image_url,
      banner_image_url
    } = profileData;

    const query = `
      INSERT INTO gallery_profiles (
        user_id, gallery_name, description, website_url, contact_email,
        phone, address, opening_hours, gallery_type, established_year,
        specializations, profile_image_url, banner_image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId, gallery_name, description, website_url, contact_email,
      phone, address, opening_hours, gallery_type, established_year,
      specializations, profile_image_url, banner_image_url
    ]);

    return result.rows[0];
  }

  async updateGalleryProfile(profileId, userId, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'gallery_name', 'description', 'website_url', 'contact_email',
      'phone', 'address', 'opening_hours', 'gallery_type',
      'established_year', 'specializations', 'profile_image_url', 'banner_image_url'
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(updateData[field]);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(profileId, userId);

    const query = `
      UPDATE gallery_profiles 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getGalleryProfile(userId) {
    const query = `
      SELECT gp.*,
             COUNT(DISTINCT sa.id) as submitted_artworks_count,
             COUNT(DISTINCT se.id) as submitted_exhibitions_count,
             COUNT(DISTINCT CASE WHEN sa.submission_status = 'approved' THEN sa.id END) as approved_artworks_count,
             COUNT(DISTINCT CASE WHEN se.submission_status = 'approved' THEN se.id END) as approved_exhibitions_count
      FROM gallery_profiles gp
      LEFT JOIN submitted_artworks sa ON gp.id = sa.gallery_profile_id
      LEFT JOIN submitted_exhibitions se ON gp.id = se.gallery_profile_id
      WHERE gp.user_id = $1
      GROUP BY gp.id
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Artwork Submission Management
  async submitArtwork(profileId, profileType, artworkData) {
    const {
      title,
      artist_display_name,
      creation_date,
      medium,
      dimensions,
      description,
      technique,
      style,
      subject_matter = [],
      color_palette = [],
      primary_image_url,
      additional_images = [],
      price_range,
      availability_status = 'available',
      exhibition_history,
      provenance,
      condition_report,
      tags = [],
      metadata = {}
    } = artworkData;

    const artistProfileId = profileType === 'artist' ? profileId : null;
    const galleryProfileId = profileType === 'gallery' ? profileId : null;

    const query = `
      INSERT INTO submitted_artworks (
        artist_profile_id, gallery_profile_id, title, artist_display_name,
        creation_date, medium, dimensions, description, technique, style,
        subject_matter, color_palette, primary_image_url, additional_images,
        price_range, availability_status, exhibition_history, provenance,
        condition_report, tags, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;

    const result = await pool.query(query, [
      artistProfileId, galleryProfileId, title, artist_display_name,
      creation_date, medium, dimensions, description, technique, style,
      subject_matter, color_palette, primary_image_url, additional_images,
      price_range, availability_status, exhibition_history, provenance,
      condition_report, tags, metadata
    ]);

    return result.rows[0];
  }

  async getSubmittedArtworks(profileId, profileType, status = null) {
    const profileColumn = profileType === 'artist' ? 'artist_profile_id' : 'gallery_profile_id';
    
    let query = `
      SELECT sa.*,
             ${profileType === 'artist' ? 'ap.artist_name as profile_name' : 'gp.gallery_name as profile_name'}
      FROM submitted_artworks sa
      ${profileType === 'artist' ? 
        'LEFT JOIN artist_profiles ap ON sa.artist_profile_id = ap.id' :
        'LEFT JOIN gallery_profiles gp ON sa.gallery_profile_id = gp.id'
      }
      WHERE sa.${profileColumn} = $1
    `;

    const params = [profileId];

    if (status) {
      query += ' AND sa.submission_status = $2';
      params.push(status);
    }

    query += ' ORDER BY sa.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async updateArtworkSubmission(artworkId, profileId, profileType, updateData) {
    const profileColumn = profileType === 'artist' ? 'artist_profile_id' : 'gallery_profile_id';
    
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'title', 'artist_display_name', 'creation_date', 'medium', 'dimensions',
      'description', 'technique', 'style', 'subject_matter', 'color_palette',
      'primary_image_url', 'additional_images', 'price_range', 'availability_status',
      'exhibition_history', 'provenance', 'condition_report', 'tags', 'metadata'
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(updateData[field]);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(artworkId, profileId);

    const query = `
      UPDATE submitted_artworks 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount} AND ${profileColumn} = $${paramCount + 1}
      AND submission_status = 'pending'
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Exhibition Submission Management (for galleries)
  async submitExhibition(galleryProfileId, exhibitionData) {
    const {
      title,
      description,
      curator_name,
      start_date,
      end_date,
      opening_reception,
      exhibition_type = 'group',
      theme,
      featured_artists = [],
      artwork_ids = [],
      poster_image_url,
      gallery_images = [],
      press_release,
      catalog_url,
      ticket_info,
      accessibility_info,
      special_events = [],
      tags = []
    } = exhibitionData;

    const query = `
      INSERT INTO submitted_exhibitions (
        gallery_profile_id, title, description, curator_name, start_date,
        end_date, opening_reception, exhibition_type, theme, featured_artists,
        artwork_ids, poster_image_url, gallery_images, press_release,
        catalog_url, ticket_info, accessibility_info, special_events, tags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const result = await pool.query(query, [
      galleryProfileId, title, description, curator_name, start_date,
      end_date, opening_reception, exhibition_type, theme, featured_artists,
      artwork_ids, poster_image_url, gallery_images, press_release,
      catalog_url, ticket_info, accessibility_info, special_events, tags
    ]);

    return result.rows[0];
  }

  async getSubmittedExhibitions(galleryProfileId, status = null) {
    let query = `
      SELECT se.*, gp.gallery_name
      FROM submitted_exhibitions se
      LEFT JOIN gallery_profiles gp ON se.gallery_profile_id = gp.id
      WHERE se.gallery_profile_id = $1
    `;

    const params = [galleryProfileId];

    if (status) {
      query += ' AND se.submission_status = $2';
      params.push(status);
    }

    query += ' ORDER BY se.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Admin/Review Functions
  async getPendingSubmissions(type = null) {
    if (type === 'artworks') {
      const query = `
        SELECT sa.*, 
               COALESCE(ap.artist_name, gp.gallery_name) as submitter_name,
               CASE WHEN ap.id IS NOT NULL THEN 'artist' ELSE 'gallery' END as submitter_type
        FROM submitted_artworks sa
        LEFT JOIN artist_profiles ap ON sa.artist_profile_id = ap.id
        LEFT JOIN gallery_profiles gp ON sa.gallery_profile_id = gp.id
        WHERE sa.submission_status = 'pending'
        ORDER BY sa.created_at ASC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    }

    if (type === 'exhibitions') {
      const query = `
        SELECT se.*, gp.gallery_name as submitter_name
        FROM submitted_exhibitions se
        LEFT JOIN gallery_profiles gp ON se.gallery_profile_id = gp.id
        WHERE se.submission_status = 'pending'
        ORDER BY se.created_at ASC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    }

    // Return both if no type specified
    const artworksQuery = `
      SELECT 'artwork' as type, sa.id, sa.title, sa.created_at,
             COALESCE(ap.artist_name, gp.gallery_name) as submitter_name
      FROM submitted_artworks sa
      LEFT JOIN artist_profiles ap ON sa.artist_profile_id = ap.id
      LEFT JOIN gallery_profiles gp ON sa.gallery_profile_id = gp.id
      WHERE sa.submission_status = 'pending'
    `;

    const exhibitionsQuery = `
      SELECT 'exhibition' as type, se.id, se.title, se.created_at,
             gp.gallery_name as submitter_name
      FROM submitted_exhibitions se
      LEFT JOIN gallery_profiles gp ON se.gallery_profile_id = gp.id
      WHERE se.submission_status = 'pending'
    `;

    const query = `${artworksQuery} UNION ALL ${exhibitionsQuery} ORDER BY created_at ASC`;
    
    const result = await pool.query(query);
    return result.rows;
  }

  async reviewSubmission(submissionType, submissionId, reviewerId, reviewData) {
    const { status, review_notes, quality_score, feedback = {} } = reviewData;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update submission status
      const tableName = submissionType === 'artwork' ? 'submitted_artworks' : 'submitted_exhibitions';
      const updateQuery = `
        UPDATE ${tableName}
        SET submission_status = $1, review_notes = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP,
            ${status === 'approved' ? 'approved_at = CURRENT_TIMESTAMP,' : ''}
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `;
      
      const updateResult = await client.query(updateQuery, [status, review_notes, reviewerId, submissionId]);
      
      // Create review record
      const reviewQuery = `
        INSERT INTO submission_reviews (
          submission_type, submission_id, reviewer_id, status, 
          review_notes, quality_score, feedback
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      await client.query(reviewQuery, [
        submissionType, submissionId, reviewerId, status,
        review_notes, quality_score, feedback
      ]);
      
      await client.query('COMMIT');
      
      logger.info(`${submissionType} submission ${submissionId} reviewed: ${status}`);
      return updateResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Statistics
  async getPortalStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM artist_profiles WHERE status = 'approved') as active_artists,
        (SELECT COUNT(*) FROM gallery_profiles WHERE status = 'approved') as active_galleries,
        (SELECT COUNT(*) FROM submitted_artworks WHERE submission_status = 'pending') as pending_artworks,
        (SELECT COUNT(*) FROM submitted_exhibitions WHERE submission_status = 'pending') as pending_exhibitions,
        (SELECT COUNT(*) FROM submitted_artworks WHERE submission_status = 'approved') as approved_artworks,
        (SELECT COUNT(*) FROM submitted_exhibitions WHERE submission_status = 'approved') as approved_exhibitions
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = new ArtistPortalService();