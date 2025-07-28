// SAYU 듀얼 가치 창출 시스템 라우터
// 개인 성장과 집단 지성 API 엔드포인트 라우팅

const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const logger = require('../config/logger');

// 듀얼 가치 창출 컨트롤러는 서버 초기화 시 주입됨
let dualValueController;

// 컨트롤러 설정 함수
function setController(controller) {
  dualValueController = controller;
}

// 입력 검증 미들웨어
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '입력 데이터 검증 실패',
      errors: errors.array()
    });
  }
  next();
};

// ========================================
// 1. 개인 성장 추적 라우트
// ========================================

/**
 * 예술 감상 후 개인 성장 데이터 기록
 * POST /api/dual-value/personal-growth/reflection
 */
router.post('/personal-growth/reflection',
  auth,
  [
    body('artworkId').notEmpty().withMessage('작품 ID는 필수입니다'),
    body('reflectionText').isLength({ min: 10, max: 2000 }).withMessage('감상문은 10-2000자 사이여야 합니다'),
    body('artworkGenre').optional().isString().withMessage('예술 장르는 문자열이어야 합니다'),
    body('interactionData').optional().isObject().withMessage('상호작용 데이터는 객체여야 합니다')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!dualValueController) {
        return res.status(500).json({
          success: false,
          message: '서비스가 초기화되지 않았습니다.'
        });
      }
      await dualValueController.recordArtReflection(req, res);
    } catch (error) {
      logger.error('예술 감상 반영 라우트 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
      });
    }
  }
);

/**
 * 개인 성장 대시보드 조회
 * GET /api/dual-value/personal-growth/dashboard
 */
router.get('/personal-growth/dashboard',
  auth,
  async (req, res) => {
    try {
      if (!dualValueController) {
        return res.status(500).json({
          success: false,
          message: '서비스가 초기화되지 않았습니다.'
        });
      }
      await dualValueController.getPersonalGrowthDashboard(req, res);
    } catch (error) {
      logger.error('개인 성장 대시보드 라우트 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
      });
    }
  }
);

/**
 * 성장 영역별 상세 분석 조회
 * GET /api/dual-value/personal-growth/detailed/:area
 */
router.get('/personal-growth/detailed/:area',
  auth,
  [
    param('area').isIn(['emotional', 'contemplative', 'artistic', 'social']).withMessage('지원하지 않는 성장 영역입니다'),
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('기간은 1-365일 사이여야 합니다')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!dualValueController) {
        return res.status(500).json({
          success: false,
          message: '서비스가 초기화되지 않았습니다.'
        });
      }
      await dualValueController.getDetailedGrowthAnalysis(req, res);
    } catch (error) {
      logger.error('상세 성장 분석 라우트 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
      });
    }
  }
);

// ========================================
// 2. 집단 지성 플랫폼 라우트
// ========================================

/**
 * 작품 해석 기여
 * POST /api/dual-value/collective-intelligence/interpretation
 */
router.post('/collective-intelligence/interpretation',
  auth,
  [
    body('artworkId').notEmpty().withMessage('작품 ID는 필수입니다'),
    body('interpretationText').isLength({ min: 20, max: 1000 }).withMessage('해석 내용은 20-1000자 사이여야 합니다'),
    body('emotionalTags').isArray({ min: 1, max: 10 }).withMessage('감정 태그는 1-10개 사이여야 합니다'),
    body('emotionalTags.*').isString().withMessage('감정 태그는 문자열이어야 합니다'),
    body('culturalPerspective').optional().isString().withMessage('문화적 관점은 문자열이어야 합니다'),
    body('generationCohort').optional().isString().withMessage('세대 구분은 문자열이어야 합니다')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!dualValueController) {
        return res.status(500).json({
          success: false,
          message: '서비스가 초기화되지 않았습니다.'
        });
      }
      await dualValueController.contributeInterpretation(req, res);
    } catch (error) {
      logger.error('작품 해석 기여 라우트 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
      });
    }
  }
);

/**
 * 해석에 피드백 제공
 * POST /api/dual-value/collective-intelligence/feedback
 */
router.post('/collective-intelligence/feedback',
  auth,
  [
    body('interpretationId').notEmpty().withMessage('해석 ID는 필수입니다'),
    body('feedbackType').isIn(['insightful', 'resonant', 'novel', 'helpful']).withMessage('유효한 피드백 타입을 선택해주세요'),
    body('resonanceScore').isInt({ min: 1, max: 5 }).withMessage('공명 점수는 1-5 사이여야 합니다'),
    body('learningValue').isInt({ min: 1, max: 5 }).withMessage('학습 가치는 1-5 사이여야 합니다'),
    body('perspectiveExpansion').isInt({ min: 1, max: 5 }).withMessage('관점 확장 점수는 1-5 사이여야 합니다'),
    body('comment').optional().isLength({ max: 500 }).withMessage('코멘트는 500자를 초과할 수 없습니다')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!dualValueController) {
        return res.status(500).json({
          success: false,
          message: '서비스가 초기화되지 않았습니다.'
        });
      }
      await dualValueController.provideFeedback(req, res);
    } catch (error) {
      logger.error('해석 피드백 라우트 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
      });
    }
  }
);

/**
 * 작품별 집단 지성 요약 조회
 * GET /api/dual-value/collective-intelligence/artwork/:artworkId
 */
router.get('/collective-intelligence/artwork/:artworkId',
  auth,
  [
    param('artworkId').notEmpty().withMessage('작품 ID는 필수입니다')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!dualValueController) {
        return res.status(500).json({
          success: false,
          message: '서비스가 초기화되지 않았습니다.'
        });
      }
      await dualValueController.getArtworkCollectiveIntelligence(req, res);
    } catch (error) {
      logger.error('작품 집단 지성 조회 라우트 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
      });
    }
  }
);

/**
 * 큐레이션 경로 생성
 * POST /api/dual-value/collective-intelligence/curate-path
 */
router.post('/collective-intelligence/curate-path',
  auth,
  [
    body('pathTitle').isLength({ min: 5, max: 100 }).withMessage('경로 제목은 5-100자 사이여야 합니다'),
    body('pathDescription').optional().isLength({ max: 500 }).withMessage('경로 설명은 500자를 초과할 수 없습니다'),
    body('theme').optional().isString().withMessage('테마는 문자열이어야 합니다'),
    body('emotionalJourney').optional().isArray().withMessage('감정 여정은 배열이어야 합니다'),
    body('difficultyLevel').optional().isInt({ min: 1, max: 5 }).withMessage('난이도는 1-5 사이여야 합니다'),
    body('estimatedDuration').optional().isInt({ min: 10, max: 300 }).withMessage('예상 소요시간은 10-300분 사이여야 합니다'),
    body('artworkSequence').isArray({ min: 2, max: 20 }).withMessage('작품 시퀀스는 2-20개 사이여야 합니다')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!dualValueController) {
        return res.status(500).json({
          success: false,
          message: '서비스가 초기화되지 않았습니다.'
        });
      }
      await dualValueController.createCuratedPath(req, res);
    } catch (error) {
      logger.error('큐레이션 경로 생성 라우트 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
      });
    }
  }
);

/**
 * 커뮤니티 큐레이션 경로 목록 조회
 * GET /api/dual-value/collective-intelligence/curated-paths
 */
router.get('/collective-intelligence/curated-paths',
  auth,
  [
    query('theme').optional().isString().withMessage('테마는 문자열이어야 합니다'),
    query('difficulty').optional().isInt({ min: 1, max: 5 }).withMessage('난이도는 1-5 사이여야 합니다'),
    query('page').optional().isInt({ min: 1 }).withMessage('페이지는 1 이상이어야 합니다'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('제한은 1-50 사이여야 합니다')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { theme, difficulty, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      let query = `
                SELECT 
                    ucp.*,
                    u.nickname as curator_name,
                    COUNT(ucpu.user_id) as usage_count
                FROM user_curated_paths ucp
                JOIN users u ON ucp.curator_id = u.id
                LEFT JOIN user_curated_path_usage ucpu ON ucp.id = ucpu.path_id
                WHERE ucp.is_public = true
            `;
      const queryParams = [];

      if (theme) {
        query += ` AND ucp.theme = $${queryParams.length + 1}`;
        queryParams.push(theme);
      }

      if (difficulty) {
        query += ` AND ucp.difficulty_level = $${queryParams.length + 1}`;
        queryParams.push(difficulty);
      }

      query += `
                GROUP BY ucp.id, u.nickname
                ORDER BY ucp.community_rating DESC, ucp.created_at DESC
                LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
            `;
      queryParams.push(limit, offset);

      const result = await dualValueController.dualValueService.db.query(query, queryParams);

      res.json({
        success: true,
        data: {
          paths: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: result.rows.length === parseInt(limit)
          }
        }
      });

    } catch (error) {
      logger.error('큐레이션 경로 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
      });
    }
  }
);

// ========================================
// 3. 가치 순환 시스템 라우트
// ========================================

/**
 * 사용자 기여도 및 영향력 조회
 * GET /api/dual-value/value-circulation/contribution
 */
router.get('/value-circulation/contribution',
  auth,
  [
    query('timeframe').optional().isInt({ min: 1, max: 365 }).withMessage('기간은 1-365일 사이여야 합니다')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!dualValueController) {
        return res.status(500).json({
          success: false,
          message: '서비스가 초기화되지 않았습니다.'
        });
      }
      await dualValueController.getUserContribution(req, res);
    } catch (error) {
      logger.error('사용자 기여도 조회 라우트 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
      });
    }
  }
);

/**
 * 전체 가치 순환 효율성 분석
 * GET /api/dual-value/value-circulation/analysis
 */
router.get('/value-circulation/analysis',
  auth,
  [
    query('months').optional().isInt({ min: 1, max: 24 }).withMessage('월 수는 1-24 사이여야 합니다')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!dualValueController) {
        return res.status(500).json({
          success: false,
          message: '서비스가 초기화되지 않았습니다.'
        });
      }
      await dualValueController.getValueCirculationAnalysis(req, res);
    } catch (error) {
      logger.error('가치 순환 분석 라우트 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
      });
    }
  }
);

/**
 * 상호 학습 연결 기록
 * POST /api/dual-value/value-circulation/mutual-learning
 */
router.post('/value-circulation/mutual-learning',
  auth,
  [
    body('teacherId').notEmpty().withMessage('교수자 ID는 필수입니다'),
    body('learningContext').notEmpty().withMessage('학습 맥락은 필수입니다'),
    body('learningType').isIn(['perspective_shift', 'technique_learning', 'cultural_insight']).withMessage('유효한 학습 타입을 선택해주세요'),
    body('learningDepth').isFloat({ min: 0, max: 1 }).withMessage('학습 깊이는 0-1 사이여야 합니다'),
    body('applicationEvidence').optional().isLength({ max: 500 }).withMessage('적용 증거는 500자를 초과할 수 없습니다')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const learnerId = req.user.id;
      const { teacherId, learningContext, learningType, learningDepth, applicationEvidence } = req.body;

      const result = await dualValueController.dualValueService.db.query(`
                INSERT INTO mutual_learning_tracking 
                (learner_id, teacher_id, learning_context, learning_type, learning_depth, application_evidence)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `, [learnerId, teacherId, learningContext, learningType, learningDepth, applicationEvidence]);

      // 교수자와 학습자 모두에게 기여 점수 부여
      await Promise.all([
        dualValueController.dualValueService.updateContributionMetrics(teacherId, 'teaching', {
          quality_score: learningDepth,
          impact_score: learningDepth * 0.8
        }),
        dualValueController.dualValueService.updateContributionMetrics(learnerId, 'learning', {
          quality_score: learningDepth * 0.6,
          impact_score: learningDepth * 0.4
        })
      ]);

      res.json({
        success: true,
        message: '상호 학습 연결이 성공적으로 기록되었습니다.',
        data: {
          learningId: result.rows[0].id,
          teacherPoints: Math.round(learningDepth * 8),
          learnerPoints: Math.round(learningDepth * 4)
        }
      });

    } catch (error) {
      logger.error('상호 학습 기록 오류:', error);
      res.status(500).json({
        success: false,
        message: '상호 학습 기록 중 오류가 발생했습니다.'
      });
    }
  }
);

/**
 * 지식 재생산 추적
 * POST /api/dual-value/value-circulation/knowledge-reproduction
 */
router.post('/value-circulation/knowledge-reproduction',
  auth,
  [
    body('originalContributorId').notEmpty().withMessage('원본 기여자 ID는 필수입니다'),
    body('knowledgeElementId').notEmpty().withMessage('지식 요소 ID는 필수입니다'),
    body('adaptationType').isIn(['building_upon', 'recontextualizing', 'synthesizing']).withMessage('유효한 적응 타입을 선택해주세요'),
    body('valueAdded').isLength({ min: 10, max: 1000 }).withMessage('추가된 가치 설명은 10-1000자 사이여야 합니다'),
    body('reproductionQuality').isFloat({ min: 0, max: 1 }).withMessage('재생산 품질은 0-1 사이여야 합니다')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const knowledgeAdopterId = req.user.id;
      const { originalContributorId, knowledgeElementId, adaptationType, valueAdded, reproductionQuality } = req.body;

      // 세대 깊이 계산 (원본에서 몇 단계 파생인지)
      const generationalDepthResult = await dualValueController.dualValueService.db.query(`
                SELECT COALESCE(MAX(generational_depth), 0) + 1 as next_depth
                FROM knowledge_reproduction_cycle 
                WHERE knowledge_element_id = $1
            `, [knowledgeElementId]);

      const generationalDepth = generationalDepthResult.rows[0].next_depth;

      const result = await dualValueController.dualValueService.db.query(`
                INSERT INTO knowledge_reproduction_cycle 
                (original_contributor_id, knowledge_adopter_id, knowledge_element_id, 
                 adaptation_type, value_added, reproduction_quality, generational_depth)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `, [originalContributorId, knowledgeAdopterId, knowledgeElementId, adaptationType, valueAdded, reproductionQuality, generationalDepth]);

      // 원본 기여자와 재생산자 모두에게 기여 점수 부여
      await Promise.all([
        dualValueController.dualValueService.updateContributionMetrics(originalContributorId, 'knowledge_impact', {
          quality_score: reproductionQuality,
          impact_score: reproductionQuality * (1 / generationalDepth) // 세대가 깊을수록 영향력 감소
        }),
        dualValueController.dualValueService.updateContributionMetrics(knowledgeAdopterId, 'knowledge_synthesis', {
          quality_score: reproductionQuality,
          impact_score: reproductionQuality * 0.7
        })
      ]);

      res.json({
        success: true,
        message: '지식 재생산이 성공적으로 추적되었습니다.',
        data: {
          reproductionId: result.rows[0].id,
          generationalDepth,
          originalContributorPoints: Math.round(reproductionQuality * (10 / generationalDepth)),
          reproducerPoints: Math.round(reproductionQuality * 7)
        }
      });

    } catch (error) {
      logger.error('지식 재생산 추적 오류:', error);
      res.status(500).json({
        success: false,
        message: '지식 재생산 추적 중 오류가 발생했습니다.'
      });
    }
  }
);

// ========================================
// 4. 관리자 및 통계 라우트
// ========================================

/**
 * 전체 듀얼 가치 시스템 통계 (관리자용)
 * GET /api/dual-value/admin/statistics
 */
router.get('/admin/statistics',
  auth,
  async (req, res) => {
    try {
      // 관리자 권한 확인 (추후 구현)
      // if (req.user.role !== 'admin') {
      //     return res.status(403).json({ success: false, message: '관리자 권한이 필요합니다.' });
      // }

      const statistics = await Promise.all([
        // 전체 사용자 성장 통계
        dualValueController.dualValueService.db.query(`
                    SELECT 
                        COUNT(DISTINCT user_id) as total_growing_users,
                        AVG(overall_growth_trajectory) as avg_growth_trajectory,
                        AVG(emotional_vocabulary_richness) as avg_emotional_growth,
                        AVG(philosophical_thinking_depth) as avg_philosophical_growth
                    FROM personal_growth_dashboard 
                    WHERE calculated_at >= NOW() - INTERVAL '30 days'
                `),

        // 집단 지성 통계
        dualValueController.dualValueService.db.query(`
                    SELECT 
                        COUNT(*) as total_interpretations,
                        COUNT(DISTINCT artwork_id) as artworks_with_interpretations,
                        COUNT(DISTINCT user_id) as active_interpreters,
                        AVG(interpretation_quality_score) as avg_interpretation_quality
                    FROM artwork_interpretation_archive 
                    WHERE created_at >= NOW() - INTERVAL '30 days'
                `),

        // 가치 순환 통계
        dualValueController.dualValueService.db.query(`
                    SELECT 
                        COUNT(DISTINCT user_id) as active_contributors,
                        SUM(accumulated_points) as total_value_created,
                        AVG(quality_score) as avg_contribution_quality,
                        COUNT(*) as total_contributions
                    FROM contribution_metrics 
                    WHERE recorded_at >= NOW() - INTERVAL '30 days'
                `),

        // 상호 학습 네트워크 통계
        dualValueController.dualValueService.db.query(`
                    SELECT 
                        COUNT(*) as total_learning_connections,
                        COUNT(DISTINCT learner_id) as active_learners,
                        COUNT(DISTINCT teacher_id) as active_teachers,
                        AVG(learning_depth) as avg_learning_depth
                    FROM mutual_learning_tracking 
                    WHERE created_at >= NOW() - INTERVAL '30 days'
                `)
      ]);

      res.json({
        success: true,
        data: {
          personalGrowth: statistics[0].rows[0],
          collectiveIntelligence: statistics[1].rows[0],
          valueCirculation: statistics[2].rows[0],
          learningNetwork: statistics[3].rows[0],
          calculatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '통계 조회 중 오류가 발생했습니다.'
      });
    }
  }
);

// 라우터 초기화 확인 미들웨어
router.use((req, res, next) => {
  if (!dualValueController) {
    return res.status(500).json({
      success: false,
      message: '듀얼 가치 창출 시스템이 초기화되지 않았습니다.'
    });
  }
  next();
});

module.exports = { router, setController };
