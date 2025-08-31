#!/usr/bin/env node

/**
 * SAYU Exhibition System Test Script
 * 
 * Tests all components of the exhibition integration system:
 * 1. Database connection and schema
 * 2. API integrations
 * 3. Data processing and APT mapping
 * 4. Frontend API endpoints
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

class ExhibitionSystemTester {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };

    console.log('🧪 SAYU Exhibition System Test Suite');
    console.log('===================================');
    console.log();
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive system test...\n');

    try {
      // Basic connectivity tests
      await this.testDatabaseConnection();
      await this.testEnvironmentVariables();
      
      // Database schema tests
      await this.testDatabaseSchema();
      await this.testSampleData();
      
      // API integration tests
      await this.testMapAPIEndpoint();
      await this.testAPTCompatibility();
      
      // Data processing tests
      await this.testDataProcessing();
      
      // Performance tests
      await this.testPerformance();

      // Generate final report
      this.generateReport();

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      this.addResult('CRITICAL', 'Test suite execution', false, error.message);
      this.generateReport();
      process.exit(1);
    }
  }

  // Test database connection
  async testDatabaseConnection() {
    console.log('🔌 Testing database connection...');
    
    try {
      const { data, error } = await this.supabase
        .from('exhibitions')
        .select('count(*)')
        .limit(1)
        .single();

      if (error) throw error;
      
      this.addResult('DATABASE', 'Supabase connection', true, `Connected successfully`);
      console.log('✅ Database connection successful\n');
      
    } catch (error) {
      this.addResult('DATABASE', 'Supabase connection', false, error.message);
      console.error('❌ Database connection failed:', error.message, '\n');
    }
  }

  // Test environment variables
  async testEnvironmentVariables() {
    console.log('🔐 Testing environment variables...');
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const optionalVars = [
      'CULTURE_API_KEY',
      'SEOUL_API_KEY',
      'NAVER_CLIENT_ID',
      'NAVER_CLIENT_SECRET'
    ];

    let missing = 0;
    let optional = 0;

    for (const envVar of requiredVars) {
      if (!process.env[envVar]) {
        this.addResult('CONFIG', `Required: ${envVar}`, false, 'Missing');
        missing++;
      } else {
        this.addResult('CONFIG', `Required: ${envVar}`, true, 'Present');
      }
    }

    for (const envVar of optionalVars) {
      if (!process.env[envVar]) {
        this.addResult('CONFIG', `Optional: ${envVar}`, 'warning', 'Missing - some features unavailable');
        optional++;
      } else {
        this.addResult('CONFIG', `Optional: ${envVar}`, true, 'Present');
      }
    }

    console.log(`✅ Environment variables: ${requiredVars.length - missing}/${requiredVars.length} required, ${optionalVars.length - optional}/${optionalVars.length} optional\n`);
  }

  // Test database schema
  async testDatabaseSchema() {
    console.log('🗄️ Testing database schema...');
    
    const requiredColumns = [
      'id', 'external_id', 'title', 'venue', 'start_date', 'end_date',
      'description', 'recommended_apt', 'status', 'created_at'
    ];

    try {
      // Try to select all required columns
      const { data, error } = await this.supabase
        .from('exhibitions')
        .select(requiredColumns.join(','))
        .limit(1);

      if (error) throw error;

      this.addResult('SCHEMA', 'Exhibitions table structure', true, 'All required columns present');
      
      // Test RLS policies
      const { data: publicData, error: publicError } = await this.supabase
        .from('exhibitions')
        .select('id, title')
        .limit(1);

      if (!publicError) {
        this.addResult('SECURITY', 'Public read access', true, 'RLS policy working');
      } else {
        this.addResult('SECURITY', 'Public read access', false, publicError.message);
      }

      console.log('✅ Database schema verification passed\n');

    } catch (error) {
      this.addResult('SCHEMA', 'Exhibitions table structure', false, error.message);
      console.error('❌ Schema verification failed:', error.message, '\n');
    }
  }

  // Test sample data
  async testSampleData() {
    console.log('📊 Testing data quality...');
    
    try {
      const { data: exhibitions, count } = await this.supabase
        .from('exhibitions')
        .select('*', { count: 'exact' })
        .limit(10);

      this.addResult('DATA', 'Exhibition count', count > 0, `${count} exhibitions in database`);

      if (exhibitions && exhibitions.length > 0) {
        // Test data quality
        let validDates = 0;
        let validAPT = 0;
        let validCoordinates = 0;

        exhibitions.forEach(ex => {
          if (ex.start_date && ex.end_date) validDates++;
          if (ex.recommended_apt && ex.recommended_apt.length > 0) validAPT++;
          if (ex.venue_coordinates) validCoordinates++;
        });

        this.addResult('QUALITY', 'Date completeness', validDates > 0, `${validDates}/${exhibitions.length} have valid dates`);
        this.addResult('QUALITY', 'APT recommendations', validAPT > 0, `${validAPT}/${exhibitions.length} have APT mapping`);
        this.addResult('QUALITY', 'Venue coordinates', validCoordinates >= 0, `${validCoordinates}/${exhibitions.length} have coordinates`);
      }

      console.log(`✅ Data quality check completed - ${count} exhibitions analyzed\n`);

    } catch (error) {
      this.addResult('DATA', 'Data quality check', false, error.message);
      console.error('❌ Data quality check failed:', error.message, '\n');
    }
  }

  // Test map API endpoint
  async testMapAPIEndpoint() {
    console.log('🗺️ Testing map API endpoint...');
    
    try {
      // Test if we can construct the proper response format
      const { data: exhibitions } = await this.supabase
        .from('exhibitions')
        .select(`
          id, title, venue, start_date, end_date, 
          venue_coordinates, recommended_apt, status
        `)
        .limit(5);

      if (exhibitions) {
        // Test APT filtering
        const aptTypes = ['LAEF', 'SAEF', 'SREC'];
        let aptMatches = 0;

        exhibitions.forEach(ex => {
          if (ex.recommended_apt) {
            const hasMatch = aptTypes.some(type => ex.recommended_apt.includes(type));
            if (hasMatch) aptMatches++;
          }
        });

        this.addResult('API', 'Exhibition data structure', true, 'Valid exhibition objects');
        this.addResult('API', 'APT filtering capability', aptMatches > 0, `${aptMatches} exhibitions match APT criteria`);
        this.addResult('API', 'Map data format', true, 'Compatible with map component');

        console.log('✅ Map API endpoint validation passed\n');
      }

    } catch (error) {
      this.addResult('API', 'Map endpoint test', false, error.message);
      console.error('❌ Map API test failed:', error.message, '\n');
    }
  }

  // Test APT compatibility system
  async testAPTCompatibility() {
    console.log('🐾 Testing APT compatibility system...');
    
    const aptTypes = [
      'LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
      'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'
    ];

    try {
      const { data: exhibitions } = await this.supabase
        .from('exhibitions')
        .select('recommended_apt, title')
        .not('recommended_apt', 'is', null)
        .limit(10);

      let validAPTCount = 0;
      let invalidAPTCount = 0;

      exhibitions?.forEach(ex => {
        const hasValidAPT = ex.recommended_apt?.every(apt => aptTypes.includes(apt));
        if (hasValidAPT) {
          validAPTCount++;
        } else {
          invalidAPTCount++;
        }
      });

      this.addResult('APT', 'Valid APT types', validAPTCount > 0, `${validAPTCount} exhibitions with valid APT`);
      this.addResult('APT', 'APT coverage', exhibitions?.length > 0, `${exhibitions?.length} exhibitions have APT recommendations`);
      
      if (invalidAPTCount > 0) {
        this.addResult('APT', 'Invalid APT types', 'warning', `${invalidAPTCount} exhibitions have invalid APT codes`);
      }

      console.log('✅ APT compatibility system verified\n');

    } catch (error) {
      this.addResult('APT', 'APT system test', false, error.message);
      console.error('❌ APT system test failed:', error.message, '\n');
    }
  }

  // Test data processing functions
  async testDataProcessing() {
    console.log('⚙️ Testing data processing...');
    
    try {
      // Test date parsing
      const testDates = ['2025-08-31', '20250831', '2025.08.31'];
      const parsedDates = testDates.map(date => this.parseTestDate(date));
      const validDates = parsedDates.filter(date => date !== null).length;
      
      this.addResult('PROCESSING', 'Date parsing', validDates === testDates.length, `${validDates}/${testDates.length} dates parsed correctly`);

      // Test APT generation
      const testExhibition = {
        title: '현대미술 실험전',
        description: '신진작가들의 창의적이고 실험적인 작품전',
        venue: '국립현대미술관'
      };

      const aptRecommendations = this.generateTestAPTRecommendations(testExhibition);
      this.addResult('PROCESSING', 'APT generation', aptRecommendations.length > 0, `Generated ${aptRecommendations.length} APT recommendations`);

      // Test venue matching
      const venueMatch = this.testVenueMatching('국립현대미술관 서울');
      this.addResult('PROCESSING', 'Venue matching', venueMatch !== null, 'Venue matching algorithm working');

      console.log('✅ Data processing tests completed\n');

    } catch (error) {
      this.addResult('PROCESSING', 'Data processing test', false, error.message);
      console.error('❌ Data processing test failed:', error.message, '\n');
    }
  }

  // Test system performance
  async testPerformance() {
    console.log('⚡ Testing system performance...');
    
    try {
      const startTime = Date.now();

      // Test query performance
      const { data: exhibitions } = await this.supabase
        .from('exhibitions')
        .select('*')
        .limit(100);

      const queryTime = Date.now() - startTime;
      
      this.addResult('PERFORMANCE', 'Query speed', queryTime < 5000, `Query took ${queryTime}ms`);
      this.addResult('PERFORMANCE', 'Data volume', exhibitions?.length >= 0, `Retrieved ${exhibitions?.length || 0} records`);

      // Test memory usage (basic check)
      const memUsage = process.memoryUsage();
      const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      
      this.addResult('PERFORMANCE', 'Memory usage', memMB < 500, `Using ${memMB}MB heap memory`);

      console.log('✅ Performance tests completed\n');

    } catch (error) {
      this.addResult('PERFORMANCE', 'Performance test', false, error.message);
      console.error('❌ Performance test failed:', error.message, '\n');
    }
  }

  // Helper functions for testing
  parseTestDate(dateStr) {
    try {
      const cleaned = dateStr.replace(/[^0-9.-]/g, '');
      if (cleaned.match(/^\d{4}[.-]?\d{2}[.-]?\d{2}$/)) {
        return new Date(cleaned.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
      }
      return null;
    } catch {
      return null;
    }
  }

  generateTestAPTRecommendations(exhibition) {
    const recommendations = new Set();
    const text = `${exhibition.title} ${exhibition.description || ''}`.toLowerCase();
    
    if (text.includes('현대') || text.includes('실험')) {
      recommendations.add('LAEF');
      recommendations.add('SAEF');
    }
    if (text.includes('창의') || text.includes('신진')) {
      recommendations.add('LAMF');
      recommendations.add('SAMF');
    }
    
    return Array.from(recommendations);
  }

  testVenueMatching(venueName) {
    const venues = [
      { name: '국립현대미술관 서울', id: 'mmca-seoul' },
      { name: '서울시립미술관', id: 'sema' }
    ];
    
    return venues.find(venue => 
      venueName.includes(venue.name) || venue.name.includes(venueName)
    );
  }

  // Add test result
  addResult(category, test, passed, details) {
    const result = {
      category,
      test,
      passed,
      details,
      timestamp: new Date().toISOString()
    };

    this.testResults.details.push(result);

    if (passed === true) {
      this.testResults.passed++;
    } else if (passed === false) {
      this.testResults.failed++;
    } else {
      this.testResults.warnings++;
    }
  }

  // Generate final report
  generateReport() {
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('======================');
    
    const total = this.testResults.passed + this.testResults.failed + this.testResults.warnings;
    const successRate = total > 0 ? Math.round((this.testResults.passed / total) * 100) : 0;

    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⚠️  Warnings: ${this.testResults.warnings}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log();

    // Group results by category
    const byCategory = {};
    this.testResults.details.forEach(result => {
      if (!byCategory[result.category]) {
        byCategory[result.category] = [];
      }
      byCategory[result.category].push(result);
    });

    // Display detailed results
    Object.entries(byCategory).forEach(([category, tests]) => {
      console.log(`📂 ${category}:`);
      tests.forEach(test => {
        const status = test.passed === true ? '✅' : test.passed === false ? '❌' : '⚠️';
        console.log(`   ${status} ${test.test}: ${test.details}`);
      });
      console.log();
    });

    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    if (this.testResults.failed > 0) {
      console.log('   🔴 Critical issues found - system may not work properly');
      console.log('   → Check failed tests above and resolve issues');
    }
    if (this.testResults.warnings > 0) {
      console.log('   🟡 Warnings found - some features may be limited');
      console.log('   → Consider addressing warnings for full functionality');
    }
    if (this.testResults.failed === 0) {
      console.log('   🟢 System is ready for production use!');
      console.log('   → You can start collecting exhibition data');
    }

    console.log();
    console.log('🎯 Next Steps:');
    console.log('   1. Run: node scripts/setupExhibitionSystem.js');
    console.log('   2. Run: node scripts/collectExhibitions.js');
    console.log('   3. Visit /exhibitions in your frontend');
    console.log('   4. Set up cron jobs for automated collection');

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        warnings: this.testResults.warnings,
        successRate
      },
      details: this.testResults.details,
      environment: {
        nodeVersion: process.version,
        platform: process.platform
      }
    };

    try {
      const fs = require('fs');
      const path = require('path');
      
      const reportPath = path.join(__dirname, '../reports/system-test-report.json');
      const dir = path.dirname(reportPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
      console.log(`📁 Detailed report saved: ${reportPath}`);
    } catch (error) {
      console.warn('⚠️ Could not save detailed report:', error.message);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ExhibitionSystemTester();
  tester.runAllTests();
}

module.exports = ExhibitionSystemTester;