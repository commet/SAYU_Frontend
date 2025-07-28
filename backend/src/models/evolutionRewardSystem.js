// Evolution Reward System - 진화 보상 및 마일스톤 체계
const { SAYU_TYPES } = require('@sayu/shared');

class EvolutionRewardSystem {
  constructor() {
    // 마일스톤 정의 (진화 여정의 특별한 순간들)
    this.milestones = {
      // === 초기 단계 마일스톤 ===
      'first_step': {
        id: 'first_step',
        name: '첫 발걸음',
        description: '예술 여정을 시작했어요',
        requiredPoints: 10,
        rewards: {
          badge: '🌱',
          title: '초보 감상가',
          bonusPoints: 5,
          unlocks: ['basic_frame']
        },
        celebration: {
          message: '환영합니다! 예술의 세계로 첫 발을 내디뎠네요.',
          effect: 'confetti_small'
        }
      },

      'first_like': {
        id: 'first_like',
        name: '첫 좋아요',
        description: '마음에 드는 작품을 발견했어요',
        requiredAction: 'artwork_like',
        requiredCount: 1,
        rewards: {
          badge: '❤️',
          bonusPoints: 10,
          animalReaction: 'happy_jump'
        }
      },

      'week_streak': {
        id: 'week_streak',
        name: '일주일 연속 방문',
        description: '7일 연속으로 예술과 함께했어요',
        requiredStreak: 7,
        rewards: {
          badge: '🔥',
          title: '꾸준한 탐험가',
          bonusPoints: 50,
          specialEffect: 'flame_aura'
        }
      },

      // === 성장 단계 마일스톤 ===
      'taste_explorer': {
        id: 'taste_explorer',
        name: '취향 탐험가',
        description: '다양한 스타일의 작품을 감상했어요',
        requiredDiversity: 5, // 5개 이상의 다른 장르
        rewards: {
          badge: '🧭',
          title: '열린 마음',
          bonusPoints: 30,
          unlocks: ['style_analyzer']
        }
      },

      'exhibition_visitor': {
        id: 'exhibition_visitor',
        name: '전시 관람객',
        description: '첫 전시를 완주했어요',
        requiredAction: 'exhibition_complete',
        requiredCount: 1,
        rewards: {
          badge: '🎭',
          title: '문화인',
          bonusPoints: 40,
          animalAccessory: 'culture_glasses'
        }
      },

      'social_butterfly': {
        id: 'social_butterfly',
        name: '예술 친구',
        description: '다른 APT 유형과 교류했어요',
        requiredAction: 'follow_user',
        requiredCount: 5,
        rewards: {
          badge: '🦋',
          title: '소셜 큐레이터',
          bonusPoints: 25,
          unlocks: ['friend_recommendations']
        }
      },

      // === 심화 단계 마일스톤 ===
      'hundred_artworks': {
        id: 'hundred_artworks',
        name: '백 작품의 벗',
        description: '100개의 작품과 만났어요',
        requiredAction: 'artwork_view',
        requiredCount: 100,
        rewards: {
          badge: '💯',
          title: '진지한 감상가',
          bonusPoints: 100,
          animalEvolution: 'size_boost',
          specialFrame: 'golden_frame'
        }
      },

      'style_master': {
        id: 'style_master',
        name: '스타일 마스터',
        description: '특정 스타일의 전문가가 되었어요',
        requiredExpertise: { style: 'any', level: 50 },
        rewards: {
          badge: '🎨',
          title: '[스타일] 전문가', // 동적으로 변경
          bonusPoints: 75,
          unlocks: ['expert_insights']
        }
      },

      'evolution_milestone': {
        id: 'evolution_milestone',
        name: '진화의 순간',
        description: '동물이 다음 단계로 진화했어요',
        requiredEvolution: true,
        rewards: {
          badge: '🌟',
          bonusPoints: 150,
          celebration: {
            message: '축하합니다! 당신의 예술 감각이 한 단계 성장했어요!',
            effect: 'evolution_burst'
          }
        }
      },

      // === 최고 단계 마일스톤 ===
      'thousand_journey': {
        id: 'thousand_journey',
        name: '천 개의 여정',
        description: '1000개의 작품을 감상했어요',
        requiredAction: 'artwork_view',
        requiredCount: 1000,
        rewards: {
          badge: '🏆',
          title: '예술의 현자',
          bonusPoints: 500,
          animalCrown: 'master_crown',
          specialAbility: 'curator_mode'
        }
      },

      'community_leader': {
        id: 'community_leader',
        name: '커뮤니티 리더',
        description: '많은 사람들에게 영감을 주었어요',
        requiredFollowers: 50,
        rewards: {
          badge: '👑',
          title: '영향력 있는 큐레이터',
          bonusPoints: 300,
          unlocks: ['leader_features']
        }
      },

      'perfect_evolution': {
        id: 'perfect_evolution',
        name: '완벽한 진화',
        description: '최고 단계에 도달했어요',
        requiredStage: 5,
        rewards: {
          badge: '✨',
          title: 'APT 마스터',
          bonusPoints: 1000,
          animalEffect: 'radiant_aura',
          permanentBonus: 'double_points'
        }
      }
    };

    // 일일 보상 시스템
    this.dailyRewards = {
      1: { points: 10, item: null },
      2: { points: 15, item: null },
      3: { points: 20, item: 'random_frame' },
      4: { points: 25, item: null },
      5: { points: 30, item: null },
      6: { points: 40, item: null },
      7: { points: 50, item: 'special_effect', bonus: 'week_complete' }
    };

    // 행동별 기본 포인트
    this.actionPoints = {
      'artwork_view': 1,
      'artwork_like': 5,
      'artwork_save': 8,
      'artwork_share': 10,
      'exhibition_visit': 15,
      'exhibition_complete': 30,
      'quiz_complete': 20,
      'quiz_retake': 10,
      'follow_user': 5,
      'create_collection': 25,
      'write_review': 15
    };

    // 특별 보너스 조건
    this.bonusConditions = {
      'style_expansion': {
        description: '평소와 다른 스타일 탐험',
        multiplier: 1.5
      },
      'new_artist': {
        description: '새로운 작가 발견',
        multiplier: 1.2
      },
      'deep_engagement': {
        description: '작품에 오래 머물기 (30초+)',
        multiplier: 1.3
      },
      'social_sharing': {
        description: '친구와 함께 감상',
        multiplier: 1.4
      },
      'perfect_week': {
        description: '일주일 개근',
        multiplier: 2.0
      }
    };
  }

  // ==================== 마일스톤 체크 ====================
  
  async checkMilestones(userId, userStats) {
    const achievedMilestones = [];
    const userMilestones = userStats.unlockedMilestones || [];

    for (const [key, milestone] of Object.entries(this.milestones)) {
      // 이미 달성한 마일스톤은 스킵
      if (userMilestones.includes(key)) continue;

      // 달성 조건 체크
      if (this.isMilestoneAchieved(milestone, userStats)) {
        achievedMilestones.push({
          ...milestone,
          achievedAt: new Date()
        });
      }
    }

    return achievedMilestones;
  }

  isMilestoneAchieved(milestone, userStats) {
    // 포인트 기반
    if (milestone.requiredPoints && userStats.totalPoints >= milestone.requiredPoints) {
      return true;
    }

    // 액션 카운트 기반
    if (milestone.requiredAction && milestone.requiredCount) {
      const actionCount = userStats.actionCounts?.[milestone.requiredAction] || 0;
      if (actionCount >= milestone.requiredCount) {
        return true;
      }
    }

    // 연속 기록 기반
    if (milestone.requiredStreak && userStats.currentStreak >= milestone.requiredStreak) {
      return true;
    }

    // 다양성 기반
    if (milestone.requiredDiversity) {
      const uniqueStyles = new Set(userStats.viewedStyles || []);
      if (uniqueStyles.size >= milestone.requiredDiversity) {
        return true;
      }
    }

    // 진화 단계 기반
    if (milestone.requiredStage && userStats.evolutionStage >= milestone.requiredStage) {
      return true;
    }

    return false;
  }

  // ==================== 포인트 계산 ====================
  
  calculatePoints(action, context = {}) {
    let basePoints = this.actionPoints[action] || 0;
    let totalMultiplier = 1.0;

    // 보너스 조건 체크
    for (const [condition, bonus] of Object.entries(this.bonusConditions)) {
      if (this.checkBonusCondition(condition, context)) {
        totalMultiplier *= bonus.multiplier;
      }
    }

    // APT 특성에 따른 보너스
    const aptBonus = this.getAPTBonus(action, context.aptType);
    totalMultiplier *= aptBonus;

    // 시간대별 보너스 (아침/저녁 감상 장려)
    const timeBonus = this.getTimeBonus();
    totalMultiplier *= timeBonus;

    return Math.round(basePoints * totalMultiplier);
  }

  checkBonusCondition(condition, context) {
    switch (condition) {
      case 'style_expansion':
        return context.isNewStyle === true;
      case 'new_artist':
        return context.isNewArtist === true;
      case 'deep_engagement':
        return context.duration >= 30;
      case 'social_sharing':
        return context.sharedWith !== undefined;
      case 'perfect_week':
        return context.weekStreak === 7;
      default:
        return false;
    }
  }

  getAPTBonus(action, aptType) {
    if (!aptType) return 1.0;

    // APT 특성에 맞는 행동에 보너스
    const bonuses = {
      'L': { // 혼자 감상 선호
        'artwork_view': 1.2,
        'artwork_save': 1.3
      },
      'S': { // 함께 감상 선호
        'artwork_share': 1.3,
        'follow_user': 1.2,
        'write_review': 1.2
      },
      'A': { // 추상 선호
        'artwork_like': 1.1 // 추상 작품일 때 추가 체크 필요
      },
      'R': { // 구상 선호
        'artwork_like': 1.1 // 구상 작품일 때 추가 체크 필요
      }
    };

    const typeBonus = bonuses[aptType[0]]?.[action] || 1.0;
    return typeBonus;
  }

  getTimeBonus() {
    const hour = new Date().getHours();
    
    // 아침 (6-9시) 또는 저녁 (18-21시) 감상 보너스
    if ((hour >= 6 && hour <= 9) || (hour >= 18 && hour <= 21)) {
      return 1.1;
    }
    
    return 1.0;
  }

  // ==================== 일일 보상 ====================
  
  getDailyReward(dayCount) {
    const day = (dayCount % 7) || 7; // 1-7 순환
    return this.dailyRewards[day];
  }

  calculateWeeklyBonus(weekStreak) {
    if (weekStreak === 0) return 0;
    
    // 주차별 누적 보너스
    const baseBonus = 100;
    const streakMultiplier = Math.min(weekStreak, 10); // 최대 10주
    
    return baseBonus * streakMultiplier;
  }

  // ==================== 보상 지급 ====================
  
  async grantRewards(userId, rewards) {
    const grantedItems = [];

    // 포인트 지급
    if (rewards.bonusPoints) {
      await this.addPoints(userId, rewards.bonusPoints);
      grantedItems.push({
        type: 'points',
        value: rewards.bonusPoints
      });
    }

    // 뱃지 지급
    if (rewards.badge) {
      await this.grantBadge(userId, rewards.badge);
      grantedItems.push({
        type: 'badge',
        value: rewards.badge
      });
    }

    // 칭호 지급
    if (rewards.title) {
      await this.grantTitle(userId, rewards.title);
      grantedItems.push({
        type: 'title',
        value: rewards.title
      });
    }

    // 언락 기능
    if (rewards.unlocks) {
      for (const unlock of rewards.unlocks) {
        await this.unlockFeature(userId, unlock);
        grantedItems.push({
          type: 'unlock',
          value: unlock
        });
      }
    }

    // 동물 관련 보상
    if (rewards.animalReaction || rewards.animalAccessory || rewards.animalEffect) {
      await this.applyAnimalReward(userId, rewards);
      grantedItems.push({
        type: 'animal_upgrade',
        value: rewards.animalReaction || rewards.animalAccessory || rewards.animalEffect
      });
    }

    return grantedItems;
  }

  // ==================== 데이터베이스 연동 ====================
  
  async addPoints(userId, points) {
    const db = require('../config/database');
    
    await db.query(
      `UPDATE sayu_profiles 
       SET evolution_points = evolution_points + $2
       WHERE user_id = $1`,
      [userId, points]
    );
    
    // 통계 업데이트
    await db.query(
      `UPDATE evolution_statistics 
       SET total_evolution_points = total_evolution_points + $2,
           weekly_points = weekly_points + $2,
           monthly_points = monthly_points + $2
       WHERE user_id = $1`,
      [userId, points]
    );
  }

  async grantBadge(userId, badge) {
    const db = require('../config/database');
    
    await db.query(
      `INSERT INTO user_badges (user_id, badge_icon, badge_type, granted_at)
       VALUES ($1, $2, 'milestone', NOW())
       ON CONFLICT (user_id, badge_icon) DO NOTHING`,
      [userId, badge]
    );
  }

  async grantTitle(userId, title) {
    const db = require('../config/database');
    
    await db.query(
      `INSERT INTO user_titles (user_id, title, granted_at, is_active)
       VALUES ($1, $2, NOW(), false)
       ON CONFLICT (user_id, title) DO NOTHING`,
      [userId, title]
    );
  }

  async unlockFeature(userId, feature) {
    const db = require('../config/database');
    
    await db.query(
      `INSERT INTO user_unlocks (user_id, feature_key, unlocked_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, feature_key) DO NOTHING`,
      [userId, feature]
    );
  }

  async applyAnimalReward(userId, rewards) {
    const db = require('../config/database');
    
    const updates = [];
    const values = [userId];
    let paramIndex = 2;

    if (rewards.animalAccessory) {
      updates.push(`animal_accessories = array_append(animal_accessories, $${paramIndex})`);
      values.push(rewards.animalAccessory);
      paramIndex++;
    }

    if (rewards.animalEffect) {
      updates.push(`animal_effects = array_append(animal_effects, $${paramIndex})`);
      values.push(rewards.animalEffect);
      paramIndex++;
    }

    if (updates.length > 0) {
      await db.query(
        `UPDATE sayu_profiles 
         SET ${updates.join(', ')}
         WHERE user_id = $1`,
        values
      );
    }
  }

  // ==================== 리더보드 ====================
  
  async getLeaderboard(aptType, period = 'weekly') {
    const db = require('../config/database');
    
    const periodColumn = period === 'weekly' ? 'weekly_points' : 'monthly_points';
    
    const result = await db.query(
      `SELECT 
        u.id,
        u.name,
        sp.type_code as apt_type,
        sp.evolution_stage,
        es.${periodColumn} as points,
        COUNT(DISTINCT ub.badge_icon) as badge_count
       FROM users u
       JOIN sayu_profiles sp ON u.id = sp.user_id
       JOIN evolution_statistics es ON u.id = es.user_id
       LEFT JOIN user_badges ub ON u.id = ub.user_id
       WHERE ($1::VARCHAR IS NULL OR sp.type_code = $1)
       GROUP BY u.id, u.name, sp.type_code, sp.evolution_stage, es.${periodColumn}
       ORDER BY es.${periodColumn} DESC
       LIMIT 100`,
      [aptType]
    );
    
    return result.rows.map((row, index) => ({
      rank: index + 1,
      userId: row.id,
      name: row.name,
      aptType: row.apt_type,
      evolutionStage: row.evolution_stage,
      points: row.points,
      badges: row.badge_count
    }));
  }
}

module.exports = EvolutionRewardSystem;