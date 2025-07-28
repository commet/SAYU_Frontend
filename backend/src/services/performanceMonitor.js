// 성능 모니터링 서비스
const { getRedisClient } = require('../config/redis');
const os = require('os');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: new Map(),
      dbQueries: new Map(),
      cacheHits: 0,
      cacheMisses: 0,
      vectorOperations: new Map(),
      memoryUsage: [],
      cpuUsage: []
    };

    this.thresholds = {
      apiLatency: 200,      // ms
      dbQueryTime: 100,     // ms
      vectorOperation: 50,  // ms
      memoryUsage: 80,      // %
      cpuUsage: 70         // %
    };

    // 주기적 모니터링 시작
    this.startMonitoring();
  }

  // API 요청 추적
  trackRequest(endpoint, startTime) {
    const duration = Date.now() - startTime;

    if (!this.metrics.requests.has(endpoint)) {
      this.metrics.requests.set(endpoint, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        maxTime: 0,
        p95: [],
        p99: []
      });
    }

    const stats = this.metrics.requests.get(endpoint);
    stats.count++;
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;
    stats.maxTime = Math.max(stats.maxTime, duration);

    // Percentile 계산을 위한 샘플 저장 (최근 1000개)
    stats.p95.push(duration);
    stats.p99.push(duration);
    if (stats.p95.length > 1000) {
      stats.p95.shift();
      stats.p99.shift();
    }

    // 임계값 초과 시 경고
    if (duration > this.thresholds.apiLatency) {
      console.warn(`⚠️ API 지연: ${endpoint} - ${duration}ms`);
      this.sendAlert('api_latency', { endpoint, duration });
    }

    return duration;
  }

  // DB 쿼리 추적
  trackQuery(queryType, startTime, queryInfo = {}) {
    const duration = Date.now() - startTime;

    if (!this.metrics.dbQueries.has(queryType)) {
      this.metrics.dbQueries.set(queryType, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        maxTime: 0,
        slowQueries: []
      });
    }

    const stats = this.metrics.dbQueries.get(queryType);
    stats.count++;
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;
    stats.maxTime = Math.max(stats.maxTime, duration);

    // 느린 쿼리 기록
    if (duration > this.thresholds.dbQueryTime) {
      stats.slowQueries.push({
        duration,
        timestamp: new Date(),
        ...queryInfo
      });

      // 최근 100개만 유지
      if (stats.slowQueries.length > 100) {
        stats.slowQueries.shift();
      }

      console.warn(`🐌 느린 쿼리: ${queryType} - ${duration}ms`);
    }

    return duration;
  }

  // 벡터 연산 추적
  trackVectorOperation(operationType, vectorSize, startTime) {
    const duration = Date.now() - startTime;
    const key = `${operationType}_${vectorSize}`;

    if (!this.metrics.vectorOperations.has(key)) {
      this.metrics.vectorOperations.set(key, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        maxTime: 0
      });
    }

    const stats = this.metrics.vectorOperations.get(key);
    stats.count++;
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;
    stats.maxTime = Math.max(stats.maxTime, duration);

    if (duration > this.thresholds.vectorOperation) {
      console.warn(`🔢 느린 벡터 연산: ${operationType} (${vectorSize}차원) - ${duration}ms`);
    }

    return duration;
  }

  // 캐시 히트/미스 추적
  trackCacheHit() {
    this.metrics.cacheHits++;
  }

  trackCacheMiss() {
    this.metrics.cacheMisses++;
  }

  // 시스템 리소스 모니터링
  async monitorSystemResources() {
    // CPU 사용률
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const cpuUsage = 100 - ~~(100 * totalIdle / totalTick);
    this.metrics.cpuUsage.push({
      timestamp: new Date(),
      usage: cpuUsage
    });

    // 메모리 사용률
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;

    this.metrics.memoryUsage.push({
      timestamp: new Date(),
      usage: memUsage,
      total: totalMem,
      free: freeMem
    });

    // 최근 60개 데이터만 유지 (1시간)
    if (this.metrics.cpuUsage.length > 60) {
      this.metrics.cpuUsage.shift();
    }
    if (this.metrics.memoryUsage.length > 60) {
      this.metrics.memoryUsage.shift();
    }

    // 임계값 확인
    if (cpuUsage > this.thresholds.cpuUsage) {
      console.warn(`🔥 높은 CPU 사용률: ${cpuUsage}%`);
      this.sendAlert('high_cpu', { usage: cpuUsage });
    }

    if (memUsage > this.thresholds.memoryUsage) {
      console.warn(`💾 높은 메모리 사용률: ${memUsage.toFixed(2)}%`);
      this.sendAlert('high_memory', { usage: memUsage });
    }
  }

  // 성능 리포트 생성
  generateReport() {
    const cacheHitRate = this.metrics.cacheHits /
      (this.metrics.cacheHits + this.metrics.cacheMisses) || 0;

    // API 엔드포인트별 통계
    const apiStats = {};
    this.metrics.requests.forEach((stats, endpoint) => {
      const sorted = [...stats.p95].sort((a, b) => a - b);
      apiStats[endpoint] = {
        count: stats.count,
        avgTime: Math.round(stats.avgTime),
        maxTime: stats.maxTime,
        p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
        p99: sorted[Math.floor(sorted.length * 0.99)] || 0
      };
    });

    // DB 쿼리 통계
    const dbStats = {};
    this.metrics.dbQueries.forEach((stats, queryType) => {
      dbStats[queryType] = {
        count: stats.count,
        avgTime: Math.round(stats.avgTime),
        maxTime: stats.maxTime,
        slowCount: stats.slowQueries.length
      };
    });

    // 벡터 연산 통계
    const vectorStats = {};
    this.metrics.vectorOperations.forEach((stats, operation) => {
      vectorStats[operation] = {
        count: stats.count,
        avgTime: Math.round(stats.avgTime),
        maxTime: stats.maxTime
      };
    });

    // 시스템 리소스 평균
    const avgCpu = this.metrics.cpuUsage.reduce((sum, item) =>
      sum + item.usage, 0) / this.metrics.cpuUsage.length || 0;
    const avgMem = this.metrics.memoryUsage.reduce((sum, item) =>
      sum + item.usage, 0) / this.metrics.memoryUsage.length || 0;

    return {
      timestamp: new Date(),
      summary: {
        cacheHitRate: `${(cacheHitRate * 100).toFixed(2)}%`,
        totalRequests: Array.from(this.metrics.requests.values())
          .reduce((sum, stats) => sum + stats.count, 0),
        totalDbQueries: Array.from(this.metrics.dbQueries.values())
          .reduce((sum, stats) => sum + stats.count, 0),
        avgCpuUsage: `${avgCpu.toFixed(2)}%`,
        avgMemoryUsage: `${avgMem.toFixed(2)}%`
      },
      apiEndpoints: apiStats,
      dbQueries: dbStats,
      vectorOperations: vectorStats,
      systemResources: {
        cpu: {
          current: this.metrics.cpuUsage[this.metrics.cpuUsage.length - 1]?.usage || 0,
          average: avgCpu.toFixed(2)
        },
        memory: {
          current: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]?.usage || 0,
          average: avgMem.toFixed(2)
        }
      }
    };
  }

  // Redis에 메트릭 저장
  async saveMetrics() {
    const redis = getRedisClient();
    if (!redis) return;

    try {
      const report = this.generateReport();
      const key = `performance:metrics:${Date.now()}`;

      await redis.setex(key, 86400, JSON.stringify(report)); // 24시간 보관

      // 최근 메트릭 리스트 업데이트
      await redis.lpush('performance:metrics:list', key);
      await redis.ltrim('performance:metrics:list', 0, 1439); // 최근 1440개 (24시간)
    } catch (error) {
      console.error('메트릭 저장 실패:', error);
    }
  }

  // 알림 전송
  async sendAlert(type, data) {
    // 실제 환경에서는 Slack, Email 등으로 알림 전송
    console.error(`🚨 성능 경고 [${type}]:`, data);

    const redis = getRedisClient();
    if (redis) {
      await redis.lpush('performance:alerts', JSON.stringify({
        type,
        data,
        timestamp: new Date()
      }));
      await redis.ltrim('performance:alerts', 0, 99); // 최근 100개
    }
  }

  // 모니터링 시작
  startMonitoring() {
    // 1분마다 시스템 리소스 체크
    setInterval(() => {
      this.monitorSystemResources();
    }, 60000);

    // 5분마다 메트릭 저장
    setInterval(() => {
      this.saveMetrics();
    }, 300000);

    // 10분마다 리포트 출력
    setInterval(() => {
      const report = this.generateReport();
      console.log('📊 성능 리포트:', JSON.stringify(report, null, 2));
    }, 600000);
  }

  // 실시간 대시보드 데이터
  async getDashboardData() {
    const report = this.generateReport();
    const redis = getRedisClient();

    if (redis) {
      // 최근 알림 가져오기
      const alerts = await redis.lrange('performance:alerts', 0, 9);
      report.recentAlerts = alerts.map(a => JSON.parse(a));
    }

    return report;
  }

  // 특정 엔드포인트 상세 분석
  analyzeEndpoint(endpoint) {
    const stats = this.metrics.requests.get(endpoint);
    if (!stats) return null;

    const sorted = [...stats.p95].sort((a, b) => a - b);

    return {
      endpoint,
      totalCalls: stats.count,
      performance: {
        avg: Math.round(stats.avgTime),
        min: sorted[0] || 0,
        max: stats.maxTime,
        p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
        p75: sorted[Math.floor(sorted.length * 0.75)] || 0,
        p90: sorted[Math.floor(sorted.length * 0.9)] || 0,
        p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
        p99: sorted[Math.floor(sorted.length * 0.99)] || 0
      },
      distribution: this.calculateDistribution(sorted)
    };
  }

  // 응답 시간 분포 계산
  calculateDistribution(times) {
    const buckets = [0, 50, 100, 200, 500, 1000, 2000, 5000];
    const distribution = {};

    buckets.forEach((bucket, i) => {
      const nextBucket = buckets[i + 1] || Infinity;
      const count = times.filter(t => t >= bucket && t < nextBucket).length;
      distribution[`${bucket}-${nextBucket === Infinity ? '+' : nextBucket}ms`] = count;
    });

    return distribution;
  }
}

// 싱글톤 인스턴스
let instance = null;

module.exports = {
  getPerformanceMonitor: () => {
    if (!instance) {
      instance = new PerformanceMonitor();
    }
    return instance;
  },

  // 미들웨어로 사용
  performanceMiddleware: (req, res, next) => {
    const monitor = module.exports.getPerformanceMonitor();
    const startTime = Date.now();

    // 응답 완료 시 추적
    res.on('finish', () => {
      monitor.trackRequest(req.path, startTime);
    });

    next();
  }
};
