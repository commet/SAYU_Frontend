const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

/**
 * 성능 모니터링 및 최적화 시스템
 * 크롤링 프로세스의 실시간 모니터링과 자동 최적화
 */
class PerformanceMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      metricsInterval: options.metricsInterval || 5000, // 5초마다 메트릭 수집
      alertThresholds: {
        memoryUsage: options.maxMemory || 1024 * 1024 * 1024, // 1GB
        errorRate: options.maxErrorRate || 0.1, // 10%
        responseTime: options.maxResponseTime || 5000, // 5초
        queueSize: options.maxQueueSize || 1000
      },
      autoOptimize: options.autoOptimize !== false
    };
    
    this.metrics = {
      startTime: Date.now(),
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        inProgress: 0
      },
      performance: {
        avgResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        responseTimes: []
      },
      resources: {
        memoryUsage: 0,
        cpuUsage: 0,
        activeConnections: 0
      },
      errors: {
        byType: {},
        recent: []
      },
      throughput: {
        itemsPerSecond: 0,
        bytesPerSecond: 0,
        totalBytes: 0
      }
    };
    
    this.optimization = {
      concurrencyLevel: 3,
      requestDelay: 2500,
      retryAttempts: 3,
      adaptiveSettings: {
        enabled: true,
        lastAdjustment: Date.now()
      }
    };
    
    this.history = [];
    this.alerts = [];
  }

  /**
   * 모니터링 시작
   */
  start() {
    console.log('🔍 Performance monitoring started');
    
    // 주기적 메트릭 수집
    this.metricsTimer = setInterval(() => {
      this.collectMetrics();
      this.analyzePerformance();
      
      if (this.config.autoOptimize) {
        this.optimizeSettings();
      }
    }, this.config.metricsInterval);
    
    // 프로세스 메트릭 모니터링
    this.monitorProcess();
    
    return this;
  }

  /**
   * 모니터링 중지
   */
  stop() {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }
    
    this.saveReport();
    console.log('🛑 Performance monitoring stopped');
  }

  /**
   * 요청 시작 기록
   */
  recordRequestStart(requestId, url) {
    this.metrics.requests.total++;
    this.metrics.requests.inProgress++;
    
    return {
      id: requestId,
      url: url,
      startTime: Date.now()
    };
  }

  /**
   * 요청 완료 기록
   */
  recordRequestComplete(request, success = true, bytesReceived = 0) {
    const duration = Date.now() - request.startTime;
    
    this.metrics.requests.inProgress--;
    
    if (success) {
      this.metrics.requests.successful++;
      this.metrics.throughput.totalBytes += bytesReceived;
    } else {
      this.metrics.requests.failed++;
    }
    
    // 응답 시간 기록
    this.metrics.performance.responseTimes.push(duration);
    if (this.metrics.performance.responseTimes.length > 100) {
      this.metrics.performance.responseTimes.shift();
    }
    
    this.metrics.performance.minResponseTime = Math.min(
      this.metrics.performance.minResponseTime,
      duration
    );
    this.metrics.performance.maxResponseTime = Math.max(
      this.metrics.performance.maxResponseTime,
      duration
    );
    
    // 평균 계산
    this.calculateAverages();
    
    // 임계값 체크
    if (duration > this.config.alertThresholds.responseTime) {
      this.raiseAlert('SLOW_RESPONSE', {
        url: request.url,
        duration: duration,
        threshold: this.config.alertThresholds.responseTime
      });
    }
  }

  /**
   * 오류 기록
   */
  recordError(error, context = {}) {
    const errorType = error.code || error.name || 'UNKNOWN';
    
    this.metrics.errors.byType[errorType] = 
      (this.metrics.errors.byType[errorType] || 0) + 1;
    
    this.metrics.errors.recent.push({
      timestamp: Date.now(),
      type: errorType,
      message: error.message,
      context: context
    });
    
    // 최근 100개만 유지
    if (this.metrics.errors.recent.length > 100) {
      this.metrics.errors.recent.shift();
    }
    
    // 오류율 체크
    const errorRate = this.metrics.requests.failed / this.metrics.requests.total;
    if (errorRate > this.config.alertThresholds.errorRate) {
      this.raiseAlert('HIGH_ERROR_RATE', {
        errorRate: errorRate,
        threshold: this.config.alertThresholds.errorRate
      });
    }
  }

  /**
   * 메트릭 수집
   */
  collectMetrics() {
    const now = Date.now();
    const uptime = now - this.metrics.startTime;
    
    // 처리량 계산
    this.metrics.throughput.itemsPerSecond = 
      this.metrics.requests.successful / (uptime / 1000);
    this.metrics.throughput.bytesPerSecond = 
      this.metrics.throughput.totalBytes / (uptime / 1000);
    
    // 리소스 사용량
    const memUsage = process.memoryUsage();
    this.metrics.resources.memoryUsage = memUsage.heapUsed;
    this.metrics.resources.cpuUsage = process.cpuUsage().user / 1000000;
    
    // 스냅샷 저장
    this.history.push({
      timestamp: now,
      snapshot: JSON.parse(JSON.stringify(this.metrics))
    });
    
    // 1시간 이상 된 기록 삭제
    const oneHourAgo = now - 3600000;
    this.history = this.history.filter(h => h.timestamp > oneHourAgo);
  }

  /**
   * 성능 분석
   */
  analyzePerformance() {
    const metrics = this.metrics;
    const analysis = {
      health: 'good',
      issues: [],
      recommendations: []
    };
    
    // 메모리 사용량 체크
    if (metrics.resources.memoryUsage > this.config.alertThresholds.memoryUsage) {
      analysis.health = 'critical';
      analysis.issues.push('High memory usage');
      analysis.recommendations.push('Reduce concurrency level');
    }
    
    // 오류율 체크
    const errorRate = metrics.requests.failed / metrics.requests.total;
    if (errorRate > 0.05 && errorRate <= this.config.alertThresholds.errorRate) {
      analysis.health = 'warning';
      analysis.issues.push('Elevated error rate');
      analysis.recommendations.push('Increase request delay');
    }
    
    // 응답 시간 체크
    if (metrics.performance.avgResponseTime > 3000) {
      analysis.health = analysis.health === 'good' ? 'warning' : analysis.health;
      analysis.issues.push('Slow response times');
      analysis.recommendations.push('Check network conditions');
    }
    
    // 큐 크기 체크
    if (metrics.requests.inProgress > this.config.alertThresholds.queueSize * 0.8) {
      analysis.issues.push('Queue near capacity');
      analysis.recommendations.push('Reduce crawling speed');
    }
    
    this.emit('analysis', analysis);
    return analysis;
  }

  /**
   * 자동 최적화
   */
  optimizeSettings() {
    const now = Date.now();
    const timeSinceLastAdjustment = now - this.optimization.adaptiveSettings.lastAdjustment;
    
    // 30초마다 최적화
    if (timeSinceLastAdjustment < 30000) return;
    
    const errorRate = this.metrics.requests.failed / this.metrics.requests.total;
    const avgResponseTime = this.metrics.performance.avgResponseTime;
    const memoryUsage = this.metrics.resources.memoryUsage;
    
    let adjusted = false;
    
    // 오류율이 높으면 속도 감소
    if (errorRate > 0.05) {
      this.optimization.requestDelay = Math.min(
        this.optimization.requestDelay * 1.2,
        10000
      );
      this.optimization.concurrencyLevel = Math.max(
        this.optimization.concurrencyLevel - 1,
        1
      );
      adjusted = true;
      console.log('⚠️ Reducing speed due to high error rate');
    }
    
    // 메모리 사용량이 높으면 동시성 감소
    if (memoryUsage > this.config.alertThresholds.memoryUsage * 0.8) {
      this.optimization.concurrencyLevel = Math.max(
        this.optimization.concurrencyLevel - 1,
        1
      );
      adjusted = true;
      console.log('⚠️ Reducing concurrency due to high memory usage');
    }
    
    // 성능이 좋으면 속도 증가
    if (errorRate < 0.01 && avgResponseTime < 1000 && memoryUsage < this.config.alertThresholds.memoryUsage * 0.5) {
      this.optimization.requestDelay = Math.max(
        this.optimization.requestDelay * 0.9,
        1000
      );
      this.optimization.concurrencyLevel = Math.min(
        this.optimization.concurrencyLevel + 1,
        10
      );
      adjusted = true;
      console.log('✅ Increasing speed due to good performance');
    }
    
    if (adjusted) {
      this.optimization.adaptiveSettings.lastAdjustment = now;
      this.emit('optimization', this.optimization);
    }
  }

  /**
   * 알림 발생
   */
  raiseAlert(type, details) {
    const alert = {
      type: type,
      timestamp: Date.now(),
      details: details,
      resolved: false
    };
    
    this.alerts.push(alert);
    this.emit('alert', alert);
    
    console.warn(`🚨 Alert: ${type}`, details);
    
    // 최근 100개 알림만 유지
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
  }

  /**
   * 프로세스 모니터링
   */
  monitorProcess() {
    // 처리되지 않은 Promise rejection
    process.on('unhandledRejection', (reason, promise) => {
      this.recordError(new Error(`Unhandled Rejection: ${reason}`), {
        type: 'unhandledRejection'
      });
    });
    
    // 처리되지 않은 예외
    process.on('uncaughtException', (error) => {
      this.recordError(error, {
        type: 'uncaughtException'
      });
    });
    
    // 메모리 경고
    const memoryWatcher = setInterval(() => {
      const usage = process.memoryUsage();
      if (usage.heapUsed > this.config.alertThresholds.memoryUsage) {
        this.raiseAlert('MEMORY_LIMIT', {
          current: usage.heapUsed,
          limit: this.config.alertThresholds.memoryUsage
        });
      }
    }, 10000);
  }

  /**
   * 평균 계산
   */
  calculateAverages() {
    const times = this.metrics.performance.responseTimes;
    if (times.length === 0) return;
    
    this.metrics.performance.avgResponseTime = 
      times.reduce((sum, t) => sum + t, 0) / times.length;
  }

  /**
   * 현재 상태 가져오기
   */
  getStatus() {
    const uptime = Date.now() - this.metrics.startTime;
    const errorRate = this.metrics.requests.total > 0 
      ? this.metrics.requests.failed / this.metrics.requests.total 
      : 0;
    
    return {
      uptime: uptime,
      health: this.getHealthStatus(),
      requests: this.metrics.requests,
      performance: {
        avgResponseTime: Math.round(this.metrics.performance.avgResponseTime),
        throughput: Math.round(this.metrics.throughput.itemsPerSecond * 100) / 100,
        errorRate: Math.round(errorRate * 10000) / 100 // 백분율
      },
      resources: {
        memoryUsageMB: Math.round(this.metrics.resources.memoryUsage / 1024 / 1024),
        cpuUsagePercent: Math.round(this.metrics.resources.cpuUsage)
      },
      optimization: this.optimization,
      recentAlerts: this.alerts.slice(-5)
    };
  }

  /**
   * 건강 상태 결정
   */
  getHealthStatus() {
    const errorRate = this.metrics.requests.failed / this.metrics.requests.total;
    const memoryPercent = this.metrics.resources.memoryUsage / this.config.alertThresholds.memoryUsage;
    
    if (errorRate > this.config.alertThresholds.errorRate || memoryPercent > 0.9) {
      return 'critical';
    } else if (errorRate > 0.05 || memoryPercent > 0.7) {
      return 'warning';
    }
    return 'healthy';
  }

  /**
   * 보고서 생성
   */
  async generateReport() {
    const status = this.getStatus();
    const uptime = Date.now() - this.metrics.startTime;
    
    const report = {
      summary: {
        startTime: new Date(this.metrics.startTime).toISOString(),
        duration: Math.round(uptime / 1000) + ' seconds',
        totalRequests: this.metrics.requests.total,
        successRate: Math.round((this.metrics.requests.successful / this.metrics.requests.total) * 100) + '%',
        avgResponseTime: Math.round(this.metrics.performance.avgResponseTime) + 'ms',
        totalDataTransferred: this.formatBytes(this.metrics.throughput.totalBytes)
      },
      performance: {
        throughput: status.performance.throughput + ' items/sec',
        minResponseTime: this.metrics.performance.minResponseTime + 'ms',
        maxResponseTime: this.metrics.performance.maxResponseTime + 'ms',
        avgResponseTime: status.performance.avgResponseTime + 'ms'
      },
      errors: {
        total: this.metrics.requests.failed,
        rate: status.performance.errorRate + '%',
        byType: this.metrics.errors.byType,
        mostCommon: this.getMostCommonError()
      },
      resources: {
        peakMemoryUsage: this.formatBytes(this.getPeakMemoryUsage()),
        avgCpuUsage: this.getAverageCpuUsage() + '%'
      },
      optimization: {
        adjustmentsMade: this.getOptimizationAdjustments(),
        finalSettings: this.optimization
      },
      alerts: {
        total: this.alerts.length,
        critical: this.alerts.filter(a => a.type.includes('CRITICAL')).length,
        warnings: this.alerts.filter(a => a.type.includes('WARNING')).length
      }
    };
    
    return report;
  }

  /**
   * 보고서 저장
   */
  async saveReport() {
    try {
      const report = await this.generateReport();
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `performance-report-${timestamp}.json`;
      
      await fs.mkdir('./reports', { recursive: true });
      await fs.writeFile(
        path.join('./reports', filename),
        JSON.stringify(report, null, 2)
      );
      
      console.log(`📊 Performance report saved: ${filename}`);
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  }

  // 유틸리티 메서드들
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getMostCommonError() {
    const errors = Object.entries(this.metrics.errors.byType);
    if (errors.length === 0) return 'None';
    
    errors.sort((a, b) => b[1] - a[1]);
    return `${errors[0][0]} (${errors[0][1]} times)`;
  }

  getPeakMemoryUsage() {
    return Math.max(...this.history.map(h => h.snapshot.resources.memoryUsage));
  }

  getAverageCpuUsage() {
    const cpuValues = this.history.map(h => h.snapshot.resources.cpuUsage);
    if (cpuValues.length === 0) return 0;
    return Math.round(cpuValues.reduce((sum, v) => sum + v, 0) / cpuValues.length);
  }

  getOptimizationAdjustments() {
    // 실제로는 조정 기록을 추적해야 함
    return 'Dynamic adjustments based on performance';
  }
}

module.exports = PerformanceMonitor;