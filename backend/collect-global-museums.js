#!/usr/bin/env node

/**
 * Global Museum Collection Script
 * 
 * This script automates the collection of museum and gallery data from multiple sources
 * including Google Places API, Foursquare API, and web scraping.
 * 
 * Usage:
 *   node collect-global-museums.js                           # Collect all cities, all sources
 *   node collect-global-museums.js --cities Tokyo,Paris      # Specific cities only
 *   node collect-global-museums.js --web-only               # Web scraping only
 *   node collect-global-museums.js --api-only               # API sources only
 *   node collect-global-museums.js --test                   # Test mode (limited results)
 *   node collect-global-museums.js --status                 # Show current collection status
 *   node collect-global-museums.js --logs                   # Show recent collection logs
 */

require('dotenv').config();
const GlobalMuseumCollectorService = require('./src/services/globalMuseumCollectorService');
const logger = require('./src/utils/logger');

class GlobalMuseumCollectionCLI {
    constructor() {
        this.collector = new GlobalMuseumCollectorService();
        this.args = this.parseArguments();
    }

    parseArguments() {
        const args = process.argv.slice(2);
        const parsed = {
            help: false,
            test: false,
            webOnly: false,
            apiOnly: false,
            status: false,
            logs: false,
            cities: null,
            sources: ['google_places', 'foursquare', 'web_scraping'],
            batchSize: 50
        };

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            switch (arg) {
                case '--help':
                case '-h':
                    parsed.help = true;
                    break;
                
                case '--test':
                case '-t':
                    parsed.test = true;
                    break;
                
                case '--web-only':
                    parsed.webOnly = true;
                    parsed.sources = ['web_scraping'];
                    break;
                
                case '--api-only':
                    parsed.apiOnly = true;
                    parsed.sources = ['google_places', 'foursquare'];
                    break;
                
                case '--status':
                case '-s':
                    parsed.status = true;
                    break;
                
                case '--logs':
                case '-l':
                    parsed.logs = true;
                    break;
                
                case '--cities':
                case '-c':
                    if (i + 1 < args.length) {
                        parsed.cities = args[i + 1].split(',').map(city => city.trim());
                        i++; // Skip next argument
                    }
                    break;
                
                case '--batch-size':
                case '-b':
                    if (i + 1 < args.length) {
                        parsed.batchSize = parseInt(args[i + 1]);
                        i++; // Skip next argument
                    }
                    break;
                
                default:
                    if (arg.startsWith('--cities=')) {
                        parsed.cities = arg.substring(9).split(',').map(city => city.trim());
                    } else if (arg.startsWith('--batch-size=')) {
                        parsed.batchSize = parseInt(arg.substring(13));
                    }
                    break;
            }
        }

        return parsed;
    }

    displayHelp() {
        console.log(`
🎨 SAYU Global Museum Collection Tool

USAGE:
  node collect-global-museums.js [OPTIONS]

OPTIONS:
  --help, -h              Show this help message
  --test, -t              Run in test mode (collect limited data for testing)
  --web-only              Use web scraping only
  --api-only              Use API sources only (Google Places + Foursquare)
  --status, -s            Show current collection status
  --logs, -l              Show recent collection logs
  --cities, -c CITIES     Specify cities to collect (comma-separated)
  --batch-size, -b SIZE   Set batch size for processing (default: 50)

EXAMPLES:
  # Collect all cities with all sources
  node collect-global-museums.js

  # Test collection with Tokyo and Paris only
  node collect-global-museums.js --test --cities "Tokyo,Paris"

  # Web scraping only for New York
  node collect-global-museums.js --web-only --cities "New York"

  # API collection only
  node collect-global-museums.js --api-only

  # Check current status
  node collect-global-museums.js --status

SUPPORTED CITIES:
  New York, Paris, London, Tokyo, Hong Kong, Seoul, Berlin, 
  Barcelona, Amsterdam, Milan

ENVIRONMENT VARIABLES REQUIRED:
  DATABASE_URL              PostgreSQL connection string
  GOOGLE_PLACES_API_KEY     Google Places API key (optional)
  FOURSQUARE_API_KEY        Foursquare API key (optional)

CONFIGURATION:
  GLOBAL_COLLECTION_BATCH_SIZE      Batch size (default: 50)
  GLOBAL_COLLECTION_DELAY_MS        Delay between cities (default: 1000ms)
  GOOGLE_PLACES_REQUESTS_PER_DAY    Daily API limit (default: 1000)
  FOURSQUARE_REQUESTS_PER_DAY       Daily API limit (default: 950)
  WEB_SCRAPING_DELAY_MS             Delay between web requests (default: 2000ms)
  WEB_SCRAPING_MAX_RETRIES          Max retries for failed requests (default: 3)
`);
    }

    async displayStatus() {
        try {
            console.log('\n📊 Current Collection Status\n');
            
            const status = await this.collector.getCollectionStatus();
            
            console.log('📍 Overall Statistics:');
            console.log(`  Total Venues: ${status.total_venues}`);
            console.log(`  Average Quality Score: ${parseFloat(status.avg_quality_score || 0).toFixed(1)}/100`);
            console.log(`  Cities Covered: ${status.cities_covered}`);
            console.log(`  Countries Covered: ${status.countries_covered}`);
            
            console.log('\n🌐 By Data Source:');
            console.log(`  Google Places: ${status.google_venues}`);
            console.log(`  Foursquare: ${status.foursquare_venues}`);
            console.log(`  Web Scraped: ${status.scraped_venues}`);
            
            console.log('\n🏛️ By City:');
            const cityStats = await this.collector.getCityStatistics();
            cityStats.slice(0, 10).forEach(city => {
                console.log(`  ${city.city}, ${city.country}: ${city.total_venues} venues (${city.museums} museums, ${city.galleries} galleries)`);
            });
            
            if (cityStats.length > 10) {
                console.log(`  ... and ${cityStats.length - 10} more cities`);
            }
            
        } catch (error) {
            logger.error('Failed to get collection status', error);
            console.error('❌ Failed to get collection status:', error.message);
        }
    }

    async displayLogs() {
        try {
            console.log('\n📋 Recent Collection Logs\n');
            
            const logs = await this.collector.getRecentLogs(10);
            
            if (logs.length === 0) {
                console.log('No collection logs found.');
                return;
            }
            
            logs.forEach(log => {
                const duration = log.duration_seconds ? `${log.duration_seconds}s` : 'N/A';
                const successRate = log.success_rate ? `${log.success_rate.toFixed(1)}%` : 'N/A';
                
                console.log(`${this.getStatusIcon(log.status)} ${log.collection_type} (${log.data_source})`);
                console.log(`  Started: ${new Date(log.started_at).toLocaleString()}`);
                console.log(`  Status: ${log.status} | Duration: ${duration} | Success Rate: ${successRate}`);
                console.log(`  Results: ${log.records_successful || 0} successful, ${log.records_failed || 0} failed, ${log.records_duplicate || 0} duplicates`);
                
                if (log.error_message) {
                    console.log(`  Error: ${log.error_message}`);
                }
                console.log('');
            });
            
        } catch (error) {
            logger.error('Failed to get collection logs', error);
            console.error('❌ Failed to get collection logs:', error.message);
        }
    }

    getStatusIcon(status) {
        switch (status) {
            case 'completed': return '✅';
            case 'running': return '🔄';
            case 'failed': return '❌';
            case 'partial': return '⚠️';
            default: return '❓';
        }
    }

    async validateEnvironment() {
        const required = ['DATABASE_URL'];
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            console.error('❌ Missing required environment variables:', missing.join(', '));
            return false;
        }

        // Check optional API keys
        const apiSources = this.args.sources.filter(s => s !== 'web_scraping');
        if (apiSources.includes('google_places') && !process.env.GOOGLE_PLACES_API_KEY) {
            console.warn('⚠️  Google Places API key not found. Web scraping and Foursquare only.');
            this.args.sources = this.args.sources.filter(s => s !== 'google_places');
        }
        
        if (apiSources.includes('foursquare') && !process.env.FOURSQUARE_API_KEY) {
            console.warn('⚠️  Foursquare API key not found. Web scraping and Google Places only.');
            this.args.sources = this.args.sources.filter(s => s !== 'foursquare');
        }

        if (this.args.sources.length === 0) {
            console.error('❌ No valid data sources available. Please configure API keys.');
            return false;
        }

        return true;
    }

    async runCollection() {
        if (!await this.validateEnvironment()) {
            process.exit(1);
        }

        const options = {
            cities: this.args.cities,
            sources: this.args.sources,
            batchSize: this.args.batchSize,
            testMode: this.args.test
        };

        console.log('\n🎨 Starting SAYU Global Museum Collection\n');
        console.log('⚙️  Configuration:');
        console.log(`  Cities: ${options.cities ? options.cities.join(', ') : 'All supported cities'}`);
        console.log(`  Sources: ${options.sources.join(', ')}`);
        console.log(`  Batch Size: ${options.batchSize}`);
        console.log(`  Test Mode: ${options.testMode ? 'Yes' : 'No'}`);
        console.log('');

        const startTime = Date.now();

        try {
            const results = await this.collector.collectGlobalVenues(options);
            
            const duration = Math.round((Date.now() - startTime) / 1000);
            
            console.log('\n✅ Collection Completed Successfully!\n');
            console.log('📊 Results Summary:');
            console.log(`  Total Venues Processed: ${results.total_venues}`);
            console.log(`  Successfully Saved: ${results.successful}`);
            console.log(`  Failed: ${results.failed}`);
            console.log(`  Duplicates Skipped: ${results.duplicates}`);
            console.log(`  Duration: ${duration} seconds`);
            
            if (results.successful > 0) {
                const successRate = (results.successful / results.total_venues * 100).toFixed(1);
                console.log(`  Success Rate: ${successRate}%`);
            }

            console.log('\n🏛️ By City:');
            Object.entries(results.by_city).forEach(([city, cityResults]) => {
                console.log(`  ${city}: ${cityResults.successful} saved, ${cityResults.failed} failed, ${cityResults.duplicates} duplicates`);
            });

            console.log('\n🔗 Next Steps:');
            console.log('  • Run --status to see updated statistics');
            console.log('  • Check the SAYU admin dashboard for venue management');
            console.log('  • Consider running exhibition collection next');
            
        } catch (error) {
            logger.error('Collection failed', error);
            console.error('\n❌ Collection Failed:', error.message);
            
            if (error.message.includes('API key')) {
                console.error('\nTip: Make sure your API keys are properly configured in .env file');
            } else if (error.message.includes('database')) {
                console.error('\nTip: Check your DATABASE_URL and ensure the database is running');
            }
            
            process.exit(1);
        }
    }

    async run() {
        if (this.args.help) {
            this.displayHelp();
            return;
        }

        if (this.args.status) {
            await this.displayStatus();
            return;
        }

        if (this.args.logs) {
            await this.displayLogs();
            return;
        }

        await this.runCollection();
    }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
    const cli = new GlobalMuseumCollectionCLI();
    cli.run().catch(error => {
        console.error('❌ Unexpected error:', error.message);
        process.exit(1);
    });
}

module.exports = GlobalMuseumCollectionCLI;