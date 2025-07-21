require('dotenv').config();
const { Pool } = require('pg');
const axios = require('axios');

// 데이터베이스 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// API 테스트를 위한 기본 URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

class ExhibitionAPITester {
  constructor() {
    this.testResults = {
      database: { passed: 0, failed: 0, tests: [] },
      api: { passed: 0, failed: 0, tests: [] }
    };
  }

  async runTest(category, testName, testFunction) {
    try {
      console.log(`\n🧪 테스트: ${testName}`);
      const result = await testFunction();
      
      this.testResults[category].passed++;
      this.testResults[category].tests.push({
        name: testName,
        status: 'PASSED',
        result
      });
      
      console.log(`✅ ${testName} - PASSED`);
      return result;
    } catch (error) {
      this.testResults[category].failed++;
      this.testResults[category].tests.push({
        name: testName,
        status: 'FAILED',
        error: error.message
      });
      
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
      throw error;
    }
  }

  // 데이터베이스 테스트들
  async testDatabaseConnection() {
    return this.runTest('database', 'Database Connection', async () => {
      const result = await pool.query('SELECT NOW()');
      return { connected: true, timestamp: result.rows[0].now };
    });
  }

  async testExhibitionsTable() {
    return this.runTest('database', 'Exhibitions Table Structure', async () => {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'exhibitions'
        ORDER BY ordinal_position
      `);
      return { columns: result.rows };
    });
  }

  async testVenuesTable() {
    return this.runTest('database', 'Venues Table Structure', async () => {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'venues'
        ORDER BY ordinal_position
      `);
      return { columns: result.rows };
    });
  }

  async testSampleData() {
    return this.runTest('database', 'Sample Data Check', async () => {
      const exhibitions = await pool.query('SELECT COUNT(*) as count FROM exhibitions');
      const venues = await pool.query('SELECT COUNT(*) as count FROM venues');
      
      return {
        exhibitions: parseInt(exhibitions.rows[0].count),
        venues: parseInt(venues.rows[0].count)
      };
    });
  }

  async insertTestExhibition() {
    return this.runTest('database', 'Insert Test Exhibition', async () => {
      // 테스트용 venue 먼저 생성
      const venueResult = await pool.query(`
        INSERT INTO venues (name, name_en, city, country, type, address, website)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
        RETURNING id
      `, ['테스트 갤러리', 'Test Gallery', '서울', 'KR', 'gallery', '서울시 강남구', 'https://test.com']);

      const venueId = venueResult.rows[0].id;

      // 테스트 전시 삽입
      const exhibitionResult = await pool.query(`
        INSERT INTO exhibitions (
          title, description, venue_id, venue_name, venue_city, venue_country,
          start_date, end_date, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (title, venue_id, start_date) DO UPDATE SET updated_at = NOW()
        RETURNING id
      `, [
        'API 테스트 전시',
        '프론트엔드-백엔드 연동 테스트를 위한 전시입니다.',
        venueId,
        '테스트 갤러리',
        '서울',
        'KR',
        new Date().toISOString(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
        'ongoing'
      ]);

      return { 
        exhibitionId: exhibitionResult.rows[0].id,
        venueId 
      };
    });
  }

  // API 테스트들
  async testApiHealth() {
    return this.runTest('api', 'API Health Check', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/health`, { timeout: 5000 });
      return {
        status: response.status,
        data: response.data
      };
    });
  }

  async testGetExhibitions() {
    return this.runTest('api', 'GET /api/exhibitions', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/exhibitions?limit=10`, { timeout: 10000 });
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }

      if (!response.data.success) {
        throw new Error('API returned success: false');
      }

      return {
        status: response.status,
        totalCount: response.data.data?.length || 0,
        hasData: Array.isArray(response.data.data),
        hasPagination: !!response.data.pagination,
        sample: response.data.data?.slice(0, 2) || []
      };
    });
  }

  async testGetVenues() {
    return this.runTest('api', 'GET /api/venues', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/venues?limit=10`, { timeout: 10000 });
      
      return {
        status: response.status,
        totalCount: response.data.data?.length || 0,
        hasData: Array.isArray(response.data.data),
        sample: response.data.data?.slice(0, 2) || []
      };
    });
  }

  async testGetCityStats() {
    return this.runTest('api', 'GET /api/exhibitions/stats/cities', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/exhibitions/stats/cities`, { timeout: 10000 });
      
      return {
        status: response.status,
        hasData: !!response.data.data,
        cities: Object.keys(response.data.data || {}).length,
        sample: response.data.data
      };
    });
  }

  async testGetPopularExhibitions() {
    return this.runTest('api', 'GET /api/exhibitions/popular', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/exhibitions/popular?limit=5`, { timeout: 10000 });
      
      return {
        status: response.status,
        totalCount: response.data.data?.length || 0,
        hasData: Array.isArray(response.data.data)
      };
    });
  }

  // 종합 테스트 실행
  async runAllTests() {
    console.log('🎯 SAYU 전시 시스템 API 연동 테스트 시작\n');
    console.log('='.repeat(60));

    try {
      // 데이터베이스 테스트
      console.log('\n📊 데이터베이스 테스트');
      await this.testDatabaseConnection();
      await this.testExhibitionsTable();
      await this.testVenuesTable();
      await this.testSampleData();
      await this.insertTestExhibition();

      console.log('\n🌐 API 엔드포인트 테스트');
      await this.testApiHealth();
      await this.testGetExhibitions();
      await this.testGetVenues();
      await this.testGetCityStats();
      await this.testGetPopularExhibitions();

    } catch (error) {
      console.log(`\n💥 테스트 중 치명적 오류: ${error.message}`);
    }

    // 결과 요약
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 테스트 결과 요약');
    console.log('='.repeat(60));

    ['database', 'api'].forEach(category => {
      const results = this.testResults[category];
      const total = results.passed + results.failed;
      const successRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : '0';
      
      console.log(`\n${category.toUpperCase()} 테스트:`);
      console.log(`  ✅ 성공: ${results.passed}`);
      console.log(`  ❌ 실패: ${results.failed}`);
      console.log(`  📊 성공률: ${successRate}%`);

      if (results.failed > 0) {
        console.log(`  \n  실패한 테스트:`);
        results.tests
          .filter(test => test.status === 'FAILED')
          .forEach(test => {
            console.log(`    - ${test.name}: ${test.error}`);
          });
      }
    });

    const totalPassed = this.testResults.database.passed + this.testResults.api.passed;
    const totalFailed = this.testResults.database.failed + this.testResults.api.failed;
    const overallTotal = totalPassed + totalFailed;
    const overallSuccess = overallTotal > 0 ? ((totalPassed / overallTotal) * 100).toFixed(1) : '0';

    console.log(`\n🎯 전체 결과: ${totalPassed}/${overallTotal} 성공 (${overallSuccess}%)`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 모든 테스트가 성공했습니다! 프론트엔드-백엔드 연동이 정상 작동합니다.');
    } else {
      console.log('\n⚠️  일부 테스트가 실패했습니다. 위의 오류를 확인해주세요.');
    }
  }
}

// 실행
async function main() {
  const tester = new ExhibitionAPITester();
  await tester.runAllTests();
  await pool.end();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ExhibitionAPITester;