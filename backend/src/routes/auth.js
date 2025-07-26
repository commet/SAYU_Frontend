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

// Enhanced authentication security
const { 
  authLimiter, 
  authSlowDown,
  loginValidation,
  registerValidation
} = require('../middleware/securityEnhancements');

// Apply security middleware to all routes
router.use(securityHeaders);
router.use(sanitizeInput);
router.use(requestSizeLimiter('2mb')); // Auth requests shouldn't be large

// Registration with enhanced strict rate limiting and brute force protection
router.post('/register', 
  authLimiter,
  authSlowDown,
  registerValidation,
  authController.register
);

// Login with enhanced rate limiting and brute force protection
router.post('/login', 
  authLimiter,
  authSlowDown,
  loginValidation, 
  authController.login
);

// Protected user info
router.get('/me', authMiddleware, authController.getMe);

// Token management with enhanced rate limiting
router.post('/refresh', 
  authLimiter,
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

// User purpose update
router.patch('/purpose', 
  authMiddleware,
  authController.updateUserPurpose
);

module.exports = router;
