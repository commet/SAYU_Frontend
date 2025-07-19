const { pool } = require('../config/database');
const { body, validationResult } = require('express-validator');
const { log } = require('../config/logger');

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

      // Build base query
      let query = `
        SELECT e.*, v.id as venue_id, v.name as venue_name, v.name_en as venue_name_en,
               v.city as venue_city, v.country as venue_country, v.type as venue_type,
               v.website as venue_website, v.instagram as venue_instagram
        FROM exhibitions e
        INNER JOIN venues v ON e.venue_id = v.id
        WHERE 1=1
      `;
      const queryParams = [];
      let paramIndex = 1;

      // Apply filters
      if (status) {
        query += ` AND e.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      if (city) {
        query += ` AND e.venue_city = $${paramIndex}`;
        queryParams.push(city);
        paramIndex++;
      }

      if (venue_id) {
        query += ` AND e.venue_id = $${paramIndex}`;
        queryParams.push(venue_id);
        paramIndex++;
      }

      if (search) {
        query += ` AND (e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex} OR v.name ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      // Add sorting
      const validSorts = ['created_at', 'start_date', 'end_date', 'title', 'views'];
      const sortColumn = validSorts.includes(sort) ? sort : 'created_at';
      const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
      query += ` ORDER BY e.${sortColumn} ${sortOrder}`;

      // Add pagination
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(parseInt(limit), offset);

      const result = await pool.query(query, queryParams);
      const exhibitions = result.rows;

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM exhibitions e
        INNER JOIN venues v ON e.venue_id = v.id
        WHERE 1=1
      `;
      const countParams = [];
      let countParamIndex = 1;

      if (status) {
        countQuery += ` AND e.status = $${countParamIndex}`;
        countParams.push(status);
        countParamIndex++;
      }
      if (city) {
        countQuery += ` AND e.venue_city = $${countParamIndex}`;
        countParams.push(city);
        countParamIndex++;
      }
      if (venue_id) {
        countQuery += ` AND e.venue_id = $${countParamIndex}`;
        countParams.push(venue_id);
        countParamIndex++;
      }
      if (search) {
        countQuery += ` AND (e.title ILIKE $${countParamIndex} OR e.description ILIKE $${countParamIndex} OR v.name ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
        countParamIndex++;
      }

      const countResult = await pool.query(countQuery, countParams);
      const count = parseInt(countResult.rows[0].total);

      // Get status statistics
      const statsResult = await pool.query('SELECT status, COUNT(*) as count FROM exhibitions GROUP BY status');
      const stats = statsResult.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {});

      const response = {
        success: true,
        data: exhibitions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        },
        stats
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

      const query = `
        SELECT e.*, v.id as venue_id, v.name as venue_name, v.name_en as venue_name_en,
               v.city as venue_city, v.country as venue_country, v.type as venue_type,
               v.website as venue_website, v.instagram as venue_instagram, v.address as venue_address
        FROM exhibitions e
        INNER JOIN venues v ON e.venue_id = v.id
        WHERE e.id = $1
      `;

      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Exhibition not found' 
        });
      }

      const exhibition = result.rows[0];

      // 조회수 증가
      await pool.query(
        'UPDATE exhibitions SET views = COALESCE(views, 0) + 1 WHERE id = $1',
        [id]
      );

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
        let venue = await VenueModel.findByName(submission.venue_name);

        if (!venue) {
          venue = await VenueModel.create({
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
        const exhibition = await ExhibitionModel.create({
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
        await VenueModel.incrementExhibitionCount(venue.id);
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
      const exhibitions = await ExhibitionModel.getTrending(10);
      res.json(exhibitions);
    } catch (error) {
      console.error('Get trending exhibitions error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get upcoming exhibitions
  async getUpcomingExhibitions(req, res) {
    try {
      const { days = 7 } = req.query;
      const exhibitions = await ExhibitionModel.getUpcoming(parseInt(days));
      res.json(exhibitions);
    } catch (error) {
      console.error('Get upcoming exhibitions error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get venues
  async getVenues(req, res) {
    try {
      const { city, country = 'KR', type, tier, search, limit = 50 } = req.query;
      
      let query = 'SELECT * FROM venues WHERE is_active = true';
      const queryParams = [];
      let paramIndex = 1;

      if (city) {
        query += ` AND city = $${paramIndex}`;
        queryParams.push(city);
        paramIndex++;
      }

      if (country) {
        query += ` AND country = $${paramIndex}`;
        queryParams.push(country);
        paramIndex++;
      }

      if (type) {
        query += ` AND type = $${paramIndex}`;
        queryParams.push(type);
        paramIndex++;
      }

      if (tier) {
        query += ` AND tier = $${paramIndex}`;
        queryParams.push(tier);
        paramIndex++;
      }

      if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      query += ` ORDER BY name LIMIT $${paramIndex}`;
      queryParams.push(parseInt(limit));

      const result = await pool.query(query, queryParams);

      res.json({
        success: true,
        data: result.rows
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
      const result = await pool.query('SELECT venue_city, status FROM exhibitions');
      
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

      const query = `
        SELECT e.*, v.id as venue_id, v.name as venue_name, v.name_en as venue_name_en,
               v.city as venue_city, v.country as venue_country, v.type as venue_type
        FROM exhibitions e
        INNER JOIN venues v ON e.venue_id = v.id
        WHERE e.status = 'ongoing'
        ORDER BY e.views DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [parseInt(limit)]);

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Error in getPopularExhibitions:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
};

module.exports = exhibitionController;