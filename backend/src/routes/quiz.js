const router = require('express').Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/auth');
const { 
  validationSchemas, 
  handleValidationResult, 
  securityHeaders, 
  requestSizeLimiter,
  sanitizeInput,
  rateLimits 
} = require('../middleware/validation');
const { body } = require('express-validator');

// Apply security middleware
router.use(securityHeaders);
router.use(sanitizeInput);
router.use(requestSizeLimiter('5mb')); // Quiz data can be larger
router.use(authMiddleware);

// Quiz start validation
const quizStartValidation = [
  body('sessionType')
    .optional()
    .isIn(['exhibition', 'artwork', 'complete'])
    .withMessage('Invalid session type'),
  
  body('deviceInfo')
    .optional()
    .isObject()
    .custom((value) => {
      const allowedKeys = ['userAgent', 'screenWidth', 'screenHeight', 'timezone'];
      const keys = Object.keys(value);
      if (keys.some(key => !allowedKeys.includes(key))) {
        throw new Error('Invalid device info fields');
      }
      return true;
    })
];

// Answer submission validation
const answerValidation = [
  body('questionId')
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-Z0-9\-_]+$/)
    .withMessage('Invalid question ID format'),
  
  body('answer')
    .isInt({ min: 1, max: 7 })
    .withMessage('Answer must be between 1 and 7'),
  
  body('timeSpent')
    .optional()
    .isInt({ min: 0, max: 600000 }) // Max 10 minutes per question
    .withMessage('Invalid time spent value'),
  
  body('sessionId')
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .withMessage('Invalid session ID format')
];

router.post('/start', 
  rateLimits.lenient,
  quizStartValidation,
  handleValidationResult,
  quizController.startQuiz.bind(quizController)
);

router.post('/answer', 
  rateLimits.lenient,
  answerValidation,
  handleValidationResult,
  quizController.submitAnswer.bind(quizController)
);

router.post('/complete', 
  rateLimits.moderate,
  validationSchemas.quizSubmission,
  handleValidationResult,
  quizController.completeQuiz.bind(quizController)
);

module.exports = router;
