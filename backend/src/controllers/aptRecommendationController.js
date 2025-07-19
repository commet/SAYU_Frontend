// APT Recommendation Controller - APT 기반 추천 엔드포인트
const APTCacheService = require('../services/aptCacheService');
const APTVectorSystem = require('../models/aptVectorSystem');
const { SAYU_TYPES } = require('../../../shared/SAYUTypeDefinitions');
const aptDataAccess = require('../models/aptDataAccess');

class APTRecommendationController {
  constructor() {
    this.cacheService = new APTCacheService();
    this.vectorSystem = new APTVectorSystem();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.cacheService.initialize();
      this.initialized = true;
    }
  }

  // ==================== 작품 추천 ====================
  
  async getArtworkRecommendations(req, res) {
    try {
      await this.initialize();
      
      const { userId } = req;
      const {
        aptType,
        limit = 20,
        offset = 0,
        context = 'general', // general, trending, seasonal, new
        forceRefresh = false
      } = req.query;

      // APT 타입 결정 (직접 지정 또는 사용자 프로필에서)
      let targetAPT = aptType;
      if (!targetAPT && userId) {
        const userProfile = await this.getUserProfile(userId);
        targetAPT = userProfile.aptType;
      }

      if (!targetAPT || !SAYU_TYPES[targetAPT]) {
        return res.status(400).json({
          error: 'Valid APT type required',
          validTypes: Object.keys(SAYU_TYPES)
        });
      }

      // 캐시된 추천 가져오기
      const recommendations = await this.cacheService.getArtworkRecommendations(
        targetAPT,
        {
          limit: parseInt(limit),
          offset: parseInt(offset),
          context,
          forceRefresh: forceRefresh === 'true'
        }
      );

      // 사용자별 개인화 (로그인한 경우)
      let personalizedRecommendations = recommendations;
      if (userId) {
        personalizedRecommendations = await this.personalizeRecommendations(
          userId,
          recommendations,
          targetAPT
        );
      }

      res.json({
        success: true,
        data: {
          aptType: targetAPT,
          aptInfo: SAYU_TYPES[targetAPT],
          context,
          totalCount: personalizedRecommendations.length,
          recommendations: personalizedRecommendations,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: personalizedRecommendations.length === parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Artwork recommendation error:', error);
      res.status(500).json({
        error: 'Failed to get artwork recommendations',
        message: error.message
      });
    }
  }

  // ==================== 전시 추천 ====================
  
  async getExhibitionRecommendations(req, res) {
    try {
      await this.initialize();
      
      const { userId } = req;
      const {
        aptType,
        location = 'seoul',
        dateRange = 'current', // current, upcoming, thisWeek, thisMonth
        limit = 10
      } = req.query;

      let targetAPT = aptType;
      if (!targetAPT && userId) {
        const userProfile = await this.getUserProfile(userId);
        targetAPT = userProfile.aptType;
      }

      if (!targetAPT || !SAYU_TYPES[targetAPT]) {
        return res.status(400).json({
          error: 'Valid APT type required'
        });
      }

      const exhibitions = await this.cacheService.getExhibitionRecommendations(
        targetAPT,
        { location, dateRange, limit: parseInt(limit) }
      );

      res.json({
        success: true,
        data: {
          aptType: targetAPT,
          location,
          dateRange,
          totalCount: exhibitions.length,
          exhibitions
        }
      });

    } catch (error) {
      console.error('Exhibition recommendation error:', error);
      res.status(500).json({
        error: 'Failed to get exhibition recommendations'
      });
    }
  }

  // ==================== 인기 콘텐츠 ====================
  
  async getTrendingContent(req, res) {
    try {
      await this.initialize();
      
      const { aptType, period = 'daily' } = req.query;

      if (!aptType || !SAYU_TYPES[aptType]) {
        return res.status(400).json({
          error: 'Valid APT type required'
        });
      }

      const trending = await this.cacheService.getTrendingForAPT(aptType, period);

      res.json({
        success: true,
        data: {
          aptType,
          period,
          trending
        }
      });

    } catch (error) {
      console.error('Trending content error:', error);
      res.status(500).json({
        error: 'Failed to get trending content'
      });
    }
  }

  // ==================== APT 매칭 점수 ====================
  
  async getArtworkMatchScore(req, res) {
    try {
      await this.initialize();
      
      const { artworkId } = req.params;
      const { aptType } = req.query;

      if (!aptType || !SAYU_TYPES[aptType]) {
        return res.status(400).json({
          error: 'Valid APT type required'
        });
      }

      // 작품 정보 조회
      const artwork = await this.getArtworkById(artworkId);
      if (!artwork) {
        return res.status(404).json({
          error: 'Artwork not found'
        });
      }

      // APT 벡터와 작품 벡터 비교
      const aptVector = await this.cacheService.getAPTVector(aptType);
      const artworkVector = await this.vectorSystem.createArtworkVector(artwork);
      const similarity = this.vectorSystem.calculateSimilarity(aptVector, artworkVector);

      // 상세 매칭 분석
      const matchAnalysis = this.analyzeMatch(aptType, artwork, similarity);

      res.json({
        success: true,
        data: {
          artworkId,
          aptType,
          matchScore: Math.round(similarity * 100),
          analysis: matchAnalysis
        }
      });

    } catch (error) {
      console.error('Match score error:', error);
      res.status(500).json({
        error: 'Failed to calculate match score'
      });
    }
  }

  // ==================== 사용자 벡터 진화 ====================
  
  async updateUserBehavior(req, res) {
    try {
      await this.initialize();
      
      const { userId } = req;
      const { actions } = req.body;

      if (!actions || !Array.isArray(actions)) {
        return res.status(400).json({
          error: 'Actions array required'
        });
      }

      // 사용자 벡터 업데이트
      const evolvedVector = await this.cacheService.updateUserVector(userId, actions);

      // 가장 가까운 APT 찾기 (참고용)
      const closestAPT = this.vectorSystem.findClosestAPT(evolvedVector);

      res.json({
        success: true,
        data: {
          message: 'User preferences updated',
          evolutionApplied: true,
          currentAPT: (await this.getUserProfile(userId)).aptType,
          closestAPT: closestAPT.type,
          similarity: Math.round(closestAPT.confidence * 100)
        }
      });

    } catch (error) {
      console.error('Update behavior error:', error);
      res.status(500).json({
        error: 'Failed to update user behavior'
      });
    }
  }

  // ==================== 캐시 통계 ====================
  
  async getCacheStatistics(req, res) {
    try {
      await this.initialize();
      
      const stats = await this.cacheService.getCacheStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Cache stats error:', error);
      res.status(500).json({
        error: 'Failed to get cache statistics'
      });
    }
  }

  // ==================== 헬퍼 함수 ====================
  
  async personalizeRecommendations(userId, recommendations, aptType) {
    try {
      // 사용자의 과거 행동 데이터 조회
      const userHistory = await this.getUserHistory(userId);
      
      // 개인화 점수 조정
      return recommendations.map(rec => {
        let personalScore = rec.finalScore;
        
        // 이미 본 작품은 점수 감소
        if (userHistory.viewedArtworks.includes(rec.id)) {
          personalScore -= 20;
        }
        
        // 좋아요한 작가의 작품은 점수 증가
        if (userHistory.likedArtists.includes(rec.artist)) {
          personalScore += 10;
        }
        
        // 비슷한 스타일을 좋아했다면 점수 증가
        const styleMatch = userHistory.likedStyles.some(style => 
          rec.style && rec.style.includes(style)
        );
        if (styleMatch) {
          personalScore += 5;
        }
        
        return {
          ...rec,
          personalScore: Math.max(0, Math.min(100, personalScore)),
          isViewed: userHistory.viewedArtworks.includes(rec.id),
          isLiked: userHistory.likedArtworks.includes(rec.id)
        };
      }).sort((a, b) => b.personalScore - a.personalScore);
      
    } catch (error) {
      console.error('Personalization error:', error);
      return recommendations; // 개인화 실패 시 원본 반환
    }
  }

  analyzeMatch(aptType, artwork, similarity) {
    const analysis = {
      overallMatch: similarity > 0.8 ? 'excellent' : similarity > 0.6 ? 'good' : 'moderate',
      strengths: [],
      considerations: []
    };

    const typeData = SAYU_TYPES[aptType];
    
    // L/S 축 분석
    if (aptType[0] === 'L' && artwork.solitudeScore > 7) {
      analysis.strengths.push('혼자 감상하기 좋은 작품');
    } else if (aptType[0] === 'S' && artwork.discussionPotential > 7) {
      analysis.strengths.push('함께 이야기 나누기 좋은 작품');
    }
    
    // A/R 축 분석
    if (aptType[1] === 'A' && artwork.isAbstract) {
      analysis.strengths.push('추상적 표현이 매력적');
    } else if (aptType[1] === 'R' && !artwork.isAbstract) {
      analysis.strengths.push('구체적이고 명확한 표현');
    }
    
    // E/M 축 분석
    if (aptType[2] === 'E' && artwork.emotionalImpact > 7) {
      analysis.strengths.push('감정적 울림이 깊음');
    } else if (aptType[2] === 'M' && artwork.intellectualStimulation > 7) {
      analysis.strengths.push('지적 호기심을 자극');
    }
    
    // 약점 분석
    if (similarity < 0.6) {
      analysis.considerations.push('평소 선호와는 다른 스타일이지만 새로운 경험이 될 수 있음');
    }
    
    return analysis;
  }

  // DB 접근 함수들
  async getUserProfile(userId) {
    return aptDataAccess.getUserProfile(userId);
  }

  async getUserHistory(userId) {
    return aptDataAccess.getUserHistory(userId);
  }

  async getArtworkById(artworkId) {
    return aptDataAccess.getArtworkById(artworkId);
  }
}

module.exports = new APTRecommendationController();