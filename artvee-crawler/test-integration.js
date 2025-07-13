const SAYUArtveeIntegration = require('./sayu-artvee-integration');
require('dotenv').config();

/**
 * SAYU-Artvee 통합 테스트
 */
async function testIntegration() {
  console.log('🎨 SAYU-Artvee 통합 테스트\n');
  
  // 환경 변수 확인
  if (!process.env.DATABASE_URL) {
    console.log('⚠️ DATABASE_URL이 설정되지 않았습니다.');
    console.log('💡 .env 파일을 생성하고 다음 내용을 추가하세요:');
    console.log('   DATABASE_URL=postgresql://username:password@localhost:5432/sayu_db\n');
    return;
  }
  
  const integration = new SAYUArtveeIntegration();
  
  try {
    // 1. 단일 작품 테스트
    console.log('1️⃣ 단일 작품 임포트 테스트...\n');
    
    const testUrl = 'https://artvee.com/dl/molens-oliemolen-de-zeemeeuw-westzaandam/';
    console.log(`   테스트 URL: ${testUrl}`);
    
    const artwork = await integration.importArtwork(testUrl);
    
    console.log('\n✅ 임포트 성공!');
    console.log(`   - ID: ${artwork.id}`);
    console.log(`   - 제목: ${artwork.title}`);
    console.log(`   - 작가: ${artwork.artist}`);
    console.log(`   - SAYU 타입: ${artwork.personality_tags.join(', ')}`);
    console.log(`   - 감정 태그: ${artwork.emotion_tags.slice(0, 5).join(', ')}`);
    
    // 2. 데이터베이스 확인
    console.log('\n2️⃣ 데이터베이스 상태 확인...\n');
    
    const stats = await integration.pool.query('SELECT * FROM artvee_artwork_stats');
    if (stats.rows.length > 0) {
      const stat = stats.rows[0];
      console.log('   📊 전체 통계:');
      console.log(`      - 총 작품 수: ${stat.total_artworks}`);
      console.log(`      - 활성 작품: ${stat.active_artworks}`);
      console.log(`      - SAYU 타입 태깅된 작품: ${stat.tagged_artworks}`);
      console.log(`      - 고유 작가 수: ${stat.unique_artists}`);
    }
    
    // 3. SAYU 타입별 분포 확인
    console.log('\n3️⃣ SAYU 타입별 작품 분포...\n');
    
    const distribution = await integration.pool.query(`
      SELECT * FROM personality_artwork_distribution 
      ORDER BY artwork_count DESC
      LIMIT 5
    `);
    
    if (distribution.rows.length > 0) {
      console.log('   🎯 상위 5개 타입:');
      distribution.rows.forEach(row => {
        console.log(`      - ${row.personality_type}: ${row.artwork_count}개 작품`);
      });
    }
    
    // 4. 특정 SAYU 타입 작품 조회
    console.log('\n4️⃣ LAEF(여우) 타입 추천 작품...\n');
    
    const laefArtworks = await integration.pool.query(
      `SELECT * FROM get_personality_artworks('LAEF', 5)`
    );
    
    if (laefArtworks.rows.length > 0) {
      console.log('   🦊 LAEF 추천 작품:');
      laefArtworks.rows.forEach((art, i) => {
        console.log(`      ${i + 1}. ${art.title} - ${art.artist} (점수: ${art.relevance_score.toFixed(2)})`);
      });
    }
    
    // 5. 배치 임포트 안내
    console.log('\n5️⃣ 배치 임포트 안내\n');
    console.log('   💡 전체 URL 목록을 임포트하려면:');
    console.log('      node run-batch-import.js\n');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 데이터베이스 연결 실패. PostgreSQL이 실행 중인지 확인하세요.');
    } else if (error.code === '42P01') {
      console.log('\n💡 테이블이 없습니다. 먼저 마이그레이션을 실행하세요:');
      console.log('   psql -U username -d sayu_db -f ../backend/migrations/artvee-integration-schema.sql');
    }
  } finally {
    await integration.close();
  }
  
  console.log('\n✨ 테스트 완료!');
}

// 실행
testIntegration().catch(console.error);