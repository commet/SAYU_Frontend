const cron = require('node-cron');
const exhibitionCollectorService = require('../services/exhibitionCollectorService');
const Venue = require('../models/venue');
const { Op } = require('sequelize');

class ExhibitionCollectorCron {
  constructor() {
    this.dailyJobs = [];
    this.weeklyJobs = [];
  }

  start() {
    console.log('Starting exhibition collector cron jobs...');

    // Daily collection for Tier 1 venues (3 AM KST)
    this.dailyJobs.push(
      cron.schedule('0 3 * * *', async () => {
        console.log('Running daily exhibition collection...');
        await this.collectDailyExhibitions();
      }, {
        timezone: 'Asia/Seoul'
      })
    );

    // Twice weekly collection for Tier 2 venues (Tuesday & Friday, 3:30 AM KST)
    this.dailyJobs.push(
      cron.schedule('30 3 * * 2,5', async () => {
        console.log('Running twice-weekly exhibition collection...');
        await this.collectTwiceWeeklyExhibitions();
      }, {
        timezone: 'Asia/Seoul'
      })
    );

    // Weekly collection for Tier 3 venues (Sunday, 4 AM KST)
    this.weeklyJobs.push(
      cron.schedule('0 4 * * 0', async () => {
        console.log('Running weekly exhibition collection...');
        await this.collectWeeklyExhibitions();
      }, {
        timezone: 'Asia/Seoul'
      })
    );

    // Clean up old exhibitions (Daily at 2 AM KST)
    this.dailyJobs.push(
      cron.schedule('0 2 * * *', async () => {
        console.log('Cleaning up old exhibitions...');
        await this.cleanupOldExhibitions();
      }, {
        timezone: 'Asia/Seoul'
      })
    );

    console.log('Exhibition collector cron jobs started!');
  }

  async collectDailyExhibitions() {
    try {
      const venues = await Venue.findAll({
        where: {
          isActive: true,
          tier: '1',
          crawlFrequency: 'daily'
        }
      });

      console.log(`Collecting exhibitions for ${venues.length} Tier 1 venues...`);

      for (const venue of venues) {
        try {
          const results = await exhibitionCollectorService.searchNaverForVenue(venue);
          console.log(`Collected ${results.length} exhibitions for ${venue.name}`);

          // Update last crawled timestamp
          venue.lastCrawledAt = new Date();
          await venue.save();

          // Rate limiting
          await this.delay(2000);
        } catch (error) {
          console.error(`Failed to collect for ${venue.name}:`, error);
        }
      }

      // Collect international exhibitions
      if (process.env.ENABLE_INTERNATIONAL_COLLECTION === 'true') {
        await this.collectInternationalExhibitions();
      }

    } catch (error) {
      console.error('Daily collection error:', error);
    }
  }

  async collectTwiceWeeklyExhibitions() {
    try {
      const venues = await Venue.findAll({
        where: {
          isActive: true,
          tier: '2',
          crawlFrequency: 'twice_weekly'
        }
      });

      console.log(`Collecting exhibitions for ${venues.length} Tier 2 venues...`);

      for (const venue of venues) {
        try {
          const results = await exhibitionCollectorService.searchNaverForVenue(venue);
          console.log(`Collected ${results.length} exhibitions for ${venue.name}`);

          venue.lastCrawledAt = new Date();
          await venue.save();

          await this.delay(2000);
        } catch (error) {
          console.error(`Failed to collect for ${venue.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Twice-weekly collection error:', error);
    }
  }

  async collectWeeklyExhibitions() {
    try {
      const venues = await Venue.findAll({
        where: {
          isActive: true,
          tier: '3',
          crawlFrequency: 'weekly'
        }
      });

      console.log(`Collecting exhibitions for ${venues.length} Tier 3 venues...`);

      for (const venue of venues) {
        try {
          const results = await exhibitionCollectorService.searchNaverForVenue(venue);
          console.log(`Collected ${results.length} exhibitions for ${venue.name}`);

          venue.lastCrawledAt = new Date();
          await venue.save();

          await this.delay(2000);
        } catch (error) {
          console.error(`Failed to collect for ${venue.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Weekly collection error:', error);
    }
  }

  async collectInternationalExhibitions() {
    try {
      console.log('Collecting international exhibitions...');

      // Priority cities
      const cities = ['New York', 'London', 'Paris', 'Tokyo', 'Hong Kong'];

      for (const city of cities) {
        const venues = await Venue.findAll({
          where: {
            isActive: true,
            city,
            country: { [Op.ne]: 'KR' }
          }
        });

        for (const venue of venues) {
          // This would use web scraping or other APIs
          // For now, using placeholder
          console.log(`Would collect exhibitions for ${venue.name} in ${city}`);
          await this.delay(3000);
        }
      }
    } catch (error) {
      console.error('International collection error:', error);
    }
  }

  async cleanupOldExhibitions() {
    try {
      const Exhibition = require('../models/exhibition');

      // Update exhibition statuses
      const now = new Date();

      // Mark ended exhibitions
      await Exhibition.update(
        { status: 'ended' },
        {
          where: {
            endDate: { [Op.lt]: now },
            status: { [Op.ne]: 'ended' }
          }
        }
      );

      // Mark ongoing exhibitions
      await Exhibition.update(
        { status: 'ongoing' },
        {
          where: {
            startDate: { [Op.lte]: now },
            endDate: { [Op.gte]: now },
            status: { [Op.ne]: 'ongoing' }
          }
        }
      );

      // Delete very old unverified exhibitions (older than 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const deleted = await Exhibition.destroy({
        where: {
          createdAt: { [Op.lt]: sixMonthsAgo },
          verificationStatus: { [Op.ne]: 'verified' }
        }
      });

      console.log(`Cleaned up ${deleted} old unverified exhibitions`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    console.log('Stopping exhibition collector cron jobs...');

    this.dailyJobs.forEach(job => job.stop());
    this.weeklyJobs.forEach(job => job.stop());

    this.dailyJobs = [];
    this.weeklyJobs = [];
  }
}

module.exports = new ExhibitionCollectorCron();
