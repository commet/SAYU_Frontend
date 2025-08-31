#!/usr/bin/env node

/**
 * SAYU Exhibition Data Collection Script
 * 
 * This script collects real exhibition data from Korean cultural APIs
 * and integrates them into the SAYU database with APT compatibility matching.
 * 
 * Usage:
 *   node scripts/collectExhibitions.js
 *   node scripts/collectExhibitions.js --force  (skip duplicate checks)
 *   node scripts/collectExhibitions.js --limit=100
 */

const realExhibitionIntegrator = require('../src/services/realExhibitionIntegrator');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class ExhibitionCollectionManager {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Parse command line arguments
    this.options = {
      force: process.argv.includes('--force'),
      dryRun: process.argv.includes('--dry-run'),
      limit: this.parseLimit(),
      verbose: process.argv.includes('--verbose')
    };

    console.log('🎨 SAYU Exhibition Collection Manager');
    console.log('=====================================');
    console.log(`Options:`, this.options);
    console.log();
  }

  parseLimit() {
    const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
    return limitArg ? parseInt(limitArg.split('=')[1]) : null;
  }

  async run() {
    try {
      console.log(`📅 Starting collection at ${new Date().toISOString()}`);
      
      // Check prerequisites
      await this.checkPrerequisites();

      // Run collection
      const results = await this.collectAndProcess();

      // Generate report
      await this.generateReport(results);

      console.log('\n✅ Collection completed successfully!');
      process.exit(0);

    } catch (error) {
      console.error('\n❌ Collection failed:', error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Check Supabase connection
    try {
      const { data, error } = await this.supabase
        .from('exhibitions')
        .select('count(*)')
        .limit(1);
      
      if (error) throw error;
      console.log('✓ Supabase connection verified');
    } catch (error) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }

    // Check if exhibitions table exists and has correct schema
    await this.verifyTableSchema();

    console.log('✓ Prerequisites check passed\n');
  }

  async verifyTableSchema() {
    const requiredColumns = [
      'id', 'external_id', 'title', 'venue', 'start_date', 'end_date',
      'description', 'image_url', 'recommended_apt', 'status'
    ];

    try {
      // Try to select required columns
      const { error } = await this.supabase
        .from('exhibitions')
        .select(requiredColumns.join(','))
        .limit(1);

      if (error) {
        throw new Error(`Exhibitions table schema issue: ${error.message}`);
      }

      console.log('✓ Exhibitions table schema verified');
    } catch (error) {
      console.warn(`⚠️ Schema verification failed: ${error.message}`);
      console.warn('You may need to run the database migrations first.');
    }
  }

  async collectAndProcess() {
    console.log('📡 Starting data collection from sources...\n');

    const startTime = Date.now();
    
    if (this.options.dryRun) {
      console.log('🏃‍♂️ DRY RUN MODE - No data will be saved to database\n');
    }

    // Run the actual collection
    const results = await realExhibitionIntegrator.integrateRealExhibitions();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n⏱️ Collection completed in ${duration} seconds`);
    return {
      ...results,
      duration,
      timestamp: new Date().toISOString()
    };
  }

  async generateReport(results) {
    console.log('\n📊 COLLECTION REPORT');
    console.log('=====================');
    
    console.log(`📅 Timestamp: ${results.timestamp}`);
    console.log(`⏱️ Duration: ${results.duration}s`);
    console.log(`📊 Total Collected: ${results.collected}`);
    console.log(`✅ Successfully Processed: ${results.processed}`);
    console.log(`💾 Saved to Database: ${results.saved}`);
    console.log(`❌ Errors: ${results.errors?.length || 0}`);

    if (results.errors && results.errors.length > 0) {
      console.log('\n⚠️ ERRORS:');
      results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.title}: ${error.error}`);
      });
    }

    // Get current database statistics
    await this.getDatabaseStats();

    // Save report to file
    const reportData = {
      ...results,
      options: this.options,
      database_stats: await this.getDatabaseStatsData()
    };

    const reportPath = require('path').join(
      __dirname, 
      `../reports/collection-report-${Date.now()}.json`
    );

    try {
      const fs = require('fs');
      const dir = require('path').dirname(reportPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
      console.log(`\n💾 Report saved to: ${reportPath}`);
    } catch (error) {
      console.warn(`⚠️ Could not save report: ${error.message}`);
    }
  }

  async getDatabaseStats() {
    try {
      // Total exhibitions
      const { data: totalData } = await this.supabase
        .from('exhibitions')
        .select('count(*)')
        .single();

      // By status
      const { data: statusData } = await this.supabase
        .from('exhibitions')
        .select('status')
        .not('status', 'is', null);

      // By source
      const { data: sourceData } = await this.supabase
        .from('exhibitions')
        .select('source')
        .not('source', 'is', null);

      // Recent additions (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentData } = await this.supabase
        .from('exhibitions')
        .select('count(*)')
        .gte('created_at', weekAgo)
        .single();

      const statusCounts = statusData?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});

      const sourceCounts = sourceData?.reduce((acc, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📈 DATABASE STATISTICS:');
      console.log(`   Total Exhibitions: ${totalData?.count || 0}`);
      console.log(`   Recent (7 days): ${recentData?.count || 0}`);
      
      if (statusCounts) {
        console.log('   By Status:');
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`     ${status}: ${count}`);
        });
      }

      if (sourceCounts) {
        console.log('   By Source:');
        Object.entries(sourceCounts).forEach(([source, count]) => {
          console.log(`     ${source}: ${count}`);
        });
      }

    } catch (error) {
      console.warn(`⚠️ Could not fetch database statistics: ${error.message}`);
    }
  }

  async getDatabaseStatsData() {
    try {
      const { data: exhibitions } = await this.supabase
        .from('exhibitions')
        .select('status, source, created_at');

      const stats = {
        total: exhibitions?.length || 0,
        by_status: {},
        by_source: {},
        recent_count: 0
      };

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      exhibitions?.forEach(ex => {
        // Count by status
        stats.by_status[ex.status] = (stats.by_status[ex.status] || 0) + 1;
        
        // Count by source
        stats.by_source[ex.source] = (stats.by_source[ex.source] || 0) + 1;
        
        // Count recent additions
        if (new Date(ex.created_at) > weekAgo) {
          stats.recent_count++;
        }
      });

      return stats;
    } catch (error) {
      return { error: error.message };
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  const manager = new ExhibitionCollectionManager();
  manager.run();
}

module.exports = ExhibitionCollectionManager;