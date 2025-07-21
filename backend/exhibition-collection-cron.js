#!/usr/bin/env node
require('dotenv').config();

const cron = require('node-cron');
const exhibitionDataCollectorService = require('./src/services/exhibitionDataCollectorService');
const { log } = require('./src/config/logger');
const { pool } = require('./src/config/database');

class ExhibitionCollectionCron {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
  }

  // 일일 전시 데이터 수집 (매일 오전 6시)
  startDailyCollection() {
    // 매일 오전 6시에 실행
    cron.schedule('0 6 * * *', async () => {
      if (this.isRunning) {
        log.warn('Exhibition collection already running, skipping...');
        return;
      }

      await this.runCollection('daily');
    }, {
      timezone: 'Asia/Seoul'
    });

    log.info('Daily exhibition collection cron scheduled (06:00 KST)');
  }

  // 상태 업데이트 (매 시간마다)
  startStatusUpdate() {
    // 매 시간 정각에 실행
    cron.schedule('0 * * * *', async () => {
      await this.runStatusUpdate();
    }, {
      timezone: 'Asia/Seoul'
    });

    log.info('Exhibition status update cron scheduled (every hour)');
  }

  // 주간 전체 수집 (매주 일요일 오전 3시)
  startWeeklyFullCollection() {
    cron.schedule('0 3 * * 0', async () => {
      if (this.isRunning) {
        log.warn('Exhibition collection already running, skipping weekly collection...');
        return;
      }

      await this.runCollection('weekly');
    }, {
      timezone: 'Asia/Seoul'
    });

    log.info('Weekly full exhibition collection cron scheduled (Sunday 03:00 KST)');
  }

  // 전시 데이터 수집 실행
  async runCollection(type = 'daily') {
    this.isRunning = true;
    this.lastRun = new Date();

    try {
      log.info(`Starting ${type} exhibition collection...`);
      
      const startTime = Date.now();
      const results = await exhibitionDataCollectorService.collectAllExhibitions();
      const duration = Date.now() - startTime;

      log.info(`${type} exhibition collection completed in ${duration}ms`, {
        type,
        duration,
        collected: results.collected,
        failed: results.failed,
        sources: results.sources
      });

      // 수집 결과를 로그 테이블에 저장 (선택사항)
      await this.logCollectionResult(type, results, duration);

      return results;

    } catch (error) {
      log.error(`${type} exhibition collection failed:`, error);
      
      // 실패한 경우에도 로그 저장
      await this.logCollectionResult(type, { collected: 0, failed: 1, error: error.message }, 0);
      
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  // 전시 상태 업데이트 실행
  async runStatusUpdate() {
    try {
      log.info('Starting exhibition status update...');
      
      const startTime = Date.now();
      const results = await exhibitionDataCollectorService.updateExhibitionStatuses();
      const duration = Date.now() - startTime;

      log.info(`Exhibition status update completed in ${duration}ms`, {
        updated: results.updated,
        duration
      });

      return results;

    } catch (error) {
      log.error('Exhibition status update failed:', error);
      throw error;
    }
  }

  // 수집 결과 로그 저장
  async logCollectionResult(type, results, duration) {
    try {
      await pool.query(`
        INSERT INTO collection_logs (
          collection_type, collected_count, failed_count, 
          duration_ms, sources_data, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        type,
        results.collected || 0,
        results.failed || 0,
        duration,
        JSON.stringify(results)
      ]);
    } catch (error) {
      log.error('Failed to log collection result:', error);
      // 로그 저장 실패는 전체 프로세스를 중단시키지 않음
    }
  }

  // 현재 상태 조회
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.nextRun
    };
  }

  // 수동 실행 (테스트용)
  async runManual(type = 'manual') {
    log.info('Manual exhibition collection triggered');
    return await this.runCollection(type);
  }

  // 모든 크론 작업 시작
  startAll() {
    this.startDailyCollection();
    this.startStatusUpdate();
    this.startWeeklyFullCollection();
    
    log.info('All exhibition collection cron jobs started');
  }

  // 서버 시작 시 초기 수집 (선택사항)
  async runInitialCollection() {
    try {
      log.info('Running initial exhibition collection...');
      
      // 마지막 수집 시간 확인
      const lastCollection = await pool.query(
        'SELECT created_at FROM collection_logs ORDER BY created_at DESC LIMIT 1'
      );

      const shouldRunInitial = lastCollection.rows.length === 0 || 
        (Date.now() - new Date(lastCollection.rows[0].created_at).getTime()) > 24 * 60 * 60 * 1000;

      if (shouldRunInitial) {
        await this.runCollection('initial');
        log.info('Initial collection completed');
      } else {
        log.info('Skipping initial collection (recent data exists)');
      }

    } catch (error) {
      log.error('Initial collection failed:', error);
      // 초기 수집 실패는 서버 시작을 막지 않음
    }
  }
}

// 인스턴스 생성 및 내보내기
const exhibitionCron = new ExhibitionCollectionCron();

// 직접 실행될 때만 크론 시작
if (require.main === module) {
  console.log('🕒 Starting SAYU Exhibition Collection Cron Service...');
  console.log('==================================================');
  
  // 모든 크론 작업 시작
  exhibitionCron.startAll();
  
  // 초기 수집 실행 (선택사항)
  // exhibitionCron.runInitialCollection();
  
  console.log('✅ Exhibition collection cron service is running');
  console.log('📅 Daily collection: Every day at 06:00 KST');
  console.log('🔄 Status updates: Every hour');
  console.log('📚 Weekly full collection: Sunday at 03:00 KST');
  console.log('');
  console.log('Press Ctrl+C to stop the service');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down exhibition collection cron service...');
    
    if (exhibitionCron.isRunning) {
      console.log('⏳ Waiting for current collection to finish...');
      // 최대 30초 대기
      let waitTime = 0;
      while (exhibitionCron.isRunning && waitTime < 30000) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        waitTime += 1000;
      }
    }
    
    // 데이터베이스 연결 종료
    try {
      await pool.end();
      console.log('✅ Database connections closed');
    } catch (error) {
      console.error('❌ Error closing database:', error);
    }
    
    console.log('👋 Exhibition collection cron service stopped');
    process.exit(0);
  });
}

module.exports = exhibitionCron;