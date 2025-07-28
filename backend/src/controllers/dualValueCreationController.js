// SAYU 듀얼 가치 창출 시스템 컨트롤러
// 개인 성장과 집단 지성 API 엔드포인트

const logger = require('../config/logger');
const DualValueCreationService = require('../services/dualValueCreationService');

class DualValueCreationController {
  constructor(database, openaiApiKey) {
    this.dualValueService = new DualValueCreationService(database, openaiApiKey);
  }

  // ========================================
  // 1. 개인 성장 추적 API
  // ========================================

  /**
     * 예술 감상 후 개인 성장 데이터 기록
     * POST /api/dual-value/personal-growth/reflection
     */
  recordArtReflection = async (req, res) => {
    try {
      const userId = req.user.id;
      const { artworkId, reflectionText, artworkGenre, interactionData } = req.body;

      // 병렬로 각종 성장 지표 분석
      const analysisPromises = [
        this.dualValueService.analyzeEmotionalVocabularyGrowth(userId, reflectionText),
        this.dualValueService.trackContemplativeDepth(userId, artworkId, reflectionText)
      ];

      // 예술 이해도 데이터가 있는 경우 추가
      if (artworkGenre) {
        analysisPromises.push(
          this.dualValueService.trackArtComprehensionEvolution(userId, artworkGenre, {
            understanding_level: 0.7, // 기본값, 실제로는 퀴즈 결과 등으로 측정
            technical_knowledge_score: 0.6,
            historical_context_score: 0.5,
            personal_connection_score: 0.8,
            cross_cultural_understanding: 0.6,
            progression_rate: 0.1
          })
        );
      }

      // 상호작용 데이터가 있는 경우 공감 능력 측정
      if (interactionData) {
        analysisPromises.push(
          this.dualValueService.measureEmpathyDevelopment(userId, interactionData)
        );
      }

      const results = await Promise.all(analysisPromises);

      res.json({
        success: true,
        message: '개인 성장 데이터가 성공적으로 기록되었습니다.',
        data: {
          emotionalVocabularyAnalysis: results[0],
          contemplativeDepthAnalysis: results[1],
          artComprehensionAnalysis: results[2] || null,
          empathyAnalysis: results[3] || null
        }
      });

    } catch (error) {
      logger.error('예술 감상 반영 기록 오류:', error);
      res.status(500).json({
        success: false,
        message: '개인 성장 데이터 기록 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  };

  /**
     * 개인 성장 대시보드 조회
     * GET /api/dual-value/personal-growth/dashboard
     */
  getPersonalGrowthDashboard = async (req, res) => {
    try {
      const userId = req.user.id;

      // 성장 대시보드 데이터 계산 및 조회
      const dashboardData = await this.dualValueService.calculatePersonalGrowthDashboard(userId);
      const growthReport = await this.dualValueService.getUserGrowthReport(userId);

      // 성장 트렌드 데이터 추가 조회
      const growthTrend = await this.getGrowthTrendData(userId);

      res.json({
        success: true,
        data: {
          currentGrowth: dashboardData,
          profileSummary: growthReport,
          growthTrend,
          personalizedInsights: await this.generatePersonalizedInsights(userId, dashboardData)
        }
      });

    } catch (error) {
      logger.error('개인 성장 대시보드 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '개인 성장 대시보드 조회 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  };

  /**
     * 성장 영역별 상세 분석 조회
     * GET /api/dual-value/personal-growth/detailed/:area
     */
  getDetailedGrowthAnalysis = async (req, res) => {
    try {
      const userId = req.user.id;
      const { area } = req.params;
      const { timeframe = '30' } = req.query;

      let analysisData;

      switch (area) {
        case 'emotional':
          analysisData = await this.getEmotionalGrowthDetails(userId, timeframe);
          break;
        case 'contemplative':
          analysisData = await this.getContemplativeGrowthDetails(userId, timeframe);
          break;
        case 'artistic':
          analysisData = await this.getArtisticGrowthDetails(userId, timeframe);
          break;
        case 'social':
          analysisData = await this.getSocialGrowthDetails(userId, timeframe);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: '지원하지 않는 성장 영역입니다.'
          });
      }

      res.json({
        success: true,
        data: analysisData
      });

    } catch (error) {
      logger.error('상세 성장 분석 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '상세 성장 분석 조회 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  };

  // ========================================
  // 2. 집단 지성 플랫폼 API
  // ========================================

  /**
     * 작품 해석 기여
     * POST /api/dual-value/collective-intelligence/interpretation
     */
  contributeInterpretation = async (req, res) => {
    try {
      const userId = req.user.id;
      const { artworkId, interpretationText, emotionalTags, culturalPerspective, generationCohort } = req.body;

      // 입력 검증
      if (!artworkId || !interpretationText || !emotionalTags || emotionalTags.length === 0) {
        return res.status(400).json({
          success: false,
          message: '필수 필드가 누락되었습니다.'
        });
      }

      const interpretationData = {
        interpretation_text: interpretationText,
        emotional_tags: emotionalTags,
        cultural_perspective: culturalPerspective || 'general',
        generation_cohort: generationCohort || 'unknown'
      };

      const result = await this.dualValueService.contributeArtworkInterpretation(
        userId,
        artworkId,
        interpretationData
      );

      res.json({
        success: true,
        message: '작품 해석이 성공적으로 아카이브에 기여되었습니다.',
        data: {
          interpretationId: result.interpretationId,
          qualityScore: result.qualityAnalysis.interpretation_quality_score,
          noveltyScore: result.qualityAnalysis.novelty_score,
          contributionPoints: Math.round(result.qualityAnalysis.interpretation_quality_score * 10)
        }
      });

    } catch (error) {
      logger.error('작품 해석 기여 오류:', error);
      res.status(500).json({
        success: false,
        message: '작품 해석 기여 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  };

  /**
     * 해석에 피드백 제공
     * POST /api/dual-value/collective-intelligence/feedback
     */
  provideFeedback = async (req, res) => {
    try {
      const userId = req.user.id;
      const { interpretationId, feedbackType, resonanceScore, learningValue, perspectiveExpansion, comment } = req.body;

      // 입력 검증
      if (!interpretationId || !feedbackType || !resonanceScore || !learningValue || !perspectiveExpansion) {
        return res.status(400).json({
          success: false,
          message: '필수 피드백 필드가 누락되었습니다.'
        });
      }

      const feedbackData = {
        feedback_type: feedbackType,
        resonance_score: resonanceScore,
        learning_value: learningValue,
        perspective_expansion: perspectiveExpansion,
        feedback_comment: comment
      };

      await this.dualValueService.provideFeedbackOnInterpretation(userId, interpretationId, feedbackData);

      res.json({
        success: true,
        message: '피드백이 성공적으로 제공되었습니다.',
        data: {
          contributionPoints: Math.round((resonanceScore + learningValue + perspectiveExpansion) / 15 * 3) // 피드백 기여 점수
        }
      });

    } catch (error) {
      logger.error('해석 피드백 제공 오류:', error);
      res.status(500).json({
        success: false,
        message: '피드백 제공 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  };

  /**
     * 작품별 집단 지성 요약 조회
     * GET /api/dual-value/collective-intelligence/artwork/:artworkId
     */
  getArtworkCollectiveIntelligence = async (req, res) => {
    try {
      const { artworkId } = req.params;

      const collectiveData = await this.dualValueService.getArtworkCollectiveIntelligence(artworkId);

      if (!collectiveData) {
        return res.status(404).json({
          success: false,
          message: '해당 작품의 집단 지성 데이터를 찾을 수 없습니다.'
        });
      }

      // 추가적인 집단 지성 분석 데이터
      const interpretations = await this.getArtworkInterpretations(artworkId);
      const emotionMapping = await this.getArtworkEmotionMapping(artworkId);

      res.json({
        success: true,
        data: {
          summary: collectiveData,
          interpretations,
          emotionMapping,
          insights: await this.generateCollectiveInsights(artworkId, collectiveData)
        }
      });

    } catch (error) {
      logger.error('작품 집단 지성 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '작품 집단 지성 조회 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  };

  /**
     * 큐레이션 경로 생성
     * POST /api/dual-value/collective-intelligence/curate-path
     */
  createCuratedPath = async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        pathTitle,
        pathDescription,
        theme,
        emotionalJourney,
        difficultyLevel,
        estimatedDuration,
        artworkSequence
      } = req.body;

      // 입력 검증
      if (!pathTitle || !artworkSequence || artworkSequence.length === 0) {
        return res.status(400).json({
          success: false,
          message: '경로 제목과 작품 시퀀스는 필수입니다.'
        });
      }

      const pathData = {
        path_title: pathTitle,
        path_description: pathDescription,
        theme,
        emotional_journey: emotionalJourney,
        difficulty_level: difficultyLevel || 1,
        estimated_duration: estimatedDuration || 30,
        artwork_sequence: artworkSequence
      };

      const result = await this.dualValueService.createCuratedPath(userId, pathData);

      res.json({
        success: true,
        message: '큐레이션 경로가 성공적으로 생성되었습니다.',
        data: {
          pathId: result.pathId,
          contributionPoints: 7 // 큐레이션은 높은 기여 점수
        }
      });

    } catch (error) {
      logger.error('큐레이션 경로 생성 오류:', error);
      res.status(500).json({
        success: false,
        message: '큐레이션 경로 생성 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  };

  // ========================================
  // 3. 가치 순환 시스템 API
  // ========================================

  /**
     * 사용자 기여도 및 영향력 조회
     * GET /api/dual-value/value-circulation/contribution
     */
  getUserContribution = async (req, res) => {
    try {
      const userId = req.user.id;
      const { timeframe = '30' } = req.query;

      const contributionData = await this.getUserContributionData(userId, timeframe);
      const impactMetrics = await this.getUserImpactMetrics(userId, timeframe);
      const learningConnections = await this.getUserLearningConnections(userId, timeframe);

      res.json({
        success: true,
        data: {
          contribution: contributionData,
          impact: impactMetrics,
          learningConnections,
          valueCirculationScore: this.calculateValueCirculationScore(contributionData, impactMetrics, learningConnections)
        }
      });

    } catch (error) {
      logger.error('사용자 기여도 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '사용자 기여도 조회 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  };

  /**
     * 전체 가치 순환 효율성 분석
     * GET /api/dual-value/value-circulation/analysis
     */
  getValueCirculationAnalysis = async (req, res) => {
    try {
      const { months = 6 } = req.query;

      const analysisData = await this.dualValueService.getValueCirculationAnalysis(months);
      const trendsAnalysis = await this.analyzeValueCirculationTrends(analysisData);

      res.json({
        success: true,
        data: {
          circulation: analysisData,
          trends: trendsAnalysis,
          recommendations: await this.generateCirculationRecommendations(analysisData)
        }
      });

    } catch (error) {
      logger.error('가치 순환 분석 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '가치 순환 분석 조회 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  };

  // ========================================
  // 4. 보조 메서드들
  // ========================================

  async getGrowthTrendData(userId) {
    // 최근 6개월간의 성장 트렌드 데이터 조회
    const trendData = await this.dualValueService.db.query(`
            SELECT 
                DATE_TRUNC('month', calculated_at) as month,
                AVG(overall_growth_trajectory) as avg_growth,
                AVG(emotional_vocabulary_richness) as avg_emotional,
                AVG(philosophical_thinking_depth) as avg_philosophical,
                AVG(empathy_quotient) as avg_empathy
            FROM personal_growth_dashboard 
            WHERE user_id = $1 AND calculated_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', calculated_at)
            ORDER BY month
        `, [userId]);

    return trendData.rows;
  }

  async generatePersonalizedInsights(userId, dashboardData) {
    // 개인 맞춤형 성장 인사이트 생성
    const insights = [];

    // 강점 분석
    const strengths = Object.entries(dashboardData)
      .filter(([key, value]) => value > 0.7)
      .map(([key, value]) => ({ area: key, score: value }));

    // 성장 영역 식별
    const growthAreas = Object.entries(dashboardData)
      .filter(([key, value]) => value < 0.5)
      .map(([key, value]) => ({ area: key, score: value }));

    insights.push({
      type: 'strengths',
      data: strengths.slice(0, 3) // 상위 3개 강점
    });

    insights.push({
      type: 'growth_opportunities',
      data: growthAreas.slice(0, 3) // 상위 3개 성장 기회
    });

    // 성장 속도 분석
    if (dashboardData.growth_velocity > 0.1) {
      insights.push({
        type: 'acceleration',
        message: '놀라운 성장 가속도를 보이고 있습니다!'
      });
    }

    return insights;
  }

  async getEmotionalGrowthDetails(userId, timeframe) {
    const result = await this.dualValueService.db.query(`
            SELECT 
                vocabulary_count,
                sophistication_score,
                unique_emotions_used,
                complexity_index,
                measured_at
            FROM emotional_vocabulary_growth 
            WHERE user_id = $1 AND measured_at >= NOW() - INTERVAL '${timeframe} days'
            ORDER BY measured_at DESC
        `, [userId]);

    return {
      timeline: result.rows,
      averages: this.calculateAverages(result.rows),
      growth_rate: this.calculateGrowthRate(result.rows, 'sophistication_score')
    };
  }

  async getContemplativeGrowthDetails(userId, timeframe) {
    const result = await this.dualValueService.db.query(`
            SELECT 
                depth_score,
                philosophical_themes,
                abstract_thinking_level,
                created_at
            FROM contemplative_depth_tracking 
            WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${timeframe} days'
            ORDER BY created_at DESC
        `, [userId]);

    return {
      timeline: result.rows,
      philosophical_evolution: this.analyzePhilosophicalThemes(result.rows),
      depth_progression: this.calculateGrowthRate(result.rows, 'depth_score')
    };
  }

  async getArtisticGrowthDetails(userId, timeframe) {
    const result = await this.dualValueService.db.query(`
            SELECT 
                genre,
                understanding_level,
                technical_knowledge_score,
                cultural_context_score,
                measured_at
            FROM art_comprehension_evolution 
            WHERE user_id = $1 AND measured_at >= NOW() - INTERVAL '${timeframe} days'
            ORDER BY measured_at DESC
        `, [userId]);

    return {
      genre_progression: this.analyzeGenreProgression(result.rows),
      comprehension_trends: this.calculateComprehensionTrends(result.rows)
    };
  }

  async getSocialGrowthDetails(userId, timeframe) {
    const result = await this.dualValueService.db.query(`
            SELECT 
                empathy_score,
                perspective_taking_ability,
                cultural_sensitivity,
                feedback_quality,
                measured_at
            FROM empathy_development 
            WHERE user_id = $1 AND measured_at >= NOW() - INTERVAL '${timeframe} days'
            ORDER BY measured_at DESC
        `, [userId]);

    return {
      empathy_timeline: result.rows,
      social_impact: this.calculateSocialImpact(result.rows),
      interaction_quality: this.analyzeInteractionQuality(result.rows)
    };
  }

  async getArtworkInterpretations(artworkId, limit = 10) {
    const result = await this.dualValueService.db.query(`
            SELECT 
                aia.*,
                u.nickname,
                COUNT(if.id) as feedback_count
            FROM artwork_interpretation_archive aia
            JOIN users u ON aia.user_id = u.id
            LEFT JOIN interpretation_feedback if ON aia.id = if.interpretation_id
            WHERE aia.artwork_id = $1
            GROUP BY aia.id, u.nickname
            ORDER BY aia.interpretation_quality_score DESC, aia.created_at DESC
            LIMIT $2
        `, [artworkId, limit]);

    return result.rows;
  }

  async getArtworkEmotionMapping(artworkId) {
    const result = await this.dualValueService.db.query(`
            SELECT * FROM collective_emotion_mapping 
            WHERE artwork_id = $1
            ORDER BY sample_size DESC
        `, [artworkId]);

    return result.rows;
  }

  async generateCollectiveInsights(artworkId, collectiveData) {
    // 집단 지성 인사이트 생성
    const insights = [];

    if (collectiveData.interpretation_count > 10) {
      insights.push({
        type: 'rich_discourse',
        message: `이 작품은 ${collectiveData.interpretation_count}개의 다양한 해석을 통해 풍부한 담론을 형성하고 있습니다.`
      });
    }

    if (collectiveData.cultural_perspectives.length > 3) {
      insights.push({
        type: 'cultural_diversity',
        message: `${collectiveData.cultural_perspectives.length}개의 서로 다른 문화적 관점에서 해석되고 있습니다.`
      });
    }

    return insights;
  }

  async getUserContributionData(userId, timeframe) {
    const result = await this.dualValueService.db.query(`
            SELECT 
                contribution_type,
                AVG(quality_score) as avg_quality,
                AVG(impact_score) as avg_impact,
                SUM(accumulated_points) as total_points,
                COUNT(*) as contribution_count
            FROM contribution_metrics 
            WHERE user_id = $1 AND recorded_at >= NOW() - INTERVAL '${timeframe} days'
            GROUP BY contribution_type
        `, [userId]);

    return result.rows;
  }

  async getUserImpactMetrics(userId, timeframe) {
    // 사용자의 기여가 다른 사람들에게 미친 영향 측정
    const result = await this.dualValueService.db.query(`
            SELECT 
                COUNT(DISTINCT mlt.learner_id) as people_influenced,
                AVG(mlt.learning_depth) as avg_learning_depth,
                COUNT(DISTINCT krc.knowledge_adopter_id) as knowledge_adoptions
            FROM mutual_learning_tracking mlt
            LEFT JOIN knowledge_reproduction_cycle krc ON mlt.teacher_id = krc.original_contributor_id
            WHERE mlt.teacher_id = $1 AND mlt.created_at >= NOW() - INTERVAL '${timeframe} days'
        `, [userId]);

    return result.rows[0] || {};
  }

  async getUserLearningConnections(userId, timeframe) {
    const result = await this.dualValueService.db.query(`
            SELECT 
                COUNT(DISTINCT teacher_id) as learning_sources,
                AVG(learning_depth) as avg_learning_received,
                ARRAY_AGG(DISTINCT learning_type) as learning_types
            FROM mutual_learning_tracking 
            WHERE learner_id = $1 AND created_at >= NOW() - INTERVAL '${timeframe} days'
        `, [userId]);

    return result.rows[0] || {};
  }

  calculateValueCirculationScore(contribution, impact, learning) {
    // 기여, 영향, 학습을 종합한 가치 순환 점수 계산
    const contributionScore = (contribution.reduce((sum, c) => sum + (c.avg_quality * c.contribution_count), 0) || 0) / 100;
    const impactScore = ((impact.people_influenced || 0) * (impact.avg_learning_depth || 0)) / 10;
    const learningScore = ((learning.learning_sources || 0) * (learning.avg_learning_received || 0)) / 10;

    return Math.min((contributionScore + impactScore + learningScore) / 3, 1);
  }

  // 추가 유틸리티 메서드들
  calculateAverages(data) {
    if (data.length === 0) return {};

    const keys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
    const averages = {};

    keys.forEach(key => {
      averages[key] = data.reduce((sum, item) => sum + item[key], 0) / data.length;
    });

    return averages;
  }

  calculateGrowthRate(data, field) {
    if (data.length < 2) return 0;

    const recent = data[0][field];
    const older = data[data.length - 1][field];

    return older > 0 ? (recent - older) / older : 0;
  }

  analyzePhilosophicalThemes(data) {
    const themes = {};
    data.forEach(item => {
      if (item.philosophical_themes) {
        item.philosophical_themes.forEach(theme => {
          themes[theme] = (themes[theme] || 0) + 1;
        });
      }
    });

    return Object.entries(themes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }

  analyzeGenreProgression(data) {
    const genreMap = {};
    data.forEach(item => {
      if (!genreMap[item.genre]) {
        genreMap[item.genre] = [];
      }
      genreMap[item.genre].push(item.understanding_level);
    });

    return Object.entries(genreMap).map(([genre, levels]) => ({
      genre,
      progression: levels.length > 1 ? levels[0] - levels[levels.length - 1] : 0,
      current_level: levels[0] || 0
    }));
  }

  calculateComprehensionTrends(data) {
    // 예술 이해도 트렌드 분석
    return {
      technical_trend: this.calculateGrowthRate(data, 'technical_knowledge_score'),
      cultural_trend: this.calculateGrowthRate(data, 'cultural_context_score'),
      overall_trend: this.calculateGrowthRate(data, 'understanding_level')
    };
  }

  calculateSocialImpact(data) {
    if (data.length === 0) return 0;

    return data.reduce((sum, item) => sum + item.empathy_score * item.feedback_quality, 0) / data.length;
  }

  analyzeInteractionQuality(data) {
    return {
      empathy_trend: this.calculateGrowthRate(data, 'empathy_score'),
      perspective_growth: this.calculateGrowthRate(data, 'perspective_taking_ability'),
      cultural_sensitivity_growth: this.calculateGrowthRate(data, 'cultural_sensitivity')
    };
  }

  async analyzeValueCirculationTrends(analysisData) {
    // 가치 순환 트렌드 분석
    if (analysisData.length < 2) return {};

    const recent = analysisData[0];
    const previous = analysisData[1];

    return {
      contributor_growth: recent.active_contributors - previous.active_contributors,
      value_creation_growth: recent.total_value_created - previous.total_value_created,
      engagement_trend: recent.avg_engagement - previous.avg_engagement,
      learning_trend: recent.active_learners - previous.active_learners
    };
  }

  async generateCirculationRecommendations(analysisData) {
    // 가치 순환 개선 추천사항 생성
    const recommendations = [];

    if (analysisData.length > 0) {
      const latest = analysisData[0];

      if (latest.avg_engagement < 0.6) {
        recommendations.push({
          type: 'engagement',
          message: '커뮤니티 참여도 향상을 위한 인센티브 시스템 강화가 필요합니다.'
        });
      }

      if (latest.knowledge_reproduction_quality < 0.7) {
        recommendations.push({
          type: 'quality',
          message: '지식 재생산 품질 향상을 위한 가이드라인 제공이 필요합니다.'
        });
      }
    }

    return recommendations;
  }
}

module.exports = DualValueCreationController;
