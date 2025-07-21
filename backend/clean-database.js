#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class DatabaseCleaner {
  constructor() {
    this.stats = {
      before: 0,
      deleted: 0,
      kept: 0
    };
  }

  async cleanDatabase() {
    console.log('🧹 데이터베이스 대청소 시작');
    console.log('❌ 삭제 대상: 더미/가짜/부정확한 데이터');
    console.log('✅ 유지 대상: 검증된 전문 소스 데이터만\n');

    const client = await pool.connect();

    try {
      // 1. 현재 상태 확인
      const beforeStats = await client.query('SELECT COUNT(*) as count FROM exhibitions');
      this.stats.before = parseInt(beforeStats.rows[0].count);
      
      console.log(`📊 청소 전: ${this.stats.before}개 전시 데이터`);

      // 2. 유지할 검증된 소스들
      const verifiedSources = [
        'design_plus_verified',
        'manual_curated'  // 이것도 실제로는 제가 만든 거라 나중에 교체 필요
      ];

      console.log('\n✅ 유지할 검증된 소스:');
      verifiedSources.forEach(source => {
        console.log(`   • ${source}`);
      });

      // 3. 유지할 데이터 개수 확인
      const keepQuery = `
        SELECT COUNT(*) as count 
        FROM exhibitions 
        WHERE source = ANY($1)
      `;
      const keepResult = await client.query(keepQuery, [verifiedSources]);
      this.stats.kept = parseInt(keepResult.rows[0].count);

      // 4. 삭제할 데이터 확인
      this.stats.deleted = this.stats.before - this.stats.kept;

      console.log(`\n🗑️  삭제 예정: ${this.stats.deleted}개`);
      console.log(`✅ 유지 예정: ${this.stats.kept}개`);
      
      if (this.stats.deleted > 0) {
        console.log('\n⚠️  정말로 삭제하시겠습니까? (5초 후 자동 진행...)');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 5. 실제 삭제 실행
        await client.query('BEGIN');

        const deleteQuery = `
          DELETE FROM exhibitions 
          WHERE source != ALL($1)
        `;
        
        const deleteResult = await client.query(deleteQuery, [verifiedSources]);
        
        await client.query('COMMIT');
        
        console.log(`✅ ${deleteResult.rowCount}개 데이터 삭제 완료`);
      }

      // 6. 정리 후 상태
      await this.showCleanResults(client);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ 청소 중 오류:', error);
    } finally {
      client.release();
    }
  }

  async showCleanResults(client) {
    const afterStats = await client.query(`
      SELECT 
        source,
        COUNT(*) as count,
        COUNT(CASE WHEN title_local IS NOT NULL THEN 1 END) as has_title,
        COUNT(CASE WHEN artists IS NOT NULL THEN 1 END) as has_artists,
        COUNT(CASE WHEN description IS NOT NULL THEN 1 END) as has_description
      FROM exhibitions 
      GROUP BY source
      ORDER BY count DESC
    `);

    console.log('\n\n🎉 데이터베이스 청소 완료!');
    console.log('='.repeat(60));
    console.log(`📊 정리 결과:`);
    console.log(`   청소 전: ${this.stats.before}개`);
    console.log(`   삭제됨: ${this.stats.deleted}개`);
    console.log(`   남은 데이터: ${this.stats.kept}개`);

    console.log('\n📋 남은 깨끗한 데이터:');
    afterStats.rows.forEach(row => {
      const completeness = Math.round((row.has_title + row.has_artists + row.has_description) / (row.count * 3) * 100);
      console.log(`   ${row.source}: ${row.count}개 (완성도 ${completeness}%)`);
    });

    console.log('\n💡 다음 단계:');
    console.log('1. 공식 미술관 사이트 수집 시스템 구축');
    console.log('2. 전문 매거진 정기 수집 설정');
    console.log('3. 인스타그램/스레드 수집 방법 연구');
    console.log('4. 수집한 데이터 검증 프로세스 구축');
  }
}

async function main() {
  const cleaner = new DatabaseCleaner();
  
  try {
    await cleaner.cleanDatabase();
  } catch (error) {
    console.error('실행 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}