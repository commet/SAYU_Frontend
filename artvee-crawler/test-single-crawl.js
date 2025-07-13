const { ArtveeAdvancedCrawler } = require('./lib/advanced-crawler');
const { ImageAnalysisEngine } = require('./lib/image-analysis-engine');
const ArtistPreferenceSystem = require('./lib/artist-preference-system');

/**
 * 단일 작품 크롤링 테스트
 */
async function testSingleCrawl() {
  console.log('🎨 Artvee 단일 작품 크롤링 테스트\n');
  
  try {
    // 테스트용 URL
    const testUrl = 'https://artvee.com/dl/molens-oliemolen-de-zeemeeuw-westzaandam/';
    
    // 크롤러 초기화
    const crawler = new ArtveeAdvancedCrawler({
      rateLimit: 1000,
      retryAttempts: 3,
      userAgent: 'SAYU-Artvee-Crawler/1.0'
    });
    
    console.log('1️⃣ 작품 정보 크롤링...');
    console.log(`   URL: ${testUrl}`);
    
    // 크롤링 실행
    const artwork = await crawler.crawlArtwork(testUrl);
    
    if (artwork) {
      console.log('\n✅ 크롤링 성공!');
      console.log('📊 작품 정보:');
      console.log(`   - 제목: ${artwork.title}`);
      console.log(`   - 작가: ${artwork.artist}`);
      console.log(`   - 연도: ${artwork.year || '알 수 없음'}`);
      console.log(`   - 장르: ${artwork.genre || '알 수 없음'}`);
      console.log(`   - 태그: ${artwork.tags.slice(0, 5).join(', ')}`);
      console.log(`   - 이미지: ${artwork.images.original}`);
      
      // 이미지 분석 (선택사항)
      if (artwork.images.original) {
        console.log('\n2️⃣ 이미지 분석...');
        const analyzer = new ImageAnalysisEngine();
        
        try {
          const analysis = await analyzer.analyzeImage(artwork.images.original);
          console.log('   📸 이미지 분석 결과:');
          console.log(`      - 주요 색상: ${analysis.colorPalette.slice(0, 3).join(', ')}`);
          console.log(`      - 밝기: ${analysis.brightness.toFixed(2)}`);
          console.log(`      - 대비: ${analysis.contrast.toFixed(2)}`);
          console.log(`      - 채도: ${analysis.saturation.toFixed(2)}`);
        } catch (imgError) {
          console.log('   ⚠️ 이미지 분석 실패:', imgError.message);
        }
      }
      
      // SAYU 타입별 추천도 계산
      console.log('\n3️⃣ SAYU 타입별 추천도 분석...');
      
      // 각 SAYU 타입에 대한 간단한 매칭 점수 계산
      const sayuTypes = ['LAEF', 'LAEC', 'LAMF', 'LAMC'];
      const matchScores = {};
      
      sayuTypes.forEach(type => {
        let score = 0;
        
        // 예시: 장르/태그 기반 매칭
        if (type === 'LAEF' && artwork.tags.some(tag => 
          ['dreamy', 'mystical', 'romantic'].includes(tag.toLowerCase())
        )) {
          score += 50;
        }
        
        if (type === 'LAEC' && artwork.tags.some(tag => 
          ['elegant', 'refined', 'atmospheric'].includes(tag.toLowerCase())
        )) {
          score += 50;
        }
        
        matchScores[type] = score;
      });
      
      console.log('   🎯 타입별 매칭 점수:');
      Object.entries(matchScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .forEach(([type, score]) => {
          console.log(`      - ${type}: ${score}점`);
        });
      
    } else {
      console.log('❌ 크롤링 실패');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
  
  console.log('\n✨ 테스트 완료!');
}

// 실행
testSingleCrawl().catch(console.error);