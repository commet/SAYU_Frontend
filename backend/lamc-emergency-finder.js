const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// LAMC (거북이 - 철학적 수집가)를 위한 광범위한 검색어
const LAMC_SEARCH_TERMS = [
  // 개념미술 작가들
  'conceptual', 'concept', 'installation', 'performance',

  // 철학적 작가들
  'philosophy', 'philosophical', 'meditation', 'zen',

  // 체계적/구조적 작가들
  'systematic', 'structure', 'minimal', 'geometric',

  // 텍스트/언어 작가들
  'text', 'language', 'word', 'letter',

  // 특정 아티스트명 (다양한 철자법)
  'duchamp', 'magritte', 'beuys', 'kosuth', 'weiner',
  'lewitt', 'cage', 'nauman', 'kawara', 'gonzalez-torres',
  'judd', 'flavin', 'andre', 'morris', 'serra',

  // 한국/동양 철학적 작가들
  '이우환', '정상화', '서세옥', '김구림', '박현기',

  // 추상적이고 철학적인 키워드
  'abstract', 'theoretical', 'intellectual', 'contemplative'
];

async function emergencyLAMCFinder() {
  try {
    console.log('🚨 응급 LAMC 아티스트 탐색 시작');
    console.log('LAMC = Lone + Abstract + Meaning + Constructive');
    console.log('특성: 철학적, 개념적, 체계적, 내성적\n');

    const foundCandidates = [];

    // 1. 각 검색어로 아티스트 찾기
    for (const term of LAMC_SEARCH_TERMS) {
      const artists = await pool.query(`
        SELECT 
          id, name, name_ko, nationality, nationality_ko, 
          birth_year, death_year, era, bio, bio_ko
        FROM artists 
        WHERE 
          (name ILIKE $1 OR name_ko ILIKE $1 OR bio ILIKE $1 OR bio_ko ILIKE $1)
          AND name NOT ILIKE '%after %'
          AND name NOT ILIKE '%attributed%'
          AND name NOT ILIKE '%imitator%'
          AND name NOT ILIKE '%workshop%'
          AND name NOT ILIKE '%circle of%'
          AND name NOT ILIKE '%school of%'
          AND id NOT IN (
            SELECT artist_id FROM artist_apt_mappings 
            WHERE apt_profile IS NOT NULL
          )
        ORDER BY 
          CASE 
            WHEN name ILIKE '%duchamp%' THEN 1
            WHEN name ILIKE '%beuys%' THEN 2
            WHEN name ILIKE '%magritte%' THEN 3
            WHEN name ILIKE '%kosuth%' THEN 4
            WHEN name ILIKE '%lewitt%' THEN 5
            WHEN name_ko IS NOT NULL THEN 6
            WHEN birth_year IS NOT NULL THEN 7
            ELSE 8
          END
        LIMIT 3
      `, [`%${term}%`]);

      if (artists.rows.length > 0) {
        console.log(`🔍 "${term}" 검색 결과:`);
        artists.rows.forEach(artist => {
          console.log(`  - ${artist.name || artist.name_ko} (${artist.nationality || artist.nationality_ko}, ${artist.birth_year || '?'}-${artist.death_year || 'present'})`);

          foundCandidates.push({
            ...artist,
            searchTerm: term,
            lamcScore: calculateLAMCScore(artist, term)
          });
        });
      }
    }

    // 중복 제거 및 점수 순 정렬
    const uniqueCandidates = foundCandidates.filter((artist, index, self) =>
      index === self.findIndex(a => a.id === artist.id)
    ).sort((a, b) => b.lamcScore - a.lamcScore);

    console.log(`\n📊 총 ${uniqueCandidates.length}명의 후보 발견`);

    // 2. 상위 후보들 LAMC로 매핑
    let successCount = 0;
    const topCandidates = uniqueCandidates.slice(0, 5); // 상위 5명만

    console.log('\n🎯 LAMC 매핑 시도:');
    for (const candidate of topCandidates) {
      if (successCount >= 3) break; // 최대 3명

      const aptProfile = generateLAMCProfile(candidate);

      try {
        await pool.query(`
          INSERT INTO artist_apt_mappings 
          (artist_id, apt_profile, mapping_method, confidence_score, mapped_by, mapping_notes)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          candidate.id,
          JSON.stringify(aptProfile),
          'emergency_lamc_rescue',
          aptProfile.primary_types[0].confidence / 100,
          'sayu_emergency_responder',
          `Emergency LAMC mapping: ${candidate.searchTerm} → LAMC (Score: ${candidate.lamcScore})`
        ]);

        console.log(`  ✅ ${candidate.name || candidate.name_ko} → LAMC (점수: ${candidate.lamcScore})`);
        successCount++;

      } catch (err) {
        console.log(`  ❌ 삽입 실패: ${err.message}`);
      }
    }

    // 3. 최종 확인
    const lamcCheck = await pool.query(`
      SELECT COUNT(*) as count 
      FROM artist_apt_mappings 
      WHERE apt_profile IS NOT NULL 
        AND (apt_profile->'primary_types'->0->>'type') = 'LAMC'
    `);

    const lamcCount = parseInt(lamcCheck.rows[0].count);

    console.log(`\n🏁 LAMC 응급 구조 결과:`);
    console.log(`✅ 새로 추가: ${successCount}명`);
    console.log(`📊 LAMC 총 개수: ${lamcCount}명`);
    console.log(`🎯 LAMC 완성: ${lamcCount > 0 ? '✅ 성공!' : '❌ 실패'}`);

    if (lamcCount > 0) {
      // 전체 분포 다시 확인
      const final = await pool.query(`
        SELECT 
          (apt_profile->'primary_types'->0->>'type') as apt_type,
          COUNT(*) as count
        FROM artist_apt_mappings 
        WHERE apt_profile IS NOT NULL
        GROUP BY (apt_profile->'primary_types'->0->>'type')
        ORDER BY apt_type
      `);

      console.log('\n🌟 업데이트된 전체 분포:');
      let totalMapped = 0;
      final.rows.forEach(row => {
        if (row.apt_type) {
          console.log(`  ${row.apt_type}: ${row.count}명`);
          totalMapped += parseInt(row.count);
        }
      });

      const allTypes = ['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
        'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];
      const mappedTypes = final.rows.map(row => row.apt_type).filter(Boolean);
      const emptyTypes = allTypes.filter(type => !mappedTypes.includes(type));

      console.log(`\n🎊 최종 성과:`);
      console.log(`📈 총 매핑: ${totalMapped}명`);
      console.log(`📊 커버된 타입: ${mappedTypes.length}/16`);
      console.log(`🌟 모든 타입 완성: ${emptyTypes.length === 0 ? '✅' : '❌'}`);

      if (emptyTypes.length === 0) {
        console.log('\n🎉🎉🎉 모든 16가지 SAYU 타입 완성! 🎉🎉🎉');
      }
    }

    return {
      successCount,
      lamcCount,
      topCandidates: topCandidates.slice(0, 3)
    };

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

function calculateLAMCScore(artist, searchTerm) {
  let score = 0;

  const name = (artist.name || artist.name_ko || '').toLowerCase();
  const bio = (artist.bio || artist.bio_ko || '').toLowerCase();
  const nationality = (artist.nationality || artist.nationality_ko || '').toLowerCase();

  // 특정 유명 개념미술 작가들에게 높은 점수
  if (name.includes('duchamp')) score += 50;
  if (name.includes('beuys')) score += 45;
  if (name.includes('kosuth')) score += 40;
  if (name.includes('lewitt')) score += 40;
  if (name.includes('magritte')) score += 35;
  if (name.includes('nauman')) score += 35;
  if (name.includes('weiner')) score += 30;

  // 한국 단색화 작가들
  if (name.includes('이우환') || name.includes('정상화')) score += 40;

  // 개념미술 키워드
  if (bio.includes('conceptual') || bio.includes('concept')) score += 25;
  if (bio.includes('installation')) score += 20;
  if (bio.includes('minimal') || bio.includes('minimalism')) score += 20;
  if (bio.includes('philosophy') || bio.includes('philosophical')) score += 15;

  // 체계적/구조적 키워드
  if (bio.includes('systematic') || bio.includes('structure')) score += 15;
  if (bio.includes('geometric') || bio.includes('mathematics')) score += 10;

  // 시대 보너스 (개념미술 전성기)
  if (artist.birth_year) {
    if (artist.birth_year >= 1920 && artist.birth_year <= 1950) score += 10;
  }

  // 국가별 보너스
  if (nationality.includes('american') || nationality.includes('미국')) score += 5;
  if (nationality.includes('german') || nationality.includes('독일')) score += 5;
  if (nationality.includes('korean') || nationality.includes('한국')) score += 10;

  return score;
}

function generateLAMCProfile(artist) {
  return {
    meta: {
      method: 'emergency_lamc_rescue',
      source: 'sayu_emergency_system',
      artist_name: artist.name || artist.name_ko,
      analysis_date: new Date().toISOString(),
      lamc_score: artist.lamcScore
    },
    dimensions: {
      L: 70, S: 30,  // Lone - 내성적, 개인적
      A: 70, R: 30,  // Abstract - 추상적, 개념적
      E: 20, M: 80,  // Meaning - 의미 추구, 철학적
      F: 20, C: 80   // Constructive - 체계적, 구조적
    },
    primary_types: [
      {
        type: 'LAMC',
        title: '철학적 수집가',
        animal: 'turtle',
        name_ko: '거북이',
        weight: 0.9,
        confidence: 85
      }
    ]
  };
}

emergencyLAMCFinder();
