const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const reservationService = require('../services/reservationService');
const { logger } = require("../config/logger");

router.use(authMiddleware);

// Get exhibition reservation info
router.get('/exhibitions/:exhibitionId', async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const reservationInfo = await reservationService.getExhibitionReservationInfo(exhibitionId);
    
    if (!reservationInfo) {
      return res.status(404).json({ error: 'No reservation information available for this exhibition' });
    }
    
    res.json(reservationInfo);
  } catch (error) {
    logger.error('Failed to get exhibition reservation info:', error);
    res.status(500).json({ error: 'Failed to get reservation information' });
  }
});

// Get exhibition availability
router.get('/exhibitions/:exhibitionId/availability', async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const { from_date, to_date } = req.query;
    
    const availability = await reservationService.getExhibitionAvailability(
      exhibitionId, 
      from_date, 
      to_date
    );
    
    res.json(availability);
  } catch (error) {
    logger.error('Failed to get exhibition availability:', error);
    res.status(500).json({ error: 'Failed to get availability' });
  }
});

// Create a reservation
router.post('/create', async (req, res) => {
  try {
    const {
      exhibition_id,
      reservation_provider_id,
      visit_date,
      visit_time,
      party_size,
      ticket_type,
      total_cost,
      currency,
      contact_email,
      contact_phone,
      special_requests
    } = req.body;

    if (!exhibition_id || !visit_date) {
      return res.status(400).json({ error: 'Exhibition ID and visit date are required' });
    }

    const reservation = await reservationService.createReservation(req.userId, {
      exhibition_id,
      reservation_provider_id,
      visit_date,
      visit_time,
      party_size,
      ticket_type,
      total_cost,
      currency,
      contact_email,
      contact_phone,
      special_requests
    });

    res.status(201).json(reservation);
  } catch (error) {
    logger.error('Failed to create reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Get user's reservations
router.get('/my-reservations', async (req, res) => {
  try {
    const { status } = req.query;
    const reservations = await reservationService.getUserReservations(req.userId, status);
    res.json(reservations);
  } catch (error) {
    logger.error('Failed to get user reservations:', error);
    res.status(500).json({ error: 'Failed to get reservations' });
  }
});

// Get specific reservation
router.get('/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    
    const query = `
      SELECT ur.*, e.title as exhibition_title, e.description as exhibition_description,
             e.start_date, e.end_date, e.primary_image_url,
             m.name as museum_name, m.location as museum_location,
             m.website_url as museum_website, m.contact_info as museum_contact,
             rp.name as provider_name, rp.provider_type,
             er.pricing_info, er.cancellation_policy, er.special_instructions
      FROM user_reservations ur
      LEFT JOIN exhibitions_extended e ON ur.exhibition_id = e.id
      LEFT JOIN museums m ON e.museum_id = m.id
      LEFT JOIN reservation_providers rp ON ur.reservation_provider_id = rp.id
      LEFT JOIN exhibition_reservations er ON ur.exhibition_id = er.exhibition_id
      WHERE ur.id = $1 AND ur.user_id = $2
    `;

    const { pool } = require('../config/database');
    const result = await pool.query(query, [reservationId, req.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Failed to get reservation:', error);
    res.status(500).json({ error: 'Failed to get reservation' });
  }
});

// Update reservation status
router.patch('/:reservationId/status', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status, metadata } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if user owns this reservation
    const { pool } = require('../config/database');
    const checkQuery = 'SELECT id FROM user_reservations WHERE id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [reservationId, req.userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservation = await reservationService.updateReservationStatus(
      reservationId, 
      status, 
      metadata
    );

    res.json(reservation);
  } catch (error) {
    logger.error('Failed to update reservation status:', error);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

// Cancel reservation
router.post('/:reservationId/cancel', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { reason } = req.body;

    const reservation = await reservationService.cancelReservation(
      reservationId, 
      req.userId, 
      reason
    );

    res.json(reservation);
  } catch (error) {
    logger.error('Failed to cancel reservation:', error);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

// Submit feedback
router.post('/:reservationId/feedback', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const {
      rating,
      experience_rating,
      recommendation_score,
      feedback_text,
      liked_aspects,
      improvement_suggestions,
      would_visit_again,
      would_recommend,
      accessibility_rating,
      value_for_money,
      metadata
    } = req.body;

    // Verify user owns this reservation and it's completed
    const { pool } = require('../config/database');
    const checkQuery = `
      SELECT id FROM user_reservations 
      WHERE id = $1 AND user_id = $2 AND reservation_status = 'completed'
    `;
    const checkResult = await pool.query(checkQuery, [reservationId, req.userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Completed reservation not found' });
    }

    const feedback = await reservationService.submitReservationFeedback(reservationId, {
      rating,
      experience_rating,
      recommendation_score,
      feedback_text,
      liked_aspects,
      improvement_suggestions,
      would_visit_again,
      would_recommend,
      accessibility_rating,
      value_for_money,
      metadata
    });

    res.status(201).json(feedback);
  } catch (error) {
    logger.error('Failed to submit feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Admin routes
const requireAdmin = async (req, res, next) => {
  try {
    const { pool } = require('../config/database');
    const userQuery = 'SELECT role FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [req.userId]);
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    logger.error('Failed to check admin role:', error);
    res.status(500).json({ error: 'Failed to verify permissions' });
  }
};

// Setup exhibition reservation
router.post('/admin/exhibitions/:exhibitionId/setup', requireAdmin, async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const reservationData = req.body;

    const setup = await reservationService.setupExhibitionReservation(
      exhibitionId, 
      reservationData
    );

    res.status(201).json(setup);
  } catch (error) {
    logger.error('Failed to setup exhibition reservation:', error);
    res.status(500).json({ error: 'Failed to setup reservation' });
  }
});

// Manage reservation providers
router.get('/admin/providers', requireAdmin, async (req, res) => {
  try {
    const providers = await reservationService.getReservationProviders();
    res.json(providers);
  } catch (error) {
    logger.error('Failed to get reservation providers:', error);
    res.status(500).json({ error: 'Failed to get providers' });
  }
});

router.post('/admin/providers', requireAdmin, async (req, res) => {
  try {
    const provider = await reservationService.createReservationProvider(req.body);
    res.status(201).json(provider);
  } catch (error) {
    logger.error('Failed to create reservation provider:', error);
    res.status(500).json({ error: 'Failed to create provider' });
  }
});

// Update exhibition availability
router.post('/admin/exhibitions/:exhibitionId/availability', requireAdmin, async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const availabilityData = req.body;

    const availability = await reservationService.updateExhibitionAvailability(
      exhibitionId, 
      availabilityData
    );

    res.status(201).json(availability);
  } catch (error) {
    logger.error('Failed to update availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Process pending reminders (cron job endpoint)
router.post('/admin/process-reminders', requireAdmin, async (req, res) => {
  try {
    const processedCount = await reservationService.processPendingReminders();
    res.json({ processed: processedCount });
  } catch (error) {
    logger.error('Failed to process reminders:', error);
    res.status(500).json({ error: 'Failed to process reminders' });
  }
});

// Reservation analytics
router.get('/admin/analytics', requireAdmin, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const stats = await reservationService.getReservationStats(timeframe);
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get reservation analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get all reservations (admin view)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT ur.*, u.email as user_email, u.nickname as user_name,
             e.title as exhibition_title, m.name as museum_name
      FROM user_reservations ur
      JOIN users u ON ur.user_id = u.id
      LEFT JOIN exhibitions_extended e ON ur.exhibition_id = e.id
      LEFT JOIN museums m ON e.museum_id = m.id
    `;

    const params = [];
    let whereAdded = false;

    if (status) {
      query += ' WHERE ur.reservation_status = $1';
      params.push(status);
      whereAdded = true;
    }

    query += ` ORDER BY ur.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const { pool } = require('../config/database');
    const result = await pool.query(query, params);

    res.json({
      reservations: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: result.rows.length === parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Failed to get all reservations:', error);
    res.status(500).json({ error: 'Failed to get reservations' });
  }
});

module.exports = router;