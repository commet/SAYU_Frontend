const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  
  authenticateToken(req, res, (err) => {
    if (err) req.user = null;
    next();
  });
};
const validateRequest = require('../middleware/validateRequest');
const { body, query, param } = require('express-validator');
const artveeService = require('../services/artveeService');

// 성격 유형별 아트웍 조회 (로그인 선택)
router.get('/personality/:type',
  optionalAuth,
  [
    param('type').isIn(['LAEF', 'SRMC', 'GREF', 'CREF']),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(10),
    query('usageType').optional().isString(),
    query('emotionFilter').optional().isString()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { type } = req.params;
      const { limit, usageType, emotionFilter } = req.query;

      const artworks = await artveeService.getArtworksForPersonality(
        type,
        {
          limit: parseInt(limit),
          usageType,
          emotionFilter
        }
      );

      // 사용 기록 (로그인한 경우)
      if (req.user) {
        artworks.forEach(artwork => {
          artveeService.logArtworkUsage(
            artwork.id,
            'personality_browsing',
            req.user.id,
            req.sessionID,
            { personalityType: type }
          );
        });
      }

      res.json({
        success: true,
        personalityType: type,
        artworks,
        total: artworks.length
      });
    } catch (error) {
      console.error('Personality artworks error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get personality artworks'
      });
    }
  }
);

// 배경 이미지 추천
router.post('/background',
  optionalAuth,
  [
    body('personalityType').optional().isIn(['LAEF', 'SRMC', 'GREF', 'CREF']),
    body('mood').optional().isString(),
    body('context').optional().isString(),
    body('usageType').optional().isString()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { personalityType, mood, context, usageType } = req.body;

      const artwork = await artveeService.getBackgroundArtwork({
        personalityType: personalityType || req.user?.personality_type,
        mood,
        context,
        usageType: usageType || 'background'
      });

      if (!artwork) {
        return res.status(404).json({
          success: false,
          error: 'No suitable artwork found'
        });
      }

      // 사용 기록
      await artveeService.logArtworkUsage(
        artwork.id,
        usageType || 'background',
        req.user?.id,
        req.sessionID,
        { personalityType, mood, context }
      );

      res.json({
        success: true,
        artwork
      });
    } catch (error) {
      console.error('Background artwork error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get background artwork'
      });
    }
  }
);

// 퀴즈 배경 이미지 조회
router.get('/quiz-backgrounds',
  [
    query('theme').optional().isString(),
    query('count').optional().isInt({ min: 1, max: 10 }).default(5)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { theme, count } = req.query;

      const backgrounds = await artveeService.getQuizBackgrounds(
        theme || 'mixed',
        parseInt(count)
      );

      res.json({
        success: true,
        theme,
        backgrounds,
        total: backgrounds.length
      });
    } catch (error) {
      console.error('Quiz backgrounds error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get quiz backgrounds'
      });
    }
  }
);

// 색상 무드별 아트웍 검색
router.get('/mood/:colorMood',
  optionalAuth,
  [
    param('colorMood').isIn(['warm', 'cool', 'neutral', 'vibrant', 'muted']),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { colorMood } = req.params;
      const { limit } = req.query;

      const artworks = await artveeService.findByColorMood(
        colorMood,
        parseInt(limit)
      );

      res.json({
        success: true,
        colorMood,
        artworks,
        total: artworks.length
      });
    } catch (error) {
      console.error('Color mood artworks error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get color mood artworks'
      });
    }
  }
);

// 아트웍 상세 정보 조회
router.get('/artwork/:id',
  optionalAuth,
  [
    param('id').isUUID()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;

      const artwork = await artveeService.getArtworkById(id);

      if (!artwork) {
        return res.status(404).json({
          success: false,
          error: 'Artwork not found'
        });
      }

      // 조회 기록
      if (req.user) {
        await artveeService.logArtworkUsage(
          id,
          'detail_view',
          req.user.id,
          req.sessionID
        );
      }

      res.json({
        success: true,
        artwork
      });
    } catch (error) {
      console.error('Artwork detail error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get artwork details'
      });
    }
  }
);

// 유사한 아트웍 조회
router.get('/artwork/:id/similar',
  optionalAuth,
  [
    param('id').isUUID(),
    query('limit').optional().isInt({ min: 1, max: 20 }).default(10)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { limit } = req.query;

      const similarArtworks = await artveeService.getSimilarArtworks(
        id,
        parseInt(limit)
      );

      res.json({
        success: true,
        artworkId: id,
        similarArtworks,
        total: similarArtworks.length
      });
    } catch (error) {
      console.error('Similar artworks error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get similar artworks'
      });
    }
  }
);

// 아트웍 검색
router.get('/search',
  optionalAuth,
  [
    query('q').optional().isString(),
    query('artist').optional().isString(),
    query('period').optional().isString(),
    query('genre').optional().isString(),
    query('style').optional().isString(),
    query('personalityTags').optional().isString(), // comma-separated
    query('emotionTags').optional().isString(), // comma-separated
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
    query('offset').optional().isInt({ min: 0 }).default(0)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const {
        q, artist, period, genre, style,
        personalityTags, emotionTags,
        limit, offset
      } = req.query;

      const searchParams = {
        query: q,
        artist,
        period,
        genre,
        style,
        personalityTags: personalityTags ? personalityTags.split(',') : [],
        emotionTags: emotionTags ? emotionTags.split(',') : [],
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const results = await artveeService.searchArtworks(searchParams);

      res.json({
        success: true,
        searchParams: {
          ...searchParams,
          personalityTags: personalityTags || '',
          emotionTags: emotionTags || ''
        },
        artworks: results.artworks,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: results.total
        }
      });
    } catch (error) {
      console.error('Artwork search error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search artworks'
      });
    }
  }
);

// 랜덤 아트웍 조회
router.get('/random',
  optionalAuth,
  [
    query('count').optional().isInt({ min: 1, max: 10 }).default(1),
    query('personalityType').optional().isIn(['LAEF', 'SRMC', 'GREF', 'CREF']),
    query('excludeUsageTypes').optional().isString() // comma-separated
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { count, personalityType, excludeUsageTypes } = req.query;

      const options = {
        count: parseInt(count),
        personalityType: personalityType || req.user?.personality_type,
        excludeUsageTypes: excludeUsageTypes ? excludeUsageTypes.split(',') : []
      };

      const artworks = await artveeService.getRandomArtworks(options);

      res.json({
        success: true,
        artworks,
        total: artworks.length
      });
    } catch (error) {
      console.error('Random artworks error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get random artworks'
      });
    }
  }
);

// 인기 아트웍 조회
router.get('/popular',
  optionalAuth,
  [
    query('period').optional().isIn(['day', 'week', 'month', 'all']).default('week'),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
    query('personalityType').optional().isIn(['LAEF', 'SRMC', 'GREF', 'CREF'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { period, limit, personalityType } = req.query;

      const popularArtworks = await artveeService.getPopularArtworks({
        period,
        limit: parseInt(limit),
        personalityType
      });

      res.json({
        success: true,
        period,
        artworks: popularArtworks,
        total: popularArtworks.length
      });
    } catch (error) {
      console.error('Popular artworks error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get popular artworks'
      });
    }
  }
);

// 아트웍 사용 통계 (관리자용)
router.get('/stats',
  // TODO: 관리자 권한 체크 미들웨어 추가
  [
    query('period').optional().isIn(['day', 'week', 'month']).default('week'),
    query('groupBy').optional().isIn(['usage_type', 'personality_type', 'artwork']).default('usage_type')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { period, groupBy } = req.query;

      const stats = await artveeService.getUsageStats({
        period,
        groupBy
      });

      res.json({
        success: true,
        period,
        groupBy,
        stats
      });
    } catch (error) {
      console.error('Artvee stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get usage stats'
      });
    }
  }
);

// 수집 작업 상태 조회 (관리자용)
router.get('/collection/status',
  // TODO: 관리자 권한 체크 미들웨어 추가
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).default(20)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { limit } = req.query;

      const jobs = await artveeService.getCollectionJobs(parseInt(limit));

      res.json({
        success: true,
        jobs,
        total: jobs.length
      });
    } catch (error) {
      console.error('Collection status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get collection status'
      });
    }
  }
);

// 새로운 수집 작업 시작 (관리자용)
router.post('/collection/start',
  // TODO: 관리자 권한 체크 미들웨어 추가
  [
    body('category').isString(),
    body('targetCount').optional().isInt({ min: 1, max: 1000 }).default(50)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { category, targetCount } = req.body;

      const job = await artveeService.startCollectionJob(
        category,
        parseInt(targetCount)
      );

      res.json({
        success: true,
        job,
        message: 'Collection job started'
      });
    } catch (error) {
      console.error('Collection start error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start collection job'
      });
    }
  }
);

// 성격 매핑 업데이트 (관리자용)
router.post('/mapping/update',
  // TODO: 관리자 권한 체크 미들웨어 추가
  async (req, res) => {
    try {
      const result = await artveeService.updatePersonalityMappings();

      res.json({
        success: true,
        result,
        message: 'Personality mappings updated'
      });
    } catch (error) {
      console.error('Mapping update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update personality mappings'
      });
    }
  }
);

module.exports = router;