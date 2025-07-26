const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkArtworksDatabase() {
  try {
    console.log('🎨 Artworks 테이블 구조 확인 중...\n');
    
    // 1. artworks 테이블 구조 확인
    const tableStructure = await pool.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'artworks'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Artworks 테이블 구조:');
    console.log('========================');
    tableStructure.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // 2. 실제 저장된 작품 샘플 (10개)
    console.log('\n\n🖼️ 저장된 작품 샘플 데이터:');
    console.log('================================');
    
    const sampleData = await pool.query(`
      SELECT * FROM artworks
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    sampleData.rows.forEach((artwork, index) => {
      console.log(`\n[${index + 1}] ${artwork.title || artwork.title_ko || 'Unknown'}`);
      console.log(`   ID: ${artwork.id}`);
      console.log(`   제목: ${artwork.title_ko || ''} / ${artwork.title || ''}`);
      console.log(`   날짜: ${artwork.date_display || artwork.year_start || 'Unknown'}`);
      console.log(`   매체: ${artwork.medium || 'N/A'}`);
      console.log(`   치수: ${artwork.dimensions || 'N/A'}`);
      console.log(`   출처: ${artwork.source || 'N/A'}`);
      console.log(`   부서: ${artwork.department || 'N/A'}`);
      console.log(`   분류: ${artwork.classification || 'N/A'}`);
      console.log(`   퍼블릭 도메인: ${artwork.is_public_domain ? '✅' : '❌'}`);
      console.log(`   전시 중: ${artwork.is_on_view ? '✅' : '❌'}`);
      console.log(`   이미지: ${artwork.image_url ? '있음' : '없음'}`);
      console.log(`   수집일: ${artwork.created_at ? new Date(artwork.created_at).toLocaleDateString('ko-KR') : 'N/A'}`);
    });
    
    // 3. 데이터 완성도 통계
    console.log('\n\n📈 데이터 완성도 분석:');
    console.log('=======================');
    
    const completenessStats = await pool.query(`
      SELECT 
        COUNT(*) as total_artworks,
        COUNT(title) as has_title,
        COUNT(title_ko) as has_korean_title,
        COUNT(year_start) as has_year_start,
        COUNT(date_display) as has_date_display,
        COUNT(medium) as has_medium,
        COUNT(medium_ko) as has_korean_medium,
        COUNT(dimensions) as has_dimensions,
        COUNT(credit_line) as has_credit_line,
        COUNT(image_url) as has_image,
        COUNT(source) as has_source,
        COUNT(department) as has_department,
        COUNT(classification) as has_classification,
        COUNT(CASE WHEN is_public_domain = true THEN 1 END) as public_domain_count,
        COUNT(CASE WHEN is_on_view = true THEN 1 END) as on_view_count
      FROM artworks
    `);
    
    const stats = completenessStats.rows[0];
    const total = parseInt(stats.total_artworks);
    
    console.log(`총 작품 수: ${total}개\n`);
    
    const fields = [
      { name: '제목 (영문)', count: stats.has_title },
      { name: '한국어 제목', count: stats.has_korean_title },
      { name: '연도 시작', count: stats.has_year_start },
      { name: '날짜 표시', count: stats.has_date_display },
      { name: '매체', count: stats.has_medium },
      { name: '한국어 매체', count: stats.has_korean_medium },
      { name: '크기', count: stats.has_dimensions },
      { name: '크레딧', count: stats.has_credit_line },
      { name: '이미지', count: stats.has_image },
      { name: '출처', count: stats.has_source },
      { name: '부서', count: stats.has_department },
      { name: '분류', count: stats.has_classification },
      { name: '퍼블릭 도메인', count: stats.public_domain_count },
      { name: '전시 중', count: stats.on_view_count }
    ];
    
    fields.forEach(field => {
      const percentage = total > 0 ? ((field.count / total) * 100).toFixed(1) : 0;
      const bar = '█'.repeat(Math.floor(percentage / 5));
      console.log(`${field.name.padEnd(20)} ${field.count.toString().padStart(7)}/${total} (${percentage.padStart(5)}%) ${bar}`);
    });
    
    // 4. 출처별 작품 수
    console.log('\n\n🏛️ 출처별 작품 수:');
    console.log('===================');
    
    const sourceStats = await pool.query(`
      SELECT source, COUNT(*) as count
      FROM artworks
      GROUP BY source
      ORDER BY count DESC
    `);
    
    sourceStats.rows.forEach(row => {
      console.log(`${row.source}: ${row.count.toLocaleString()}개`);
    });
    
    // 5. 분류별 분포
    console.log('\n\n🎨 분류별 작품 분포 (상위 10개):');
    console.log('===============================');
    
    const classificationDist = await pool.query(`
      SELECT classification, COUNT(*) as count
      FROM artworks
      WHERE classification IS NOT NULL
      GROUP BY classification
      ORDER BY count DESC
      LIMIT 10
    `);
    
    classificationDist.rows.forEach(row => {
      console.log(`${row.classification}: ${row.count.toLocaleString()}개`);
    });
    
    // 6. 최근 추가된 작품
    console.log('\n\n🆕 최근 24시간 내 추가된 작품:');
    console.log('==============================');
    
    const recentArtworks = await pool.query(`
      SELECT 
        a.title, 
        a.title_ko, 
        a.created_at,
        a.source
      FROM artworks a
      WHERE a.created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY a.created_at DESC
      LIMIT 10
    `);
    
    if (recentArtworks.rows.length > 0) {
      recentArtworks.rows.forEach(artwork => {
        const time = new Date(artwork.created_at).toLocaleString('ko-KR');
        console.log(`- ${artwork.title_ko || artwork.title} (${artwork.source}): ${time}`);
      });
    } else {
      console.log('최근 24시간 내 추가된 작품이 없습니다.');
    }
    
    // 7. 부서별 분포
    console.log('\n\n🏛️ 부서별 작품 분포 (상위 10개):');
    console.log('===============================');
    
    const departmentDist = await pool.query(`
      SELECT department, COUNT(*) as count
      FROM artworks
      WHERE department IS NOT NULL
      GROUP BY department
      ORDER BY count DESC
      LIMIT 10
    `);
    
    if (departmentDist.rows.length > 0) {
      departmentDist.rows.forEach(row => {
        console.log(`${row.department}: ${row.count.toLocaleString()}개`);
      });
    }
    
    // 8. 연도별 작품 수 (최근 200년)
    console.log('\n\n📅 연도별 작품 수 (1800년 이후):');
    console.log('================================');
    
    const yearDist = await pool.query(`
      SELECT 
        FLOOR(year_start / 10) * 10 as decade,
        COUNT(*) as count
      FROM artworks
      WHERE year_start >= 1800 AND year_start IS NOT NULL
      GROUP BY decade
      ORDER BY decade DESC
      LIMIT 20
    `);
    
    if (yearDist.rows.length > 0) {
      yearDist.rows.forEach(row => {
        console.log(`${row.decade}년대: ${row.count.toLocaleString()}개`);
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터베이스 확인 중 오류:', error);
  } finally {
    await pool.end();
  }
}

checkArtworksDatabase();