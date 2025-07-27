// 예술사적으로 필수적인 작가들 추가 스크립트
// Wikipedia API와 Wikidata를 활용한 정보 수집

require('dotenv').config();
const { pool } = require('./src/config/database');
const axios = require('axios');

// 추가해야 할 필수 작가들
const essentialArtistsToAdd = [
  // 르네상스 거장
  { 
    name: 'Giotto di Bondone',
    wikiTitle: 'Giotto',
    period: 'Proto-Renaissance',
    nationality: 'Italian',
    importance: 95,
    aptSuggestion: 'LRMC' // 독립적, 구상적, 의미 추구, 체계적
  },
  { 
    name: 'Titian',
    wikiTitle: 'Titian',
    period: 'Renaissance',
    nationality: 'Italian',
    importance: 90,
    aptSuggestion: 'SRMC' // 사회적(베네치아 화파), 구상적, 의미, 체계적
  },
  { 
    name: 'El Greco',
    wikiTitle: 'El_Greco',
    period: 'Mannerism',
    nationality: 'Greek-Spanish',
    importance: 85,
    aptSuggestion: 'LAEF' // 독립적, 추상적(왜곡), 감정적, 자유로운
  },
  
  // 바로크/로코코
  { 
    name: 'Peter Paul Rubens',
    wikiTitle: 'Peter_Paul_Rubens',
    period: 'Baroque',
    nationality: 'Flemish',
    importance: 90,
    aptSuggestion: 'SREC' // 사회적(대규모 공방), 구상적, 감정적, 체계적
  },
  { 
    name: 'Nicolas Poussin',
    wikiTitle: 'Nicolas_Poussin',
    period: 'Baroque/Classicism',
    nationality: 'French',
    importance: 85,
    aptSuggestion: 'LRMC' // 독립적, 구상적, 의미(신화), 체계적
  },
  
  // 낭만주의/사실주의
  { 
    name: 'Caspar David Friedrich',
    wikiTitle: 'Caspar_David_Friedrich',
    period: 'Romanticism',
    nationality: 'German',
    importance: 85,
    aptSuggestion: 'LREF' // 독립적, 구상적(풍경), 감정적, 자유로운
  },
  { 
    name: 'Théodore Géricault',
    wikiTitle: 'Théodore_Géricault',
    period: 'Romanticism',
    nationality: 'French',
    importance: 85,
    aptSuggestion: 'SREF' // 사회적, 구상적, 감정적(극적), 자유로운
  },
  { 
    name: 'Jean-Auguste-Dominique Ingres',
    wikiTitle: 'Jean-Auguste-Dominique_Ingres',
    period: 'Neoclassicism',
    nationality: 'French',
    importance: 85,
    aptSuggestion: 'LRMC' // 독립적, 구상적, 의미, 체계적(고전주의)
  },
  { 
    name: 'Édouard Manet',
    wikiTitle: 'Édouard_Manet',
    period: 'Realism/Impressionism',
    nationality: 'French',
    importance: 90,
    aptSuggestion: 'SAMF' // 사회적(카페 문화), 추상적(인상주의 선구), 의미, 자유
  },
  
  // 후기 인상주의
  { 
    name: 'Henri de Toulouse-Lautrec',
    wikiTitle: 'Henri_de_Toulouse-Lautrec',
    period: 'Post-Impressionism',
    nationality: 'French',
    importance: 85,
    aptSuggestion: 'SAEF' // 사회적(몽마르트), 추상적, 감정적, 자유로운
  },
  
  // 20세기 거장
  { 
    name: 'Amedeo Modigliani',
    wikiTitle: 'Amedeo_Modigliani',
    period: 'Expressionism',
    nationality: 'Italian',
    importance: 85,
    aptSuggestion: 'LAEF' // 독립적, 추상적(단순화), 감정적, 자유로운
  },
  { 
    name: 'René Magritte',
    wikiTitle: 'René_Magritte',
    period: 'Surrealism',
    nationality: 'Belgian',
    importance: 85,
    aptSuggestion: 'LAMF' // 독립적, 추상적(초현실), 의미(철학적), 자유
  },
  { 
    name: 'Max Ernst',
    wikiTitle: 'Max_Ernst',
    period: 'Surrealism/Dada',
    nationality: 'German-French',
    importance: 85,
    aptSuggestion: 'LAEF' // 독립적, 추상적, 감정적(무의식), 자유로운
  },
  { 
    name: 'Piet Mondrian',
    wikiTitle: 'Piet_Mondrian',
    period: 'De Stijl',
    nationality: 'Dutch',
    importance: 90,
    aptSuggestion: 'LAMC' // 독립적, 추상적(기하학), 의미(신지학), 체계적
  },
  { 
    name: 'Marcel Duchamp',
    wikiTitle: 'Marcel_Duchamp',
    period: 'Dada/Conceptual',
    nationality: 'French-American',
    importance: 95,
    aptSuggestion: 'LAMF' // 독립적, 추상적(개념), 의미(반예술), 자유
  },
  { 
    name: 'Mark Rothko',
    wikiTitle: 'Mark_Rothko',
    period: 'Abstract Expressionism',
    nationality: 'American',
    importance: 90,
    aptSuggestion: 'LAEF' // 독립적, 추상적, 감정적(영적), 자유로운
  },
  { 
    name: 'Willem de Kooning',
    wikiTitle: 'Willem_de_Kooning',
    period: 'Abstract Expressionism',
    nationality: 'Dutch-American',
    importance: 85,
    aptSuggestion: 'SAEF' // 사회적(뉴욕 화파), 추상적, 감정적, 자유
  },
  { 
    name: 'Francis Bacon',
    wikiTitle: 'Francis_Bacon_(artist)',
    period: '20th Century',
    nationality: 'British-Irish',
    importance: 85,
    aptSuggestion: 'LAEF' // 독립적, 추상적(왜곡), 감정적(고통), 자유
  },
  
  // 중요한 여성 작가들
  { 
    name: 'Artemisia Gentileschi',
    wikiTitle: 'Artemisia_Gentileschi',
    period: 'Baroque',
    nationality: 'Italian',
    importance: 90,
    aptSuggestion: 'LREC' // 독립적, 구상적, 감정적(극적), 체계적
  },
  { 
    name: 'Berthe Morisot',
    wikiTitle: 'Berthe_Morisot',
    period: 'Impressionism',
    nationality: 'French',
    importance: 85,
    aptSuggestion: 'SREF' // 사회적(인상파 그룹), 구상적, 감정적, 자유
  },
  { 
    name: 'Mary Cassatt',
    wikiTitle: 'Mary_Cassatt',
    period: 'Impressionism',
    nationality: 'American',
    importance: 85,
    aptSuggestion: 'SREC' // 사회적, 구상적(모자 주제), 감정적, 체계적
  },
  { 
    name: 'Georgia O\'Keeffe',
    wikiTitle: 'Georgia_O%27Keeffe',
    period: 'American Modernism',
    nationality: 'American',
    importance: 90,
    aptSuggestion: 'LREF' // 독립적(사막), 구상적(자연), 감정적, 자유
  },
  { 
    name: 'Louise Bourgeois',
    wikiTitle: 'Louise_Bourgeois',
    period: 'Contemporary',
    nationality: 'French-American',
    importance: 85,
    aptSuggestion: 'LAEF' // 독립적, 추상적(심리), 감정적, 자유
  },
  
  // 현대 거장
  { 
    name: 'Jeff Koons',
    wikiTitle: 'Jeff_Koons',
    period: 'Contemporary',
    nationality: 'American',
    importance: 80,
    aptSuggestion: 'SRMC' // 사회적(대규모 제작), 구상적, 의미(키치), 체계적
  },
  { 
    name: 'Damien Hirst',
    wikiTitle: 'Damien_Hirst',
    period: 'Contemporary',
    nationality: 'British',
    importance: 80,
    aptSuggestion: 'SAMF' // 사회적(YBAs), 추상적(개념), 의미(죽음), 자유
  },
  { 
    name: 'Ai Weiwei',
    wikiTitle: 'Ai_Weiwei',
    period: 'Contemporary',
    nationality: 'Chinese',
    importance: 85,
    aptSuggestion: 'SAMF' // 사회적(행동주의), 추상적, 의미(정치), 자유
  },
  { 
    name: 'Banksy',
    wikiTitle: 'Banksy',
    period: 'Contemporary/Street Art',
    nationality: 'British',
    importance: 80,
    aptSuggestion: 'SAMF' // 사회적(거리), 추상적(상징), 의미(비판), 자유
  }
];

// Wikipedia API를 통한 작가 정보 수집
async function fetchArtistFromWikipedia(artist) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${artist.wikiTitle}`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'SAYU-Art-Platform/1.0' }
    });
    
    const data = response.data;
    return {
      ...artist,
      bio: data.extract,
      thumbnail: data.thumbnail?.source,
      wikiUrl: data.content_urls?.desktop?.page
    };
  } catch (error) {
    console.error(`Wikipedia 정보 수집 실패: ${artist.name}`, error.message);
    return artist;
  }
}

// 작가 정보 데이터베이스에 추가
async function insertArtist(artist) {
  try {
    // 이미 존재하는지 확인
    const existing = await pool.query(
      'SELECT id FROM artists WHERE LOWER(name) = LOWER($1)',
      [artist.name]
    );
    
    if (existing.rows.length > 0) {
      console.log(`   ⚠️  이미 존재: ${artist.name}`);
      return false;
    }
    
    // 생몰년 파싱 (Wikipedia에서 추출 가능한 경우)
    let birthYear = null, deathYear = null;
    if (artist.bio) {
      const yearMatch = artist.bio.match(/\((\d{4})(?:\s*[-–]\s*(\d{4}))?\)/);
      if (yearMatch) {
        birthYear = parseInt(yearMatch[1]);
        deathYear = yearMatch[2] ? parseInt(yearMatch[2]) : null;
      }
    }
    
    // APT 프로필 생성
    const aptProfile = {
      type: artist.aptSuggestion,
      confidence: 0.7, // Wikipedia 기반 초기 신뢰도
      traits: {
        L_S: artist.aptSuggestion[0] === 'L' ? -50 : 50,
        A_R: artist.aptSuggestion[1] === 'A' ? -50 : 50,
        E_M: artist.aptSuggestion[2] === 'E' ? -50 : 50,
        F_C: artist.aptSuggestion[3] === 'F' ? -50 : 50
      },
      analysis: `초기 APT 분류: ${artist.period} 시대의 특성을 반영`
    };
    
    const result = await pool.query(`
      INSERT INTO artists (
        name, nationality, era, birth_year, death_year,
        bio, sources, apt_profile, importance_score,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id
    `, [
      artist.name,
      artist.nationality,
      artist.period,
      birthYear,
      deathYear,
      artist.bio || `${artist.period} 시대의 주요 작가`,
      JSON.stringify({ 
        wikipedia: artist.wikiUrl || `https://en.wikipedia.org/wiki/${artist.wikiTitle}` 
      }),
      JSON.stringify(aptProfile),
      artist.importance
    ]);
    
    console.log(`   ✅ 추가 완료: ${artist.name} (ID: ${result.rows[0].id})`);
    return true;
  } catch (error) {
    console.error(`   ❌ 추가 실패: ${artist.name}`, error.message);
    return false;
  }
}

async function addEssentialArtists() {
  try {
    console.log('🎨 SAYU 필수 작가 추가 시작');
    console.log('=' + '='.repeat(80));
    
    let added = 0;
    let failed = 0;
    
    for (const artist of essentialArtistsToAdd) {
      console.log(`\n처리 중: ${artist.name} (${artist.period})`);
      
      // Wikipedia 정보 수집
      const enrichedArtist = await fetchArtistFromWikipedia(artist);
      
      // 데이터베이스에 추가
      const success = await insertArtist(enrichedArtist);
      if (success) added++;
      else failed++;
      
      // API 제한 회피를 위한 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n\n📊 추가 완료 통계:');
    console.log(`   성공: ${added}명`);
    console.log(`   실패/중복: ${failed}명`);
    console.log(`   전체: ${essentialArtistsToAdd.length}명`);
    
    // 추가 후 통계
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN apt_profile IS NOT NULL THEN 1 END) as with_apt,
        COUNT(CASE WHEN importance_score >= 90 THEN 1 END) as essential,
        COUNT(CASE WHEN importance_score >= 80 THEN 1 END) as major
      FROM artists
    `);
    
    console.log('\n📊 업데이트된 데이터베이스 통계:');
    console.log(`   전체 작가: ${stats.rows[0].total}명`);
    console.log(`   APT 분류: ${stats.rows[0].with_apt}명`);
    console.log(`   필수 작가 (90점+): ${stats.rows[0].essential}명`);
    console.log(`   주요 작가 (80점+): ${stats.rows[0].major}명`);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await pool.end();
  }
}

// 실행
addEssentialArtists().then(() => {
  console.log('\n✅ 필수 작가 추가 완료!');
  console.log('다음 단계: comprehensiveArtistAnalysis.js를 다시 실행하여 누락 확인');
});