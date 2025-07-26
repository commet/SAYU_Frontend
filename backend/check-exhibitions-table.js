/**
 * Check Exhibitions Table - Found the 688 records!
 * exhibitions 테이블의 688개 레코드 확인
 */

const { Pool } = require('pg');
require('dotenv').config();

async function checkExhibitionsTable() {
  console.log('🎯 EXHIBITIONS 테이블 688개 레코드 확인');
  console.log('=====================================\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // 1. 전체 개수 및 소스별 분포
    const total = await pool.query('SELECT COUNT(*) FROM exhibitions');
    console.log(`📊 총 exhibitions: ${total.rows[0].count}개`);

    const sources = await pool.query(`
      SELECT source, COUNT(*) 
      FROM exhibitions 
      GROUP BY source 
      ORDER BY count DESC
    `);
    
    console.log('\n📊 소스별 분포:');
    sources.rows.forEach(s => {
      console.log(`   ${s.source || 'null'}: ${s.count}개`);
    });

    // 2. 도시별 분포
    const cities = await pool.query(`
      SELECT venue_city, COUNT(*) 
      FROM exhibitions 
      GROUP BY venue_city 
      ORDER BY count DESC 
      LIMIT 20
    `);
    
    console.log('\n🌍 상위 20개 도시:');
    cities.rows.forEach(c => {
      console.log(`   ${c.venue_city || 'unknown'}: ${c.count}개`);
    });

    // 3. 날짜별 분포
    const dateRange = await pool.query(`
      SELECT 
        MIN(start_date) as earliest,
        MAX(end_date) as latest,
        COUNT(*) as total
      FROM exhibitions
      WHERE start_date IS NOT NULL AND end_date IS NOT NULL
    `);
    
    console.log('\n📅 날짜 범위:');
    if (dateRange.rows[0].earliest) {
      console.log(`   ${dateRange.rows[0].earliest} ~ ${dateRange.rows[0].latest}`);
      console.log(`   유효한 날짜가 있는 전시: ${dateRange.rows[0].total}개`);
    }

    // 4. 샘플 데이터 확인
    const samples = await pool.query(`
      SELECT title_en, venue_name, venue_city, start_date, end_date, source
      FROM exhibitions 
      ORDER BY id
      LIMIT 10
    `);
    
    console.log('\n✨ 샘플 전시들:');
    samples.rows.forEach((ex, i) => {
      console.log(`   ${i + 1}. "${ex.title_en || 'No Title'}"`);
      console.log(`      ${ex.venue_name || 'Unknown Venue'}, ${ex.venue_city || 'Unknown City'}`);
      console.log(`      ${ex.start_date || 'No start'} ~ ${ex.end_date || 'No end'}`);
      console.log(`      소스: ${ex.source || 'No source'}`);
      console.log('');
    });

    // 5. Artmap 관련 키워드 검색
    const artmapSearch = await pool.query(`
      SELECT COUNT(*) 
      FROM exhibitions 
      WHERE source ILIKE '%artmap%' 
      OR venue_name ILIKE '%artmap%'
      OR title_en ILIKE '%artmap%'
    `);
    
    console.log(`🗺️  Artmap 관련 레코드: ${artmapSearch.rows[0].count}개`);

    // 6. 최근 생성된 데이터 확인
    const recent = await pool.query(`
      SELECT source, COUNT(*), MIN(created_at), MAX(created_at)
      FROM exhibitions 
      WHERE created_at >= '2025-07-26'
      GROUP BY source
      ORDER BY count DESC
    `);
    
    console.log('\n📅 오늘 생성된 exhibitions:');
    if (recent.rows.length > 0) {
      recent.rows.forEach(r => {
        console.log(`   ${r.source || 'null'}: ${r.count}개 (${r.min_created_at} ~ ${r.max_created_at})`);
      });
    } else {
      console.log('   ❌ 오늘 생성된 exhibitions 없음');
    }

    // 7. 품질 체크
    const qualityCheck = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(title_en) as has_title,
        COUNT(venue_name) as has_venue,
        COUNT(start_date) as has_start_date,
        COUNT(end_date) as has_end_date,
        COUNT(description) as has_description
      FROM exhibitions
    `);
    
    console.log('\n📊 데이터 품질:');
    const q = qualityCheck.rows[0];
    console.log(`   제목 있음: ${q.has_title}/${q.total} (${Math.round(q.has_title/q.total*100)}%)`);
    console.log(`   장소 있음: ${q.has_venue}/${q.total} (${Math.round(q.has_venue/q.total*100)}%)`);
    console.log(`   시작일 있음: ${q.has_start_date}/${q.total} (${Math.round(q.has_start_date/q.total*100)}%)`);
    console.log(`   종료일 있음: ${q.has_end_date}/${q.total} (${Math.round(q.has_end_date/q.total*100)}%)`);
    console.log(`   설명 있음: ${q.has_description}/${q.total} (${Math.round(q.has_description/q.total*100)}%)`);

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  checkExhibitionsTable();
}