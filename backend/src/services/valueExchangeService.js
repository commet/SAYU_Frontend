// SAYU 가치 교환 메커니즘 서비스
// 개인 성장과 커뮤니티 기여를 통한 가치 순환 시스템

const logger = require('../config/logger');

class ValueExchangeService {
    constructor(database) {
        this.db = database;
    }

    // ========================================
    // 1. 프리미엄 포인트 시스템
    // ========================================

    /**
     * 사용자의 포인트 잔액 조회
     */
    async getUserPointBalance(userId) {
        try {
            const result = await this.db.query(`
                SELECT 
                    COALESCE(SUM(accumulated_points), 0) as total_points,
                    COUNT(*) as contribution_count,
                    MAX(recorded_at) as last_contribution
                FROM contribution_metrics 
                WHERE user_id = $1
            `, [userId]);

            return result.rows[0];
        } catch (error) {
            logger.error('포인트 잔액 조회 오류:', error);
            throw error;
        }
    }

    /**
     * 포인트 기반 작품 접근 권한 확인
     */
    async checkArtworkAccessPermission(userId, artworkId, requiredPoints = 5) {
        try {
            const userPoints = await this.getUserPointBalance(userId);
            
            // 기본 무료 작품 접근 (일일 제한)
            const todayAccess = await this.db.query(`
                SELECT COUNT(*) as today_access
                FROM artwork_access_log 
                WHERE user_id = $1 AND DATE(accessed_at) = CURRENT_DATE AND access_type = 'free'
            `, [userId]);

            const dailyFreeLimit = 10;
            const hasFreeDailyAccess = todayAccess.rows[0].today_access < dailyFreeLimit;

            // 프리미엄 포인트로 접근 가능한지 확인
            const hasPointAccess = userPoints.total_points >= requiredPoints;

            return {
                canAccess: hasFreeDailyAccess || hasPointAccess,
                accessType: hasFreeDailyAccess ? 'free' : 'premium',
                remainingFreeAccess: Math.max(0, dailyFreeLimit - todayAccess.rows[0].today_access),
                userPoints: userPoints.total_points,
                requiredPoints: hasFreeDailyAccess ? 0 : requiredPoints
            };
        } catch (error) {
            logger.error('작품 접근 권한 확인 오류:', error);
            throw error;
        }
    }

    /**
     * 작품 접근 기록 및 포인트 차감
     */
    async recordArtworkAccess(userId, artworkId, accessType, pointsUsed = 0) {
        try {
            await this.db.query('BEGIN');

            // 접근 로그 기록
            await this.db.query(`
                INSERT INTO artwork_access_log 
                (user_id, artwork_id, access_type, points_used, accessed_at)
                VALUES ($1, $2, $3, $4, NOW())
            `, [userId, artworkId, accessType, pointsUsed]);

            // 포인트 차감 (프리미엄 접근 시)
            if (accessType === 'premium' && pointsUsed > 0) {
                await this.db.query(`
                    INSERT INTO contribution_metrics 
                    (user_id, contribution_type, quality_score, impact_score, accumulated_points, recorded_at)
                    VALUES ($1, 'point_usage', 0, 0, $2, NOW())
                `, [userId, -pointsUsed]);
            }

            await this.db.query('COMMIT');
            return { success: true };
        } catch (error) {
            await this.db.query('ROLLBACK');
            logger.error('작품 접근 기록 오류:', error);
            throw error;
        }
    }

    // ========================================
    // 2. 해석 품질 기반 포인트 시스템
    // ========================================

    /**
     * 해석 품질에 따른 동적 포인트 계산
     */
    calculateInterpretationPoints(qualityMetrics) {
        const {
            interpretation_quality_score,
            novelty_score,
            depth_score,
            accessibility_score,
            community_feedback_score = 0
        } = qualityMetrics;

        // 기본 점수 (0-10점)
        let basePoints = interpretation_quality_score * 10;

        // 독창성 보너스 (최대 +5점)
        const noveltyBonus = novelty_score * 5;

        // 깊이 보너스 (최대 +5점)
        const depthBonus = depth_score * 5;

        // 접근성 보너스 (최대 +3점)
        const accessibilityBonus = accessibility_score * 3;

        // 커뮤니티 피드백 보너스 (최대 +7점)
        const communityBonus = community_feedback_score * 7;

        const totalPoints = Math.round(basePoints + noveltyBonus + depthBonus + accessibilityBonus + communityBonus);

        return {
            basePoints: Math.round(basePoints),
            noveltyBonus: Math.round(noveltyBonus),
            depthBonus: Math.round(depthBonus),
            accessibilityBonus: Math.round(accessibilityBonus),
            communityBonus: Math.round(communityBonus),
            totalPoints: Math.min(totalPoints, 30) // 최대 30점 제한
        };
    }

    /**
     * 해석에 대한 커뮤니티 피드백 집계
     */
    async aggregateCommunityFeedback(interpretationId) {
        try {
            const result = await this.db.query(`
                SELECT 
                    AVG(resonance_score) as avg_resonance,
                    AVG(learning_value) as avg_learning_value,
                    AVG(perspective_expansion) as avg_perspective_expansion,
                    COUNT(*) as feedback_count
                FROM interpretation_feedback 
                WHERE interpretation_id = $1
            `, [interpretationId]);

            const feedback = result.rows[0];
            if (feedback.feedback_count === 0) return 0;

            // 피드백 점수 정규화 (1-5 척도를 0-1로 변환)
            const normalizedScore = (
                (feedback.avg_resonance - 1) / 4 +
                (feedback.avg_learning_value - 1) / 4 +
                (feedback.avg_perspective_expansion - 1) / 4
            ) / 3;

            // 피드백 개수에 따른 신뢰도 가중치
            const confidenceWeight = Math.min(feedback.feedback_count / 5, 1);

            return normalizedScore * confidenceWeight;
        } catch (error) {
            logger.error('커뮤니티 피드백 집계 오류:', error);
            return 0;
        }
    }

    // ========================================
    // 3. 상호 학습 인센티브 시스템
    // ========================================

    /**
     * 피드백 제공자에게 포인트 지급
     */
    async rewardFeedbackProvider(feedbackUserId, feedbackQuality) {
        try {
            const points = this.calculateFeedbackPoints(feedbackQuality);

            await this.db.query(`
                INSERT INTO contribution_metrics 
                (user_id, contribution_type, quality_score, impact_score, accumulated_points)
                VALUES ($1, 'feedback_provision', $2, $3, $4)
            `, [feedbackUserId, feedbackQuality.qualityScore, feedbackQuality.impactScore, points]);

            return { pointsAwarded: points };
        } catch (error) {
            logger.error('피드백 제공자 포인트 지급 오류:', error);
            throw error;
        }
    }

    /**
     * 피드백 품질에 따른 포인트 계산
     */
    calculateFeedbackPoints(feedbackQuality) {
        const { resonance_score, learning_value, perspective_expansion } = feedbackQuality;
        
        // 피드백 품질 점수 (1-5 → 0-1)
        const qualityScore = (resonance_score + learning_value + perspective_expansion) / 15;
        
        // 기본 포인트 (1-3점)
        const basePoints = Math.round(qualityScore * 3);
        
        // 고품질 피드백 보너스
        const highQualityBonus = qualityScore > 0.8 ? 2 : 0;
        
        return basePoints + highQualityBonus;
    }

    // ========================================
    // 4. 큐레이션 기여 보상 시스템
    // ========================================

    /**
     * 큐레이션 경로 사용률에 따른 보상 계산
     */
    async calculateCurationReward(pathId, curatorId) {
        try {
            // 경로 사용 통계
            const usageStats = await this.db.query(`
                SELECT 
                    COUNT(DISTINCT user_id) as unique_users,
                    AVG(completion_rate) as avg_completion_rate,
                    AVG(user_rating) as avg_user_rating,
                    COUNT(*) as total_usage
                FROM user_curated_path_usage 
                WHERE path_id = $1 AND used_at >= NOW() - INTERVAL '30 days'
            `, [pathId]);

            const stats = usageStats.rows[0];
            
            if (stats.unique_users === 0) return 0;

            // 기본 사용률 점수 (사용자 수 * 완성률)
            const usageScore = stats.unique_users * (stats.avg_completion_rate || 0);
            
            // 품질 점수 (평균 평점)
            const qualityScore = (stats.avg_user_rating || 3) / 5;
            
            // 영향력 점수 (총 사용 횟수)
            const impactScore = Math.min(stats.total_usage / 10, 1);
            
            const totalPoints = Math.round((usageScore + qualityScore * 5 + impactScore * 3));

            // 포인트 지급
            await this.db.query(`
                INSERT INTO contribution_metrics 
                (user_id, contribution_type, quality_score, impact_score, accumulated_points)
                VALUES ($1, 'curation_impact', $2, $3, $4)
            `, [curatorId, qualityScore, impactScore, totalPoints]);

            return { pointsAwarded: totalPoints, usageStats: stats };
        } catch (error) {
            logger.error('큐레이션 보상 계산 오류:', error);
            throw error;
        }
    }

    // ========================================
    // 5. 지식 재생산 보상 시스템
    // ========================================

    /**
     * 원본 기여자에게 파생 보상 제공
     */
    async provideDerivativeReward(originalContributorId, reproductionQuality, generationalDepth) {
        try {
            // 세대가 깊어질수록 보상 감소 (50% 감소율)
            const depthPenalty = Math.pow(0.5, generationalDepth - 1);
            const baseReward = reproductionQuality * 5;
            const finalReward = Math.round(baseReward * depthPenalty);

            if (finalReward > 0) {
                await this.db.query(`
                    INSERT INTO contribution_metrics 
                    (user_id, contribution_type, quality_score, impact_score, accumulated_points)
                    VALUES ($1, 'derivative_impact', $2, $3, $4)
                `, [originalContributorId, reproductionQuality, depthPenalty, finalReward]);
            }

            return { derivativeReward: finalReward, depthPenalty };
        } catch (error) {
            logger.error('파생 보상 제공 오류:', error);
            throw error;
        }
    }

    // ========================================
    // 6. 프리미엄 기능 접근 시스템
    // ========================================

    /**
     * 포인트 기반 프리미엄 기능 잠금 해제
     */
    async unlockPremiumFeature(userId, featureType, pointCost) {
        try {
            const userPoints = await this.getUserPointBalance(userId);
            
            if (userPoints.total_points < pointCost) {
                return {
                    success: false,
                    message: '포인트가 부족합니다.',
                    requiredPoints: pointCost,
                    currentPoints: userPoints.total_points
                };
            }

            await this.db.query('BEGIN');

            // 포인트 차감
            await this.db.query(`
                INSERT INTO contribution_metrics 
                (user_id, contribution_type, quality_score, impact_score, accumulated_points)
                VALUES ($1, 'premium_unlock', 0, 0, $2)
            `, [userId, -pointCost]);

            // 기능 잠금 해제 기록
            await this.db.query(`
                INSERT INTO premium_feature_unlocks 
                (user_id, feature_type, points_used, unlocked_at, expires_at)
                VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '30 days')
                ON CONFLICT (user_id, feature_type) 
                DO UPDATE SET unlocked_at = NOW(), expires_at = NOW() + INTERVAL '30 days'
            `, [userId, featureType, pointCost]);

            await this.db.query('COMMIT');

            return {
                success: true,
                message: '프리미엄 기능이 잠금 해제되었습니다.',
                remainingPoints: userPoints.total_points - pointCost,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            };

        } catch (error) {
            await this.db.query('ROLLBACK');
            logger.error('프리미엄 기능 잠금 해제 오류:', error);
            throw error;
        }
    }

    /**
     * 사용자의 프리미엄 기능 상태 조회
     */
    async getUserPremiumStatus(userId) {
        try {
            const result = await this.db.query(`
                SELECT 
                    feature_type,
                    unlocked_at,
                    expires_at,
                    (expires_at > NOW()) as is_active
                FROM premium_feature_unlocks 
                WHERE user_id = $1
            `, [userId]);

            return result.rows;
        } catch (error) {
            logger.error('프리미엄 상태 조회 오류:', error);
            throw error;
        }
    }

    // ========================================
    // 7. 가치 교환 분석 및 통계
    // ========================================

    /**
     * 사용자의 가치 교환 히스토리 조회
     */
    async getUserValueExchangeHistory(userId, limit = 50) {
        try {
            const result = await this.db.query(`
                SELECT 
                    contribution_type,
                    quality_score,
                    impact_score,
                    accumulated_points,
                    recorded_at,
                    CASE 
                        WHEN accumulated_points > 0 THEN 'earned'
                        ELSE 'spent'
                    END as transaction_type
                FROM contribution_metrics 
                WHERE user_id = $1
                ORDER BY recorded_at DESC
                LIMIT $2
            `, [userId, limit]);

            return result.rows;
        } catch (error) {
            logger.error('가치 교환 히스토리 조회 오류:', error);
            throw error;
        }
    }

    /**
     * 전체 가치 교환 시스템 효율성 분석
     */
    async analyzeValueExchangeEfficiency(timeframe = 30) {
        try {
            const results = await Promise.all([
                // 포인트 경제 상태
                this.db.query(`
                    SELECT 
                        SUM(CASE WHEN accumulated_points > 0 THEN accumulated_points ELSE 0 END) as total_points_issued,
                        SUM(CASE WHEN accumulated_points < 0 THEN accumulated_points ELSE 0 END) as total_points_spent,
                        COUNT(DISTINCT user_id) as active_participants
                    FROM contribution_metrics 
                    WHERE recorded_at >= NOW() - INTERVAL '${timeframe} days'
                `),
                
                // 기여 유형별 분포
                this.db.query(`
                    SELECT 
                        contribution_type,
                        COUNT(*) as contribution_count,
                        AVG(accumulated_points) as avg_points,
                        SUM(accumulated_points) as total_points
                    FROM contribution_metrics 
                    WHERE recorded_at >= NOW() - INTERVAL '${timeframe} days'
                    GROUP BY contribution_type
                    ORDER BY total_points DESC
                `),
                
                // 프리미엄 기능 사용률
                this.db.query(`
                    SELECT 
                        feature_type,
                        COUNT(*) as unlock_count,
                        AVG(points_used) as avg_points_used
                    FROM premium_feature_unlocks 
                    WHERE unlocked_at >= NOW() - INTERVAL '${timeframe} days'
                    GROUP BY feature_type
                `)
            ]);

            return {
                economyStatus: results[0].rows[0],
                contributionDistribution: results[1].rows,
                premiumUsage: results[2].rows
            };
        } catch (error) {
            logger.error('가치 교환 효율성 분석 오류:', error);
            throw error;
        }
    }

    // ========================================
    // 8. 시즌별 보상 및 이벤트 시스템
    // ========================================

    /**
     * 월간 기여자 순위 및 보너스 지급
     */
    async calculateMonthlyContributorRanking() {
        try {
            const result = await this.db.query(`
                SELECT 
                    user_id,
                    SUM(accumulated_points) as monthly_points,
                    COUNT(*) as contribution_count,
                    AVG(quality_score) as avg_quality,
                    ROW_NUMBER() OVER (ORDER BY SUM(accumulated_points) DESC) as rank
                FROM contribution_metrics 
                WHERE recorded_at >= DATE_TRUNC('month', NOW())
                  AND accumulated_points > 0
                GROUP BY user_id
                HAVING SUM(accumulated_points) > 10
                ORDER BY monthly_points DESC
                LIMIT 50
            `);

            // 상위 기여자들에게 보너스 지급
            const bonusPromises = result.rows.slice(0, 10).map(async (contributor, index) => {
                const bonusPoints = [50, 30, 20, 15, 10, 10, 5, 5, 5, 5][index];
                
                await this.db.query(`
                    INSERT INTO contribution_metrics 
                    (user_id, contribution_type, quality_score, impact_score, accumulated_points)
                    VALUES ($1, 'monthly_ranking_bonus', 1.0, 1.0, $2)
                `, [contributor.user_id, bonusPoints]);

                return { ...contributor, bonusAwarded: bonusPoints };
            });

            const topContributorsWithBonus = await Promise.all(bonusPromises);

            return {
                topContributors: topContributorsWithBonus,
                allRankings: result.rows
            };
        } catch (error) {
            logger.error('월간 기여자 순위 계산 오류:', error);
            throw error;
        }
    }

    // ========================================
    // 9. 유틸리티 메서드
    // ========================================

    /**
     * 포인트 거래 내역 검증
     */
    async validatePointTransaction(userId, transactionAmount) {
        const userPoints = await this.getUserPointBalance(userId);
        
        if (transactionAmount < 0 && Math.abs(transactionAmount) > userPoints.total_points) {
            throw new Error('보유 포인트를 초과하는 거래입니다.');
        }
        
        return true;
    }

    /**
     * 가치 교환 추천사항 생성
     */
    generateValueExchangeRecommendations(userActivity) {
        const recommendations = [];
        
        if (userActivity.daily_free_access_used >= 8) {
            recommendations.push({
                type: 'point_earning',
                message: '오늘의 무료 감상 횟수가 거의 소진되었습니다. 해석을 작성하여 포인트를 획득해보세요!'
            });
        }
        
        if (userActivity.accumulated_points >= 20) {
            recommendations.push({
                type: 'premium_unlock',
                message: '충분한 포인트가 적립되었습니다. 프리미엄 기능을 잠금 해제해보세요!'
            });
        }
        
        if (userActivity.interpretation_count === 0) {
            recommendations.push({
                type: 'first_contribution',
                message: '첫 작품 해석을 작성하고 커뮤니티에 기여해보세요!'
            });
        }
        
        return recommendations;
    }
}

module.exports = ValueExchangeService;