#!/usr/bin/env node

/**
 * Global Museum Collection Test Suite
 * 
 * This script provides comprehensive testing for the global museum collection system.
 * It validates database setup, API connectivity, collection processes, and data quality.
 * 
 * Usage:
 *   node test-global-collection.js                    # Run all tests
 *   node test-global-collection.js --quick           # Quick validation only
 *   node test-global-collection.js --setup           # Setup database and run tests
 *   node test-global-collection.js --api-only        # Test API connectivity only
 *   node test-global-collection.js --collection      # Test collection process only
 */

require('dotenv').config();
const { Pool } = require('pg');
const GlobalMuseumCollectorService = require('./src/services/globalMuseumCollectorService');
const globalMuseumCron = require('./src/cron/globalMuseumCron');
const logger = require('./src/utils/logger');

class GlobalCollectionTestSuite {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        this.collector = new GlobalMuseumCollectorService();
        this.testResults = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };

        this.args = this.parseArguments();
    }

    parseArguments() {
        const args = process.argv.slice(2);
        return {
            help: args.includes('--help') || args.includes('-h'),
            quick: args.includes('--quick') || args.includes('-q'),
            setup: args.includes('--setup') || args.includes('-s'),
            apiOnly: args.includes('--api-only'),
            collectionOnly: args.includes('--collection'),
            verbose: args.includes('--verbose') || args.includes('-v')
        };
    }

    async runTests() {
        console.log('🎨 SAYU Global Museum Collection - Test Suite\n');

        try {
            if (this.args.help) {
                this.displayHelp();
                return;
            }

            if (this.args.setup) {
                await this.setupDatabase();
            }

            if (this.args.quick) {
                await this.runQuickValidation();
            } else if (this.args.apiOnly) {
                await this.testAPIs();
            } else if (this.args.collectionOnly) {
                await this.testCollection();
            } else {
                await this.runFullTestSuite();
            }

            this.displayResults();

        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            process.exit(1);
        } finally {
            await this.cleanup();
        }
    }

    async runFullTestSuite() {
        console.log('🔍 Running Full Test Suite\n');

        await this.testEnvironment();
        await this.testDatabase();
        await this.testAPIs();
        await this.testCollection();
        await this.testCronSystem();
        await this.testDataQuality();
    }

    async runQuickValidation() {
        console.log('⚡ Running Quick Validation\n');

        await this.testEnvironment();
        await this.testDatabaseConnection();
        await this.testAPIConnectivity();
    }

    async testEnvironment() {
        console.log('📋 Testing Environment Configuration...');

        await this.runTest('Environment Variables', async () => {
            const required = ['DATABASE_URL'];
            const missing = required.filter(key => !process.env[key]);
            
            if (missing.length > 0) {
                throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
            }

            const optional = [
                'GOOGLE_PLACES_API_KEY',
                'FOURSQUARE_API_KEY',
                'ENABLE_GLOBAL_MUSEUM_COLLECTION',
                'AUTO_START_CRON'
            ];

            const warnings = optional.filter(key => !process.env[key]);
            if (warnings.length > 0) {
                this.addWarning(`Optional environment variables not set: ${warnings.join(', ')}`);
            }

            return { required: required.length, optional: optional.length - warnings.length };
        });
    }

    async testDatabase() {
        console.log('🗄️  Testing Database...');

        await this.testDatabaseConnection();
        await this.testDatabaseSchema();
        await this.testDatabaseOperations();
    }

    async testDatabaseConnection() {
        await this.runTest('Database Connection', async () => {
            const client = await this.pool.connect();
            const result = await client.query('SELECT NOW()');
            client.release();
            
            return { connected: true, timestamp: result.rows[0].now };
        });
    }

    async testDatabaseSchema() {
        await this.runTest('Database Schema', async () => {
            const client = await this.pool.connect();
            
            try {
                // Check if tables exist
                const tables = [
                    'global_venues',
                    'global_exhibitions',
                    'global_collection_logs',
                    'global_data_quality_metrics'
                ];

                const existingTables = [];
                for (const table of tables) {
                    const result = await client.query(`
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_name = $1
                        )
                    `, [table]);
                    
                    if (result.rows[0].exists) {
                        existingTables.push(table);
                    }
                }

                if (existingTables.length !== tables.length) {
                    const missing = tables.filter(t => !existingTables.includes(t));
                    throw new Error(`Missing tables: ${missing.join(', ')}`);
                }

                // Check if functions exist
                const functions = ['calculate_venue_quality_score', 'update_updated_at_column'];
                const existingFunctions = [];
                
                for (const func of functions) {
                    const result = await client.query(`
                        SELECT EXISTS (
                            SELECT FROM pg_proc WHERE proname = $1
                        )
                    `, [func]);
                    
                    if (result.rows[0].exists) {
                        existingFunctions.push(func);
                    }
                }

                return {
                    tables: existingTables.length,
                    functions: existingFunctions.length,
                    ready: existingTables.length === tables.length && existingFunctions.length === functions.length
                };

            } finally {
                client.release();
            }
        });
    }

    async testDatabaseOperations() {
        await this.runTest('Database Operations', async () => {
            const client = await this.pool.connect();
            
            try {
                // Test insert
                const testVenue = {
                    name: 'Test Museum',
                    country: 'Test Country',
                    city: 'Test City',
                    venue_type: 'museum',
                    data_source: 'test'
                };

                const insertResult = await client.query(`
                    INSERT INTO global_venues (name, country, city, venue_type, data_source)
                    VALUES ($1, $2, $3, $4, $5) RETURNING id
                `, [testVenue.name, testVenue.country, testVenue.city, testVenue.venue_type, testVenue.data_source]);

                const venueId = insertResult.rows[0].id;

                // Test quality score calculation
                const qualityResult = await client.query(`
                    SELECT calculate_venue_quality_score($1) as quality_score
                `, [venueId]);

                const qualityScore = qualityResult.rows[0].quality_score;

                // Test delete (cleanup)
                await client.query(`DELETE FROM global_venues WHERE id = $1`, [venueId]);

                return {
                    insertSuccess: true,
                    qualityScore,
                    cleanupSuccess: true
                };

            } finally {
                client.release();
            }
        });
    }

    async testAPIs() {
        console.log('🌐 Testing API Connectivity...');

        await this.testAPIConnectivity();
        if (!this.args.quick) {
            await this.testAPIResponses();
        }
    }

    async testAPIConnectivity() {
        await this.runTest('Google Places API', async () => {
            if (!process.env.GOOGLE_PLACES_API_KEY) {
                throw new Error('Google Places API key not configured');
            }

            const axios = require('axios');
            const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
                params: {
                    location: '40.7128,-74.0060', // New York
                    radius: 1000,
                    type: 'museum',
                    key: process.env.GOOGLE_PLACES_API_KEY
                },
                timeout: 10000
            });

            if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                throw new Error(`API returned status: ${response.data.status}`);
            }

            return {
                status: response.data.status,
                results: response.data.results ? response.data.results.length : 0
            };
        });

        await this.runTest('Foursquare API', async () => {
            if (!process.env.FOURSQUARE_API_KEY) {
                throw new Error('Foursquare API key not configured');
            }

            const axios = require('axios');
            const response = await axios.get('https://api.foursquare.com/v3/places/search', {
                headers: {
                    'Authorization': process.env.FOURSQUARE_API_KEY,
                    'Accept': 'application/json'
                },
                params: {
                    ll: '40.7128,-74.0060', // New York
                    radius: 1000,
                    categories: '10027', // Museum category
                    limit: 10
                },
                timeout: 10000
            });

            return {
                status: response.status,
                results: response.data.results ? response.data.results.length : 0
            };
        });
    }

    async testAPIResponses() {
        await this.runTest('API Data Quality', async () => {
            const testCity = 'Tokyo';
            const testResults = await this.collector.collectVenuesForCity(testCity, ['google_places'], true);

            if (testResults.total === 0) {
                throw new Error('No venues collected from APIs');
            }

            const googleResults = testResults.sources.google_places;
            if (googleResults && googleResults.venues) {
                const sampleVenue = googleResults.venues[0];
                
                const qualityChecks = {
                    hasName: !!sampleVenue.name,
                    hasLocation: !!(sampleVenue.latitude && sampleVenue.longitude),
                    hasType: !!sampleVenue.venue_type,
                    hasSource: !!sampleVenue.data_source
                };

                const qualityScore = Object.values(qualityChecks).filter(Boolean).length / Object.keys(qualityChecks).length * 100;

                return {
                    sampleVenue: sampleVenue.name,
                    qualityChecks,
                    qualityScore: qualityScore.toFixed(1)
                };
            }

            return { message: 'No sample venues to analyze' };
        });
    }

    async testCollection() {
        console.log('🔄 Testing Collection Process...');

        await this.runTest('Collection Service', async () => {
            const testResults = await this.collector.collectGlobalVenues({
                cities: ['Tokyo'],
                sources: ['google_places'],
                testMode: true
            });

            if (testResults.total_venues === 0) {
                this.addWarning('No venues collected in test mode');
                return { status: 'no_results', message: 'Test collection returned no results' };
            }

            return {
                totalVenues: testResults.total_venues,
                successful: testResults.successful,
                failed: testResults.failed,
                duplicates: testResults.duplicates,
                successRate: (testResults.successful / testResults.total_venues * 100).toFixed(1)
            };
        });

        await this.runTest('Duplicate Detection', async () => {
            // Test duplicate detection by running collection twice
            const firstRun = await this.collector.collectGlobalVenues({
                cities: ['Tokyo'],
                sources: ['google_places'],
                testMode: true
            });

            const secondRun = await this.collector.collectGlobalVenues({
                cities: ['Tokyo'],
                sources: ['google_places'],
                testMode: true
            });

            return {
                firstRun: firstRun.successful,
                secondRun: secondRun.successful,
                duplicatesDetected: secondRun.duplicates,
                duplicateRate: secondRun.total_venues > 0 ? (secondRun.duplicates / secondRun.total_venues * 100).toFixed(1) : 0
            };
        });
    }

    async testCronSystem() {
        console.log('⏰ Testing Cron System...');

        await this.runTest('Cron Configuration', async () => {
            const cronStatus = globalMuseumCron.getStatus();
            
            return {
                enabled: cronStatus.enabled,
                jobs: cronStatus.jobs.length,
                timezone: cronStatus.timezone
            };
        });

        await this.runTest('Manual Job Execution', async () => {
            try {
                await globalMuseumCron.runTestCollection(['Tokyo']);
                return { executed: true, result: 'success' };
            } catch (error) {
                throw new Error(`Manual job execution failed: ${error.message}`);
            }
        });
    }

    async testDataQuality() {
        console.log('📊 Testing Data Quality...');

        await this.runTest('Collection Statistics', async () => {
            const status = await this.collector.getCollectionStatus();
            
            return {
                totalVenues: parseInt(status.total_venues),
                avgQuality: parseFloat(status.avg_quality_score || 0).toFixed(1),
                citiesCovered: parseInt(status.cities_covered),
                countriesCovered: parseInt(status.countries_covered)
            };
        });

        await this.runTest('Data Distribution', async () => {
            const cityStats = await this.collector.getCityStatistics();
            
            const topCities = cityStats.slice(0, 5).map(city => ({
                name: `${city.city}, ${city.country}`,
                venues: parseInt(city.total_venues),
                quality: parseFloat(city.avg_quality_score || 0).toFixed(1)
            }));

            return {
                totalCities: cityStats.length,
                topCities
            };
        });
    }

    async setupDatabase() {
        console.log('🔧 Setting up database schema...');

        try {
            const fs = require('fs');
            const path = require('path');
            
            const schemaPath = path.join(__dirname, 'src', 'migrations', 'create-global-venues-schema.sql');
            const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

            const client = await this.pool.connect();
            await client.query(schemaSql);
            client.release();

            console.log('✅ Database schema setup completed');
        } catch (error) {
            console.error('❌ Database setup failed:', error.message);
            throw error;
        }
    }

    async runTest(testName, testFunction) {
        try {
            const startTime = Date.now();
            const result = await testFunction();
            const duration = Date.now() - startTime;

            console.log(`  ✅ ${testName} (${duration}ms)`);
            if (this.args.verbose && result) {
                console.log(`     ${JSON.stringify(result, null, 6)}`);
            }

            this.testResults.passed++;
            this.testResults.tests.push({
                name: testName,
                status: 'passed',
                duration,
                result
            });

        } catch (error) {
            console.log(`  ❌ ${testName}: ${error.message}`);
            
            this.testResults.failed++;
            this.testResults.tests.push({
                name: testName,
                status: 'failed',
                error: error.message
            });
        }
    }

    addWarning(message) {
        console.log(`  ⚠️  Warning: ${message}`);
        this.testResults.warnings++;
    }

    displayResults() {
        console.log('\n📊 Test Results Summary');
        console.log('=' .repeat(50));
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`⚠️  Warnings: ${this.testResults.warnings}`);
        
        const total = this.testResults.passed + this.testResults.failed;
        const successRate = total > 0 ? (this.testResults.passed / total * 100).toFixed(1) : 0;
        console.log(`📈 Success Rate: ${successRate}%`);

        if (this.testResults.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.tests
                .filter(test => test.status === 'failed')
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.error}`);
                });
        }

        if (this.testResults.passed === total && total > 0) {
            console.log('\n🎉 All tests passed! The global museum collection system is ready to use.');
            console.log('\n🔗 Next Steps:');
            console.log('  • Set up your API keys in .env file');
            console.log('  • Run: node collect-global-museums.js --test');
            console.log('  • Enable automatic collection in production');
        } else if (this.testResults.failed > 0) {
            console.log('\n🔧 Please fix the failed tests before proceeding.');
            process.exit(1);
        }
    }

    displayHelp() {
        console.log(`
🎨 SAYU Global Museum Collection - Test Suite

USAGE:
  node test-global-collection.js [OPTIONS]

OPTIONS:
  --help, -h        Show this help message
  --quick, -q       Run quick validation only (environment + connectivity)
  --setup, -s       Setup database schema before running tests
  --api-only        Test API connectivity only
  --collection      Test collection process only
  --verbose, -v     Show detailed test results

EXAMPLES:
  # Run all tests
  node test-global-collection.js

  # Quick validation
  node test-global-collection.js --quick

  # Setup database and run full tests
  node test-global-collection.js --setup

  # Test APIs only
  node test-global-collection.js --api-only

WHAT THIS TESTS:
  • Environment configuration
  • Database connectivity and schema
  • API connectivity (Google Places, Foursquare)
  • Collection process functionality  
  • Duplicate detection
  • Cron scheduling system
  • Data quality metrics

REQUIREMENTS:
  • DATABASE_URL environment variable
  • API keys (optional for some tests)
  • PostgreSQL database running
`);
    }

    async cleanup() {
        try {
            await this.pool.end();
        } catch (error) {
            // Ignore cleanup errors
        }
    }
}

// Run the test suite if this file is executed directly
if (require.main === module) {
    const testSuite = new GlobalCollectionTestSuite();
    testSuite.runTests().catch(error => {
        console.error('❌ Test suite crashed:', error.message);
        process.exit(1);
    });
}

module.exports = GlobalCollectionTestSuite;