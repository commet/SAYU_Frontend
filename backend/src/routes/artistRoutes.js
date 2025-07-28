const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/featured', artistController.getFeaturedArtists);
router.get('/', artistController.getArtists);
router.get('/stats', artistController.getArtistStats);
router.get('/:id', artistController.getArtistById);

// Protected routes
router.post('/:artistId/follow', authMiddleware, artistController.toggleFollow);
router.get('/me/followed', authMiddleware, artistController.getFollowedArtists);

module.exports = router;
