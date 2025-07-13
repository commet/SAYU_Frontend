const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { adminMiddleware: requireAdmin } = require('../middleware/auth');
const museumAPIService = require('../services/museumAPIService');
const { logger } = require("../config/logger");

// Public routes (no auth required)
router.get('/search', async (req, res) => {
  try {
    const {
      q: query,
      artist,
      medium,
      culture,
      department,
      period,
      hasImage = 'true',
      isPublicDomain,
      limit = 20,
      offset = 0
    } = req.query;

    const searchParams = {
      query,
      artist,
      medium,
      culture,
      department,
      period,
      hasImage: hasImage === 'true',
      isPublicDomain: isPublicDomain === 'true' ? true : isPublicDomain === 'false' ? false : undefined,
      limit: Math.min(parseInt(limit), 100), // Cap at 100
      offset: parseInt(offset)
    };

    const artworks = await museumAPIService.searchArtworks(searchParams);
    
    res.json({
      artworks,
      pagination: {
        limit: searchParams.limit,
        offset: searchParams.offset,
        hasMore: artworks.length === searchParams.limit
      }
    });

  } catch (error) {
    logger.error('Failed to search artworks:', error);
    res.status(500).json({ error: 'Failed to search artworks' });
  }
});

router.get('/artworks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT ae.*, m.name as museum_name, m.short_name as museum_short_name,
             m.website_url as museum_website, m.location as museum_location
      FROM artworks_extended ae
      LEFT JOIN museums m ON ae.museum_id = m.id
      WHERE ae.id = $1
    `;
    
    const { pool } = require('../config/database');
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artwork not found' });
    }
    
    res.json(result.rows[0]);

  } catch (error) {
    logger.error('Failed to get artwork:', error);
    res.status(500).json({ error: 'Failed to get artwork' });
  }
});

router.get('/museums', async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    
    const query = `
      SELECT m.*, 
             COUNT(ae.id) as artwork_count,
             COUNT(CASE WHEN ae.primary_image_url IS NOT NULL THEN 1 END) as artwork_with_images_count
      FROM museums m
      LEFT JOIN artworks_extended ae ON m.id = ae.museum_id
      WHERE m.status = $1
      GROUP BY m.id
      ORDER BY artwork_count DESC, m.name
    `;
    
    const { pool } = require('../config/database');
    const result = await pool.query(query, [status]);
    
    res.json(result.rows);

  } catch (error) {
    logger.error('Failed to get museums:', error);
    res.status(500).json({ error: 'Failed to get museums' });
  }
});

router.get('/museums/:id/artworks', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0, hasImage = 'true' } = req.query;
    
    let query = `
      SELECT ae.*, m.name as museum_name
      FROM artworks_extended ae
      LEFT JOIN museums m ON ae.museum_id = m.id
      WHERE ae.museum_id = $1
    `;
    
    const values = [id];
    let paramCount = 2;
    
    if (hasImage === 'true') {
      query += ` AND ae.primary_image_url IS NOT NULL`;
    }
    
    query += ` ORDER BY ae.is_highlight DESC, ae.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), parseInt(offset));
    
    const { pool } = require('../config/database');
    const result = await pool.query(query, values);
    
    res.json({
      artworks: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: result.rows.length === parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Failed to get museum artworks:', error);
    res.status(500).json({ error: 'Failed to get museum artworks' });
  }
});

// Protected routes (require authentication)
router.use(authMiddleware);

router.get('/sync/status', async (req, res) => {
  try {
    const status = await museumAPIService.getSyncStatus();
    res.json(status);
  } catch (error) {
    logger.error('Failed to get sync status:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

// Admin routes (require admin role)

router.post('/sync/all', requireAdmin, async (req, res) => {
  try {
    // Start sync in background
    museumAPIService.syncAllMuseums().catch(error => {
      logger.error('Background museum sync failed:', error);
    });
    
    res.json({ message: 'Museum sync started in background' });
  } catch (error) {
    logger.error('Failed to start museum sync:', error);
    res.status(500).json({ error: 'Failed to start museum sync' });
  }
});

router.post('/sync/:source', requireAdmin, async (req, res) => {
  try {
    const { source } = req.params;
    
    const syncMethods = {
      met: () => museumAPIService.syncMetMuseum(),
      cleveland: () => museumAPIService.syncClevelandMuseum(),
      rijks: () => museumAPIService.syncRijksmuseum()
    };
    
    if (!syncMethods[source]) {
      return res.status(400).json({ error: 'Invalid museum source' });
    }
    
    // Start sync in background
    syncMethods[source]().catch(error => {
      logger.error(`Background ${source} sync failed:`, error);
    });
    
    res.json({ message: `${source} sync started in background` });
  } catch (error) {
    logger.error(`Failed to start ${req.params.source} sync:`, error);
    res.status(500).json({ error: 'Failed to start sync' });
  }
});

router.post('/museums', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      short_name,
      description,
      location,
      website_url,
      api_source,
      api_id,
      contact_info = {},
      opening_hours = {},
      admission_info = {},
      accessibility_info,
      facilities = [],
      image_url,
      logo_url
    } = req.body;

    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }

    const query = `
      INSERT INTO museums (
        name, short_name, description, location, website_url, api_source, api_id,
        contact_info, opening_hours, admission_info, accessibility_info,
        facilities, image_url, logo_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const { pool } = require('../config/database');
    const result = await pool.query(query, [
      name, short_name, description, location, website_url, api_source, api_id,
      contact_info, opening_hours, admission_info, accessibility_info,
      facilities, image_url, logo_url
    ]);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    logger.error('Failed to create museum:', error);
    res.status(500).json({ error: 'Failed to create museum' });
  }
});

router.put('/museums/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'name', 'short_name', 'description', 'location', 'website_url',
      'contact_info', 'opening_hours', 'admission_info', 'accessibility_info',
      'facilities', 'image_url', 'logo_url', 'status'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(req.body[field]);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE museums 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const { pool } = require('../config/database');
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Museum not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    logger.error('Failed to update museum:', error);
    res.status(500).json({ error: 'Failed to update museum' });
  }
});

// Analytics and stats
router.get('/analytics/overview', requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM museums WHERE status = 'active') as total_museums,
        (SELECT COUNT(*) FROM artworks_extended) as total_artworks,
        (SELECT COUNT(*) FROM artworks_extended WHERE primary_image_url IS NOT NULL) as artworks_with_images,
        (SELECT COUNT(*) FROM artworks_extended WHERE is_public_domain = true) as public_domain_artworks,
        (SELECT COUNT(DISTINCT api_source) FROM artworks_extended) as api_sources,
        (SELECT COUNT(DISTINCT artist_display_name) FROM artworks_extended WHERE artist_display_name IS NOT NULL) as unique_artists
    `;
    
    const { pool } = require('../config/database');
    const result = await pool.query(query);
    
    res.json(result.rows[0]);

  } catch (error) {
    logger.error('Failed to get analytics overview:', error);
    res.status(500).json({ error: 'Failed to get analytics overview' });
  }
});

router.get('/analytics/sources', requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        api_source,
        COUNT(*) as artwork_count,
        COUNT(CASE WHEN primary_image_url IS NOT NULL THEN 1 END) as with_images,
        COUNT(CASE WHEN is_public_domain = true THEN 1 END) as public_domain,
        MIN(created_at) as first_sync,
        MAX(last_synced) as last_sync
      FROM artworks_extended
      GROUP BY api_source
      ORDER BY artwork_count DESC
    `;
    
    const { pool } = require('../config/database');
    const result = await pool.query(query);
    
    res.json(result.rows);

  } catch (error) {
    logger.error('Failed to get source analytics:', error);
    res.status(500).json({ error: 'Failed to get source analytics' });
  }
});

module.exports = router;