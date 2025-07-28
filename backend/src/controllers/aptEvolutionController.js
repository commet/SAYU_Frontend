// APT Evolution Controller - 진화 시스템 API 엔드포인트
const aptEvolutionService = require('../services/aptEvolutionService');
const logger = require('../utils/logger');

class APTEvolutionController {
  // 사용자 진화 상태 조회
  async getUserEvolutionState(req, res) {
    try {
      const userId = req.user.id;
      const evolutionState = await aptEvolutionService.getUserEvolutionState(userId);

      res.json({
        success: true,
        data: evolutionState
      });
    } catch (error) {
      logger.error('Error getting evolution state:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get evolution state'
      });
    }
  }

  // 행동 기록 (포인트 적립)
  async recordAction(req, res) {
    try {
      const userId = req.user.id;
      const { action, context } = req.body;

      if (!action) {
        return res.status(400).json({
          success: false,
          error: 'Action type is required'
        });
      }

      const result = await aptEvolutionService.recordAction(userId, action, context || {});

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error recording action:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record action'
      });
    }
  }

  // 일일 방문 체크인
  async dailyCheckIn(req, res) {
    try {
      const userId = req.user.id;
      const result = await aptEvolutionService.checkDailyVisit(userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error processing daily check-in:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process daily check-in'
      });
    }
  }

  // 리더보드 조회
  async getLeaderboard(req, res) {
    try {
      const { aptType, period = 'weekly' } = req.query;
      const leaderboard = await aptEvolutionService.getLeaderboard(aptType, period);

      res.json({
        success: true,
        data: {
          period,
          aptType: aptType || 'all',
          rankings: leaderboard
        }
      });
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get leaderboard'
      });
    }
  }

  // 진화 애니메이션 데이터 (진화 시점에 호출)
  async getEvolutionAnimation(req, res) {
    try {
      const userId = req.user.id;
      const { fromStage, toStage } = req.query;

      if (!fromStage || !toStage) {
        return res.status(400).json({
          success: false,
          error: 'fromStage and toStage are required'
        });
      }

      const animationData = aptEvolutionService.evolutionSystem.getEvolutionAnimation(
        parseInt(fromStage),
        parseInt(toStage)
      );

      res.json({
        success: true,
        data: animationData
      });
    } catch (error) {
      logger.error('Error getting evolution animation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get evolution animation data'
      });
    }
  }

  // 마일스톤 목록 조회
  async getMilestones(req, res) {
    try {
      const userId = req.user.id;

      // 사용자의 현재 통계 가져오기
      const userStats = await aptEvolutionService.getUserStats(null, userId);

      // 모든 마일스톤과 달성 여부 확인
      const allMilestones = aptEvolutionService.rewardSystem.milestones;
      const achievedMilestones = await aptEvolutionService.getUserAchievements(userId);

      const milestoneList = Object.entries(allMilestones).map(([key, milestone]) => ({
        ...milestone,
        achieved: achievedMilestones.milestones.includes(key),
        progress: this.calculateMilestoneProgress(milestone, userStats)
      }));

      res.json({
        success: true,
        data: {
          milestones: milestoneList,
          totalAchieved: achievedMilestones.milestones.length,
          totalAvailable: Object.keys(allMilestones).length
        }
      });
    } catch (error) {
      logger.error('Error getting milestones:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get milestones'
      });
    }
  }

  // 마일스톤 진행률 계산
  calculateMilestoneProgress(milestone, userStats) {
    if (milestone.requiredPoints) {
      return Math.min(100, Math.round((userStats.totalPoints / milestone.requiredPoints) * 100));
    }
    if (milestone.requiredAction && milestone.requiredCount) {
      const currentCount = userStats.actionCounts?.[milestone.requiredAction] || 0;
      return Math.min(100, Math.round((currentCount / milestone.requiredCount) * 100));
    }
    if (milestone.requiredStreak) {
      return Math.min(100, Math.round((userStats.currentStreak / milestone.requiredStreak) * 100));
    }
    return 0;
  }

  // 특정 작품 감상 시 호출 (예시)
  async viewArtwork(req, res) {
    try {
      const userId = req.user.id;
      const { artworkId, duration, style, artist, isNew } = req.body;

      const context = {
        targetId: artworkId,
        targetType: 'artwork',
        duration, // 감상 시간 (초)
        isNewStyle: isNew?.style || false,
        isNewArtist: isNew?.artist || false
      };

      const result = await aptEvolutionService.recordAction(userId, 'artwork_view', context);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error recording artwork view:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record artwork view'
      });
    }
  }

  // 전시 완주 시 호출 (예시)
  async completeExhibition(req, res) {
    try {
      const userId = req.user.id;
      const { exhibitionId, artworksViewed, totalDuration } = req.body;

      const context = {
        targetId: exhibitionId,
        targetType: 'exhibition',
        artworksViewed,
        duration: totalDuration
      };

      const result = await aptEvolutionService.recordAction(userId, 'exhibition_complete', context);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error recording exhibition completion:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record exhibition completion'
      });
    }
  }
}

module.exports = new APTEvolutionController();
