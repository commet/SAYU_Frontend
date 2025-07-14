const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { pool } = require('../config/database');
const { redisClient } = require('../config/redis');
const { logger } = require('../config/logger');
const { 
  validationSchemas, 
  handleValidationResult, 
  securityHeaders, 
  requestSizeLimiter,
  sanitizeInput,
  rateLimits 
} = require('../middleware/validation');
const { query, param, body } = require('express-validator');

// Apply security middleware
router.use(securityHeaders);
router.use(sanitizeInput);
router.use(requestSizeLimiter('2mb'));
router.use(authMiddleware);

// Validation schemas
const galleryListValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('artist').optional().isString().trim().isLength({ min: 1, max: 100 }),
  query('sayuType').optional().isString().trim().isLength({ min: 1, max: 20 }),
  query('search').optional().isString().trim().isLength({ min: 1, max: 100 }),
  query('isLiked').optional().isBoolean(),
  query('isArchived').optional().isBoolean(),
  query('sortBy').optional().isIn(['title', 'artist', 'createdAt', 'updatedAt']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
];

const artworkIdValidation = [
  param('id').isUUID().withMessage('Artwork ID must be a valid UUID')
];

// Get user's personal gallery
router.get('/personal', 
  rateLimits.lenient,
  galleryListValidation,
  handleValidationResult,
  async (req, res) => {
    try {
      const userId = req.userId;
      const {
        page = 1,
        limit = 20,
        artist,
        sayuType,
        search,
        isLiked,
        isArchived,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      // Build WHERE clause
      const whereConditions = ['ua.user_id = $1'];
      const queryParams = [userId];
      let paramIndex = 2;

      if (artist) {
        whereConditions.push(`a.artist ILIKE $${paramIndex++}`);
        queryParams.push(`%${artist}%`);
      }

      if (sayuType) {
        whereConditions.push(`a.sayu_type = $${paramIndex++}`);
        queryParams.push(sayuType);
      }

      if (search) {
        whereConditions.push(`(a.title ILIKE $${paramIndex++} OR a.artist ILIKE $${paramIndex++})`);
        queryParams.push(`%${search}%`, `%${search}%`);
        paramIndex++;
      }

      if (isLiked !== undefined) {
        whereConditions.push(`ua.is_liked = $${paramIndex++}`);
        queryParams.push(isLiked === 'true');
      }

      if (isArchived !== undefined) {
        whereConditions.push(`ua.is_archived = $${paramIndex++}`);
        queryParams.push(isArchived === 'true');
      }

      const whereClause = whereConditions.join(' AND ');
      
      // Build ORDER BY clause
      const orderByMap = {
        title: 'a.title',
        artist: 'a.artist',
        createdAt: 'ua.created_at',
        updatedAt: 'ua.updated_at'
      };
      
      const orderBy = `ORDER BY ${orderByMap[sortBy] || 'ua.created_at'} ${sortOrder.toUpperCase()}`;

      // Main query
      const mainQuery = `
        SELECT 
          a.id,
          a.artvee_id,
          a.title,
          a.artist,
          a.url,
          a.sayu_type,
          a.image_url,
          a.thumbnail_url,
          a.metadata,
          ua.is_liked,
          ua.is_archived,
          ua.created_at,
          ua.updated_at
        FROM user_artworks ua
        JOIN artworks a ON ua.artwork_id = a.id
        WHERE ${whereClause}
        ${orderBy}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      // Count query
      const countQuery = `
        SELECT COUNT(*) as total
        FROM user_artworks ua
        JOIN artworks a ON ua.artwork_id = a.id
        WHERE ${whereClause}
      `;

      queryParams.push(parseInt(limit), offset);
      const countParams = queryParams.slice(0, -2);

      const [artworksResult, countResult] = await Promise.all([
        pool.query(mainQuery, queryParams),
        pool.query(countQuery, countParams)
      ]);

      const artists = artworksResult.rows;
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        artists,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      });

    } catch (error) {
      logger.error('Get personal gallery error:', error);
      res.status(500).json({ error: 'Failed to fetch personal gallery' });
    }
  }
);

// Get liked artworks
router.get('/liked',
  rateLimits.lenient,
  galleryListValidation,
  handleValidationResult,
  async (req, res) => {
    try {
      const userId = req.userId;
      const {
        page = 1,
        limit = 20,
        artist,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      // Build WHERE clause
      const whereConditions = ['ua.user_id = $1', 'ua.is_liked = true'];
      const queryParams = [userId];
      let paramIndex = 2;

      if (artist) {
        whereConditions.push(`a.artist ILIKE $${paramIndex++}`);
        queryParams.push(`%${artist}%`);
      }

      if (search) {
        whereConditions.push(`(a.title ILIKE $${paramIndex++} OR a.artist ILIKE $${paramIndex++})`);
        queryParams.push(`%${search}%`, `%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.join(' AND ');
      
      const orderByMap = {
        title: 'a.title',
        artist: 'a.artist',
        createdAt: 'ua.created_at',
        updatedAt: 'ua.updated_at'
      };
      
      const orderBy = `ORDER BY ${orderByMap[sortBy] || 'ua.created_at'} ${sortOrder.toUpperCase()}`;

      const mainQuery = `
        SELECT 
          a.id,
          a.artvee_id,
          a.title,
          a.artist,
          a.url,
          a.sayu_type,
          a.image_url,
          a.thumbnail_url,
          a.metadata,
          ua.is_liked,
          ua.is_archived,
          ua.created_at,
          ua.updated_at
        FROM user_artworks ua
        JOIN artworks a ON ua.artwork_id = a.id
        WHERE ${whereClause}
        ${orderBy}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM user_artworks ua
        JOIN artworks a ON ua.artwork_id = a.id
        WHERE ${whereClause}
      `;

      queryParams.push(parseInt(limit), offset);
      const countParams = queryParams.slice(0, -2);

      const [artworksResult, countResult] = await Promise.all([
        pool.query(mainQuery, queryParams),
        pool.query(countQuery, countParams)
      ]);

      const artists = artworksResult.rows;
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        artists,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      });

    } catch (error) {
      logger.error('Get liked artworks error:', error);
      res.status(500).json({ error: 'Failed to fetch liked artworks' });
    }
  }
);

// Get archived artworks
router.get('/archived',
  rateLimits.lenient,
  galleryListValidation,
  handleValidationResult,
  async (req, res) => {
    try {
      const userId = req.userId;
      const {
        page = 1,
        limit = 20,
        artist,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      // Build WHERE clause
      const whereConditions = ['ua.user_id = $1', 'ua.is_archived = true'];
      const queryParams = [userId];
      let paramIndex = 2;

      if (artist) {
        whereConditions.push(`a.artist ILIKE $${paramIndex++}`);
        queryParams.push(`%${artist}%`);
      }

      if (search) {
        whereConditions.push(`(a.title ILIKE $${paramIndex++} OR a.artist ILIKE $${paramIndex++})`);
        queryParams.push(`%${search}%`, `%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.join(' AND ');
      
      const orderByMap = {
        title: 'a.title',
        artist: 'a.artist',
        createdAt: 'ua.created_at',
        updatedAt: 'ua.updated_at'
      };
      
      const orderBy = `ORDER BY ${orderByMap[sortBy] || 'ua.created_at'} ${sortOrder.toUpperCase()}`;

      const mainQuery = `
        SELECT 
          a.id,
          a.artvee_id,
          a.title,
          a.artist,
          a.url,
          a.sayu_type,
          a.image_url,
          a.thumbnail_url,
          a.metadata,
          ua.is_liked,
          ua.is_archived,
          ua.created_at,
          ua.updated_at
        FROM user_artworks ua
        JOIN artworks a ON ua.artwork_id = a.id
        WHERE ${whereClause}
        ${orderBy}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM user_artworks ua
        JOIN artworks a ON ua.artwork_id = a.id
        WHERE ${whereClause}
      `;

      queryParams.push(parseInt(limit), offset);
      const countParams = queryParams.slice(0, -2);

      const [artworksResult, countResult] = await Promise.all([
        pool.query(mainQuery, queryParams),
        pool.query(countQuery, countParams)
      ]);

      const artists = artworksResult.rows;
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        artists,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      });

    } catch (error) {
      logger.error('Get archived artworks error:', error);
      res.status(500).json({ error: 'Failed to fetch archived artworks' });
    }
  }
);

// Like an artwork
router.post('/artworks/:id/like',
  rateLimits.strict,
  artworkIdValidation,
  handleValidationResult,
  async (req, res) => {
    try {
      const { id: artworkId } = req.params;
      const userId = req.userId;

      // Check if artwork exists
      const artworkCheck = await pool.query('SELECT id FROM artworks WHERE id = $1', [artworkId]);
      if (artworkCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Artwork not found' });
      }

      // Upsert user artwork with like
      await pool.query(`
        INSERT INTO user_artworks (user_id, artwork_id, is_liked)
        VALUES ($1, $2, true)
        ON CONFLICT (user_id, artwork_id)
        DO UPDATE SET is_liked = true, updated_at = CURRENT_TIMESTAMP
      `, [userId, artworkId]);

      res.json({ success: true, message: 'Artwork liked successfully' });

    } catch (error) {
      logger.error('Like artwork error:', error);
      res.status(500).json({ error: 'Failed to like artwork' });
    }
  }
);

// Unlike an artwork
router.delete('/artworks/:id/unlike',
  rateLimits.strict,
  artworkIdValidation,
  handleValidationResult,
  async (req, res) => {
    try {
      const { id: artworkId } = req.params;
      const userId = req.userId;

      // Update user artwork to remove like
      await pool.query(`
        UPDATE user_artworks 
        SET is_liked = false, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND artwork_id = $2
      `, [userId, artworkId]);

      res.json({ success: true, message: 'Artwork unliked successfully' });

    } catch (error) {
      logger.error('Unlike artwork error:', error);
      res.status(500).json({ error: 'Failed to unlike artwork' });
    }
  }
);

// Archive an artwork
router.post('/artworks/:id/archive',
  rateLimits.strict,
  artworkIdValidation,
  handleValidationResult,
  async (req, res) => {
    try {
      const { id: artworkId } = req.params;
      const userId = req.userId;

      // Check if artwork exists
      const artworkCheck = await pool.query('SELECT id FROM artworks WHERE id = $1', [artworkId]);
      if (artworkCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Artwork not found' });
      }

      // Upsert user artwork with archive
      await pool.query(`
        INSERT INTO user_artworks (user_id, artwork_id, is_archived)
        VALUES ($1, $2, true)
        ON CONFLICT (user_id, artwork_id)
        DO UPDATE SET is_archived = true, updated_at = CURRENT_TIMESTAMP
      `, [userId, artworkId]);

      res.json({ success: true, message: 'Artwork archived successfully' });

    } catch (error) {
      logger.error('Archive artwork error:', error);
      res.status(500).json({ error: 'Failed to archive artwork' });
    }
  }
);

// Unarchive an artwork
router.delete('/artworks/:id/unarchive',
  rateLimits.strict,
  artworkIdValidation,
  handleValidationResult,
  async (req, res) => {
    try {
      const { id: artworkId } = req.params;
      const userId = req.userId;

      // Update user artwork to remove archive
      await pool.query(`
        UPDATE user_artworks 
        SET is_archived = false, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1 AND artwork_id = $2
      `, [userId, artworkId]);

      res.json({ success: true, message: 'Artwork unarchived successfully' });

    } catch (error) {
      logger.error('Unarchive artwork error:', error);
      res.status(500).json({ error: 'Failed to unarchive artwork' });
    }
  }
);

// Get followed artists with artwork counts
router.get('/followed-artists',
  rateLimits.lenient,
  async (req, res) => {
    try {
      const userId = req.userId;
      
      const query = `
        SELECT 
          a.id,
          a.name,
          COUNT(ua.artwork_id) as artwork_count,
          true as is_following,
          MAX(ua.created_at) as last_artwork_at
        FROM artists a
        JOIN artist_follows af ON a.id = af.artist_id
        LEFT JOIN artworks art ON a.name = art.artist
        LEFT JOIN user_artworks ua ON art.id = ua.artwork_id AND ua.user_id = $1
        WHERE af.user_id = $1
        GROUP BY a.id, a.name
        ORDER BY artwork_count DESC, a.name ASC
      `;

      const result = await pool.query(query, [userId]);
      
      res.json(result.rows);

    } catch (error) {
      logger.error('Get followed artists error:', error);
      res.status(500).json({ error: 'Failed to fetch followed artists' });
    }
  }
);

// Get gallery statistics
router.get('/stats',
  rateLimits.lenient,
  async (req, res) => {
    try {
      const userId = req.userId;
      
      const queries = [
        'SELECT COUNT(*) as total FROM user_artworks WHERE user_id = $1',
        'SELECT COUNT(*) as liked FROM user_artworks WHERE user_id = $1 AND is_liked = true',
        'SELECT COUNT(*) as archived FROM user_artworks WHERE user_id = $1 AND is_archived = true',
        `SELECT a.artist, COUNT(*) as count 
         FROM user_artworks ua 
         JOIN artworks a ON ua.artwork_id = a.id 
         WHERE ua.user_id = $1 
         GROUP BY a.artist 
         ORDER BY count DESC 
         LIMIT 5`,
        `SELECT a.sayu_type, COUNT(*) as count 
         FROM user_artworks ua 
         JOIN artworks a ON ua.artwork_id = a.id 
         WHERE ua.user_id = $1 
         GROUP BY a.sayu_type 
         ORDER BY count DESC`,
        `SELECT DATE(ua.created_at) as date, COUNT(*) as count 
         FROM user_artworks ua 
         WHERE ua.user_id = $1 AND ua.created_at > NOW() - INTERVAL '30 days'
         GROUP BY DATE(ua.created_at) 
         ORDER BY date DESC`
      ];

      const [
        totalResult,
        likedResult,
        archivedResult,
        byArtistResult,
        bySayuTypeResult,
        recentActivityResult
      ] = await Promise.all(
        queries.map(query => pool.query(query, [userId]))
      );

      const stats = {
        totalArtworks: parseInt(totalResult.rows[0].total),
        likedCount: parseInt(likedResult.rows[0].liked),
        archivedCount: parseInt(archivedResult.rows[0].archived),
        byArtist: byArtistResult.rows.reduce((acc, row) => {
          acc[row.artist] = parseInt(row.count);
          return acc;
        }, {}),
        bySayuType: bySayuTypeResult.rows.reduce((acc, row) => {
          acc[row.sayu_type] = parseInt(row.count);
          return acc;
        }, {}),
        recentActivity: recentActivityResult.rows.map(row => ({
          date: row.date,
          count: parseInt(row.count)
        }))
      };

      res.json(stats);

    } catch (error) {
      logger.error('Get gallery stats error:', error);
      res.status(500).json({ error: 'Failed to fetch gallery statistics' });
    }
  }
);

module.exports = router;