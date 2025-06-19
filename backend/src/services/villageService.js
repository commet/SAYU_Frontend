const { pool } = require('../config/database');
const logger = require('../utils/logger');

class VillageService {
  constructor() {
    // Personality type to village cluster mapping
    this.personalityToVillage = {
      // 🏛️ Contemplative Sanctuary (혼자서 깊이 사색)
      'LAEF': 'CONTEMPLATIVE',
      'LAMF': 'CONTEMPLATIVE', 
      'LREF': 'CONTEMPLATIVE',
      'LRMF': 'CONTEMPLATIVE',
      
      // 📚 Academic Forum (논리와 체계로 탐구)
      'LRMC': 'ACADEMIC',
      'LREC': 'ACADEMIC',
      'SRMC': 'ACADEMIC', 
      'SREC': 'ACADEMIC',
      
      // 🎭 Social Gallery (함께 감상하고 나눔)
      'SAEF': 'SOCIAL',
      'SAEC': 'SOCIAL',
      'SREF': 'SOCIAL',
      'SREC': 'SOCIAL',
      
      // ✨ Creative Studio (감성과 영감이 흘러넘침)
      'LAMC': 'CREATIVE',
      'LAMF': 'CREATIVE',
      'SAMC': 'CREATIVE',
      'SAMF': 'CREATIVE'
    };
  }

  // Get village cluster for personality type
  getVillageForPersonality(personalityType) {
    return this.personalityToVillage[personalityType] || 'CONTEMPLATIVE';
  }

  // Get village information
  async getVillageInfo(villageCode) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT 
            village_code,
            name,
            korean_name,
            description,
            theme,
            community_features,
            village_perks,
            member_count,
            is_active
          FROM villages
          WHERE village_code = $1
        `, [villageCode]);

        if (result.rows.length === 0) {
          return null;
        }

        const village = result.rows[0];
        
        // Get personality types in this village
        const personalityResult = await client.query(`
          SELECT 
            personality_type,
            cluster_reason,
            art_viewing_style
          FROM personality_village_mapping
          WHERE village_code = $1
        `, [villageCode]);

        village.personalities = personalityResult.rows;
        
        return village;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error getting village info:', error);
      throw error;
    }
  }

  // Get village members
  async getVillageMembers(villageCode, limit = 50) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT 
            u.id,
            u.nickname,
            u.current_identity_type,
            u.evolution_stage,
            u.evolution_points,
            up.archetype_name,
            up.generated_image_url,
            vm.joined_at,
            vm.contribution_points,
            vm.badges_earned,
            vm.role
          FROM village_memberships vm
          JOIN users u ON vm.user_id = u.id
          LEFT JOIN user_profiles up ON u.id = up.user_id
          WHERE vm.village_code = $1 
            AND vm.status = 'active'
          ORDER BY vm.contribution_points DESC, vm.joined_at ASC
          LIMIT $2
        `, [villageCode, limit]);

        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error getting village members:', error);
      throw error;
    }
  }

  // Get user's current village
  async getUserVillage(userId) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT 
            vm.village_code,
            v.name,
            v.korean_name,
            vm.joined_at,
            vm.contribution_points,
            vm.badges_earned,
            vm.role
          FROM village_memberships vm
          JOIN villages v ON vm.village_code = v.village_code
          WHERE vm.user_id = $1 AND vm.status = 'active'
        `, [userId]);

        return result.rows[0] || null;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error getting user village:', error);
      throw error;
    }
  }

  // Join village (when identity changes)
  async joinVillage(userId, personalityType) {
    try {
      const villageCode = this.getVillageForPersonality(personalityType);
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // End previous membership
        await client.query(`
          UPDATE village_memberships 
          SET status = 'alumni', left_at = NOW()
          WHERE user_id = $1 AND status = 'active'
        `, [userId]);

        // Create new membership
        await client.query(`
          INSERT INTO village_memberships (user_id, village_code, status)
          VALUES ($1, $2, 'active')
          ON CONFLICT (user_id, village_code, status) DO NOTHING
        `, [userId, villageCode]);

        // Update village member count
        await client.query(`
          UPDATE villages 
          SET member_count = (
            SELECT COUNT(*) 
            FROM village_memberships 
            WHERE village_code = $1 AND status = 'active'
          )
          WHERE village_code = $1
        `, [villageCode]);

        await client.query('COMMIT');
        
        logger.info(`User ${userId} joined village ${villageCode} with personality ${personalityType}`);
        
        return { villageCode, personalityType };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error joining village:', error);
      throw error;
    }
  }

  // Add contribution points
  async addContributionPoints(userId, points, reason) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          UPDATE village_memberships 
          SET contribution_points = contribution_points + $1
          WHERE user_id = $2 AND status = 'active'
          RETURNING village_code, contribution_points
        `, [points, userId]);

        if (result.rows.length > 0) {
          logger.info(`Added ${points} contribution points to user ${userId} for ${reason}`);
          return result.rows[0];
        }
        
        return null;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error adding contribution points:', error);
      throw error;
    }
  }

  // Get village events
  async getVillageEvents(villageCode) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT 
            id,
            event_name,
            event_type,
            description,
            start_time,
            end_time,
            max_participants,
            current_participants,
            rewards
          FROM village_events
          WHERE village_code = $1 
            AND start_time > NOW()
          ORDER BY start_time ASC
        `, [villageCode]);

        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error getting village events:', error);
      throw error;
    }
  }

  // Get village statistics
  async getVillageStats() {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT 
            v.village_code,
            v.name,
            v.korean_name,
            COUNT(vm.user_id) as member_count,
            AVG(vm.contribution_points) as avg_contribution,
            MAX(vm.contribution_points) as max_contribution
          FROM villages v
          LEFT JOIN village_memberships vm ON v.village_code = vm.village_code 
            AND vm.status = 'active'
          GROUP BY v.village_code, v.name, v.korean_name
          ORDER BY member_count DESC
        `);

        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error getting village stats:', error);
      throw error;
    }
  }

  // Award village badge
  async awardVillageBadge(userId, badgeName, reason) {
    try {
      const client = await pool.connect();
      try {
        // Get current badges
        const result = await client.query(`
          SELECT badges_earned 
          FROM village_memberships 
          WHERE user_id = $1 AND status = 'active'
        `, [userId]);

        if (result.rows.length === 0) {
          return null;
        }

        const currentBadges = result.rows[0].badges_earned || [];
        
        if (!currentBadges.includes(badgeName)) {
          const newBadges = [...currentBadges, badgeName];
          
          await client.query(`
            UPDATE village_memberships 
            SET badges_earned = $1
            WHERE user_id = $2 AND status = 'active'
          `, [newBadges, userId]);

          logger.info(`Awarded badge '${badgeName}' to user ${userId} for ${reason}`);
          return { badgeName, reason, totalBadges: newBadges.length };
        }
        
        return null;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error awarding village badge:', error);
      throw error;
    }
  }

  // Get nearby members (for card exchange)
  async getNearbyMembers(userId, villageCode, limit = 10) {
    try {
      const client = await pool.connect();
      try {
        // For now, just get random active members from the same village
        const result = await client.query(`
          SELECT 
            u.id,
            u.nickname,
            u.current_identity_type,
            u.evolution_stage,
            up.archetype_name,
            vm.contribution_points,
            vm.badges_earned,
            CASE 
              WHEN RANDOM() < 0.3 THEN 'online'
              WHEN RANDOM() < 0.7 THEN 'away'
              ELSE 'offline'
            END as status
          FROM village_memberships vm
          JOIN users u ON vm.user_id = u.id
          LEFT JOIN user_profiles up ON u.id = up.user_id
          WHERE vm.village_code = $1 
            AND vm.status = 'active'
            AND u.id != $2
          ORDER BY RANDOM()
          LIMIT $3
        `, [villageCode, userId, limit]);

        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error getting nearby members:', error);
      throw error;
    }
  }
}

module.exports = new VillageService();