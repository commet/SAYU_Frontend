// 🎨 SAYU Evaluation API Routes
// 동반자 평가 관련 API 엔드포인트

const express = require('express');
const router = express.Router();
const evaluationService = require('../services/evaluationService');
const authenticate = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

// 동반자 평가 제출
router.post('/submit',
  authenticate,
  [
    body('exhibitionVisitId').isUUID(),
    body('evaluatedId').isUUID(),
    body('evaluatedType').isString().isLength({ min: 4, max: 4 }),
    body('ratings.exhibitionEngagement').isInt({ min: 1, max: 5 }),
    body('ratings.communication').isInt({ min: 1, max: 5 }),
    body('ratings.paceMatching').isInt({ min: 1, max: 5 }),
    body('ratings.newPerspectives').isInt({ min: 1, max: 5 }),
    body('ratings.overallSatisfaction').isInt({ min: 1, max: 5 }),
    body('wouldGoAgain').isBoolean(),
    body('isAnonymous').optional().isBoolean(),
    body('highlights').optional().isString(),
    body('improvements').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await evaluationService.submitEvaluation(
        req.user.id,
        req.body
      );

      res.json({
        success: true,
        evaluationId: result.evaluation.id,
        pointsEarned: result.evaluatorPoints,
        mutualEvaluation: result.mutualEvaluation
      });
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      res.status(500).json({ error: 'Failed to submit evaluation' });
    }
  }
);

// 사용자 평가 요약 조회
router.get('/summary/:userId?', authenticate, async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const summary = await evaluationService.getUserEvaluationSummary(userId);
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching evaluation summary:', error);
    res.status(500).json({ error: 'Failed to fetch evaluation summary' });
  }
});

// 대기 중인 평가 조회
router.get('/pending', authenticate, async (req, res) => {
  try {
    const pendingEvaluations = await evaluationService.getPendingEvaluations(req.user.id);
    
    res.json({
      count: pendingEvaluations.length,
      evaluations: pendingEvaluations
    });
  } catch (error) {
    console.error('Error fetching pending evaluations:', error);
    res.status(500).json({ error: 'Failed to fetch pending evaluations' });
  }
});

// 특정 전시 방문에 대한 평가 조회
router.get('/exhibition/:visitId',
  authenticate,
  [
    param('visitId').isUUID()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const CompanionEvaluation = require('../models/CompanionEvaluation').CompanionEvaluation;
      
      const evaluations = await CompanionEvaluation.findAll({
        where: {
          exhibitionVisitId: req.params.visitId
        },
        include: [
          {
            model: require('../models/User').User,
            as: 'evaluator',
            attributes: ['id', 'nickname']
          },
          {
            model: require('../models/User').User,
            as: 'evaluated',
            attributes: ['id', 'nickname']
          }
        ]
      });

      // 익명 평가 처리
      const processedEvaluations = evaluations.map(eval => {
        const evalData = eval.toJSON();
        if (evalData.isAnonymous && evalData.evaluatorId !== req.user.id) {
          evalData.evaluator = { id: 'anonymous', nickname: 'Anonymous' };
          delete evalData.evaluatorId;
        }
        return evalData;
      });

      res.json({
        count: processedEvaluations.length,
        evaluations: processedEvaluations
      });
    } catch (error) {
      console.error('Error fetching exhibition evaluations:', error);
      res.status(500).json({ error: 'Failed to fetch evaluations' });
    }
  }
);

// 받은 평가 목록 조회
router.get('/received', authenticate, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const CompanionEvaluation = require('../models/CompanionEvaluation').CompanionEvaluation;
    const ExhibitionVisit = require('../models/Gamification').ExhibitionVisit;
    
    const evaluations = await CompanionEvaluation.findAndCountAll({
      where: {
        evaluatedId: req.user.id
      },
      include: [
        {
          model: ExhibitionVisit,
          attributes: ['exhibitionName', 'visitDate']
        },
        {
          model: require('../models/User').User,
          as: 'evaluator',
          attributes: ['id', 'nickname'],
          include: [{
            model: require('../models/User').UserProfile,
            attributes: ['personalityType']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // 익명 처리
    const processedEvaluations = evaluations.rows.map(eval => {
      const evalData = eval.toJSON();
      if (evalData.isAnonymous) {
        evalData.evaluator = { 
          id: 'anonymous', 
          nickname: 'Anonymous',
          UserProfile: { personalityType: 'UNKNOWN' }
        };
      }
      return evalData;
    });

    res.json({
      total: evaluations.count,
      evaluations: processedEvaluations
    });
  } catch (error) {
    console.error('Error fetching received evaluations:', error);
    res.status(500).json({ error: 'Failed to fetch received evaluations' });
  }
});

// 평가 통계
router.get('/stats', authenticate, async (req, res) => {
  try {
    const CompanionEvaluation = require('../models/CompanionEvaluation').CompanionEvaluation;
    const { Op } = require('sequelize');
    
    // 주고받은 평가 수
    const [givenCount, receivedCount] = await Promise.all([
      CompanionEvaluation.count({ where: { evaluatorId: req.user.id } }),
      CompanionEvaluation.count({ where: { evaluatedId: req.user.id } })
    ]);
    
    // 최근 평가 트렌드 (최근 3개월)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentEvaluations = await CompanionEvaluation.findAll({
      where: {
        evaluatedId: req.user.id,
        createdAt: { [Op.gte]: threeMonthsAgo }
      },
      attributes: [
        'exhibitionEngagement',
        'communication',
        'paceMatching',
        'newPerspectives',
        'overallSatisfaction',
        'createdAt'
      ],
      order: [['createdAt', 'ASC']]
    });
    
    // 월별 평균 계산
    const monthlyAverages = {};
    recentEvaluations.forEach(eval => {
      const monthKey = eval.createdAt.toISOString().slice(0, 7);
      if (!monthlyAverages[monthKey]) {
        monthlyAverages[monthKey] = {
          count: 0,
          totals: {
            exhibitionEngagement: 0,
            communication: 0,
            paceMatching: 0,
            newPerspectives: 0,
            overallSatisfaction: 0
          }
        };
      }
      
      monthlyAverages[monthKey].count++;
      Object.keys(monthlyAverages[monthKey].totals).forEach(key => {
        monthlyAverages[monthKey].totals[key] += eval[key];
      });
    });
    
    // 평균 계산
    Object.keys(monthlyAverages).forEach(month => {
      const data = monthlyAverages[month];
      Object.keys(data.totals).forEach(key => {
        data.totals[key] = data.totals[key] / data.count;
      });
    });
    
    res.json({
      givenCount,
      receivedCount,
      monthlyTrends: monthlyAverages
    });
  } catch (error) {
    console.error('Error fetching evaluation stats:', error);
    res.status(500).json({ error: 'Failed to fetch evaluation statistics' });
  }
});

// 타이틀 목록 조회
router.get('/titles', authenticate, async (req, res) => {
  try {
    const CompanionTitle = require('../models/CompanionEvaluation').CompanionTitle;
    const UserCompanionTitle = require('../models/CompanionEvaluation').UserCompanionTitle;
    
    const [allTitles, userTitles] = await Promise.all([
      CompanionTitle.findAll(),
      UserCompanionTitle.findAll({
        where: { userId: req.user.id },
        include: [CompanionTitle]
      })
    ]);
    
    const userTitleIds = new Set(userTitles.map(ut => ut.titleId));
    
    const titlesWithStatus = allTitles.map(title => ({
      ...title.toJSON(),
      earned: userTitleIds.has(title.id),
      earnedAt: userTitles.find(ut => ut.titleId === title.id)?.earnedAt
    }));
    
    res.json({
      total: titlesWithStatus.length,
      earned: userTitleIds.size,
      titles: titlesWithStatus
    });
  } catch (error) {
    console.error('Error fetching titles:', error);
    res.status(500).json({ error: 'Failed to fetch titles' });
  }
});

module.exports = router;