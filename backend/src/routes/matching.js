const router = require('express').Router();
const matchingController = require('../controllers/matchingController');
const authMiddleware = require('../middleware/auth');

// Get compatible users based on purpose
router.get('/compatible', 
  authMiddleware,
  matchingController.getCompatibleUsers
);

// Get users by specific purpose
router.get('/purpose/:purpose', 
  authMiddleware,
  matchingController.getUsersByPurpose
);

module.exports = router;