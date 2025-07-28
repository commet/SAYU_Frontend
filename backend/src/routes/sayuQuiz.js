// SAYU Quiz Routes
const express = require('express');
const router = express.Router();
const sayuQuizController = require('../controllers/sayuQuizController');
const authMiddleware = require('../middleware/auth');

// Start SAYU quiz
router.post('/start', authMiddleware, sayuQuizController.startSAYUQuiz.bind(sayuQuizController));

// Submit answer
router.post('/answer', authMiddleware, sayuQuizController.submitSAYUAnswer.bind(sayuQuizController));

// Complete quiz (called automatically when last question is answered)
router.post('/complete', authMiddleware, sayuQuizController.completeSAYUQuiz.bind(sayuQuizController));

// Get all SAYU personality types
router.get('/types', sayuQuizController.getSAYUTypes.bind(sayuQuizController));

// Compare two personality types
router.get('/compare', sayuQuizController.compareTypes.bind(sayuQuizController));

module.exports = router;
