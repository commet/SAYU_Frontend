const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
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
const { pool } = require('../config/database');

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

      // 직접 데이터베이스 쿼리
      let query = `
        SELECT artvee_id, title, artist, url, sayu_type
        FROM artvee_artworks
        WHERE sayu_type = $1
      `;
      
      const queryParams = [type];
      let paramCount = 1;

      if (usageType) {
        paramCount++;
        query += ` AND $${paramCount} = ANY(usage_tags)`;
        queryParams.push(usageType);
      }

      if (emotionFilter) {
        paramCount++;
        query += ` AND $${paramCount} = ANY(emotion_tags)`;
        queryParams.push(emotionFilter);
      }

      query += ` ORDER BY RANDOM() LIMIT $${paramCount + 1}`;
      queryParams.push(parseInt(limit) || 10);

      const result = await pool.query(query, queryParams);
      const artworks = result.rows;

      // 사용 기록 (로그인한 경우) - TODO: Implement logArtworkUsage
      if (req.user) {
        // artworks.forEach(artwork => {
        //   artveeService.logArtworkUsage(
        //     artwork.id,
        //     'personality_browsing',
        //     req.user.id,
        //     req.sessionID,
        //     { personalityType: type }
        //   );
        // });
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

// ===== 이미지 서빙 엔드포인트 =====

// 이미지 캐시 설정
const IMAGE_CACHE_DURATION = 60 * 60 * 24 * 7; // 1주일

// Artvee 이미지 서빙
router.get('/images/:artveeId',
  [
    param('artveeId').isString(),
    query('size').optional().isIn(['thumbnail', 'medium', 'full']).default('medium')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { artveeId } = req.params;
      const { size } = req.query;

      // 이미지 경로 구성
      const imageDir = path.join(__dirname, '../../../../artvee-crawler/images', 
        size === 'thumbnail' ? 'thumbnails' : size);
      const imagePath = path.join(imageDir, `${artveeId}.jpg`);

      // 파일 존재 확인
      try {
        await fs.access(imagePath);
      } catch (error) {
        // 이미지가 없으면 플레이스홀더 반환
        const placeholderPath = path.join(__dirname, '../../public/placeholder-artwork.jpg');
        return res.status(404).sendFile(placeholderPath);
      }

      // 캐시 헤더 설정
      res.set({
        'Cache-Control': `public, max-age=${IMAGE_CACHE_DURATION}`,
        'Content-Type': 'image/jpeg'
      });

      // 이미지 전송
      res.sendFile(imagePath);
    } catch (error) {
      console.error('Error serving image:', error);
      res.status(500).json({ error: 'Failed to serve image' });
    }
  }
);

// 작품 메타데이터와 이미지 URL 함께 반환
router.get('/artworks/:artveeId',
  [
    param('artveeId').isString()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { artveeId } = req.params;
      
      // 메타데이터 파일 읽기
      const metadataPath = path.join(__dirname, '../../../../artvee-crawler/images/metadata', `${artveeId}.json`);
      
      let metadata = {};
      try {
        const metadataContent = await fs.readFile(metadataPath, 'utf8');
        metadata = JSON.parse(metadataContent);
      } catch (error) {
        // 메타데이터가 없으면 데이터 파일에서 찾기
        const dataPath = path.join(__dirname, '../../../../artvee-crawler/data/famous-artists-artworks.json');
        try {
          const data = await fs.readFile(dataPath, 'utf8');
          const artworks = JSON.parse(data);
          const artwork = artworks.find(a => a.artveeId === artveeId);
          if (artwork) {
            metadata = artwork;
          }
        } catch (e) {
          // 기본값 사용
          metadata = {
            artveeId,
            title: 'Unknown Artwork',
            artist: 'Unknown Artist'
          };
        }
      }

      // 이미지 URL 생성
      const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
      const imageUrls = {
        thumbnail: `${baseUrl}/api/artvee/images/${artveeId}?size=thumbnail`,
        medium: `${baseUrl}/api/artvee/images/${artveeId}?size=medium`,
        full: `${baseUrl}/api/artvee/images/${artveeId}?size=full`
      };

      res.json({
        ...metadata,
        imageUrls
      });
    } catch (error) {
      console.error('Error fetching artwork:', error);
      res.status(500).json({ error: 'Failed to fetch artwork' });
    }
  }
);

// 로컬 데이터 기반 성격 유형별 작품 목록
router.get('/personalities/:sayuType/artworks',
  [
    param('sayuType').isString(),
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { sayuType } = req.params;
      const { page, limit } = req.query;

      // 데이터 파일 읽기
      const famousArtworksPath = path.join(__dirname, '../../../../artvee-crawler/data/famous-artists-artworks.json');
      const bulkArtworksPath = path.join(__dirname, '../../../../artvee-crawler/data/bulk-artworks.json');

      const [famousData, bulkData] = await Promise.all([
        fs.readFile(famousArtworksPath, 'utf8').then(JSON.parse).catch(() => []),
        fs.readFile(bulkArtworksPath, 'utf8').then(JSON.parse).catch(() => [])
      ]);

      // 성격 유형에 맞는 작품 필터링
      const filteredArtworks = famousData.filter(artwork => artwork.sayuType === sayuType);
      
      // 성격 유형이 명시되지 않은 bulk 작품들 중 일부 추가 (다양성을 위해)
      const additionalArtworks = bulkData
        .filter(artwork => !artwork.sayuType || artwork.sayuType === 'Unknown')
        .slice(0, 50); // 최대 50개까지만

      const allArtworks = [...filteredArtworks, ...additionalArtworks];

      // 페이지네이션
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedArtworks = allArtworks.slice(startIndex, endIndex);

      // 이미지 URL 추가
      const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
      const artworksWithUrls = paginatedArtworks.map(artwork => ({
        ...artwork,
        imageUrls: {
          thumbnail: `${baseUrl}/api/artvee/images/${artwork.artveeId}?size=thumbnail`,
          medium: `${baseUrl}/api/artvee/images/${artwork.artveeId}?size=medium`,
          full: `${baseUrl}/api/artvee/images/${artwork.artveeId}?size=full`
        }
      }));

      res.json({
        artworks: artworksWithUrls,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allArtworks.length,
          totalPages: Math.ceil(allArtworks.length / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching personality artworks:', error);
      res.status(500).json({ error: 'Failed to fetch artworks' });
    }
  }
);

module.exports = router;