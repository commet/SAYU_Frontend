const pool = require('../config/database');
const redis = require('../config/redis');
const { captureException } = require('../config/sentry');

class BehavioralInsightsService {
  // Track viewing patterns by personality type
  async trackViewingBehavior(userId, artworkId, data) {
    try {
      const {
        timeSpent,
        interactions,
        emotionalResponse,
        scrollDepth,
        zoomLevel,
        timestamp = new Date()
      } = data;

      // Get user's personality type
      const userResult = await pool.query(
        'SELECT personality_type FROM users WHERE id = $1',
        [userId]
      );
      
      const personalityType = userResult.rows[0]?.personality_type;

      // Record viewing behavior
      await pool.query(`
        INSERT INTO artwork_viewing_behavior 
        (user_id, artwork_id, personality_type, time_spent, interactions, 
         emotional_response, scroll_depth, zoom_level, viewed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        userId, artworkId, personalityType, timeSpent, interactions,
        emotionalResponse, scrollDepth, zoomLevel, timestamp
      ]);

      // Update real-time analytics in Redis
      await this.updateRealtimeAnalytics(userId, personalityType, data);

      return { success: true };
    } catch (error) {
      captureException(error, { 
        context: 'trackViewingBehavior',
        userId,
        artworkId 
      });
      throw error;
    }
  }

  // Analyze viewing patterns by personality type
  async analyzeViewingPatterns(userId, timeframe = '30d') {
    try {
      const query = `
        WITH user_personality AS (
          SELECT personality_type FROM users WHERE id = $1
        ),
        viewing_stats AS (
          SELECT 
            AVG(time_spent) as avg_time_spent,
            COUNT(DISTINCT artwork_id) as artworks_viewed,
            AVG(scroll_depth) as avg_scroll_depth,
            AVG(zoom_level) as avg_zoom_level,
            array_agg(DISTINCT emotional_response) as emotional_responses,
            DATE(viewed_at) as view_date
          FROM artwork_viewing_behavior
          WHERE user_id = $1
            AND viewed_at >= NOW() - INTERVAL '${timeframe}'
          GROUP BY DATE(viewed_at)
        ),
        personality_comparison AS (
          SELECT 
            personality_type,
            AVG(time_spent) as avg_time_by_personality
          FROM artwork_viewing_behavior
          WHERE personality_type = (SELECT personality_type FROM user_personality)
            AND viewed_at >= NOW() - INTERVAL '${timeframe}'
          GROUP BY personality_type
        )
        SELECT 
          vs.*,
          up.personality_type,
          pc.avg_time_by_personality
        FROM viewing_stats vs
        CROSS JOIN user_personality up
        LEFT JOIN personality_comparison pc ON true
        ORDER BY vs.view_date DESC
      `;

      const result = await pool.query(query, [userId]);
      
      return this.processViewingPatterns(result.rows);
    } catch (error) {
      captureException(error, { userId, timeframe });
      throw error;
    }
  }

  // Visualize movement patterns through galleries
  async getGalleryPathAnalysis(userId, sessionId) {
    try {
      const query = `
        SELECT 
          a.id,
          a.title,
          a.artist_name,
          a.style,
          a.period,
          vb.viewed_at,
          vb.time_spent,
          vb.emotional_response,
          LAG(vb.viewed_at) OVER (ORDER BY vb.viewed_at) as prev_viewed_at,
          LEAD(a.style) OVER (ORDER BY vb.viewed_at) as next_style
        FROM artwork_viewing_behavior vb
        JOIN artworks a ON vb.artwork_id = a.id
        WHERE vb.user_id = $1
          AND vb.session_id = $2
        ORDER BY vb.viewed_at
      `;

      const result = await pool.query(query, [userId, sessionId]);
      
      return this.analyzeGalleryPath(result.rows);
    } catch (error) {
      captureException(error, { userId, sessionId });
      throw error;
    }
  }

  // Map emotional journey over time
  async mapEmotionalJourney(userId, timeframe = '30d') {
    try {
      const query = `
        WITH emotional_timeline AS (
          SELECT 
            DATE(viewed_at) as date,
            emotional_response,
            COUNT(*) as response_count,
            AVG(time_spent) as avg_engagement,
            array_agg(DISTINCT a.style) as art_styles
          FROM artwork_viewing_behavior vb
          JOIN artworks a ON vb.artwork_id = a.id
          WHERE vb.user_id = $1
            AND vb.viewed_at >= NOW() - INTERVAL '${timeframe}'
            AND emotional_response IS NOT NULL
          GROUP BY DATE(viewed_at), emotional_response
        ),
        emotional_transitions AS (
          SELECT 
            emotional_response,
            LAG(emotional_response) OVER (ORDER BY viewed_at) as prev_emotion,
            LEAD(emotional_response) OVER (ORDER BY viewed_at) as next_emotion,
            viewed_at
          FROM artwork_viewing_behavior
          WHERE user_id = $1
            AND viewed_at >= NOW() - INTERVAL '${timeframe}'
            AND emotional_response IS NOT NULL
        )
        SELECT * FROM emotional_timeline
        ORDER BY date DESC
      `;

      const timelineResult = await pool.query(query, [userId]);
      
      // Get emotional transitions
      const transitionsQuery = `
        SELECT 
          prev_emotion,
          emotional_response as current_emotion,
          COUNT(*) as transition_count
        FROM (
          SELECT 
            emotional_response,
            LAG(emotional_response) OVER (ORDER BY viewed_at) as prev_emotion
          FROM artwork_viewing_behavior
          WHERE user_id = $1
            AND viewed_at >= NOW() - INTERVAL '${timeframe}'
            AND emotional_response IS NOT NULL
        ) t
        WHERE prev_emotion IS NOT NULL
        GROUP BY prev_emotion, current_emotion
        ORDER BY transition_count DESC
      `;

      const transitionsResult = await pool.query(transitionsQuery, [userId]);

      return {
        timeline: this.processEmotionalTimeline(timelineResult.rows),
        transitions: this.processEmotionalTransitions(transitionsResult.rows),
        dominantEmotions: this.identifyDominantEmotions(timelineResult.rows)
      };
    } catch (error) {
      captureException(error, { userId, timeframe });
      throw error;
    }
  }

  // Track growth and expanding horizons
  async analyzeGrowthMetrics(userId) {
    try {
      // Get user's journey from first quiz to now
      const growthQuery = `
        WITH user_journey AS (
          SELECT 
            MIN(created_at) as journey_start,
            array_agg(DISTINCT personality_type ORDER BY created_at) as personality_evolution
          FROM quiz_results
          WHERE user_id = $1
        ),
        style_exploration AS (
          SELECT 
            DATE_TRUNC('month', vb.viewed_at) as month,
            COUNT(DISTINCT a.style) as unique_styles,
            COUNT(DISTINCT a.period) as unique_periods,
            COUNT(DISTINCT a.artist_name) as unique_artists,
            array_agg(DISTINCT a.style) as styles_explored
          FROM artwork_viewing_behavior vb
          JOIN artworks a ON vb.artwork_id = a.id
          WHERE vb.user_id = $1
          GROUP BY DATE_TRUNC('month', vb.viewed_at)
        ),
        social_evolution AS (
          SELECT 
            DATE_TRUNC('month', created_at) as month,
            COUNT(DISTINCT shared_artwork_id) as artworks_shared,
            COUNT(DISTINCT interaction_user_id) as unique_interactions
          FROM social_interactions
          WHERE user_id = $1
          GROUP BY DATE_TRUNC('month', created_at)
        )
        SELECT 
          j.journey_start,
          j.personality_evolution,
          se.month,
          se.unique_styles,
          se.unique_periods,
          se.unique_artists,
          se.styles_explored,
          COALESCE(si.artworks_shared, 0) as social_shares,
          COALESCE(si.unique_interactions, 0) as social_connections
        FROM user_journey j
        CROSS JOIN style_exploration se
        LEFT JOIN social_evolution si ON se.month = si.month
        ORDER BY se.month
      `;

      const result = await pool.query(growthQuery, [userId]);
      
      return this.processGrowthMetrics(result.rows);
    } catch (error) {
      captureException(error, { userId });
      throw error;
    }
  }

  // Helper methods
  async updateRealtimeAnalytics(userId, personalityType, data) {
    const key = `insights:realtime:${userId}`;
    const globalKey = `insights:global:${personalityType}`;
    
    // Update user-specific metrics
    await redis.hincrby(key, 'total_views', 1);
    await redis.hincrby(key, 'total_time', Math.round(data.timeSpent));
    
    // Update personality-type metrics
    await redis.hincrby(globalKey, 'total_views', 1);
    await redis.hincrby(globalKey, 'total_time', Math.round(data.timeSpent));
    
    // Set expiry
    await redis.expire(key, 86400); // 24 hours
    await redis.expire(globalKey, 86400);
  }

  processViewingPatterns(data) {
    if (!data.length) return null;

    const patterns = {
      dailyAverages: {},
      personalityComparison: {},
      engagementTrends: [],
      emotionalPatterns: {}
    };

    data.forEach(row => {
      patterns.dailyAverages[row.view_date] = {
        avgTimeSpent: parseFloat(row.avg_time_spent),
        artworksViewed: parseInt(row.artworks_viewed),
        avgScrollDepth: parseFloat(row.avg_scroll_depth),
        avgZoomLevel: parseFloat(row.avg_zoom_level)
      };

      if (row.emotional_responses) {
        row.emotional_responses.forEach(emotion => {
          patterns.emotionalPatterns[emotion] = 
            (patterns.emotionalPatterns[emotion] || 0) + 1;
        });
      }
    });

    patterns.personalityComparison = {
      userType: data[0].personality_type,
      avgTimeVsPeers: data[0].avg_time_by_personality
    };

    return patterns;
  }

  analyzeGalleryPath(artworks) {
    const path = {
      sequence: [],
      styleTransitions: {},
      dwellTimes: {},
      emotionalFlow: []
    };

    artworks.forEach((artwork, index) => {
      path.sequence.push({
        artwork: {
          id: artwork.id,
          title: artwork.title,
          artist: artwork.artist_name,
          style: artwork.style
        },
        timeSpent: artwork.time_spent,
        emotion: artwork.emotional_response,
        timestamp: artwork.viewed_at
      });

      // Track style transitions
      if (artwork.next_style) {
        const transition = `${artwork.style} → ${artwork.next_style}`;
        path.styleTransitions[transition] = 
          (path.styleTransitions[transition] || 0) + 1;
      }

      // Track dwell times by style
      path.dwellTimes[artwork.style] = 
        (path.dwellTimes[artwork.style] || 0) + artwork.time_spent;

      // Track emotional flow
      if (artwork.emotional_response) {
        path.emotionalFlow.push(artwork.emotional_response);
      }
    });

    return path;
  }

  processEmotionalTimeline(data) {
    const timeline = {};
    
    data.forEach(row => {
      if (!timeline[row.date]) {
        timeline[row.date] = {
          emotions: {},
          totalEngagement: 0,
          dominantStyles: []
        };
      }
      
      timeline[row.date].emotions[row.emotional_response] = {
        count: row.response_count,
        avgEngagement: row.avg_engagement
      };
      
      timeline[row.date].totalEngagement += 
        row.response_count * row.avg_engagement;
      
      timeline[row.date].dominantStyles = 
        [...new Set([...timeline[row.date].dominantStyles, ...row.art_styles])];
    });

    return timeline;
  }

  processEmotionalTransitions(data) {
    const transitions = {
      matrix: {},
      mostCommon: [],
      emotionalStability: 0
    };

    let totalTransitions = 0;
    let sameEmotionTransitions = 0;

    data.forEach(row => {
      if (!transitions.matrix[row.prev_emotion]) {
        transitions.matrix[row.prev_emotion] = {};
      }
      
      transitions.matrix[row.prev_emotion][row.current_emotion] = 
        row.transition_count;
      
      totalTransitions += row.transition_count;
      
      if (row.prev_emotion === row.current_emotion) {
        sameEmotionTransitions += row.transition_count;
      }
      
      transitions.mostCommon.push({
        from: row.prev_emotion,
        to: row.current_emotion,
        count: row.transition_count
      });
    });

    transitions.emotionalStability = 
      totalTransitions > 0 ? sameEmotionTransitions / totalTransitions : 0;
    
    transitions.mostCommon.sort((a, b) => b.count - a.count);
    transitions.mostCommon = transitions.mostCommon.slice(0, 5);

    return transitions;
  }

  identifyDominantEmotions(data) {
    const emotionCounts = {};
    
    data.forEach(row => {
      emotionCounts[row.emotional_response] = 
        (emotionCounts[row.emotional_response] || 0) + row.response_count;
    });

    return Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emotion, count]) => ({ emotion, count }));
  }

  processGrowthMetrics(data) {
    if (!data.length) return null;

    const growth = {
      journeyStart: data[0].journey_start,
      personalityEvolution: data[0].personality_evolution,
      monthlyProgress: [],
      expandingHorizons: {
        stylesOverTime: [],
        artistsOverTime: [],
        socialGrowth: []
      }
    };

    let cumulativeStyles = new Set();
    let cumulativeArtists = new Set();

    data.forEach(row => {
      // Add new styles to cumulative set
      if (row.styles_explored) {
        row.styles_explored.forEach(style => cumulativeStyles.add(style));
      }

      growth.monthlyProgress.push({
        month: row.month,
        uniqueStyles: row.unique_styles,
        uniquePeriods: row.unique_periods,
        uniqueArtists: row.unique_artists,
        socialShares: row.social_shares,
        socialConnections: row.social_connections,
        cumulativeStyles: cumulativeStyles.size
      });

      growth.expandingHorizons.stylesOverTime.push({
        month: row.month,
        count: cumulativeStyles.size
      });
    });

    // Identify expansion patterns
    growth.expansionPattern = this.identifyExpansionPattern(growth.monthlyProgress);

    return growth;
  }

  identifyExpansionPattern(monthlyData) {
    if (monthlyData.length < 2) return 'discovering';

    const recentMonths = monthlyData.slice(-3);
    const avgNewStyles = recentMonths.reduce((sum, m) => sum + m.uniqueStyles, 0) / 3;
    const avgSocialActivity = recentMonths.reduce((sum, m) => sum + m.socialShares, 0) / 3;

    if (avgNewStyles > 5) return 'rapidly_expanding';
    if (avgNewStyles > 2) return 'steadily_exploring';
    if (avgSocialActivity > 10) return 'socially_active';
    return 'focused_appreciation';
  }
}

// Database schema additions
const createBehavioralTables = `
  -- Artwork viewing behavior tracking
  CREATE TABLE IF NOT EXISTS artwork_viewing_behavior (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    artwork_id INTEGER REFERENCES artworks(id),
    session_id UUID,
    personality_type VARCHAR(50),
    time_spent INTEGER, -- seconds
    interactions JSONB, -- clicks, zooms, shares, etc.
    emotional_response VARCHAR(50),
    scroll_depth DECIMAL(3,2), -- 0.00 to 1.00
    zoom_level DECIMAL(3,2), -- 1.00 = normal, >1 = zoomed in
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Social interactions tracking
  CREATE TABLE IF NOT EXISTS social_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50), -- share, comment, like, follow
    interaction_user_id INTEGER REFERENCES users(id),
    shared_artwork_id INTEGER REFERENCES artworks(id),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Indexes for performance
  CREATE INDEX idx_viewing_behavior_user_date ON artwork_viewing_behavior(user_id, viewed_at);
  CREATE INDEX idx_viewing_behavior_personality ON artwork_viewing_behavior(personality_type, viewed_at);
  CREATE INDEX idx_social_interactions_user ON social_interactions(user_id, created_at);
`;

module.exports = {
  BehavioralInsightsService: new BehavioralInsightsService(),
  createBehavioralTables
};