const router = require('express').Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', (req, res) => {
  res.json({ message: 'analytics endpoint - TODO: Implement' });
});

module.exports = router;
