const { pool } = require('../config/database');

class Achievement {
  static async create(achievementData) {
    const {
      id,
      name,
      description,
      category,
      requirements,
      points,
      badge_icon,
      badge_color,
      rarity,
      unlock_message
    } = achievementData;

    const result = await pool.query(
      `INSERT INTO achievements (
        id, name, description, category, requirements, points, 
        badge_icon, badge_color, rarity, unlock_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [id, name, description, category, JSON.stringify(requirements), points, 
       badge_icon, badge_color, rarity, unlock_message]
    );

    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query('SELECT * FROM achievements ORDER BY category, points');
    return result.rows.map(achievement => ({
      ...achievement,
      requirements: JSON.parse(achievement.requirements)
    }));
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM achievements WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    
    return {
      ...result.rows[0],
      requirements: JSON.parse(result.rows[0].requirements)
    };
  }

  static async findByCategory(category) {
    const result = await pool.query(
      'SELECT * FROM achievements WHERE category = $1 ORDER BY points',
      [category]
    );
    
    return result.rows.map(achievement => ({
      ...achievement,
      requirements: JSON.parse(achievement.requirements)
    }));
  }
}

class UserAchievement {
  static async create(userId, achievementId, progressData = {}) {
    const result = await pool.query(
      `INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, achievementId, JSON.stringify(progressData), new Date()]
    );

    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(`
      SELECT ua.*, a.name, a.description, a.category, a.points, 
             a.badge_icon, a.badge_color, a.rarity, a.unlock_message,
             a.requirements
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = $1
      ORDER BY ua.unlocked_at DESC
    `, [userId]);

    return result.rows.map(achievement => ({
      ...achievement,
      progress: JSON.parse(achievement.progress),
      requirements: JSON.parse(achievement.requirements)
    }));
  }

  static async updateProgress(userId, achievementId, progressData) {
    const result = await pool.query(
      `UPDATE user_achievements 
       SET progress = $3, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND achievement_id = $2
       RETURNING *`,
      [userId, achievementId, JSON.stringify(progressData)]
    );

    return result.rows[0];
  }

  static async checkAndUnlock(userId, achievementId) {
    // Check if user already has this achievement
    const existing = await pool.query(
      'SELECT * FROM user_achievements WHERE user_id = $1 AND achievement_id = $2',
      [userId, achievementId]
    );

    if (existing.rows.length > 0) {
      return null; // Already unlocked
    }

    // Create the achievement
    return await this.create(userId, achievementId);
  }

  static async getUserStats(userId) {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_achievements,
        SUM(a.points) as total_points,
        COUNT(CASE WHEN a.rarity = 'common' THEN 1 END) as common_badges,
        COUNT(CASE WHEN a.rarity = 'rare' THEN 1 END) as rare_badges,
        COUNT(CASE WHEN a.rarity = 'epic' THEN 1 END) as epic_badges,
        COUNT(CASE WHEN a.rarity = 'legendary' THEN 1 END) as legendary_badges
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = $1
    `, [userId]);

    const stats = result.rows[0];
    
    // Get recent achievements
    const recentResult = await pool.query(`
      SELECT ua.*, a.name, a.badge_icon, a.badge_color, a.rarity
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = $1
      ORDER BY ua.unlocked_at DESC
      LIMIT 5
    `, [userId]);

    return {
      ...stats,
      total_achievements: parseInt(stats.total_achievements) || 0,
      total_points: parseInt(stats.total_points) || 0,
      common_badges: parseInt(stats.common_badges) || 0,
      rare_badges: parseInt(stats.rare_badges) || 0,
      epic_badges: parseInt(stats.epic_badges) || 0,
      legendary_badges: parseInt(stats.legendary_badges) || 0,
      recent_achievements: recentResult.rows
    };
  }
}

class ProgressTracker {
  static async updateUserProgress(userId, action, metadata = {}) {
    // Get or create user progress record
    let progress = await this.getUserProgress(userId);
    
    if (!progress) {
      progress = await this.createUserProgress(userId);
    }

    // Update progress based on action
    const updates = {};
    
    switch (action) {
      case 'quiz_completed':
        updates.quizzes_completed = (progress.quizzes_completed || 0) + 1;
        break;
      case 'artwork_viewed':
        updates.artworks_viewed = (progress.artworks_viewed || 0) + 1;
        break;
      case 'artwork_liked':
        updates.artworks_liked = (progress.artworks_liked || 0) + 1;
        break;
      case 'chat_message_sent':
        updates.chat_messages = (progress.chat_messages || 0) + 1;
        break;
      case 'daily_login':
        updates.login_streak = this.calculateStreak(progress.last_login, metadata.login_date);
        updates.total_logins = (progress.total_logins || 0) + 1;
        updates.last_login = metadata.login_date;
        break;
      case 'profile_completed':
        updates.profile_completed = true;
        break;
      case 'exploration_day':
        updates.exploration_days = (progress.exploration_days || 0) + 1;
        break;
      case 'exhibition_archived':
        updates.exhibitions_archived = (progress.exhibitions_archived || 0) + 1;
        break;
      case 'artwork_documented':
        updates.artworks_documented = (progress.artworks_documented || 0) + (metadata.artwork_count || 1);
        break;
    }

    // Update the progress
    const updatedProgress = await this.updateProgress(userId, updates);
    
    // Check for new achievements
    await this.checkAchievements(userId, updatedProgress);
    
    return updatedProgress;
  }

  static async getUserProgress(userId) {
    const result = await pool.query('SELECT * FROM user_progress WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) return null;
    
    return {
      ...result.rows[0],
      metadata: JSON.parse(result.rows[0].metadata || '{}')
    };
  }

  static async createUserProgress(userId) {
    const result = await pool.query(
      `INSERT INTO user_progress (user_id) VALUES ($1) RETURNING *`,
      [userId]
    );
    
    return {
      ...result.rows[0],
      metadata: {}
    };
  }

  static async updateProgress(userId, updates) {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [userId, ...Object.values(updates)];
    
    const result = await pool.query(
      `UPDATE user_progress SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 RETURNING *`,
      values
    );

    return {
      ...result.rows[0],
      metadata: JSON.parse(result.rows[0].metadata || '{}')
    };
  }

  static calculateStreak(lastLogin, currentLogin) {
    if (!lastLogin) return 1;
    
    const last = new Date(lastLogin);
    const current = new Date(currentLogin);
    const diffDays = Math.floor((current - last) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day, increment streak
      return (lastLogin.login_streak || 0) + 1;
    } else if (diffDays === 0) {
      // Same day, maintain streak
      return lastLogin.login_streak || 1;
    } else {
      // Streak broken, reset to 1
      return 1;
    }
  }

  static async checkAchievements(userId, progress) {
    const achievements = await Achievement.findAll();
    const newUnlocks = [];

    for (const achievement of achievements) {
      const meetsRequirements = this.checkRequirements(progress, achievement.requirements);
      
      if (meetsRequirements) {
        const unlocked = await UserAchievement.checkAndUnlock(userId, achievement.id);
        if (unlocked) {
          newUnlocks.push({
            ...achievement,
            unlocked_at: unlocked.unlocked_at
          });
        }
      }
    }

    return newUnlocks;
  }

  static checkRequirements(progress, requirements) {
    for (const [key, value] of Object.entries(requirements)) {
      if (typeof value === 'number') {
        if ((progress[key] || 0) < value) return false;
      } else if (typeof value === 'boolean') {
        if (!progress[key]) return false;
      }
    }
    return true;
  }
}

module.exports = {
  Achievement,
  UserAchievement,
  ProgressTracker
};