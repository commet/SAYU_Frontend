const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const emotionTranslationController = require('../controllers/emotionTranslationController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Rate limiter for emotion translation (expensive OpenAI calls)
const emotionTranslationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    error: 'Too many translation requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @route   POST /api/emotion/translate
 * @desc    감정을 예술로 번역
 * @access  Public (선택적 인증)
 */
router.post('/translate',
  emotionTranslationLimiter, // Rate limiting 적용
  optionalAuth, // 로그인하지 않아도 사용 가능, 로그인 시 기록 저장
  [
    body('emotionInput').isObject().withMessage('Emotion input must be an object'),
    body('emotionInput.id').notEmpty().withMessage('Emotion ID is required'),
    body('emotionInput.timestamp').isISO8601().toDate().withMessage('Valid timestamp required'),
    body('emotionInput.color').optional().isObject(),
    body('emotionInput.weather').optional().isIn([
      'sunny', 'cloudy', 'rainy', 'stormy', 'foggy', 'snowy', 'windy', 'rainbow'
    ]),
    body('emotionInput.shape').optional().isObject(),
    body('emotionInput.sound').optional().isObject()
  ],
  emotionTranslationController.translateEmotion
);

/**
 * @route   GET /api/emotion/history
 * @desc    사용자의 감정 번역 기록 조회
 * @access  Private
 */
router.get('/history',
  authenticate,
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt()
  ],
  emotionTranslationController.getTranslationHistory
);

/**
 * @route   GET /api/emotion/session/:sessionId
 * @desc    특정 번역 세션 상세 조회
 * @access  Private
 */
router.get('/session/:sessionId',
  authenticate,
  [
    param('sessionId').isUUID().withMessage('Valid session ID required')
  ],
  emotionTranslationController.getTranslationSession
);

/**
 * @route   POST /api/emotion/session/:sessionId/feedback
 * @desc    번역 결과에 대한 피드백 저장
 * @access  Private
 */
router.post('/session/:sessionId/feedback',
  authenticate,
  [
    param('sessionId').isUUID().withMessage('Valid session ID required'),
    body('selectedMatchId').optional().isString(),
    body('resonanceScore').optional().isInt({ min: 0, max: 5 }),
    body('notes').optional().isString().isLength({ max: 500 })
  ],
  emotionTranslationController.saveTranslationFeedback
);

/**
 * @route   GET /api/emotion/stats/colors
 * @desc    감정 색상 통계 조회
 * @access  Public (선택적 인증)
 */
router.get('/stats/colors',
  optionalAuth,
  emotionTranslationController.getEmotionColorStats
);

/**
 * @route   GET /api/emotion/validate
 * @desc    감정 입력 데이터 유효성 검증 (클라이언트 사이드 검증용)
 * @access  Public
 */
router.post('/validate',
  [
    body('emotionInput').isObject().withMessage('Emotion input must be an object')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        valid: false,
        errors: errors.array()
      });
    }

    res.json({
      success: true,
      valid: true,
      message: 'Emotion input is valid'
    });
  }
);

module.exports = router;
