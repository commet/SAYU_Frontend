const express = require('express');
const router = express.Router();
const exhibitionDataCollectorService = require('../services/exhibitionDataCollectorService');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiting for collection endpoints
const collectionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many collection requests, try again later' }
});

// 전시 데이터 수집 통계 조회 (공개)
router.get('/stats', async (req, res) => {
  try {
    const stats = await exhibitionDataCollectorService.getCollectionStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Collection stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get collection statistics'
    });
  }
});

// 전시 데이터 수집 실행 (관리자만)
router.post('/collect', 
  authMiddleware,
  collectionLimiter,
  async (req, res) => {
    try {
      // 관리자 권한 확인
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const results = await exhibitionDataCollectorService.collectAllExhibitions();
      
      res.json({
        success: true,
        message: 'Exhibition collection completed',
        data: results
      });

    } catch (error) {
      console.error('Exhibition collection error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to collect exhibitions'
      });
    }
  }
);

// 전시 상태 업데이트 (관리자만)
router.post('/update-statuses',
  authMiddleware,
  async (req, res) => {
    try {
      // 관리자 권한 확인
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const results = await exhibitionDataCollectorService.updateExhibitionStatuses();
      
      res.json({
        success: true,
        message: 'Exhibition statuses updated',
        data: results
      });

    } catch (error) {
      console.error('Status update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update exhibition statuses'
      });
    }
  }
);

// 수동 전시 추가 (인증된 사용자)
router.post('/manual',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('venue_name').notEmpty().withMessage('Venue name is required'),
    body('venue_city').notEmpty().withMessage('Venue city is required'),
    body('start_date').isISO8601().withMessage('Valid start date is required'),
    body('end_date').isISO8601().withMessage('Valid end date is required'),
    body('description').optional().isLength({ max: 2000 }).withMessage('Description too long'),
    body('admission_fee').optional().isInt({ min: 0 }).withMessage('Admission fee must be non-negative'),
    body('source_url').optional().isURL().withMessage('Source URL must be valid'),
    body('contact_info').optional().isLength({ max: 100 }).withMessage('Contact info too long'),
    body('artists').optional().isArray().withMessage('Artists must be an array'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const exhibitionData = {
        title: req.body.title,
        venue_name: req.body.venue_name,
        venue_city: req.body.venue_city,
        start_date: new Date(req.body.start_date),
        end_date: new Date(req.body.end_date),
        description: req.body.description || '',
        admission_fee: req.body.admission_fee || 0,
        source_url: req.body.source_url || '',
        contact_info: req.body.contact_info || '',
        artists: req.body.artists || [],
        tags: req.body.tags || [],
        poster_image: req.body.poster_image || ''
      };

      // 날짜 유효성 검사
      if (exhibitionData.end_date <= exhibitionData.start_date) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }

      const result = await exhibitionDataCollectorService.addManualExhibition(
        exhibitionData, 
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Exhibition added successfully',
        data: result
      });

    } catch (error) {
      console.error('Manual exhibition add error:', error);
      
      if (error.message.includes('Already exists')) {
        return res.status(409).json({
          success: false,
          message: 'Exhibition already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to add exhibition'
      });
    }
  }
);

// 전시 수집 테스트 (개발용)
router.get('/test', async (req, res) => {
  try {
    const testData = {
      sources: [
        { name: 'Mock Data', enabled: true, count: 5 },
        { name: 'National Museum of Modern and Contemporary Art', enabled: false, count: 0 },
        { name: 'Seoul Museum of Art', enabled: false, count: 0 },
        { name: 'Leeum Museum', enabled: false, count: 0 }
      ],
      lastCollection: new Date().toISOString(),
      nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    };

    // 실제 통계도 포함
    const stats = await exhibitionDataCollectorService.getCollectionStats();

    res.json({
      success: true,
      message: 'Exhibition collection system test',
      testData,
      actualStats: stats
    });

  } catch (error) {
    console.error('Collection test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test collection system'
    });
  }
});

module.exports = router;