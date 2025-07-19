// APT Evolution System - 사용자의 예술 취향이 진화하는 시스템
const { SAYU_TYPES } = require('../../../shared/SAYUTypeDefinitions');
const aptDataAccess = require('./aptDataAccess');
const APTVectorSystem = require('./aptVectorSystem');

class APTEvolutionSystem {
  constructor() {
    this.vectorSystem = new APTVectorSystem();
    
    // 진화 설정
    this.evolutionConfig = {
      // 진화 속도 (낮을수록 천천히 변화)
      baseEvolutionRate: 0.02,
      
      // 행동별 가중치
      actionWeights: {
        artwork_view: 0.1,      // 작품 조회
        artwork_like: 1.0,      // 좋아요
        artwork_save: 1.5,      // 저장/북마크
        artwork_share: 1.2,     // 공유
        exhibition_visit: 2.0,  // 전시 방문
        exhibition_complete: 3.0, // 전시 완주
        quiz_retake: 5.0,       // 퀴즈 재응시
        follow_user: 0.5,       // 다른 사용자 팔로우
        artwork_dislike: -0.8,  // 싫어요/스킵
      },
      
      // 진화 단계별 설정
      stages: {
        1: { name: '새싹', requiredPoints: 0, evolutionRate: 1.2 },
        2: { name: '성장', requiredPoints: 100, evolutionRate: 1.0 },
        3: { name: '개화', requiredPoints: 500, evolutionRate: 0.8 },
        4: { name: '만개', requiredPoints: 1500, evolutionRate: 0.6 },
        5: { name: '결실', requiredPoints: 3000, evolutionRate: 0.4 }
      },
      
      // 진화 이정표 (특별한 순간)
      milestones: {
        first_evolution: { points: 50, reward: 'evolution_badge_1' },
        taste_expansion: { points: 200, reward: 'diverse_taste_badge' },
        art_connoisseur: { points: 1000, reward: 'connoisseur_badge' },
        taste_master: { points: 5000, reward: 'master_badge' }
      }
    };
    
    // APT 간 친화도 매트릭스 (같은 축을 공유하면 친화도 높음)
    this.affinityMatrix = this.buildAffinityMatrix();
  }

  // ==================== 진화 추적 ====================
  
  async trackUserAction(userId, action) {
    try {
      // 사용자 프로필 조회
      const userProfile = await aptDataAccess.getUserProfile(userId);
      if (!userProfile) return null;
      
      // 진화 포인트 계산
      const evolutionPoints = this.calculateEvolutionPoints(action);
      
      // 진화 이력 저장
      const evolution = await this.saveEvolutionHistory(userId, {
        action,
        points: evolutionPoints,
        previousVector: userProfile.vectors?.current,
        timestamp: new Date()
      });
      
      // 벡터 업데이트가 필요한 경우
      if (this.shouldUpdateVector(userProfile, evolutionPoints)) {
        await this.evolveUserVector(userId, userProfile, [action]);
      }
      
      // 진화 단계 확인 및 업데이트
      const newStage = await this.checkEvolutionStage(userId, userProfile);
      
      // 마일스톤 달성 확인
      const achievements = await this.checkMilestones(userId, userProfile);
      
      return {
        success: true,
        evolutionPoints,
        currentStage: newStage,
        achievements,
        totalPoints: userProfile.evolutionPoints + evolutionPoints
      };
      
    } catch (error) {
      console.error('Error tracking user action:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== 진화 계산 ====================
  
  calculateEvolutionPoints(action) {
    const baseWeight = this.evolutionConfig.actionWeights[action.type] || 0;
    let multiplier = 1.0;
    
    // 특별한 상황에 대한 보너스
    if (action.type === 'artwork_like') {
      // 평소와 다른 스타일을 좋아했다면 보너스
      if (action.isStyleExpansion) multiplier *= 1.5;
      
      // 처음 보는 작가라면 보너스
      if (action.isNewArtist) multiplier *= 1.2;
    }
    
    if (action.type === 'exhibition_visit') {
      // 전시 체류 시간에 따른 보너스
      if (action.duration > 30) multiplier *= 1.3;
      if (action.duration > 60) multiplier *= 1.5;
      
      // 작품 상호작용 수에 따른 보너스
      if (action.interactionCount > 10) multiplier *= 1.2;
    }
    
    return Math.round(baseWeight * multiplier * 10); // 10을 곱해서 정수로
  }

  shouldUpdateVector(userProfile, newPoints) {
    // 일정 포인트 이상 쌓였을 때만 벡터 업데이트
    const totalPoints = (userProfile.evolutionPoints || 0) + newPoints;
    const lastUpdate = userProfile.lastVectorUpdate || new Date(0);
    const hoursSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60);
    
    // 50포인트마다 또는 24시간마다 업데이트
    return (totalPoints % 50 < newPoints) || hoursSinceUpdate > 24;
  }

  // ==================== 벡터 진화 ====================
  
  async evolveUserVector(userId, userProfile, recentActions) {
    try {
      // 현재 벡터 가져오기
      const currentVector = userProfile.vectors?.current || 
                          await this.vectorSystem.prototypeVectors[userProfile.aptType];
      
      // 진화 단계에 따른 진화율 조정
      const stage = this.getEvolutionStage(userProfile.evolutionPoints || 0);
      const stageConfig = this.evolutionConfig.stages[stage];
      const adjustedRate = this.evolutionConfig.baseEvolutionRate * stageConfig.evolutionRate;
      
      // 행동 기반 벡터 진화
      let evolvedVector = [...currentVector];
      
      for (const action of recentActions) {
        if (action.type === 'artwork_like' && action.artwork) {
          // 좋아한 작품 방향으로 이동
          const artworkVector = await this.vectorSystem.createArtworkVector(action.artwork);
          evolvedVector = this.blendVectors(evolvedVector, artworkVector, adjustedRate);
          
        } else if (action.type === 'artwork_dislike' && action.artwork) {
          // 싫어한 작품과 반대 방향으로 이동
          const artworkVector = await this.vectorSystem.createArtworkVector(action.artwork);
          evolvedVector = this.blendVectors(evolvedVector, artworkVector, -adjustedRate * 0.5);
          
        } else if (action.type === 'follow_user' && action.followedUserAPT) {
          // 팔로우한 사용자의 APT 방향으로 약간 이동
          const followedVector = this.vectorSystem.prototypeVectors[action.followedUserAPT];
          if (followedVector) {
            evolvedVector = this.blendVectors(evolvedVector, followedVector, adjustedRate * 0.3);
          }
        }
      }
      
      // APT 정체성 유지를 위한 제약
      evolvedVector = await this.constrainToAPT(evolvedVector, userProfile.aptType);
      
      // 벡터 저장
      await this.saveEvolvedVector(userId, evolvedVector);
      
      // 진화 인사이트 생성
      const insights = await this.generateEvolutionInsights(
        currentVector, 
        evolvedVector, 
        userProfile.aptType
      );
      
      return {
        success: true,
        newVector: evolvedVector,
        insights
      };
      
    } catch (error) {
      console.error('Error evolving user vector:', error);
      return { success: false, error: error.message };
    }
  }

  blendVectors(vector1, vector2, weight) {
    // weight가 양수면 vector2 방향으로, 음수면 반대 방향으로
    const blended = [];
    for (let i = 0; i < vector1.length; i++) {
      blended[i] = vector1[i] * (1 - Math.abs(weight)) + vector2[i] * weight;
    }
    return this.vectorSystem.normalizeVector(blended);
  }

  async constrainToAPT(evolvedVector, aptType) {
    // 원래 APT 프로토타입과의 유사도 확인
    const prototypeVector = this.vectorSystem.prototypeVectors[aptType];
    const similarity = this.vectorSystem.calculateSimilarity(evolvedVector, prototypeVector);
    
    // 유사도가 너무 낮으면 프로토타입 방향으로 당기기
    const minSimilarity = 0.65; // 최소 65% 유사도 유지
    
    if (similarity < minSimilarity) {
      // 프로토타입과 블렌딩하여 정체성 유지
      const pullStrength = 0.3; // 30% 정도 당기기
      return this.blendVectors(evolvedVector, prototypeVector, pullStrength);
    }
    
    return evolvedVector;
  }

  // ==================== 진화 단계 ====================
  
  getEvolutionStage(evolutionPoints) {
    let stage = 1;
    for (const [level, config] of Object.entries(this.evolutionConfig.stages)) {
      if (evolutionPoints >= config.requiredPoints) {
        stage = parseInt(level);
      }
    }
    return stage;
  }

  async checkEvolutionStage(userId, userProfile) {
    const currentPoints = userProfile.evolutionPoints || 0;
    const currentStage = this.getEvolutionStage(currentPoints);
    const previousStage = userProfile.evolutionStage || 1;
    
    if (currentStage > previousStage) {
      // 단계 상승!
      await this.updateUserStage(userId, currentStage);
      await this.triggerStageUpEvent(userId, currentStage);
      
      return {
        stageUp: true,
        newStage: currentStage,
        stageName: this.evolutionConfig.stages[currentStage].name
      };
    }
    
    return {
      stageUp: false,
      currentStage,
      stageName: this.evolutionConfig.stages[currentStage].name
    };
  }

  // ==================== 진화 인사이트 ====================
  
  async generateEvolutionInsights(oldVector, newVector, aptType) {
    const insights = {
      changes: [],
      recommendations: [],
      growthAreas: []
    };
    
    // 벡터 변화 분석
    const deltaVector = oldVector.map((v, i) => newVector[i] - v);
    const changeMagnitude = Math.sqrt(deltaVector.reduce((sum, d) => sum + d * d, 0));
    
    if (changeMagnitude > 0.1) {
      insights.changes.push('취향이 확장되고 있어요! 새로운 스타일에 마음을 열고 계시네요.');
    } else if (changeMagnitude > 0.05) {
      insights.changes.push('조금씩 취향이 진화하고 있어요. 꾸준한 탐험이 돋보입니다.');
    }
    
    // APT별 성장 영역 제안
    const typeData = SAYU_TYPES[aptType];
    if (aptType[0] === 'L') {
      insights.growthAreas.push('가끔은 친구와 함께 전시를 관람해보는 것도 좋을 거예요.');
    }
    if (aptType[1] === 'A') {
      insights.growthAreas.push('구상 작품도 한번 들여다보면 새로운 매력을 발견할 수 있어요.');
    }
    
    // 다음 단계 추천
    const currentStage = this.getEvolutionStage(0); // TODO: 실제 포인트 전달
    const nextStage = currentStage + 1;
    if (this.evolutionConfig.stages[nextStage]) {
      const pointsNeeded = this.evolutionConfig.stages[nextStage].requiredPoints;
      insights.recommendations.push(
        `다음 단계인 '${this.evolutionConfig.stages[nextStage].name}'까지 ${pointsNeeded}포인트 남았어요!`
      );
    }
    
    return insights;
  }

  // ==================== 마일스톤 ====================
  
  async checkMilestones(userId, userProfile) {
    const achievements = [];
    const currentPoints = userProfile.evolutionPoints || 0;
    const unlockedMilestones = userProfile.milestones || [];
    
    for (const [key, milestone] of Object.entries(this.evolutionConfig.milestones)) {
      if (currentPoints >= milestone.points && !unlockedMilestones.includes(key)) {
        // 새로운 마일스톤 달성!
        achievements.push({
          id: key,
          name: this.getMilestoneName(key),
          reward: milestone.reward,
          unlockedAt: new Date()
        });
        
        await this.saveMilestoneAchievement(userId, key);
      }
    }
    
    return achievements;
  }

  getMilestoneName(key) {
    const names = {
      first_evolution: '첫 진화',
      taste_expansion: '취향의 확장',
      art_connoisseur: '예술 애호가',
      taste_master: '취향의 달인'
    };
    return names[key] || key;
  }

  // ==================== 친화도 시스템 ====================
  
  buildAffinityMatrix() {
    const matrix = {};
    
    for (const type1 of Object.keys(SAYU_TYPES)) {
      matrix[type1] = {};
      for (const type2 of Object.keys(SAYU_TYPES)) {
        matrix[type1][type2] = this.calculateAffinity(type1, type2);
      }
    }
    
    return matrix;
  }

  calculateAffinity(type1, type2) {
    if (type1 === type2) return 1.0; // 같은 타입은 100% 친화도
    
    let affinity = 0;
    
    // 같은 축을 공유할 때마다 친화도 증가
    for (let i = 0; i < 4; i++) {
      if (type1[i] === type2[i]) {
        affinity += 0.25;
      }
    }
    
    return affinity;
  }

  getRecommendedConnections(aptType) {
    // 친화도가 높은 다른 APT 유형 추천
    const affinities = this.affinityMatrix[aptType];
    return Object.entries(affinities)
      .filter(([type, _]) => type !== aptType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, affinity]) => ({
        type,
        typeName: SAYU_TYPES[type].name,
        affinity: Math.round(affinity * 100)
      }));
  }

  // ==================== 데이터 저장 ====================
  
  async saveEvolutionHistory(userId, evolution) {
    // TODO: DB에 진화 이력 저장
    const db = require('../config/database');
    
    try {
      const result = await db.query(
        `INSERT INTO user_evolution_history 
        (user_id, action_type, evolution_points, vector_before, vector_after, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [
          userId,
          evolution.action.type,
          evolution.points,
          JSON.stringify(evolution.previousVector),
          JSON.stringify(evolution.newVector),
          JSON.stringify(evolution.action)
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error saving evolution history:', error);
      return null;
    }
  }

  async saveEvolvedVector(userId, vector) {
    const db = require('../config/database');
    
    try {
      await db.query(
        `UPDATE sayu_profiles 
        SET cognitive_vector = $2,
            last_vector_update = NOW()
        WHERE user_id = $1`,
        [userId, JSON.stringify(vector)]
      );
    } catch (error) {
      console.error('Error saving evolved vector:', error);
    }
  }

  async updateUserStage(userId, newStage) {
    const db = require('../config/database');
    
    try {
      await db.query(
        `UPDATE sayu_profiles 
        SET archetype_evolution_stage = $2
        WHERE user_id = $1`,
        [userId, newStage]
      );
    } catch (error) {
      console.error('Error updating user stage:', error);
    }
  }

  async saveMilestoneAchievement(userId, milestoneKey) {
    const db = require('../config/database');
    
    try {
      await db.query(
        `INSERT INTO user_achievements 
        (user_id, achievement_type, achievement_key, unlocked_at)
        VALUES ($1, 'milestone', $2, NOW())`,
        [userId, milestoneKey]
      );
    } catch (error) {
      console.error('Error saving milestone achievement:', error);
    }
  }

  async triggerStageUpEvent(userId, newStage) {
    // 단계 상승 이벤트 처리 (알림, 보상 등)
    console.log(`User ${userId} reached stage ${newStage}!`);
    
    // TODO: 알림 서비스 호출
    // TODO: 보상 지급
  }
}

module.exports = APTEvolutionSystem;