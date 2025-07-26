require('dotenv').config();
const { pool } = require('./src/config/database');

async function checkVanGoghData() {
  try {
    console.log('=== Van Gogh 데이터 상세 조회 ===\n');

    // 먼저 artists 테이블 구조 확인
    console.log('0. Artists 테이블 구조:');
    const columnsQuery = `
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'artists'
      ORDER BY ordinal_position;
    `;
    
    const columnsResult = await pool.query(columnsQuery);
    console.log('Columns:', columnsResult.rows.map(col => col.column_name).join(', '));
    console.log('');

    // 1. artists 테이블에서 Van Gogh 전체 데이터 조회
    console.log('1. Van Gogh 아티스트 정보:');
    const artistQuery = `
      SELECT *
      FROM artists 
      WHERE LOWER(name) LIKE '%van gogh%' 
         OR LOWER(name_ko) LIKE '%고흐%'
    `;
    
    const artistResult = await pool.query(artistQuery);
    
    if (artistResult.rows.length > 0) {
      const artist = artistResult.rows[0];
      
      console.log('\n기본 정보:');
      console.log(`- ID: ${artist.id}`);
      console.log(`- 이름: ${artist.name}`);
      console.log(`- 한글명: ${artist.name_ko}`);
      console.log(`- 생년: ${artist.birth_year}`);
      console.log(`- 사망년: ${artist.death_year}`);
      console.log(`- 국적: ${artist.nationality}`);
      console.log(`- 미술 사조: ${artist.art_movements}`);
      
      console.log('\n설명 필드:');
      console.log(`- Description 길이: ${artist.description ? artist.description.length : 0}자`);
      if (artist.description) {
        console.log(`- Description 미리보기: ${artist.description.substring(0, 200)}...`);
      }
      
      console.log('\n전기(Bio) 필드:');
      console.log(`- Bio 전체 길이: ${artist.bio_length}자`);
      if (artist.bio) {
        // Bio 내용 구조 분석
        const sections = artist.bio.split('\n\n');
        console.log(`- Bio 섹션 수: ${sections.length}개`);
        
        // 주요 키워드 확인
        const keywords = [
          'Early life', 'Career', 'Style', 'Death', 'Legacy',
          '생애', '경력', '작품', '죽음', '유산', '영향'
        ];
        
        console.log('\nBio에 포함된 주요 섹션:');
        keywords.forEach(keyword => {
          if (artist.bio.toLowerCase().includes(keyword.toLowerCase())) {
            console.log(`  ✓ ${keyword}`);
          }
        });
        
        console.log('\nBio 첫 500자:');
        console.log(artist.bio.substring(0, 500) + '...');
        
        console.log('\nBio 마지막 500자:');
        console.log('...' + artist.bio.substring(artist.bio.length - 500));
      }
      
      console.log('\n출처 정보:');
      console.log(`- Sources: ${artist.sources || 'N/A'}`);
      console.log(`- Wikipedia URL: ${artist.wikipedia_url || 'N/A'}`);
      
      console.log('\n시간 정보:');
      console.log(`- 생성일: ${artist.created_at}`);
      console.log(`- 수정일: ${artist.updated_at}`);
      
    } else {
      console.log('Van Gogh 데이터를 찾을 수 없습니다.');
    }

    // 2. 반고흐의 작품 수 확인
    console.log('\n\n2. Van Gogh 작품 수:');
    const artworkCountQuery = `
      SELECT 
        COUNT(*) as total_artworks,
        COUNT(DISTINCT collection) as collections,
        MIN(year_created) as earliest_work,
        MAX(year_created) as latest_work
      FROM artworks 
      WHERE artist_id IN (
        SELECT id FROM artists 
        WHERE LOWER(name) LIKE '%van gogh%' 
           OR LOWER(name_ko) LIKE '%고흐%'
      )
    `;
    
    const artworkCountResult = await pool.query(artworkCountQuery);
    const artworkStats = artworkCountResult.rows[0];
    
    console.log(`- 총 작품 수: ${artworkStats.total_artworks}`);
    console.log(`- 컬렉션 수: ${artworkStats.collections}`);
    console.log(`- 가장 이른 작품: ${artworkStats.earliest_work}`);
    console.log(`- 가장 늦은 작품: ${artworkStats.latest_work}`);

    // 3. 반고흐 작품 샘플
    console.log('\n3. Van Gogh 대표 작품 (10개):');
    const artworkSampleQuery = `
      SELECT 
        title,
        year_created,
        medium,
        dimensions,
        collection
      FROM artworks 
      WHERE artist_id IN (
        SELECT id FROM artists 
        WHERE LOWER(name) LIKE '%van gogh%' 
           OR LOWER(name_ko) LIKE '%고흐%'
      )
      ORDER BY year_created DESC
      LIMIT 10
    `;
    
    const artworkSampleResult = await pool.query(artworkSampleQuery);
    artworkSampleResult.rows.forEach(artwork => {
      console.log(`- ${artwork.title} (${artwork.year_created})`);
      console.log(`  매체: ${artwork.medium}`);
      console.log(`  크기: ${artwork.dimensions}`);
      console.log(`  소장처: ${artwork.collection}`);
      console.log('');
    });

    // 4. Bio 필드의 Wikipedia 내용 분석
    if (artistResult.rows.length > 0 && artistResult.rows[0].bio) {
      console.log('\n4. Bio 필드 상세 분석:');
      const bio = artistResult.rows[0].bio;
      
      // Wikipedia 특징적인 패턴 확인
      const wikipediaPatterns = [
        { pattern: /\[\d+\]/g, name: '참조 번호 [1], [2] 등' },
        { pattern: /===.*===/g, name: '섹션 제목 (=== ===)' },
        { pattern: /==.*==/g, name: '섹션 제목 (== ==)' },
        { pattern: /\{\{.*\}\}/g, name: '템플릿 {{}}' },
        { pattern: /\[\[.*\]\]/g, name: '내부 링크 [[]]' }
      ];
      
      console.log('\nWikipedia 마크업 패턴:');
      wikipediaPatterns.forEach(({ pattern, name }) => {
        const matches = bio.match(pattern);
        if (matches) {
          console.log(`- ${name}: ${matches.length}개 발견`);
          if (matches.length > 0 && matches.length <= 5) {
            console.log(`  예시: ${matches.slice(0, 3).join(', ')}`);
          }
        }
      });
      
      // 단어 수 계산
      const wordCount = bio.split(/\s+/).length;
      const lineCount = bio.split('\n').length;
      
      console.log(`\n텍스트 통계:`);
      console.log(`- 총 단어 수: ${wordCount.toLocaleString()}개`);
      console.log(`- 총 줄 수: ${lineCount.toLocaleString()}개`);
      console.log(`- 평균 줄당 글자: ${Math.round(bio.length / lineCount)}자`);
      
      // 주요 작품명 포함 여부
      const famousWorks = [
        'The Starry Night', 'Sunflowers', 'The Potato Eaters',
        'Irises', 'Café Terrace at Night', 'Self-Portrait',
        'The Bedroom', 'Almond Blossoms'
      ];
      
      console.log('\n유명 작품 언급:');
      famousWorks.forEach(work => {
        if (bio.includes(work)) {
          console.log(`  ✓ ${work}`);
        }
      });
    }

    // 5. 관련 테이블 확인
    console.log('\n\n5. 기타 관련 데이터:');
    
    // artist_embeddings 확인
    const embeddingQuery = `
      SELECT 
        artist_id,
        embedding_version,
        created_at
      FROM artist_embeddings
      WHERE artist_id IN (
        SELECT id FROM artists 
        WHERE LOWER(name) LIKE '%van gogh%'
      )
    `;
    
    const embeddingResult = await pool.query(embeddingQuery);
    if (embeddingResult.rows.length > 0) {
      console.log(`- 임베딩 데이터: 있음 (버전: ${embeddingResult.rows[0].embedding_version})`);
    } else {
      console.log(`- 임베딩 데이터: 없음`);
    }

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await pool.end();
  }
}

checkVanGoghData();