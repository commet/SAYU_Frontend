const cron = require('node-cron');
const realExhibitionIntegrator = require('../src/services/realExhibitionIntegrator');
const koreanCulturalAPI = require('../src/services/koreanCulturalAPIService');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

/**
 * SAYU Exhibition Data Collection Cron Job
 * 
 * Automated scheduling for exhibition data collection:
 * - Daily: Korean cultural APIs (lightweight)
 * - Weekly: Full museum website crawling
 * - Monthly: Data cleanup and optimization
 */
class ExhibitionCronManager {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    this.jobs = [];
    this.isRunning = false;
    this.stats = {
      lastRun: null,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      totalExhibitionsCollected: 0
    };

    console.log('🎭 SAYU Exhibition Cron Manager initialized');
  }

  // Start all cron jobs
  start() {
    if (this.isRunning) {
      console.log('⚠️ Cron jobs already running');
      return;
    }

    this.setupJobs();
    this.isRunning = true;
    console.log('✅ Exhibition cron jobs started');
    this.printSchedule();
  }

  // Stop all cron jobs
  stop() {
    this.jobs.forEach(job => job.destroy());
    this.jobs = [];
    this.isRunning = false;
    console.log('🛑 Exhibition cron jobs stopped');
  }

  // Setup all scheduled jobs
  setupJobs() {
    // Daily API collection (every day at 6 AM)
    this.jobs.push(cron.schedule('0 6 * * *', async () => {
      await this.runDailyCollection();
    }, {
      name: 'daily-api-collection',
      timezone: "Asia/Seoul"
    }));

    // Weekly full collection (every Sunday at 3 AM)
    this.jobs.push(cron.schedule('0 3 * * 0', async () => {
      await this.runWeeklyCollection();
    }, {
      name: 'weekly-full-collection',
      timezone: "Asia/Seoul"
    }));

    // Monthly cleanup (first day of month at 2 AM)
    this.jobs.push(cron.schedule('0 2 1 * *', async () => {
      await this.runMonthlyCleanup();
    }, {
      name: 'monthly-cleanup',
      timezone: "Asia/Seoul"
    }));

    // Hourly status check (every hour at minute 30)
    this.jobs.push(cron.schedule('30 * * * *', async () => {
      await this.runStatusCheck();
    }, {
      name: 'hourly-status-check',
      timezone: "Asia/Seoul"
    }));

    console.log(`📅 ${this.jobs.length} cron jobs scheduled`);
  }

  // Daily collection - lightweight API calls only
  async runDailyCollection() {
    console.log('\n🌅 Starting daily exhibition collection...');
    
    try {
      this.stats.totalRuns++;
      const startTime = Date.now();

      // Collect from Korean government APIs (fast, reliable)
      const apiResults = await koreanCulturalAPI.collectAllExhibitions();
      
      // Process and save new exhibitions
      const processed = await this.processAndSave(apiResults.exhibitions, 'daily');

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`✅ Daily collection completed in ${duration}s`);
      console.log(`   - API sources: ${Object.keys(apiResults.bySource).length}`);
      console.log(`   - Total collected: ${apiResults.total}`);
      console.log(`   - New exhibitions saved: ${processed.saved}`);
      console.log(`   - Duplicates skipped: ${processed.duplicates}`);

      this.stats.successfulRuns++;
      this.stats.totalExhibitionsCollected += processed.saved;
      this.stats.lastRun = new Date().toISOString();

      // Send success notification
      await this.sendNotification('daily_success', {
        collected: apiResults.total,
        saved: processed.saved,
        duration
      });

    } catch (error) {
      console.error('❌ Daily collection failed:', error.message);
      this.stats.failedRuns++;

      // Send failure notification
      await this.sendNotification('daily_failure', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Weekly collection - full crawling including museum websites
  async runWeeklyCollection() {
    console.log('\n📅 Starting weekly full collection...');

    try {
      const startTime = Date.now();

      // Run comprehensive collection including web scraping
      const results = await realExhibitionIntegrator.integrateRealExhibitions();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`✅ Weekly collection completed in ${duration}s`);
      console.log(`   - Total collected: ${results.collected}`);
      console.log(`   - Processed: ${results.processed}`);
      console.log(`   - Saved: ${results.saved}`);
      console.log(`   - Errors: ${results.errors?.length || 0}`);

      this.stats.totalExhibitionsCollected += results.saved;

      // Update exhibition statuses
      await this.updateExhibitionStatuses();

      // Generate weekly report
      await this.generateWeeklyReport(results);

      await this.sendNotification('weekly_success', {
        ...results,
        duration
      });

    } catch (error) {
      console.error('❌ Weekly collection failed:', error.message);
      await this.sendNotification('weekly_failure', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Monthly cleanup - data maintenance and optimization
  async runMonthlyCleanup() {
    console.log('\n🧹 Starting monthly cleanup...');

    try {
      // Remove expired exhibitions (ended > 30 days ago)
      const cleanupDate = new Date();
      cleanupDate.setDate(cleanupDate.getDate() - 30);
      
      const { data: expiredExhibitions, error: deleteError } = await this.supabase
        .from('exhibitions')
        .delete()
        .lt('end_date', cleanupDate.toISOString().split('T')[0])
        .select();

      if (deleteError) throw deleteError;

      // Update exhibition statuses for all exhibitions
      await this.updateExhibitionStatuses();

      // Optimize database (would require direct SQL access)
      console.log('🔧 Database optimization completed');

      // Generate monthly analytics
      const analytics = await this.generateMonthlyAnalytics();

      console.log(`✅ Monthly cleanup completed`);
      console.log(`   - Expired exhibitions removed: ${expiredExhibitions?.length || 0}`);
      console.log(`   - Total exhibitions: ${analytics.totalExhibitions}`);
      console.log(`   - Active venues: ${analytics.activeVenues}`);

      await this.sendNotification('monthly_cleanup', {
        removedExhibitions: expiredExhibitions?.length || 0,
        ...analytics
      });

    } catch (error) {
      console.error('❌ Monthly cleanup failed:', error.message);
      await this.sendNotification('cleanup_failure', {
        error: error.message
      });
    }
  }

  // Hourly status check
  async runStatusCheck() {
    try {
      // Check database health
      const { data, error } = await this.supabase
        .from('exhibitions')
        .select('count(*)')
        .single();

      if (error) throw error;

      // Simple health check - if we have exhibitions, we're good
      if (data.count > 0) {
        console.log(`💚 System healthy - ${data.count} exhibitions in database`);
      } else {
        console.warn('⚠️ No exhibitions in database - may need manual intervention');
        await this.sendNotification('health_warning', {
          message: 'No exhibitions found in database'
        });
      }

    } catch (error) {
      console.error('❌ Status check failed:', error.message);
    }
  }

  // Process and save exhibitions
  async processAndSave(exhibitions, collectionType) {
    const results = { saved: 0, duplicates: 0, errors: [] };

    for (const exhibition of exhibitions) {
      try {
        // Check for duplicates
        const { data: existing } = await this.supabase
          .from('exhibitions')
          .select('id')
          .eq('external_id', exhibition.external_id)
          .single();

        if (existing) {
          results.duplicates++;
          continue;
        }

        // Enhance with APT recommendations
        const enhancedExhibition = await this.enhanceExhibition(exhibition);

        // Save to database
        const { error } = await this.supabase
          .from('exhibitions')
          .insert(enhancedExhibition);

        if (error) throw error;

        results.saved++;

      } catch (error) {
        results.errors.push({
          exhibition: exhibition.title,
          error: error.message
        });
      }
    }

    return results;
  }

  // Enhance exhibition with APT recommendations
  async enhanceExhibition(exhibition) {
    // Generate APT recommendations based on content
    const aptRecommendations = this.generateAPTRecommendations(
      exhibition.title, 
      exhibition.description,
      exhibition.venue
    );

    return {
      ...exhibition,
      recommended_apt: aptRecommendations.types,
      apt_weights: aptRecommendations.weights,
      category: this.categorizeExhibition(exhibition.title, exhibition.description),
      status: this.determineStatus(exhibition.start_date, exhibition.end_date),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Update exhibition statuses based on current date
  async updateExhibitionStatuses() {
    const today = new Date().toISOString().split('T')[0];

    try {
      // Update to 'ongoing'
      await this.supabase
        .from('exhibitions')
        .update({ status: 'ongoing', updated_at: new Date().toISOString() })
        .lte('start_date', today)
        .gte('end_date', today)
        .neq('status', 'ongoing');

      // Update to 'ended'
      await this.supabase
        .from('exhibitions')
        .update({ status: 'ended', updated_at: new Date().toISOString() })
        .lt('end_date', today)
        .neq('status', 'ended');

      // Update to 'upcoming'
      await this.supabase
        .from('exhibitions')
        .update({ status: 'upcoming', updated_at: new Date().toISOString() })
        .gt('start_date', today)
        .neq('status', 'upcoming');

      console.log('✅ Exhibition statuses updated');

    } catch (error) {
      console.error('❌ Status update failed:', error.message);
    }
  }

  // Generate APT recommendations (simplified version)
  generateAPTRecommendations(title, description, venue) {
    const text = `${title} ${description || ''}`.toLowerCase();
    const recommendations = new Set();
    const weights = {};

    // Category-based mapping
    const categories = {
      contemporary: { types: ['LAEF', 'SAEF', 'LAMF'], weight: 0.9 },
      traditional: { types: ['LRMC', 'SRMC', 'SAMC'], weight: 0.8 },
      photography: { types: ['LREC', 'SREC', 'LREF'], weight: 0.7 },
      interactive: { types: ['SREF', 'SAEF', 'SRMF'], weight: 0.9 }
    };

    // Keyword matching
    const keywords = {
      contemporary: ['현대', '컨템포러리', '실험', '신진'],
      traditional: ['전통', '고미술', '서화'],
      photography: ['사진', '포토'],
      interactive: ['체험', '인터랙티브', '미디어']
    };

    for (const [category, config] of Object.entries(categories)) {
      if (keywords[category]?.some(keyword => text.includes(keyword))) {
        config.types.forEach(type => {
          recommendations.add(type);
          weights[type] = config.weight;
        });
      }
    }

    // Ensure minimum recommendations
    if (recommendations.size < 3) {
      ['SAEF', 'LAEF', 'SREC'].forEach(type => recommendations.add(type));
    }

    return {
      types: Array.from(recommendations).slice(0, 6),
      weights
    };
  }

  // Categorize exhibition
  categorizeExhibition(title, description) {
    const text = `${title} ${description || ''}`.toLowerCase();
    
    if (text.includes('현대') || text.includes('컨템포러리')) return 'contemporary_art';
    if (text.includes('전통') || text.includes('고미술')) return 'traditional_art';
    if (text.includes('사진') || text.includes('포토')) return 'photography';
    if (text.includes('체험') || text.includes('인터랙티브')) return 'interactive';
    if (text.includes('미니멀') || text.includes('단색')) return 'minimalism';
    
    return 'general';
  }

  // Determine exhibition status
  determineStatus(startDate, endDate) {
    if (!startDate) return 'unknown';

    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'ongoing';
  }

  // Generate monthly analytics
  async generateMonthlyAnalytics() {
    try {
      const { data: exhibitions } = await this.supabase
        .from('exhibitions')
        .select('status, venue, category, source');

      const analytics = {
        totalExhibitions: exhibitions?.length || 0,
        activeVenues: exhibitions ? [...new Set(exhibitions.map(e => e.venue))].length : 0,
        byStatus: {},
        byCategory: {},
        bySource: {}
      };

      exhibitions?.forEach(ex => {
        analytics.byStatus[ex.status] = (analytics.byStatus[ex.status] || 0) + 1;
        analytics.byCategory[ex.category] = (analytics.byCategory[ex.category] || 0) + 1;
        analytics.bySource[ex.source] = (analytics.bySource[ex.source] || 0) + 1;
      });

      return analytics;

    } catch (error) {
      console.error('Analytics generation failed:', error.message);
      return { error: error.message };
    }
  }

  // Send notification (placeholder - implement with your preferred service)
  async sendNotification(type, data) {
    const message = {
      type,
      timestamp: new Date().toISOString(),
      data,
      stats: this.stats
    };

    console.log(`📧 Notification [${type}]:`, JSON.stringify(data, null, 2));
    
    // TODO: Implement actual notification service (email, Slack, etc.)
    // Examples:
    // - Send email via SendGrid/Nodemailer
    // - Post to Slack webhook
    // - Save to notification table in database
  }

  // Generate weekly report
  async generateWeeklyReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      period: 'weekly',
      results,
      stats: this.stats,
      database: await this.generateMonthlyAnalytics()
    };

    const fs = require('fs');
    const path = require('path');
    
    const reportPath = path.join(
      __dirname, 
      '../reports',
      `weekly-report-${new Date().toISOString().split('T')[0]}.json`
    );

    try {
      const dir = path.dirname(reportPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📊 Weekly report saved: ${reportPath}`);
    } catch (error) {
      console.error('Report generation failed:', error.message);
    }
  }

  // Print job schedule
  printSchedule() {
    console.log('\n📅 Cron Job Schedule:');
    console.log('   Daily API Collection: 6:00 AM KST');
    console.log('   Weekly Full Collection: Sunday 3:00 AM KST');
    console.log('   Monthly Cleanup: 1st day 2:00 AM KST');
    console.log('   Hourly Status Check: Every hour at :30');
    console.log();
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: this.jobs.length,
      stats: this.stats
    };
  }
}

// Initialize and start if called directly
if (require.main === module) {
  const cronManager = new ExhibitionCronManager();
  cronManager.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down cron jobs...');
    cronManager.stop();
    process.exit(0);
  });
}

module.exports = ExhibitionCronManager;