const { pool } = require('../config/database');
const { logger } = require('../config/logger');

class AnalyticsService {
  // User Journey Analytics
  async getUserJourneyStats(userId, timeframe = '30d') {
    try {
      const timeCondition = this.getTimeCondition(timeframe);

      const query = `
        SELECT 
          COUNT(DISTINCT DATE(uai.created_at)) as active_days,
          COUNT(DISTINCT uai.artwork_id) as unique_artworks_viewed,
          COUNT(*) as total_interactions,
          COALESCE(SUM(uai.time_spent), 0) as total_time_spent,
          AVG(uai.time_spent) as avg_time_per_artwork,
          COUNT(DISTINCT ac.id) as ai_conversations,
          COUNT(DISTINCT ua.achievement_id) as achievements_earned,
          COUNT(CASE WHEN uai.interaction_type = 'like' THEN 1 END) as artworks_liked,
          COUNT(CASE WHEN uai.interaction_type = 'share' THEN 1 END) as artworks_shared
        FROM user_artwork_interactions uai
        LEFT JOIN agent_conversations ac ON ac.user_id = uai.user_id 
          AND ac.created_at ${timeCondition}
        LEFT JOIN user_achievements ua ON ua.user_id = uai.user_id 
          AND ua.earned_at ${timeCondition}
        WHERE uai.user_id = $1 AND uai.created_at ${timeCondition}
      `;

      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get user journey stats:', error);
      throw error;
    }
  }

  // Aesthetic Evolution Analysis
  async getAestheticEvolution(userId, timeframe = '30d') {
    try {
      const timeCondition = this.getTimeCondition(timeframe);

      // Get user's interaction patterns over time
      const evolutionQuery = `
        SELECT 
          DATE_TRUNC('week', uai.created_at) as week,
          COALESCE(a.period, 'Unknown') as art_period,
          COALESCE(a.style, 'Unknown') as art_style,
          COALESCE(a.emotional_tone, 'Unknown') as emotional_tone,
          COUNT(*) as interaction_count,
          AVG(uai.time_spent) as avg_engagement_time
        FROM user_artwork_interactions uai
        LEFT JOIN artworks a ON a.id = uai.artwork_id
        WHERE uai.user_id = $1 AND uai.created_at ${timeCondition}
        GROUP BY week, art_period, art_style, emotional_tone
        ORDER BY week DESC
      `;

      const evolution = await pool.query(evolutionQuery, [userId]);

      // Calculate preference shifts
      const preferencesQuery = `
        WITH current_prefs AS (
          SELECT 
            a.period,
            a.style, 
            a.emotional_tone,
            COUNT(*) as recent_count,
            ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as recent_rank
          FROM user_artwork_interactions uai
          LEFT JOIN artworks a ON a.id = uai.artwork_id
          WHERE uai.user_id = $1 AND uai.created_at >= NOW() - INTERVAL '14 days'
          GROUP BY a.period, a.style, a.emotional_tone
        ),
        past_prefs AS (
          SELECT 
            a.period,
            a.style,
            a.emotional_tone,
            COUNT(*) as past_count,
            ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as past_rank
          FROM user_artwork_interactions uai
          LEFT JOIN artworks a ON a.id = uai.artwork_id
          WHERE uai.user_id = $1 AND uai.created_at BETWEEN NOW() - INTERVAL '30 days' AND NOW() - INTERVAL '14 days'
          GROUP BY a.period, a.style, a.emotional_tone
        )
        SELECT 
          cp.period,
          cp.style,
          cp.emotional_tone,
          cp.recent_count,
          cp.recent_rank,
          COALESCE(pp.past_count, 0) as past_count,
          COALESCE(pp.past_rank, 999) as past_rank,
          (cp.recent_rank - COALESCE(pp.past_rank, 999)) as rank_change
        FROM current_prefs cp
        LEFT JOIN past_prefs pp ON cp.period = pp.period 
          AND cp.style = pp.style 
          AND cp.emotional_tone = pp.emotional_tone
        WHERE cp.recent_rank <= 5
        ORDER BY cp.recent_rank
      `;

      const preferences = await pool.query(preferencesQuery, [userId]);

      return {
        evolution: evolution.rows,
        preferences: preferences.rows
      };
    } catch (error) {
      logger.error('Failed to get aesthetic evolution:', error);
      throw error;
    }
  }

  // Engagement Patterns
  async getEngagementPatterns(userId, timeframe = '30d') {
    try {
      const timeCondition = this.getTimeCondition(timeframe);

      // Daily activity patterns
      const dailyPatternQuery = `
        SELECT 
          EXTRACT(HOUR FROM uai.created_at) as hour,
          COUNT(*) as interaction_count,
          AVG(uai.time_spent) as avg_engagement_time
        FROM user_artwork_interactions uai
        WHERE uai.user_id = $1 AND uai.created_at ${timeCondition}
        GROUP BY hour
        ORDER BY hour
      `;

      // Weekly patterns
      const weeklyPatternQuery = `
        SELECT 
          EXTRACT(DOW FROM uai.created_at) as day_of_week,
          COUNT(*) as interaction_count,
          AVG(uai.time_spent) as avg_engagement_time
        FROM user_artwork_interactions uai
        WHERE uai.user_id = $1 AND uai.created_at ${timeCondition}
        GROUP BY day_of_week
        ORDER BY day_of_week
      `;

      // Session patterns
      const sessionQuery = `
        WITH sessions AS (
          SELECT 
            DATE_TRUNC('day', created_at) as session_date,
            COUNT(*) as interactions_per_session,
            SUM(time_spent) as session_duration,
            MIN(created_at) as session_start,
            MAX(created_at) as session_end
          FROM user_artwork_interactions
          WHERE user_id = $1 AND created_at ${timeCondition}
          GROUP BY DATE_TRUNC('day', created_at)
        )
        SELECT 
          AVG(interactions_per_session) as avg_interactions_per_session,
          AVG(session_duration) as avg_session_duration,
          AVG(EXTRACT(EPOCH FROM (session_end - session_start))/60) as avg_session_length_minutes,
          COUNT(*) as total_sessions
        FROM sessions
      `;

      const [hourly, weekly, sessions] = await Promise.all([
        pool.query(dailyPatternQuery, [userId]),
        pool.query(weeklyPatternQuery, [userId]),
        pool.query(sessionQuery, [userId])
      ]);

      return {
        hourlyPatterns: hourly.rows,
        weeklyPatterns: weekly.rows,
        sessionStats: sessions.rows[0]
      };
    } catch (error) {
      logger.error('Failed to get engagement patterns:', error);
      throw error;
    }
  }

  // Discovery Analytics
  async getDiscoveryAnalytics(userId, timeframe = '30d') {
    try {
      const timeCondition = this.getTimeCondition(timeframe);

      // Discovery sources
      const sourcesQuery = `
        SELECT 
          uai.discovery_source,
          COUNT(*) as discoveries,
          AVG(uai.time_spent) as avg_engagement,
          COUNT(CASE WHEN uai.interaction_type = 'like' THEN 1 END) as liked_count
        FROM user_artwork_interactions uai
        WHERE uai.user_id = $1 
        AND uai.created_at ${timeCondition}
        AND uai.interaction_type = 'view'
        GROUP BY uai.discovery_source
        ORDER BY discoveries DESC
      `;

      // Most engaging discoveries
      const engagingQuery = `
        SELECT 
          a.title,
          a.artist,
          a.period,
          a.style,
          uai.time_spent,
          uai.discovery_source,
          uai.created_at as discovered_at
        FROM user_artwork_interactions uai
        LEFT JOIN artworks a ON a.id = uai.artwork_id
        WHERE uai.user_id = $1 
        AND uai.created_at ${timeCondition}
        AND uai.interaction_type = 'view'
        ORDER BY uai.time_spent DESC
        LIMIT 10
      `;

      // New vs familiar preferences
      const familiarityQuery = `
        WITH artwork_familiarity AS (
          SELECT 
            uai.artwork_id,
            COUNT(*) as view_count,
            MIN(uai.created_at) as first_view,
            MAX(uai.created_at) as last_view,
            SUM(uai.time_spent) as total_time
          FROM user_artwork_interactions uai
          WHERE uai.user_id = $1 AND uai.interaction_type = 'view'
          GROUP BY uai.artwork_id
        )
        SELECT 
          CASE 
            WHEN view_count = 1 THEN 'new_discovery'
            WHEN view_count BETWEEN 2 AND 5 THEN 'revisited'
            ELSE 'frequently_viewed'
          END as familiarity_level,
          COUNT(*) as artwork_count,
          AVG(total_time) as avg_total_engagement
        FROM artwork_familiarity af
        WHERE first_view ${timeCondition}
        GROUP BY familiarity_level
      `;

      const [sources, engaging, familiarity] = await Promise.all([
        pool.query(sourcesQuery, [userId]),
        pool.query(engagingQuery, [userId]),
        pool.query(familiarityQuery, [userId])
      ]);

      return {
        discoverySources: sources.rows,
        mostEngaging: engaging.rows,
        familiarityBreakdown: familiarity.rows
      };
    } catch (error) {
      logger.error('Failed to get discovery analytics:', error);
      throw error;
    }
  }

  // AI Interaction Analytics
  async getAIInteractionAnalytics(userId, timeframe = '30d') {
    try {
      const timeCondition = this.getTimeCondition(timeframe);

      const conversationQuery = `
        SELECT 
          COUNT(*) as total_conversations,
          AVG(message_count) as avg_messages_per_conversation,
          SUM(message_count) as total_messages,
          AVG(EXTRACT(EPOCH FROM (last_message_at - created_at))/60) as avg_conversation_length_minutes,
          MODE() WITHIN GROUP (ORDER BY sentiment) as dominant_sentiment,
          array_agg(DISTINCT unnest(topics)) as discussed_topics
        FROM agent_conversations
        WHERE user_id = $1 AND created_at ${timeCondition}
      `;

      const topicsQuery = `
        SELECT 
          topic,
          COUNT(*) as frequency,
          AVG(ac.message_count) as avg_messages_when_discussed
        FROM agent_conversations ac,
        unnest(ac.topics) as topic
        WHERE ac.user_id = $1 AND ac.created_at ${timeCondition}
        GROUP BY topic
        ORDER BY frequency DESC
        LIMIT 10
      `;

      const sentimentTrendQuery = `
        SELECT 
          DATE_TRUNC('week', created_at) as week,
          sentiment,
          COUNT(*) as conversation_count
        FROM agent_conversations
        WHERE user_id = $1 AND created_at ${timeCondition}
        GROUP BY week, sentiment
        ORDER BY week DESC
      `;

      const [conversations, topics, sentimentTrend] = await Promise.all([
        pool.query(conversationQuery, [userId]),
        pool.query(topicsQuery, [userId]),
        pool.query(sentimentTrendQuery, [userId])
      ]);

      return {
        conversationStats: conversations.rows[0],
        topTopics: topics.rows,
        sentimentTrend: sentimentTrend.rows
      };
    } catch (error) {
      logger.error('Failed to get AI interaction analytics:', error);
      throw error;
    }
  }

  // Achievement Progress Analytics
  async getAchievementAnalytics(userId) {
    try {
      const achievementQuery = `
        SELECT 
          a.id,
          a.name,
          a.description,
          a.category,
          a.points,
          ua.earned_at,
          ua.progress,
          CASE WHEN ua.earned_at IS NOT NULL THEN true ELSE false END as earned
        FROM achievements a
        LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = $1
        ORDER BY a.category, earned DESC, a.points ASC
      `;

      const progressQuery = `
        SELECT 
          a.category,
          COUNT(*) as total_in_category,
          COUNT(ua.earned_at) as earned_in_category,
          ROUND(COUNT(ua.earned_at)::numeric / COUNT(*) * 100, 2) as completion_percentage,
          SUM(CASE WHEN ua.earned_at IS NOT NULL THEN a.points ELSE 0 END) as points_earned,
          SUM(a.points) as total_possible_points
        FROM achievements a
        LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = $1
        GROUP BY a.category
        ORDER BY completion_percentage DESC
      `;

      const [achievements, progress] = await Promise.all([
        pool.query(achievementQuery, [userId]),
        pool.query(progressQuery, [userId])
      ]);

      return {
        achievements: achievements.rows,
        categoryProgress: progress.rows
      };
    } catch (error) {
      logger.error('Failed to get achievement analytics:', error);
      throw error;
    }
  }

  // Comparative Analytics (user vs. others with same type)
  async getComparativeAnalytics(userId) {
    try {
      // Get user's type
      const userTypeQuery = `
        SELECT type_code, archetype_name 
        FROM user_profiles 
        WHERE user_id = $1
      `;
      const userType = await pool.query(userTypeQuery, [userId]);

      if (!userType.rows[0]) {
        return { error: 'User profile not found' };
      }

      const typeCode = userType.rows[0].type_code;

      // Compare with users of same type
      const comparisonQuery = `
        WITH user_stats AS (
          SELECT 
            COUNT(DISTINCT uai.artwork_id) as artworks_viewed,
            COUNT(DISTINCT ac.id) as ai_conversations,
            COUNT(DISTINCT ua.achievement_id) as achievements_earned,
            COALESCE(SUM(uai.time_spent), 0) as total_time_spent
          FROM user_artwork_interactions uai
          LEFT JOIN agent_conversations ac ON ac.user_id = uai.user_id
          LEFT JOIN user_achievements ua ON ua.user_id = uai.user_id
          WHERE uai.user_id = $1
          AND uai.created_at >= NOW() - INTERVAL '30 days'
        ),
        type_averages AS (
          SELECT 
            AVG(stats.artworks_viewed) as avg_artworks_viewed,
            AVG(stats.ai_conversations) as avg_ai_conversations,
            AVG(stats.achievements_earned) as avg_achievements_earned,
            AVG(stats.total_time_spent) as avg_total_time_spent,
            COUNT(DISTINCT up.user_id) as total_users_of_type
          FROM user_profiles up
          LEFT JOIN LATERAL (
            SELECT 
              COUNT(DISTINCT uai.artwork_id) as artworks_viewed,
              COUNT(DISTINCT ac.id) as ai_conversations,
              COUNT(DISTINCT ua.achievement_id) as achievements_earned,
              COALESCE(SUM(uai.time_spent), 0) as total_time_spent
            FROM user_artwork_interactions uai
            LEFT JOIN agent_conversations ac ON ac.user_id = uai.user_id
            LEFT JOIN user_achievements ua ON ua.user_id = uai.user_id
            WHERE uai.user_id = up.user_id
            AND uai.created_at >= NOW() - INTERVAL '30 days'
          ) stats ON true
          WHERE up.type_code = $2
        )
        SELECT 
          us.*,
          ta.*,
          CASE 
            WHEN us.artworks_viewed > ta.avg_artworks_viewed THEN 'above_average'
            WHEN us.artworks_viewed < ta.avg_artworks_viewed THEN 'below_average'
            ELSE 'average'
          END as exploration_level,
          CASE 
            WHEN us.ai_conversations > ta.avg_ai_conversations THEN 'above_average'
            WHEN us.ai_conversations < ta.avg_ai_conversations THEN 'below_average'
            ELSE 'average'
          END as ai_engagement_level
        FROM user_stats us
        CROSS JOIN type_averages ta
      `;

      const comparison = await pool.query(comparisonQuery, [userId, typeCode]);

      return {
        userType: userType.rows[0],
        comparison: comparison.rows[0]
      };
    } catch (error) {
      logger.error('Failed to get comparative analytics:', error);
      throw error;
    }
  }

  // Platform-wide Analytics (admin only)
  async getPlatformAnalytics(timeframe = '30d') {
    try {
      const timeCondition = this.getTimeCondition(timeframe);

      // User engagement metrics
      const engagementQuery = `
        SELECT 
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT CASE WHEN u.last_login ${timeCondition} THEN u.id END) as active_users,
          COUNT(DISTINCT up.user_id) as users_with_profiles,
          COUNT(DISTINCT uai.user_id) as users_viewing_art,
          COUNT(DISTINCT ac.user_id) as users_chatting_ai,
          AVG(user_stats.artworks_per_user) as avg_artworks_per_user,
          AVG(user_stats.time_per_user) as avg_time_per_user
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.id
        LEFT JOIN user_artwork_interactions uai ON uai.user_id = u.id AND uai.created_at ${timeCondition}
        LEFT JOIN agent_conversations ac ON ac.user_id = u.id AND ac.created_at ${timeCondition}
        LEFT JOIN LATERAL (
          SELECT 
            COUNT(DISTINCT artwork_id) as artworks_per_user,
            COALESCE(SUM(time_spent), 0) as time_per_user
          FROM user_artwork_interactions
          WHERE user_id = u.id AND created_at ${timeCondition}
        ) user_stats ON true
      `;

      // Content metrics
      const contentQuery = `
        SELECT 
          COUNT(DISTINCT uai.artwork_id) as artworks_viewed,
          COUNT(*) as total_interactions,
          SUM(uai.time_spent) as total_engagement_time,
          COUNT(DISTINCT ac.id) as total_conversations,
          SUM(ac.message_count) as total_ai_messages
        FROM user_artwork_interactions uai
        LEFT JOIN agent_conversations ac ON ac.created_at ${timeCondition}
        WHERE uai.created_at ${timeCondition}
      `;

      // Growth metrics
      const growthQuery = `
        SELECT 
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as new_users
        FROM users
        WHERE created_at ${timeCondition}
        GROUP BY date
        ORDER BY date
      `;

      const [engagement, content, growth] = await Promise.all([
        pool.query(engagementQuery),
        pool.query(contentQuery),
        pool.query(growthQuery)
      ]);

      return {
        engagement: engagement.rows[0],
        content: content.rows[0],
        growth: growth.rows
      };
    } catch (error) {
      logger.error('Failed to get platform analytics:', error);
      throw error;
    }
  }

  // Helper method to get time condition based on timeframe
  getTimeCondition(timeframe) {
    switch (timeframe) {
      case '7d':
        return '>= NOW() - INTERVAL \'7 days\'';
      case '30d':
        return '>= NOW() - INTERVAL \'30 days\'';
      case '90d':
        return '>= NOW() - INTERVAL \'90 days\'';
      case '1y':
        return '>= NOW() - INTERVAL \'1 year\'';
      default:
        return '>= NOW() - INTERVAL \'30 days\'';
    }
  }

  // Generate comprehensive user report
  async generateUserReport(userId, timeframe = '30d') {
    try {
      const [
        journeyStats,
        aestheticEvolution,
        engagementPatterns,
        discoveryAnalytics,
        aiInteractions,
        achievements,
        comparative
      ] = await Promise.all([
        this.getUserJourneyStats(userId, timeframe),
        this.getAestheticEvolution(userId, timeframe),
        this.getEngagementPatterns(userId, timeframe),
        this.getDiscoveryAnalytics(userId, timeframe),
        this.getAIInteractionAnalytics(userId, timeframe),
        this.getAchievementAnalytics(userId),
        this.getComparativeAnalytics(userId)
      ]);

      return {
        timeframe,
        generatedAt: new Date(),
        journeyStats,
        aestheticEvolution,
        engagementPatterns,
        discoveryAnalytics,
        aiInteractions,
        achievements,
        comparative
      };
    } catch (error) {
      logger.error('Failed to generate user report:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
