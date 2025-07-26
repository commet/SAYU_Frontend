const cron = require('node-cron');
const ArtMapBatchCrawler = require('./batch-crawl-artmap');
const nodemailer = require('nodemailer');
require('dotenv').config();

class ArtMapCronJob {
  constructor() {
    this.batchCrawler = new ArtMapBatchCrawler();
    this.isRunning = false;
    
    // 이메일 설정 (옵션)
    if (process.env.SMTP_HOST) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  // 이메일 알림 전송
  async sendNotification(subject, content) {
    if (!this.emailTransporter || !process.env.ADMIN_EMAIL) {
      console.log('Email notification skipped (not configured)');
      return;
    }

    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `[SAYU ArtMap Crawler] ${subject}`,
        html: content
      });
      console.log('Notification email sent');
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  // 일일 크롤링 작업
  async dailyCrawl() {
    if (this.isRunning) {
      console.log('Crawl already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = new Date();
    console.log(`\n=== Daily ArtMap Crawl Started at ${startTime.toISOString()} ===`);

    try {
      // Tier 1 도시들만 일일 업데이트
      const results = await this.batchCrawler.runBatchCrawl({
        tiers: ['tier1'],
        maxVenuesPerType: 15,
        venueTypes: ['institutions', 'galleries']
      });

      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / 1000 / 60); // 분 단위

      // 결과 요약
      const summary = `
        <h2>Daily ArtMap Crawl Complete</h2>
        <p><strong>Date:</strong> ${startTime.toDateString()}</p>
        <p><strong>Duration:</strong> ${duration} minutes</p>
        <p><strong>Cities processed:</strong> ${results.successful.length}</p>
        <p><strong>Exhibitions found:</strong> ${results.totalStats.exhibitions}</p>
        <p><strong>Venues processed:</strong> ${results.totalStats.venues}</p>
        <p><strong>Errors:</strong> ${results.totalStats.errors}</p>
        
        <h3>Successful Cities:</h3>
        <ul>
          ${results.successful.map(city => 
            `<li>${city.city}: ${city.stats.exhibitionsFound} exhibitions</li>`
          ).join('')}
        </ul>
        
        ${results.failed.length > 0 ? `
          <h3>Failed Cities:</h3>
          <ul>
            ${results.failed.map(city => 
              `<li>${city.city}: ${city.error}</li>`
            ).join('')}
          </ul>
        ` : ''}
      `;

      // 알림 전송
      await this.sendNotification('Daily Crawl Complete', summary);
      
      console.log('\n=== Daily crawl completed successfully ===');

    } catch (error) {
      console.error('Daily crawl failed:', error);
      
      await this.sendNotification(
        'Daily Crawl Failed', 
        `<p>Error: ${error.message}</p><pre>${error.stack}</pre>`
      );
    } finally {
      this.isRunning = false;
    }
  }

  // 주간 전체 크롤링
  async weeklyCrawl() {
    if (this.isRunning) {
      console.log('Crawl already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = new Date();
    console.log(`\n=== Weekly ArtMap Full Crawl Started at ${startTime.toISOString()} ===`);

    try {
      // 모든 tier 도시들 크롤링
      const results = await this.batchCrawler.runBatchCrawl({
        tiers: ['tier1', 'tier2', 'tier3'],
        maxVenuesPerType: 30,
        venueTypes: ['institutions', 'galleries', 'furtherSpaces']
      });

      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / 1000 / 60); // 분 단위

      await this.sendNotification(
        'Weekly Full Crawl Complete',
        `<p>Duration: ${duration} minutes</p>
         <p>Total exhibitions: ${results.totalStats.exhibitions}</p>`
      );

    } catch (error) {
      console.error('Weekly crawl failed:', error);
      await this.sendNotification('Weekly Crawl Failed', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  // 크론 작업 시작
  start() {
    console.log('Starting ArtMap cron jobs...');

    // 매일 오전 3시에 실행 (한국 시간 기준)
    this.dailyJob = cron.schedule('0 3 * * *', () => {
      console.log('Triggering daily crawl...');
      this.dailyCrawl();
    }, {
      timezone: 'Asia/Seoul'
    });

    // 매주 일요일 오전 2시에 전체 크롤링
    this.weeklyJob = cron.schedule('0 2 * * 0', () => {
      console.log('Triggering weekly full crawl...');
      this.weeklyCrawl();
    }, {
      timezone: 'Asia/Seoul'
    });

    console.log('Cron jobs scheduled:');
    console.log('- Daily crawl: Every day at 3:00 AM KST');
    console.log('- Weekly full crawl: Every Sunday at 2:00 AM KST');

    // 즉시 실행 옵션
    if (process.argv.includes('--now')) {
      console.log('\nRunning immediate crawl...');
      this.dailyCrawl();
    }
  }

  // 크론 작업 중지
  stop() {
    if (this.dailyJob) {
      this.dailyJob.stop();
      console.log('Daily job stopped');
    }
    
    if (this.weeklyJob) {
      this.weeklyJob.stop();
      console.log('Weekly job stopped');
    }
  }

  // 수동 실행
  async runManual(type = 'daily') {
    console.log(`Running manual ${type} crawl...`);
    
    if (type === 'weekly') {
      await this.weeklyCrawl();
    } else {
      await this.dailyCrawl();
    }
  }
}

// 메인 실행
if (require.main === module) {
  const cronJob = new ArtMapCronJob();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--manual')) {
    // 수동 실행
    const type = args.includes('--weekly') ? 'weekly' : 'daily';
    cronJob.runManual(type).then(() => {
      process.exit(0);
    }).catch(error => {
      console.error('Manual run failed:', error);
      process.exit(1);
    });
  } else {
    // 크론 작업 시작
    cronJob.start();
    
    // 프로세스 종료 시 정리
    process.on('SIGINT', () => {
      console.log('\nStopping cron jobs...');
      cronJob.stop();
      process.exit(0);
    });
  }
}

module.exports = ArtMapCronJob;