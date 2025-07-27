// 최적화된 APT 매칭 라우트
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const APTCacheService = require('../services/aptCacheService');
const { getPerformanceMonitor } = require('../services/performanceMonitor');
const { validationResult, param, query } = require('express-validator');

// 서비스 인스턴스
const aptCache = new APTCacheService();
const monitor = getPerformanceMonitor();

// 초기화
(async () => {
  await aptCache.initialize();
})();

// 유효성 검사 미들웨어
const validateAPTType = param('aptType').isIn([
  'LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
  'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'
]);

// 에러 핸들링 래퍼
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 작품 추천 API (최적화됨)
router.get('/recommendations/artworks/:aptType',
  authenticateToken,
  validateAPTType,
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('context').optional().isIn(['general', 'trending', 'new', 'seasonal']),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const startTime = Date.now();
    const { aptType } = req.params;
    const { limit = 20, offset = 0, context = 'general' } = req.query;
    
    try {
      // 성능 모니터링
      const queryStart = Date.now();
      
      const recommendations = await aptCache.getArtworkRecommendations(aptType, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        context,
        userId: req.user.id
      });
      
      // 쿼리 시간 추적
      monitor.trackQuery('artwork_recommendations', queryStart, {
        aptType,
        context,
        limit
      });
      
      // 응답 시간 추적
      const responseTime = Date.now() - startTime;
      
      res.json({
        success: true,
        data: {
          recommendations,
          metadata: {
            aptType,
            context,
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: recommendations.length,
            responseTime: `${responseTime}ms`
          }
        }
      });
    } catch (error) {
      console.error('작품 추천 오류:', error);
      res.status(500).json({
        success: false,
        error: '작품 추천 중 오류가 발생했습니다.'
      });
    }
  })
);

// 전시 추천 API
router.get('/recommendations/exhibitions/:aptType',
  authenticateToken,
  validateAPTType,
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('location').optional().isString(),
  query('dateRange').optional().isIn(['current', 'upcoming', 'thisWeek', 'thisMonth']),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const startTime = Date.now();
    const { aptType } = req.params;
    const { limit = 10, location = 'all', dateRange = 'current' } = req.query;
    
    try {
      const queryStart = Date.now();
      
      const exhibitions = await aptCache.getExhibitionRecommendations(aptType, {
        limit: parseInt(limit),
        location,
        dateRange
      });
      
      monitor.trackQuery('exhibition_recommendations', queryStart, {
        aptType,
        location,
        dateRange
      });
      
      const responseTime = Date.now() - startTime;
      
      res.json({
        success: true,
        data: {
          exhibitions,
          metadata: {
            aptType,
            location,
            dateRange,
            total: exhibitions.length,
            responseTime: `${responseTime}ms`
          }
        }
      });
    } catch (error) {
      console.error('전시 추천 오류:', error);
      res.status(500).json({
        success: false,
        error: '전시 추천 중 오류가 발생했습니다.'
      });
    }
  })
);

// 인기 콘텐츠 API
router.get('/trending/:aptType',
  authenticateToken,
  validateAPTType,
  query('period').optional().isIn(['daily', 'weekly', 'monthly']),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const startTime = Date.now();
    const { aptType } = req.params;
    const { period = 'daily' } = req.query;
    
    try {
      const queryStart = Date.now();
      
      const trending = await aptCache.getTrendingForAPT(aptType, period);
      
      monitor.trackQuery('trending_content', queryStart, {
        aptType,
        period
      });
      
      const responseTime = Date.now() - startTime;
      
      res.json({
        success: true,
        data: {
          trending,
          metadata: {
            aptType,
            period,
            responseTime: `${responseTime}ms`
          }
        }
      });
    } catch (error) {
      console.error('인기 콘텐츠 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: '인기 콘텐츠 조회 중 오류가 발생했습니다.'
      });
    }
  })
);

// 캐시 상태 API (관리자용)
router.get('/cache/stats',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // 관리자 권한 확인
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: '관리자 권한이 필요합니다.'
      });
    }
    
    try {
      const cacheStats = await aptCache.getCacheStats();
      const performanceReport = monitor.generateReport();
      
      res.json({
        success: true,
        data: {
          cache: cacheStats,
          performance: performanceReport
        }
      });
    } catch (error) {
      console.error('캐시 상태 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: '캐시 상태 조회 중 오류가 발생했습니다.'
      });
    }
  })
);

// 캐시 워밍업 API (관리자용)
router.post('/cache/warmup',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: '관리자 권한이 필요합니다.'
      });
    }
    
    try {
      // 백그라운드에서 워밍업 실행
      setImmediate(async () => {
        console.log('🔥 캐시 워밍업 시작...');
        await aptCache.warmupPopularContent();
        console.log('✅ 캐시 워밍업 완료');
      });
      
      res.json({
        success: true,
        message: '캐시 워밍업이 시작되었습니다.'
      });
    } catch (error) {
      console.error('캐시 워밍업 오류:', error);
      res.status(500).json({
        success: false,
        error: '캐시 워밍업 중 오류가 발생했습니다.'
      });
    }
  })
);

// 캐시 무효화 API (관리자용)
router.delete('/cache/:aptType',
  authenticateToken,
  validateAPTType,
  asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: '관리자 권한이 필요합니다.'
      });
    }
    
    const { aptType } = req.params;
    
    try {
      await aptCache.invalidateAPTCache(aptType);
      
      res.json({
        success: true,
        message: `${aptType} 캐시가 무효화되었습니다.`
      });
    } catch (error) {
      console.error('캐시 무효화 오류:', error);
      res.status(500).json({
        success: false,
        error: '캐시 무효화 중 오류가 발생했습니다.'
      });
    }
  })
);

// 사용자 벡터 업데이트 API
router.post('/user/vector/update',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { actions } = req.body;
    
    if (!actions || !Array.isArray(actions)) {
      return res.status(400).json({
        success: false,
        error: 'actions 배열이 필요합니다.'
      });
    }
    
    try {
      const startTime = Date.now();
      
      const updatedVector = await aptCache.updateUserVector(req.user.id, actions);
      
      monitor.trackVectorOperation('user_vector_update', updatedVector.length, startTime);
      
      res.json({
        success: true,
        message: '사용자 벡터가 업데이트되었습니다.',
        data: {
          vectorSize: updatedVector.length,
          processingTime: `${Date.now() - startTime}ms`
        }
      });
    } catch (error) {
      console.error('사용자 벡터 업데이트 오류:', error);
      res.status(500).json({
        success: false,
        error: '사용자 벡터 업데이트 중 오류가 발생했습니다.'
      });
    }
  })
);

// 성능 대시보드 API
router.get('/performance/dashboard',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: '관리자 권한이 필요합니다.'
      });
    }
    
    try {
      const dashboardData = await monitor.getDashboardData();
      
      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('대시보드 데이터 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: '대시보드 데이터 조회 중 오류가 발생했습니다.'
      });
    }
  })
);

// 엔드포인트별 성능 분석 API
router.get('/performance/endpoint/:path',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: '관리자 권한이 필요합니다.'
      });
    }
    
    const { path } = req.params;
    
    try {
      const analysis = monitor.analyzeEndpoint(path);
      
      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: '해당 엔드포인트에 대한 데이터가 없습니다.'
        });
      }
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('엔드포인트 분석 오류:', error);
      res.status(500).json({
        success: false,
        error: '엔드포인트 분석 중 오류가 발생했습니다.'
      });
    }
  })
);

// 헬스체크 API
router.get('/health',
  asyncHandler(async (req, res) => {
    const report = monitor.generateReport();
    const cacheStats = await aptCache.getCacheStats();
    
    const isHealthy = 
      report.summary.avgCpuUsage < 80 &&
      report.summary.avgMemoryUsage < 80 &&
      parseFloat(cacheStats.hitRate?.artwork || 0) > 50;
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date(),
      metrics: {
        cache: {
          hitRate: cacheStats.hitRate,
          totalHits: cacheStats.artwork?.['total:hit'] || 0,
          totalMisses: cacheStats.artwork?.['total:miss'] || 0
        },
        system: {
          cpu: report.summary.avgCpuUsage,
          memory: report.summary.avgMemoryUsage
        },
        api: {
          totalRequests: report.summary.totalRequests,
          avgLatency: Object.values(report.apiEndpoints)
            .reduce((sum, endpoint) => sum + endpoint.avgTime, 0) / 
            Object.keys(report.apiEndpoints).length || 0
        }
      }
    });
  })
);

module.exports = router;