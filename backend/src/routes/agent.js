const router = require('express').Router();
const agentController = require('../controllers/agentController');
const authMiddleware = require('../middleware/auth');
const {
  validationSchemas,
  handleValidationResult,
  securityHeaders,
  requestSizeLimiter,
  sanitizeInput,
  rateLimits
} = require('../middleware/validation');

// Apply security middleware
router.use(securityHeaders);
router.use(sanitizeInput);
router.use(requestSizeLimiter('1mb'));
router.use(authMiddleware);

// Chat with rate limiting to prevent spam
router.post('/chat',
  rateLimits.moderate, // 20 requests per 15 minutes
  validationSchemas.agentChat,
  handleValidationResult,
  agentController.chat.bind(agentController)
);

// Memory endpoint with lenient rate limiting
router.get('/memory',
  rateLimits.lenient,
  agentController.getMemory.bind(agentController)
);

module.exports = router;
