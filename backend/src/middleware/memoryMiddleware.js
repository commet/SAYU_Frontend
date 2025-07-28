/**
 * SAYU Memory Management Middleware
 * Express 미들웨어로서 요청별 메모리 사용량 모니터링 및 최적화
 */

const MemoryOptimizer = require('../utils/memoryOptimizer');

class MemoryMiddleware {
  constructor(options = {}) {
    this.options = {
      // 요청별 메모리 모니터링
      enableRequestMonitoring: options.enableRequestMonitoring !== false,

      // 메모리 임계값 (요청 처리 중)
      requestMemoryLimitMB: options.requestMemoryLimitMB || 100,

      // 느린 요청 감지 (메모리 누수 가능성)
      slowRequestThresholdMs: options.slowRequestThresholdMs || 5000,

      // 대용량 요청 제한
      largeRequestSizeMB: options.largeRequestSizeMB || 50,

      // 동시 요청 수 제한 (메모리 보호)
      maxConcurrentRequests: options.maxConcurrentRequests || 100,

      // 자동 정리 옵션
      enableAutoCleanup: options.enableAutoCleanup !== false,
      cleanupInterval: options.cleanupInterval || 60000, // 1분

      // 로깅
      enableLogging: options.enableLogging !== false
    };

    // 통계 정보
    this.stats = {
      totalRequests: 0,
      activeRequests: 0,
      memoryLeakDetected: 0,
      slowRequests: 0,
      largeRequests: 0,
      cleanupCount: 0
    };

    // 활성 요청 추적
    this.activeRequestsMap = new Map();

    // 메모리 최적화기 인스턴스
    this.memoryOptimizer = new MemoryOptimizer({
      maxMemoryMB: 2048,
      warningThresholdMB: 1536,
      enableAutoCleanup: true,
      enableLogging: this.options.enableLogging
    });

    // 자동 정리 타이머 설정
    if (this.options.enableAutoCleanup) {
      this.setupAutoCleanup();
    }

    this.log('MemoryMiddleware initialized', 'info');
  }

  /**
   * Express 미들웨어 함수
   */
  middleware() {
    return (req, res, next) => {
      const requestId = this.generateRequestId();
      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      // 요청 정보 저장
      const requestInfo = {
        id: requestId,
        method: req.method,
        url: req.url,
        startTime,
        startMemory,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      };

      // 요청 전 검사
      if (!this.preRequestCheck(req, res, requestInfo)) {
        return; // 요청이 거부된 경우
      }

      // 활성 요청 등록
      this.activeRequestsMap.set(requestId, requestInfo);
      this.stats.activeRequests++;
      this.stats.totalRequests++;

      // 요청 크기 체크
      this.checkRequestSize(req, requestInfo);

      // 응답 종료 시 정리
      const originalEnd = res.end;
      res.end = (...args) => {
        this.postRequestCleanup(requestId, requestInfo, startTime, startMemory);
        originalEnd.apply(res, args);
      };

      // 에러 처리
      res.on('error', (error) => {
        this.handleRequestError(requestId, requestInfo, error);
      });

      // 요청 타임아웃 감지
      const timeoutTimer = setTimeout(() => {
        this.handleSlowRequest(requestId, requestInfo);
      }, this.options.slowRequestThresholdMs);

      requestInfo.timeoutTimer = timeoutTimer;

      next();
    };
  }

  /**
   * 요청 전 검사
   */
  preRequestCheck(req, res, requestInfo) {
    // 동시 요청 수 제한 확인
    if (this.stats.activeRequests >= this.options.maxConcurrentRequests) {
      this.log(`Too many concurrent requests: ${this.stats.activeRequests}`, 'warn');

      res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'Too many concurrent requests'
      });

      return false;
    }

    // 현재 메모리 사용량 확인
    const currentMemory = process.memoryUsage();
    const heapUsedMB = Math.round(currentMemory.heapUsed / 1024 / 1024);

    if (heapUsedMB > this.memoryOptimizer.options.warningThresholdMB) {
      this.log(`High memory usage detected: ${heapUsedMB}MB`, 'warn');

      // 메모리 사용량이 높은 경우 일부 요청 거부
      if (heapUsedMB > this.memoryOptimizer.options.maxMemoryMB * 0.9) {
        res.status(503).json({
          error: 'Service temporarily unavailable',
          message: 'High memory usage detected'
        });

        return false;
      }
    }

    return true;
  }

  /**
   * 요청 크기 체크
   */
  checkRequestSize(req, requestInfo) {
    const contentLength = parseInt(req.get('content-length') || '0');
    const requestSizeMB = contentLength / 1024 / 1024;

    if (requestSizeMB > this.options.largeRequestSizeMB) {
      this.log(`Large request detected: ${requestSizeMB.toFixed(2)}MB from ${requestInfo.ip}`, 'warn');
      this.stats.largeRequests++;
      requestInfo.isLargeRequest = true;

      // 대용량 요청을 위한 메모리 사전 정리
      if (this.options.enableAutoCleanup) {
        this.memoryOptimizer.performCleanup('normal');
      }
    }
  }

  /**
   * 느린 요청 처리
   */
  handleSlowRequest(requestId, requestInfo) {
    const duration = Date.now() - requestInfo.startTime;
    this.log(`Slow request detected: ${requestInfo.method} ${requestInfo.url} - ${duration}ms`, 'warn');

    this.stats.slowRequests++;
    requestInfo.isSlowRequest = true;

    // 메모리 누수 가능성 체크
    const currentMemory = process.memoryUsage();
    const memoryIncrease = currentMemory.heapUsed - requestInfo.startMemory.heapUsed;
    const memoryIncreaseMB = Math.round(memoryIncrease / 1024 / 1024);

    if (memoryIncreaseMB > this.options.requestMemoryLimitMB) {
      this.log(`Potential memory leak in request ${requestId}: ${memoryIncreaseMB}MB increase`, 'error');
      this.stats.memoryLeakDetected++;

      // 메모리 누수 감지 시 강제 정리
      this.memoryOptimizer.forceGarbageCollection();
    }
  }

  /**
   * 요청 에러 처리
   */
  handleRequestError(requestId, requestInfo, error) {
    this.log(`Request error ${requestId}: ${error.message}`, 'error');

    // 메모리 관련 에러 체크
    if (error.message.includes('out of memory') || error.code === 'ENOMEM') {
      this.log('Memory error detected in request', 'error');
      this.memoryOptimizer.performEmergencyCleanup();
    }
  }

  /**
   * 요청 후 정리
   */
  postRequestCleanup(requestId, requestInfo, startTime, startMemory) {
    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;

    // 타임아웃 타이머 정리
    if (requestInfo.timeoutTimer) {
      clearTimeout(requestInfo.timeoutTimer);
    }

    // 메모리 사용량 계산
    const memoryDiff = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external
    };

    const memoryIncreaseMB = Math.round(memoryDiff.heapUsed / 1024 / 1024);

    // 요청 통계 업데이트
    this.updateRequestStats(requestInfo, duration, memoryIncreaseMB);

    // 활성 요청에서 제거
    this.activeRequestsMap.delete(requestId);
    this.stats.activeRequests--;

    // 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development' && this.options.enableLogging) {
      this.logRequestDetails(requestInfo, duration, memoryIncreaseMB);
    }

    // 메모리 누수 체크
    if (memoryIncreaseMB > this.options.requestMemoryLimitMB) {
      this.handlePotentialMemoryLeak(requestId, requestInfo, memoryIncreaseMB);
    }

    // 주기적 정리 (100번째 요청마다)
    if (this.stats.totalRequests % 100 === 0) {
      this.performPeriodicCleanup();
    }
  }

  /**
   * 요청 통계 업데이트
   */
  updateRequestStats(requestInfo, duration, memoryIncrease) {
    // 통계 정보는 메모리에 누적되지 않도록 제한
    if (!this.requestStats) {
      this.requestStats = {
        avgDuration: 0,
        avgMemoryIncrease: 0,
        count: 0
      };
    }

    // 이동 평균 계산
    this.requestStats.count++;
    this.requestStats.avgDuration =
      (this.requestStats.avgDuration * (this.requestStats.count - 1) + duration) / this.requestStats.count;
    this.requestStats.avgMemoryIncrease =
      (this.requestStats.avgMemoryIncrease * (this.requestStats.count - 1) + memoryIncrease) / this.requestStats.count;

    // 통계 크기 제한 (메모리 누수 방지)
    if (this.requestStats.count > 1000) {
      this.requestStats.count = 500; // 절반으로 리셋
    }
  }

  /**
   * 요청 세부사항 로깅
   */
  logRequestDetails(requestInfo, duration, memoryIncrease) {
    const logLevel = memoryIncrease > 10 ? 'warn' : 'debug';

    this.log(
      `Request ${requestInfo.id}: ${requestInfo.method} ${requestInfo.url} ` +
      `- Duration: ${duration}ms, Memory: ${memoryIncrease}MB`,
      logLevel
    );
  }

  /**
   * 잠재적 메모리 누수 처리
   */
  handlePotentialMemoryLeak(requestId, requestInfo, memoryIncrease) {
    this.log(
      `Potential memory leak detected in ${requestInfo.method} ${requestInfo.url}: ${memoryIncrease}MB`,
      'error'
    );

    this.stats.memoryLeakDetected++;

    // 메모리 누수 패턴 분석
    const leakPattern = this.analyzeMemoryLeakPattern(requestInfo);

    if (leakPattern.isLeak) {
      this.log(`Memory leak pattern confirmed: ${leakPattern.reason}`, 'error');

      // 강제 가비지 컬렉션
      this.memoryOptimizer.forceGarbageCollection();

      // 누수 알림
      this.memoryOptimizer.emit('memory:leak', {
        requestId,
        requestInfo,
        memoryIncrease,
        pattern: leakPattern
      });
    }
  }

  /**
   * 메모리 누수 패턴 분석
   */
  analyzeMemoryLeakPattern(requestInfo) {
    // 단순한 패턴 분석 (실제로는 더 복잡한 분석 필요)
    const reasons = [];

    // 대용량 요청
    if (requestInfo.isLargeRequest) {
      reasons.push('Large request body');
    }

    // 느린 요청
    if (requestInfo.isSlowRequest) {
      reasons.push('Slow request processing');
    }

    // 특정 경로 패턴
    const leakyPaths = ['/api/upload', '/api/process-image', '/api/export'];
    if (leakyPaths.some(path => requestInfo.url.includes(path))) {
      reasons.push('Known memory-intensive endpoint');
    }

    return {
      isLeak: reasons.length > 1,
      reason: reasons.join(', '),
      confidence: reasons.length * 0.3
    };
  }

  /**
   * 주기적 정리
   */
  performPeriodicCleanup() {
    this.log('Performing periodic cleanup', 'debug');

    try {
      // 오래된 요청 정보 정리
      this.cleanupOldRequests();

      // 통계 정리
      this.cleanupStats();

      // 메모리 최적화기 정리 실행
      if (this.options.enableAutoCleanup) {
        this.memoryOptimizer.performCleanup('normal');
      }

      this.stats.cleanupCount++;

    } catch (error) {
      this.log(`Periodic cleanup failed: ${error.message}`, 'error');
    }
  }

  /**
   * 오래된 요청 정보 정리
   */
  cleanupOldRequests() {
    const now = Date.now();
    const maxAge = 300000; // 5분

    let cleanedCount = 0;

    for (const [requestId, requestInfo] of this.activeRequestsMap.entries()) {
      if (now - requestInfo.startTime > maxAge) {
        // 타임아웃 타이머 정리
        if (requestInfo.timeoutTimer) {
          clearTimeout(requestInfo.timeoutTimer);
        }

        this.activeRequestsMap.delete(requestId);
        this.stats.activeRequests--;
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.log(`Cleaned up ${cleanedCount} old requests`, 'debug');
    }
  }

  /**
   * 통계 정리
   */
  cleanupStats() {
    // 통계가 너무 커지면 리셋
    if (this.stats.totalRequests > 100000) {
      this.stats.totalRequests = 50000;
      this.stats.slowRequests = Math.floor(this.stats.slowRequests / 2);
      this.stats.largeRequests = Math.floor(this.stats.largeRequests / 2);
      this.stats.memoryLeakDetected = Math.floor(this.stats.memoryLeakDetected / 2);

      this.log('Statistics reset to prevent memory growth', 'debug');
    }
  }

  /**
   * 자동 정리 설정
   */
  setupAutoCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.performPeriodicCleanup();
    }, this.options.cleanupInterval);

    this.log(`Auto cleanup scheduled every ${this.options.cleanupInterval / 1000}s`, 'debug');
  }

  /**
   * 통계 정보 반환
   */
  getStats() {
    const memoryUsage = process.memoryUsage();

    return {
      requests: this.stats,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      activeRequests: this.activeRequestsMap.size,
      uptime: Math.round(process.uptime()),
      averages: this.requestStats || null
    };
  }

  /**
   * 요청 ID 생성
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 정리
   */
  cleanup() {
    this.log('Cleaning up memory middleware', 'info');

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // 모든 활성 요청의 타이머 정리
    for (const [requestId, requestInfo] of this.activeRequestsMap.entries()) {
      if (requestInfo.timeoutTimer) {
        clearTimeout(requestInfo.timeoutTimer);
      }
    }

    this.activeRequestsMap.clear();

    if (this.memoryOptimizer) {
      this.memoryOptimizer.cleanup();
    }
  }

  /**
   * 로깅
   */
  log(message, level = 'info') {
    if (!this.options.enableLogging) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [MemoryMiddleware] [${level.toUpperCase()}] ${message}`;

    if (console[level]) {
      console[level](logMessage);
    } else {
      console.log(logMessage);
    }
  }
}

// 싱글톤 인스턴스
let instance = null;

/**
 * 메모리 미들웨어 팩토리 함수
 */
function createMemoryMiddleware(options = {}) {
  if (!instance) {
    instance = new MemoryMiddleware(options);
  }
  return instance;
}

/**
 * Express 미들웨어 함수 반환
 */
function memoryMiddleware(options = {}) {
  const middleware = createMemoryMiddleware(options);
  return middleware.middleware();
}

/**
 * 통계 정보 조회 미들웨어
 */
function memoryStatsMiddleware() {
  return (req, res) => {
    if (!instance) {
      return res.status(404).json({ error: 'Memory middleware not initialized' });
    }

    const stats = instance.getStats();
    res.json(stats);
  };
}

module.exports = {
  memoryMiddleware,
  memoryStatsMiddleware,
  createMemoryMiddleware,
  MemoryMiddleware
};
