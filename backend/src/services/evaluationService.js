// 🎨 SAYU Evaluation Service
// 동반자 평가 관련 비즈니스 로직

const {
  CompanionEvaluation,
  EvaluationSummary,
  CompanionTitle,
  UserCompanionTitle
} = require('../models/CompanionEvaluation');
const { ExhibitionVisit } = require('../models/Gamification');
const { User, UserProfile } = require('../models/User');
const gamificationService = require('./gamificationService');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class EvaluationService {
  // 동반자 평가 제출
  async submitEvaluation(evaluatorId, evaluationData) {
    const transaction = await sequelize.transaction();

    try {
      // 전시 방문 정보 확인
      const exhibitionVisit = await ExhibitionVisit.findByPk(
        evaluationData.exhibitionVisitId,
        { transaction }
      );

      if (!exhibitionVisit) {
        throw new Error('Exhibition visit not found');
      }

      // 평가자 정보 가져오기
      const evaluator = await UserProfile.findOne({
        where: { userId: evaluatorId },
        transaction
      });

      // 평가 생성
      const evaluation = await CompanionEvaluation.create({
        ...evaluationData,
        evaluatorId,
        evaluatorType: evaluator.personalityType || 'UNKNOWN',
        exhibitionEngagement: evaluationData.ratings.exhibitionEngagement,
        exhibitionEngagementComment: evaluationData.ratings.exhibitionEngagement_comment,
        communication: evaluationData.ratings.communication,
        communicationComment: evaluationData.ratings.communication_comment,
        paceMatching: evaluationData.ratings.paceMatching,
        paceMatchingComment: evaluationData.ratings.paceMatching_comment,
        newPerspectives: evaluationData.ratings.newPerspectives,
        newPerspectivesComment: evaluationData.ratings.newPerspectives_comment,
        overallSatisfaction: evaluationData.ratings.overallSatisfaction,
        overallSatisfactionComment: evaluationData.ratings.overallSatisfaction_comment
      }, { transaction });

      // 평가 점수 계산
      const evaluationScore = this.calculateEvaluationScore(evaluation);
      
      // 평가자 포인트 지급
      const evaluatorPoints = this.calculateEvaluatorPoints(evaluation);
      await gamificationService.addPoints(evaluatorId, 'companion_evaluation', {
        evaluationId: evaluation.id,
        points: evaluatorPoints,
        evaluationQuality: evaluationScore.quality
      });

      // 피평가자 점수 업데이트
      await this.updateEvaluationSummary(evaluationData.evaluatedId, evaluation, transaction);

      // 상호 평가 체크
      const mutualEvaluation = await this.checkMutualEvaluation(
        evaluationData.exhibitionVisitId,
        evaluatorId,
        evaluationData.evaluatedId,
        transaction
      );

      if (mutualEvaluation) {
        // 상호 평가 보너스
        await gamificationService.addPoints(evaluatorId, 'companion_evaluation', {
          bonus: 'mutual_evaluation',
          points: 20
        });
      }

      // 타이틀 체크
      await this.checkTitles(evaluationData.evaluatedId, transaction);

      await transaction.commit();

      return {
        evaluation,
        evaluatorPoints,
        mutualEvaluation
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // 평가 점수 계산
  calculateEvaluationScore(evaluation) {
    const ratings = [
      evaluation.exhibitionEngagement,
      evaluation.communication,
      evaluation.paceMatching,
      evaluation.newPerspectives,
      evaluation.overallSatisfaction
    ];

    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    // 평가 품질 점수 (0-100)
    let quality = 0;

    // 모든 항목 평가 (25점)
    quality += 25;

    // 코멘트 작성 (각 5점, 최대 25점)
    if (evaluation.exhibitionEngagementComment) quality += 5;
    if (evaluation.communicationComment) quality += 5;
    if (evaluation.paceMatchingComment) quality += 5;
    if (evaluation.newPerspectivesComment) quality += 5;
    if (evaluation.overallSatisfactionComment) quality += 5;

    // 하이라이트 작성 (15점)
    if (evaluation.highlights && evaluation.highlights.length >= 20) {
      quality += 15;
    }

    // 개선사항 작성 (15점)
    if (evaluation.improvements && evaluation.improvements.length >= 20) {
      quality += 15;
    }

    // 평가의 균형성 (20점)
    const uniqueRatings = new Set(ratings).size;
    if (uniqueRatings >= 2 && !ratings.every(r => r === ratings[0])) {
      quality += 20;
    }

    // 배율 계산
    let multiplier = 1.0;
    if (average >= 4.5) multiplier = 2.0;
    else if (average >= 4.0) multiplier = 1.5;
    else if (average >= 3.5) multiplier = 1.2;
    else if (average >= 3.0) multiplier = 1.0;
    else if (average >= 2.5) multiplier = 0.8;
    else multiplier = 0.5;

    return {
      average,
      quality,
      multiplier
    };
  }

  // 평가자 포인트 계산
  calculateEvaluatorPoints(evaluation) {
    let points = 10; // 기본 평가 포인트

    const score = this.calculateEvaluationScore(evaluation);
    
    // 품질에 따른 추가 포인트
    points += Math.floor(score.quality / 10);

    // 건설적 피드백 보너스
    if (evaluation.improvements && evaluation.improvements.length >= 50) {
      points += 5;
    }

    return points;
  }

  // 평가 요약 업데이트
  async updateEvaluationSummary(userId, newEvaluation, transaction) {
    let summary = await EvaluationSummary.findOne({
      where: { userId },
      transaction
    });

    if (!summary) {
      const userProfile = await UserProfile.findOne({
        where: { userId },
        transaction
      });

      summary = await EvaluationSummary.create({
        userId,
        personalityType: userProfile.personalityType || 'UNKNOWN'
      }, { transaction });
    }

    // 전체 평가 가져오기
    const allEvaluations = await CompanionEvaluation.findAll({
      where: { evaluatedId: userId },
      transaction
    });

    // 평균 계산
    const count = allEvaluations.length;
    if (count > 0) {
      summary.avgExhibitionEngagement = allEvaluations.reduce((sum, e) => sum + e.exhibitionEngagement, 0) / count;
      summary.avgCommunication = allEvaluations.reduce((sum, e) => sum + e.communication, 0) / count;
      summary.avgPaceMatching = allEvaluations.reduce((sum, e) => sum + e.paceMatching, 0) / count;
      summary.avgNewPerspectives = allEvaluations.reduce((sum, e) => sum + e.newPerspectives, 0) / count;
      summary.avgOverallSatisfaction = allEvaluations.reduce((sum, e) => sum + e.overallSatisfaction, 0) / count;
      
      summary.totalEvaluations = count;
      summary.wouldGoAgainCount = allEvaluations.filter(e => e.wouldGoAgain).length;
      summary.wouldGoAgainPercentage = Math.round((summary.wouldGoAgainCount / count) * 100);
    }

    // 유형별 통계 업데이트
    const typeStats = {};
    for (const eval of allEvaluations) {
      if (!typeStats[eval.evaluatorType]) {
        typeStats[eval.evaluatorType] = {
          count: 0,
          totalRating: 0,
          wouldGoAgainCount: 0
        };
      }
      typeStats[eval.evaluatorType].count++;
      typeStats[eval.evaluatorType].totalRating += (
        eval.exhibitionEngagement +
        eval.communication +
        eval.paceMatching +
        eval.newPerspectives +
        eval.overallSatisfaction
      ) / 5;
      if (eval.wouldGoAgain) {
        typeStats[eval.evaluatorType].wouldGoAgainCount++;
      }
    }

    // 평균 계산
    for (const type in typeStats) {
      typeStats[type].averageRating = typeStats[type].totalRating / typeStats[type].count;
    }

    summary.chemistryStats = typeStats;

    // 피드백 수집
    const highlights = allEvaluations
      .map(e => e.highlights)
      .filter(h => h && h.length > 0)
      .slice(-10);
    
    const improvements = allEvaluations
      .map(e => e.improvements)
      .filter(i => i && i.length > 0)
      .slice(-10);

    summary.receivedHighlights = highlights;
    summary.receivedImprovements = improvements;

    await summary.save({ transaction });
    return summary;
  }

  // 상호 평가 체크
  async checkMutualEvaluation(exhibitionVisitId, evaluatorId, evaluatedId, transaction) {
    const mutualEval = await CompanionEvaluation.findOne({
      where: {
        exhibitionVisitId,
        evaluatorId: evaluatedId,
        evaluatedId: evaluatorId
      },
      transaction
    });

    return !!mutualEval;
  }

  // 타이틀 체크 및 부여
  async checkTitles(userId, transaction) {
    const summary = await EvaluationSummary.findOne({
      where: { userId },
      transaction
    });

    if (!summary) return;

    // 타이틀 조건 체크
    const titlesToCheck = [
      {
        id: 'insight_provider',
        condition: summary.totalEvaluations >= 10 && summary.avgNewPerspectives > 4.5
      },
      {
        id: 'perfect_pace',
        condition: summary.totalEvaluations >= 10 && summary.avgPaceMatching > 4.5
      },
      {
        id: 'art_communicator',
        condition: summary.totalEvaluations >= 10 && summary.avgCommunication > 4.5
      },
      {
        id: 'focused_observer',
        condition: summary.totalEvaluations >= 10 && summary.avgExhibitionEngagement > 4.5
      },
      {
        id: 'ideal_companion',
        condition: summary.totalEvaluations >= 20 && summary.wouldGoAgainPercentage > 90
      }
    ];

    for (const { id, condition } of titlesToCheck) {
      if (condition) {
        const exists = await UserCompanionTitle.findOne({
          where: { userId, titleId: id },
          transaction
        });

        if (!exists) {
          await UserCompanionTitle.create({
            userId,
            titleId: id
          }, { transaction });

          // 타이틀 획득 알림 (추후 구현)
        }
      }
    }
  }

  // 사용자 평가 요약 가져오기
  async getUserEvaluationSummary(userId) {
    const summary = await EvaluationSummary.findOne({
      where: { userId },
      include: [{
        model: UserCompanionTitle,
        as: 'titles',
        include: [CompanionTitle]
      }]
    });

    if (!summary) {
      // 기본 요약 반환
      return {
        userId,
        averageRatings: {
          exhibitionEngagement: 0,
          communication: 0,
          paceMatching: 0,
          newPerspectives: 0,
          overallSatisfaction: 0
        },
        totalEvaluations: 0,
        wouldGoAgainPercentage: 0,
        chemistryStats: {},
        receivedHighlights: [],
        receivedImprovements: [],
        earnedTitles: []
      };
    }

    return {
      userId: summary.userId,
      personalityType: summary.personalityType,
      averageRatings: {
        exhibitionEngagement: parseFloat(summary.avgExhibitionEngagement),
        communication: parseFloat(summary.avgCommunication),
        paceMatching: parseFloat(summary.avgPaceMatching),
        newPerspectives: parseFloat(summary.avgNewPerspectives),
        overallSatisfaction: parseFloat(summary.avgOverallSatisfaction)
      },
      totalEvaluations: summary.totalEvaluations,
      wouldGoAgainPercentage: summary.wouldGoAgainPercentage,
      chemistryStats: summary.chemistryStats,
      receivedHighlights: summary.receivedHighlights,
      receivedImprovements: summary.receivedImprovements,
      earnedTitles: summary.titles?.map(t => ({
        id: t.CompanionTitle.id,
        name: t.CompanionTitle.name,
        name_ko: t.CompanionTitle.nameKo,
        description: t.CompanionTitle.description,
        description_ko: t.CompanionTitle.descriptionKo,
        icon: t.CompanionTitle.icon,
        requirement: t.CompanionTitle.requirement,
        earnedAt: t.earnedAt
      })) || []
    };
  }

  // 대기 중인 평가 가져오기
  async getPendingEvaluations(userId) {
    // 내가 방문했지만 아직 평가하지 않은 전시들
    const visits = await ExhibitionVisit.findAll({
      where: {
        userId,
        companionId: { [Op.not]: null }
      },
      include: [{
        model: User,
        as: 'companion',
        include: [UserProfile]
      }]
    });

    const pendingEvaluations = [];

    for (const visit of visits) {
      const evaluated = await CompanionEvaluation.findOne({
        where: {
          exhibitionVisitId: visit.id,
          evaluatorId: userId,
          evaluatedId: visit.companionId
        }
      });

      if (!evaluated) {
        pendingEvaluations.push({
          exhibitionVisitId: visit.id,
          exhibitionName: visit.exhibitionName,
          visitDate: visit.visitDate,
          companionId: visit.companionId,
          companionType: visit.companion?.UserProfile?.personalityType || 'UNKNOWN',
          companionName: visit.companion?.nickname
        });
      }
    }

    return pendingEvaluations;
  }
}

module.exports = new EvaluationService();