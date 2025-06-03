const router = require('express').Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/start', quizController.startQuiz.bind(quizController));
router.post('/answer', quizController.submitAnswer.bind(quizController));
router.post('/complete', quizController.completeQuiz.bind(quizController));

module.exports = router;
