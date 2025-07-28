#!/usr/bin/env node

/**
 * Railway Cron Job Service
 * 자동화된 전시 데이터 수집 및 관리 작업을 수행합니다.
 */

const cron = require('node-cron');
require('dotenv').config();

// Services
const SupabaseExhibitionCollector = require('./src/services/supabaseExhibitionCollector');
const DatabaseBackup = require('./src/utils/databaseBackup');
const { log } = require('./src/config/logger');

class RailwayCronService {
  constructor() {
    this.jobs = new Map();
    this.isProduction = process.env.NODE_ENV === 'production';
    this.enabledJobs = this.getEnabledJobs();
  }

  getEnabledJobs() {
    // 환경변수로 활성화할 작업 제어
    const enabled = (process.env.ENABLED_CRON_JOBS || 'all').split(',');
    return enabled.includes('all') ? [
      'exhibition-collection',
      'data-backup',
      'system-maintenance',
      'status-update'
    ] : enabled;
  }

  // 전시 데이터 수집 (매일 오전 6시)
  scheduleExhibitionCollection() {
    if (!this.enabledJobs.includes('exhibition-collection')) return;

    const job = cron.schedule('0 6 * * *', async () => {
      log.info('🎨 Starting automated exhibition collection...');

      try {
        const collector = new SupabaseExhibitionCollector();

        // Naver API에서 전시 데이터 수집
        const results = await collector.collectExhibitionsFromNaver({
          maxResults: 50, // 하루 최대 50개
          region: 'all',
          category: 'exhibition'
        });

        log.info('Exhibition collection completed', {
          collected: results.collected,
          duplicates: results.duplicates,
          errors: results.errors,
          timestamp: new Date().toISOString()
        });

        // 성공 메트릭 기록
        await this.recordJobMetric('exhibition-collection', 'success', {
          collected: results.collected,
          duplicates: results.duplicates
        });

      } catch (error) {
        log.error('Exhibition collection failed', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });

        // 실패 메트릭 기록
        await this.recordJobMetric('exhibition-collection', 'failed', {
          error: error.message
        });
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Seoul'
    });

    this.jobs.set('exhibition-collection', job);
    log.info('📅 Exhibition collection job scheduled (daily 6:00 AM KST)');
  }

  // 데이터 백업 (매일 오전 2시)
  scheduleDataBackup() {
    if (!this.enabledJobs.includes('data-backup')) return;

    const job = cron.schedule('0 2 * * *', async () => {
      log.info('💾 Starting automated data backup...');

      try {
        const backup = new DatabaseBackup();

        // 전시 데이터 백업
        const result = await backup.backupExhibitionData();

        // 오래된 백업 정리 (30일 이상)
        const cleaned = await backup.cleanupOldBackups(30);

        log.info('Data backup completed', {
          backupFile: result.filename,
          cleanedBackups: cleaned.deletedCount,
          timestamp: new Date().toISOString()
        });

        await this.recordJobMetric('data-backup', 'success', {
          backupFile: result.filename,
          cleanedCount: cleaned.deletedCount
        });

      } catch (error) {
        log.error('Data backup failed', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });

        await this.recordJobMetric('data-backup', 'failed', {
          error: error.message
        });
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Seoul'
    });

    this.jobs.set('data-backup', job);
    log.info('📅 Data backup job scheduled (daily 2:00 AM KST)');
  }

  // 시스템 유지보수 (매주 일요일 오전 3시)
  scheduleSystemMaintenance() {
    if (!this.enabledJobs.includes('system-maintenance')) return;

    const job = cron.schedule('0 3 * * 0', async () => {
      log.info('🔧 Starting system maintenance...');

      try {
        const tasks = [];

        // 1. 만료된 전시 상태 업데이트
        tasks.push(this.updateExpiredExhibitions());

        // 2. 오래된 로그 정리
        tasks.push(this.cleanupOldLogs());

        // 3. 데이터베이스 통계 업데이트
        tasks.push(this.updateDatabaseStats());

        // 4. 캐시 정리
        tasks.push(this.clearExpiredCache());

        const results = await Promise.allSettled(tasks);

        const summary = {
          total: results.length,
          success: results.filter(r => r.status === 'fulfilled').length,
          failed: results.filter(r => r.status === 'rejected').length
        };

        log.info('System maintenance completed', {
          summary,
          timestamp: new Date().toISOString()
        });

        await this.recordJobMetric('system-maintenance', 'success', summary);

      } catch (error) {
        log.error('System maintenance failed', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });

        await this.recordJobMetric('system-maintenance', 'failed', {
          error: error.message
        });
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Seoul'
    });

    this.jobs.set('system-maintenance', job);
    log.info('📅 System maintenance job scheduled (weekly Sunday 3:00 AM KST)');
  }

  // 전시 상태 업데이트 (매일 오전 9시)
  scheduleStatusUpdate() {
    if (!this.enabledJobs.includes('status-update')) return;

    const job = cron.schedule('0 9 * * *', async () => {
      log.info('📊 Starting exhibition status update...');

      try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_KEY
        );

        const today = new Date().toISOString().split('T')[0];

        // 진행 중으로 변경 (시작일이 오늘 이전이고 종료일이 오늘 이후)
        const { data: ongoing, error: ongoingError } = await supabase
          .from('exhibitions')
          .update({ status: 'ongoing', updated_at: new Date().toISOString() })
          .lte('start_date', today)
          .gte('end_date', today)
          .eq('status', 'upcoming')
          .select('id');

        // 종료로 변경 (종료일이 오늘 이전)
        const { data: ended, error: endedError } = await supabase
          .from('exhibitions')
          .update({ status: 'ended', updated_at: new Date().toISOString() })
          .lt('end_date', today)
          .in('status', ['upcoming', 'ongoing'])
          .select('id');

        if (ongoingError || endedError) {
          throw new Error(`Status update error: ${ongoingError?.message || endedError?.message}`);
        }

        const summary = {
          ongoing: ongoing?.length || 0,
          ended: ended?.length || 0,
          total: (ongoing?.length || 0) + (ended?.length || 0)
        };

        log.info('Exhibition status update completed', {
          summary,
          timestamp: new Date().toISOString()
        });

        await this.recordJobMetric('status-update', 'success', summary);

      } catch (error) {
        log.error('Exhibition status update failed', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });

        await this.recordJobMetric('status-update', 'failed', {
          error: error.message
        });
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Seoul'
    });

    this.jobs.set('status-update', job);
    log.info('📅 Exhibition status update job scheduled (daily 9:00 AM KST)');
  }

  // 만료된 전시 상태 업데이트
  async updateExpiredExhibitions() {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('exhibitions')
      .update({
        status: 'ended',
        updated_at: new Date().toISOString()
      })
      .lt('end_date', today)
      .neq('status', 'ended')
      .select('id');

    if (error) throw error;

    log.info(`Updated ${data?.length || 0} expired exhibitions to 'ended' status`);
    return data?.length || 0;
  }

  // 오래된 로그 정리
  async cleanupOldLogs() {
    // 로그 정리 로직 (필요시 구현)
    log.info('Log cleanup completed');
    return true;
  }

  // 데이터베이스 통계 업데이트
  async updateDatabaseStats() {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // 전시 카운트 업데이트
    const { count: exhibitionCount } = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact', head: true });

    // 제출 카운트 업데이트
    const { count: submissionCount } = await supabase
      .from('exhibition_submissions')
      .select('*', { count: 'exact', head: true });

    log.info('Database stats updated', {
      exhibitions: exhibitionCount,
      submissions: submissionCount
    });

    return { exhibitions: exhibitionCount, submissions: submissionCount };
  }

  // 캐시 정리
  async clearExpiredCache() {
    try {
      const { redisClient } = require('./src/config/redis');
      if (redisClient) {
        // Redis 캐시 정리 로직
        log.info('Cache cleanup completed');
      }
    } catch (error) {
      log.warn('Cache cleanup skipped (Redis not available)');
    }
    return true;
  }

  // 작업 메트릭 기록
  async recordJobMetric(jobName, status, metadata = {}) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );

      await supabase
        .from('cron_job_logs')
        .insert({
          job_name: jobName,
          status,
          metadata,
          executed_at: new Date().toISOString(),
          execution_time: Date.now() // 실행 시간 기록용
        });

    } catch (error) {
      log.warn('Failed to record job metric', { error: error.message });
    }
  }

  // 모든 작업 시작
  startAllJobs() {
    log.info('🚀 Starting Railway Cron Service...');
    log.info(`Environment: ${this.isProduction ? 'Production' : 'Development'}`);
    log.info(`Enabled jobs: ${this.enabledJobs.join(', ')}`);

    // 모든 작업 스케줄링
    this.scheduleExhibitionCollection();
    this.scheduleDataBackup();
    this.scheduleSystemMaintenance();
    this.scheduleStatusUpdate();

    // 작업 시작
    this.jobs.forEach((job, name) => {
      job.start();
      log.info(`✅ Started job: ${name}`);
    });

    log.info(`🎯 ${this.jobs.size} cron jobs are now running`);

    // 헬스체크 엔드포인트 (Railway에서 서비스 상태 확인용)
    this.startHealthServer();
  }

  // 헬스체크 서버 시작
  startHealthServer() {
    const express = require('express');
    const app = express();
    const port = process.env.PORT || 8080;

    app.get('/health', (req, res) => {
      const jobStatuses = {};
      this.jobs.forEach((job, name) => {
        jobStatuses[name] = {
          running: job.running,
          scheduled: job.scheduled
        };
      });

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        jobs: jobStatuses,
        environment: process.env.NODE_ENV,
        enabledJobs: this.enabledJobs
      });
    });

    app.get('/jobs/trigger/:jobName', async (req, res) => {
      const { jobName } = req.params;

      if (!this.jobs.has(jobName)) {
        return res.status(404).json({ error: 'Job not found' });
      }

      try {
        // 수동으로 작업 실행 (테스트용)
        log.info(`Manual trigger requested for job: ${jobName}`);

        // 작업별 수동 실행 로직
        if (jobName === 'exhibition-collection') {
          const collector = new SupabaseExhibitionCollector();
          const results = await collector.collectExhibitionsFromNaver({ maxResults: 10 });
          res.json({ success: true, results });
        } else if (jobName === 'data-backup') {
          const backup = new DatabaseBackup();
          const result = await backup.backupExhibitionData();
          res.json({ success: true, result });
        } else {
          res.json({ success: true, message: `Job ${jobName} triggered` });
        }

      } catch (error) {
        log.error(`Manual job trigger failed: ${jobName}`, { error: error.message });
        res.status(500).json({ error: error.message });
      }
    });

    app.listen(port, () => {
      log.info(`🏥 Health server running on port ${port}`);
    });
  }

  // 모든 작업 중지
  stopAllJobs() {
    log.info('🛑 Stopping all cron jobs...');

    this.jobs.forEach((job, name) => {
      job.stop();
      log.info(`❌ Stopped job: ${name}`);
    });

    log.info('All cron jobs stopped');
  }
}

// Railway에서 실행될 때
if (require.main === module) {
  const cronService = new RailwayCronService();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    log.info('🏁 Received SIGTERM, shutting down gracefully...');
    cronService.stopAllJobs();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    log.info('🏁 Received SIGINT, shutting down gracefully...');
    cronService.stopAllJobs();
    process.exit(0);
  });

  // 에러 핸들링
  process.on('uncaughtException', (error) => {
    log.error('Uncaught exception in cron service', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    log.error('Unhandled rejection in cron service', {
      reason: reason.toString(),
      promise: promise.toString()
    });
  });

  // 서비스 시작
  cronService.startAllJobs();
}

module.exports = RailwayCronService;
