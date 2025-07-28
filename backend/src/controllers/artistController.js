const { pool } = require('../config/database');
const { log } = require('../config/logger');

// Get featured artists
exports.getFeaturedArtists = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;

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
        is_featured,
        era,
        images,
        sources
      FROM artists
      WHERE is_featured = true OR follow_count > 500
      ORDER BY follow_count DESC, RANDOM()
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);

    res.json({
      artists: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    log.error('Error fetching featured artists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all artists with pagination
exports.getArtists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const nationality = req.query.nationality || '';
    const era = req.query.era || '';

    let query = `
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
        is_featured,
        era,
        images
      FROM artists
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(name_ko) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (nationality) {
      query += ` AND nationality = $${paramIndex}`;
      params.push(nationality);
      paramIndex++;
    }

    if (era) {
      query += ` AND era = $${paramIndex}`;
      params.push(era);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY follow_count DESC, name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      artists: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    log.error('Error fetching artists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single artist by ID
exports.getArtistById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT * FROM artists WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    res.json({ artist: result.rows[0] });
  } catch (error) {
    log.error('Error fetching artist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Follow/unfollow artist
exports.toggleFollow = async (req, res) => {
  const client = await pool.connect();

  try {
    const { artistId } = req.params;
    const userId = req.user.id;

    await client.query('BEGIN');

    // Check if already following
    const checkQuery = `
      SELECT id FROM artist_follows 
      WHERE user_id = $1 AND artist_id = $2
    `;

    const checkResult = await client.query(checkQuery, [userId, artistId]);

    if (checkResult.rows.length > 0) {
      // Unfollow
      await client.query(
        'DELETE FROM artist_follows WHERE user_id = $1 AND artist_id = $2',
        [userId, artistId]
      );

      await client.query(
        'UPDATE artists SET follow_count = GREATEST(0, follow_count - 1) WHERE id = $1',
        [artistId]
      );

      await client.query('COMMIT');
      res.json({ following: false });
    } else {
      // Follow
      await client.query(
        'INSERT INTO artist_follows (user_id, artist_id) VALUES ($1, $2)',
        [userId, artistId]
      );

      await client.query(
        'UPDATE artists SET follow_count = follow_count + 1 WHERE id = $1',
        [artistId]
      );

      await client.query('COMMIT');
      res.json({ following: true });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    log.error('Error toggling follow:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// Get user's followed artists
exports.getFollowedArtists = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        a.*,
        af.followed_at
      FROM artists a
      INNER JOIN artist_follows af ON a.id = af.artist_id
      WHERE af.user_id = $1
      ORDER BY af.followed_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM artist_follows WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      artists: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    log.error('Error fetching followed artists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get artist statistics
exports.getArtistStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_artists,
        COUNT(CASE WHEN copyright_status = 'public_domain' THEN 1 END) as public_domain,
        COUNT(CASE WHEN copyright_status = 'licensed' THEN 1 END) as licensed,
        COUNT(CASE WHEN copyright_status = 'contemporary' THEN 1 END) as contemporary,
        COUNT(DISTINCT nationality) as nationalities,
        COUNT(DISTINCT era) as eras
      FROM artists
    `;

    const result = await pool.query(query);

    res.json({ stats: result.rows[0] });
  } catch (error) {
    log.error('Error fetching artist stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
