const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { 
  validationSchemas, 
  handleValidationResult, 
  securityHeaders, 
  requestSizeLimiter,
  sanitizeInput,
  rateLimits 
} = require('../middleware/validation');

// Apply security middleware to all routes
router.use(securityHeaders);
router.use(sanitizeInput);
router.use(requestSizeLimiter('2mb')); // Auth requests shouldn't be large

// Registration with strict rate limiting
router.post('/register', 
  rateLimits.strict, 
  validationSchemas.userRegistration, 
  handleValidationResult, 
  authController.register
);

// Login with moderate rate limiting
router.post('/login', 
  rateLimits.moderate, 
  validationSchemas.userLogin, 
  handleValidationResult, 
  authController.login
);

// Protected user info
router.get('/me', authMiddleware, authController.getMe);

// Token management with rate limiting
router.post('/refresh', 
  rateLimits.moderate, 
  authController.refreshToken
);

router.post('/logout', authController.logout);

router.post('/logout-all', 
  authMiddleware, 
  authController.logoutAll
);

// Session management
router.get('/sessions', authMiddleware, authController.getSessions);

router.delete('/sessions/:tokenId', 
  authMiddleware, 
  authController.revokeSession
);

module.exports = router;
