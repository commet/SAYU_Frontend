const { createClient } = require('@supabase/supabase-js');
const { body, validationResult } = require('express-validator');

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

      // 기본 쿼리 빌더
      let query = supabase
        .from('exhibitions')
        .select(`
          *,
          venues!inner(
            id,
            name,
            name_en,
            city,
            country,
            type,
            website,
            instagram
          )
        `, { count: 'exact' })
        .range(offset, offset + limit - 1);

      // 필터링
      if (status) {
        query = query.eq('status', status);
      }

      if (city) {
        query = query.eq('venue_city', city);
      }

      if (venue_id) {
        query = query.eq('venue_id', venue_id);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,venue_name.ilike.%${search}%`);
      }

      // 정렬
      query = query.order(sort, { ascending: order === 'asc' });

      const { data: exhibitions, error, count } = await query;

      if (error) {
        console.error('Error fetching exhibitions:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to fetch exhibitions' 
        });
      }

      // 통계 데이터 추가
      const { data: statsData } = await supabase
        .from('exhibitions')
        .select('status');

      const stats = statsData?.reduce((acc, ex) => {
        acc[ex.status] = (acc[ex.status] || 0) + 1;
        return acc;
      }, {}) || {};

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

      const { data: exhibition, error } = await supabase
        .from('exhibitions')
        .select(`
          *,
          venues!inner(
            id,
            name,
            name_en,
            city,
            country,
            type,
            website,
            instagram,
            address
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching exhibition:', error);
        return res.status(404).json({ 
          success: false, 
          message: 'Exhibition not found' 
        });
      }

      // 조회수 증가
      await supabase
        .from('exhibitions')
        .update({ views: (exhibition.views || 0) + 1 })
        .eq('id', id);

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
      
      let query = supabase
        .from('venues')
        .select('*')
        .eq('is_active', true)
        .limit(parseInt(limit));

      if (city) {
        query = query.eq('city', city);
      }

      if (country) {
        query = query.eq('country', country);
      }

      if (type) {
        query = query.eq('type', type);
      }

      if (tier) {
        query = query.eq('tier', tier);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,name_en.ilike.%${search}%`);
      }

      const { data: venues, error } = await query.order('name');

      if (error) {
        console.error('Error fetching venues:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to fetch venues' 
        });
      }

      res.json({
        success: true,
        data: venues
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
      const { data: existingLike, error: checkError } = await supabase
        .from('exhibition_likes')
        .select('id')
        .eq('exhibition_id', id)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingLike) {
        // 좋아요 취소
        await supabase
          .from('exhibition_likes')
          .delete()
          .eq('exhibition_id', id)
          .eq('user_id', userId);

        res.json({
          success: true,
          message: 'Like removed',
          liked: false
        });
      } else {
        // 좋아요 추가
        await supabase
          .from('exhibition_likes')
          .insert({ exhibition_id: id, user_id: userId });

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
      const { data: existing, error: checkError } = await supabase
        .from('exhibition_submissions')
        .select('id')
        .eq('title', title)
        .eq('venue_name', venue_name)
        .eq('start_date', start_date)
        .eq('submitted_by', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Exhibition already submitted'
        });
      }

      // 제출 데이터 저장
      const { data: submission, error: insertError } = await supabase
        .from('exhibition_submissions')
        .insert({
          title,
          venue_name,
          venue_city,
          venue_country,
          start_date,
          end_date,
          description,
          artists: artists || [],
          admission_fee: admission_fee || 0,
          source_url,
          contact_info,
          submitted_by: userId,
          submission_status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

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
      const { data: exhibitions, error } = await supabase
        .from('exhibitions')
        .select('venue_city, status');

      if (error) {
        throw error;
      }

      const cityStats = exhibitions.reduce((acc, ex) => {
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

      const { data: exhibitions, error } = await supabase
        .from('exhibitions')
        .select(`
          *,
          venues!inner(
            id,
            name,
            name_en,
            city,
            country,
            type
          )
        `)
        .eq('status', 'ongoing')
        .order('views', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

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
  }
};

module.exports = exhibitionController;