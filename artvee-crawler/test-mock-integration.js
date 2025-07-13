/**
 * 모의 SAYU-Artvee 통합 테스트 (데이터베이스 없이)
 */
const axios = require('axios');
const cheerio = require('cheerio');

async function testMockIntegration() {
  console.log('🎨 SAYU-Artvee 모의 통합 테스트\n');
  
  try {
    // 1. Artvee URL 목록 확인
    console.log('1️⃣ URL 목록 확인...\n');
    
    const fs = require('fs').promises;
    const path = require('path');
    
    const urlsFile = path.join(__dirname, 'data', 'artwork-urls-optimized.json');
    
    try {
      const urlsData = await fs.readFile(urlsFile, 'utf8');
      const urls = JSON.parse(urlsData);
      
      console.log(`   ✅ URL 파일 로드 성공: ${urls.length}개`);
      console.log(`   📌 샘플 URL: ${urls[0]}\n`);
      
      // 2. 단일 작품 크롤링 테스트
      console.log('2️⃣ 단일 작품 크롤링 테스트...\n');
      
      const testUrl = urls[0];
      console.log(`   테스트 URL: ${testUrl}`);
      
      const response = await axios.get(testUrl, {
        headers: {
          'User-Agent': 'SAYU-Artvee-Test/1.0'
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(response.data);
      
      const artwork = {
        artveeId: testUrl.match(/\/dl\/([^\/]+)\//)?.[1] || 'unknown',
        title: $('h1').first().text().trim(),
        artist: $('.product-artist a').first().text().trim() || 'Unknown',
        imageUrl: $('.woocommerce-product-gallery__image img').first().attr('src'),
        tags: []
      };
      
      // 태그 수집
      $('.product-tags a').each((i, el) => {
        artwork.tags.push($(el).text().trim().toLowerCase());
      });
      
      console.log('   ✅ 크롤링 성공!');
      console.log(`      - 제목: ${artwork.title}`);
      console.log(`      - 작가: ${artwork.artist}`);
      console.log(`      - 태그: ${artwork.tags.slice(0, 5).join(', ')}`);
      console.log(`      - 이미지: ${artwork.imageUrl ? '있음' : '없음'}\n`);
      
      // 3. SAYU 타입 매칭 테스트
      console.log('3️⃣ SAYU 타입 매칭 테스트...\n');
      
      const sayuMatching = analyzeSayuMatching(artwork);
      
      console.log('   🎯 추천 SAYU 타입:');
      Object.entries(sayuMatching)
        .sort(([,a], [,b]) => b.score - a.score)
        .slice(0, 3)
        .forEach(([type, data]) => {
          if (data.score > 0) {
            console.log(`      - ${type}: ${data.score}점`);
            data.reasons.forEach(reason => {
              console.log(`        • ${reason}`);
            });
          }
        });
      
      // 4. API 시뮬레이션
      console.log('\n4️⃣ API 응답 시뮬레이션...\n');
      
      const apiResponse = {
        success: true,
        artwork: {
          id: `mock-${artwork.artveeId}`,
          ...artwork,
          personality_tags: Object.entries(sayuMatching)
            .filter(([,data]) => data.score > 0)
            .sort(([,a], [,b]) => b.score - a.score)
            .slice(0, 2)
            .map(([type]) => type),
          emotion_tags: artwork.tags.slice(0, 5),
          processing_status: 'processed'
        }
      };
      
      console.log('   📊 API 응답 (JSON):');
      console.log(JSON.stringify(apiResponse, null, 2));
      
      // 5. 프론트엔드 컴포넌트 시뮬레이션
      console.log('\n5️⃣ 프론트엔드 사용 예시...\n');
      
      console.log('   React 컴포넌트에서 사용:');
      console.log(`   <PersonalityArtworks personalityType="${apiResponse.artwork.personality_tags[0]}" />`);
      console.log(`   <QuizArtworkBackground artworkId="${apiResponse.artwork.id}" />`);
      
    } catch (fileError) {
      console.log('   ⚠️ URL 파일을 찾을 수 없습니다.');
      console.log('   💡 먼저 URL 수집을 실행하세요: node collect-urls-optimized.js\n');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
  
  console.log('\n✨ 모의 테스트 완료!');
  console.log('\n💡 실제 데이터베이스와 연결하려면:');
  console.log('   1. .env 파일에 DATABASE_URL 설정');
  console.log('   2. PostgreSQL 데이터베이스 실행');
  console.log('   3. 마이그레이션 실행: psql -f ../backend/migrations/artvee-integration-schema.sql');
  console.log('   4. node test-integration.js 실행');
}

/**
 * SAYU 타입 매칭 분석 (모의)
 */
function analyzeSayuMatching(artwork) {
  const sayuTypes = {
    'LAEF': '여우 - 몽환적 방랑자',
    'LAEC': '고양이 - 감성 큐레이터', 
    'LAMF': '올빼미 - 직관적 탐구자',
    'LAMC': '거북이 - 철학적 수집가',
    'SAEF': '나비 - 감성 나눔이',
    'SRMC': '독수리 - 체계적 교육자'
  };
  
  const matching = {};
  
  // 각 타입별 초기화
  Object.keys(sayuTypes).forEach(type => {
    matching[type] = { score: 0, reasons: [] };
  });
  
  // 태그 기반 분석
  artwork.tags.forEach(tag => {
    // LAEF - 몽환적, 감정적
    if (['landscape', 'romantic', 'nature', 'atmospheric'].some(word => tag.includes(word))) {
      matching.LAEF.score += 15;
      matching.LAEF.reasons.push(`관련 태그: ${tag}`);
    }
    
    // SAEF - 활기찬, 사교적
    if (['colorful', 'vibrant', 'festival', 'celebration'].some(word => tag.includes(word))) {
      matching.SAEF.score += 15;
      matching.SAEF.reasons.push(`관련 태그: ${tag}`);
    }
    
    // SRMC - 교육적, 체계적
    if (['classical', 'museum', 'historical', 'academic'].some(word => tag.includes(word))) {
      matching.SRMC.score += 15;
      matching.SRMC.reasons.push(`관련 태그: ${tag}`);
    }
  });
  
  // 작가 기반 분석
  const artistLower = artwork.artist.toLowerCase();
  
  if (['van gogh', 'monet', 'turner'].some(name => artistLower.includes(name))) {
    matching.LAEF.score += 25;
    matching.LAEF.reasons.push(`선호 작가: ${artwork.artist}`);
  }
  
  if (['leonardo', 'michelangelo', 'raphael'].some(name => artistLower.includes(name))) {
    matching.SRMC.score += 25;
    matching.SRMC.reasons.push(`선호 작가: ${artwork.artist}`);
  }
  
  // 기본 점수 (모든 작품에 최소 점수)
  Object.keys(matching).forEach(type => {
    if (matching[type].score === 0) {
      matching[type].score = 5;
      matching[type].reasons.push('일반적 호환성');
    }
  });
  
  return matching;
}

// 실행
testMockIntegration().catch(console.error);