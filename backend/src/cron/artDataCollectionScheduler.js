const cron = require('node-cron');
const { logger } = require('../config/logger');
const culturePortalIntegration = require('../services/culturePortalIntegration');
const museumAPIService = require('../services/museumAPIService');
const enhancedExhibitionCollector = require('../services/enhancedExhibitionCollectorService');
const intelligentCurationEngine = require('../services/intelligentCurationEngine');
const { pool } = require('../config/database');

/**
 * SAYU 아트 데이터 자동 수집 스케줄러
 *
 * 스케줄링 전략:
 * - 매일 오전 6시: 문화포털 API 수집 (1,000건 한도)
 * - 매일 오전 7시: 네이버 API 기반 전시 수집
 * - 매일 오후 2시: 주요 미술관 웹사이트 크롤링
 * - 주 1회 일요일 오전 3시: 해외 뮤지엄 API 대량 동기화
 * - 주 1회 토요일 오후 11시: 데이터 품질 검증 및 정제
 * - 매시간: 실시간 데이터 상태 모니터링
 */
class ArtDataCollectionScheduler {
  constructor() {
    this.isRunning = false;
    this.jobs = new Map();
    this.stats = {
      lastRun: {},
      totalRuns: {},
      errors: {},
      successRate: {}
    };
  }

  /**
   * 모든 크론 작업 시작
   */
  start() {
    if (this.isRunning) {
      logger.warn('Scheduler is already running');
      return;
    }

    logger.info('🚀 Starting SAYU Art Data Collection Scheduler...');

    // 1. 매일 오전 6시: 문화포털 수집 (최우선)
    this.scheduleJob('culture-portal-daily', '0 6 * * *', async () => {
      await this.runCulturePortalCollection();
    });

    // 2. 매일 오전 7시: 네이버 API 수집
    this.scheduleJob('naver-api-daily', '0 7 * * *', async () => {
      await this.runNaverAPICollection();
    });

    // 3. 매일 오후 2시: 미술관 웹사이트 크롤링
    this.scheduleJob('museum-crawling', '0 14 * * *', async () => {
      await this.runMuseumCrawling();
    });

    // 4. 주 1회 일요일 오전 3시: 해외 뮤지엄 API 동기화
    this.scheduleJob('museum-api-weekly', '0 3 * * 0', async () => {
      await this.runMuseumAPISync();
    });

    // 5. 주 1회 토요일 오후 11시: 데이터 정제
    this.scheduleJob('data-cleanup-weekly', '0 23 * * 6', async () => {
      await this.runDataCleanup();
    });

    // 6. 매시간: 시스템 상태 모니터링
    this.scheduleJob('health-monitor', '0 * * * *', async () => {
      await this.runHealthMonitoring();
    });

    // 7. 매일 오전 8시: 큐레이션 업데이트
    this.scheduleJob('curation-update', '0 8 * * *', async () => {
      await this.runCurationUpdate();
    });

    // 8. 매일 자정: 통계 집계
    this.scheduleJob('daily-stats', '0 0 * * *', async () => {
      await this.runDailyStatsAggregation();
    });

    this.isRunning = true;
    logger.info('✅ All scheduled jobs are now active');
  }

  /**
   * 크론 작업 등록
   */
  scheduleJob(name, schedule, task) {
    const job = cron.schedule(schedule, async () => {
      await this.executeTask(name, task);
    }, {
      scheduled: false,
      timezone: 'Asia/Seoul'
    });

    this.jobs.set(name, job);
    job.start();

    // 통계 초기화
    this.stats.totalRuns[name] = 0;
    this.stats.errors[name] = 0;
    this.stats.successRate[name] = 100;

    logger.info(`📅 Scheduled job: ${name} (${schedule})`);
  }

  /**
   * 안전한 작업 실행 래퍼
   */
  async executeTask(taskName, task) {
    const startTime = Date.now();

    try {
      logger.info(`🔄 Starting scheduled task: ${taskName}`);

      await task();

      const duration = Date.now() - startTime;
      this.stats.lastRun[taskName] = new Date();
      this.stats.totalRuns[taskName]++;

      // 성공률 계산
      const total = this.stats.totalRuns[taskName];
      const errors = this.stats.errors[taskName];
      this.stats.successRate[taskName] = ((total - errors) / total * 100).toFixed(2);

      logger.info(`✅ Task completed: ${taskName} (${duration}ms)`);

      // 성공 로그 저장
      await this.logTaskExecution(taskName, 'success', duration);

    } catch (error) {
      const duration = Date.now() - startTime;
      this.stats.errors[taskName]++;

      logger.error(`❌ Task failed: ${taskName}`, error);

      // 실패 로그 저장
      await this.logTaskExecution(taskName, 'error', duration, error.message);

      // 중요한 작업 실패 시 알림 (필요시 구현)
      if (['culture-portal-daily', 'museum-api-weekly'].includes(taskName)) {
        await this.sendFailureAlert(taskName, error);
      }
    }
  }

  /**
   * 1. 문화포털 일일 수집
   */
  async runCulturePortalCollection() {
    logger.info('📡 Starting Culture Portal daily collection...');

    const result = await culturePortalIntegration.collectDailyExhibitions();

    if (result.success) {
      logger.info(`✅ Culture Portal: ${result.data.new} new, ${result.data.updated} updated`);
    } else {
      throw new Error(`Culture Portal collection failed: ${result.error}`);
    }

    return result;
  }

  /**
   * 2. 네이버 API 수집
   */
  async runNaverAPICollection() {
    logger.info('🔍 Starting Naver API collection...');

    const result = await enhancedExhibitionCollector.collectFromNaverAPI();

    logger.info(`✅ Naver API: ${result.count} exhibitions collected`);
    return result;
  }

  /**
   * 3. 미술관 웹사이트 크롤링
   */
  async runMuseumCrawling() {
    logger.info('🕷️ Starting museum website crawling...');

    const result = await enhancedExhibitionCollector.collectAllExhibitions();

    logger.info(`✅ Museum crawling: ${result.saved} exhibitions saved`);
    return result;
  }

  /**
   * 4. 해외 뮤지엄 API 동기화
   */
  async runMuseumAPISync() {
    logger.info('🌍 Starting international museum API sync...');

    await museumAPIService.syncAllMuseums();

    const syncStatus = await museumAPIService.getSyncStatus();
    logger.info('✅ Museum API sync completed');

    return syncStatus;
  }

  /**
   * 5. 데이터 정제 및 품질 관리
   */
  async runDataCleanup() {
    logger.info('🧹 Starting data cleanup and quality management...');

    const results = {
      duplicatesRemoved: 0,
      orphanedRecords: 0,
      qualityIssues: 0
    };

    // 중복 전시 제거
    const duplicates = await pool.query(`
      DELETE FROM exhibitions a USING exhibitions b 
      WHERE a.id < b.id 
      AND a.title = b.title 
      AND a.venue_name = b.venue_name 
      AND a.start_date = b.start_date
    `);
    results.duplicatesRemoved = duplicates.rowCount;

    // 고아 레코드 정리
    const orphanedArtists = await pool.query(`
      DELETE FROM exhibition_artists 
      WHERE exhibition_id NOT IN (SELECT id FROM exhibitions)
    `);
    results.orphanedRecords += orphanedArtists.rowCount;

    // 품질 이슈 수정
    await pool.query(`
      UPDATE exhibitions 
      SET status = 'ended' 
      WHERE status = 'ongoing' AND end_date < CURRENT_DATE
    `);

    await pool.query(`
      UPDATE exhibitions 
      SET status = 'upcoming' 
      WHERE status = 'ongoing' AND start_date > CURRENT_DATE
    `);

    logger.info(`✅ Data cleanup completed: ${JSON.stringify(results)}`);
    return results;
  }

  /**
   * 6. 시스템 상태 모니터링
   */
  async runHealthMonitoring() {
    const health = {
      database: await this.checkDatabaseHealth(),
      apis: await this.checkAPIHealth(),
      storage: await this.checkStorageHealth(),
      performance: await this.checkPerformanceMetrics()
    };

    // 문제 발견 시 로깅
    Object.entries(health).forEach(([component, status]) => {
      if (status.status !== 'healthy') {
        logger.warn(`⚠️ Health issue detected in ${component}:`, status);
      }
    });

    // 상태를 DB에 저장
    await pool.query(`
      INSERT INTO system_health_logs (component_status, created_at)
      VALUES ($1, NOW())
    `, [JSON.stringify(health)]);

    return health;
  }

  /**
   * 7. 큐레이션 업데이트
   */
  async runCurationUpdate() {
    logger.info('🎨 Starting curation system update...');

    // 활성 사용자들의 추천 리스트 사전 계산
    const activeUsers = await pool.query(`
      SELECT id FROM users 
      WHERE last_login > NOW() - INTERVAL '7 days'
      AND personality_type IS NOT NULL
      LIMIT 1000
    `);

    let updatedUsers = 0;
    for (const user of activeUsers.rows) {
      try {
        // 백그라운드에서 추천 계산 및 캐싱
        await intelligentCurationEngine.curateExhibitionsForUser(user.id, {
          precompute: true,
          limit: 20
        });
        updatedUsers++;
      } catch (error) {
        logger.error(`Failed to update curation for user ${user.id}:`, error);
      }

      // API 과부하 방지
      if (updatedUsers % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info(`✅ Curation update completed for ${updatedUsers} users`);
    return { updatedUsers };
  }

  /**
   * 8. 일일 통계 집계
   */
  async runDailyStatsAggregation() {
    logger.info('📊 Starting daily statistics aggregation...');

    const today = new Date().toISOString().split('T')[0];

    // 일일 통계 계산
    const dailyStats = await pool.query(`
      INSERT INTO daily_stats (date, total_exhibitions, new_exhibitions, 
                               total_artworks, total_artists, total_venues)
      SELECT 
        $1 as date,
        COUNT(e.id) as total_exhibitions,
        COUNT(CASE WHEN DATE(e.created_at) = $1 THEN 1 END) as new_exhibitions,
        (SELECT COUNT(*) FROM artworks_extended) as total_artworks,
        (SELECT COUNT(*) FROM artists) as total_artists,
        (SELECT COUNT(*) FROM venues WHERE is_active = true) as total_venues
      FROM exhibitions e
      ON CONFLICT (date) DO UPDATE SET
        total_exhibitions = EXCLUDED.total_exhibitions,
        new_exhibitions = EXCLUDED.new_exhibitions,
        total_artworks = EXCLUDED.total_artworks,
        total_artists = EXCLUDED.total_artists,
        total_venues = EXCLUDED.total_venues,
        updated_at = NOW()
    `, [today]);

    logger.info('✅ Daily statistics aggregated');
    return dailyStats;
  }

  /**
   * 작업 실행 로그 저장
   */
  async logTaskExecution(taskName, status, duration, errorMessage = null) {
    try {
      await pool.query(`
        INSERT INTO scheduled_task_logs (task_name, status, duration_ms, error_message, executed_at)
        VALUES ($1, $2, $3, $4, NOW())
      `, [taskName, status, duration, errorMessage]);
    } catch (error) {
      logger.error('Failed to log task execution:', error);
    }
  }

  /**
   * 실패 알림 발송 (필요시 구현)
   */
  async sendFailureAlert(taskName, error) {
    // 이메일, 슬랙, 또는 다른 알림 시스템으로 실패 알림
    logger.error(`🚨 CRITICAL TASK FAILURE: ${taskName}`, error);
  }

  /**
   * 수동 작업 실행
   */
  async runTaskManually(taskName) {
    if (!this.jobs.has(taskName)) {
      throw new Error(`Task ${taskName} not found`);
    }

    const taskMap = {
      'culture-portal-daily': () => this.runCulturePortalCollection(),
      'naver-api-daily': () => this.runNaverAPICollection(),
      'museum-crawling': () => this.runMuseumCrawling(),
      'museum-api-weekly': () => this.runMuseumAPISync(),
      'data-cleanup-weekly': () => this.runDataCleanup(),
      'health-monitor': () => this.runHealthMonitoring(),
      'curation-update': () => this.runCurationUpdate(),
      'daily-stats': () => this.runDailyStatsAggregation()
    };

    const task = taskMap[taskName];
    if (!task) {
      throw new Error(`Task ${taskName} implementation not found`);
    }

    return await this.executeTask(taskName, task);
  }

  /**
   * 스케줄러 중지
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Scheduler is not running');
      return;
    }

    logger.info('⏹️ Stopping SAYU Art Data Collection Scheduler...');

    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`📅 Stopped job: ${name}`);
    }

    this.isRunning = false;
    logger.info('✅ All scheduled jobs stopped');
  }

  /**
   * 현재 상태 조회
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.jobs.keys()),
      stats: this.stats,
      nextRuns: this.getNextRunTimes()
    };
  }

  /**
   * 다음 실행 시간 조회
   */
  getNextRunTimes() {
    const schedules = {
      'culture-portal-daily': '0 6 * * *',
      'naver-api-daily': '0 7 * * *',
      'museum-crawling': '0 14 * * *',
      'museum-api-weekly': '0 3 * * 0',
      'data-cleanup-weekly': '0 23 * * 6',
      'health-monitor': '0 * * * *',
      'curation-update': '0 8 * * *',
      'daily-stats': '0 0 * * *'
    };

    // 실제로는 cron parser를 사용해서 다음 실행 시간 계산
    return schedules;
  }

  // 헬스 체크 메서드들
  async checkDatabaseHealth() {
    try {
      const start = Date.now();
      await pool.query('SELECT 1');
      const responseTime = Date.now() - start;

      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date()
      };
    }
  }

  async checkAPIHealth() {
    const apis = {
      culture_portal: Boolean(process.env.CULTURE_API_KEY),
      naver: Boolean(process.env.NAVER_CLIENT_ID),
      openai: Boolean(process.env.OPENAI_API_KEY),
      rijks: Boolean(process.env.RIJKS_API_KEY)
    };

    return {
      status: Object.values(apis).every(Boolean) ? 'healthy' : 'partial',
      apis,
      lastCheck: new Date()
    };
  }

  async checkStorageHealth() {
    try {
      const result = await pool.query(`
        SELECT 
          pg_database_size(current_database()) as db_size,
          COUNT(*) as total_exhibitions
        FROM exhibitions
      `);

      const dbSize = parseInt(result.rows[0].db_size);
      const totalExhibitions = parseInt(result.rows[0].total_exhibitions);

      return {
        status: dbSize < 10 * 1024 * 1024 * 1024 ? 'healthy' : 'warning', // 10GB 제한
        dbSize,
        totalExhibitions,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date()
      };
    }
  }

  async checkPerformanceMetrics() {
    try {
      const start = Date.now();
      await pool.query(`
        SELECT COUNT(*) FROM exhibitions 
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
      `);
      const queryTime = Date.now() - start;

      return {
        status: queryTime < 1000 ? 'healthy' : 'slow',
        avgQueryTime: queryTime,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date()
      };
    }
  }
}

module.exports = new ArtDataCollectionScheduler();
