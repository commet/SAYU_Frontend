const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { getSupabaseAdmin } = require('../config/supabase');
const { logger } = require('../config/logger');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    const allowedMimes = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/mp4'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

router.use(authMiddleware);

// Get all reflections for the current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { limit = 20, offset = 0, exhibition_id } = req.query;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    let query = supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId)
      .order('visit_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (exhibition_id) {
      query = query.eq('exhibition_id', exhibition_id);
    }

    const { data: reflections, error } = await query;

    if (error) throw error;

    res.json({
      reflections,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: reflections?.length || 0
      }
    });
  } catch (error) {
    logger.error('Error fetching reflections:', error);
    res.status(500).json({ error: 'Failed to fetch reflections' });
  }
});

// Get a specific reflection
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    const { data: reflection, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Reflection not found' });
      }
      throw error;
    }

    // Check if user has permission to view
    if (reflection.user_id !== userId && !reflection.is_public) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(reflection);
  } catch (error) {
    logger.error('Error fetching reflection:', error);
    res.status(500).json({ error: 'Failed to fetch reflection' });
  }
});

// Create a new reflection
router.post('/', [
  body('exhibition_id').optional().isString(),
  body('exhibition_name').notEmpty().withMessage('Exhibition name is required'),
  body('museum_name').optional().isString(),
  body('overall_rating').optional().isInt({ min: 1, max: 5 }),
  body('emotion').optional().isString(),
  body('reflection_text').optional().isString(),
  body('favorite_artwork').optional().isString(),
  body('key_takeaway').optional().isString(),
  body('companion_id').optional().isUUID(),
  body('companion_name').optional().isString(),
  body('visit_duration').optional().isInt({ min: 0 }),
  body('weather').optional().isString(),
  body('mood_before').optional().isString(),
  body('mood_after').optional().isString(),
  body('tags').optional().isArray(),
  body('is_public').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id || req.userId;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    const reflectionData = {
      user_id: userId,
      ...req.body,
      visit_date: req.body.visit_date || new Date()
    };

    const { data: reflection, error } = await supabase
      .from('reflections')
      .insert(reflectionData)
      .select()
      .single();

    if (error) throw error;

    // Update gamification points
    try {
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      const newTotalPoints = (userPoints?.total_points || 0) + 20; // 20 points for reflection
      const newArtworkPoints = (userPoints?.artwork_points || 0) + 20;

      await supabase
        .from('user_points')
        .upsert({
          user_id: userId,
          total_points: newTotalPoints,
          artwork_points: newArtworkPoints,
          quiz_points: userPoints?.quiz_points || 0,
          social_points: userPoints?.social_points || 0
        });
    } catch (pointsError) {
      logger.error('Error updating points:', pointsError);
    }

    res.status(201).json(reflection);
  } catch (error) {
    logger.error('Error creating reflection:', error);
    res.status(500).json({ error: 'Failed to create reflection' });
  }
});

// Update a reflection
router.put('/:id', [
  body('overall_rating').optional().isInt({ min: 1, max: 5 }),
  body('emotion').optional().isString(),
  body('reflection_text').optional().isString(),
  body('favorite_artwork').optional().isString(),
  body('key_takeaway').optional().isString(),
  body('tags').optional().isArray(),
  body('is_public').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user?.id || req.userId;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    // Check ownership
    const { data: existing } = await supabase
      .from('reflections')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: reflection, error } = await supabase
      .from('reflections')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(reflection);
  } catch (error) {
    logger.error('Error updating reflection:', error);
    res.status(500).json({ error: 'Failed to update reflection' });
  }
});

// Delete a reflection
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    // Check ownership
    const { data: existing } = await supabase
      .from('reflections')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('reflections')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting reflection:', error);
    res.status(500).json({ error: 'Failed to delete reflection' });
  }
});

// Get public reflections feed
router.get('/feed/public', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    const { data: reflections, error } = await supabase
      .from('reflections')
      .select(`
        *,
        profiles!user_id (
          username,
          profile_image
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      reflections,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    logger.error('Error fetching public reflections:', error);
    res.status(500).json({ error: 'Failed to fetch public reflections' });
  }
});

// Get reflection statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    const { data: reflections, error } = await supabase
      .from('reflections')
      .select('overall_rating, emotion, visit_duration, tags')
      .eq('user_id', userId);

    if (error) throw error;

    // Calculate statistics
    const stats = {
      totalReflections: reflections.length,
      averageRating: reflections.length > 0 
        ? reflections.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reflections.filter(r => r.overall_rating).length
        : 0,
      totalVisitTime: reflections.reduce((sum, r) => sum + (r.visit_duration || 0), 0),
      topEmotions: {},
      topTags: {}
    };

    // Count emotions
    reflections.forEach(r => {
      if (r.emotion) {
        stats.topEmotions[r.emotion] = (stats.topEmotions[r.emotion] || 0) + 1;
      }
    });

    // Count tags
    reflections.forEach(r => {
      if (r.tags && Array.isArray(r.tags)) {
        r.tags.forEach(tag => {
          stats.topTags[tag] = (stats.topTags[tag] || 0) + 1;
        });
      }
    });

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching reflection stats:', error);
    res.status(500).json({ error: 'Failed to fetch reflection statistics' });
  }
});

// Upload voice note for a reflection
router.post('/:id/voice-note', upload.single('audio'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    // Check ownership
    const { data: existing } = await supabase
      .from('reflections')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // Cloudinary uses 'video' for audio files
          folder: `sayu/voice-notes/${userId}`,
          public_id: `reflection-${id}-${Date.now()}`,
          format: 'mp3' // Convert to mp3 for better compatibility
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Update reflection with voice note URL
    const { data: reflection, error } = await supabase
      .from('reflections')
      .update({ voice_note_url: uploadResult.secure_url })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      message: 'Voice note uploaded successfully',
      voice_note_url: uploadResult.secure_url,
      reflection 
    });
  } catch (error) {
    logger.error('Error uploading voice note:', error);
    res.status(500).json({ error: 'Failed to upload voice note' });
  }
});

// Delete voice note from a reflection
router.delete('/:id/voice-note', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.userId;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    // Check ownership and get current voice note URL
    const { data: existing } = await supabase
      .from('reflections')
      .select('user_id, voice_note_url')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!existing.voice_note_url) {
      return res.status(404).json({ error: 'No voice note found' });
    }

    // Extract public_id from Cloudinary URL for deletion
    const urlParts = existing.voice_note_url.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];
    const folder = urlParts.slice(-3, -1).join('/');

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(`${folder}/${publicId}`, {
        resource_type: 'video'
      });
    } catch (cloudinaryError) {
      logger.error('Error deleting from Cloudinary:', cloudinaryError);
    }

    // Update reflection to remove voice note URL
    const { error } = await supabase
      .from('reflections')
      .update({ voice_note_url: null })
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Voice note deleted successfully' });
  } catch (error) {
    logger.error('Error deleting voice note:', error);
    res.status(500).json({ error: 'Failed to delete voice note' });
  }
});

module.exports = router;
