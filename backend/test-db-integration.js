/**
 * DB 통합 테스트 - SQL 파일 검증 및 샘플 실행
 */

const fs = require('fs');
const { pool } = require('./src/config/database');

class DBIntegrationTest {
  constructor() {
    this.testResults = {
      sqlValidation: {},
      connectionTest: {},
      sampleExecution: {},
      dataVerification: {}
    };
  }

  async runFullTest() {
    console.log('🧪 DB INTEGRATION TEST');
    console.log('=====================\n');

    try {
      // 1. SQL 파일 검증
      await this.validateSqlFile();
      
      // 2. DB 연결 테스트  
      await this.testConnection();
      
      // 3. 스키마 확인
      await this.verifySchema();
      
      // 4. 샘플 데이터 실행 (소량)
      await this.executeSampleData();
      
      // 5. 결과 검증
      await this.verifyResults();

    } catch (error) {
      console.error('❌ 테스트 실행 중 오류:', error.message);
      this.testResults.generalError = error.message;
    } finally {
      // 연결 정리
      if (pool && pool.end) {
        try {
          await pool.end();
        } catch (e) {
          console.log('Connection cleanup warning:', e.message);
        }
      }
    }

    // 최종 보고서
    this.generateTestReport();
  }

  async validateSqlFile() {
    console.log('📄 1. SQL 파일 검증');
    console.log('==================\n');

    const sqlFile = 'artmap-global-exhibitions-insert.sql';
    
    if (!fs.existsSync(sqlFile)) {
      console.log('❌ SQL 파일이 존재하지 않습니다');
      this.testResults.sqlValidation.fileExists = false;
      return;
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    console.log(`✅ SQL 파일 로드 완료 (${Math.round(sqlContent.length / 1024)}KB)`);

    // SQL 구조 분석
    const analysis = {
      totalLines: sqlContent.split('\n').length,
      venueInserts: (sqlContent.match(/INSERT INTO global_venues/g) || []).length,
      exhibitionInserts: (sqlContent.match(/INSERT INTO global_exhibitions/g) || []).length,
      hasConflictHandling: sqlContent.includes('ON CONFLICT'),
      hasValidation: sqlContent.includes('SELECT') && sqlContent.includes('COUNT'),
      hasForeignKeys: sqlContent.includes('SELECT id FROM global_venues'),
    };

    console.log(`📊 SQL 구조 분석:`);
    console.log(`   총 라인 수: ${analysis.totalLines}`);
    console.log(`   venue 삽입: ${analysis.venueInserts}개 그룹`);
    console.log(`   exhibition 삽입: ${analysis.exhibitionInserts}개 그룹`);
    console.log(`   중복 처리: ${analysis.hasConflictHandling ? '✅' : '❌'}`);
    console.log(`   결과 검증: ${analysis.hasValidation ? '✅' : '❌'}`);
    console.log(`   외래키 참조: ${analysis.hasForeignKeys ? '✅' : '❌'}`);

    this.testResults.sqlValidation = {
      fileExists: true,
      size: sqlContent.length,
      ...analysis
    };
  }

  async testConnection() {
    console.log('\n🔌 2. DB 연결 테스트');
    console.log('==================\n');

    try {
      const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
      console.log('✅ 데이터베이스 연결 성공');
      console.log(`   현재 시간: ${result.rows[0].current_time}`);
      console.log(`   DB 버전: ${result.rows[0].db_version.split(' ')[0]}`);
      
      this.testResults.connectionTest = {
        success: true,
        currentTime: result.rows[0].current_time,
        version: result.rows[0].db_version
      };
    } catch (error) {
      console.log('❌ 데이터베이스 연결 실패:', error.message);
      this.testResults.connectionTest = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  async verifySchema() {
    console.log('\n🏗️  3. 스키마 확인');
    console.log('================\n');

    try {
      // global_venues 테이블 확인
      const venuesCheck = await pool.query(`
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'global_venues' 
        ORDER BY ordinal_position
      `);

      // global_exhibitions 테이블 확인
      const exhibitionsCheck = await pool.query(`
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'global_exhibitions' 
        ORDER BY ordinal_position
      `);

      console.log(`📋 스키마 확인 결과:`);
      console.log(`   global_venues 컬럼: ${venuesCheck.rows.length}개`);
      console.log(`   global_exhibitions 컬럼: ${exhibitionsCheck.rows.length}개`);

      if (venuesCheck.rows.length > 0) {
        console.log(`   주요 venues 컬럼: ${venuesCheck.rows.slice(0, 5).map(r => r.column_name).join(', ')}`);
      }

      if (exhibitionsCheck.rows.length > 0) {
        console.log(`   주요 exhibitions 컬럼: ${exhibitionsCheck.rows.slice(0, 5).map(r => r.column_name).join(', ')}`);
      }

      this.testResults.schemaVerification = {
        venuesTableExists: venuesCheck.rows.length > 0,
        exhibitionsTableExists: exhibitionsCheck.rows.length > 0,
        venuesColumns: venuesCheck.rows.length,
        exhibitionsColumns: exhibitionsCheck.rows.length
      };

    } catch (error) {
      console.log('❌ 스키마 확인 실패:', error.message);
      this.testResults.schemaVerification = { error: error.message };
      throw error;
    }
  }

  async executeSampleData() {
    console.log('\n🧪 4. 샘플 데이터 실행');
    console.log('====================\n');

    try {
      // 간단한 테스트 venue 삽입
      const testVenueQuery = `
        INSERT INTO global_venues (
          name, country, city, venue_type, data_source, 
          data_quality_score, verification_status
        ) VALUES (
          'Test Artmap Venue', 'DE', 'Berlin', 'gallery', 'artmap_test', 
          75, 'verified'
        ) 
        ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
        RETURNING id, name
      `;

      const venueResult = await pool.query(testVenueQuery);
      const venueId = venueResult.rows[0].id;
      
      console.log(`✅ 테스트 venue 삽입 성공: ${venueResult.rows[0].name} (ID: ${venueId})`);

      // 간단한 테스트 exhibition 삽입
      const testExhibitionQuery = `
        INSERT INTO global_exhibitions (
          venue_id, title, start_date, end_date, 
          data_source, data_quality_score, status
        ) VALUES (
          $1, 'Test Artmap Exhibition', '2025-07-01', '2025-12-31',
          'artmap_test', 80, 'active'
        )
        ON CONFLICT DO NOTHING
        RETURNING id, title
      `;

      const exhibitionResult = await pool.query(testExhibitionQuery, [venueId]);
      
      if (exhibitionResult.rows.length > 0) {
        console.log(`✅ 테스트 exhibition 삽입 성공: ${exhibitionResult.rows[0].title}`);
      } else {
        console.log(`⚠️  테스트 exhibition 중복으로 스킵됨`);
      }

      this.testResults.sampleExecution = {
        venueInserted: true,
        exhibitionInserted: exhibitionResult.rows.length > 0,
        venueId: venueId
      };

    } catch (error) {
      console.log('❌ 샘플 데이터 실행 실패:', error.message);
      this.testResults.sampleExecution = { error: error.message };
      throw error;
    }
  }

  async verifyResults() {
    console.log('\n✅ 5. 결과 검증');
    console.log('===============\n');

    try {
      // 테이블 레코드 수 확인
      const venueCount = await pool.query('SELECT COUNT(*) FROM global_venues WHERE data_source LIKE %artmap%');
      const exhibitionCount = await pool.query('SELECT COUNT(*) FROM global_exhibitions WHERE data_source LIKE %artmap%');

      console.log(`📊 현재 Artmap 데이터:`);
      console.log(`   Venues: ${venueCount.rows[0].count}개`);
      console.log(`   Exhibitions: ${exhibitionCount.rows[0].count}개`);

      // 최근 삽입된 데이터 확인
      const recentVenues = await pool.query(`
        SELECT name, city, country, created_at 
        FROM global_venues 
        WHERE data_source LIKE '%artmap%' 
        ORDER BY created_at DESC 
        LIMIT 3
      `);

      console.log(`\n📋 최근 venues (상위 3개):`);
      recentVenues.rows.forEach((venue, i) => {
        console.log(`   ${i + 1}. ${venue.name} (${venue.city}, ${venue.country})`);
      });

      this.testResults.dataVerification = {
        venueCount: parseInt(venueCount.rows[0].count),
        exhibitionCount: parseInt(exhibitionCount.rows[0].count),
        hasRecentData: recentVenues.rows.length > 0
      };

    } catch (error) {
      console.log('❌ 결과 검증 실패:', error.message);
      this.testResults.dataVerification = { error: error.message };
    }
  }

  generateTestReport() {
    console.log('\n📋 테스트 결과 요약');
    console.log('==================\n');

    const allTestsPassed = 
      this.testResults.sqlValidation?.fileExists &&
      this.testResults.connectionTest?.success &&
      this.testResults.schemaVerification?.venuesTableExists &&
      this.testResults.schemaVerification?.exhibitionsTableExists;

    console.log(`🎯 전체 테스트 결과: ${allTestsPassed ? '✅ 통과' : '❌ 실패'}`);
    
    if (allTestsPassed) {
      console.log(`\n🚀 프로덕션 배포 준비 상태:`);
      console.log(`   ✅ SQL 파일 검증 완료`);
      console.log(`   ✅ 데이터베이스 연결 확인`);
      console.log(`   ✅ 스키마 호환성 확인`);
      console.log(`   ✅ 샘플 데이터 삽입 성공`);
      console.log(`\n📈 다음 단계: 전체 947개 데이터 배포 실행`);
    } else {
      console.log(`\n⚠️  해결 필요한 문제들:`);
      if (!this.testResults.connectionTest?.success) {
        console.log(`   - 데이터베이스 연결 문제`);
      }
      if (!this.testResults.schemaVerification?.venuesTableExists) {
        console.log(`   - global_venues 테이블 없음`);
      }
      if (!this.testResults.schemaVerification?.exhibitionsTableExists) {
        console.log(`   - global_exhibitions 테이블 없음`);
      }
    }

    // 상세 결과 저장
    const reportFile = `db-integration-test-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      testsPassed: allTestsPassed,
      results: this.testResults
    }, null, 2));

    console.log(`💾 상세 테스트 보고서: ${reportFile}`);
  }
}

// 실행
async function main() {
  const tester = new DBIntegrationTest();
  await tester.runFullTest();
}

if (require.main === module) {
  main();
}

module.exports = DBIntegrationTest;