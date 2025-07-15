const { pool } = require('../config/database');
const crypto = require('crypto');

class ExhibitionSubmissionModel {
  // Create submission
  static async create(submissionData) {
    const {
      submitterId, submitterType, submitterEmail, submitterName, submitterPhone,
      exhibitionTitle, venueName, venueAddress, startDate, endDate, artists,
      description, officialUrl, posterImageUrl, uploadedImages, admissionFee,
      openingEvent, ipAddress, userAgent, source
    } = submissionData;

    // Generate duplicate checksum
    const checksumData = `${exhibitionTitle}-${venueName}-${startDate}`;
    const duplicateChecksum = crypto.createHash('md5').update(checksumData).digest('hex');

    const query = `
      INSERT INTO exhibition_submissions (
        submitter_id, submitter_type, submitter_email, submitter_name, submitter_phone,
        exhibition_title, venue_name, venue_address, start_date, end_date, artists,
        description, official_url, poster_image_url, uploaded_images, admission_fee,
        opening_event, ip_address, user_agent, source, duplicate_checksum
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21
      ) RETURNING *`;

    const values = [
      submitterId, submitterType || 'user', submitterEmail, submitterName,
      submitterPhone, exhibitionTitle, venueName, venueAddress, startDate,
      endDate, artists, description, officialUrl, posterImageUrl,
      JSON.stringify(uploadedImages || []), admissionFee,
      JSON.stringify(openingEvent || null), ipAddress, userAgent,
      source || 'web', duplicateChecksum
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Check for duplicate submission
  static async checkDuplicate(exhibitionTitle, venueName, startDate) {
    const checksumData = `${exhibitionTitle}-${venueName}-${startDate}`;
    const checksum = crypto.createHash('md5').update(checksumData).digest('hex');

    const query = `
      SELECT * FROM exhibition_submissions 
      WHERE duplicate_checksum = $1 
      AND verification_status IN ('pending', 'reviewing', 'approved')`;
    
    const result = await pool.query(query, [checksum]);
    return result.rows[0];
  }

  // Find by ID
  static async findById(id) {
    const query = 'SELECT * FROM exhibition_submissions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find user submissions
  static async findByUser(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    // Count query
    const countQuery = 'SELECT COUNT(*) FROM exhibition_submissions WHERE submitter_id = $1';
    const countResult = await pool.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].count);

    // Data query
    const dataQuery = `
      SELECT * FROM exhibition_submissions 
      WHERE submitter_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3`;
    
    const dataResult = await pool.query(dataQuery, [userId, limit, offset]);

    return {
      submissions: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update submission status
  static async updateStatus(id, status, verifierId, note) {
    const query = `
      UPDATE exhibition_submissions 
      SET verification_status = $1, 
          verified_by = $2, 
          verification_note = $3,
          verified_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *`;
    
    const result = await pool.query(query, [status, verifierId, note, id]);
    return result.rows[0];
  }

  // Award points
  static async awardPoints(id, points) {
    const query = `
      UPDATE exhibition_submissions 
      SET points_awarded = points_awarded + $1 
      WHERE id = $2 
      RETURNING points_awarded`;
    
    const result = await pool.query(query, [points, id]);
    return result.rows[0];
  }

  // Link to exhibition
  static async linkToExhibition(submissionId, exhibitionId) {
    const query = `
      UPDATE exhibition_submissions 
      SET exhibition_id = $1 
      WHERE id = $2 
      RETURNING *`;
    
    const result = await pool.query(query, [exhibitionId, submissionId]);
    return result.rows[0];
  }

  // Get pending submissions
  static async getPending(limit = 20) {
    const query = `
      SELECT * FROM exhibition_submissions 
      WHERE verification_status = 'pending' 
      ORDER BY created_at ASC 
      LIMIT $1`;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // Calculate spam score
  static async calculateSpamScore(submission) {
    let score = 0;

    // Check for suspicious patterns
    if (!submission.official_url && !submission.poster_image_url) {
      score += 0.3;
    }

    // Check for very short descriptions
    if (submission.description && submission.description.length < 20) {
      score += 0.2;
    }

    // Check for unrealistic date ranges
    const startDate = new Date(submission.start_date);
    const endDate = new Date(submission.end_date);
    const duration = (endDate - startDate) / (1000 * 60 * 60 * 24);
    
    if (duration > 365 || duration < 1) {
      score += 0.4;
    }

    // Update spam score
    await pool.query(
      'UPDATE exhibition_submissions SET spam_score = $1 WHERE id = $2',
      [Math.min(score, 1), submission.id]
    );

    return score;
  }
}

module.exports = ExhibitionSubmissionModel;