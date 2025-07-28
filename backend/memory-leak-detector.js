#!/usr/bin/env node

/**
 * SAYU Memory Leak Detection Tool
 * Node.js 애플리케이션의 메모리 누수를 탐지하고 분석하는 도구
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class MemoryLeakDetector {
  constructor(options = {}) {
    this.options = {
      // 모니터링 대상 프로세스
      targetScript: options.targetScript || 'sayu-living-server.js',

      // 모니터링 간격 (초)
      monitorInterval: options.monitorInterval || 10,

      // 분석 기간 (분)
      analysisDuration: options.analysisDuration || 30,

      // 메모리 증가 임계값 (MB)
      memoryLeakThreshold: options.memoryLeakThreshold || 50,

      // 결과 파일 경로
      resultFile: options.resultFile || './memory-analysis-result.json',

      // 힙 스냅샷 생성 여부
      enableHeapSnapshot: options.enableHeapSnapshot || false,

      // V8 프로파일링 옵션
      enableProfiling: options.enableProfiling || false
    };

    this.measurements = [];
    this.isRunning = false;
    this.targetProcess = null;
    this.startTime = null;
  }

  /**
   * 메모리 누수 탐지 시작
   */
  async startDetection() {
    console.log('🔍 SAYU Memory Leak Detection Started');
    console.log(`📊 Target: ${this.options.targetScript}`);
    console.log(`⏱️  Monitor Interval: ${this.options.monitorInterval}s`);
    console.log(`📈 Analysis Duration: ${this.options.analysisDuration}m`);
    console.log('');

    this.isRunning = true;
    this.startTime = Date.now();

    try {
      // 1. 대상 프로세스 시작
      await this.startTargetProcess();

      // 2. 메모리 모니터링 시작
      await this.startMonitoring();

      // 3. 결과 분석
      const analysis = this.analyzeResults();

      // 4. 결과 출력 및 저장
      this.displayResults(analysis);
      this.saveResults(analysis);

      // 5. 권장사항 제공
      this.provideRecommendations(analysis);

    } catch (error) {
      console.error('❌ Detection failed:', error.message);
    } finally {
      this.cleanup();
    }
  }

  /**
   * 대상 프로세스 시작
   */
  async startTargetProcess() {
    console.log('🚀 Starting target process...');

    const nodeArgs = [
      '--expose-gc',  // 가비지 컬렉션 API 활성화
      '--max-old-space-size=2048'  // 힙 크기 제한
    ];

    // 프로파일링 옵션 추가
    if (this.options.enableProfiling) {
      nodeArgs.push('--prof');
      nodeArgs.push('--prof-process');
    }

    // 힙 스냅샷 옵션 추가
    if (this.options.enableHeapSnapshot) {
      nodeArgs.push('--heapsnapshot-signal=SIGUSR2');
    }

    nodeArgs.push(this.options.targetScript);

    this.targetProcess = spawn('node', nodeArgs, {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'development',
        MEMORY_LEAK_DETECTION: 'true'
      }
    });

    // 프로세스 출력 처리
    this.targetProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server running') || output.includes('listening')) {
        console.log('✅ Target process started successfully');
      }
    });

    this.targetProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('out of memory') || error.includes('ENOMEM')) {
        console.log('🚨 Memory error detected in target process');
        this.handleMemoryError(error);
      }
    });

    this.targetProcess.on('exit', (code) => {
      console.log(`🔴 Target process exited with code ${code}`);
      this.isRunning = false;
    });

    // 프로세스 시작 대기
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  /**
   * 메모리 모니터링 시작
   */
  async startMonitoring() {
    console.log('📊 Starting memory monitoring...');

    const endTime = this.startTime + (this.options.analysisDuration * 60 * 1000);
    let measurementCount = 0;

    while (this.isRunning && Date.now() < endTime) {
      try {
        const measurement = await this.takeMeasurement();
        this.measurements.push(measurement);

        measurementCount++;
        this.displayProgress(measurementCount, measurement);

        // 힙 스냅샷 생성 (10번째 측정마다)
        if (this.options.enableHeapSnapshot && measurementCount % 10 === 0) {
          await this.takeHeapSnapshot(measurementCount);
        }

        // 메모리 누수 실시간 감지
        if (this.measurements.length > 5) {
          const leakDetected = this.detectRealtimeLeak();
          if (leakDetected) {
            console.log('🚨 Real-time memory leak detected!');
            await this.handleRealtimeLeak();
          }
        }

        await this.sleep(this.options.monitorInterval * 1000);

      } catch (error) {
        console.error(`❌ Measurement failed: ${error.message}`);
      }
    }

    console.log(`📋 Monitoring completed. ${this.measurements.length} measurements taken.`);
  }

  /**
   * 메모리 측정
   */
  async takeMeasurement() {
    const timestamp = Date.now();

    // Node.js 프로세스 메모리 정보 (대상 프로세스)
    const processMemory = await this.getProcessMemory();

    // 시스템 메모리 정보
    const systemMemory = await this.getSystemMemory();

    return {
      timestamp,
      elapsed: Math.round((timestamp - this.startTime) / 1000),
      process: processMemory,
      system: systemMemory
    };
  }

  /**
   * 프로세스 메모리 정보 조회
   */
  async getProcessMemory() {
    if (!this.targetProcess || this.targetProcess.killed) {
      throw new Error('Target process not available');
    }

    try {
      // 프로세스 PID 조회
      const { pid } = this.targetProcess;

      // Windows에서 프로세스 메모리 정보 조회
      const { stdout } = await this.execCommand(
        `wmic process where ProcessId=${pid} get WorkingSetSize,VirtualSize,PageFileUsage /format:csv`
      );

      const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('Node'));
      const data = lines[lines.length - 1].split(',');

      if (data.length >= 4) {
        return {
          pid,
          rss: Math.round(parseInt(data[2] || '0') / 1024 / 1024), // MB
          virtual: Math.round(parseInt(data[3] || '0') / 1024 / 1024), // MB
          pagefile: Math.round(parseInt(data[1] || '0') / 1024 / 1024) // MB
        };
      }

      // 기본값 반환
      return { pid, rss: 0, virtual: 0, pagefile: 0 };

    } catch (error) {
      console.error('Failed to get process memory:', error.message);
      return { pid: 0, rss: 0, virtual: 0, pagefile: 0 };
    }
  }

  /**
   * 시스템 메모리 정보 조회
   */
  async getSystemMemory() {
    try {
      // Windows 시스템 메모리 정보
      const { stdout } = await this.execCommand(
        'wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:csv'
      );

      const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('Node'));
      const data = lines[lines.length - 1].split(',');

      if (data.length >= 3) {
        const totalKB = parseInt(data[2] || '0');
        const freeKB = parseInt(data[1] || '0');

        return {
          total: Math.round(totalKB / 1024), // MB
          free: Math.round(freeKB / 1024), // MB
          used: Math.round((totalKB - freeKB) / 1024), // MB
          usage: Math.round(((totalKB - freeKB) / totalKB) * 100) // %
        };
      }

      return { total: 0, free: 0, used: 0, usage: 0 };

    } catch (error) {
      console.error('Failed to get system memory:', error.message);
      return { total: 0, free: 0, used: 0, usage: 0 };
    }
  }

  /**
   * 진행 상황 표시
   */
  displayProgress(count, measurement) {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const remaining = (this.options.analysisDuration * 60) - elapsed;

    process.stdout.write(
      `\r📊 [${count}] ${elapsed}s elapsed, ${remaining}s remaining | ` +
      `RSS: ${measurement.process.rss}MB | ` +
      `System: ${measurement.system.usage}%`
    );
  }

  /**
   * 실시간 메모리 누수 감지
   */
  detectRealtimeLeak() {
    if (this.measurements.length < 5) return false;

    const recent = this.measurements.slice(-5);
    const initial = recent[0].process.rss;
    const current = recent[recent.length - 1].process.rss;
    const increase = current - initial;

    // 5번의 측정에서 지속적으로 메모리가 증가하는지 확인
    let increasingCount = 0;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].process.rss > recent[i - 1].process.rss) {
        increasingCount++;
      }
    }

    return increasingCount >= 4 && increase > 20; // 20MB 이상 증가
  }

  /**
   * 실시간 누수 처리
   */
  async handleRealtimeLeak() {
    console.log('\n🚨 Real-time leak detected - taking emergency snapshot');

    if (this.options.enableHeapSnapshot) {
      await this.takeHeapSnapshot('emergency');
    }

    // 강제 가비지 컬렉션 시도
    await this.triggerGC();
  }

  /**
   * 힙 스냅샷 생성
   */
  async takeHeapSnapshot(label) {
    if (!this.targetProcess || this.targetProcess.killed) return;

    try {
      console.log(`\n📸 Taking heap snapshot: ${label}`);

      // SIGUSR2 신호 전송 (Windows에서는 지원되지 않을 수 있음)
      this.targetProcess.kill('SIGUSR2');

      // 스냅샷 생성 대기
      await this.sleep(2000);

      console.log('✅ Heap snapshot created');

    } catch (error) {
      console.error(`Failed to take heap snapshot: ${error.message}`);
    }
  }

  /**
   * 강제 가비지 컬렉션 트리거
   */
  async triggerGC() {
    try {
      // 대상 프로세스에 GC 신호 전송 (구현 방법에 따라 다름)
      console.log('🗑️  Triggering garbage collection...');

      // 실제 구현에서는 HTTP API나 다른 메커니즘 사용
      // 여기서는 시뮬레이션
      await this.sleep(1000);

    } catch (error) {
      console.error(`Failed to trigger GC: ${error.message}`);
    }
  }

  /**
   * 결과 분석
   */
  analyzeResults() {
    console.log('\n\n📈 Analyzing results...');

    if (this.measurements.length < 2) {
      return { error: 'Insufficient data for analysis' };
    }

    const analysis = {
      summary: this.generateSummary(),
      trend: this.analyzeTrend(),
      leaks: this.detectMemoryLeaks(),
      performance: this.analyzePerformance(),
      recommendations: []
    };

    return analysis;
  }

  /**
   * 요약 정보 생성
   */
  generateSummary() {
    const first = this.measurements[0];
    const last = this.measurements[this.measurements.length - 1];

    return {
      duration: Math.round((last.timestamp - first.timestamp) / 1000 / 60), // 분
      measurements: this.measurements.length,
      initialMemory: first.process.rss,
      finalMemory: last.process.rss,
      memoryChange: last.process.rss - first.process.rss,
      maxMemory: Math.max(...this.measurements.map(m => m.process.rss)),
      minMemory: Math.min(...this.measurements.map(m => m.process.rss))
    };
  }

  /**
   * 트렌드 분석
   */
  analyzeTrend() {
    const memoryValues = this.measurements.map(m => m.process.rss);
    const timeValues = this.measurements.map((m, i) => i);

    // 선형 회귀를 통한 트렌드 계산
    const slope = this.calculateSlope(timeValues, memoryValues);
    const correlation = this.calculateCorrelation(timeValues, memoryValues);

    let trendType = 'stable';
    if (slope > 0.5) trendType = 'increasing';
    else if (slope < -0.5) trendType = 'decreasing';

    return {
      type: trendType,
      slope: Math.round(slope * 100) / 100,
      correlation: Math.round(correlation * 100) / 100,
      confidence: Math.abs(correlation)
    };
  }

  /**
   * 메모리 누수 감지
   */
  detectMemoryLeaks() {
    const leaks = [];

    // 1. 지속적인 메모리 증가 패턴
    const trend = this.analyzeTrend();
    if (trend.type === 'increasing' && trend.confidence > 0.7) {
      leaks.push({
        type: 'continuous_growth',
        severity: trend.slope > 2 ? 'high' : 'medium',
        description: `Continuous memory growth detected (${trend.slope}MB per measurement)`,
        confidence: trend.confidence
      });
    }

    // 2. 급격한 메모리 증가 구간
    for (let i = 1; i < this.measurements.length; i++) {
      const current = this.measurements[i].process.rss;
      const previous = this.measurements[i - 1].process.rss;
      const increase = current - previous;

      if (increase > this.options.memoryLeakThreshold) {
        leaks.push({
          type: 'sudden_spike',
          severity: 'high',
          description: `Sudden memory spike of ${increase}MB at measurement ${i}`,
          timestamp: this.measurements[i].timestamp,
          confidence: 0.9
        });
      }
    }

    // 3. 메모리 해제 없는 패턴
    const segments = this.segmentMeasurements(10);
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const minInSegment = Math.min(...segment.map(m => m.process.rss));
      const maxInSegment = Math.max(...segment.map(m => m.process.rss));

      if (maxInSegment - minInSegment < 5 && maxInSegment > 500) {
        // 메모리가 거의 해제되지 않는 구간
        leaks.push({
          type: 'no_gc_pattern',
          severity: 'medium',
          description: `No significant memory release in segment ${i + 1}`,
          confidence: 0.6
        });
      }
    }

    return leaks;
  }

  /**
   * 성능 분석
   */
  analyzePerformance() {
    return {
      memoryEfficiency: this.calculateMemoryEfficiency(),
      stabilityScore: this.calculateStabilityScore(),
      gcFrequency: this.estimateGCFrequency()
    };
  }

  /**
   * 메모리 효율성 계산
   */
  calculateMemoryEfficiency() {
    const summary = this.generateSummary();
    const averageMemory = this.measurements.reduce((sum, m) => sum + m.process.rss, 0) / this.measurements.length;

    // 메모리 사용량의 안정성을 기준으로 효율성 점수 계산
    const variance = this.calculateVariance(this.measurements.map(m => m.process.rss));
    const efficiency = Math.max(0, 100 - (variance / averageMemory * 100));

    return Math.round(efficiency);
  }

  /**
   * 안정성 점수 계산
   */
  calculateStabilityScore() {
    const memoryValues = this.measurements.map(m => m.process.rss);
    const mean = memoryValues.reduce((sum, val) => sum + val, 0) / memoryValues.length;
    const variance = this.calculateVariance(memoryValues);
    const cv = (Math.sqrt(variance) / mean) * 100; // 변동계수

    // 변동계수가 낮을수록 안정성이 높음
    const stability = Math.max(0, 100 - cv);
    return Math.round(stability);
  }

  /**
   * GC 빈도 추정
   */
  estimateGCFrequency() {
    let gcEvents = 0;

    // 메모리 감소 이벤트를 GC로 추정
    for (let i = 1; i < this.measurements.length; i++) {
      const current = this.measurements[i].process.rss;
      const previous = this.measurements[i - 1].process.rss;

      if (previous - current > 10) { // 10MB 이상 감소
        gcEvents++;
      }
    }

    const duration = (this.measurements[this.measurements.length - 1].timestamp - this.measurements[0].timestamp) / 1000 / 60; // 분
    const frequency = gcEvents / duration; // GC per minute

    return Math.round(frequency * 100) / 100;
  }

  /**
   * 결과 표시
   */
  displayResults(analysis) {
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 MEMORY LEAK ANALYSIS RESULTS');
    console.log('='.repeat(50));

    if (analysis.error) {
      console.log(`❌ ${analysis.error}`);
      return;
    }

    // 요약 정보
    console.log('\n📋 SUMMARY:');
    console.log(`   Duration: ${analysis.summary.duration} minutes`);
    console.log(`   Measurements: ${analysis.summary.measurements}`);
    console.log(`   Memory Change: ${analysis.summary.memoryChange > 0 ? '+' : ''}${analysis.summary.memoryChange}MB`);
    console.log(`   Peak Memory: ${analysis.summary.maxMemory}MB`);

    // 트렌드 분석
    console.log('\n📈 TREND ANALYSIS:');
    console.log(`   Trend: ${analysis.trend.type.toUpperCase()}`);
    console.log(`   Slope: ${analysis.trend.slope}MB per measurement`);
    console.log(`   Confidence: ${Math.round(analysis.trend.confidence * 100)}%`);

    // 메모리 누수 감지 결과
    console.log('\n🚨 MEMORY LEAKS DETECTED:');
    if (analysis.leaks.length === 0) {
      console.log('   ✅ No significant memory leaks detected');
    } else {
      analysis.leaks.forEach((leak, index) => {
        console.log(`   ${index + 1}. [${leak.severity.toUpperCase()}] ${leak.description}`);
        console.log(`      Confidence: ${Math.round(leak.confidence * 100)}%`);
      });
    }

    // 성능 점수
    console.log('\n⚡ PERFORMANCE SCORES:');
    console.log(`   Memory Efficiency: ${analysis.performance.memoryEfficiency}/100`);
    console.log(`   Stability Score: ${analysis.performance.stabilityScore}/100`);
    console.log(`   GC Frequency: ${analysis.performance.gcFrequency} events/min`);
  }

  /**
   * 권장사항 제공
   */
  provideRecommendations(analysis) {
    console.log('\n💡 RECOMMENDATIONS:');

    const recommendations = [];

    // 트렌드 기반 권장사항
    if (analysis.trend.type === 'increasing' && analysis.trend.confidence > 0.7) {
      recommendations.push('Consider implementing periodic cleanup routines');
      recommendations.push('Review code for potential memory leaks in event listeners or closures');
    }

    // 누수 기반 권장사항
    if (analysis.leaks.length > 0) {
      const highSeverityLeaks = analysis.leaks.filter(leak => leak.severity === 'high');
      if (highSeverityLeaks.length > 0) {
        recommendations.push('URGENT: Investigate high-severity memory leaks immediately');
        recommendations.push('Enable heap snapshots for detailed leak analysis');
      }
    }

    // 성능 기반 권장사항
    if (analysis.performance.memoryEfficiency < 70) {
      recommendations.push('Optimize memory usage patterns');
      recommendations.push('Consider implementing object pooling for frequently created objects');
    }

    if (analysis.performance.gcFrequency < 0.1) {
      recommendations.push('Memory may not be released frequently enough');
      recommendations.push('Consider manual garbage collection triggers in appropriate places');
    }

    if (recommendations.length === 0) {
      console.log('   ✅ Memory usage appears healthy. Continue monitoring.');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
  }

  /**
   * 결과 저장
   */
  saveResults(analysis) {
    try {
      const results = {
        timestamp: new Date().toISOString(),
        options: this.options,
        measurements: this.measurements,
        analysis
      };

      fs.writeFileSync(this.options.resultFile, JSON.stringify(results, null, 2));
      console.log(`\n💾 Results saved to: ${this.options.resultFile}`);

    } catch (error) {
      console.error(`Failed to save results: ${error.message}`);
    }
  }

  /**
   * 메모리 에러 처리
   */
  handleMemoryError(error) {
    console.log('\n🚨 MEMORY ERROR DETECTED IN TARGET PROCESS');
    console.log('Error:', error.trim());

    // 긴급 분석 수행
    if (this.measurements.length > 0) {
      const emergencyAnalysis = this.analyzeResults();
      this.displayResults(emergencyAnalysis);
      this.saveResults(emergencyAnalysis);
    }
  }

  /**
   * 정리 작업
   */
  cleanup() {
    console.log('\n🧹 Cleaning up...');

    if (this.targetProcess && !this.targetProcess.killed) {
      this.targetProcess.kill('SIGTERM');

      setTimeout(() => {
        if (!this.targetProcess.killed) {
          this.targetProcess.kill('SIGKILL');
        }
      }, 5000);
    }

    console.log('✅ Cleanup completed');
  }

  // 유틸리티 함수들

  async execCommand(command) {
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec(command, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve({ stdout, stderr });
      });
    });
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  calculateSlope(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b);
    const sumY = y.reduce((a, b) => a + b);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b);
    const sumY = y.reduce((a, b) => a + b);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  segmentMeasurements(segmentSize) {
    const segments = [];
    for (let i = 0; i < this.measurements.length; i += segmentSize) {
      segments.push(this.measurements.slice(i, i + segmentSize));
    }
    return segments;
  }
}

// CLI 실행
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // 명령행 인수 파싱
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];

    if (value && !value.startsWith('--')) {
      if (key === 'monitor-interval' || key === 'analysis-duration' || key === 'leak-threshold') {
        options[key.replace('-', '')] = parseInt(value);
      } else if (key === 'enable-heap-snapshot' || key === 'enable-profiling') {
        options[key.replace('-', '')] = value === 'true';
      } else {
        options[key.replace('-', '')] = value;
      }
    }
  }

  const detector = new MemoryLeakDetector(options);

  // 우아한 종료 처리
  process.on('SIGINT', () => {
    console.log('\n⏹️  Detection interrupted by user');
    detector.cleanup();
    process.exit(0);
  });

  detector.startDetection().catch(console.error);
}

module.exports = MemoryLeakDetector;
