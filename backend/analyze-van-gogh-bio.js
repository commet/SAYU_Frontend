require('dotenv').config();
const { pool } = require('./src/config/database');

async function analyzeVanGoghBio() {
  try {
    console.log('=== Vincent van Gogh Bio 상세 분석 ===\n');

    // Vincent van Gogh의 전체 bio 가져오기
    const query = `
      SELECT 
        id,
        name,
        name_ko,
        bio,
        bio_ko,
        sources,
        copyright_status,
        is_verified,
        verification_method,
        created_at,
        updated_at
      FROM artists 
      WHERE name = 'Vincent van Gogh'
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length > 0) {
      const vanGogh = result.rows[0];
      
      console.log('1. 기본 정보:');
      console.log(`- ID: ${vanGogh.id}`);
      console.log(`- 이름: ${vanGogh.name}`);
      console.log(`- 한글명: ${vanGogh.name_ko}`);
      console.log(`- 저작권 상태: ${vanGogh.copyright_status}`);
      console.log(`- 검증 여부: ${vanGogh.is_verified}`);
      console.log(`- 검증 방법: ${vanGogh.verification_method}`);
      console.log(`- 출처: ${JSON.stringify(vanGogh.sources, null, 2)}`);
      console.log(`- 생성일: ${vanGogh.created_at}`);
      console.log(`- 수정일: ${vanGogh.updated_at}`);
      
      console.log('\n2. Bio 분석:');
      if (vanGogh.bio) {
        console.log(`- 전체 길이: ${vanGogh.bio.length}자`);
        console.log(`- 단어 수: ${vanGogh.bio.split(/\s+/).length}개`);
        console.log(`- 문단 수: ${vanGogh.bio.split('\n\n').length}개`);
        console.log(`- 줄 수: ${vanGogh.bio.split('\n').length}개`);
        
        // 전체 bio 출력
        console.log('\n3. Bio 전체 내용:');
        console.log('='.repeat(80));
        console.log(vanGogh.bio);
        console.log('='.repeat(80));
        
        // Wikipedia 전체 페이지 특징 분석
        console.log('\n4. Wikipedia 전체 페이지 특징 분석:');
        
        const fullPageFeatures = {
          'Wikipedia 참조 번호 [1], [2] 등': /\[\d+\]/g,
          'Wikipedia 내부 링크 [[]]': /\[\[.*?\]\]/g,
          'Wikipedia 템플릿 {{}}': /\{\{.*?\}\}/g,
          'Wikipedia 섹션 제목 ==': /==.*?==/g,
          'Wikipedia 인용구 ""': /"[^"]+"/g,
          'Wikipedia 목록 *': /^\s*\*/gm,
          'Wikipedia 테이블 |': /\|.*?\|/g
        };
        
        let hasWikipediaFeatures = false;
        for (const [feature, pattern] of Object.entries(fullPageFeatures)) {
          const matches = vanGogh.bio.match(pattern);
          if (matches && matches.length > 0) {
            console.log(`✓ ${feature}: ${matches.length}개 발견`);
            hasWikipediaFeatures = true;
          } else {
            console.log(`✗ ${feature}: 없음`);
          }
        }
        
        console.log('\n5. 내용 완성도 분석:');
        
        // 주요 생애 사건 포함 여부
        const lifeEvents = {
          '출생 정보': /born|1853|March 30|Zundert/i,
          '가족 관계': /brother|Theo|family/i,
          '파리 시절': /Paris|Montmartre|Impressionist/i,
          '아를 시절': /Arles|Yellow House|Gauguin/i,
          '귀 사건': /ear|self-mutilation|December 1888/i,
          '생레미 시절': /Saint-Rémy|asylum|hospital/i,
          '오베르 시절': /Auvers|Dr\. Gachet|Ravoux/i,
          '죽음': /death|suicide|July 1890|shot/i,
          '유산과 영향': /legacy|influence|posthumous/i,
          '주요 작품': /Starry Night|Sunflowers|Potato Eaters/i
        };
        
        let completenessScore = 0;
        for (const [event, pattern] of Object.entries(lifeEvents)) {
          if (pattern.test(vanGogh.bio)) {
            console.log(`✓ ${event}`);
            completenessScore++;
          } else {
            console.log(`✗ ${event}`);
          }
        }
        
        console.log(`\n완성도 점수: ${completenessScore}/10`);
        
        // 최종 판단
        console.log('\n6. 최종 판단:');
        
        if (vanGogh.bio.length > 10000 && hasWikipediaFeatures) {
          console.log('결론: Wikipedia 전체 페이지가 저장된 것으로 보입니다.');
        } else if (vanGogh.bio.length > 2000 && completenessScore >= 7) {
          console.log('결론: Wikipedia의 주요 내용을 포함한 상세한 요약본입니다.');
        } else if (vanGogh.bio.length < 2000) {
          console.log('결론: 간략한 요약본입니다.');
        } else {
          console.log('결론: Wikipedia 요약본 또는 다른 출처의 전기 정보입니다.');
        }
        
        console.log(`\n추가 정보:`);
        console.log(`- 이 bio는 ${vanGogh.bio.length < 5000 ? '요약' : '상세'} 버전입니다.`);
        console.log(`- Wikipedia 전체 페이지는 보통 20,000자 이상입니다.`);
        console.log(`- 현재 저장된 내용은 주요 정보를 담고 있지만 전체 페이지는 아닙니다.`);
      }
      
      console.log('\n7. 한글 Bio 분석:');
      if (vanGogh.bio_ko) {
        console.log(`- 한글 Bio 길이: ${vanGogh.bio_ko.length}자`);
        console.log(`- 한글 Bio 미리보기: ${vanGogh.bio_ko.substring(0, 200)}...`);
      } else {
        console.log('- 한글 Bio: 없음');
      }
      
      // 관련 데이터 확인
      console.log('\n8. 관련 데이터 확인:');
      
      // artist_embeddings 확인
      const embeddingQuery = `
        SELECT COUNT(*) as count
        FROM artist_embeddings
        WHERE artist_id = $1
      `;
      const embeddingResult = await pool.query(embeddingQuery, [vanGogh.id]);
      console.log(`- 임베딩 데이터: ${embeddingResult.rows[0].count > 0 ? '있음' : '없음'}`);
      
      // artwork 연결 방법 확인 (artist_artworks 테이블 사용)
      const artworkQuery = `
        SELECT COUNT(*) as count
        FROM artist_artworks
        WHERE artist_id = $1
      `;
      const artworkResult = await pool.query(artworkQuery, [vanGogh.id]);
      console.log(`- 연결된 작품 수: ${artworkResult.rows[0].count}개`);
      
    } else {
      console.log('Vincent van Gogh 데이터를 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await pool.end();
  }
}

analyzeVanGoghBio();