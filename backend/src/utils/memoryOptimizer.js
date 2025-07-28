/**
 * SAYU Memory Optimizer
 * Node.js 메모리 누수 방지 및 최적화 유틸리티
 */

const EventEmitter = require('events');
const { performance } = require('perf_hooks');

class MemoryOptimizer extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      // 메모리 임계값 (MB)
      maxMemoryMB: options.maxMemoryMB || 2048,
      warningThresholdMB: options.warningThresholdMB || 1536,

      // 모니터링 간격
      monitorInterval: options.monitorInterval || 30000, // 30초

      // GC 강제 실행 임계값
      forceGCThresholdMB: options.forceGCThresholdMB || 1800,

      // 메모리 정리 옵션
      enableAutoCleanup: options.enableAutoCleanup !== false,
      enableHeapSnapshot: options.enableHeapSnapshot || false,

      // 로깅
      enableLogging: options.enableLogging !== false,
      logLevel: options.logLevel || 'info'
    };

    // 모니터링 상태
    this.isMonitoring = false;
    this.monitorTimer = null;
    this.lastGCTime = Date.now();
    this.memoryHistory = [];
    this.maxHistorySize = 100;

    // 메모리 정리 캐시
    this.cleanupTasks = new Map();
    this.intervalTasks = new Map();
    this.eventListeners = new Map();

    // 성능 모니터링
    this.performanceMarks = new Map();

    this.log('MemoryOptimizer initialized', 'info');
  }

  /**
   * 메모리 모니터링 시작
   */
  startMonitoring() {
    if (this.isMonitoring) {
      this.log('Memory monitoring already started', 'warn');
      return;
    }

    this.isMonitoring = true;
    this.monitorTimer = setInterval(() => {
      this.checkMemoryUsage();
    }, this.options.monitorInterval);

    // 프로세스 종료 시 정리
    process.on('exit', () => this.cleanup());
    process.on('SIGINT', () => this.gracefulShutdown());
    process.on('SIGTERM', () => this.gracefulShutdown());
    process.on('uncaughtException', (error) => this.handleError('uncaughtException', error));
    process.on('unhandledRejection', (reason, promise) => this.handleError('unhandledRejection', { reason, promise }));

    this.log('Memory monitoring started', 'info');
    this.emit('monitoring:started');
  }

  /**
   * 메모리 사용량 확인
   */
  checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // MB 단위로 변환
    const memoryStats = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024),
      timestamp: Date.now(),
      uptime: Math.round(process.uptime())
    };

    // CPU 사용률 계산
    const cpuPercent = this.calculateCPUUsage(cpuUsage);

    // 히스토리 업데이트
    this.updateMemoryHistory(memoryStats);

    // 메모리 상태 평가
    this.evaluateMemoryStatus(memoryStats);

    // 이벤트 발생
    this.emit('memory:check', { memory: memoryStats, cpu: cpuPercent });

    return { memory: memoryStats, cpu: cpuPercent };
  }

  /**
   * CPU 사용률 계산
   */
  calculateCPUUsage(cpuUsage) {
    if (!this.lastCPUUsage) {
      this.lastCPUUsage = cpuUsage;
      return 0;
    }

    const userDiff = cpuUsage.user - this.lastCPUUsage.user;
    const systemDiff = cpuUsage.system - this.lastCPUUsage.system;
    const totalDiff = userDiff + systemDiff;

    this.lastCPUUsage = cpuUsage;

    // 마이크로초를 퍼센트로 변환
    return Math.round((totalDiff / 1000000) * 100);
  }

  /**
   * 메모리 히스토리 업데이트
   */
  updateMemoryHistory(stats) {
    this.memoryHistory.push(stats);

    // 히스토리 크기 제한
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }
  }

  /**
   * 메모리 상태 평가 및 대응
   */
  evaluateMemoryStatus(stats) {
    const { heapUsed, rss } = stats;

    // 경고 임계값 확인
    if (heapUsed > this.options.warningThresholdMB || rss > this.options.warningThresholdMB) {
      this.log(`Memory warning - Heap: ${heapUsed}MB, RSS: ${rss}MB`, 'warn');
      this.emit('memory:warning', stats);

      if (this.options.enableAutoCleanup) {
        this.performCleanup('warning');
      }
    }

    // 강제 GC 임계값 확인
    if (heapUsed > this.options.forceGCThresholdMB || rss > this.options.forceGCThresholdMB) {
      this.log(`Memory critical - forcing GC - Heap: ${heapUsed}MB, RSS: ${rss}MB`, 'error');
      this.emit('memory:critical', stats);

      this.forceGarbageCollection();

      if (this.options.enableAutoCleanup) {
        this.performCleanup('critical');
      }
    }

    // 최대 메모리 초과 확인
    if (heapUsed > this.options.maxMemoryMB || rss > this.options.maxMemoryMB) {
      this.log(`Memory limit exceeded - Heap: ${heapUsed}MB, RSS: ${rss}MB`, 'error');
      this.emit('memory:limit', stats);

      // 긴급 정리
      this.performEmergencyCleanup();
    }
  }

  /**
   * 가비지 컬렉션 강제 실행
   */
  forceGarbageCollection() {
    const now = Date.now();

    // 마지막 GC 후 최소 시간 경과 확인 (5초)
    if (now - this.lastGCTime < 5000) {
      return false;
    }

    if (global.gc) {
      const beforeGC = process.memoryUsage();

      try {
        global.gc();
        this.lastGCTime = now;

        const afterGC = process.memoryUsage();
        const freed = Math.round((beforeGC.heapUsed - afterGC.heapUsed) / 1024 / 1024);

        this.log(`Garbage collection completed - Freed: ${freed}MB`, 'info');
        this.emit('gc:completed', { before: beforeGC, after: afterGC, freed });

        return true;
      } catch (error) {
        this.log(`Garbage collection failed: ${error.message}`, 'error');
        return false;
      }
    } else {
      this.log('Garbage collection not available (use --expose-gc flag)', 'warn');
      return false;
    }
  }

  /**
   * 메모리 정리 수행
   */
  performCleanup(level = 'normal') {
    this.log(`Performing ${level} memory cleanup`, 'info');

    try {
      // 1. 캐시 정리
      this.cleanupCaches();

      // 2. 이벤트 리스너 정리
      this.cleanupEventListeners();

      // 3. 타이머 정리
      this.cleanupTimers();

      // 4. 큰 객체 해제
      if (level === 'critical' || level === 'emergency') {
        this.cleanupLargeObjects();
      }

      // 5. Node.js 내부 정리
      if (level === 'emergency') {
        this.performEmergencyOperations();
      }

      // 가비지 컬렉션 실행
      this.forceGarbageCollection();

      this.emit('cleanup:completed', { level });

    } catch (error) {
      this.log(`Cleanup failed: ${error.message}`, 'error');
      this.emit('cleanup:failed', { level, error });
    }
  }

  /**
   * 캐시 정리
   */
  cleanupCaches() {
    // Express 캐시 정리
    if (global.app && global.app.cache) {
      global.app.cache.clear();
    }

    // require 캐시 중 일부 정리 (위험하므로 신중하게)
    const modulesToClean = Object.keys(require.cache).filter(module =>
      module.includes('node_modules/lodash') ||
      module.includes('node_modules/moment') ||
      module.includes('temp_')
    );

    modulesToClean.forEach(module => {
      delete require.cache[module];
    });

    this.log(`Cleaned ${modulesToClean.length} cached modules`, 'debug');
  }

  /**
   * 이벤트 리스너 정리
   */
  cleanupEventListeners() {
    // 등록된 이벤트 리스너 정리
    this.eventListeners.forEach((listeners, emitter) => {
      listeners.forEach(({ event, listener }) => {
        try {
          emitter.removeListener(event, listener);
        } catch (error) {
          // 이미 제거된 리스너 무시
        }
      });
    });

    this.eventListeners.clear();
  }

  /**
   * 타이머 정리
   */
  cleanupTimers() {
    // 등록된 타이머 정리
    this.intervalTasks.forEach((timer, name) => {
      clearInterval(timer);
    });
    this.intervalTasks.clear();

    // 정리 작업 수행
    this.cleanupTasks.forEach((task, name) => {
      try {
        if (typeof task === 'function') {
          task();
        }
      } catch (error) {
        this.log(`Cleanup task '${name}' failed: ${error.message}`, 'warn');
      }
    });
  }

  /**
   * 큰 객체 정리
   */
  cleanupLargeObjects() {
    // 전역 변수에서 큰 객체 찾아서 정리
    const globalKeys = Object.keys(global);

    globalKeys.forEach(key => {
      const obj = global[key];

      if (obj && typeof obj === 'object') {
        // 배열이나 객체가 크면 정리
        if (Array.isArray(obj) && obj.length > 1000) {
          obj.length = 0;
          this.log(`Cleared large array: ${key}`, 'debug');
        } else if (obj.constructor === Object && Object.keys(obj).length > 1000) {
          Object.keys(obj).forEach(k => delete obj[k]);
          this.log(`Cleared large object: ${key}`, 'debug');
        }
      }
    });
  }

  /**
   * 긴급 정리 작업
   */
  performEmergencyCleanup() {
    this.log('Performing emergency cleanup', 'error');

    try {
      // 1. 모든 정리 작업 수행
      this.performCleanup('emergency');

      // 2. 연결된 소켓 정리
      if (global.server && global.server.connections) {
        global.server.connections.forEach(socket => {
          if (!socket.destroyed) {
            socket.destroy();
          }
        });
      }

      // 3. 데이터베이스 연결 정리
      if (global.db && typeof global.db.end === 'function') {
        global.db.end();
      }

      // 4. Redis 연결 정리
      if (global.redis && typeof global.redis.disconnect === 'function') {
        global.redis.disconnect();
      }

      // 5. 마지막 수단: 프로세스 재시작 권고
      this.emit('memory:emergency', {
        message: 'Emergency cleanup completed. Consider restarting the process.',
        memoryUsage: process.memoryUsage()
      });

    } catch (error) {
      this.log(`Emergency cleanup failed: ${error.message}`, 'error');

      // 복구 불가능한 상황
      this.emit('memory:fatal', {
        message: 'Fatal memory error. Process restart required.',
        error: error.message
      });
    }
  }

  /**
   * 긴급 작업 수행
   */
  performEmergencyOperations() {
    // Buffer 풀 정리
    if (Buffer.poolSize) {
      Buffer.poolSize = 8192; // 기본값으로 리셋
    }

    // UV 스레드 풀 최적화
    process.env.UV_THREADPOOL_SIZE = '4';

    // V8 플래그 동적 조정
    if (global.gc) {
      // 더 적극적인 GC 설정
      process.nextTick(() => {
        global.gc();
        global.gc();
      });
    }
  }

  /**
   * 정리 작업 등록
   */
  registerCleanupTask(name, task) {
    this.cleanupTasks.set(name, task);
  }

  /**
   * 이벤트 리스너 등록 (자동 정리용)
   */
  registerEventListener(emitter, event, listener) {
    if (!this.eventListeners.has(emitter)) {
      this.eventListeners.set(emitter, []);
    }

    this.eventListeners.get(emitter).push({ event, listener });
    emitter.on(event, listener);
  }

  /**
   * 인터벌 등록 (자동 정리용)
   */
  registerInterval(name, callback, interval) {
    const timer = setInterval(callback, interval);
    this.intervalTasks.set(name, timer);
    return timer;
  }

  /**
   * 성능 측정 시작
   */
  startPerformanceMark(name) {
    this.performanceMarks.set(name, performance.now());
  }

  /**
   * 성능 측정 종료
   */
  endPerformanceMark(name) {
    const startTime = this.performanceMarks.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceMarks.delete(name);
      return duration;
    }
    return null;
  }

  /**
   * 메모리 보고서 생성
   */
  generateMemoryReport() {
    const currentMemory = process.memoryUsage();
    const uptime = process.uptime();

    // 메모리 트렌드 분석
    const recentHistory = this.memoryHistory.slice(-10);
    const memoryTrend = this.calculateMemoryTrend(recentHistory);

    return {
      current: {
        rss: Math.round(currentMemory.rss / 1024 / 1024),
        heapUsed: Math.round(currentMemory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(currentMemory.heapTotal / 1024 / 1024),
        external: Math.round(currentMemory.external / 1024 / 1024),
        arrayBuffers: Math.round(currentMemory.arrayBuffers / 1024 / 1024)
      },
      trend: memoryTrend,
      uptime: Math.round(uptime),
      gcCount: this.gcCount || 0,
      lastGC: new Date(this.lastGCTime).toISOString(),
      thresholds: {
        warning: this.options.warningThresholdMB,
        critical: this.options.forceGCThresholdMB,
        maximum: this.options.maxMemoryMB
      },
      history: recentHistory
    };
  }

  /**
   * 메모리 트렌드 계산
   */
  calculateMemoryTrend(history) {
    if (history.length < 2) return 'stable';

    const recent = history.slice(-3);
    const older = history.slice(-6, -3);

    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, stat) => sum + stat.heapUsed, 0) / recent.length;
    const olderAvg = older.reduce((sum, stat) => sum + stat.heapUsed, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * 에러 처리
   */
  handleError(type, error) {
    this.log(`${type}: ${error.message || error}`, 'error');
    this.emit('error', { type, error });

    // 메모리 관련 에러인 경우 정리 수행
    if (error.message && error.message.includes('out of memory')) {
      this.performEmergencyCleanup();
    }
  }

  /**
   * 정상 종료
   */
  gracefulShutdown() {
    this.log('Graceful shutdown initiated', 'info');

    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
    }

    this.cleanup();

    setTimeout(() => {
      process.exit(0);
    }, 5000);
  }

  /**
   * 정리 작업
   */
  cleanup() {
    this.log('Cleaning up memory optimizer', 'info');

    this.isMonitoring = false;

    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
    }

    this.cleanupEventListeners();
    this.cleanupTimers();

    this.emit('cleanup:final');
  }

  /**
   * 로깅
   */
  log(message, level = 'info') {
    if (!this.options.enableLogging) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [MemoryOptimizer] [${level.toUpperCase()}] ${message}`;

    if (console[level]) {
      console[level](logMessage);
    } else {
      console.log(logMessage);
    }
  }
}

module.exports = MemoryOptimizer;
