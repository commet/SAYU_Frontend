const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const contemplativeController = require('../controllers/contemplativeController');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * @route   POST /api/contemplative/session
 * @desc    감상 세션 저장
 * @access  Public (선택적 인증)
 */
router.post('/session',
  optionalAuth,
  [
    body('artworkId').notEmpty().withMessage('Artwork ID is required'),
    body('duration').isFloat({ min: 0 }).withMessage('Duration must be a positive number'),
    body('depth').isIn(['glance', 'observe', 'contemplate', 'immerse']).withMessage('Invalid depth value'),
    body('interactions').isArray().withMessage('Interactions must be an array'),
    body('timestamp').isISO8601().toDate().withMessage('Valid timestamp required')
  ],
  contemplativeController.saveViewingSession
);

/**
 * @route   POST /api/contemplative/walk-session
 * @desc    산책 세션 저장
 * @access  Private
 */
router.post('/walk-session',
  authenticate,
  [
    body('mode').isIn(['free', 'themed', 'deep', 'memory']).withMessage('Invalid walk mode'),
    body('duration').isFloat({ min: 0 }).withMessage('Duration must be a positive number'),
    body('artworkCount').isInt({ min: 0 }).withMessage('Artwork count must be a positive integer'),
    body('timestamp').isISO8601().toDate().withMessage('Valid timestamp required')
  ],
  contemplativeController.saveWalkSession
);

/**
 * @route   GET /api/contemplative/artworks
 * @desc    모드별 추천 작품 가져오기
 * @access  Public (선택적 인증)
 */
router.get('/artworks',
  optionalAuth,
  [
    query('mode').optional().isIn(['free', 'themed', 'deep', 'memory']).withMessage('Invalid mode')
  ],
  contemplativeController.getContemplativeArtworks
);

/**
 * @route   GET /api/contemplative/stats
 * @desc    감상 통계 조회
 * @access  Private
 */
router.get('/stats',
  authenticate,
  contemplativeController.getContemplativeStats
);

/**
 * @route   GET /api/contemplative/guide
 * @desc    감상 가이드 제공 (정적 콘텐츠)
 * @access  Public
 */
router.get('/guide', (req, res) => {
  const { depth } = req.query;
  
  const guides = {
    glance: {
      title: '첫인상',
      tips: [
        '작품의 전체적인 느낌을 받아보세요',
        '어떤 감정이 먼저 다가오나요?',
        '색상이나 형태가 주는 인상은?'
      ],
      duration: '5-30초'
    },
    observe: {
      title: '관찰',
      tips: [
        '작품의 세부 요소들을 찾아보세요',
        '숨겨진 디테일이 있나요?',
        '작가의 기법을 관찰해보세요'
      ],
      duration: '30초-2분'
    },
    contemplate: {
      title: '사색',
      tips: [
        '작품이 전하려는 메시지는 무엇일까요?',
        '당신의 경험과 연결점이 있나요?',
        '이 작품이 당신에게 묻는 질문은?'
      ],
      duration: '2-5분'
    },
    immerse: {
      title: '몰입',
      tips: [
        '작품과 하나가 되어보세요',
        '시간을 잊고 대화를 나누세요',
        '이 순간을 온전히 경험하세요'
      ],
      duration: '5분 이상'
    }
  };
  
  res.json({
    success: true,
    data: guides[depth] || guides.glance
  });
});

module.exports = router;