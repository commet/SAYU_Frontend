const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { 
  validationSchemas, 
  handleValidationResult, 
  securityHeaders, 
  requestSizeLimiter,
  sanitizeInput,
  rateLimits 
} = require('../middleware/validation');
const { pool } = require('../config/database');
const { log } = require('../config/logger');
const { ProgressTracker } = require('../models/Achievement');

// Apply security middleware
router.use(securityHeaders);
router.use(sanitizeInput);
router.use(requestSizeLimiter('5mb'));
router.use(authMiddleware);

// Create exhibitions and artworks tables if they don't exist
async function createArchiveTables() {
  const createExhibitionsSQL = `
    CREATE TABLE IF NOT EXISTS user_exhibitions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      exhibition_name VARCHAR(500) NOT NULL,
      venue VARCHAR(500) NOT NULL,
      visit_date DATE NOT NULL,
      overall_impression TEXT,
      mood_tags JSONB DEFAULT '[]',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createArtworkEntriesSQL = `
    CREATE TABLE IF NOT EXISTS user_artwork_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      exhibition_id UUID REFERENCES user_exhibitions(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(500) NOT NULL,
      artist VARCHAR(500) NOT NULL,
      year VARCHAR(50),
      medium VARCHAR(200),
      impression TEXT NOT NULL,
      emotion_rating INTEGER CHECK (emotion_rating BETWEEN 1 AND 5),
      technical_rating INTEGER CHECK (technical_rating BETWEEN 1 AND 5),
      image_url TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createIndexesSQL = `
    CREATE INDEX IF NOT EXISTS idx_user_exhibitions_user_id ON user_exhibitions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_exhibitions_visit_date ON user_exhibitions(visit_date DESC);
    CREATE INDEX IF NOT EXISTS idx_artwork_entries_exhibition_id ON user_artwork_entries(exhibition_id);
    CREATE INDEX IF NOT EXISTS idx_artwork_entries_user_id ON user_artwork_entries(user_id);
  `;

  try {
    await pool.query(createExhibitionsSQL);
    await pool.query(createArtworkEntriesSQL);
    await pool.query(createIndexesSQL);
    console.log('✅ Archive tables created successfully');
  } catch (error) {
    console.error('❌ Error creating archive tables:', error);
  }
}

// Initialize tables on startup
createArchiveTables();

// Get user's exhibitions
router.get('/exhibitions',
  rateLimits.lenient,
  async (req, res) => {
    try {
      const userId = req.userId;
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const offset = parseInt(req.query.offset) || 0;

      // Get exhibitions with artwork counts
      const result = await pool.query(`
        SELECT 
          e.*,
          COUNT(a.id) as artwork_count,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', a.id,
                'title', a.title,
                'artist', a.artist,
                'year', a.year,
                'medium', a.medium,
                'impression', a.impression,
                'emotion_rating', a.emotion_rating,
                'technical_rating', a.technical_rating,
                'image_url', a.image_url,
                'created_at', a.created_at
              ) ORDER BY a.created_at
            ) FILTER (WHERE a.id IS NOT NULL),
            '[]'
          ) as artworks
        FROM user_exhibitions e
        LEFT JOIN user_artwork_entries a ON e.id = a.exhibition_id
        WHERE e.user_id = $1
        GROUP BY e.id
        ORDER BY e.visit_date DESC, e.created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      const exhibitions = result.rows.map(exhibition => ({
        ...exhibition,
        mood_tags: exhibition.mood_tags || [],
        metadata: exhibition.metadata || {},
        artworks: exhibition.artworks || []
      }));

      res.json({
        exhibitions,
        total: exhibitions.length,
        has_more: exhibitions.length === limit
      });

    } catch (error) {
      log.error('Get exhibitions error', error, {
        userId: req.userId,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to fetch exhibitions' });
    }
  }
);

// Create new exhibition
router.post('/exhibitions',
  rateLimits.moderate,
  [
    require('express-validator').body('exhibition_name')
      .isLength({ min: 1, max: 500 })
      .withMessage('Exhibition name is required and must be under 500 characters'),
    require('express-validator').body('venue')
      .isLength({ min: 1, max: 500 })
      .withMessage('Venue is required and must be under 500 characters'),
    require('express-validator').body('visit_date')
      .isISO8601()
      .withMessage('Valid visit date is required'),
    require('express-validator').body('artworks')
      .isArray()
      .withMessage('Artworks must be an array'),
    require('express-validator').body('artworks.*.title')
      .optional()
      .isLength({ min: 1, max: 500 })
      .withMessage('Artwork title must be under 500 characters'),
    require('express-validator').body('artworks.*.artist')
      .optional()
      .isLength({ min: 1, max: 500 })
      .withMessage('Artist name must be under 500 characters'),
    require('express-validator').body('artworks.*.impression')
      .optional()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Impression must be under 5000 characters'),
    require('express-validator').body('artworks.*.emotion_rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Emotion rating must be between 1 and 5'),
    require('express-validator').body('artworks.*.technical_rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Technical rating must be between 1 and 5')
  ],
  handleValidationResult,
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const userId = req.userId;
      const {
        exhibition_name,
        venue,
        visit_date,
        overall_impression,
        mood_tags,
        artworks = []
      } = req.body;

      // Create exhibition
      const exhibitionResult = await client.query(`
        INSERT INTO user_exhibitions (
          user_id, exhibition_name, venue, visit_date, 
          overall_impression, mood_tags
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        userId,
        exhibition_name,
        venue,
        visit_date,
        overall_impression || null,
        JSON.stringify(mood_tags || [])
      ]);

      const exhibition = exhibitionResult.rows[0];

      // Create artwork entries
      const artworkEntries = [];
      for (const artwork of artworks) {
        if (artwork.title && artwork.artist && artwork.impression) {
          const artworkResult = await client.query(`
            INSERT INTO user_artwork_entries (
              exhibition_id, user_id, title, artist, year, medium,
              impression, emotion_rating, technical_rating, image_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
          `, [
            exhibition.id,
            userId,
            artwork.title,
            artwork.artist,
            artwork.year || null,
            artwork.medium || null,
            artwork.impression,
            artwork.emotion_rating || 3,
            artwork.technical_rating || 3,
            artwork.image_url || null
          ]);

          artworkEntries.push(artworkResult.rows[0]);
        }
      }

      await client.query('COMMIT');

      log.userAction(userId, 'exhibition_created', {
        exhibition_id: exhibition.id,
        venue: venue,
        artwork_count: artworkEntries.length
      });

      // Track achievements
      await ProgressTracker.updateUserProgress(userId, 'exhibition_archived');
      if (artworkEntries.length > 0) {
        await ProgressTracker.updateUserProgress(userId, 'artwork_documented', { 
          artwork_count: artworkEntries.length 
        });
      }

      res.status(201).json({
        message: 'Exhibition created successfully',
        exhibition: {
          ...exhibition,
          mood_tags: exhibition.mood_tags || [],
          artworks: artworkEntries
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      log.error('Create exhibition error', error, {
        userId: req.userId,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to create exhibition' });
    } finally {
      client.release();
    }
  }
);

// Get specific exhibition with artworks
router.get('/exhibitions/:id',
  rateLimits.lenient,
  async (req, res) => {
    try {
      const userId = req.userId;
      const exhibitionId = req.params.id;

      // Get exhibition
      const exhibitionResult = await pool.query(`
        SELECT * FROM user_exhibitions 
        WHERE id = $1 AND user_id = $2
      `, [exhibitionId, userId]);

      if (exhibitionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Exhibition not found' });
      }

      const exhibition = exhibitionResult.rows[0];

      // Get artworks
      const artworksResult = await pool.query(`
        SELECT * FROM user_artwork_entries 
        WHERE exhibition_id = $1 
        ORDER BY created_at
      `, [exhibitionId]);

      res.json({
        exhibition: {
          ...exhibition,
          mood_tags: exhibition.mood_tags || [],
          metadata: exhibition.metadata || {},
          artworks: artworksResult.rows
        }
      });

    } catch (error) {
      log.error('Get exhibition error', error, {
        userId: req.userId,
        exhibitionId: req.params.id,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to fetch exhibition' });
    }
  }
);

// Update exhibition
router.put('/exhibitions/:id',
  rateLimits.moderate,
  [
    require('express-validator').body('overall_impression')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Overall impression must be under 5000 characters'),
    require('express-validator').body('mood_tags')
      .optional()
      .isArray()
      .withMessage('Mood tags must be an array')
  ],
  handleValidationResult,
  async (req, res) => {
    try {
      const userId = req.userId;
      const exhibitionId = req.params.id;
      const { overall_impression, mood_tags } = req.body;

      const result = await pool.query(`
        UPDATE user_exhibitions 
        SET 
          overall_impression = COALESCE($3, overall_impression),
          mood_tags = COALESCE($4, mood_tags),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, [
        exhibitionId,
        userId,
        overall_impression,
        mood_tags ? JSON.stringify(mood_tags) : null
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Exhibition not found' });
      }

      res.json({
        message: 'Exhibition updated successfully',
        exhibition: {
          ...result.rows[0],
          mood_tags: result.rows[0].mood_tags || []
        }
      });

    } catch (error) {
      log.error('Update exhibition error', error, {
        userId: req.userId,
        exhibitionId: req.params.id,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to update exhibition' });
    }
  }
);

// Get user's exhibition statistics
router.get('/stats',
  rateLimits.lenient,
  async (req, res) => {
    try {
      const userId = req.userId;

      const result = await pool.query(`
        SELECT 
          COUNT(DISTINCT e.id) as total_exhibitions,
          COUNT(a.id) as total_artworks,
          AVG(a.emotion_rating) as avg_emotion_rating,
          AVG(a.technical_rating) as avg_technical_rating,
          COUNT(DISTINCT e.venue) as unique_venues,
          MIN(e.visit_date) as first_visit,
          MAX(e.visit_date) as latest_visit
        FROM user_exhibitions e
        LEFT JOIN user_artwork_entries a ON e.id = a.exhibition_id
        WHERE e.user_id = $1
      `, [userId]);

      const stats = result.rows[0];

      // Get most visited venues
      const venuesResult = await pool.query(`
        SELECT venue, COUNT(*) as visit_count
        FROM user_exhibitions
        WHERE user_id = $1
        GROUP BY venue
        ORDER BY visit_count DESC
        LIMIT 5
      `, [userId]);

      // Get favorite artists (most impressions)
      const artistsResult = await pool.query(`
        SELECT artist, COUNT(*) as artwork_count, AVG(emotion_rating) as avg_emotion
        FROM user_artwork_entries
        WHERE user_id = $1
        GROUP BY artist
        ORDER BY artwork_count DESC, avg_emotion DESC
        LIMIT 5
      `, [userId]);

      res.json({
        stats: {
          ...stats,
          total_exhibitions: parseInt(stats.total_exhibitions) || 0,
          total_artworks: parseInt(stats.total_artworks) || 0,
          avg_emotion_rating: parseFloat(stats.avg_emotion_rating) || 0,
          avg_technical_rating: parseFloat(stats.avg_technical_rating) || 0,
          unique_venues: parseInt(stats.unique_venues) || 0
        },
        top_venues: venuesResult.rows,
        favorite_artists: artistsResult.rows
      });

    } catch (error) {
      log.error('Get archive stats error', error, {
        userId: req.userId,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
);

// Delete exhibition
router.delete('/exhibitions/:id',
  rateLimits.moderate,
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const userId = req.userId;
      const exhibitionId = req.params.id;

      // Delete artwork entries first (foreign key constraint)
      await client.query(`
        DELETE FROM user_artwork_entries 
        WHERE exhibition_id = $1 AND user_id = $2
      `, [exhibitionId, userId]);

      // Delete exhibition
      const result = await client.query(`
        DELETE FROM user_exhibitions 
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, [exhibitionId, userId]);

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Exhibition not found' });
      }

      await client.query('COMMIT');

      log.userAction(userId, 'exhibition_deleted', {
        exhibition_id: exhibitionId
      });

      res.json({ message: 'Exhibition deleted successfully' });

    } catch (error) {
      await client.query('ROLLBACK');
      log.error('Delete exhibition error', error, {
        userId: req.userId,
        exhibitionId: req.params.id,
        requestId: req.id
      });
      res.status(500).json({ error: 'Failed to delete exhibition' });
    } finally {
      client.release();
    }
  }
);

module.exports = router;