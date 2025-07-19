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
const { query, param } = require('express-validator');

// Apply security middleware
router.use(securityHeaders);
router.use(sanitizeInput);
router.use(requestSizeLimiter('2mb'));

// Validation schemas
const artistListValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('copyrightStatus').optional().isIn(['public_domain', 'licensed', 'contemporary', 'verified_artist']),
  query('nationality').optional().isString().trim().isLength({ min: 1, max: 50 }),
  query('era').optional().isString().trim().isLength({ min: 1, max: 50 }),
  query('search').optional().isString().trim().isLength({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['name', 'popularity', 'birth_year', 'follow_count']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
];

const artistIdValidation = [
  param('id').isUUID().withMessage('Artist ID must be a valid UUID')
];

// Get paginated list of artists
router.get('/', 
  rateLimits.lenient,
  artistListValidation,
  handleValidationResult,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        copyrightStatus,
        nationality,
        era,
        search,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      // Build WHERE clause
      const whereConditions = [];
      const queryParams = [];
      let paramIndex = 1;

      if (copyrightStatus) {
        whereConditions.push(`copyright_status = $${paramIndex++}`);
        queryParams.push(copyrightStatus);
      }

      if (nationality) {
        whereConditions.push(`nationality ILIKE $${paramIndex++}`);
        queryParams.push(`%${nationality}%`);
      }

      if (era) {
        whereConditions.push(`era ILIKE $${paramIndex++}`);
        queryParams.push(`%${era}%`);
      }

      if (search) {
        whereConditions.push(`(name ILIKE $${paramIndex++} OR name_ko ILIKE $${paramIndex++} OR bio ILIKE $${paramIndex++})`);
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        paramIndex += 2; // We added 2 more params above
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Build ORDER BY clause
      const orderByMap = {
        name: 'name',
        popularity: 'follow_count',
        birth_year: 'birth_year',
        follow_count: 'follow_count'
      };
      
      const orderBy = `ORDER BY ${orderByMap[sortBy] || 'name'} ${sortOrder.toUpperCase()}`;

      // Main query
      const mainQuery = `
        SELECT 
          id,
          name,
          name_ko,
          birth_year,
          death_year,
          nationality,
          nationality_ko,
          bio,
          bio_ko,
          copyright_status,
          follow_count,
          created_at,
          updated_at,
          images,
          sources,
          license_info,
          official_links,
          representation,
          recent_exhibitions,
          media_links,
          is_verified,
          verification_date,
          verification_method,
          artist_managed,
          permissions,
          purchase_links
        FROM artists
        ${whereClause}
        ${orderBy}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      // Count query
      const countQuery = `
        SELECT COUNT(*) as total
        FROM artists
        ${whereClause}
      `;

      queryParams.push(parseInt(limit), offset);
      const countParams = queryParams.slice(0, -2); // Remove limit and offset for count query

      const [artistsResult, countResult] = await Promise.all([
        pool.query(mainQuery, queryParams),
        pool.query(countQuery, countParams)
      ]);

      const artists = artistsResult.rows;
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
      logger.error('Get artists error:', error);
      res.status(500).json({ error: 'Failed to fetch artists' });
    }
  }
);

// Get single artist by ID
router.get('/:id',
  rateLimits.lenient,
  artistIdValidation,
  handleValidationResult,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check cache first
      const cacheKey = `artist:${id}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const query = `
        SELECT 
          id,
          name,
          name_ko,
          birth_year,
          death_year,
          nationality,
          nationality_ko,
          bio,
          bio_ko,
          copyright_status,
          follow_count,
          created_at,
          updated_at,
          images,
          sources,
          license_info,
          official_links,
          representation,
          recent_exhibitions,
          media_links,
          is_verified,
          verification_date,
          verification_method,
          artist_managed,
          permissions,
          purchase_links
        FROM artists
        WHERE id = $1
      `;

      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Artist not found' });
      }

      const artist = result.rows[0];
      
      // Cache for 1 hour
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(artist));
      
      res.json(artist);

    } catch (error) {
      logger.error('Get artist error:', error);
      res.status(500).json({ error: 'Failed to fetch artist' });
    }
  }
);

// Search artists
router.get('/search',
  rateLimits.lenient,
  [
    query('q').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Search query is required'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  handleValidationResult,
  async (req, res) => {
    try {
      const { q: searchQuery, limit = 10 } = req.query;
      
      const query = `
        SELECT 
          id,
          name,
          name_ko,
          birth_year,
          death_year,
          nationality,
          nationality_ko,
          bio,
          bio_ko,
          copyright_status,
          follow_count,
          images
        FROM artists
        WHERE name ILIKE $1 OR name_ko ILIKE $1 OR bio ILIKE $1
        ORDER BY follow_count DESC
        LIMIT $2
      `;

      const result = await pool.query(query, [`%${searchQuery}%`, parseInt(limit)]);
      
      res.json(result.rows);

    } catch (error) {
      logger.error('Search artists error:', error);
      res.status(500).json({ error: 'Failed to search artists' });
    }
  }
);

// Get featured artists
router.get('/featured',
  rateLimits.lenient,
  async (req, res) => {
    try {
      // Check cache first
      const cacheKey = 'featured_artists';
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const query = `
        SELECT 
          id,
          name,
          name_ko,
          birth_year,
          death_year,
          nationality,
          nationality_ko,
          bio,
          bio_ko,
          copyright_status,
          follow_count,
          images
        FROM artists
        WHERE follow_count > 100 OR is_active = true
        ORDER BY follow_count DESC
        LIMIT $1
      `;

      const limit = parseInt(req.query.limit) || 20;
      const result = await pool.query(query, [limit]);
      
      // Cache for 6 hours
      await redisClient.setEx(cacheKey, 21600, JSON.stringify(result.rows));
      
      res.json({ artists: result.rows });

    } catch (error) {
      logger.error('Get featured artists error:', error);
      res.status(500).json({ error: 'Failed to fetch featured artists' });
    }
  }
);

// Get followed artists (requires authentication)
router.get('/followed',
  authMiddleware,
  rateLimits.lenient,
  async (req, res) => {
    try {
      const userId = req.userId;
      
      const query = `
        SELECT 
          a.id,
          a.name,
          a.name_ko,
          a.birth_year,
          a.death_year,
          a.nationality,
          a.nationality_ko,
          a.bio,
          a.bio_ko,
          a.copyright_status,
          a.follow_count,
          a.images,
          af.followed_at
        FROM artists a
        JOIN artist_follows af ON a.id = af.artist_id
        WHERE af.user_id = $1
        ORDER BY af.followed_at DESC
      `;

      const result = await pool.query(query, [userId]);
      
      res.json(result.rows);

    } catch (error) {
      logger.error('Get followed artists error:', error);
      res.status(500).json({ error: 'Failed to fetch followed artists' });
    }
  }
);

// Follow an artist (requires authentication)
router.post('/:id/follow',
  authMiddleware,
  rateLimits.strict,
  artistIdValidation,
  handleValidationResult,
  async (req, res) => {
    try {
      const { id: artistId } = req.params;
      const userId = req.userId;

      // Check if artist exists
      const artistCheck = await pool.query('SELECT id FROM artists WHERE id = $1', [artistId]);
      if (artistCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Artist not found' });
      }

      // Check if already following
      const existingFollow = await pool.query(
        'SELECT id FROM artist_follows WHERE user_id = $1 AND artist_id = $2',
        [userId, artistId]
      );

      if (existingFollow.rows.length > 0) {
        return res.status(400).json({ error: 'Already following this artist' });
      }

      // Add follow relationship
      await pool.query(
        'INSERT INTO artist_follows (user_id, artist_id) VALUES ($1, $2)',
        [userId, artistId]
      );

      // Update artist follow count
      await pool.query(
        'UPDATE artists SET follow_count = follow_count + 1 WHERE id = $1',
        [artistId]
      );

      // Clear cache
      await redisClient.del(`artist:${artistId}`);

      res.json({ success: true, message: 'Artist followed successfully' });

    } catch (error) {
      logger.error('Follow artist error:', error);
      res.status(500).json({ error: 'Failed to follow artist' });
    }
  }
);

// Unfollow an artist (requires authentication)
router.delete('/:id/unfollow',
  authMiddleware,
  rateLimits.strict,
  artistIdValidation,
  handleValidationResult,
  async (req, res) => {
    try {
      const { id: artistId } = req.params;
      const userId = req.userId;

      // Check if following
      const existingFollow = await pool.query(
        'SELECT id FROM artist_follows WHERE user_id = $1 AND artist_id = $2',
        [userId, artistId]
      );

      if (existingFollow.rows.length === 0) {
        return res.status(400).json({ error: 'Not following this artist' });
      }

      // Remove follow relationship
      await pool.query(
        'DELETE FROM artist_follows WHERE user_id = $1 AND artist_id = $2',
        [userId, artistId]
      );

      // Update artist follow count
      await pool.query(
        'UPDATE artists SET follow_count = GREATEST(follow_count - 1, 0) WHERE id = $1',
        [artistId]
      );

      // Clear cache
      await redisClient.del(`artist:${artistId}`);

      res.json({ success: true, message: 'Artist unfollowed successfully' });

    } catch (error) {
      logger.error('Unfollow artist error:', error);
      res.status(500).json({ error: 'Failed to unfollow artist' });
    }
  }
);

// Get artist statistics
router.get('/stats',
  rateLimits.lenient,
  async (req, res) => {
    try {
      // Check cache first
      const cacheKey = 'artist_stats';
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const queries = [
        'SELECT COUNT(*) as total FROM artists',
        'SELECT copyright_status, COUNT(*) as count FROM artists GROUP BY copyright_status',
        'SELECT nationality, COUNT(*) as count FROM artists GROUP BY nationality ORDER BY count DESC LIMIT 10',
        'SELECT era, COUNT(*) as count FROM artists WHERE era IS NOT NULL GROUP BY era ORDER BY count DESC LIMIT 10'
      ];

      const [totalResult, statusResult, nationalityResult, eraResult] = await Promise.all(
        queries.map(query => pool.query(query))
      );

      const stats = {
        totalArtists: parseInt(totalResult.rows[0].total),
        byStatus: statusResult.rows.reduce((acc, row) => {
          acc[row.copyright_status] = parseInt(row.count);
          return acc;
        }, {}),
        byNationality: nationalityResult.rows.reduce((acc, row) => {
          acc[row.nationality] = parseInt(row.count);
          return acc;
        }, {}),
        byEra: eraResult.rows.reduce((acc, row) => {
          acc[row.era] = parseInt(row.count);
          return acc;
        }, {})
      };

      // Cache for 1 hour
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(stats));
      
      res.json(stats);

    } catch (error) {
      logger.error('Get artist stats error:', error);
      res.status(500).json({ error: 'Failed to fetch artist statistics' });
    }
  }
);

module.exports = router;