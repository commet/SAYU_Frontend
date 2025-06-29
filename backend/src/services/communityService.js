const { pool } = require('../config/database');
const { logger } = require("../config/logger");

class CommunityService {
  // Forum management
  async getForums() {
    const query = `
      SELECT 
        f.*,
        COUNT(ft.id) as topic_count,
        MAX(ft.last_reply_at) as last_activity
      FROM forums f
      LEFT JOIN forum_topics ft ON f.id = ft.forum_id
      WHERE f.is_active = true
      GROUP BY f.id
      ORDER BY f.name
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  async createForum(data) {
    const { name, description, slug, category } = data;
    
    const query = `
      INSERT INTO forums (name, description, slug, category)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, description, slug, category]);
    return result.rows[0];
  }

  // Topic management
  async getTopics(forumId, limit = 20, offset = 0) {
    const query = `
      SELECT 
        ft.*,
        u.nickname as author_name,
        u.id as author_id,
        reply_user.nickname as last_reply_author,
        COUNT(fr.id) as reply_count_actual,
        COUNT(pl.id) as like_count
      FROM forum_topics ft
      JOIN users u ON ft.user_id = u.id
      LEFT JOIN users reply_user ON ft.last_reply_user_id = reply_user.id
      LEFT JOIN forum_replies fr ON ft.id = fr.topic_id AND fr.is_deleted = false
      LEFT JOIN post_likes pl ON ft.id = pl.topic_id
      WHERE ft.forum_id = $1
      GROUP BY ft.id, u.id, u.nickname, reply_user.nickname
      ORDER BY ft.is_pinned DESC, ft.last_reply_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [forumId, limit, offset]);
    return result.rows;
  }

  async getTopic(topicId, userId = null) {
    // Increment view count
    await pool.query(
      'UPDATE forum_topics SET view_count = view_count + 1 WHERE id = $1',
      [topicId]
    );

    const query = `
      SELECT 
        ft.*,
        u.nickname as author_name,
        u.id as author_id,
        f.name as forum_name,
        f.slug as forum_slug,
        COUNT(pl.id) as like_count,
        ${userId ? `
          CASE WHEN user_likes.id IS NOT NULL THEN true ELSE false END as user_liked
        ` : 'false as user_liked'}
      FROM forum_topics ft
      JOIN users u ON ft.user_id = u.id
      JOIN forums f ON ft.forum_id = f.id
      LEFT JOIN post_likes pl ON ft.id = pl.topic_id
      ${userId ? `
        LEFT JOIN post_likes user_likes ON ft.id = user_likes.topic_id AND user_likes.user_id = $2
      ` : ''}
      WHERE ft.id = $1
      GROUP BY ft.id, u.id, u.nickname, f.name, f.slug${userId ? ', user_likes.id' : ''}
    `;
    
    const params = userId ? [topicId, userId] : [topicId];
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  async createTopic(data) {
    const { forumId, userId, title, content } = data;
    
    const query = `
      INSERT INTO forum_topics (forum_id, user_id, title, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [forumId, userId, title, content]);
    return result.rows[0];
  }

  // Reply management
  async getReplies(topicId, limit = 50, offset = 0, userId = null) {
    const query = `
      SELECT 
        fr.*,
        u.nickname as author_name,
        u.id as author_id,
        COUNT(pl.id) as like_count,
        ${userId ? `
          CASE WHEN user_likes.id IS NOT NULL THEN true ELSE false END as user_liked
        ` : 'false as user_liked'}
      FROM forum_replies fr
      JOIN users u ON fr.user_id = u.id
      LEFT JOIN post_likes pl ON fr.id = pl.reply_id
      ${userId ? `
        LEFT JOIN post_likes user_likes ON fr.id = user_likes.reply_id AND user_likes.user_id = $4
      ` : ''}
      WHERE fr.topic_id = $1 AND fr.is_deleted = false
      GROUP BY fr.id, u.id, u.nickname${userId ? ', user_likes.id' : ''}
      ORDER BY fr.created_at ASC
      LIMIT $2 OFFSET $3
    `;
    
    const params = userId ? [topicId, limit, offset, userId] : [topicId, limit, offset];
    const result = await pool.query(query, params);
    return result.rows;
  }

  async createReply(data) {
    const { topicId, userId, content, parentReplyId = null } = data;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert reply
      const replyQuery = `
        INSERT INTO forum_replies (topic_id, user_id, content, parent_reply_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const replyResult = await client.query(replyQuery, [topicId, userId, content, parentReplyId]);
      
      // Update topic reply count and last reply info
      const updateQuery = `
        UPDATE forum_topics 
        SET 
          reply_count = reply_count + 1,
          last_reply_at = CURRENT_TIMESTAMP,
          last_reply_user_id = $2
        WHERE id = $1
      `;
      
      await client.query(updateQuery, [topicId, userId]);
      
      await client.query('COMMIT');
      return replyResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Like/Unlike system
  async toggleLike(userId, topicId = null, replyId = null) {
    if (!topicId && !replyId) {
      throw new Error('Either topicId or replyId must be provided');
    }

    const checkQuery = `
      SELECT id FROM post_likes 
      WHERE user_id = $1 AND 
      ${topicId ? 'topic_id = $2' : 'reply_id = $2'}
    `;
    
    const targetId = topicId || replyId;
    const existingLike = await pool.query(checkQuery, [userId, targetId]);
    
    if (existingLike.rows.length > 0) {
      // Unlike
      const deleteQuery = `
        DELETE FROM post_likes 
        WHERE user_id = $1 AND 
        ${topicId ? 'topic_id = $2' : 'reply_id = $2'}
      `;
      
      await pool.query(deleteQuery, [userId, targetId]);
      return { liked: false };
    } else {
      // Like
      const insertQuery = `
        INSERT INTO post_likes (user_id, ${topicId ? 'topic_id' : 'reply_id'})
        VALUES ($1, $2)
        RETURNING *
      `;
      
      await pool.query(insertQuery, [userId, targetId]);
      return { liked: true };
    }
  }

  // User following system
  async followUser(followerId, followingId) {
    if (followerId === followingId) {
      throw new Error('Users cannot follow themselves');
    }

    const query = `
      INSERT INTO user_follows (follower_id, following_id)
      VALUES ($1, $2)
      ON CONFLICT (follower_id, following_id) DO NOTHING
      RETURNING *
    `;
    
    const result = await pool.query(query, [followerId, followingId]);
    return result.rows[0];
  }

  async unfollowUser(followerId, followingId) {
    const query = `
      DELETE FROM user_follows 
      WHERE follower_id = $1 AND following_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [followerId, followingId]);
    return result.rows[0];
  }

  async getUserFollows(userId) {
    const query = `
      SELECT 
        u.id,
        u.nickname,
        u.aesthetic_journey_stage,
        uf.followed_at
      FROM user_follows uf
      JOIN users u ON uf.following_id = u.id
      WHERE uf.follower_id = $1
      ORDER BY uf.followed_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async getUserFollowers(userId) {
    const query = `
      SELECT 
        u.id,
        u.nickname,
        u.aesthetic_journey_stage,
        uf.followed_at
      FROM user_follows uf
      JOIN users u ON uf.follower_id = u.id
      WHERE uf.following_id = $1
      ORDER BY uf.followed_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Content moderation
  async reportContent(data) {
    const { reporterId, reportedUserId, topicId, replyId, reason, description } = data;
    
    const query = `
      INSERT INTO user_reports (
        reporter_id, reported_user_id, topic_id, reply_id, reason, description
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      reporterId, reportedUserId, topicId, replyId, reason, description
    ]);
    
    logger.info(`Content reported: ${reason} by user ${reporterId}`);
    return result.rows[0];
  }

  async getPendingReports() {
    const query = `
      SELECT 
        ur.*,
        reporter.nickname as reporter_name,
        reported.nickname as reported_user_name,
        ft.title as topic_title,
        fr.content as reply_content
      FROM user_reports ur
      JOIN users reporter ON ur.reporter_id = reporter.id
      LEFT JOIN users reported ON ur.reported_user_id = reported.id
      LEFT JOIN forum_topics ft ON ur.topic_id = ft.id
      LEFT JOIN forum_replies fr ON ur.reply_id = fr.id
      WHERE ur.status = 'pending'
      ORDER BY ur.created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // User badges
  async awardBadge(userId, badgeType, badgeName, description, color = 'blue') {
    const query = `
      INSERT INTO user_badges (user_id, badge_type, badge_name, description, color)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, badge_type) 
      DO UPDATE SET badge_name = $3, description = $4, color = $5
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, badgeType, badgeName, description, color]);
    return result.rows[0];
  }

  async getUserBadges(userId) {
    const query = `
      SELECT * FROM user_badges 
      WHERE user_id = $1 
      ORDER BY earned_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Community statistics
  async getCommunityStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM forums WHERE is_active = true) as total_forums,
        (SELECT COUNT(*) FROM forum_topics) as total_topics,
        (SELECT COUNT(*) FROM forum_replies WHERE is_deleted = false) as total_replies,
        (SELECT COUNT(*) FROM user_follows) as total_follows,
        (SELECT COUNT(*) FROM post_likes) as total_likes
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = new CommunityService();