const { pool } = require('../config/database');
const { logger } = require("../config/logger");
const emailService = require('./emailService');

class ReservationService {
  constructor() {
    this.providers = {
      eventbrite: {
        name: 'Eventbrite',
        baseUrl: 'https://www.eventbriteapi.com/v3',
        supportsTimedEntry: true
      },
      direct: {
        name: 'Direct Museum Booking',
        supportsTimedEntry: false
      },
      timed_entry: {
        name: 'Timed Entry System',
        supportsTimedEntry: true
      }
    };
  }

  // Provider Management
  async createReservationProvider(providerData) {
    const {
      name,
      provider_type,
      api_endpoint,
      api_key_required = false,
      booking_url_template,
      metadata = {}
    } = providerData;

    const query = `
      INSERT INTO reservation_providers (
        name, provider_type, api_endpoint, api_key_required, 
        booking_url_template, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      name, provider_type, api_endpoint, api_key_required,
      booking_url_template, metadata
    ]);

    return result.rows[0];
  }

  async getReservationProviders(activeOnly = true) {
    const query = `
      SELECT * FROM reservation_providers
      ${activeOnly ? 'WHERE is_active = true' : ''}
      ORDER BY name
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Exhibition Reservation Setup
  async setupExhibitionReservation(exhibitionId, reservationData) {
    const {
      provider_id,
      reservation_type,
      booking_url,
      pricing_info = {},
      availability_info = {},
      time_slots = [],
      requirements = {},
      advance_booking_required = false,
      cancellation_policy,
      contact_info = {},
      special_instructions
    } = reservationData;

    const query = `
      INSERT INTO exhibition_reservations (
        exhibition_id, provider_id, reservation_type, booking_url,
        pricing_info, availability_info, time_slots, requirements,
        advance_booking_required, cancellation_policy, contact_info,
        special_instructions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (exhibition_id) 
      DO UPDATE SET
        provider_id = EXCLUDED.provider_id,
        reservation_type = EXCLUDED.reservation_type,
        booking_url = EXCLUDED.booking_url,
        pricing_info = EXCLUDED.pricing_info,
        availability_info = EXCLUDED.availability_info,
        time_slots = EXCLUDED.time_slots,
        requirements = EXCLUDED.requirements,
        advance_booking_required = EXCLUDED.advance_booking_required,
        cancellation_policy = EXCLUDED.cancellation_policy,
        contact_info = EXCLUDED.contact_info,
        special_instructions = EXCLUDED.special_instructions,
        last_updated = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      exhibitionId, provider_id, reservation_type, booking_url,
      pricing_info, availability_info, time_slots, requirements,
      advance_booking_required, cancellation_policy, contact_info,
      special_instructions
    ]);

    return result.rows[0];
  }

  async getExhibitionReservationInfo(exhibitionId) {
    const query = `
      SELECT er.*, rp.name as provider_name, rp.provider_type,
             e.title as exhibition_title, e.start_date, e.end_date,
             m.name as museum_name
      FROM exhibition_reservations er
      LEFT JOIN reservation_providers rp ON er.provider_id = rp.id
      LEFT JOIN exhibitions_extended e ON er.exhibition_id = e.id
      LEFT JOIN museums m ON e.museum_id = m.id
      WHERE er.exhibition_id = $1 AND er.is_active = true
    `;

    const result = await pool.query(query, [exhibitionId]);
    return result.rows[0];
  }

  // User Reservations
  async createReservation(userId, reservationData) {
    const {
      exhibition_id,
      reservation_provider_id,
      visit_date,
      visit_time,
      party_size = 1,
      ticket_type,
      total_cost,
      currency = 'USD',
      contact_email,
      contact_phone,
      special_requests
    } = reservationData;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create reservation
      const reservationQuery = `
        INSERT INTO user_reservations (
          user_id, exhibition_id, reservation_provider_id, visit_date,
          visit_time, party_size, ticket_type, total_cost, currency,
          contact_email, contact_phone, special_requests, confirmation_code
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const confirmationCode = this.generateConfirmationCode();
      
      const reservationResult = await client.query(reservationQuery, [
        userId, exhibition_id, reservation_provider_id, visit_date,
        visit_time, party_size, ticket_type, total_cost, currency,
        contact_email, contact_phone, special_requests, confirmationCode
      ]);

      const reservation = reservationResult.rows[0];

      // Schedule confirmation email
      await this.scheduleReservationReminder(
        client, 
        reservation.id, 
        'booking_confirmation', 
        new Date()
      );

      // Schedule pre-visit reminder (1 day before)
      if (visit_date) {
        const reminderDate = new Date(visit_date);
        reminderDate.setDate(reminderDate.getDate() - 1);
        reminderDate.setHours(10, 0, 0, 0); // 10 AM day before

        await this.scheduleReservationReminder(
          client,
          reservation.id,
          'pre_visit',
          reminderDate
        );
      }

      await client.query('COMMIT');

      // Send confirmation email immediately
      this.sendConfirmationEmail(reservation).catch(error => {
        logger.error('Failed to send confirmation email:', error);
      });

      return reservation;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getUserReservations(userId, status = null) {
    let query = `
      SELECT ur.*, e.title as exhibition_title, e.primary_image_url,
             m.name as museum_name, m.location as museum_location,
             rp.name as provider_name
      FROM user_reservations ur
      LEFT JOIN exhibitions_extended e ON ur.exhibition_id = e.id
      LEFT JOIN museums m ON e.museum_id = m.id
      LEFT JOIN reservation_providers rp ON ur.reservation_provider_id = rp.id
      WHERE ur.user_id = $1
    `;

    const params = [userId];

    if (status) {
      query += ' AND ur.reservation_status = $2';
      params.push(status);
    }

    query += ' ORDER BY ur.visit_date DESC, ur.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async updateReservationStatus(reservationId, status, metadata = {}) {
    const query = `
      UPDATE user_reservations 
      SET reservation_status = $1, booking_reference = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [status, metadata, reservationId]);
    return result.rows[0];
  }

  async cancelReservation(reservationId, userId, reason = null) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update reservation status
      const updateQuery = `
        UPDATE user_reservations 
        SET reservation_status = 'cancelled', 
            special_requests = COALESCE(special_requests, '') || $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        reservationId, 
        userId, 
        reason ? ` | Cancellation reason: ${reason}` : ''
      ]);

      if (result.rows.length === 0) {
        throw new Error('Reservation not found or unauthorized');
      }

      // Cancel any pending reminders
      await client.query(
        'UPDATE reservation_reminders SET status = $1 WHERE user_reservation_id = $2 AND status = $3',
        ['cancelled', reservationId, 'pending']
      );

      await client.query('COMMIT');

      const reservation = result.rows[0];

      // Send cancellation email
      this.sendCancellationEmail(reservation).catch(error => {
        logger.error('Failed to send cancellation email:', error);
      });

      return reservation;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Availability Management
  async updateExhibitionAvailability(exhibitionId, availabilityData) {
    const { date, time_slot, capacity, available_spots, price, currency, booking_url, notes } = availabilityData;

    const query = `
      INSERT INTO exhibition_availability (
        exhibition_id, date, time_slot, capacity, available_spots,
        price, currency, booking_url, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (exhibition_id, date, time_slot)
      DO UPDATE SET
        capacity = EXCLUDED.capacity,
        available_spots = EXCLUDED.available_spots,
        price = EXCLUDED.price,
        currency = EXCLUDED.currency,
        booking_url = EXCLUDED.booking_url,
        notes = EXCLUDED.notes,
        last_sync = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(query, [
      exhibitionId, date, time_slot, capacity, available_spots,
      price, currency, booking_url, notes
    ]);

    return result.rows[0];
  }

  async getExhibitionAvailability(exhibitionId, fromDate = null, toDate = null) {
    let query = `
      SELECT * FROM exhibition_availability
      WHERE exhibition_id = $1
    `;

    const params = [exhibitionId];
    let paramCount = 2;

    if (fromDate) {
      query += ` AND date >= $${paramCount}`;
      params.push(fromDate);
      paramCount++;
    }

    if (toDate) {
      query += ` AND date <= $${paramCount}`;
      params.push(toDate);
      paramCount++;
    }

    query += ' ORDER BY date, time_slot';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Reminder System
  async scheduleReservationReminder(client, reservationId, reminderType, scheduledFor) {
    const query = `
      INSERT INTO reservation_reminders (
        user_reservation_id, reminder_type, scheduled_for
      )
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await client.query(query, [reservationId, reminderType, scheduledFor]);
    return result.rows[0];
  }

  async processPendingReminders() {
    const query = `
      SELECT rr.*, ur.*, e.title as exhibition_title, m.name as museum_name
      FROM reservation_reminders rr
      JOIN user_reservations ur ON rr.user_reservation_id = ur.id
      JOIN exhibitions_extended e ON ur.exhibition_id = e.id
      JOIN museums m ON e.museum_id = m.id
      WHERE rr.status = 'pending' AND rr.scheduled_for <= CURRENT_TIMESTAMP
      ORDER BY rr.scheduled_for
    `;

    const result = await pool.query(query);
    const reminders = result.rows;

    for (const reminder of reminders) {
      try {
        await this.sendReminder(reminder);
        
        // Mark as sent
        await pool.query(
          'UPDATE reservation_reminders SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['sent', reminder.id]
        );

      } catch (error) {
        logger.error(`Failed to send reminder ${reminder.id}:`, error);
        
        // Mark as failed
        await pool.query(
          'UPDATE reservation_reminders SET status = $1 WHERE id = $2',
          ['failed', reminder.id]
        );
      }
    }

    return reminders.length;
  }

  // Feedback Collection
  async submitReservationFeedback(reservationId, feedbackData) {
    const {
      rating,
      experience_rating,
      recommendation_score,
      feedback_text,
      liked_aspects = [],
      improvement_suggestions,
      would_visit_again,
      would_recommend,
      accessibility_rating,
      value_for_money,
      metadata = {}
    } = feedbackData;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Insert feedback
      const feedbackQuery = `
        INSERT INTO reservation_feedback (
          user_reservation_id, rating, experience_rating, recommendation_score,
          feedback_text, liked_aspects, improvement_suggestions, would_visit_again,
          would_recommend, accessibility_rating, value_for_money, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const feedbackResult = await client.query(feedbackQuery, [
        reservationId, rating, experience_rating, recommendation_score,
        feedback_text, liked_aspects, improvement_suggestions, would_visit_again,
        would_recommend, accessibility_rating, value_for_money, metadata
      ]);

      // Mark reservation as feedback collected
      await client.query(
        'UPDATE user_reservations SET feedback_collected = true WHERE id = $1',
        [reservationId]
      );

      await client.query('COMMIT');
      return feedbackResult.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Utility Methods
  generateConfirmationCode() {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  }

  async sendConfirmationEmail(reservation) {
    // Implementation would use emailService to send confirmation
    logger.info(`Sending confirmation email for reservation ${reservation.id}`);
  }

  async sendCancellationEmail(reservation) {
    // Implementation would use emailService to send cancellation notice
    logger.info(`Sending cancellation email for reservation ${reservation.id}`);
  }

  async sendReminder(reminder) {
    // Implementation would send appropriate reminder based on type
    logger.info(`Sending ${reminder.reminder_type} reminder for reservation ${reminder.user_reservation_id}`);
  }

  // Analytics
  async getReservationStats(timeframe = '30d') {
    const timeCondition = timeframe === '7d' ? "created_at >= NOW() - INTERVAL '7 days'" :
                         timeframe === '30d' ? "created_at >= NOW() - INTERVAL '30 days'" :
                         timeframe === '90d' ? "created_at >= NOW() - INTERVAL '90 days'" :
                         "created_at >= NOW() - INTERVAL '365 days'";

    const query = `
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN reservation_status = 'confirmed' THEN 1 END) as confirmed_reservations,
        COUNT(CASE WHEN reservation_status = 'cancelled' THEN 1 END) as cancelled_reservations,
        COUNT(CASE WHEN reservation_status = 'completed' THEN 1 END) as completed_reservations,
        AVG(total_cost) as average_cost,
        AVG(party_size) as average_party_size,
        COUNT(CASE WHEN feedback_collected = true THEN 1 END) as feedback_collected
      FROM user_reservations
      WHERE ${timeCondition}
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = new ReservationService();