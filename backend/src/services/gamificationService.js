// 🎨 SAYU Gamification Service
// 포인트, 미션, 업적 관련 비즈니스 로직

const {
  UserPoints,
  PointActivity,
  Achievement,
  UserAchievement,
  MissionTemplate,
  UserMission,
  ExhibitionVisit
} = require('../models/Gamification');
const { User } = require('../models/User');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// 레벨 시스템 정의
const LEVELS = [
  { level: 1, name: 'Art Curious', nameKo: '예술 입문자', minPoints: 0, maxPoints: 99 },
  { level: 2, name: 'Gallery Explorer', nameKo: '갤러리 탐험가', minPoints: 100, maxPoints: 299 },
  { level: 3, name: 'Art Enthusiast', nameKo: '예술 애호가', minPoints: 300, maxPoints: 599 },
  { level: 4, name: 'Culture Connoisseur', nameKo: '문화 감식가', minPoints: 600, maxPoints: 999 },
  { level: 5, name: 'Art Maestro', nameKo: '예술 마에스트로', minPoints: 1000, maxPoints: 1999 },
  { level: 6, name: 'Legendary Aesthete', nameKo: '전설의 미학자', minPoints: 2000, maxPoints: 999999 }
];

// 활동별 기본 포인트
const POINT_VALUES = {
  quiz_completion: 50,
  first_quiz: 100,
  exhibition_visit: 30,
  exhibition_review: 50,
  compatibility_check: 10,
  profile_complete: 150,
  daily_login: 10,
  invite_friend: 100,
  share_result: 20,
  companion_evaluation: 20
};

class GamificationService {
  // 사용자 포인트 정보 가져오기
  async getUserPoints(userId) {
    let userPoints = await UserPoints.findOne({
      where: { userId },
      include: [
        {
          model: UserAchievement,
          as: 'achievements',
          include: [Achievement]
        },
        {
          model: UserMission,
          as: 'missions',
          include: [MissionTemplate],
          where: {
            [Op.or]: [
              { completed: false },
              {
                completed: true,
                updatedAt: {
                  [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24시간 이내 완료
                }
              }
            ]
          },
          required: false
        },
        {
          model: ExhibitionVisit,
          as: 'exhibitionHistory',
          order: [['visitDate', 'DESC']],
          limit: 50
        }
      ]
    });

    // 없으면 초기화
    if (!userPoints) {
      userPoints = await this.initializeUserPoints(userId);
    }

    // 레벨 정보 계산
    const levelInfo = this.calculateLevel(userPoints.totalPoints);
    userPoints.level = levelInfo.level;
    userPoints.levelName = levelInfo.name;
    userPoints.levelNameKo = levelInfo.nameKo;
    userPoints.nextLevelPoints = levelInfo.nextLevelPoints;

    return userPoints;
  }

  // 사용자 포인트 초기화
  async initializeUserPoints(userId) {
    const transaction = await sequelize.transaction();

    try {
      // 포인트 테이블 생성
      const userPoints = await UserPoints.create({
        userId,
        totalPoints: 0,
        level: 1,
        levelName: 'Art Curious',
        levelNameKo: '예술 입문자'
      }, { transaction });

      // 일일 미션 3개 생성
      const dailyMissions = await MissionTemplate.findAll({
        where: { type: 'daily', recurring: true },
        limit: 3
      });

      for (const template of dailyMissions) {
        await UserMission.create({
          userId,
          missionTemplateId: template.id,
          expiresAt: this.getNextMidnight()
        }, { transaction });
      }

      // 주간 미션 2개 생성
      const weeklyMissions = await MissionTemplate.findAll({
        where: { type: 'weekly', recurring: true },
        limit: 2
      });

      for (const template of weeklyMissions) {
        await UserMission.create({
          userId,
          missionTemplateId: template.id,
          expiresAt: this.getNextSunday()
        }, { transaction });
      }

      await transaction.commit();
      return userPoints;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // 포인트 추가
  async addPoints(userId, activityType, metadata = {}) {
    const transaction = await sequelize.transaction();

    try {
      const basePoints = POINT_VALUES[activityType] || 0;
      let finalPoints = basePoints;

      // 특별 보너스 계산
      if (activityType === 'exhibition_visit' && metadata.withCompanion) {
        finalPoints += 20;
        if (metadata.compatibilityLevel === 'platinum') finalPoints += 50;
        else if (metadata.compatibilityLevel === 'gold') finalPoints += 30;
        else if (metadata.compatibilityLevel === 'silver') finalPoints += 20;
        else if (metadata.compatibilityLevel === 'bronze') finalPoints += 10;
      }

      // 포인트 활동 기록
      await PointActivity.create({
        userId,
        activityType,
        points: finalPoints,
        description: `${activityType} - ${finalPoints} points`,
        metadata
      }, { transaction });

      // 사용자 총 포인트 업데이트
      const userPoints = await UserPoints.findOne({ where: { userId }, transaction });
      const oldLevel = this.calculateLevel(userPoints.totalPoints).level;
      
      userPoints.totalPoints += finalPoints;
      const newLevel = this.calculateLevel(userPoints.totalPoints).level;
      
      await userPoints.save({ transaction });

      // 레벨업 체크
      const leveledUp = newLevel > oldLevel;

      // 관련 미션 업데이트
      await this.updateRelatedMissions(userId, activityType, transaction);

      // 업적 체크
      await this.checkAchievements(userId, activityType, transaction);

      await transaction.commit();

      return {
        pointsEarned: finalPoints,
        totalPoints: userPoints.totalPoints,
        leveledUp,
        oldLevel,
        newLevel
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // 미션 진행도 업데이트
  async updateMissionProgress(userId, missionId, progress) {
    const mission = await UserMission.findOne({
      where: { id: missionId, userId },
      include: [MissionTemplate]
    });

    if (!mission) {
      throw new Error('Mission not found');
    }

    mission.progress = Math.min(progress, mission.MissionTemplate.target);
    
    if (mission.progress >= mission.MissionTemplate.target && !mission.completed) {
      mission.completed = true;
      
      // 미션 완료 포인트 지급
      await this.addPoints(userId, 'mission_complete', {
        missionId: mission.id,
        missionType: mission.MissionTemplate.type,
        bonusPoints: mission.MissionTemplate.points
      });
    }

    await mission.save();

    return {
      completed: mission.completed,
      pointsEarned: mission.completed ? mission.MissionTemplate.points : 0
    };
  }

  // 업적 달성 체크
  async checkAchievements(userId, activityType, transaction) {
    // 활동 유형에 따른 업적 체크 로직
    const userStats = await this.getUserStats(userId, transaction);
    
    // 예: 첫 퀴즈 완료
    if (activityType === 'quiz_completion' && userStats.quizCount === 1) {
      await this.unlockAchievement(userId, 'first_steps', transaction);
    }

    // 예: 5개 전시 방문
    if (activityType === 'exhibition_visit' && userStats.exhibitionCount === 5) {
      await this.unlockAchievement(userId, 'exhibition_explorer', transaction);
    }

    // 추가 업적 체크 로직...
  }

  // 업적 잠금 해제
  async unlockAchievement(userId, achievementId, transaction) {
    const exists = await UserAchievement.findOne({
      where: { userId, achievementId },
      transaction
    });

    if (!exists) {
      const achievement = await Achievement.findByPk(achievementId);
      
      await UserAchievement.create({
        userId,
        achievementId
      }, { transaction });

      // 업적 포인트 추가
      if (achievement.points > 0) {
        await this.addPoints(userId, 'achievement_unlock', {
          achievementId,
          bonusPoints: achievement.points
        });
      }

      return achievement;
    }

    return null;
  }

  // 전시 방문 기록
  async recordExhibitionVisit(userId, visitData) {
    const visit = await ExhibitionVisit.create({
      userId,
      ...visitData
    });

    // 포인트 계산 및 지급
    const pointsResult = await this.addPoints(userId, 'exhibition_visit', {
      exhibitionId: visit.exhibitionId,
      withCompanion: !!visit.companionId,
      compatibilityLevel: visit.compatibilityLevel
    });

    visit.pointsEarned = pointsResult.pointsEarned;
    await visit.save();

    return visit;
  }

  // 유틸리티 함수들
  calculateLevel(points) {
    const level = LEVELS.find(l => points >= l.minPoints && points <= l.maxPoints) || LEVELS[0];
    const nextLevel = LEVELS[level.level] || null;
    
    return {
      ...level,
      nextLevelPoints: nextLevel ? nextLevel.minPoints : 0
    };
  }

  getNextMidnight() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  getNextSunday() {
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(23, 59, 59, 999);
    return nextSunday;
  }

  async getUserStats(userId, transaction) {
    // 사용자 통계 계산 (업적 체크용)
    const [quizCount, exhibitionCount, evaluationCount] = await Promise.all([
      PointActivity.count({
        where: { userId, activityType: 'quiz_completion' },
        transaction
      }),
      ExhibitionVisit.count({
        where: { userId },
        transaction
      }),
      PointActivity.count({
        where: { userId, activityType: 'companion_evaluation' },
        transaction
      })
    ]);

    return { quizCount, exhibitionCount, evaluationCount };
  }

  async updateRelatedMissions(userId, activityType, transaction) {
    // 활동 유형에 따른 미션 진행도 업데이트
    const missionCategories = {
      'exhibition_visit': 'exhibition_visit',
      'compatibility_check': 'social_interaction',
      'quiz_completion': 'personality_exploration',
      'exhibition_review': 'knowledge_sharing',
      'companion_evaluation': 'social_interaction'
    };

    const category = missionCategories[activityType];
    if (!category) return;

    const missions = await UserMission.findAll({
      where: {
        userId,
        completed: false
      },
      include: [{
        model: MissionTemplate,
        where: { category }
      }],
      transaction
    });

    for (const mission of missions) {
      mission.progress += 1;
      if (mission.progress >= mission.MissionTemplate.target) {
        mission.completed = true;
      }
      await mission.save({ transaction });
    }
  }
}

module.exports = new GamificationService();