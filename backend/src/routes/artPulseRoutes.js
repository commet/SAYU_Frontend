const express = require('express');
const router = express.Router();
const artPulseService = require('../services/artPulseService');
const socketService = require('../services/socketService');
const { getSupabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { body, query } = require('express-validator');
const { logger } = require('../config/logger');

// Get current Art Pulse session
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const session = await artPulseService.getCurrentSession();
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active Art Pulse session'
      });
    }

    // Get real-time data
    const emotions = artPulseService.getEmotionDistribution(session.id);
    const reflections = artPulseService.getReflections(session.id);
    const participantCount = artPulseService.getParticipantCount(session.id);

    res.json({
      success: true,
      data: {
        session,
        emotions,
        reflections,
        participantCount
      }
    });
  } catch (error) {
    logger.error('Error getting current Art Pulse session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Join Art Pulse session
router.post('/join', 
  authenticateToken,
  [
    body('sessionId').optional().isString().trim()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { sessionId } = req.body;

      const result = await artPulseService.joinSession(userId, sessionId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error joining Art Pulse session:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Submit emotion during contemplation phase
router.post('/emotion',
  authenticateToken,
  [
    body('sessionId').isString().trim().notEmpty(),
    body('emotion').isIn(['wonder', 'melancholy', 'joy', 'contemplation', 'nostalgia', 'awe', 'serenity', 'passion', 'mystery', 'hope']),
    body('intensity').optional().isFloat({ min: 0.1, max: 1.0 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { sessionId, emotion, intensity = 1 } = req.body;

      const distribution = await artPulseService.submitEmotion(userId, sessionId, emotion, intensity);
      
      res.json({
        success: true,
        data: { distribution }
      });
    } catch (error) {
      logger.error('Error submitting Art Pulse emotion:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Submit reflection during sharing phase
router.post('/reflection',
  authenticateToken,
  [
    body('sessionId').isString().trim().notEmpty(),
    body('reflection').isString().trim().isLength({ min: 10, max: 500 }),
    body('isAnonymous').optional().isBoolean()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { sessionId, reflection, isAnonymous = false } = req.body;

      const reflectionData = await artPulseService.submitReflection(userId, sessionId, reflection, isAnonymous);
      
      res.json({
        success: true,
        data: reflectionData
      });
    } catch (error) {
      logger.error('Error submitting Art Pulse reflection:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Like/unlike a reflection
router.post('/reflection/:reflectionId/like',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { reflectionId } = req.params;
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
      }

      const reflection = await artPulseService.likeReflection(userId, sessionId, reflectionId);
      
      res.json({
        success: true,
        data: reflection
      });
    } catch (error) {
      logger.error('Error liking Art Pulse reflection:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Get session history
router.get('/history',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const supabase = getSupabaseAdmin();
      const { data: sessions, error, count } = await supabase
        .from('art_pulse_sessions')
        .select(`
          *,
          artworks (
            id, title, artist, image_url, description
          )
        `, { count: 'exact' })
        .eq('status', 'completed')
        .order('start_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      res.json({
        success: true,
        data: {
          sessions: sessions || [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count || 0,
            pages: Math.ceil((count || 0) / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error getting Art Pulse history:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Get weekly reflection league
router.get('/league/weekly', authenticateToken, async (req, res) => {
  try {
    const league = await artPulseService.getWeeklyLeague();
    
    res.json({
      success: true,
      data: league
    });
  } catch (error) {
    logger.error('Error getting weekly league:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin: Start Art Pulse session manually
router.post('/admin/start',
  authenticateToken,
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const session = await artPulseService.startDailyArtPulse();
      
      // Broadcast new session to all connected users
      socketService.broadcastNewArtPulseSession(session);
      
      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      logger.error('Error starting Art Pulse session:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Admin: Get session analytics
router.get('/admin/analytics/:sessionId',
  authenticateToken,
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { sessionId } = req.params;
      const supabase = getSupabaseAdmin();

      // Get detailed session analytics
      const { data: session } = await supabase
        .from('art_pulse_sessions')
        .select(`
          *,
          art_pulse_participations (
            user_id,
            joined_at,
            sayu_type,
            profiles!user_id (username)
          ),
          art_pulse_emotions (
            emotion,
            intensity,
            submitted_at,
            profiles!user_id (username, sayu_type)
          ),
          art_pulse_reflections (
            reflection,
            is_anonymous,
            created_at,
            profiles!user_id (username, sayu_type)
          )
        `)
        .eq('id', sessionId)
        .single();

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      logger.error('Error getting session analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Get Art Pulse statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get overall statistics
    const [
      { count: totalSessions },
      { count: totalParticipations },
      { count: totalReflections },
      { data: popularEmotions }
    ] = await Promise.all([
      supabase.from('art_pulse_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('art_pulse_participations').select('*', { count: 'exact', head: true }),
      supabase.from('art_pulse_reflections').select('*', { count: 'exact', head: true }),
      supabase.from('art_pulse_emotions')
        .select('emotion')
        .gte('submitted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    // Calculate emotion popularity
    const emotionCounts = {};
    popularEmotions?.forEach(({ emotion }) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    const topEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    res.json({
      success: true,
      data: {
        totalSessions: totalSessions || 0,
        totalParticipations: totalParticipations || 0,
        totalReflections: totalReflections || 0,
        topEmotionsThisWeek: topEmotions,
        averageParticipantsPerSession: totalParticipations && totalSessions ? 
          Math.round((totalParticipations / totalSessions) * 10) / 10 : 0
      }
    });
  } catch (error) {
    logger.error('Error getting Art Pulse stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;