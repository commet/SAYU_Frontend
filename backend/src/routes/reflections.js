const router = require('express').Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', (req, res) => {
  res.json({ message: 'reflections endpoint - TODO: Implement' });
});

module.exports = router;
