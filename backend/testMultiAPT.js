// 다중 APT 분류 시스템 테스트
// 유명 작가들을 대상으로 주/부/제3 성향 분석

require('dotenv').config();
const { pool } = require('./src/config/database');
const MultiAPTClassifier = require('./src/services/multiAPTClassifier');

async function testMultiAPT() {
  console.log('🎭 다중 APT 분류 시스템 테스트');
  console.log('=' + '='.repeat(70));
  console.log('한 작가의 복합적 성향을 3가지 APT로 표현\n');
  
  const classifier = new MultiAPTClassifier();
  
  try {
    // 테스트할 유명 작가들
    const testArtists = [
      'Pablo Picasso',
      'Vincent van Gogh', 
      'Frida Kahlo',
      'Andy Warhol',
      'Claude Monet',
      'Salvador Dalí',
      'Yayoi Kusama',
      'Leonardo da Vinci',
      'Banksy',
      'Georgia O\'Keeffe'
    ];
    
    // 작가 정보 조회
    const artists = await pool.query(`
      SELECT *
      FROM artists
      WHERE ${testArtists.map(name => 
        `name ILIKE '%${name.replace(/'/g, "''")}%'`
      ).join(' OR ')}
      ORDER BY 
        CASE
          WHEN name LIKE '%Picasso%' THEN 1
          WHEN name LIKE '%Van Gogh%' THEN 2
          WHEN name LIKE '%Kahlo%' THEN 3
          WHEN name LIKE '%Warhol%' THEN 4
          WHEN name LIKE '%Monet%' THEN 5
          ELSE 6
        END
      LIMIT 10
    `);
    
    console.log(`📊 분석 대상: ${artists.rows.length}명의 유명 작가\n`);
    
    // 각 작가 분석
    for (const artist of artists.rows) {
      console.log('\n' + '─'.repeat(70));
      console.log(`\n🎨 ${artist.name}`);
      console.log(`   국적: ${artist.nationality || '불명'} | 시대: ${artist.era || '불명'}`);
      
      // 기존 단일 APT
      const currentAPT = artist.apt_profile?.primary_types?.[0];
      if (currentAPT) {
        console.log(`   현재 APT: ${currentAPT.type} - ${currentAPT.title} (${currentAPT.confidence}%)`);
      }
      
      // 다중 APT 분류
      const multiResult = await classifier.classifyArtist(artist);
      
      console.log('\n   🔄 다중 APT 분석 결과:');
      
      // 주/부/제3 성향 표시
      multiResult.primaryTypes.forEach(apt => {
        const rankLabel = apt.rank === 1 ? '주 성향' : 
                         apt.rank === 2 ? '부 성향' : '제3 성향';
        const percentage = Math.round(apt.weight * 100);
        
        console.log(`\n   ${rankLabel} (${percentage}%): ${apt.type} - ${apt.title}`);
        console.log(`   🦁 ${apt.name_ko} (${apt.animal})`);
        console.log(`   📝 ${apt.description}`);
        console.log(`   매칭도: L/S ${apt.matchDetails.L_S_match}% | A/R ${apt.matchDetails.A_R_match}% | E/M ${apt.matchDetails.E_M_match}% | F/C ${apt.matchDetails.F_C_match}%`);
      });
      
      // 세부 점수
      console.log('\n   📈 세부 분석 점수:');
      const scores = multiResult.detailedScores;
      console.log(`   L/S축: ${scores.L_S.main} (고독성 ${scores.L_S.sub.loneliness}, 사교성 ${scores.L_S.sub.sociability})`);
      console.log(`   A/R축: ${scores.A_R.main} (개념성 ${scores.A_R.sub.conceptual}, 현실성 ${scores.A_R.sub.realistic})`);
      console.log(`   E/M축: ${scores.E_M.main} (정서성 ${scores.E_M.sub.emotional}, 분석성 ${scores.E_M.sub.analytical})`);
      console.log(`   F/C축: ${scores.F_C.main} (유연성 ${scores.F_C.sub.flexible}, 체계성 ${scores.F_C.sub.systematic})`);
      
      if (multiResult.analysis.reasoning) {
        console.log(`\n   💭 종합 분석: ${multiResult.analysis.reasoning}`);
      }
      
      // 데이터 소스
      if (multiResult.analysis.sources && multiResult.analysis.sources.length > 0) {
        console.log(`   📚 데이터 소스: ${multiResult.analysis.sources.join(', ')}`);
      }
      
      // 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 다중 APT 시스템의 장점 설명
    console.log('\n\n' + '='.repeat(70));
    console.log('📌 다중 APT 시스템의 장점:');
    console.log('='.repeat(70));
    console.log(`
1. 🎭 복합적 성향 표현
   - 한 작가의 다면적 특성을 더 정확히 포착
   - 주/부/제3 성향으로 풍부한 프로필 생성
   
2. 🎯 정밀한 매칭
   - 사용자와의 다층적 매칭 가능
   - 상황과 기분에 따른 유연한 추천
   
3. 🌈 다양성 증진
   - 단일 유형 편중 현상 해소
   - 더 많은 APT 유형 활용
   
4. 📊 가중치 시스템
   - 각 성향의 상대적 중요도 표현
   - 더 섬세한 추천 알고리즘 구현 가능
    `);
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

// 실행
testMultiAPT().catch(console.error);