// 🎨 SAYU Evaluation Service
// 동반자 평가 관련 비즈니스 로직
// TODO: Sequelize 모델 마이그레이션 후 복원 필요

class EvaluationService {
  // 임시 구현
  async submitEvaluation(evaluatorId, evaluationData) {
    console.log('EvaluationService: submitEvaluation - 임시 구현');
    return { success: false, message: 'Evaluation service temporarily disabled' };
  }

  async getUserEvaluationSummary(userId) {
    console.log('EvaluationService: getUserEvaluationSummary - 임시 구현');
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

  async getPendingEvaluations(userId) {
    console.log('EvaluationService: getPendingEvaluations - 임시 구현');
    return [];
  }
}

module.exports = new EvaluationService();