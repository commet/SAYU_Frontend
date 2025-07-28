const { pool } = require('../config/database');
const logger = require('../utils/logger');

class EvolutionService {
  constructor() {
    this.pointsConfig = {
      DAILY_LOGIN: 2,
      GALLERY_VISIT: 10,
      ARTWORK_VIEW: 5,
      COMMUNITY_POST: 15,
      COMMUNITY_COMMENT: 8,
      CARD_EXCHANGE: 20,
      QUIZ_COMPLETION: 25,
      FRIEND_INVITE: 30,
      EVENT_PARTICIPATION: 15,
      ACHIEVEMENT_UNLOCK: 12
    };

    this.evolutionThreshold = 100;
  }

  // Award points for various activities
  async awardPoints(userId, activityType, activityData = {}) {
    try {
      const points = this.pointsConfig[activityType];
      if (!points) {
        logger.warn(`Unknown activity type: ${activityType}`);
        return null;
      }

      // Check for daily limits on certain activities
      if (await this.isActivityLimited(userId, activityType)) {
        logger.info(`Activity ${activityType} limited for user ${userId}`);
        return null;
      }

      // Record the activity
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insert activity record
        const activityResult = await client.query(`
          INSERT INTO evolution_activities (user_id, activity_type, points_earned, activity_data)
          VALUES ($1, $2, $3, $4)
          RETURNING id, created_at
        `, [userId, activityType, points, activityData]);

        // Update user's evolution points
        const userUpdateResult = await client.query(`
          UPDATE users 
          SET evolution_points = COALESCE(evolution_points, 0) + $1
          WHERE id = $2
          RETURNING evolution_points, evolution_stage, current_identity_type
        `, [points, userId]);

        const user = userUpdateResult.rows[0];
        const newPoints = user.evolution_points;
        const currentStage = user.evolution_stage;

        // Check if evolution is possible
        const evolutionReady = newPoints >= this.evolutionThreshold;

        await client.query('COMMIT');

        logger.info(`Awarded ${points} points to user ${userId} for ${activityType}`);

        return {
          pointsAwarded: points,
          totalPoints: newPoints,
          currentStage,
          evolutionReady,
          activityId: activityResult.rows[0].id
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error awarding points:', error);
      throw error;
    }
  }

  // Check if activity is limited (e.g., daily login only once per day)
  async isActivityLimited(userId, activityType) {
    const limits = {
      DAILY_LOGIN: '24 hours',
      GALLERY_VISIT: '1 hour',
      ARTWORK_VIEW: '5 minutes'
    };

    const limit = limits[activityType];
    if (!limit) return false;

    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT COUNT(*) as count
          FROM evolution_activities
          WHERE user_id = $1 
            AND activity_type = $2 
            AND created_at > NOW() - INTERVAL '${limit}'
        `, [userId, activityType]);

        return parseInt(result.rows[0].count) > 0;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error checking activity limit:', error);
      return false;
    }
  }

  // Process identity evolution
  async processEvolution(userId, newIdentityType, reason = 'quiz_retake') {
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Get current user data
        const userResult = await client.query(`
          SELECT current_identity_type, evolution_stage, evolution_points
          FROM users
          WHERE id = $1
        `, [userId]);

        const currentUser = userResult.rows[0];
        const oldIdentity = currentUser.current_identity_type;
        const currentStage = currentUser.evolution_stage;

        // End current identity history
        if (oldIdentity) {
          await client.query(`
            UPDATE identity_history
            SET end_date = NOW(), evolution_points_at_change = $1
            WHERE user_id = $2 AND end_date IS NULL
          `, [currentUser.evolution_points, userId]);
        }

        // Create new identity history record
        await client.query(`
          INSERT INTO identity_history (user_id, identity_type, evolution_points_at_change, reason_for_change)
          VALUES ($1, $2, $3, $4)
        `, [userId, newIdentityType, currentUser.evolution_points, reason]);

        // Update user with new identity
        const newStage = currentStage + (oldIdentity && oldIdentity !== newIdentityType ? 1 : 0);
        await client.query(`
          UPDATE users
          SET current_identity_type = $1,
              evolution_stage = $2,
              evolution_points = GREATEST(evolution_points - $3, 0),
              identity_evolved_at = NOW()
          WHERE id = $4
        `, [newIdentityType, newStage, this.evolutionThreshold, userId]);

        await client.query('COMMIT');

        logger.info(`User ${userId} evolved from ${oldIdentity} to ${newIdentityType}`);

        return {
          oldIdentity,
          newIdentity: newIdentityType,
          newStage,
          evolutionReason: reason
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error processing evolution:', error);
      throw error;
    }
  }

  // Get user's evolution history
  async getEvolutionHistory(userId) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT 
            identity_type,
            start_date,
            end_date,
            evolution_points_at_change,
            reason_for_change,
            CASE 
              WHEN end_date IS NULL THEN TRUE 
              ELSE FALSE 
            END as is_current
          FROM identity_history
          WHERE user_id = $1
          ORDER BY start_date ASC
        `, [userId]);

        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error getting evolution history:', error);
      throw error;
    }
  }

  // Get recent activities for journey timeline
  async getRecentActivities(userId, limit = 10) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT 
            activity_type,
            points_earned,
            activity_data,
            created_at
          FROM evolution_activities
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT $2
        `, [userId, limit]);

        return result.rows.map(activity => ({
          date: activity.created_at,
          event: this.formatActivityEvent(activity.activity_type, activity.activity_data),
          type: this.getActivityCategory(activity.activity_type),
          impact: `+${activity.points_earned} points`
        }));
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error getting recent activities:', error);
      throw error;
    }
  }

  // Format activity for display
  formatActivityEvent(activityType, activityData) {
    const formatMap = {
      DAILY_LOGIN: 'Daily Login',
      GALLERY_VISIT: `Visited ${activityData.galleryName || 'Gallery'}`,
      ARTWORK_VIEW: `Viewed ${activityData.artworkTitle || 'Artwork'}`,
      COMMUNITY_POST: 'Posted in Community',
      COMMUNITY_COMMENT: 'Commented on Post',
      CARD_EXCHANGE: `Exchanged Cards with ${activityData.partnerName || 'Someone'}`,
      QUIZ_COMPLETION: 'Completed Quiz',
      FRIEND_INVITE: 'Invited Friend',
      EVENT_PARTICIPATION: `Joined ${activityData.eventName || 'Event'}`,
      ACHIEVEMENT_UNLOCK: `Unlocked ${activityData.achievementName || 'Achievement'}`
    };

    return formatMap[activityType] || activityType;
  }

  // Get activity category for timeline visualization
  getActivityCategory(activityType) {
    const categoryMap = {
      DAILY_LOGIN: 'community',
      GALLERY_VISIT: 'gallery',
      ARTWORK_VIEW: 'artwork',
      COMMUNITY_POST: 'community',
      COMMUNITY_COMMENT: 'community',
      CARD_EXCHANGE: 'community',
      QUIZ_COMPLETION: 'quiz',
      FRIEND_INVITE: 'community',
      EVENT_PARTICIPATION: 'community',
      ACHIEVEMENT_UNLOCK: 'achievement'
    };

    return categoryMap[activityType] || 'general';
  }

  // Get evolution statistics
  async getEvolutionStats(userId) {
    try {
      const client = await pool.connect();
      try {
        // Current user stats
        const userResult = await client.query(`
          SELECT 
            current_identity_type,
            evolution_stage,
            evolution_points,
            identity_evolved_at,
            created_at
          FROM users
          WHERE id = $1
        `, [userId]);

        // Total activities count
        const activitiesResult = await client.query(`
          SELECT 
            activity_type,
            COUNT(*) as count,
            SUM(points_earned) as total_points
          FROM evolution_activities
          WHERE user_id = $1
          GROUP BY activity_type
        `, [userId]);

        // Evolution count
        const evolutionsResult = await client.query(`
          SELECT COUNT(*) as evolution_count
          FROM identity_history
          WHERE user_id = $1 AND end_date IS NOT NULL
        `, [userId]);

        return {
          currentUser: userResult.rows[0],
          activities: activitiesResult.rows,
          evolutionCount: parseInt(evolutionsResult.rows[0].evolution_count)
        };
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error getting evolution stats:', error);
      throw error;
    }
  }
}

module.exports = new EvolutionService();
