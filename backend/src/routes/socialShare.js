const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const socialShareService = require('../services/socialShareService');
const logger = require('../utils/logger');

router.use(authMiddleware);

// Generate share URLs for content
router.post('/generate', async (req, res) => {
  try {
    const { contentType, contentId, additionalData = {} } = req.body;
    
    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'Content type and ID are required' });
    }

    let content;
    const { pool } = require('../config/database');

    // Fetch content based on type
    switch (contentType) {
      case 'artwork':
        const artworkQuery = 'SELECT * FROM artworks WHERE id = $1';
        const artworkResult = await pool.query(artworkQuery, [contentId]);
        content = artworkResult.rows[0];
        
        if (!content) {
          return res.status(404).json({ error: 'Artwork not found' });
        }
        
        // Get user profile if not provided
        if (!additionalData.userProfile) {
          const profileQuery = 'SELECT * FROM user_profiles WHERE user_id = $1';
          const profileResult = await pool.query(profileQuery, [req.userId]);
          additionalData.userProfile = profileResult.rows[0];
        }
        break;

      case 'quiz':
        const quizQuery = 'SELECT * FROM quiz_sessions WHERE id = $1 AND user_id = $2';
        const quizResult = await pool.query(quizQuery, [contentId, req.userId]);
        content = quizResult.rows[0];
        
        if (!content) {
          return res.status(404).json({ error: 'Quiz session not found' });
        }
        
        // Get user profile
        const profileQuery = 'SELECT * FROM user_profiles WHERE user_id = $1';
        const profileResult = await pool.query(profileQuery, [req.userId]);
        additionalData.userProfile = profileResult.rows[0];
        break;

      case 'exhibition':
        const exhibitionQuery = 'SELECT * FROM exhibitions WHERE id = $1';
        const exhibitionResult = await pool.query(exhibitionQuery, [contentId]);
        content = exhibitionResult.rows[0];
        
        if (!content) {
          return res.status(404).json({ error: 'Exhibition not found' });
        }
        break;

      case 'achievement':
        const achievementQuery = `
          SELECT ua.*, a.name, a.description, a.icon, a.rarity
          FROM user_achievements ua
          JOIN achievements a ON ua.achievement_id = a.id
          WHERE ua.id = $1 AND ua.user_id = $2
        `;
        const achievementResult = await pool.query(achievementQuery, [contentId, req.userId]);
        content = achievementResult.rows[0];
        
        if (!content) {
          return res.status(404).json({ error: 'Achievement not found' });
        }
        
        // Get user profile
        const userProfileQuery = 'SELECT * FROM user_profiles WHERE user_id = $1';
        const userProfileResult = await pool.query(userProfileQuery, [req.userId]);
        additionalData.userProfile = userProfileResult.rows[0];
        break;

      case 'community':
        const topicQuery = `
          SELECT ft.*, f.name as forum_name, f.slug as forum_slug
          FROM forum_topics ft
          JOIN forums f ON ft.forum_id = f.id
          WHERE ft.id = $1
        `;
        const topicResult = await pool.query(topicQuery, [contentId]);
        content = topicResult.rows[0];
        
        if (!content) {
          return res.status(404).json({ error: 'Topic not found' });
        }
        
        additionalData.forum = {
          name: content.forum_name,
          slug: content.forum_slug
        };
        break;

      default:
        return res.status(400).json({ error: 'Unsupported content type' });
    }

    // Generate share URLs
    const shareUrls = socialShareService.generateAllPlatformUrls(
      contentType, 
      content, 
      additionalData
    );

    res.json(shareUrls);
    
  } catch (error) {
    logger.error('Failed to generate share URLs:', error);
    res.status(500).json({ error: 'Failed to generate share URLs' });
  }
});

// Generate native share data (for Web Share API)
router.post('/native', async (req, res) => {
  try {
    const { contentType, contentId, additionalData = {} } = req.body;
    
    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'Content type and ID are required' });
    }

    // Get content (similar logic as above, but simplified)
    let content;
    const { pool } = require('../config/database');

    switch (contentType) {
      case 'artwork':
        const artworkQuery = 'SELECT * FROM artworks WHERE id = $1';
        const artworkResult = await pool.query(artworkQuery, [contentId]);
        content = artworkResult.rows[0];
        
        if (!additionalData.userProfile) {
          const profileQuery = 'SELECT * FROM user_profiles WHERE user_id = $1';
          const profileResult = await pool.query(profileQuery, [req.userId]);
          additionalData.userProfile = profileResult.rows[0];
        }
        break;

      // Add other cases as needed...
      default:
        return res.status(400).json({ error: 'Unsupported content type for native sharing' });
    }

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const nativeShareData = socialShareService.generateNativeShareData(
      contentType, 
      content, 
      additionalData
    );

    res.json(nativeShareData);
    
  } catch (error) {
    logger.error('Failed to generate native share data:', error);
    res.status(500).json({ error: 'Failed to generate native share data' });
  }
});

// Track a share event
router.post('/track', async (req, res) => {
  try {
    const { contentType, contentId, platform } = req.body;
    
    if (!contentType || !contentId || !platform) {
      return res.status(400).json({ error: 'Content type, ID, and platform are required' });
    }

    const trackingResult = await socialShareService.trackShare(
      req.userId, 
      contentType, 
      contentId, 
      platform
    );

    res.json({ success: true, trackingId: trackingResult.id });
    
  } catch (error) {
    logger.error('Failed to track share:', error);
    res.status(500).json({ error: 'Failed to track share' });
  }
});

// Get user's share analytics
router.get('/analytics', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const analytics = await socialShareService.getShareAnalytics(req.userId, timeframe);
    
    res.json({ analytics });
    
  } catch (error) {
    logger.error('Failed to get share analytics:', error);
    res.status(500).json({ error: 'Failed to get share analytics' });
  }
});

// Get platform-specific share URL
router.get('/url/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { contentType, contentId, text, url, title } = req.query;
    
    if (!contentType && (!text || !url)) {
      return res.status(400).json({ 
        error: 'Either contentType/contentId or text/url/title must be provided' 
      });
    }

    let shareData;
    
    if (contentType && contentId) {
      // Generate from content
      // This would require fetching content again - simplified for now
      shareData = { text, url, title };
    } else {
      // Use provided data
      shareData = { text, url, title };
    }

    const shareUrl = socialShareService.generateShareUrl(platform, shareData);
    
    res.json({ shareUrl });
    
  } catch (error) {
    logger.error(`Failed to generate ${req.params.platform} share URL:`, error);
    res.status(500).json({ error: 'Failed to generate share URL' });
  }
});

module.exports = router;