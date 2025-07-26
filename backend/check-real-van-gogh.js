require('dotenv').config();
const { pool } = require('./src/config/database');

async function checkRealVanGogh() {
  try {
    console.log('=== 실제 Vincent van Gogh 데이터 검색 ===\n');

    // 1. 모든 Van Gogh 관련 아티스트 검색
    console.log('1. Van Gogh 관련 모든 아티스트:');
    const allVanGoghQuery = `
      SELECT 
        id,
        name,
        name_ko,
        birth_year,
        death_year,
        nationality,
        length(bio) as bio_length,
        sources
      FROM artists 
      WHERE LOWER(name) LIKE '%gogh%' 
         OR LOWER(name_ko) LIKE '%고흐%'
      ORDER BY name
    `;
    
    const allVanGoghResult = await pool.query(allVanGoghQuery);
    
    console.log(`\n총 ${allVanGoghResult.rows.length}명의 Van Gogh 관련 아티스트 발견:\n`);
    
    allVanGoghResult.rows.forEach((artist, index) => {
      console.log(`${index + 1}. ${artist.name}`);
      console.log(`   - ID: ${artist.id}`);
      console.log(`   - 한글명: ${artist.name_ko || 'N/A'}`);
      console.log(`   - 생몰년: ${artist.birth_year}-${artist.death_year}`);
      console.log(`   - 국적: ${artist.nationality}`);
      console.log(`   - Bio 길이: ${artist.bio_length || 0}자`);
      console.log(`   - 출처: ${artist.sources || 'N/A'}`);
      console.log('');
    });

    // 2. 정확한 Vincent van Gogh 찾기
    console.log('\n2. 정확한 Vincent van Gogh 검색:');
    const exactVanGoghQuery = `
      SELECT *
      FROM artists 
      WHERE name = 'Vincent van Gogh'
         OR name = 'Vincent Van Gogh'
         OR name = 'Van Gogh, Vincent'
         OR name_ko = '빈센트 반 고흐'
         OR name_ko = '반 고흐'
         OR (name LIKE 'Vincent%Gogh%' AND birth_year = 1853 AND death_year = 1890)
    `;
    
    const exactResult = await pool.query(exactVanGoghQuery);
    
    if (exactResult.rows.length > 0) {
      const vanGogh = exactResult.rows[0];
      console.log('\n실제 Vincent van Gogh 발견!');
      console.log(`- ID: ${vanGogh.id}`);
      console.log(`- 이름: ${vanGogh.name}`);
      console.log(`- Bio 내용:`);
      if (vanGogh.bio) {
        console.log(`  길이: ${vanGogh.bio.length}자`);
        console.log(`  처음 1000자:\n${vanGogh.bio.substring(0, 1000)}...`);
        
        // Wikipedia 내용 분석
        console.log('\n\nWikipedia 콘텐츠 분석:');
        
        // 주요 섹션 검색
        const sections = [
          'Early life', 'Career', 'Artistic breakthrough', 'Paris', 
          'Arles', 'Saint-Rémy', 'Auvers-sur-Oise', 'Death',
          'Style and influence', 'Legacy', 'Major works'
        ];
        
        console.log('\n포함된 주요 섹션:');
        sections.forEach(section => {
          if (vanGogh.bio.toLowerCase().includes(section.toLowerCase())) {
            const index = vanGogh.bio.toLowerCase().indexOf(section.toLowerCase());
            const preview = vanGogh.bio.substring(index, index + 100);
            console.log(`✓ ${section}: "${preview}..."`);
          }
        });
        
        // 전체 페이지인지 요약인지 판단
        console.log('\n\n페이지 타입 분석:');
        const indicators = {
          fullPage: [
            vanGogh.bio.length > 10000,
            vanGogh.bio.includes('Early life') || vanGogh.bio.includes('early life'),
            vanGogh.bio.includes('Death') || vanGogh.bio.includes('death'),
            vanGogh.bio.includes('Legacy') || vanGogh.bio.includes('legacy'),
            /\[\d+\]/.test(vanGogh.bio), // 참조 번호
            vanGogh.bio.split('\n').length > 50
          ],
          summary: [
            vanGogh.bio.length < 5000,
            !vanGogh.bio.includes('['),
            vanGogh.bio.split('\n').length < 20
          ]
        };
        
        const fullPageScore = indicators.fullPage.filter(Boolean).length;
        const summaryScore = indicators.summary.filter(Boolean).length;
        
        console.log(`- 전체 페이지 지표: ${fullPageScore}/6`);
        console.log(`- 요약 페이지 지표: ${summaryScore}/3`);
        
        if (fullPageScore >= 4) {
          console.log('\n결론: Wikipedia 전체 페이지가 저장된 것으로 보입니다.');
        } else if (summaryScore >= 2) {
          console.log('\n결론: Wikipedia 요약본이 저장된 것으로 보입니다.');
        } else {
          console.log('\n결론: 판단하기 어렵습니다.');
        }
        
        // 특정 내용 검색
        console.log('\n\n주요 작품 언급:');
        const works = [
          'The Starry Night', 'Sunflowers', 'The Potato Eaters',
          'Bedroom in Arles', 'Café Terrace at Night', 'Irises',
          'Self-Portrait', 'Almond Blossoms', 'Wheatfield with Crows'
        ];
        
        let mentionedWorks = 0;
        works.forEach(work => {
          if (vanGogh.bio.includes(work)) {
            console.log(`✓ ${work}`);
            mentionedWorks++;
          }
        });
        
        console.log(`\n총 ${mentionedWorks}/${works.length}개 주요 작품 언급됨`);
      }
    } else {
      console.log('정확한 Vincent van Gogh를 찾을 수 없습니다.');
    }

    // 3. artworks 테이블 구조 확인
    console.log('\n\n3. Artworks 테이블 구조:');
    const artworkColumnsQuery = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'artworks'
      ORDER BY ordinal_position;
    `;
    
    const artworkColumns = await pool.query(artworkColumnsQuery);
    console.log('Columns:', artworkColumns.rows.map(col => col.column_name).join(', '));

    // 4. Van Gogh 작품 통계 (수정된 쿼리)
    console.log('\n\n4. Van Gogh 작품 통계:');
    const artworkStatsQuery = `
      SELECT 
        a.name as artist_name,
        COUNT(aw.id) as total_artworks,
        MIN(aw.year_created) as earliest_work,
        MAX(aw.year_created) as latest_work,
        COUNT(DISTINCT aw.medium) as unique_mediums
      FROM artists a
      LEFT JOIN artworks aw ON a.id = aw.artist_id
      WHERE LOWER(a.name) LIKE '%gogh%'
      GROUP BY a.id, a.name
      HAVING COUNT(aw.id) > 0
      ORDER BY COUNT(aw.id) DESC
    `;
    
    const statsResult = await pool.query(artworkStatsQuery);
    
    if (statsResult.rows.length > 0) {
      statsResult.rows.forEach(stat => {
        console.log(`\n${stat.artist_name}:`);
        console.log(`- 총 작품 수: ${stat.total_artworks}`);
        console.log(`- 작품 연도: ${stat.earliest_work} - ${stat.latest_work}`);
        console.log(`- 매체 종류: ${stat.unique_mediums}가지`);
      });
    }

    // 5. 샘플 작품 확인
    console.log('\n\n5. Van Gogh 샘플 작품 (5개):');
    const sampleWorksQuery = `
      SELECT 
        aw.title,
        aw.year_created,
        aw.medium,
        aw.dimensions,
        a.name as artist_name
      FROM artworks aw
      JOIN artists a ON aw.artist_id = a.id
      WHERE LOWER(a.name) LIKE '%gogh%'
      ORDER BY aw.year_created DESC
      LIMIT 5
    `;
    
    const sampleWorks = await pool.query(sampleWorksQuery);
    
    if (sampleWorks.rows.length > 0) {
      sampleWorks.rows.forEach(work => {
        console.log(`\n"${work.title}" (${work.year_created})`);
        console.log(`- 작가: ${work.artist_name}`);
        console.log(`- 매체: ${work.medium || 'N/A'}`);
        console.log(`- 크기: ${work.dimensions || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await pool.end();
  }
}

checkRealVanGogh();