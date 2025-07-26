const cron = require('node-cron');
const GlobalMuseumCollectorService = require('../services/globalMuseumCollectorService');
const logger = require('../utils/logger');

class GlobalMuseumCronScheduler {
    constructor() {
        this.collector = new GlobalMuseumCollectorService();
        this.isRunning = false;
        this.scheduledJobs = new Map();
        
        // Configuration from environment variables
        this.config = {
            enabled: process.env.ENABLE_GLOBAL_MUSEUM_COLLECTION === 'true',
            autoStart: process.env.AUTO_START_CRON === 'true',
            timezone: process.env.TZ || 'UTC',
            
            // Collection schedules
            schedules: {
                // Daily web scraping (fast updates)
                daily_web: {
                    schedule: '0 2 * * *', // Every day at 2 AM
                    sources: ['web_scraping'],
                    cities: null, // All cities
                    description: 'Daily web scraping for fresh exhibition data'
                },
                
                // Weekly API collection (comprehensive updates) 
                weekly_api: {
                    schedule: '0 3 * * 0', // Every Sunday at 3 AM
                    sources: ['google_places', 'foursquare'],
                    cities: null, // All cities
                    description: 'Weekly API collection for venue updates'
                },
                
                // Monthly full collection (data cleanup)
                monthly_full: {
                    schedule: '0 4 1 * *', // First day of month at 4 AM
                    sources: ['google_places', 'foursquare', 'web_scraping'],
                    cities: null, // All cities
                    description: 'Monthly comprehensive collection and cleanup'
                },
                
                // Daily rotating city collection (spread the load)
                rotating_daily: {
                    schedule: '0 18 * * *', // Every day at 6 PM
                    sources: ['google_places', 'foursquare'],
                    cities: 'rotating', // Special value for rotating cities
                    description: 'Daily rotating city collection'
                }
            }
        };

        // City rotation schedule (7-day cycle)
        this.cityRotation = [
            ['New York', 'London'],      // Monday
            ['Tokyo', 'Paris'],          // Tuesday  
            ['Hong Kong', 'Seoul'],      // Wednesday
            ['Berlin', 'Barcelona'],     // Thursday
            ['Amsterdam', 'Milan'],      // Friday
            ['New York', 'Tokyo'],       // Saturday
            ['Paris', 'London']          // Sunday
        ];
    }

    start() {
        if (!this.config.enabled) {
            logger.info('Global museum collection cron is disabled');
            return;
        }

        logger.info('Starting Global Museum Collection Cron Scheduler');

        // Schedule all configured jobs
        Object.entries(this.config.schedules).forEach(([jobName, jobConfig]) => {
            this.scheduleJob(jobName, jobConfig);
        });

        // Start status monitoring
        this.scheduleStatusMonitoring();

        logger.info(`Scheduled ${this.scheduledJobs.size} collection jobs`);
    }

    scheduleJob(jobName, jobConfig) {
        try {
            const task = cron.schedule(jobConfig.schedule, async () => {
                await this.executeCollectionJob(jobName, jobConfig);
            }, {
                scheduled: true,
                timezone: this.config.timezone
            });

            this.scheduledJobs.set(jobName, {
                task,
                config: jobConfig,
                lastRun: null,
                nextRun: this.getNextRunTime(jobConfig.schedule)
            });

            logger.info(`Scheduled job: ${jobName} - ${jobConfig.description}`, {
                schedule: jobConfig.schedule,
                nextRun: this.getNextRunTime(jobConfig.schedule)
            });

        } catch (error) {
            logger.error(`Failed to schedule job: ${jobName}`, error);
        }
    }

    async executeCollectionJob(jobName, jobConfig) {
        if (this.isRunning) {
            logger.warn(`Skipping ${jobName} - another collection is already running`);
            return;
        }

        this.isRunning = true;
        const startTime = Date.now();

        try {
            logger.info(`Starting scheduled collection job: ${jobName}`, {
                sources: jobConfig.sources,
                cities: jobConfig.cities
            });

            // Determine cities for this job
            const cities = this.resolveCities(jobConfig.cities);

            // Execute collection
            const results = await this.collector.collectGlobalVenues({
                cities,
                sources: jobConfig.sources,
                batchSize: 25, // Smaller batch for cron jobs
                testMode: false
            });

            const duration = Math.round((Date.now() - startTime) / 1000);

            logger.info(`Completed collection job: ${jobName}`, {
                duration: `${duration}s`,
                results: {
                    total: results.total_venues,
                    successful: results.successful,
                    failed: results.failed,
                    duplicates: results.duplicates
                }
            });

            // Update job tracking
            const job = this.scheduledJobs.get(jobName);
            if (job) {
                job.lastRun = new Date();
                job.nextRun = this.getNextRunTime(jobConfig.schedule);
            }

            // Send success notification if configured
            await this.sendJobNotification(jobName, 'success', results, duration);

        } catch (error) {
            const duration = Math.round((Date.now() - startTime) / 1000);
            
            logger.error(`Collection job failed: ${jobName}`, {
                error: error.message,
                duration: `${duration}s`
            });

            // Send failure notification
            await this.sendJobNotification(jobName, 'failed', null, duration, error);

        } finally {
            this.isRunning = false;
        }
    }

    resolveCities(citiesConfig) {
        if (!citiesConfig || citiesConfig === null) {
            return null; // All cities
        }

        if (citiesConfig === 'rotating') {
            // Get today's cities based on day of week
            const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
            const rotationIndex = dayOfWeek; // Direct mapping
            return this.cityRotation[rotationIndex] || this.cityRotation[0];
        }

        if (Array.isArray(citiesConfig)) {
            return citiesConfig;
        }

        return null; // Default to all cities
    }

    scheduleStatusMonitoring() {
        // Daily status check at 12 PM
        const statusTask = cron.schedule('0 12 * * *', async () => {
            await this.performDailyStatusCheck();
        }, {
            scheduled: true,
            timezone: this.config.timezone
        });

        this.scheduledJobs.set('daily_status_check', {
            task: statusTask,
            config: {
                schedule: '0 12 * * *',
                description: 'Daily status monitoring and quality checks'
            },
            lastRun: null,
            nextRun: this.getNextRunTime('0 12 * * *')
        });
    }

    async performDailyStatusCheck() {
        try {
            logger.info('Performing daily status check');

            // Get collection statistics
            const status = await this.collector.getCollectionStatus();
            const cityStats = await this.collector.getCityStatistics();
            const recentLogs = await this.collector.getRecentLogs(5);

            // Calculate quality metrics
            const qualityMetrics = this.calculateQualityMetrics(status, cityStats, recentLogs);

            // Log status summary
            logger.info('Daily status check completed', {
                totalVenues: status.total_venues,
                avgQuality: parseFloat(status.avg_quality_score || 0).toFixed(1),
                citiesCovered: status.cities_covered,
                qualityScore: qualityMetrics.overallScore
            });

            // Update database metrics
            await this.updateDailyMetrics(status, cityStats, qualityMetrics);

            // Send alert if quality is low
            if (qualityMetrics.overallScore < 70) {
                await this.sendQualityAlert(qualityMetrics);
            }

        } catch (error) {
            logger.error('Daily status check failed', error);
        }
    }

    calculateQualityMetrics(status, cityStats, recentLogs) {
        const metrics = {
            dataCompleteness: 0,
            collectionSuccess: 0,
            geographicCoverage: 0,
            dataFreshness: 0,
            overallScore: 0
        };

        // Data completeness (0-100)
        const expectedVenues = 1500; // Rough estimate across all cities
        metrics.dataCompleteness = Math.min((status.total_venues / expectedVenues) * 100, 100);

        // Collection success rate (0-100)
        const recentSuccess = recentLogs.filter(log => log.status === 'completed').length;
        metrics.collectionSuccess = recentLogs.length > 0 ? (recentSuccess / recentLogs.length) * 100 : 0;

        // Geographic coverage (0-100)
        const expectedCities = Object.keys(this.collector.cityConfigs || {}).length;
        metrics.geographicCoverage = expectedCities > 0 ? (status.cities_covered / expectedCities) * 100 : 0;

        // Data freshness (0-100, based on recent activity)
        const recentActivity = recentLogs.filter(log => {
            const logDate = new Date(log.started_at);
            const daysSince = (Date.now() - logDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSince <= 1; // Within last day
        }).length;
        metrics.dataFreshness = Math.min(recentActivity * 25, 100); // Each recent activity = 25 points

        // Overall score (weighted average)
        metrics.overallScore = (
            metrics.dataCompleteness * 0.3 +
            metrics.collectionSuccess * 0.3 +
            metrics.geographicCoverage * 0.2 +
            metrics.dataFreshness * 0.2
        );

        return metrics;
    }

    async updateDailyMetrics(status, cityStats, qualityMetrics) {
        try {
            const client = await this.collector.pool.connect();
            
            await client.query(`
                INSERT INTO global_data_quality_metrics (
                    metric_date, total_venues, average_venue_quality_score,
                    countries_covered, cities_covered,
                    google_places_venues, foursquare_venues, web_scraped_venues,
                    collection_success_rate, data_freshness_days
                ) VALUES (
                    CURRENT_DATE, $1, $2, $3, $4, $5, $6, $7, $8, $9
                ) ON CONFLICT (metric_date) DO UPDATE SET
                    total_venues = EXCLUDED.total_venues,
                    average_venue_quality_score = EXCLUDED.average_venue_quality_score,
                    countries_covered = EXCLUDED.countries_covered,
                    cities_covered = EXCLUDED.cities_covered,
                    google_places_venues = EXCLUDED.google_places_venues,
                    foursquare_venues = EXCLUDED.foursquare_venues,
                    web_scraped_venues = EXCLUDED.web_scraped_venues,
                    collection_success_rate = EXCLUDED.collection_success_rate,
                    data_freshness_days = EXCLUDED.data_freshness_days
            `, [
                status.total_venues,
                status.avg_quality_score,
                status.countries_covered,
                status.cities_covered,
                status.google_venues,
                status.foursquare_venues,
                status.scraped_venues,
                qualityMetrics.collectionSuccess,
                1 // Assume 1 day freshness for daily updates
            ]);

            client.release();
        } catch (error) {
            logger.error('Failed to update daily metrics', error);
        }
    }

    async sendJobNotification(jobName, status, results, duration, error = null) {
        // This would integrate with your notification system (email, Slack, etc.)
        // For now, just log the notification
        
        const notification = {
            job: jobName,
            status,
            duration: `${duration}s`,
            timestamp: new Date().toISOString()
        };

        if (results) {
            notification.results = {
                total: results.total_venues,
                successful: results.successful,
                failed: results.failed,
                duplicates: results.duplicates
            };
        }

        if (error) {
            notification.error = error.message;
        }

        logger.info('Job notification', notification);

        // TODO: Implement actual notification sending (email, webhook, etc.)
    }

    async sendQualityAlert(qualityMetrics) {
        logger.warn('Data quality alert triggered', {
            overallScore: qualityMetrics.overallScore.toFixed(1),
            metrics: qualityMetrics
        });

        // TODO: Implement alert sending (email, Slack, etc.)
    }

    getNextRunTime(cronExpression) {
        try {
            // This is a simplified calculation - in production you'd use a proper cron parser
            return 'Next run time calculation needed';
        } catch (error) {
            return 'Unknown';
        }
    }

    stop() {
        logger.info('Stopping Global Museum Collection Cron Scheduler');
        
        this.scheduledJobs.forEach((job, jobName) => {
            if (job.task) {
                job.task.stop();
            }
        });

        this.scheduledJobs.clear();
        logger.info('All scheduled jobs stopped');
    }

    getStatus() {
        const jobs = [];
        
        this.scheduledJobs.forEach((job, jobName) => {
            jobs.push({
                name: jobName,
                description: job.config.description,
                schedule: job.config.schedule,
                lastRun: job.lastRun,
                nextRun: job.nextRun,
                isRunning: job.task ? job.task.running : false
            });
        });

        return {
            enabled: this.config.enabled,
            isRunning: this.isRunning,
            timezone: this.config.timezone,
            jobs
        };
    }

    // Manual execution methods
    async runJobNow(jobName) {
        const job = this.scheduledJobs.get(jobName);
        if (!job) {
            throw new Error(`Job not found: ${jobName}`);
        }

        logger.info(`Manually executing job: ${jobName}`);
        await this.executeCollectionJob(jobName, job.config);
    }

    async runFullCollection() {
        logger.info('Manually executing full collection');
        await this.executeCollectionJob('manual_full', {
            sources: ['google_places', 'foursquare', 'web_scraping'],
            cities: null,
            description: 'Manual full collection'
        });
    }

    async runTestCollection(cities = ['Tokyo']) {
        logger.info('Manually executing test collection');
        await this.executeCollectionJob('manual_test', {
            sources: ['google_places', 'foursquare'],
            cities,
            description: 'Manual test collection'
        });
    }
}

// Export singleton instance
const globalMuseumCron = new GlobalMuseumCronScheduler();

// Auto-start if configured
if (globalMuseumCron.config.autoStart) {
    globalMuseumCron.start();
}

module.exports = globalMuseumCron;