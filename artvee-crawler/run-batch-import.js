const SAYUArtveeIntegration = require('./sayu-artvee-integration');
const path = require('path');
require('dotenv').config();

/**
 * SAYU-Artvee 배치 임포트 실행
 */
async function runBatchImport() {
  console.log('🎨 SAYU-Artvee 배치 임포트\n');
  
  // 환경 변수 확인
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL이 설정되지 않았습니다.');
    console.log('💡 .env 파일을 생성하고 다음 내용을 추가하세요:');
    console.log('   DATABASE_URL=postgresql://username:password@localhost:5432/sayu_db\n');
    process.exit(1);
  }
  
  const integration = new SAYUArtveeIntegration();
  
  try {
    // 옵션 설정
    const options = {
      limit: parseInt(process.argv[2]) || 50, // 기본 50개
      startFrom: parseInt(process.argv[3]) || 0 // 시작 인덱스
    };
    
    console.log(`📋 설정:`);
    console.log(`   - 처리할 작품 수: ${options.limit}개`);
    console.log(`   - 시작 인덱스: ${options.startFrom}`);
    console.log(`   - URL 파일: artwork-urls-optimized.json\n`);
    
    // 확인 프롬프트
    if (options.limit > 100) {
      console.log('⚠️  경고: 많은 수의 작품을 처리하면 시간이 오래 걸립니다.');
      console.log('   계속하시겠습니까? (5초 후 자동 시작)\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // 배치 임포트 실행
    const urlsFile = path.join(__dirname, 'data', 'artwork-urls-optimized.json');
    const result = await integration.batchImport(urlsFile, options);
    
    // 최종 통계
    console.log('\n📊 최종 통계:');
    
    const stats = await integration.pool.query('SELECT * FROM artvee_artwork_stats');
    if (stats.rows.length > 0) {
      const stat = stats.rows[0];
      console.log(`   - 전체 작품 수: ${stat.total_artworks}`);
      console.log(`   - 태깅된 작품: ${stat.tagged_artworks}`);
      console.log(`   - 평균 품질 점수: ${parseFloat(stat.avg_quality_score).toFixed(2)}`);
    }
    
    // SAYU 타입별 통계
    console.log('\n🎯 SAYU 타입별 분포:');
    
    const distribution = await integration.pool.query(`
      SELECT * FROM personality_artwork_distribution 
      ORDER BY artwork_count DESC
    `);
    
    distribution.rows.forEach(row => {
      console.log(`   - ${row.personality_type}: ${row.artwork_count}개`);
    });
    
    // 다음 배치 안내
    if (options.startFrom + options.limit < 1000) {
      console.log(`\n💡 다음 배치를 실행하려면:`);
      console.log(`   node run-batch-import.js ${options.limit} ${options.startFrom + options.limit}`);
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    if (error.code === '42P01') {
      console.log('\n💡 데이터베이스 테이블이 없습니다.');
      console.log('   먼저 마이그레이션을 실행하세요:');
      console.log('   cd ../backend && npm run db:migrate');
    }
  } finally {
    await integration.close();
  }
}

// 사용법 안내
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('사용법: node run-batch-import.js [limit] [startFrom]');
  console.log('');
  console.log('옵션:');
  console.log('  limit      처리할 작품 수 (기본: 50)');
  console.log('  startFrom  시작 인덱스 (기본: 0)');
  console.log('');
  console.log('예시:');
  console.log('  node run-batch-import.js          # 처음 50개 처리');
  console.log('  node run-batch-import.js 100      # 처음 100개 처리');
  console.log('  node run-batch-import.js 50 50    # 50번째부터 50개 처리');
  process.exit(0);
}

// 실행
runBatchImport().catch(console.error);