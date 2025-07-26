// SAYU 듀얼 가치 창출 시스템 서비스
// 개인 성장과 집단 지성을 동시에 창출하는 핵심 서비스

const logger = require('../config/logger');
const OpenAI = require('openai');

class DualValueCreationService {
    constructor(database, openaiApiKey) {
        this.db = database;
        this.openai = new OpenAI({ apiKey: openaiApiKey });
    }

    // ========================================
    // 1. 개인 성장 추적 시스템
    // ========================================

    /**
     * 감정 어휘 성장 분석 및 기록
     */
    async analyzeEmotionalVocabularyGrowth(userId, reflectionText) {
        try {
            // AI를 통한 감정 어휘 분석
            const analysisPrompt = `
            다음 예술 감상문을 분석하여 감정 어휘의 풍부함과 정교함을 평가해주세요:

            "${reflectionText}"

            다음 지표로 0-1 사이의 점수를 매겨주세요:
            1. vocabulary_count: 사용된 감정 어휘의 개수
            2. sophistication_score: 감정 표현의 정교함 (단순 -> 복합감정)
            3. unique_emotions_used: 독특하거나 세밀한 감정 표현의 개수
            4. complexity_index: 복합 감정이나 모순적 감정 표현 능력

            JSON 형태로 응답해주세요.
            `;

            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: analysisPrompt }],
                temperature: 0.3
            });

            const analysis = JSON.parse(response.choices[0].message.content);

            // 데이터베이스에 기록
            await this.db.query(`
                INSERT INTO emotional_vocabulary_growth 
                (user_id, vocabulary_count, sophistication_score, unique_emotions_used, complexity_index, growth_metrics)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                userId,
                analysis.vocabulary_count,
                analysis.sophistication_score,
                analysis.unique_emotions_used,
                analysis.complexity_index,
                JSON.stringify(analysis)
            ]);

            return analysis;
        } catch (error) {
            logger.error('감정 어휘 성장 분석 오류:', error);
            throw error;
        }
    }

    /**
     * 사유 깊이 발전 추적
     */
    async trackContemplativeDepth(userId, artworkId, reflectionText) {
        try {
            const depthAnalysisPrompt = `
            다음 예술 작품에 대한 감상문의 사유 깊이를 분석해주세요:

            "${reflectionText}"

            다음 지표를 평가해주세요:
            1. depth_score (0-1): 사유의 깊이와 통찰력
            2. philosophical_themes: 감지되는 철학적 주제들 (배열)
            3. metaphor_usage_count: 은유나 상징적 표현 사용 횟수
            4. abstract_thinking_level (1-5): 추상적 사고 수준
            5. cognitive_complexity: 인지적 복잡성 지표

            JSON 형태로 응답해주세요.
            `;

            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: depthAnalysisPrompt }],
                temperature: 0.3
            });

            const analysis = JSON.parse(response.choices[0].message.content);

            await this.db.query(`
                INSERT INTO contemplative_depth_tracking 
                (user_id, artwork_id, reflection_text, depth_score, philosophical_themes, 
                 metaphor_usage_count, abstract_thinking_level, cognitive_complexity)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                userId,
                artworkId,
                reflectionText,
                analysis.depth_score,
                analysis.philosophical_themes,
                analysis.metaphor_usage_count,
                analysis.abstract_thinking_level,
                JSON.stringify(analysis.cognitive_complexity)
            ]);

            return analysis;
        } catch (error) {
            logger.error('사유 깊이 추적 오류:', error);
            throw error;
        }
    }

    /**
     * 예술 이해도 성장 기록
     */
    async trackArtComprehensionEvolution(userId, genre, comprehensionData) {
        try {
            await this.db.query(`
                INSERT INTO art_comprehension_evolution 
                (user_id, genre, understanding_level, technical_knowledge_score, 
                 historical_context_score, personal_connection_score, cross_cultural_understanding, progression_rate)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (user_id, genre) 
                DO UPDATE SET 
                    understanding_level = EXCLUDED.understanding_level,
                    technical_knowledge_score = EXCLUDED.technical_knowledge_score,
                    historical_context_score = EXCLUDED.historical_context_score,
                    personal_connection_score = EXCLUDED.personal_connection_score,
                    cross_cultural_understanding = EXCLUDED.cross_cultural_understanding,
                    progression_rate = EXCLUDED.progression_rate,
                    measured_at = NOW()
            `, [
                userId,
                genre,
                comprehensionData.understanding_level,
                comprehensionData.technical_knowledge_score,
                comprehensionData.historical_context_score,
                comprehensionData.personal_connection_score,
                comprehensionData.cross_cultural_understanding,
                comprehensionData.progression_rate
            ]);

            return { success: true };
        } catch (error) {
            logger.error('예술 이해도 추적 오류:', error);
            throw error;
        }
    }

    /**
     * 공감 능력 향상 측정
     */
    async measureEmpathyDevelopment(userId, interactionData) {
        try {
            const empathyPrompt = `
            다음 사용자 상호작용을 분석하여 공감 능력을 평가해주세요:

            피드백 내용: "${interactionData.feedbackText}"
            상호작용 맥락: "${interactionData.context}"

            다음 지표를 0-1 사이로 평가해주세요:
            1. empathy_score: 전반적 공감 능력
            2. perspective_taking_ability: 타인 관점 이해 능력
            3. emotional_resonance_score: 감정적 공명 능력
            4. cultural_sensitivity: 문화적 민감성
            5. feedback_quality: 제공한 피드백의 건설적 품질

            JSON 형태로 응답해주세요.
            `;

            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: empathyPrompt }],
                temperature: 0.3
            });

            const analysis = JSON.parse(response.choices[0].message.content);

            await this.db.query(`
                INSERT INTO empathy_development 
                (user_id, interaction_id, empathy_score, perspective_taking_ability, 
                 emotional_resonance_score, cultural_sensitivity, feedback_quality)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                userId,
                interactionData.interaction_id,
                analysis.empathy_score,
                analysis.perspective_taking_ability,
                analysis.emotional_resonance_score,
                analysis.cultural_sensitivity,
                analysis.feedback_quality
            ]);

            return analysis;
        } catch (error) {
            logger.error('공감 능력 측정 오류:', error);
            throw error;
        }
    }

    /**
     * 개인 성장 대시보드 데이터 계산
     */
    async calculatePersonalGrowthDashboard(userId) {
        try {
            // 각 영역별 최신 데이터 수집 및 계산
            const emotionalData = await this.db.query(`
                SELECT 
                    AVG(sophistication_score) as avg_sophistication,
                    AVG(complexity_index) as avg_complexity,
                    COUNT(*) as measurement_count
                FROM emotional_vocabulary_growth 
                WHERE user_id = $1 AND measured_at >= NOW() - INTERVAL '30 days'
            `, [userId]);

            const contemplativeData = await this.db.query(`
                SELECT 
                    AVG(depth_score) as avg_depth,
                    AVG(abstract_thinking_level) as avg_abstract_thinking,
                    COUNT(*) as reflection_count
                FROM contemplative_depth_tracking 
                WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
            `, [userId]);

            const artComprehensionData = await this.db.query(`
                SELECT 
                    AVG(understanding_level) as avg_understanding,
                    AVG(cross_cultural_understanding) as avg_cultural_understanding,
                    COUNT(DISTINCT genre) as genre_breadth
                FROM art_comprehension_evolution 
                WHERE user_id = $1 AND measured_at >= NOW() - INTERVAL '30 days'
            `, [userId]);

            const empathyData = await this.db.query(`
                SELECT 
                    AVG(empathy_score) as avg_empathy,
                    AVG(cultural_sensitivity) as avg_cultural_sensitivity,
                    AVG(perspective_taking_ability) as avg_perspective_taking
                FROM empathy_development 
                WHERE user_id = $1 AND measured_at >= NOW() - INTERVAL '30 days'
            `, [userId]);

            const contributionData = await this.db.query(`
                SELECT 
                    AVG(quality_score) as avg_quality,
                    AVG(impact_score) as avg_impact,
                    SUM(accumulated_points) as total_points
                FROM contribution_metrics 
                WHERE user_id = $1 AND recorded_at >= NOW() - INTERVAL '30 days'
            `, [userId]);

            // 종합 점수 계산
            const dashboardData = {
                emotional_vocabulary_richness: emotionalData.rows[0]?.avg_sophistication || 0,
                emotional_nuance_ability: emotionalData.rows[0]?.avg_complexity || 0,
                emotional_self_awareness: (emotionalData.rows[0]?.avg_sophistication + emotionalData.rows[0]?.avg_complexity) / 2 || 0,
                
                philosophical_thinking_depth: contemplativeData.rows[0]?.avg_depth || 0,
                abstract_reasoning_ability: contemplativeData.rows[0]?.avg_abstract_thinking / 5 || 0,
                critical_analysis_skill: contemplativeData.rows[0]?.reflection_count >= 5 ? 0.8 : 0.4,
                
                genre_comprehension_breadth: Math.min(artComprehensionData.rows[0]?.genre_breadth / 10, 1) || 0,
                cultural_context_understanding: artComprehensionData.rows[0]?.avg_cultural_understanding || 0,
                technical_appreciation_level: artComprehensionData.rows[0]?.avg_understanding || 0,
                
                empathy_quotient: empathyData.rows[0]?.avg_empathy || 0,
                cultural_sensitivity_score: empathyData.rows[0]?.avg_cultural_sensitivity || 0,
                perspective_taking_ability: empathyData.rows[0]?.avg_perspective_taking || 0,
                
                community_contribution_score: contributionData.rows[0]?.avg_quality || 0,
                teaching_effectiveness: contributionData.rows[0]?.avg_impact || 0,
                knowledge_synthesis_ability: Math.min(contributionData.rows[0]?.total_points / 100, 1) || 0
            };

            // 전체 성장 궤적 계산
            const overallGrowth = Object.values(dashboardData).reduce((sum, val) => sum + val, 0) / Object.keys(dashboardData).length;
            dashboardData.overall_growth_trajectory = overallGrowth;

            // 성장 속도 계산 (이전 달 대비)
            const previousMonthGrowth = await this.db.query(`
                SELECT overall_growth_trajectory 
                FROM personal_growth_dashboard 
                WHERE user_id = $1 AND calculated_at >= NOW() - INTERVAL '60 days' AND calculated_at < NOW() - INTERVAL '30 days'
                ORDER BY calculated_at DESC LIMIT 1
            `, [userId]);

            dashboardData.growth_velocity = previousMonthGrowth.rows[0] 
                ? overallGrowth - previousMonthGrowth.rows[0].overall_growth_trajectory 
                : 0;

            // 개인 미션 정렬도 (사용자의 성격 유형과 성장 패턴 일치도)
            dashboardData.personal_mission_alignment = await this.calculateMissionAlignment(userId, dashboardData);

            // 데이터베이스에 저장
            await this.db.query(`
                INSERT INTO personal_growth_dashboard 
                (user_id, emotional_vocabulary_richness, emotional_nuance_ability, emotional_self_awareness,
                 philosophical_thinking_depth, abstract_reasoning_ability, critical_analysis_skill,
                 genre_comprehension_breadth, cultural_context_understanding, technical_appreciation_level,
                 empathy_quotient, cultural_sensitivity_score, perspective_taking_ability,
                 community_contribution_score, teaching_effectiveness, knowledge_synthesis_ability,
                 overall_growth_trajectory, growth_velocity, personal_mission_alignment)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            `, [
                userId,
                dashboardData.emotional_vocabulary_richness,
                dashboardData.emotional_nuance_ability,
                dashboardData.emotional_self_awareness,
                dashboardData.philosophical_thinking_depth,
                dashboardData.abstract_reasoning_ability,
                dashboardData.critical_analysis_skill,
                dashboardData.genre_comprehension_breadth,
                dashboardData.cultural_context_understanding,
                dashboardData.technical_appreciation_level,
                dashboardData.empathy_quotient,
                dashboardData.cultural_sensitivity_score,
                dashboardData.perspective_taking_ability,
                dashboardData.community_contribution_score,
                dashboardData.teaching_effectiveness,
                dashboardData.knowledge_synthesis_ability,
                dashboardData.overall_growth_trajectory,
                dashboardData.growth_velocity,
                dashboardData.personal_mission_alignment
            ]);

            return dashboardData;
        } catch (error) {
            logger.error('개인 성장 대시보드 계산 오류:', error);
            throw error;
        }
    }

    /**
     * 개인 미션 정렬도 계산
     */
    async calculateMissionAlignment(userId, growthData) {
        try {
            // 사용자의 SAYU 성격 유형 가져오기
            const userProfile = await this.db.query(`
                SELECT type_code FROM user_profiles WHERE user_id = $1
            `, [userId]);

            if (!userProfile.rows[0]) return 0.5; // 기본값

            const typeCode = userProfile.rows[0].type_code;
            
            // 성격 유형별 이상적 성장 패턴과 현재 성장 패턴 비교
            const idealPatterns = {
                'INTJ': { philosophical_thinking_depth: 0.9, knowledge_synthesis_ability: 0.8, abstract_reasoning_ability: 0.9 },
                'INFP': { emotional_vocabulary_richness: 0.9, empathy_quotient: 0.9, cultural_sensitivity_score: 0.8 },
                'ENTP': { perspective_taking_ability: 0.8, teaching_effectiveness: 0.8, genre_comprehension_breadth: 0.8 },
                'ISFJ': { community_contribution_score: 0.9, empathy_quotient: 0.8, cultural_context_understanding: 0.8 }
                // 나머지 16개 타입도 추가 가능
            };

            const idealPattern = idealPatterns[typeCode] || {};
            let alignmentScore = 0;
            let patternCount = 0;

            for (const [key, idealValue] of Object.entries(idealPattern)) {
                if (growthData[key] !== undefined) {
                    alignmentScore += 1 - Math.abs(growthData[key] - idealValue);
                    patternCount++;
                }
            }

            return patternCount > 0 ? alignmentScore / patternCount : 0.5;
        } catch (error) {
            logger.error('미션 정렬도 계산 오류:', error);
            return 0.5;
        }
    }

    // ========================================
    // 2. 집단 지성 아카이브 시스템
    // ========================================

    /**
     * 작품 해석 아카이브에 기여
     */
    async contributeArtworkInterpretation(userId, artworkId, interpretationData) {
        try {
            // AI를 통한 해석 품질 평가
            const qualityPrompt = `
            다음 예술 작품 해석의 품질을 평가해주세요:

            해석 내용: "${interpretationData.interpretation_text}"
            감정 태그: ${interpretationData.emotional_tags.join(', ')}

            다음 지표를 0-1 사이로 평가해주세요:
            1. interpretation_quality_score: 전반적 해석 품질
            2. novelty_score: 독창성과 새로운 관점
            3. depth_score: 해석의 깊이와 통찰력
            4. accessibility_score: 다른 사람들이 이해하기 쉬운 정도

            JSON 형태로 응답해주세요.
            `;

            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: qualityPrompt }],
                temperature: 0.3
            });

            const qualityAnalysis = JSON.parse(response.choices[0].message.content);

            // 사용자 프로필 정보 가져오기
            const userProfile = await this.db.query(`
                SELECT type_code FROM user_profiles WHERE user_id = $1
            `, [userId]);

            const typeCode = userProfile.rows[0]?.type_code || 'UNKN';

            // 해석 아카이브에 저장
            const interpretationResult = await this.db.query(`
                INSERT INTO artwork_interpretation_archive 
                (artwork_id, user_id, interpretation_text, emotional_tags, cultural_perspective,
                 generation_cohort, personality_type, interpretation_quality_score, novelty_score,
                 depth_score, accessibility_score)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id
            `, [
                artworkId,
                userId,
                interpretationData.interpretation_text,
                interpretationData.emotional_tags,
                interpretationData.cultural_perspective,
                interpretationData.generation_cohort,
                typeCode,
                qualityAnalysis.interpretation_quality_score,
                qualityAnalysis.novelty_score,
                qualityAnalysis.depth_score,
                qualityAnalysis.accessibility_score
            ]);

            // 기여도 점수 업데이트
            await this.updateContributionMetrics(userId, 'interpretation', qualityAnalysis);

            return {
                interpretationId: interpretationResult.rows[0].id,
                qualityAnalysis
            };
        } catch (error) {
            logger.error('작품 해석 기여 오류:', error);
            throw error;
        }
    }

    /**
     * 해석에 대한 피드백 제공
     */
    async provideFeedbackOnInterpretation(feedbackUserId, interpretationId, feedbackData) {
        try {
            await this.db.query(`
                INSERT INTO interpretation_feedback 
                (interpretation_id, feedback_user_id, feedback_type, resonance_score,
                 learning_value, perspective_expansion, feedback_comment)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                interpretationId,
                feedbackUserId,
                feedbackData.feedback_type,
                feedbackData.resonance_score,
                feedbackData.learning_value,
                feedbackData.perspective_expansion,
                feedbackData.feedback_comment
            ]);

            // 피드백 제공자의 기여도 업데이트
            await this.updateContributionMetrics(feedbackUserId, 'feedback', {
                quality_score: (feedbackData.resonance_score + feedbackData.learning_value + feedbackData.perspective_expansion) / 15,
                impact_score: 0.3 // 피드백은 중간 수준의 임팩트
            });

            return { success: true };
        } catch (error) {
            logger.error('해석 피드백 제공 오류:', error);
            throw error;
        }
    }

    /**
     * 사용자 큐레이션 전시 경로 생성
     */
    async createCuratedPath(curatorId, pathData) {
        try {
            const pathResult = await this.db.query(`
                INSERT INTO user_curated_paths 
                (curator_id, path_title, path_description, theme, emotional_journey,
                 difficulty_level, estimated_duration, artwork_sequence)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `, [
                curatorId,
                pathData.path_title,
                pathData.path_description,
                pathData.theme,
                pathData.emotional_journey,
                pathData.difficulty_level,
                pathData.estimated_duration,
                JSON.stringify(pathData.artwork_sequence)
            ]);

            // 큐레이션 기여도 업데이트
            await this.updateContributionMetrics(curatorId, 'curation', {
                quality_score: 0.7, // 큐레이션은 높은 품질 점수
                impact_score: 0.6
            });

            return { pathId: pathResult.rows[0].id };
        } catch (error) {
            logger.error('큐레이션 경로 생성 오류:', error);
            throw error;
        }
    }

    /**
     * 기여도 지표 업데이트
     */
    async updateContributionMetrics(userId, contributionType, metrics) {
        try {
            await this.db.query(`
                INSERT INTO contribution_metrics 
                (user_id, contribution_type, quality_score, impact_score, novelty_contribution,
                 learning_facilitation, community_engagement, accumulated_points)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                userId,
                contributionType,
                metrics.quality_score || 0,
                metrics.impact_score || 0,
                metrics.novelty_score || 0,
                metrics.accessibility_score || 0,
                0.5, // 기본 커뮤니티 참여도
                (metrics.quality_score || 0) * 10 // 점수를 포인트로 변환
            ]);

            return { success: true };
        } catch (error) {
            logger.error('기여도 지표 업데이트 오류:', error);
            throw error;
        }
    }

    /**
     * 집단 감정 지도 업데이트
     */
    async updateCollectiveEmotionMapping(artworkId, emotionData) {
        try {
            await this.db.query(`
                INSERT INTO collective_emotion_mapping 
                (artwork_id, emotion_category, intensity_distribution, cultural_variations,
                 personality_correlations, age_group_patterns, sample_size)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (artwork_id, emotion_category)
                DO UPDATE SET 
                    intensity_distribution = EXCLUDED.intensity_distribution,
                    cultural_variations = EXCLUDED.cultural_variations,
                    personality_correlations = EXCLUDED.personality_correlations,
                    age_group_patterns = EXCLUDED.age_group_patterns,
                    sample_size = EXCLUDED.sample_size,
                    last_updated = NOW()
            `, [
                artworkId,
                emotionData.emotion_category,
                JSON.stringify(emotionData.intensity_distribution),
                JSON.stringify(emotionData.cultural_variations),
                JSON.stringify(emotionData.personality_correlations),
                JSON.stringify(emotionData.age_group_patterns),
                emotionData.sample_size
            ]);

            return { success: true };
        } catch (error) {
            logger.error('집단 감정 지도 업데이트 오류:', error);
            throw error;
        }
    }

    // ========================================
    // 3. 데이터 조회 및 분석 메서드
    // ========================================

    /**
     * 사용자 성장 리포트 조회
     */
    async getUserGrowthReport(userId) {
        try {
            const result = await this.db.query(`
                SELECT * FROM user_growth_summary WHERE user_id = $1
            `, [userId]);

            return result.rows[0] || null;
        } catch (error) {
            logger.error('사용자 성장 리포트 조회 오류:', error);
            throw error;
        }
    }

    /**
     * 작품별 집단 지성 요약 조회
     */
    async getArtworkCollectiveIntelligence(artworkId) {
        try {
            const result = await this.db.query(`
                SELECT * FROM artwork_collective_intelligence WHERE artwork_id = $1
            `, [artworkId]);

            return result.rows[0] || null;
        } catch (error) {
            logger.error('작품 집단 지성 조회 오류:', error);
            throw error;
        }
    }

    /**
     * 가치 순환 효율성 분석 조회
     */
    async getValueCirculationAnalysis(months = 6) {
        try {
            const result = await this.db.query(`
                SELECT * FROM value_circulation_analysis 
                ORDER BY month DESC 
                LIMIT $1
            `, [months]);

            return result.rows;
        } catch (error) {
            logger.error('가치 순환 분석 조회 오류:', error);
            throw error;
        }
    }
}

module.exports = DualValueCreationService;