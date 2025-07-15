const express = require('express');
const router = express.Router();
const exhibitionController = require('../src/controllers/exhibitionController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/exhibitions', exhibitionController.getExhibitions);
router.get('/exhibitions/trending', exhibitionController.getTrendingExhibitions);
router.get('/exhibitions/upcoming', exhibitionController.getUpcomingExhibitions);
router.get('/exhibitions/:id', exhibitionController.getExhibition);

// Exhibition submission
router.post('/exhibitions/submit', exhibitionController.submitExhibition);

// Authenticated routes
router.get('/my/submissions', authenticate, exhibitionController.getUserSubmissions);

// Admin routes
router.post('/admin/exhibitions/collect', authenticate, authorize(['admin']), exhibitionController.collectExhibitions);
router.put('/admin/submissions/:id/review', authenticate, authorize(['admin', 'moderator']), exhibitionController.reviewSubmission);

// Venue routes
router.get('/venues', exhibitionController.getVenues);

// Exhibition image upload
router.post('/exhibitions/:id/images', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const ExhibitionModel = require('../src/models/exhibitionModel');
    
    const exhibition = await ExhibitionModel.findById(id);
    if (!exhibition) {
      return res.status(404).json({ error: 'Exhibition not found' });
    }
    
    // Check permission
    if (exhibition.submitted_by !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Add uploaded image URLs to exhibition
    const imageUrls = req.files.map(file => file.location || file.path);
    const currentImages = exhibition.images || [];
    const updatedImages = [...currentImages, ...imageUrls];
    
    await ExhibitionModel.update(id, { images: updatedImages });
    
    res.json({ images: updatedImages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;