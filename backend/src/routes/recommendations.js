const router = require('express').Router();
const ProfileModel = require('../models/Profile');
const ArtworkScoringService = require('../services/artworkScoring');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get personalized artwork recommendations
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await ProfileModel.findByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Parse artwork scores and preferences
    const artworkScores = typeof profile.artwork_scores === 'string' 
      ? JSON.parse(profile.artwork_scores) 
      : profile.artwork_scores;

    // Generate recommendations based on profile
    const mockPreferences = {
      tagScores: artworkScores,
      topTags: Object.entries(artworkScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([tag]) => tag),
      dominantStyle: profile.dominant_artwork_style || 'Balanced Aesthetic',
      categories: {
        abstraction: (artworkScores.symbolic_complexity || 0) + (artworkScores.spatial_complexity || 0),
        realism: (artworkScores.clear_narrative || 0) + (artworkScores.representational_form || 0),
        emotion: (artworkScores.emotional_resonance || 0) + (artworkScores.calm_mood || 0),
        technical: (artworkScores.material_detail || 0) + (artworkScores.vivid_color || 0)
      }
    };

    const recommendations = ArtworkScoringService.getArtworkRecommendations(mockPreferences);

    res.json({
      recommendations,
      userPreferences: {
        dominantStyle: profile.dominant_artwork_style,
        topTags: mockPreferences.topTags,
        artworkScores: artworkScores
      },
      generatePrompt: ArtworkScoringService.generateArtworkPrompt(mockPreferences.topTags)
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Generate new artwork based on user preferences
router.post('/generate', async (req, res) => {
  try {
    const userId = req.userId;
    const { style, tags } = req.body;
    
    const profile = await ProfileModel.findByUserId(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Use provided tags or fall back to user's top preferences
    let targetTags = tags;
    if (!targetTags) {
      const artworkScores = typeof profile.artwork_scores === 'string' 
        ? JSON.parse(profile.artwork_scores) 
        : profile.artwork_scores;
      
      targetTags = Object.entries(artworkScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([tag]) => tag);
    }

    const artworkPrompt = ArtworkScoringService.generateArtworkPrompt(targetTags);

    res.json({
      prompt: artworkPrompt,
      tags: targetTags,
      style: style || profile.dominant_artwork_style,
      message: 'Artwork prompt generated successfully'
    });
  } catch (error) {
    console.error('Generate artwork error:', error);
    res.status(500).json({ error: 'Failed to generate artwork prompt' });
  }
});

module.exports = router;
