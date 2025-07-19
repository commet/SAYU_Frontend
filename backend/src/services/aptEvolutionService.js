// APT Evolution Service - 진화 시스템 통합 서비스
const db = require('../config/database');
const AnimalEvolutionSystem = require('../models/animalEvolutionSystem');
const EvolutionRewardSystem = require('../models/evolutionRewardSystem');
const AnimalEvolutionVisual = require('../models/animalEvolutionVisual');
const { getRedisClient } = require('../config/redis');

class APTEvolutionService {
  constructor() {
    this.evolutionSystem = new AnimalEvolutionSystem();
    this.rewardSystem = new EvolutionRewardSystem();
    this.visualSystem = new AnimalEvolutionVisual();
  }

  // ==================== 사용자 진화 상태 조회 ====================
  
  async getUserEvolutionState(userId) {
    try {
      // 캐시 확인
      const redis = getRedisClient();
      if (redis) {
        const cached = await redis.get(`evolution:state:${userId}`);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // DB에서 사용자 프로필 조회
      const profileResult = await db.query(
        `SELECT 
          sp.*,
          es.total_evolution_points,
          es.weekly_points,
          es.monthly_points,
          es.last_point_earned_at,
          u.name as user_name
        FROM sayu_profiles sp
        JOIN users u ON sp.user_id = u.id
        LEFT JOIN evolution_statistics es ON sp.user_id = es.user_id
        WHERE sp.user_id = $1`,
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('User profile not found');
      }

      const userProfile = profileResult.rows[0];

      // 최근 행동 조회
      const recentActions = await this.getRecentActions(userId);

      // 업적 및 마일스톤 조회
      const achievements = await this.getUserAchievements(userId);

      // 진화 상태 계산
      const evolutionState = this.evolutionSystem.getAnimalState({
        aptType: userProfile.type_code,
        evolutionPoints: userProfile.evolution_points || 0,
        weeklyPoints: userProfile.weekly_points || 0,
        tasteDiversity: userProfile.taste_diversity || 0.5,
        consistencyScore: userProfile.consistency_score || 0.5,
        recentActions,
        milestones: achievements.milestones
      });

      // 시각적 데이터 추가
      const visualData = this.visualSystem.getVisualData(
        userProfile.type_code,
        evolutionState.stage,
        achievements.badges
      );

      const completeState = {
        ...evolutionState,
        visual: visualData,
        user: {
          id: userId,
          name: userProfile.user_name,
          aptType: userProfile.type_code
        },
        stats: {
          totalPoints: userProfile.evolution_points || 0,
          weeklyPoints: userProfile.weekly_points || 0,
          monthlyPoints: userProfile.monthly_points || 0,
          lastActive: userProfile.last_point_earned_at
        }
      };

      // 캐시 저장 (5분)
      if (redis) {
        await redis.setex(
          `evolution:state:${userId}`,
          300,
          JSON.stringify(completeState)
        );
      }

      return completeState;

    } catch (error) {
      console.error('Error getting evolution state:', error);
      throw error;
    }
  }

  // ==================== 행동 기록 및 포인트 계산 ====================
  
  async recordAction(userId, action, context = {}) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // 사용자 프로필 조회
      const profileResult = await client.query(
        'SELECT type_code, evolution_points, evolution_stage FROM sayu_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('User profile not found');
      }

      const profile = profileResult.rows[0];
      const currentPoints = profile.evolution_points || 0;
      const currentStage = profile.evolution_stage || 1;

      // 포인트 계산
      const points = this.rewardSystem.calculatePoints(action, {
        ...context,
        aptType: profile.type_code
      });

      // 행동 로그 기록
      await client.query(
        `INSERT INTO user_action_logs 
        (user_id, action_type, action_target_id, action_target_type, 
         points_earned, bonus_multiplier, bonus_reason)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          action,
          context.targetId || null,
          context.targetType || null,
          points,
          context.multiplier || 1.0,
          context.bonusReason || null
        ]
      );

      // 포인트 업데이트
      const newTotalPoints = currentPoints + points;
      await client.query(
        `UPDATE sayu_profiles 
        SET evolution_points = $2
        WHERE user_id = $1`,
        [userId, newTotalPoints]
      );

      // 통계 업데이트
      await this.updateStatistics(client, userId, points);

      // 진화 단계 체크
      const newStage = this.evolutionSystem.getEvolutionStage(newTotalPoints);
      let evolved = false;

      if (newStage > currentStage) {
        evolved = true;
        await this.processEvolution(client, userId, currentStage, newStage, newTotalPoints);
      }

      // 마일스톤 체크
      const userStats = await this.getUserStats(client, userId);
      const achievedMilestones = await this.rewardSystem.checkMilestones(userId, userStats);

      // 마일스톤 보상 지급
      for (const milestone of achievedMilestones) {
        await this.processMilestone(client, userId, milestone);
      }

      await client.query('COMMIT');

      // 캐시 무효화
      const redis = getRedisClient();
      if (redis) {
        await redis.del(`evolution:state:${userId}`);
      }

      return {
        success: true,
        pointsEarned: points,
        totalPoints: newTotalPoints,
        evolved,
        newStage: evolved ? newStage : currentStage,
        achievedMilestones: achievedMilestones.map(m => ({
          id: m.id,
          name: m.name,
          rewards: m.rewards
        }))
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error recording action:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== 진화 처리 ====================
  
  async processEvolution(client, userId, fromStage, toStage, totalPoints) {
    // 진화 이력 기록
    await client.query(
      `INSERT INTO evolution_history 
      (user_id, from_stage, to_stage, total_points_at_evolution)
      VALUES ($1, $2, $3, $4)`,
      [userId, fromStage, toStage, totalPoints]
    );

    // 프로필 업데이트
    await client.query(
      `UPDATE sayu_profiles 
      SET evolution_stage = $2, last_evolution_at = NOW()
      WHERE user_id = $1`,
      [userId, toStage]
    );

    // 진화 마일스톤 달성
    await client.query(
      `INSERT INTO milestone_achievements 
      (user_id, milestone_id, points_earned)
      VALUES ($1, 'evolution_milestone', 150)
      ON CONFLICT (user_id, milestone_id) DO NOTHING`,
      [userId]
    );
  }

  // ==================== 마일스톤 처리 ====================
  
  async processMilestone(client, userId, milestone) {
    // 마일스톤 달성 기록
    await client.query(
      `INSERT INTO milestone_achievements 
      (user_id, milestone_id, points_earned)
      VALUES ($1, $2, $3)`,
      [userId, milestone.id, milestone.rewards.bonusPoints || 0]
    );

    // 보상 지급
    await this.rewardSystem.grantRewards(userId, milestone.rewards);
  }

  // ==================== 통계 업데이트 ====================
  
  async updateStatistics(client, userId, points) {
    await client.query(
      `INSERT INTO evolution_statistics 
      (user_id, total_evolution_points, weekly_points, monthly_points, last_point_earned_at)
      VALUES ($1, $2, $2, $2, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        total_evolution_points = evolution_statistics.total_evolution_points + $2,
        weekly_points = evolution_statistics.weekly_points + $2,
        monthly_points = evolution_statistics.monthly_points + $2,
        last_point_earned_at = NOW()`,
      [userId, points]
    );
  }

  // ==================== 일일 방문 체크 ====================
  
  async checkDailyVisit(userId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const today = new Date().toISOString().split('T')[0];

      // 오늘 방문 기록 확인
      const visitResult = await client.query(
        'SELECT * FROM daily_visits WHERE user_id = $1 AND visit_date = $2',
        [userId, today]
      );

      if (visitResult.rows.length > 0) {
        await client.query('COMMIT');
        return { alreadyVisited: true };
      }

      // 연속 방문 확인
      const streakResult = await client.query(
        `SELECT COUNT(*) as streak_days
        FROM daily_visits
        WHERE user_id = $1
          AND visit_date >= CURRENT_DATE - INTERVAL '7 days'
          AND is_streak_day = true
        ORDER BY visit_date DESC`,
        [userId]
      );

      const currentStreak = parseInt(streakResult.rows[0].streak_days) + 1;

      // 일일 보상 계산
      const dailyReward = this.rewardSystem.getDailyReward(currentStreak);

      // 방문 기록
      await client.query(
        `INSERT INTO daily_visits (user_id, visit_date, points_earned)
        VALUES ($1, $2, $3)`,
        [userId, today, dailyReward.points]
      );

      // 포인트 지급
      await this.recordAction(userId, 'daily_visit', {
        bonusReason: 'daily_reward',
        weekStreak: currentStreak === 7 ? 7 : null
      });

      await client.query('COMMIT');

      return {
        success: true,
        streak: currentStreak,
        reward: dailyReward,
        perfectWeek: currentStreak === 7
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error checking daily visit:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== 리더보드 ====================
  
  async getLeaderboard(aptType = null, period = 'weekly') {
    try {
      // 캐시 확인
      const redis = getRedisClient();
      const cacheKey = `leaderboard:${period}:${aptType || 'all'}`;
      
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // 리더보드 조회
      const leaderboard = await this.rewardSystem.getLeaderboard(aptType, period);

      // 캐시 저장 (1시간)
      if (redis) {
        await redis.setex(cacheKey, 3600, JSON.stringify(leaderboard));
      }

      return leaderboard;

    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // ==================== 헬퍼 메서드 ====================
  
  async getRecentActions(userId, limit = 10) {
    const result = await db.query(
      `SELECT action_type as type, created_at as timestamp
      FROM user_action_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  async getUserAchievements(userId) {
    const milestonesResult = await db.query(
      'SELECT milestone_id FROM milestone_achievements WHERE user_id = $1',
      [userId]
    );

    const badgesResult = await db.query(
      'SELECT badge_icon FROM user_badges WHERE user_id = $1',
      [userId]
    );

    return {
      milestones: milestonesResult.rows.map(r => r.milestone_id),
      badges: badgesResult.rows.map(r => r.badge_icon)
    };
  }

  async getUserStats(client, userId) {
    const result = await client.query(
      `SELECT 
        sp.evolution_points as totalPoints,
        sp.evolution_stage as evolutionStage,
        es.weekly_points as currentStreak,
        COUNT(DISTINCT ual.action_type) as actionCounts
      FROM sayu_profiles sp
      LEFT JOIN evolution_statistics es ON sp.user_id = es.user_id
      LEFT JOIN user_action_logs ual ON sp.user_id = ual.user_id
      WHERE sp.user_id = $1
      GROUP BY sp.evolution_points, sp.evolution_stage, es.weekly_points`,
      [userId]
    );

    return result.rows[0] || {};
  }
}

module.exports = new APTEvolutionService();