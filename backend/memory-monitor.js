#!/usr/bin/env node

/**
 * SAYU Real-time Memory Monitor
 * Node.js 애플리케이션의 실시간 메모리 사용량을 모니터링하고 시각화
 */

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class MemoryMonitor extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      // 모니터링 간격 (밀리초)
      interval: options.interval || 2000,

      // 데이터 히스토리 크기
      historySize: options.historySize || 100,

      // 경고 임계값 (MB)
      warningThreshold: options.warningThreshold || 1200,

      // 위험 임계값 (MB)
      dangerThreshold: options.dangerThreshold || 1600,

      // 출력 형식
      displayMode: options.displayMode || 'chart', // 'chart', 'table', 'minimal'

      // 로그 파일 저장
      saveToFile: options.saveToFile || false,
      logFile: options.logFile || './memory-monitor.log',

      // 알림 설정
      enableAlerts: options.enableAlerts !== false,

      // 자동 GC 트리거
      autoGC: options.autoGC || false,
      gcThreshold: options.gcThreshold || 1400
    };

    // 데이터 저장
    this.history = [];
    this.isRunning = false;
    this.startTime = Date.now();
    this.monitorTimer = null;

    // 통계
    this.stats = {
      maxMemory: 0,
      minMemory: Infinity,
      avgMemory: 0,
      gcEvents: 0,
      warnings: 0,
      dangers: 0
    };

    // 터미널 크기
    this.terminalWidth = process.stdout.columns || 80;
    this.terminalHeight = process.stdout.rows || 24;

    // 색상 코드
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      bgRed: '\x1b[41m',
      bgGreen: '\x1b[42m',
      bgYellow: '\x1b[43m'
    };

    console.log('🔍 SAYU Memory Monitor initialized');
  }

  /**
   * 모니터링 시작
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Monitor is already running');
      return;
    }

    this.isRunning = true;
    this.startTime = Date.now();

    console.log('🚀 Starting memory monitoring...');
    console.log(`📊 Display mode: ${this.options.displayMode}`);
    console.log(`⏱️  Interval: ${this.options.interval}ms`);
    console.log('─'.repeat(this.terminalWidth));

    // 초기 측정
    this.takeMeasurement();

    // 주기적 측정 시작
    this.monitorTimer = setInterval(() => {
      this.takeMeasurement();
    }, this.options.interval);

    // 종료 처리
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());

    this.emit('started');
  }

  /**
   * 모니터링 중지
   */
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
    }

    console.log('\n🛑 Stopping memory monitor...');
    this.displaySummary();

    if (this.options.saveToFile) {
      this.saveHistoryToFile();
    }

    this.emit('stopped');
    process.exit(0);
  }

  /**
   * 메모리 측정
   */
  takeMeasurement() {
    const memUsage = process.memoryUsage();
    const timestamp = Date.now();
    const elapsed = Math.round((timestamp - this.startTime) / 1000);

    // MB 단위로 변환
    const measurement = {
      timestamp,
      elapsed,
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024)
    };

    // 히스토리에 추가
    this.history.push(measurement);

    // 히스토리 크기 제한
    if (this.history.length > this.options.historySize) {
      this.history.shift();
    }

    // 통계 업데이트
    this.updateStats(measurement);

    // 경고 체크
    this.checkThresholds(measurement);

    // 화면 출력
    this.display(measurement);

    // 자동 GC 체크
    if (this.options.autoGC && measurement.heapUsed > this.options.gcThreshold) {
      this.triggerGC();
    }

    // 이벤트 발생
    this.emit('measurement', measurement);
  }

  /**
   * 통계 업데이트
   */
  updateStats(measurement) {
    this.stats.maxMemory = Math.max(this.stats.maxMemory, measurement.heapUsed);
    this.stats.minMemory = Math.min(this.stats.minMemory, measurement.heapUsed);

    // 평균 계산 (이동 평균)
    const totalMeasurements = this.history.length;
    this.stats.avgMemory = Math.round(
      this.history.reduce((sum, m) => sum + m.heapUsed, 0) / totalMeasurements
    );
  }

  /**
   * 임계값 체크
   */
  checkThresholds(measurement) {
    const { heapUsed } = measurement;

    if (heapUsed > this.options.dangerThreshold) {
      this.stats.dangers++;
      if (this.options.enableAlerts) {
        this.emit('danger', measurement);
        console.log(`\n🚨 DANGER: Memory usage ${heapUsed}MB exceeds danger threshold!`);
      }
    } else if (heapUsed > this.options.warningThreshold) {
      this.stats.warnings++;
      if (this.options.enableAlerts) {
        this.emit('warning', measurement);
      }
    }
  }

  /**
   * 화면 출력
   */
  display(measurement) {
    switch (this.options.displayMode) {
      case 'chart':
        this.displayChart(measurement);
        break;
      case 'table':
        this.displayTable(measurement);
        break;
      case 'minimal':
        this.displayMinimal(measurement);
        break;
      default:
        this.displayChart(measurement);
    }
  }

  /**
   * 차트 형식 출력
   */
  displayChart(measurement) {
    // 화면 지우기
    process.stdout.write('\x1b[2J\x1b[0f');

    const { elapsed, rss, heapUsed, heapTotal, external } = measurement;

    // 헤더
    console.log(`${this.colors.bright}🔍 SAYU Memory Monitor${this.colors.reset}`);
    console.log(`Runtime: ${this.formatTime(elapsed)} | Current: ${heapUsed}MB | Max: ${this.stats.maxMemory}MB`);
    console.log('─'.repeat(this.terminalWidth));

    // 메모리 차트 생성
    const chartHeight = Math.min(15, this.terminalHeight - 10);
    const chart = this.generateMemoryChart(chartHeight);

    console.log(chart);

    // 현재 메모리 상태
    console.log('📊 Current Memory Usage:');

    const rssBar = this.generateBar(rss, 2000, 40);
    const heapBar = this.generateBar(heapUsed, this.options.dangerThreshold, 40);
    const totalBar = this.generateBar(heapTotal, 2000, 40);

    console.log(`RSS:       ${rssBar} ${rss}MB`);
    console.log(`Heap Used: ${heapBar} ${heapUsed}MB`);
    console.log(`Heap Total:${totalBar} ${heapTotal}MB`);
    console.log(`External:  ${external}MB | ArrayBuffers: ${measurement.arrayBuffers}MB`);

    // 통계 정보
    console.log('\n📈 Statistics:');
    console.log(`Avg: ${this.stats.avgMemory}MB | Min: ${this.stats.minMemory}MB | Max: ${this.stats.maxMemory}MB`);
    console.log(`Warnings: ${this.stats.warnings} | Dangers: ${this.stats.dangers} | GC Events: ${this.stats.gcEvents}`);

    // 상태 표시
    const status = heapUsed > this.options.dangerThreshold ?
      `${this.colors.bgRed} DANGER ${this.colors.reset}` :
      heapUsed > this.options.warningThreshold ?
      `${this.colors.bgYellow} WARNING ${this.colors.reset}` :
      `${this.colors.bgGreen} HEALTHY ${this.colors.reset}`;

    console.log(`\nStatus: ${status}`);
  }

  /**
   * 메모리 차트 생성
   */
  generateMemoryChart(height) {
    if (this.history.length < 2) {
      return 'Collecting data...';
    }

    const chartWidth = Math.min(60, this.terminalWidth - 20);
    const dataPoints = this.history.slice(-chartWidth);

    // 최대/최소값 계산
    const values = dataPoints.map(d => d.heapUsed);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const range = maxVal - minVal || 1;

    const chart = [];

    // Y축 레이블과 차트 생성
    for (let y = height - 1; y >= 0; y--) {
      const threshold = minVal + (range * y / (height - 1));
      const yLabel = Math.round(threshold).toString().padStart(4);

      let line = `${yLabel}MB |`;

      for (let x = 0; x < dataPoints.length; x++) {
        const value = dataPoints[x].heapUsed;
        const normalizedValue = (value - minVal) / range * (height - 1);

        if (Math.round(normalizedValue) === y) {
          // 색상 결정
          const color = value > this.options.dangerThreshold ? this.colors.red :
                       value > this.options.warningThreshold ? this.colors.yellow :
                       this.colors.green;
          line += `${color}█${this.colors.reset}`;
        } else if (Math.round(normalizedValue) > y) {
          line += '│';
        } else {
          line += ' ';
        }
      }

      chart.push(line);
    }

    // X축 추가
    const xAxis = `     +${'─'.repeat(dataPoints.length)}`;
    chart.push(xAxis);

    return chart.join('\n');
  }

  /**
   * 테이블 형식 출력
   */
  displayTable(measurement) {
    const { elapsed, rss, heapUsed, heapTotal, external, arrayBuffers } = measurement;

    // 헤더 (첫 번째 측정 시에만)
    if (this.history.length === 1) {
      console.log('Time\t\tRSS\tHeap\tTotal\tExt\tArrayBuf\tStatus');
      console.log('─'.repeat(this.terminalWidth));
    }

    const status = heapUsed > this.options.dangerThreshold ? '🔴' :
                  heapUsed > this.options.warningThreshold ? '🟡' : '🟢';

    const timeStr = this.formatTime(elapsed).padEnd(8);
    console.log(`${timeStr}\t${rss}\t${heapUsed}\t${heapTotal}\t${external}\t${arrayBuffers}\t\t${status}`);
  }

  /**
   * 최소 형식 출력
   */
  displayMinimal(measurement) {
    const { elapsed, heapUsed } = measurement;
    const status = heapUsed > this.options.dangerThreshold ? '🔴' :
                  heapUsed > this.options.warningThreshold ? '🟡' : '🟢';

    process.stdout.write(`\r[${this.formatTime(elapsed)}] ${status} ${heapUsed}MB`);
  }

  /**
   * 진행 바 생성
   */
  generateBar(value, maxValue, width) {
    const percentage = Math.min(value / maxValue, 1);
    const filledWidth = Math.round(width * percentage);
    const emptyWidth = width - filledWidth;

    // 색상 결정
    const color = value > this.options.dangerThreshold ? this.colors.red :
                 value > this.options.warningThreshold ? this.colors.yellow :
                 this.colors.green;

    const filled = '█'.repeat(filledWidth);
    const empty = '░'.repeat(emptyWidth);

    return `${color}${filled}${this.colors.reset}${empty}`;
  }

  /**
   * 가비지 컬렉션 트리거
   */
  triggerGC() {
    if (global.gc) {
      const beforeGC = process.memoryUsage().heapUsed;
      global.gc();
      const afterGC = process.memoryUsage().heapUsed;
      const freed = Math.round((beforeGC - afterGC) / 1024 / 1024);

      this.stats.gcEvents++;
      console.log(`\n🗑️  Garbage collection: ${freed}MB freed`);

      this.emit('gc', { before: beforeGC, after: afterGC, freed });
    }
  }

  /**
   * 요약 정보 출력
   */
  displaySummary() {
    const duration = Math.round((Date.now() - this.startTime) / 1000);

    console.log('\n📋 MONITORING SUMMARY');
    console.log('─'.repeat(40));
    console.log(`Duration: ${this.formatTime(duration)}`);
    console.log(`Measurements: ${this.history.length}`);
    console.log(`Memory - Min: ${this.stats.minMemory}MB, Max: ${this.stats.maxMemory}MB, Avg: ${this.stats.avgMemory}MB`);
    console.log(`Alerts - Warnings: ${this.stats.warnings}, Dangers: ${this.stats.dangers}`);
    console.log(`GC Events: ${this.stats.gcEvents}`);

    // 메모리 트렌드 분석
    if (this.history.length > 10) {
      const trend = this.analyzeTrend();
      console.log(`Trend: ${trend.direction} (${trend.slope.toFixed(2)}MB per measurement)`);
    }
  }

  /**
   * 트렌드 분석
   */
  analyzeTrend() {
    const recent = this.history.slice(-20);
    const x = recent.map((_, i) => i);
    const y = recent.map(m => m.heapUsed);

    // 선형 회귀
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b);
    const sumY = y.reduce((a, b) => a + b);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    return {
      slope,
      direction: slope > 1 ? 'Increasing' : slope < -1 ? 'Decreasing' : 'Stable'
    };
  }

  /**
   * 히스토리 파일 저장
   */
  saveHistoryToFile() {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        duration: Math.round((Date.now() - this.startTime) / 1000),
        stats: this.stats,
        options: this.options,
        history: this.history
      };

      fs.writeFileSync(this.options.logFile, JSON.stringify(data, null, 2));
      console.log(`💾 History saved to: ${this.options.logFile}`);

    } catch (error) {
      console.error(`Failed to save history: ${error.message}`);
    }
  }

  /**
   * 시간 포맷팅
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h${minutes}m${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}

// CLI 실행
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // 옵션 파싱
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--interval':
      case '-i':
        if (nextArg && !nextArg.startsWith('--')) {
          options.interval = parseInt(nextArg) * 1000;
          i++;
        }
        break;

      case '--warning':
      case '-w':
        if (nextArg && !nextArg.startsWith('--')) {
          options.warningThreshold = parseInt(nextArg);
          i++;
        }
        break;

      case '--danger':
      case '-d':
        if (nextArg && !nextArg.startsWith('--')) {
          options.dangerThreshold = parseInt(nextArg);
          i++;
        }
        break;

      case '--mode':
      case '-m':
        if (nextArg && !nextArg.startsWith('--')) {
          options.displayMode = nextArg;
          i++;
        }
        break;

      case '--save':
      case '-s':
        options.saveToFile = true;
        if (nextArg && !nextArg.startsWith('--')) {
          options.logFile = nextArg;
          i++;
        }
        break;

      case '--auto-gc':
        options.autoGC = true;
        break;

      case '--help':
      case '-h':
        console.log(`
🔍 SAYU Real-time Memory Monitor

Usage: node memory-monitor.js [options]

Options:
  -i, --interval <seconds>    Monitoring interval (default: 2)
  -w, --warning <MB>         Warning threshold (default: 1200)
  -d, --danger <MB>          Danger threshold (default: 1600)
  -m, --mode <mode>          Display mode: chart, table, minimal (default: chart)
  -s, --save [file]          Save history to file
  --auto-gc                  Enable automatic garbage collection
  -h, --help                 Show this help

Examples:
  node memory-monitor.js                           # Default monitoring
  node memory-monitor.js -i 1 -m table            # 1-second interval, table mode
  node memory-monitor.js -w 800 -d 1200 --auto-gc # Custom thresholds with auto GC
  node memory-monitor.js -s memory.log             # Save history to file
`);
        process.exit(0);
    }
  }

  const monitor = new MemoryMonitor(options);

  // 이벤트 리스너
  monitor.on('warning', (measurement) => {
    console.log(`\n⚠️  WARNING: Memory usage ${measurement.heapUsed}MB`);
  });

  monitor.on('danger', (measurement) => {
    console.log(`\n🚨 DANGER: Critical memory usage ${measurement.heapUsed}MB!`);
  });

  monitor.on('gc', (data) => {
    // GC 이벤트는 이미 triggerGC에서 로그됨
  });

  // 모니터링 시작
  monitor.start();
}

module.exports = MemoryMonitor;
