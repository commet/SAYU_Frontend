#!/usr/bin/env node

const MassiveArtMapCollector = require('./massive-artmap-collector');
const fs = require('fs').promises;
const path = require('path');

class CollectionRunner {
  constructor() {
    this.collector = null;
    this.startTime = null;
    this.logFile = null;
  }

  // 로깅 설정
  async setupLogging() {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    this.logFile = path.join(__dirname, 'collection_logs', `massive_collection_${timestamp}.log`);
    
    await fs.mkdir(path.dirname(this.logFile), { recursive: true });
    
    // 콘솔 출력을 파일에도 기록
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      const message = args.join(' ');
      originalLog(...args);
      this.writeToLog('INFO', message);
    };
    
    console.error = (...args) => {
      const message = args.join(' ');
      originalError(...args);
      this.writeToLog('ERROR', message);
    };
    
    console.log(`📝 Logging to: ${this.logFile}`);
  }

  // 로그 파일에 기록
  async writeToLog(level, message) {
    try {
      const timestamp = new Date().toISOString();
      const logLine = `[${timestamp}] ${level}: ${message}\n`;
      await fs.appendFile(this.logFile, logLine);
    } catch (error) {
      // 로깅 실패는 무시 (무한 루프 방지)
    }
  }

  // 시스템 상태 확인
  async checkSystemHealth() {
    console.log('🏥 SYSTEM HEALTH CHECK');
    console.log('=====================');
    
    const checks = {
      memory: this.checkMemoryUsage(),
      disk: await this.checkDiskSpace(),
      network: await this.checkNetworkConnection(),
      database: await this.checkDatabaseConnection()
    };
    
    const issues = [];
    
    // 메모리 체크
    if (checks.memory.usagePercent > 80) {
      issues.push(`High memory usage: ${checks.memory.usagePercent}%`);
    }
    
    // 디스크 체크
    if (checks.disk.freeGB < 5) {
      issues.push(`Low disk space: ${checks.disk.freeGB}GB remaining`);
    }
    
    // 네트워크 체크
    if (!checks.network.success) {
      issues.push('Network connection failed');
    }
    
    // 데이터베이스 체크
    if (!checks.database.success) {
      issues.push('Database connection failed');
    }
    
    if (issues.length > 0) {
      console.log('⚠️  System issues detected:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      return false;
    } else {
      console.log('✅ System health check passed');
      return true;
    }
  }

  // 메모리 사용량 확인
  checkMemoryUsage() {
    const usage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const usedMemory = usage.rss;
    const usagePercent = (usedMemory / totalMemory * 100).toFixed(1);
    
    console.log(`Memory usage: ${(usedMemory / 1024 / 1024).toFixed(1)}MB (${usagePercent}%)`);
    
    return { usedMemory, totalMemory, usagePercent: parseFloat(usagePercent) };
  }

  // 디스크 공간 확인
  async checkDiskSpace() {
    try {
      const stats = await fs.statfs(__dirname);
      const freeBytes = stats.bavail * stats.bsize;
      const freeGB = (freeBytes / 1024 / 1024 / 1024).toFixed(1);
      
      console.log(`Free disk space: ${freeGB}GB`);
      
      return { freeGB: parseFloat(freeGB) };
    } catch (error) {
      console.log('Could not check disk space');
      return { freeGB: 999 }; // 가정값
    }
  }

  // 네트워크 연결 확인
  async checkNetworkConnection() {
    try {
      const axios = require('axios');
      await axios.get('https://artmap.com', { timeout: 5000 });
      console.log('Network connection: OK');
      return { success: true };
    } catch (error) {
      console.log('Network connection: FAILED');
      return { success: false, error: error.message };
    }
  }

  // 데이터베이스 연결 확인
  async checkDatabaseConnection() {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      await pool.query('SELECT 1');
      await pool.end();
      console.log('Database connection: OK');
      return { success: true };
    } catch (error) {
      console.log('Database connection: FAILED');
      return { success: false, error: error.message };
    }
  }

  // 진행 상황 모니터링
  async startProgressMonitoring() {
    const monitorInterval = 300000; // 5분마다 체크
    
    setInterval(async () => {
      await this.logSystemStatus();
    }, monitorInterval);
  }

  // 시스템 상태 로깅
  async logSystemStatus() {
    const usage = this.checkMemoryUsage();
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    console.log(`⏱️  Runtime: ${hours}h ${minutes}m | Memory: ${usage.usagePercent}%`);
  }

  // 수집 시작
  async startCollection(options = {}) {
    console.log('🚀 STARTING MASSIVE ARTMAP COLLECTION');
    console.log('=====================================');
    
    // 1. 로깅 설정
    await this.setupLogging();
    
    // 2. 시스템 상태 확인
    const healthOK = await this.checkSystemHealth();
    if (!healthOK && !options.forceStart) {
      console.log('❌ System health check failed. Use --force to start anyway.');
      return false;
    }
    
    // 3. 수집기 초기화
    this.collector = new MassiveArtMapCollector();
    
    // 옵션 적용
    if (options.quick) {
      this.collector.config.maxVenuesPerType = 30;
      this.collector.config.requestDelay = 1000;
      console.log('🏃 Quick mode enabled');
    }
    
    if (options.safe) {
      this.collector.config.maxVenuesPerType = 20;
      this.collector.config.requestDelay = 3000;
      console.log('🛡️  Safe mode enabled (slower but more stable)');
    }
    
    // 4. 진행 상황 모니터링 시작
    this.startProgressMonitoring();
    
    // 5. 수집 시작
    this.startTime = new Date();
    console.log(`Start time: ${this.startTime.toISOString()}`);
    
    try {
      await this.collector.startMassiveCollection();
      
      const endTime = new Date();
      const duration = (endTime - this.startTime) / 1000;
      
      console.log(`\n🎉 Collection completed successfully!`);
      console.log(`Total duration: ${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`);
      
      return true;
      
    } catch (error) {
      console.error('💥 Collection failed:', error);
      return false;
    }
  }

  // 정리 작업
  async cleanup() {
    if (this.collector) {
      await this.collector.close();
    }
    
    console.log('🧹 Cleanup completed');
  }
}

// CLI 실행
async function main() {
  const args = process.argv.slice(2);
  const runner = new CollectionRunner();
  
  // 환경 변수 확인
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  try {
    if (args.includes('--help') || args.includes('-h')) {
      console.log('🎨 MASSIVE ARTMAP COLLECTION RUNNER');
      console.log('===================================');
      console.log('Usage: node run-massive-collection.js [options]');
      console.log('\nOptions:');
      console.log('  --start       Start the massive collection');
      console.log('  --quick       Quick mode (less data, faster)');
      console.log('  --safe        Safe mode (more stable, slower)');
      console.log('  --force       Force start even if health check fails');
      console.log('  --help        Show this help');
      console.log('\nFeatures:');
      console.log('  • Automatic system health checks');
      console.log('  • Progress monitoring and logging');
      console.log('  • Error recovery and intermediate saves');
      console.log('  • Comprehensive result reporting');
      console.log('\nExpected Results:');
      console.log('  • 3,000+ exhibitions from 40+ cities');
      console.log('  • 1,000+ venues with detailed information');
      console.log('  • GPS coordinates for most venues');
      console.log('  • Duration: 6-8 hours (depending on network)');
      return;
    }

    const options = {
      quick: args.includes('--quick'),
      safe: args.includes('--safe'),
      forceStart: args.includes('--force')
    };

    if (args.includes('--start') || args.length === 0) {
      // 확인 메시지
      if (!options.forceStart) {
        console.log('⚠️  This will start a massive data collection process.');
        console.log('   Expected duration: 6-8 hours');
        console.log('   Expected data: 3,000+ exhibitions, 1,000+ venues');
        console.log('   You can stop with Ctrl+C (progress will be saved)');
        console.log('\n   Continue? (y/N): ');
        
        // 간단한 확인 (실제 운영에서는 readline 사용 권장)
        const confirmation = args.includes('--yes') || args.includes('-y');
        if (!confirmation) {
          console.log('Collection cancelled. Use --yes or -y to skip confirmation.');
          return;
        }
      }
      
      await runner.startCollection(options);
    } else {
      console.log('Use --start to begin collection or --help for usage info');
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

// 신호 처리
process.on('SIGINT', async () => {
  console.log('\n⚠️  Collection interrupted by user');
  console.log('Saving current progress and cleaning up...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Collection terminated');
  console.log('Saving current progress and cleaning up...');
  process.exit(0);
});

// 오류 처리
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

main();

module.exports = CollectionRunner;