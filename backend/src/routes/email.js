const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { pool } = require('../config/database');
const emailService = require('../services/emailService');
const emailAutomation = require('../services/emailAutomation');
const { logger } = require("../config/logger");
const crypto = require('crypto');

const router = express.Router();

// Get user's email preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const query = `
      SELECT * FROM email_preferences 
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [req.userId]);
    
    if (result.rows.length === 0) {
      // Create default preferences if they don't exist
      const insertQuery = `
        INSERT INTO email_preferences (user_id)
        VALUES ($1)
        RETURNING *
      `;
      const insertResult = await pool.query(insertQuery, [req.userId]);
      return res.json({ preferences: insertResult.rows[0] });
    }
    
    res.json({ preferences: result.rows[0] });
  } catch (error) {
    logger.error('Failed to get email preferences:', error);
    res.status(500).json({ error: 'Failed to get email preferences' });
  }
});

// Update user's email preferences
router.put('/preferences', [
  auth,
  body('weekly_insights').optional().isBoolean(),
  body('achievement_notifications').optional().isBoolean(),
  body('re_engagement').optional().isBoolean(),
  body('profile_reminders').optional().isBoolean(),
  body('curators_pick').optional().isBoolean(),
  body('marketing').optional().isBoolean(),
  body('frequency_preference').optional().isIn(['minimal', 'normal', 'frequent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      weekly_insights,
      achievement_notifications,
      re_engagement,
      profile_reminders,
      curators_pick,
      marketing,
      frequency_preference
    } = req.body;

    const updateQuery = `
      UPDATE email_preferences SET
        weekly_insights = COALESCE($2, weekly_insights),
        achievement_notifications = COALESCE($3, achievement_notifications),
        re_engagement = COALESCE($4, re_engagement),
        profile_reminders = COALESCE($5, profile_reminders),
        curators_pick = COALESCE($6, curators_pick),
        marketing = COALESCE($7, marketing),
        frequency_preference = COALESCE($8, frequency_preference),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      req.userId,
      weekly_insights,
      achievement_notifications,
      re_engagement,
      profile_reminders,
      curators_pick,
      marketing,
      frequency_preference
    ]);

    logger.info(`Email preferences updated for user ${req.userId}`);
    res.json({ preferences: result.rows[0] });
  } catch (error) {
    logger.error('Failed to update email preferences:', error);
    res.status(500).json({ error: 'Failed to update email preferences' });
  }
});

// Unsubscribe from all emails
router.post('/unsubscribe', [
  body('email').isEmail(),
  body('token').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user by email
    const userQuery = 'SELECT id FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Update preferences to unsubscribe from all
    const updateQuery = `
      UPDATE email_preferences SET
        weekly_insights = false,
        achievement_notifications = false,
        re_engagement = false,
        profile_reminders = false,
        curators_pick = false,
        marketing = false,
        unsubscribed_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `;

    await pool.query(updateQuery, [userId]);

    logger.info(`User ${email} unsubscribed from all emails`);
    res.json({ message: 'Successfully unsubscribed from all emails' });
  } catch (error) {
    logger.error('Failed to unsubscribe user:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Email verification endpoint
router.post('/verify', [
  body('token').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;

    // Find and validate token
    const tokenQuery = `
      SELECT user_id, expires_at FROM email_verification_tokens 
      WHERE token = $1 AND used_at IS NULL
    `;
    const tokenResult = await pool.query(tokenQuery, [token]);

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const { user_id, expires_at } = tokenResult.rows[0];

    if (new Date() > new Date(expires_at)) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    // Mark token as used and verify user email
    await pool.query('BEGIN');

    await pool.query(
      'UPDATE email_verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = $1',
      [token]
    );

    await pool.query(
      'UPDATE users SET email_verified = true WHERE id = $1',
      [user_id]
    );

    await pool.query('COMMIT');

    logger.info(`Email verified for user ${user_id}`);
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    logger.error('Email verification failed:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Send verification email
router.post('/send-verification', auth, async (req, res) => {
  try {
    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [req.userId]);
    const user = userResult.rows[0];

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token
    await pool.query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [req.userId, token, expiresAt]
    );

    // Send verification email
    await emailService.sendVerificationEmail(user, token);

    logger.info(`Verification email sent to ${user.email}`);
    res.json({ message: 'Verification email sent' });
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Get email analytics (admin only)
router.get('/analytics', auth, async (req, res) => {
  try {
    // Check if user is admin
    const userQuery = 'SELECT role FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [req.userId]);
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const analyticsQuery = `
      SELECT 
        email_type,
        COUNT(*) as total_sent,
        COUNT(opened_at) as total_opened,
        COUNT(clicked_at) as total_clicked,
        ROUND(COUNT(opened_at)::numeric / COUNT(*) * 100, 2) as open_rate,
        ROUND(COUNT(clicked_at)::numeric / COUNT(*) * 100, 2) as click_rate
      FROM email_logs 
      WHERE sent_at >= NOW() - INTERVAL '30 days'
      GROUP BY email_type
      ORDER BY total_sent DESC
    `;

    const result = await pool.query(analyticsQuery);
    res.json({ analytics: result.rows });
  } catch (error) {
    logger.error('Failed to get email analytics:', error);
    res.status(500).json({ error: 'Failed to get email analytics' });
  }
});

// Manual trigger for email campaigns (admin only)
router.post('/trigger/:campaign', auth, async (req, res) => {
  try {
    // Check if user is admin
    const userQuery = 'SELECT role FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [req.userId]);
    
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { campaign } = req.params;

    switch (campaign) {
      case 'weekly-insights':
        await emailAutomation.triggerWeeklyInsights();
        break;
      case 're-engagement':
        await emailAutomation.triggerReEngagement();
        break;
      default:
        return res.status(400).json({ error: 'Invalid campaign type' });
    }

    logger.info(`Manual email campaign triggered: ${campaign} by user ${req.userId}`);
    res.json({ message: `${campaign} campaign triggered successfully` });
  } catch (error) {
    logger.error(`Failed to trigger campaign ${req.params.campaign}:`, error);
    res.status(500).json({ error: 'Failed to trigger campaign' });
  }
});

// Test email endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  router.post('/test', auth, async (req, res) => {
    try {
      const { templateName, email } = req.body;
      
      const userQuery = 'SELECT * FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [req.userId]);
      const user = userResult.rows[0];

      const mockData = {
        userName: user.nickname,
        typeCode: 'AESR',
        archetypeName: 'Romantic Idealist',
        weekRange: 'Jan 1 - Jan 7',
        artworksViewed: 12,
        timeSpent: 45,
        newDiscoveries: 3,
        achievementName: 'Art Explorer',
        achievementDescription: 'Viewed 10 different artworks',
        achievementIcon: '🎨',
        totalAchievements: 5,
        daysSinceLastVisit: 7
      };

      await emailService.sendEmail({
        to: email || user.email,
        subject: `Test Email - ${templateName}`,
        templateName,
        variables: mockData
      });

      res.json({ message: 'Test email sent successfully' });
    } catch (error) {
      logger.error('Failed to send test email:', error);
      res.status(500).json({ error: 'Failed to send test email' });
    }
  });
}

module.exports = router;