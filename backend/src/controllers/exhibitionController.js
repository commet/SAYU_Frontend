const { pool } = require('../config/database');
const { body, validationResult } = require('express-validator');
const { log } = require('../config/logger');
const UnifiedExhibitionModel = require('../models/unifiedExhibitionModel');
const UnifiedVenueModel = require('../models/unifiedVenueModel');
const ExhibitionSubmissionModel = require('../models/exhibitionSubmissionModel');

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
        venue_id,
        search,
        sort = 'created_at',
        order = 'desc'
      } = req.query;

      // 페이지네이션 설정
      const offset = (page - 1) * limit;

      // Use unified model for filtering and pagination
      const filters = {};
      if (status) filters.status = status;
      if (city) filters.city = city;
      if (venue_id) filters.venueId = venue_id;
      if (search) filters.search = search;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        orderBy: sort === 'views' ? 'view_count' : sort,
        order: order.toUpperCase()
      };

      const result = await UnifiedExhibitionModel.find(filters, options);
      
      // Get status statistics
      const stats = await UnifiedExhibitionModel.getStatistics();

      const response = {
        success: true,
        data: result.exhibitions,
        pagination: result.pagination,
        stats: {
          ongoing: stats.ongoing_count || 0,
          upcoming: stats.upcoming_count || 0,
          ended: stats.ended_count || 0,
          total: stats.total_count || 0
        }
      };

      // 캐시에 저장
      setCache(cacheKey, response);

      res.json(response);

    } catch (error) {
      console.error('Error in getExhibitions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get single exhibition
  async getExhibition(req, res) {
    try {
      const { id } = req.params;

      const exhibition = await UnifiedExhibitionModel.findById(id);

      if (!exhibition) {
        return res.status(404).json({
          success: false,
          message: 'Exhibition not found'
        });
      }

      // 조회수 증가
      await UnifiedExhibitionModel.incrementViewCount(id);

      res.json({
        success: true,
        data: exhibition
      });

    } catch (error) {
      console.error('Error in getExhibition:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Submit new exhibition (user submission)
  async submitExhibition(req, res) {
    try {
      const {
        exhibitionTitle,
        venueName,
        venueAddress,
        startDate,
        endDate,
        artists,
        description,
        officialUrl,
        posterImageUrl,
        admissionFee,
        openingEvent,
        submitterName,
        submitterEmail,
        submitterPhone
      } = req.body;

      // Validate required fields
      if (!exhibitionTitle || !venueName || !startDate || !endDate || !submitterEmail) {
        return res.status(400).json({
          error: 'Missing required fields: exhibitionTitle, venueName, startDate, endDate, submitterEmail'
        });
      }

      // Check for duplicate submission
      const existingSubmission = await ExhibitionSubmissionModel.checkDuplicate(
        exhibitionTitle,
        venueName,
        startDate
      );

      if (existingSubmission) {
        return res.status(409).json({
          error: 'This exhibition has already been submitted',
          submissionId: existingSubmission.id
        });
      }

      // Create submission
      const submission = await ExhibitionSubmissionModel.create({
        exhibitionTitle,
        venueName,
        venueAddress,
        startDate,
        endDate,
        artists,
        description,
        officialUrl,
        posterImageUrl,
        admissionFee,
        openingEvent,
        submitterName,
        submitterEmail,
        submitterPhone,
        submitterId: req.user?.id,
        submitterType: req.user ? 'user' : 'anonymous',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        source: 'web'
      });

      // Award initial points if user is logged in
      if (req.user) {
        // Award points to user
        await pool.query(
          'UPDATE users SET points = COALESCE(points, 0) + 100 WHERE id = $1',
          [req.user.id]
        );

        await ExhibitionSubmissionModel.awardPoints(submission.id, 100);
      }

      res.status(201).json({
        message: 'Exhibition submitted successfully. It will be reviewed shortly.',
        submissionId: submission.id,
        pointsAwarded: req.user ? 100 : 0
      });
    } catch (error) {
      console.error('Submit exhibition error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get user's submissions
  async getUserSubmissions(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { page = 1, limit = 10 } = req.query;

      const result = await ExhibitionSubmissionModel.findByUser(req.user.id, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json(result);
    } catch (error) {
      console.error('Get user submissions error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Admin: Review submission
  async reviewSubmission(req, res) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      if (!['approved', 'rejected', 'duplicate'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const submission = await ExhibitionSubmissionModel.findById(id);
      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      // Update submission status
      await ExhibitionSubmissionModel.updateStatus(id, status, req.user.id, note);

      if (status === 'approved') {
        // Find or create venue
        let venue = await UnifiedVenueModel.findByName(submission.venue_name);

        if (!venue) {
          venue = await UnifiedVenueModel.create({
            name: submission.venue_name,
            address: submission.venue_address || 'Unknown',
            city: 'Seoul', // Default, should be extracted from address
            country: 'KR',
            type: 'gallery' // Default
          });
        }

        // Parse artists
        const artists = submission.artists
          ? submission.artists.split(',').map(a => ({ name: a.trim() }))
          : [];

        // Create exhibition
        const exhibition = await UnifiedExhibitionModel.create({
          title: submission.exhibition_title,
          description: submission.description,
          venueId: venue.id,
          venueName: venue.name,
          venueCity: venue.city,
          venueCountry: venue.country,
          startDate: submission.start_date,
          endDate: submission.end_date,
          artists,
          officialUrl: submission.official_url,
          posterImage: submission.poster_image_url,
          admissionFee: parseInt(submission.admission_fee) || 0,
          source: 'user_submission',
          submittedBy: submission.submitter_id,
          verificationStatus: 'verified',
          verifiedBy: req.user.id,
          verifiedAt: new Date()
        });

        // Link submission to exhibition
        await ExhibitionSubmissionModel.linkToExhibition(id, exhibition.id);

        // Award additional points
        if (submission.submitter_id) {
          await pool.query(
            'UPDATE users SET points = COALESCE(points, 0) + 400 WHERE id = $1',
            [submission.submitter_id]
          );

          await ExhibitionSubmissionModel.awardPoints(id, 400);
        }

        // Increment venue exhibition count
        await UnifiedVenueModel.incrementExhibitionCount(venue.id);
      }

      res.json({
        message: `Submission ${status}`,
        submissionId: id
      });
    } catch (error) {
      console.error('Review submission error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Admin: Trigger exhibition collection
  async collectExhibitions(req, res) {
    try {
      const { includeNaver = true, includeInstagram = false, includeScraping = false } = req.body;

      const results = await exhibitionCollectorService.collectExhibitions({
        includeNaver,
        includeInstagram,
        includeScraping
      });

      res.json({
        message: 'Exhibition collection completed',
        results
      });
    } catch (error) {
      console.error('Collect exhibitions error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get trending exhibitions
  async getTrendingExhibitions(req, res) {
    try {
      const exhibitions = await UnifiedExhibitionModel.getTrending(10);
      res.json({
        success: true,
        data: exhibitions
      });
    } catch (error) {
      console.error('Get trending exhibitions error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Get upcoming exhibitions
  async getUpcomingExhibitions(req, res) {
    try {
      const { days = 7 } = req.query;
      const exhibitions = await UnifiedExhibitionModel.getUpcoming(parseInt(days));
      res.json({
        success: true,
        data: exhibitions
      });
    } catch (error) {
      console.error('Get upcoming exhibitions error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Get venues
  async getVenues(req, res) {
    try {
      const { city, country = 'KR', type, category, tier, search, limit = 50 } = req.query;

      const filters = {};
      if (city) filters.city = city;
      if (country) filters.country = country;
      if (type) filters.type = type;
      if (category) filters.category = category;
      if (tier) filters.tier = parseInt(tier);
      if (search) filters.search = search;

      const options = {
        limit: parseInt(limit),
        orderBy: 'name',
        order: 'ASC'
      };

      const result = await UnifiedVenueModel.find(filters, options);

      res.json({
        success: true,
        data: result.venues,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Get venues error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // 전시 좋아요/좋아요 취소
  async likeExhibition(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // 이미 좋아요 했는지 확인
      const checkResult = await pool.query(
        'SELECT id FROM exhibition_likes WHERE exhibition_id = $1 AND user_id = $2',
        [id, userId]
      );

      if (checkResult.rows.length > 0) {
        // 좋아요 취소
        await pool.query(
          'DELETE FROM exhibition_likes WHERE exhibition_id = $1 AND user_id = $2',
          [id, userId]
        );

        res.json({
          success: true,
          message: 'Like removed',
          liked: false
        });
      } else {
        // 좋아요 추가
        await pool.query(
          'INSERT INTO exhibition_likes (exhibition_id, user_id) VALUES ($1, $2)',
          [id, userId]
        );

        res.json({
          success: true,
          message: 'Like added',
          liked: true
        });
      }

    } catch (error) {
      console.error('Error in likeExhibition:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // 전시 제출
  async submitExhibition(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const {
        title,
        venue_name,
        venue_city,
        venue_country = 'KR',
        start_date,
        end_date,
        description,
        artists,
        admission_fee,
        source_url,
        contact_info
      } = req.body;

      // 필수 필드 검증
      if (!title || !venue_name || !venue_city || !start_date || !end_date || !source_url) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // 중복 제출 체크
      const existingResult = await pool.query(
        'SELECT id FROM exhibition_submissions WHERE title = $1 AND venue_name = $2 AND start_date = $3 AND submitted_by = $4',
        [title, venue_name, start_date, userId]
      );

      if (existingResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Exhibition already submitted'
        });
      }

      // 제출 데이터 저장
      const insertResult = await pool.query(
        `INSERT INTO exhibition_submissions 
         (title, venue_name, venue_city, venue_country, start_date, end_date, description, 
          artists, admission_fee, source_url, contact_info, submitted_by, submission_status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
         RETURNING *`,
        [title, venue_name, venue_city, venue_country, start_date, end_date, description,
          JSON.stringify(artists || []), admission_fee || 0, source_url, contact_info, userId, 'pending']
      );

      const submission = insertResult.rows[0];

      res.status(201).json({
        success: true,
        message: 'Exhibition submitted successfully',
        data: submission
      });

    } catch (error) {
      console.error('Error in submitExhibition:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // 도시별 전시 통계
  async getCityStats(req, res) {
    try {
      const result = await pool.query('SELECT venue_city, status FROM exhibitions_unified WHERE visibility = \'public\'');

      const cityStats = result.rows.reduce((acc, ex) => {
        if (!acc[ex.venue_city]) {
          acc[ex.venue_city] = {
            total: 0,
            ongoing: 0,
            upcoming: 0,
            ended: 0
          };
        }
        acc[ex.venue_city].total++;
        acc[ex.venue_city][ex.status]++;
        return acc;
      }, {});

      res.json({
        success: true,
        data: cityStats
      });

    } catch (error) {
      console.error('Error in getCityStats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // 인기 전시 조회
  async getPopularExhibitions(req, res) {
    try {
      const { limit = 10 } = req.query;

      const exhibitions = await UnifiedExhibitionModel.getTrending(parseInt(limit));

      res.json({
        success: true,
        data: exhibitions
      });

    } catch (error) {
      console.error('Error in getPopularExhibitions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // 진행중인 전시 조회 (새로운 API)
  async getOngoingExhibitions(req, res) {
    try {
      const { limit = 20 } = req.query;
      const exhibitions = await UnifiedExhibitionModel.getOngoing(parseInt(limit));
      
      res.json({
        success: true,
        data: exhibitions
      });
    } catch (error) {
      console.error('Error in getOngoingExhibitions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // 개성별 추천 전시 (SAYU 전용)
  async getPersonalityRecommendations(req, res) {
    try {
      const { personality_types, limit = 10 } = req.query;
      
      if (!personality_types) {
        return res.status(400).json({
          success: false,
          message: 'personality_types parameter is required'
        });
      }

      const personalityArray = Array.isArray(personality_types) 
        ? personality_types 
        : personality_types.split(',');

      const exhibitions = await UnifiedExhibitionModel.findByPersonality(personalityArray, parseInt(limit));
      
      res.json({
        success: true,
        data: exhibitions,
        personality_types: personalityArray
      });
    } catch (error) {
      console.error('Error in getPersonalityRecommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = exhibitionController;
