const { pool } = require('../config/database');
const ExhibitionMatchingService = require('../services/exhibitionMatchingService');
const rateLimit = require('../middleware/rateLimiter');

class MatchingController {
  constructor() {
    this.matchingService = new ExhibitionMatchingService();
  }

  // ==================== 기존 목적별 매칭 (레거시) ====================

  async getCompatibleUsers(req, res) {
    try {
      const { userId } = req;
      const { purpose } = req.query;

      // Get current user info
      const currentUserQuery = `
        SELECT u.*, up.type_code, up.archetype_name 
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1
      `;
      const currentUserResult = await pool.query(currentUserQuery, [userId]);
      const currentUser = currentUserResult.rows[0];

      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const targetPurpose = purpose || currentUser.user_purpose || 'exploring';

      // Simple matching logic based on purpose
      let compatibleUsersQuery;
      const queryParams = [userId];

      switch (targetPurpose) {
        case 'dating':
          compatibleUsersQuery = `
            SELECT u.id, u.nickname, u.age, u.user_purpose, up.type_code, up.archetype_name, up.generated_image_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id != $1 
            AND u.user_purpose = 'dating'
            AND u.age IS NOT NULL
            ORDER BY u.created_at DESC
            LIMIT 20
          `;
          break;
        case 'family':
          compatibleUsersQuery = `
            SELECT u.id, u.nickname, u.age, u.user_purpose, up.type_code, up.archetype_name, up.generated_image_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id != $1 
            AND u.user_purpose IN ('family', 'social')
            ORDER BY u.created_at DESC
            LIMIT 20
          `;
          break;
        case 'professional':
          compatibleUsersQuery = `
            SELECT u.id, u.nickname, u.age, u.user_purpose, up.type_code, up.archetype_name, up.generated_image_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id != $1 
            AND u.user_purpose IN ('professional', 'exploring')
            AND up.type_code IS NOT NULL
            ORDER BY u.created_at DESC
            LIMIT 20
          `;
          break;
        case 'social':
          compatibleUsersQuery = `
            SELECT u.id, u.nickname, u.age, u.user_purpose, up.type_code, up.archetype_name, up.generated_image_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id != $1 
            AND u.user_purpose IN ('social', 'exploring', 'family')
            ORDER BY u.created_at DESC
            LIMIT 20
          `;
          break;
        default: // exploring
          compatibleUsersQuery = `
            SELECT u.id, u.nickname, u.age, u.user_purpose, up.type_code, up.archetype_name, up.generated_image_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id != $1 
            ORDER BY u.created_at DESC
            LIMIT 20
          `;
      }

      const result = await pool.query(compatibleUsersQuery, queryParams);

      res.json({
        purpose: targetPurpose,
        users: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Get compatible users error:', error);
      res.status(500).json({ error: 'Failed to fetch compatible users' });
    }
  }

  async getUsersByPurpose(req, res) {
    try {
      const { purpose } = req.params;
      const { userId } = req;

      const validPurposes = ['exploring', 'dating', 'social', 'family', 'professional'];
      if (!validPurposes.includes(purpose)) {
        return res.status(400).json({ error: 'Invalid purpose' });
      }

      const query = `
        SELECT u.id, u.nickname, u.age, u.user_purpose, up.type_code, up.archetype_name, up.generated_image_url
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id != $1 
        AND u.user_purpose = $2
        ORDER BY u.created_at DESC
        LIMIT 50
      `;

      const result = await pool.query(query, [userId, purpose]);

      res.json({
        purpose,
        users: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Get users by purpose error:', error);
      res.status(500).json({ error: 'Failed to fetch users by purpose' });
    }
  }

  // ==================== 전시 동행 매칭 시스템 ====================

  async createExhibitionMatch(req, res) {
    try {
      const { userId } = req;
      const {
        exhibitionId,
        preferredDate,
        timeSlot,
        preferredAptTypes,
        ageRange,
        genderPreference,
        maxDistance,
        language,
        interests,
        experienceLevel
      } = req.body;

      // 입력 검증
      if (!exhibitionId || !preferredDate || !timeSlot) {
        return res.status(400).json({
          error: 'Exhibition ID, preferred date, and time slot are required'
        });
      }

      const validTimeSlots = ['morning', 'afternoon', 'evening'];
      if (!validTimeSlots.includes(timeSlot)) {
        return res.status(400).json({
          error: 'Invalid time slot. Must be morning, afternoon, or evening'
        });
      }

      const matchData = {
        exhibitionId,
        preferredDate: new Date(preferredDate),
        timeSlot,
        preferredAptTypes,
        ageRange: ageRange || { min: 18, max: 99 },
        genderPreference: genderPreference || 'any',
        maxDistance: maxDistance || 50,
        language: language || ['korean'],
        interests: interests || [],
        experienceLevel: experienceLevel || 'any'
      };

      const matchRequest = await this.matchingService.createMatchRequest(userId, matchData);

      res.status(201).json({
        success: true,
        matchRequest: {
          id: matchRequest.id,
          exhibitionId: matchRequest.exhibition_id,
          preferredDate: matchRequest.preferred_date,
          timeSlot: matchRequest.time_slot,
          status: matchRequest.status,
          expiresAt: matchRequest.expires_at,
          createdAt: matchRequest.created_at
        }
      });

    } catch (error) {
      console.error('Create exhibition match error:', error);

      if (error.message.includes('already have an open match request')) {
        return res.status(409).json({ error: error.message });
      }

      res.status(500).json({ error: 'Failed to create match request' });
    }
  }

  async findExhibitionMatches(req, res) {
    try {
      const { matchRequestId } = req.params;
      const { userId } = req;

      if (!matchRequestId) {
        return res.status(400).json({ error: 'Match request ID is required' });
      }

      // 요청자 권한 확인
      const requestCheck = await pool.query(
        'SELECT host_user_id FROM exhibition_matches WHERE id = $1',
        [matchRequestId]
      );

      if (requestCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Match request not found' });
      }

      if (requestCheck.rows[0].host_user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized to view this match request' });
      }

      const matches = await this.matchingService.findCompatibleMatches(matchRequestId);

      res.json({
        success: true,
        matchRequestId,
        matches: matches.map(match => ({
          id: match.id,
          nickname: match.nickname,
          age: match.age,
          aptType: match.type_code,
          archetype: match.archetype_name,
          imageUrl: match.generated_image_url,
          matchScore: match.matchScore,
          distanceKm: Math.round(match.distance_km * 10) / 10,
          learningAdjustment: match.learningAdjustment || 0
        })),
        total: matches.length
      });

    } catch (error) {
      console.error('Find exhibition matches error:', error);
      res.status(500).json({ error: 'Failed to find matches' });
    }
  }

  async acceptExhibitionMatch(req, res) {
    try {
      const { matchRequestId, candidateUserId } = req.body;
      const { userId } = req;

      if (!matchRequestId || !candidateUserId) {
        return res.status(400).json({
          error: 'Match request ID and candidate user ID are required'
        });
      }

      const result = await this.matchingService.acceptMatch(
        matchRequestId,
        candidateUserId,
        userId
      );

      res.json({
        success: true,
        message: 'Match accepted successfully',
        matchId: result.matchId
      });

    } catch (error) {
      console.error('Accept exhibition match error:', error);

      if (error.message.includes('not found or no longer available')) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ error: error.message });
      }

      res.status(500).json({ error: 'Failed to accept match' });
    }
  }

  async rejectExhibitionMatch(req, res) {
    try {
      const { matchRequestId, candidateUserId } = req.body;
      const { userId } = req;

      if (!matchRequestId || !candidateUserId) {
        return res.status(400).json({
          error: 'Match request ID and candidate user ID are required'
        });
      }

      await this.matchingService.rejectMatch(
        matchRequestId,
        candidateUserId,
        userId
      );

      res.json({
        success: true,
        message: 'Match rejected successfully'
      });

    } catch (error) {
      console.error('Reject exhibition match error:', error);
      res.status(500).json({ error: 'Failed to reject match' });
    }
  }

  async getMyExhibitionMatches(req, res) {
    try {
      const { userId } = req;
      const { status, limit = 20, offset = 0 } = req.query;

      let statusFilter = '';
      const queryParams = [userId, parseInt(limit), parseInt(offset)];

      if (status && ['open', 'matched', 'completed', 'cancelled'].includes(status)) {
        statusFilter = 'AND em.status = $4';
        queryParams.push(status);
      }

      const query = `
        SELECT 
          em.*,
          gv.name as exhibition_name,
          gv.location as exhibition_location,
          gv.image_url as exhibition_image,
          u2.nickname as matched_user_nickname,
          up2.type_code as matched_user_apt_type,
          up2.generated_image_url as matched_user_image
        FROM exhibition_matches em
        LEFT JOIN global_venues gv ON em.exhibition_id = gv.id
        LEFT JOIN users u2 ON em.matched_user_id = u2.id
        LEFT JOIN user_profiles up2 ON u2.id = up2.user_id
        WHERE (em.host_user_id = $1 OR em.matched_user_id = $1)
        ${statusFilter}
        ORDER BY em.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await pool.query(query, queryParams);

      res.json({
        success: true,
        matches: result.rows.map(match => ({
          id: match.id,
          exhibitionId: match.exhibition_id,
          exhibitionName: match.exhibition_name,
          exhibitionLocation: match.exhibition_location,
          exhibitionImage: match.exhibition_image,
          preferredDate: match.preferred_date,
          timeSlot: match.time_slot,
          status: match.status,
          isHost: match.host_user_id === userId,
          matchedUser: match.matched_user_id ? {
            nickname: match.matched_user_nickname,
            aptType: match.matched_user_apt_type,
            imageUrl: match.matched_user_image
          } : null,
          matchedAt: match.matched_at,
          expiresAt: match.expires_at,
          createdAt: match.created_at
        })),
        total: result.rows.length
      });

    } catch (error) {
      console.error('Get my exhibition matches error:', error);
      res.status(500).json({ error: 'Failed to fetch your matches' });
    }
  }

  async getMatchingAnalytics(req, res) {
    try {
      const { userId } = req;

      const analytics = await this.matchingService.getMatchingAnalytics(userId);

      res.json({
        success: true,
        analytics: {
          totalRequests: parseInt(analytics.matchingStats.total_requests) || 0,
          successfulMatches: parseInt(analytics.matchingStats.successful_matches) || 0,
          completedMatches: parseInt(analytics.matchingStats.completed_matches) || 0,
          averageMatchTimeHours: parseFloat(analytics.matchingStats.avg_match_time_hours) || 0,
          averageRating: parseFloat(analytics.feedbackStats.avg_rating) || 0,
          totalFeedback: parseInt(analytics.feedbackStats.total_feedback) || 0,
          successRate: analytics.matchingStats.total_requests > 0 ?
            Math.round((analytics.matchingStats.successful_matches / analytics.matchingStats.total_requests) * 100) : 0
        }
      });

    } catch (error) {
      console.error('Get matching analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }

  // ==================== APT 호환성 조회 ====================

  async getAptCompatibility(req, res) {
    try {
      const { userId } = req;
      const { targetAptType } = req.params;

      // 사용자 APT 조회
      const userProfile = await pool.query(`
        SELECT up.type_code 
        FROM user_profiles up 
        WHERE up.user_id = $1
      `, [userId]);

      if (userProfile.rows.length === 0) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      const userAptType = userProfile.rows[0].type_code;

      if (!userAptType) {
        return res.status(400).json({ error: 'User has not completed APT test' });
      }

      const compatibility = this.matchingService.compatibilityMatrix[userAptType][targetAptType];

      if (compatibility === undefined) {
        return res.status(400).json({ error: 'Invalid target APT type' });
      }

      res.json({
        success: true,
        userAptType,
        targetAptType,
        compatibilityScore: compatibility,
        compatibilityLevel: this.getCompatibilityLevel(compatibility)
      });

    } catch (error) {
      console.error('Get APT compatibility error:', error);
      res.status(500).json({ error: 'Failed to fetch compatibility' });
    }
  }

  getCompatibilityLevel(score) {
    if (score >= 90) return 'perfect';
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 50) return 'moderate';
    return 'low';
  }
}

module.exports = new MatchingController();
