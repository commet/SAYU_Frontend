const { validationResult } = require('express-validator');
const db = require('../config/database');

class ContemplativeController {
  /**
   * 감상 세션 저장
   */
  async saveViewingSession(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const userId = req.user?.id;
      const { artworkId, duration, depth, interactions, timestamp } = req.body;

      // 세션 데이터 저장
      const query = `
        INSERT INTO contemplative_sessions 
        (user_id, artwork_id, duration, depth, interactions, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      const result = await db.query(query, [
        userId || null,
        artworkId,
        duration,
        depth,
        JSON.stringify(interactions),
        timestamp
      ]);

      // 의미 있는 감상인 경우 통계 업데이트
      if (duration > 30) {
        await this.updateContemplativeStats(userId, artworkId, duration, depth);
      }

      res.json({
        success: true,
        data: {
          sessionId: result.rows[0].id,
          message: 'Viewing session saved successfully'
        }
      });

    } catch (error) {
      console.error('Error saving viewing session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save viewing session'
      });
    }
  }

  /**
   * 산책 세션 저장
   */
  async saveWalkSession(req, res) {
    try {
      const userId = req.user.id;
      const { mode, duration, artworkCount, timestamp } = req.body;

      const query = `
        INSERT INTO walk_sessions 
        (user_id, mode, duration, artwork_count, timestamp)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;

      const result = await db.query(query, [
        userId,
        mode,
        duration,
        artworkCount,
        timestamp
      ]);

      // 사용자 통계 업데이트
      await this.updateUserWalkStats(userId, mode, duration);

      res.json({
        success: true,
        data: {
          sessionId: result.rows[0].id,
          message: 'Walk session saved successfully'
        }
      });

    } catch (error) {
      console.error('Error saving walk session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save walk session'
      });
    }
  }

  /**
   * 모드별 추천 작품 가져오기
   */
  async getContemplativeArtworks(req, res) {
    try {
      const { mode } = req.query;
      const userId = req.user?.id;
      let artworks = [];

      switch (mode) {
        case 'free':
          artworks = await this.getFreeWalkArtworks();
          break;
        case 'themed':
          artworks = await this.getThemedArtworks(userId);
          break;
        case 'deep':
          artworks = await this.getDeepWalkArtworks();
          break;
        case 'memory':
          artworks = await this.getMemoryWalkArtworks(userId);
          break;
        default:
          artworks = await this.getFreeWalkArtworks();
      }

      res.json({
        success: true,
        data: {
          mode,
          artworks,
          count: artworks.length
        }
      });

    } catch (error) {
      console.error('Error fetching contemplative artworks:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch artworks'
      });
    }
  }

  /**
   * 감상 통계 조회
   */
  async getContemplativeStats(req, res) {
    try {
      const userId = req.user.id;

      const query = `
        SELECT 
          COUNT(DISTINCT artwork_id) as total_artworks,
          SUM(duration) as total_time,
          AVG(duration) as avg_time_per_artwork,
          COUNT(CASE WHEN depth = 'immerse' THEN 1 END) as deep_contemplations,
          COUNT(CASE WHEN duration > 120 THEN 1 END) as long_contemplations,
          MAX(duration) as longest_contemplation,
          DATE_TRUNC('month', timestamp) as month,
          COUNT(*) as monthly_sessions
        FROM contemplative_sessions
        WHERE user_id = $1
        GROUP BY DATE_TRUNC('month', timestamp)
        ORDER BY month DESC
        LIMIT 12
      `;

      const result = await db.query(query, [userId]);

      const stats = {
        overview: {
          totalArtworks: result.rows[0]?.total_artworks || 0,
          totalTime: result.rows[0]?.total_time || 0,
          avgTimePerArtwork: result.rows[0]?.avg_time_per_artwork || 0,
          deepContemplations: result.rows[0]?.deep_contemplations || 0,
          longContemplations: result.rows[0]?.long_contemplations || 0,
          longestContemplation: result.rows[0]?.longest_contemplation || 0
        },
        monthlyTrend: result.rows.map(row => ({
          month: row.month,
          sessions: row.monthly_sessions
        }))
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error fetching contemplative stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  }

  // Helper methods

  async updateContemplativeStats(userId, artworkId, duration, depth) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // 작품별 감상 통계 업데이트
      const updateArtworkStats = `
        INSERT INTO artwork_contemplation_stats (artwork_id, total_views, total_time, avg_depth)
        VALUES ($1, 1, $2, 
          CASE $3 
            WHEN 'glance' THEN 1
            WHEN 'observe' THEN 2
            WHEN 'contemplate' THEN 3
            WHEN 'immerse' THEN 4
          END
        )
        ON CONFLICT (artwork_id) 
        DO UPDATE SET 
          total_views = artwork_contemplation_stats.total_views + 1,
          total_time = artwork_contemplation_stats.total_time + $2,
          avg_depth = (
            artwork_contemplation_stats.avg_depth * artwork_contemplation_stats.total_views + 
            CASE $3 
              WHEN 'glance' THEN 1
              WHEN 'observe' THEN 2
              WHEN 'contemplate' THEN 3
              WHEN 'immerse' THEN 4
            END
          ) / (artwork_contemplation_stats.total_views + 1)
      `;

      await client.query(updateArtworkStats, [artworkId, duration, depth]);

      // 사용자별 감상 통계 업데이트
      if (userId) {
        const updateUserStats = `
          INSERT INTO user_contemplation_stats (user_id, total_time, deep_contemplations)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id)
          DO UPDATE SET
            total_time = user_contemplation_stats.total_time + $2,
            deep_contemplations = user_contemplation_stats.deep_contemplations + $3
        `;

        await client.query(updateUserStats, [
          userId,
          duration,
          depth === 'immerse' ? 1 : 0
        ]);
      }

      await client.query('COMMIT');

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating contemplative stats:', error);
      throw error; // 에러를 상위로 전파
    } finally {
      client.release();
    }
  }

  async updateUserWalkStats(userId, mode, duration) {
    try {
      const query = `
        INSERT INTO user_walk_stats (user_id, total_walks, total_duration, favorite_mode)
        VALUES ($1, 1, $2, $3)
        ON CONFLICT (user_id)
        DO UPDATE SET
          total_walks = user_walk_stats.total_walks + 1,
          total_duration = user_walk_stats.total_duration + $2,
          last_walk = NOW()
      `;

      await db.query(query, [userId, duration, mode]);
    } catch (error) {
      console.error('Error updating walk stats:', error);
    }
  }

  async getFreeWalkArtworks() {
    const query = `
      SELECT 
        a.*,
        acs.avg_depth
      FROM artworks a
      LEFT JOIN artwork_contemplation_stats acs ON a.id = acs.artwork_id
      WHERE a.is_public = true
      ORDER BY RANDOM()
      LIMIT 20
    `;

    const result = await db.query(query);
    return result.rows;
  }

  async getThemedArtworks(userId) {
    // 사용자의 현재 감정이나 선호도 기반
    const query = `
      SELECT a.*
      FROM artworks a
      WHERE a.emotional_tags && (
        SELECT ARRAY_AGG(DISTINCT emotion)
        FROM user_emotions
        WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '7 days'
      )
      ORDER BY RANDOM()
      LIMIT 10
    `;

    const result = await db.query(query, [userId || '00000000-0000-0000-0000-000000000000']);
    return result.rows;
  }

  async getDeepWalkArtworks() {
    // 깊은 감상에 적합한 복잡하거나 의미 있는 작품
    const query = `
      SELECT a.*
      FROM artworks a
      JOIN artwork_contemplation_stats acs ON a.id = acs.artwork_id
      WHERE acs.avg_depth > 2.5
      ORDER BY acs.avg_depth DESC
      LIMIT 5
    `;

    const result = await db.query(query);
    return result.rows;
  }

  async getMemoryWalkArtworks(userId) {
    if (!userId) return [];

    // 과거에 감상했던 작품들
    const query = `
      SELECT DISTINCT a.*
      FROM artworks a
      JOIN contemplative_sessions cs ON a.id = cs.artwork_id
      WHERE cs.user_id = $1
      AND cs.duration > 30
      ORDER BY cs.timestamp DESC
      LIMIT 8
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
  }
}

module.exports = new ContemplativeController();
