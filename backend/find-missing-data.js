/**
 * Find Missing 947 Exhibition Data
 * 사라진 947개 전시 데이터를 모든 곳에서 찾아내기
 */

const { Pool } = require('pg');
require('dotenv').config();

async function findMissingData() {
  console.log('🚨 947개 사라진 전시 데이터 수색 작전');
  console.log('=====================================\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // 1. 모든 테이블 검색
    console.log('🔍 모든 테이블 검색 중...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`📊 총 ${tables.rows.length}개 테이블 발견:`);
    tables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // 2. Exhibition 관련 테이블들 상세 체크
    console.log('\n🎨 Exhibition 관련 테이블 상세 검사:');
    const exhibitionTables = tables.rows.filter(t => 
      t.table_name.includes('exhibition') || 
      t.table_name.includes('event') || 
      t.table_name.includes('show') ||
      t.table_name.includes('artmap')
    );
    
    for (const table of exhibitionTables) {
      try {
        const count = await pool.query(`SELECT COUNT(*) FROM ${table.table_name}`);
        console.log(`   ${table.table_name}: ${count.rows[0].count}개 레코드`);
        
        // 컬럼 구조도 확인
        const columns = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${table.table_name}'
          ORDER BY ordinal_position
        `);
        console.log(`     컬럼: ${columns.rows.map(c => c.column_name).join(', ')}`);
        
      } catch (e) {
        console.log(`   ${table.table_name}: 오류 - ${e.message}`);
      }
    }

    // 3. 모든 테이블에서 큰 데이터셋 찾기
    console.log('\n🔍 500개 이상 레코드가 있는 테이블들:');
    for (const table of tables.rows) {
      try {
        const count = await pool.query(`SELECT COUNT(*) FROM ${table.table_name}`);
        if (parseInt(count.rows[0].count) >= 500) {
          console.log(`   ${table.table_name}: ${count.rows[0].count}개 레코드 ⭐`);
          
          // data_source 컬럼이 있는지 확인
          const hasDataSource = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = '${table.table_name}' 
            AND column_name = 'data_source'
          `);
          
          if (hasDataSource.rows.length > 0) {
            const sources = await pool.query(`
              SELECT data_source, COUNT(*) 
              FROM ${table.table_name} 
              GROUP BY data_source 
              ORDER BY count DESC
            `);
            console.log(`     data_source별:`);
            sources.rows.forEach(s => {
              console.log(`       ${s.data_source}: ${s.count}개`);
            });
          }
        }
      } catch (e) {
        // 접근 불가능한 테이블은 건너뛰기
      }
    }

    // 4. venues 테이블 상세 검사
    console.log('\n🏛️  global_venues 상세 검사:');
    const venueCount = await pool.query('SELECT COUNT(*) FROM global_venues');
    console.log(`   총 venues: ${venueCount.rows[0].count}개`);
    
    const venueSources = await pool.query(`
      SELECT data_source, COUNT(*) 
      FROM global_venues 
      GROUP BY data_source 
      ORDER BY count DESC
    `);
    console.log('   data_source별:');
    venueSources.rows.forEach(s => {
      console.log(`     ${s.data_source}: ${s.count}개`);
    });

    // 5. artmap 키워드 검색
    console.log('\n🗺️  Artmap 관련 데이터 검색:');
    const artmapVenues = await pool.query(`
      SELECT COUNT(*) FROM global_venues 
      WHERE data_source ILIKE '%artmap%' 
      OR name ILIKE '%artmap%' 
      OR description ILIKE '%artmap%'
    `);
    console.log(`   artmap 관련 venues: ${artmapVenues.rows[0].count}개`);

    // 6. 최근 생성된 데이터 확인
    console.log('\n📅 최근 생성된 데이터:');
    const recentVenues = await pool.query(`
      SELECT data_source, COUNT(*), MIN(created_at), MAX(created_at)
      FROM global_venues 
      WHERE created_at >= '2025-07-26'
      GROUP BY data_source
      ORDER BY count DESC
    `);
    
    if (recentVenues.rows.length > 0) {
      console.log('   오늘 생성된 venues:');
      recentVenues.rows.forEach(r => {
        console.log(`     ${r.data_source}: ${r.count}개 (${r.min_created_at} ~ ${r.max_created_at})`);
      });
    } else {
      console.log('   ❌ 오늘 생성된 venues 없음');
    }

    const recentExhibitions = await pool.query(`
      SELECT data_source, COUNT(*), MIN(created_at), MAX(created_at)
      FROM global_exhibitions 
      WHERE created_at >= '2025-07-26'
      GROUP BY data_source
      ORDER BY count DESC
    `);
    
    if (recentExhibitions.rows.length > 0) {
      console.log('   오늘 생성된 exhibitions:');
      recentExhibitions.rows.forEach(r => {
        console.log(`     ${r.data_source}: ${r.count}개 (${r.min_created_at} ~ ${r.max_created_at})`);
      });
    } else {
      console.log('   ❌ 오늘 생성된 exhibitions 없음');
    }

  } catch (error) {
    console.error('❌ 검색 중 오류:', error.message);
  } finally {
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  findMissingData();
}