const { Pool } = require('pg');

async function checkArtistsStructure() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('=== ARTISTS 테이블 구조 분석 ===\n');
    
    // 테이블 구조 확인
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'artists' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 컬럼 구조:');
    structure.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // 감정/성격 관련 컬럼 확인
    console.log('\n🎭 감정/성격 관련 컬럼 확인:');
    const emotionColumns = structure.rows.filter(row => 
      row.column_name.includes('emotion') || 
      row.column_name.includes('personality') || 
      row.column_name.includes('animal') ||
      row.column_name.includes('mbti') ||
      row.column_name.includes('sentiment') ||
      row.column_name.includes('mood')
    );
    
    if (emotionColumns.length === 0) {
      console.log('  ❌ 감정/성격 관련 컬럼이 없습니다!');
    } else {
      emotionColumns.forEach(col => console.log(`  ✅ ${col.column_name}: ${col.data_type}`));
    }
    
    // 샘플 데이터 확인
    console.log('\n📊 샘플 아티스트 데이터:');
    const sample = await pool.query('SELECT * FROM artists LIMIT 3');
    sample.rows.forEach((artist, i) => {
      console.log(`\n${i+1}. ${artist.name}`);
      console.log(`   ID: ${artist.id}`);
      console.log(`   한국어명: ${artist.korean_name || 'N/A'}`);
      console.log(`   생년: ${artist.birth_year || 'N/A'}`);
      console.log(`   사망년: ${artist.death_year || 'N/A'}`);
      console.log(`   활동 유형: ${artist.is_contemporary ? '현대' : '고전'}`);
    });
    
    // 통계
    console.log('\n📈 통계:');
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(birth_year) as has_birth_year,
        COUNT(korean_name) as has_korean_name,
        COUNT(CASE WHEN is_contemporary THEN 1 END) as contemporary,
        COUNT(CASE WHEN NOT is_contemporary THEN 1 END) as classical
      FROM artists
    `);
    
    const stat = stats.rows[0];
    console.log(`  총 아티스트: ${stat.total}명`);
    console.log(`  생년 정보 보유: ${stat.has_birth_year}명 (${(stat.has_birth_year/stat.total*100).toFixed(1)}%)`);
    console.log(`  한국어명 보유: ${stat.has_korean_name}명 (${(stat.has_korean_name/stat.total*100).toFixed(1)}%)`);
    console.log(`  현대 작가: ${stat.contemporary}명`);
    console.log(`  고전 작가: ${stat.classical}명`);
    
  } catch (error) {
    console.error('오류:', error.message);
  } finally {
    await pool.end();
  }
}

checkArtistsStructure();