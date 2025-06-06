const cron = require('node-cron');
const { pool } = require('../config/database');
const emailService = require('./emailService');
const logger = require('../utils/logger');

class EmailAutomationService {
  constructor() {
    this.jobs = new Map();
    this.initializeScheduledJobs();
  }

  initializeScheduledJobs() {
    logger.info('Initializing email automation jobs...');

    // Weekly insights - Every Sunday at 9 AM
    this.scheduleJob('weekly-insights', '0 9 * * 0', () => {
      this.sendWeeklyInsights();
    });

    // Re-engagement emails - Daily at 10 AM
    this.scheduleJob('re-engagement', '0 10 * * *', () => {
      this.sendReEngagementEmails();
    });

    // Profile completion reminders - Daily at 2 PM
    this.scheduleJob('profile-reminders', '0 14 * * *', () => {
      this.sendProfileReminders();
    });

    // Monthly curator's pick - First day of month at 8 AM
    this.scheduleJob('curators-pick', '0 8 1 * *', () => {
      this.sendMonthlyCharacteristicPick();
    });

    // Welcome series follow-ups - Daily at 11 AM
    this.scheduleJob('welcome-series', '0 11 * * *', () => {
      this.sendWelcomeSeriesEmails();
    });

    logger.info('Email automation jobs initialized successfully');
  }

  scheduleJob(name, cronPattern, callback) {
    const job = cron.schedule(cronPattern, callback, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.jobs.set(name, job);
    job.start();
    logger.info(`Scheduled job '${name}' with pattern '${cronPattern}'`);
  }

  async sendWeeklyInsights() {
    logger.info('Starting weekly insights email send...');
    
    try {
      // Get all active users who haven't opted out
      const usersQuery = `
        SELECT u.*, up.type_code, up.archetype_name 
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.email_preferences->>'weekly_insights' != 'false'
        AND u.created_at <= NOW() - INTERVAL '7 days'
        AND u.last_login >= NOW() - INTERVAL '30 days'
      `;
      
      const users = await pool.query(usersQuery);
      
      for (const user of users.rows) {
        try {
          const insights = await this.generateWeeklyInsights(user.id);
          
          if (insights.artworksViewed > 0) {
            await emailService.sendWeeklyInsights(user, insights);
            logger.info(`Weekly insights sent to ${user.email}`);
          }
        } catch (error) {
          logger.error(`Failed to send weekly insights to ${user.email}:`, error);
        }
      }
      
      logger.info(`Weekly insights process completed for ${users.rows.length} users`);
    } catch (error) {
      logger.error('Weekly insights job failed:', error);
    }
  }

  async generateWeeklyInsights(userId) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Get user activity stats
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT ua.artwork_id) as artworks_viewed,
        COALESCE(SUM(ua.time_spent), 0) as total_time_spent,
        COUNT(DISTINCT DATE(ua.created_at)) as active_days,
        COUNT(DISTINCT ac.id) as conversations_count
      FROM user_artwork_interactions ua
      LEFT JOIN agent_conversations ac ON ac.user_id = ua.user_id 
        AND ac.created_at >= $2
      WHERE ua.user_id = $1 AND ua.created_at >= $2
    `;
    
    const statsResult = await pool.query(statsQuery, [userId, oneWeekAgo]);
    const stats = statsResult.rows[0];

    // Get most viewed artwork
    const topArtworkQuery = `
      SELECT a.title, a.artist, a.image_url, SUM(ua.time_spent) as total_time
      FROM user_artwork_interactions ua
      JOIN artworks a ON a.id = ua.artwork_id
      WHERE ua.user_id = $1 AND ua.created_at >= $2
      GROUP BY a.id, a.title, a.artist, a.image_url
      ORDER BY total_time DESC
      LIMIT 1
    `;
    
    const topArtworkResult = await pool.query(topArtworkQuery, [userId, oneWeekAgo]);
    
    // Generate personalized recommendations
    const recommendations = await this.generatePersonalizedRecommendations(userId);

    return {
      weekRange: this.getWeekRange(),
      artworksViewed: parseInt(stats.artworks_viewed) || 0,
      timeSpent: Math.round(parseInt(stats.total_time_spent) / 60) || 0,
      newDiscoveries: parseInt(stats.artworks_viewed) || 0,
      conversationsCount: parseInt(stats.conversations_count) || 0,
      topArtwork: topArtworkResult.rows[0] || null,
      recommendations
    };
  }

  async generatePersonalizedRecommendations(userId) {
    // Get user's aesthetic profile
    const profileQuery = `
      SELECT type_code, archetype_name, emotional_tags, artwork_scores
      FROM user_profiles WHERE user_id = $1
    `;
    const profile = await pool.query(profileQuery, [userId]);
    
    if (!profile.rows[0]) return [];

    const userProfile = profile.rows[0];
    
    // Generate context-aware recommendations
    const recommendations = [
      {
        emoji: '🎨',
        text: `Explore ${this.getRecommendedPeriod(userProfile.type_code)} artworks that align with your ${userProfile.archetype_name} personality`
      },
      {
        emoji: '💬',
        text: `Ask your AI curator about the symbolism in abstract works - perfect for your analytical nature`
      },
      {
        emoji: '🏛️',
        text: `Visit the virtual exhibitions section for curated collections matching your taste`
      },
      {
        emoji: '📝',
        text: `Create your first artwork archive to track pieces that resonate with you`
      }
    ];

    return recommendations;
  }

  async sendReEngagementEmails() {
    logger.info('Starting re-engagement email process...');
    
    try {
      // Find users who haven't logged in for 7-30 days
      const inactiveUsersQuery = `
        SELECT u.*, up.type_code, up.archetype_name,
               EXTRACT(DAY FROM NOW() - u.last_login) as days_inactive
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.last_login BETWEEN NOW() - INTERVAL '30 days' AND NOW() - INTERVAL '7 days'
        AND u.email_preferences->>'re_engagement' != 'false'
        AND NOT EXISTS (
          SELECT 1 FROM email_logs el 
          WHERE el.user_id = u.id 
          AND el.email_type = 'nudge' 
          AND el.sent_at >= NOW() - INTERVAL '7 days'
        )
      `;
      
      const users = await pool.query(inactiveUsersQuery);
      
      for (const user of users.rows) {
        try {
          await emailService.sendReEngagementEmail(user, Math.floor(user.days_inactive));
          
          // Log the email send
          await this.logEmailSent(user.id, 'nudge');
          
          logger.info(`Re-engagement email sent to ${user.email} (${user.days_inactive} days inactive)`);
        } catch (error) {
          logger.error(`Failed to send re-engagement email to ${user.email}:`, error);
        }
      }
      
      logger.info(`Re-engagement process completed for ${users.rows.length} users`);
    } catch (error) {
      logger.error('Re-engagement job failed:', error);
    }
  }

  async sendProfileReminders() {
    logger.info('Starting profile completion reminders...');
    
    try {
      // Find users registered 3+ days ago who haven't completed profile
      const incompleteProfilesQuery = `
        SELECT u.*,
               EXTRACT(DAY FROM NOW() - u.created_at) as days_registered
        FROM users u
        WHERE u.created_at <= NOW() - INTERVAL '3 days'
        AND NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = u.id)
        AND u.email_preferences->>'profile_reminders' != 'false'
        AND NOT EXISTS (
          SELECT 1 FROM email_logs el 
          WHERE el.user_id = u.id 
          AND el.email_type = 'profile-reminder' 
          AND el.sent_at >= NOW() - INTERVAL '7 days'
        )
      `;
      
      const users = await pool.query(incompleteProfilesQuery);
      
      for (const user of users.rows) {
        try {
          await emailService.sendProfileReminderEmail(user);
          await this.logEmailSent(user.id, 'profile-reminder');
          
          logger.info(`Profile reminder sent to ${user.email}`);
        } catch (error) {
          logger.error(`Failed to send profile reminder to ${user.email}:`, error);
        }
      }
      
      logger.info(`Profile reminder process completed for ${users.rows.length} users`);
    } catch (error) {
      logger.error('Profile reminder job failed:', error);
    }
  }

  async sendMonthlyCharacteristicPick() {
    logger.info('Starting monthly curator\'s pick emails...');
    
    try {
      const usersQuery = `
        SELECT u.*, up.type_code, up.archetype_name 
        FROM users u
        JOIN user_profiles up ON u.id = up.user_id
        WHERE u.email_preferences->>'curators_pick' != 'false'
      `;
      
      const users = await pool.query(usersQuery);
      
      for (const user of users.rows) {
        try {
          const curatorsPick = await this.generateCuratorsPick(user);
          await emailService.sendCuratorsPick(user, curatorsPick);
          
          logger.info(`Curator's pick sent to ${user.email}`);
        } catch (error) {
          logger.error(`Failed to send curator's pick to ${user.email}:`, error);
        }
      }
      
      logger.info(`Curator's pick process completed for ${users.rows.length} users`);
    } catch (error) {
      logger.error('Curator\'s pick job failed:', error);
    }
  }

  async generateCuratorsPick(user) {
    // This would typically call the OpenAI service to generate personalized picks
    // For now, returning a template
    return {
      title: 'The Great Wave off Kanagawa',
      artist: 'Katsushika Hokusai',
      imageUrl: 'https://example.com/great-wave.jpg',
      message: `This month's selection speaks to your ${user.archetype_name} personality...`,
      reasoning: 'The dynamic composition and emotional depth align perfectly with your aesthetic preferences.'
    };
  }

  async logEmailSent(userId, emailType) {
    const query = `
      INSERT INTO email_logs (user_id, email_type, sent_at)
      VALUES ($1, $2, NOW())
    `;
    await pool.query(query, [userId, emailType]);
  }

  getWeekRange() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    };
    
    return `${formatDate(oneWeekAgo)} - ${formatDate(now)}`;
  }

  getRecommendedPeriod(typeCode) {
    // Map type codes to historical periods
    const periodMap = {
      'A': 'Contemporary',
      'R': 'Renaissance',
      'M': 'Modern',
      'E': 'Impressionist'
    };
    
    return periodMap[typeCode?.[0]] || 'Contemporary';
  }

  // Manual trigger methods for testing
  async triggerWeeklyInsights() {
    await this.sendWeeklyInsights();
  }

  async triggerReEngagement() {
    await this.sendReEngagementEmails();
  }

  stopAllJobs() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });
  }

  startAllJobs() {
    this.jobs.forEach((job, name) => {
      job.start();
      logger.info(`Started job: ${name}`);
    });
  }
}

module.exports = new EmailAutomationService();