const router = require('express').Router();
const agentController = require('../controllers/agentController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/chat', agentController.chat.bind(agentController));
router.get('/memory', agentController.getMemory.bind(agentController));

module.exports = router;
