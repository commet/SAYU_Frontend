const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const chatbotController = require('../controllers/chatbotController');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const rateLimiter = require('../middleware/rateLimiter');

// Apply authentication to all chatbot routes
router.use(authMiddleware);

// Rate limiting for chatbot
const chatbotLimiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: '너무 많은 메시지를 보내셨습니다. 잠시 후 다시 시도해주세요.'
});

// Validation rules
const messageValidation = [
  body('message')
    .trim()
    .notEmpty().withMessage('메시지를 입력해주세요')
    .isLength({ max: 500 }).withMessage('메시지는 500자 이내로 입력해주세요')
    .matches(/^[^<>]*$/).withMessage('특수문자 < >는 사용할 수 없습니다'),
  body('artworkId')
    .notEmpty().withMessage('작품 ID가 필요합니다')
    .isString().withMessage('올바른 작품 ID 형식이 아닙니다'),
  body('artwork')
    .optional()
    .isObject().withMessage('작품 정보는 객체 형식이어야 합니다'),
  body('artwork.title')
    .optional()
    .isString().withMessage('작품 제목은 문자열이어야 합니다'),
  body('artwork.artist')
    .optional()
    .isString().withMessage('작가명은 문자열이어야 합니다'),
  body('artwork.year')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
    .withMessage('올바른 연도를 입력해주세요')
];

const feedbackValidation = [
  body('sessionId')
    .notEmpty().withMessage('세션 ID가 필요합니다'),
  body('messageId')
    .optional()
    .isString(),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('평점은 1-5 사이여야 합니다'),
  body('feedback')
    .optional()
    .isString()
    .isLength({ max: 1000 }).withMessage('피드백은 1000자 이내로 입력해주세요')
];

// Routes

// Send message to chatbot
router.post('/message',
  chatbotLimiter,
  messageValidation,
  validateRequest,
  chatbotController.sendMessage
);

// Get conversation history for specific artwork
router.get('/history/:artworkId',
  [
    param('artworkId')
      .notEmpty().withMessage('작품 ID가 필요합니다')
      .isString().withMessage('올바른 작품 ID 형식이 아닙니다')
  ],
  validateRequest,
  chatbotController.getHistory
);

// Clear all user sessions
router.post('/clear-sessions',
  chatbotController.clearSessions
);

// Save feedback on chatbot response
router.post('/feedback',
  feedbackValidation,
  validateRequest,
  chatbotController.saveFeedback
);

// Get suggested questions for an artwork
router.get('/suggestions/:artworkId',
  [
    param('artworkId')
      .notEmpty().withMessage('작품 ID가 필요합니다'),
    query('title').optional().isString(),
    query('artist').optional().isString(),
    query('year').optional().isInt()
  ],
  validateRequest,
  chatbotController.getSuggestions
);

// Health check endpoint (no auth required)
router.get('/health',
  (req, res, next) => {
    // Skip auth for health check
    next();
  },
  chatbotController.healthCheck
);

module.exports = router;
