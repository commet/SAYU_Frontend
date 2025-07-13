const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { adminMiddleware: requireAdmin } = require('../middleware/auth');
const artistPortalService = require('../services/artistPortalService');
const { logger } = require("../config/logger");

router.use(authMiddleware);

// Artist Profile Routes
router.post('/artist/profile', async (req, res) => {
  try {
    const profile = await artistPortalService.createArtistProfile(req.userId, req.body);
    res.status(201).json(profile);
  } catch (error) {
    logger.error('Failed to create artist profile:', error);
    res.status(500).json({ error: 'Failed to create artist profile' });
  }
});

router.get('/artist/profile', async (req, res) => {
  try {
    const profile = await artistPortalService.getArtistProfile(req.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Artist profile not found' });
    }
    res.json(profile);
  } catch (error) {
    logger.error('Failed to get artist profile:', error);
    res.status(500).json({ error: 'Failed to get artist profile' });
  }
});

router.put('/artist/profile/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const profile = await artistPortalService.updateArtistProfile(profileId, req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ error: 'Artist profile not found or unauthorized' });
    }
    
    res.json(profile);
  } catch (error) {
    logger.error('Failed to update artist profile:', error);
    res.status(500).json({ error: 'Failed to update artist profile' });
  }
});

// Gallery Profile Routes
router.post('/gallery/profile', async (req, res) => {
  try {
    const profile = await artistPortalService.createGalleryProfile(req.userId, req.body);
    res.status(201).json(profile);
  } catch (error) {
    logger.error('Failed to create gallery profile:', error);
    res.status(500).json({ error: 'Failed to create gallery profile' });
  }
});

router.get('/gallery/profile', async (req, res) => {
  try {
    const profile = await artistPortalService.getGalleryProfile(req.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Gallery profile not found' });
    }
    res.json(profile);
  } catch (error) {
    logger.error('Failed to get gallery profile:', error);
    res.status(500).json({ error: 'Failed to get gallery profile' });
  }
});

router.put('/gallery/profile/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const profile = await artistPortalService.updateGalleryProfile(profileId, req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ error: 'Gallery profile not found or unauthorized' });
    }
    
    res.json(profile);
  } catch (error) {
    logger.error('Failed to update gallery profile:', error);
    res.status(500).json({ error: 'Failed to update gallery profile' });
  }
});

// Artwork Submission Routes
router.post('/artworks', async (req, res) => {
  try {
    const { profileId, profileType } = req.body;
    
    if (!profileId || !profileType || !['artist', 'gallery'].includes(profileType)) {
      return res.status(400).json({ error: 'Profile ID and type (artist/gallery) are required' });
    }

    const artwork = await artistPortalService.submitArtwork(profileId, profileType, req.body);
    res.status(201).json(artwork);
  } catch (error) {
    logger.error('Failed to submit artwork:', error);
    res.status(500).json({ error: 'Failed to submit artwork' });
  }
});

router.get('/artworks', async (req, res) => {
  try {
    const { profileId, profileType, status } = req.query;
    
    if (!profileId || !profileType) {
      return res.status(400).json({ error: 'Profile ID and type are required' });
    }

    const artworks = await artistPortalService.getSubmittedArtworks(profileId, profileType, status);
    res.json(artworks);
  } catch (error) {
    logger.error('Failed to get submitted artworks:', error);
    res.status(500).json({ error: 'Failed to get submitted artworks' });
  }
});

router.put('/artworks/:artworkId', async (req, res) => {
  try {
    const { artworkId } = req.params;
    const { profileId, profileType } = req.body;
    
    if (!profileId || !profileType) {
      return res.status(400).json({ error: 'Profile ID and type are required' });
    }

    const artwork = await artistPortalService.updateArtworkSubmission(
      artworkId, profileId, profileType, req.body
    );
    
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found or cannot be updated' });
    }
    
    res.json(artwork);
  } catch (error) {
    logger.error('Failed to update artwork submission:', error);
    res.status(500).json({ error: 'Failed to update artwork submission' });
  }
});

// Exhibition Submission Routes (Gallery only)
router.post('/exhibitions', async (req, res) => {
  try {
    const { galleryProfileId } = req.body;
    
    if (!galleryProfileId) {
      return res.status(400).json({ error: 'Gallery profile ID is required' });
    }

    const exhibition = await artistPortalService.submitExhibition(galleryProfileId, req.body);
    res.status(201).json(exhibition);
  } catch (error) {
    logger.error('Failed to submit exhibition:', error);
    res.status(500).json({ error: 'Failed to submit exhibition' });
  }
});

router.get('/exhibitions', async (req, res) => {
  try {
    const { galleryProfileId, status } = req.query;
    
    if (!galleryProfileId) {
      return res.status(400).json({ error: 'Gallery profile ID is required' });
    }

    const exhibitions = await artistPortalService.getSubmittedExhibitions(galleryProfileId, status);
    res.json(exhibitions);
  } catch (error) {
    logger.error('Failed to get submitted exhibitions:', error);
    res.status(500).json({ error: 'Failed to get submitted exhibitions' });
  }
});

// Admin Routes (require admin role)

router.get('/admin/submissions/pending', requireAdmin, async (req, res) => {
  try {
    const { type } = req.query; // 'artworks', 'exhibitions', or null for both
    const submissions = await artistPortalService.getPendingSubmissions(type);
    res.json(submissions);
  } catch (error) {
    logger.error('Failed to get pending submissions:', error);
    res.status(500).json({ error: 'Failed to get pending submissions' });
  }
});

router.post('/admin/submissions/:submissionType/:submissionId/review', requireAdmin, async (req, res) => {
  try {
    const { submissionType, submissionId } = req.params;
    const { status, review_notes, quality_score, feedback } = req.body;
    
    if (!['artwork', 'exhibition'].includes(submissionType)) {
      return res.status(400).json({ error: 'Invalid submission type' });
    }
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const reviewedSubmission = await artistPortalService.reviewSubmission(
      submissionType,
      submissionId,
      req.userId,
      { status, review_notes, quality_score, feedback }
    );
    
    res.json(reviewedSubmission);
  } catch (error) {
    logger.error('Failed to review submission:', error);
    res.status(500).json({ error: 'Failed to review submission' });
  }
});

router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await artistPortalService.getPortalStats();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get portal stats:', error);
    res.status(500).json({ error: 'Failed to get portal stats' });
  }
});

// Public Routes (for browsing approved content)
router.get('/public/artists', async (req, res) => {
  try {
    const { page = 1, limit = 20, specialty } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT ap.id, ap.artist_name, ap.bio, ap.specialties, 
             ap.profile_image_url, ap.verified,
             COUNT(sa.id) as artwork_count
      FROM artist_profiles ap
      LEFT JOIN submitted_artworks sa ON ap.id = sa.artist_profile_id 
        AND sa.submission_status = 'approved'
      WHERE ap.status = 'approved'
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (specialty) {
      query += ` AND $${paramCount} = ANY(ap.specialties)`;
      params.push(specialty);
      paramCount++;
    }
    
    query += `
      GROUP BY ap.id
      ORDER BY ap.verified DESC, artwork_count DESC, ap.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error('Failed to get public artists:', error);
    res.status(500).json({ error: 'Failed to get artists' });
  }
});

router.get('/public/galleries', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT gp.id, gp.gallery_name, gp.description, gp.gallery_type,
             gp.address, gp.profile_image_url, gp.verified,
             COUNT(DISTINCT sa.id) as artwork_count,
             COUNT(DISTINCT se.id) as exhibition_count
      FROM gallery_profiles gp
      LEFT JOIN submitted_artworks sa ON gp.id = sa.gallery_profile_id 
        AND sa.submission_status = 'approved'
      LEFT JOIN submitted_exhibitions se ON gp.id = se.gallery_profile_id 
        AND se.submission_status = 'approved'
      WHERE gp.status = 'approved'
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (type) {
      query += ` AND gp.gallery_type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }
    
    query += `
      GROUP BY gp.id
      ORDER BY gp.verified DESC, (COUNT(DISTINCT sa.id) + COUNT(DISTINCT se.id)) DESC, gp.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error('Failed to get public galleries:', error);
    res.status(500).json({ error: 'Failed to get galleries' });
  }
});

module.exports = router;