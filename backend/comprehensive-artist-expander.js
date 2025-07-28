const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 확장된 유명 아티스트 리스트 (타입별 분류)
const FAMOUS_ARTISTS_BY_TYPE = {
  'LAEF': [ // 여우 - 몽환적 방랑자
    'kandinsky', '칸딘스키', 'klee', '클레', 'chagall', '샤갈',
    'dali', '달리', 'miro', '미로', 'malevich', '말레비치'
  ],

  'LAEC': [ // 고양이 - 감성 큐레이터
    'okeefe', '오키프', 'cassatt', '카사트', 'morisot', '모리조',
    'bourgeois', '부르주아', 'martin', '마틴', 'kiefer', '키퍼'
  ],

  'LAMF': [ // 올빼미 - 직관적 탐구자
    'bacon', '베이컨', 'de kooning', '드 쿠닝', 'diebenkorn', '디벤콘',
    'rauschenberg', '라우센버그', 'johns', '존스'
  ],

  'LAMC': [ // 거북이 - 철학적 수집가
    'duchamp', '뒤샹', 'magritte', '마그리트', 'beuys', '보이스',
    'kosuth', '코수스', 'weiner', '와이너'
  ],

  'LREF': [ // 카멜레온 - 고독한 관찰자
    'hopper', '호퍼', 'wyeth', '와이어스', 'diebenkorn', '디벤콘',
    'morandi', '모란디', 'balthus', '발튀스'
  ],

  'LREC': [ // 고슴도치 - 섬세한 감정가
    'vermeer', '베르메르', 'chardin', '샤르댕', 'hammershoi', '하머쇠이',
    '박수근', '변관식', 'vuillard', '뷔야르'
  ],

  'LRMF': [ // 문어 - 디지털 탐험가
    'gursky', '구르스키', 'sherman', '셔먼', 'wall', '월',
    'demand', '데만드', 'sugimoto', '스기모토'
  ],

  'LRMC': [ // 비버 - 학구적 연구자
    'leonardo', '레오나르도', 'michelangelo', '미켈란젤로', 'durer', '뒤러',
    'piero', '피에로', 'ingres', '앵그르', 'david', '다비드'
  ],

  'SAEF': [ // 나비 - 감성 나눔이
    'monet', '모네', 'renoir', '르누아르', 'pissarro', '피사로',
    'sisley', '시슬레', 'degas', '드가', 'toulouse-lautrec', '툴루즈 로트렉'
  ],

  'SAEC': [ // 펭귄 - 예술 네트워커
    'warhol', '워홀', 'lichtenstein', '리히텐슈타인', 'haring', '해링',
    'basquiat', '바스키아', 'koons', '쿤스'
  ],

  'SAMF': [ // 앵무새 - 영감 전도사
    'picasso', '피카소', 'matisse', '마티스', 'braque', '브라크',
    'leger', '레제', 'dubuffet', '뒤뷔페'
  ],

  'SAMC': [ // 사슴 - 문화 기획자
    'beuys', '보이스', 'abramovic', '아브라모비치', 'burden', '버든',
    'nauman', '나우만', 'kawara', '가와라'
  ],

  'SREF': [ // 강아지 - 열정적 관람자
    'goya', '고야', 'delacroix', '들라크루아', 'courbet', '쿠르베',
    'munch', '뭉크', 'schiele', '실레', 'kokoschka', '코코시카'
  ],

  'SREC': [ // 오리 - 따뜻한 안내자
    'rockwell', '록웰', 'hockney', '호크니', 'wiley', '와일리',
    'marshall', '마샬', 'wood', '우드', 'benton', '벤턴'
  ],

  'SRMF': [ // 코끼리 - 지식 멘토
    'ai weiwei', '아이웨이웨이', 'eliasson', '엘리아손', 'turrell', '터렐',
    'kusama', '쿠사마', 'kapoor', '카푸어', 'orozco', '오로스코'
  ],

  'SRMC': [ // 독수리 - 체계적 교육자
    'raphael', '라파엘로', 'caravaggio', '카라바조', 'rubens', '루벤스',
    'velazquez', '벨라스케스', 'rembrandt', '렘브란트', 'titian', '티치아노'
  ]
};

// 한국 작가 특별 리스트
const KOREAN_ARTISTS = {
  'LAEF': ['김환기', '유영국', '서세옥'],
  'LAEC': ['나혜석', '천경자', '박래현'],
  'LREC': ['박수근', '변관식', '이인성'],
  'SREF': ['이중섭', '김기창', '장욱진'],
  'SREC': ['이응노', '김흥수', '하인두'],
  'SRMF': ['백남준', '이우환', '정상화'],
  'SRMC': ['안견', '정선', '김홍도']
};

async function comprehensiveArtistExpansion() {
  try {
    console.log('🚀 포괄적 아티스트 확장 프로젝트 시작');
    console.log('목표: 16가지 모든 타입에 균형잡힌 50+ 아티스트 매핑\n');

    // 1. 먼저 기존 전략적 밸런싱 결과 적용
    console.log('📥 전략적 밸런싱 결과 데이터베이스 적용...');
    const strategicData = require('./strategic-apt-db-insert.json');

    for (const mapping of strategicData) {
      try {
        await pool.query(`
          INSERT INTO artist_apt_mappings 
          (artist_id, apt_profile, mapping_method, confidence_score, mapped_by, mapping_notes)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (artist_id) DO UPDATE SET
            apt_profile = EXCLUDED.apt_profile,
            mapping_method = EXCLUDED.mapping_method,
            confidence_score = EXCLUDED.confidence_score,
            mapped_by = EXCLUDED.mapped_by,
            mapping_notes = EXCLUDED.mapping_notes,
            mapped_at = CURRENT_TIMESTAMP
        `, [
          mapping.artist_id,
          mapping.apt_profile,
          mapping.mapping_method,
          mapping.confidence_score,
          mapping.mapped_by,
          mapping.mapping_notes
        ]);
      } catch (err) {
        console.log(`⚠️ ${mapping.mapping_notes} 매핑 스킵 (이미 존재하거나 오류)`);
      }
    }

    console.log(`✅ ${strategicData.length}개 전략적 매핑 적용 완료\n`);

    // 2. 현재 APT 분포 확인
    const currentDistribution = await pool.query(`
      SELECT 
        (apt_profile->'primary_types'->0->>'type') as apt_type,
        COUNT(*) as count
      FROM artist_apt_mappings 
      WHERE apt_profile IS NOT NULL
      GROUP BY (apt_profile->'primary_types'->0->>'type')
      ORDER BY count DESC
    `);

    console.log('📊 현재 APT 분포:');
    const distributionMap = {};
    currentDistribution.rows.forEach(row => {
      if (row.apt_type) {
        distributionMap[row.apt_type] = parseInt(row.count);
        console.log(`  ${row.apt_type}: ${row.count}명`);
      }
    });

    // 3. 각 타입별로 부족한 만큼 아티스트 추가 검색
    const expansionResults = [];
    const targetPerType = 4; // 각 타입당 최소 4명 목표

    for (const [targetType, keywords] of Object.entries(FAMOUS_ARTISTS_BY_TYPE)) {
      const currentCount = distributionMap[targetType] || 0;
      const needed = Math.max(0, targetPerType - currentCount);

      if (needed > 0) {
        console.log(`\n🔍 ${targetType} 타입 확장 (현재 ${currentCount}명, ${needed}명 추가 필요):`);

        // 키워드로 아티스트 검색
        const candidates = await searchArtistsByKeywords(keywords, needed + 2);

        // APT 프로필 생성 및 추가
        for (let i = 0; i < Math.min(needed, candidates.length); i++) {
          const candidate = candidates[i];
          const aptProfile = generateAPTProfileForType(candidate, targetType);

          try {
            await pool.query(`
              INSERT INTO artist_apt_mappings 
              (artist_id, apt_profile, mapping_method, confidence_score, mapped_by, mapping_notes)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (artist_id) DO NOTHING
            `, [
              candidate.id,
              JSON.stringify(aptProfile),
              'comprehensive_expansion_v1',
              aptProfile.meta.confidence,
              'sayu_comprehensive_expander',
              `Expansion for ${targetType}: ${candidate.name || candidate.name_ko}`
            ]);

            expansionResults.push({
              artist_id: candidate.id,
              name: candidate.name || candidate.name_ko,
              nationality: candidate.nationality || candidate.nationality_ko,
              type: targetType,
              apt_profile: aptProfile
            });

            console.log(`  ✅ ${candidate.name || candidate.name_ko} → ${targetType}`);

          } catch (err) {
            console.log(`  ⚠️ ${candidate.name || candidate.name_ko} 매핑 실패: ${err.message}`);
          }
        }
      } else {
        console.log(`✨ ${targetType}: 이미 충분함 (${currentCount}명)`);
      }
    }

    // 4. 한국 작가 특별 추가
    console.log('\n🇰🇷 한국 작가 특별 확장:');
    for (const [type, koreanNames] of Object.entries(KOREAN_ARTISTS)) {
      for (const name of koreanNames) {
        const korean = await pool.query(`
          SELECT id, name, name_ko, nationality, nationality_ko, birth_year, death_year
          FROM artists 
          WHERE (name ILIKE $1 OR name_ko ILIKE $1)
            AND id NOT IN (SELECT artist_id FROM artist_apt_mappings WHERE apt_profile IS NOT NULL)
          LIMIT 1
        `, [`%${name}%`]);

        if (korean.rows.length > 0) {
          const candidate = korean.rows[0];
          const aptProfile = generateAPTProfileForType(candidate, type);

          try {
            await pool.query(`
              INSERT INTO artist_apt_mappings 
              (artist_id, apt_profile, mapping_method, confidence_score, mapped_by, mapping_notes)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (artist_id) DO NOTHING
            `, [
              candidate.id,
              JSON.stringify(aptProfile),
              'korean_artists_expansion',
              aptProfile.meta.confidence,
              'sayu_korean_specialist',
              `Korean artist for ${type}: ${name}`
            ]);

            console.log(`  ✅ ${name} → ${type}`);

          } catch (err) {
            console.log(`  ⚠️ ${name} 매핑 실패`);
          }
        }
      }
    }

    // 5. 최종 분포 확인
    const finalDistribution = await pool.query(`
      SELECT 
        (apt_profile->'primary_types'->0->>'type') as apt_type,
        COUNT(*) as count
      FROM artist_apt_mappings 
      WHERE apt_profile IS NOT NULL
      GROUP BY (apt_profile->'primary_types'->0->>'type')
      ORDER BY count DESC
    `);

    console.log('\n🎯 최종 APT 분포:');
    let totalMapped = 0;
    finalDistribution.rows.forEach(row => {
      if (row.apt_type) {
        console.log(`  ${row.apt_type}: ${row.count}명`);
        totalMapped += parseInt(row.count);
      }
    });

    console.log(`\n📈 총 매핑된 아티스트: ${totalMapped}명`);
    console.log(`🎊 목표 달성 여부: ${totalMapped >= 50 ? '✅ 성공!' : '❌ 추가 작업 필요'}`);

    // 6. 빈 타입 체크
    const allTypes = Object.keys(FAMOUS_ARTISTS_BY_TYPE);
    const mappedTypes = finalDistribution.rows.map(row => row.apt_type).filter(Boolean);
    const emptyTypes = allTypes.filter(type => !mappedTypes.includes(type));

    if (emptyTypes.length > 0) {
      console.log(`\n⚠️ 여전히 비어있는 타입: ${emptyTypes.join(', ')}`);
    } else {
      console.log('\n🌟 모든 16가지 타입에 아티스트 매핑 완료!');
    }

    return {
      totalMapped,
      distribution: finalDistribution.rows,
      emptyTypes,
      expansionResults
    };

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

async function searchArtistsByKeywords(keywords, limit = 5) {
  const results = [];

  for (const keyword of keywords) {
    const safeKeyword = keyword.replace(/'/g, "''"); // SQL injection 방지

    const result = await pool.query(`
      SELECT 
        id, name, name_ko, nationality, nationality_ko,
        birth_year, death_year, era, bio, bio_ko
      FROM artists 
      WHERE 
        (name ILIKE $1 OR name_ko ILIKE $1)
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
          WHEN name_ko IS NOT NULL THEN 1
          WHEN birth_year IS NOT NULL THEN 2
          ELSE 3
        END
      LIMIT 2
    `, [`%${safeKeyword}%`]);

    results.push(...result.rows);

    if (results.length >= limit) break;
  }

  // 중복 제거
  const uniqueResults = results.filter((artist, index, self) =>
    index === self.findIndex(a => a.id === artist.id)
  );

  return uniqueResults.slice(0, limit);
}

function generateAPTProfileForType(artist, targetType) {
  // 타입별 기본 차원 설정
  const typeProfiles = {
    'LAEF': { L: 75, S: 25, A: 85, R: 15, E: 80, M: 20, F: 85, C: 15 },
    'LAEC': { L: 75, S: 25, A: 60, R: 40, E: 80, M: 20, F: 65, C: 35 },
    'LAMF': { L: 70, S: 30, A: 75, R: 25, E: 25, M: 75, F: 80, C: 20 },
    'LAMC': { L: 70, S: 30, A: 70, R: 30, E: 20, M: 80, F: 20, C: 80 },
    'LREF': { L: 80, S: 20, A: 30, R: 70, E: 70, M: 30, F: 75, C: 25 },
    'LREC': { L: 80, S: 20, A: 35, R: 65, E: 75, M: 25, F: 45, C: 55 },
    'LRMF': { L: 75, S: 25, A: 40, R: 60, E: 30, M: 70, F: 70, C: 30 },
    'LRMC': { L: 75, S: 25, A: 30, R: 70, E: 20, M: 80, F: 15, C: 85 },
    'SAEF': { L: 30, S: 70, A: 80, R: 20, E: 75, M: 25, F: 80, C: 20 },
    'SAEC': { L: 25, S: 75, A: 65, R: 35, E: 70, M: 30, F: 55, C: 45 },
    'SAMF': { L: 25, S: 75, A: 85, R: 15, E: 30, M: 70, F: 75, C: 25 },
    'SAMC': { L: 20, S: 80, A: 70, R: 30, E: 25, M: 75, F: 30, C: 70 },
    'SREF': { L: 30, S: 70, A: 35, R: 65, E: 80, M: 20, F: 70, C: 30 },
    'SREC': { L: 25, S: 75, A: 40, R: 60, E: 70, M: 30, F: 50, C: 50 },
    'SRMF': { L: 30, S: 70, A: 45, R: 55, E: 25, M: 75, F: 65, C: 35 },
    'SRMC': { L: 25, S: 75, A: 20, R: 80, E: 20, M: 80, F: 25, C: 75 }
  };

  const dimensions = { ...typeProfiles[targetType] };

  // 국가별 미세 조정
  const nationality = artist.nationality || artist.nationality_ko || '';
  if (nationality.includes('Korean') || nationality.includes('한국')) {
    dimensions.E += 10;
    dimensions.L += 5;
  } else if (nationality.includes('American') || nationality.includes('미국')) {
    dimensions.S += 10;
    dimensions.F += 5;
  }

  // 시대별 조정
  if (artist.birth_year) {
    if (artist.birth_year < 1800) {
      dimensions.R += 10; dimensions.A -= 10;
      dimensions.C += 10; dimensions.F -= 10;
    } else if (artist.birth_year > 1950) {
      dimensions.A += 10; dimensions.R -= 10;
      dimensions.S += 5; dimensions.L -= 5;
    }
  }

  // 경계값 조정
  Object.keys(dimensions).forEach(dim => {
    dimensions[dim] = Math.max(10, Math.min(90, dimensions[dim]));
  });

  // 대립 차원 균형
  dimensions.S = 100 - dimensions.L;
  dimensions.R = 100 - dimensions.A;
  dimensions.M = 100 - dimensions.E;
  dimensions.C = 100 - dimensions.F;

  return {
    dimensions,
    primary_types: [
      { type: targetType, weight: 0.85 }
    ],
    meta: {
      confidence: 0.85,
      source: 'comprehensive_expansion',
      keywords: [targetType, nationality, `${artist.birth_year}년대`].filter(Boolean),
      reasoning: [`타겟 타입 ${targetType}에 최적화된 프로필`, nationality, artist.era].filter(Boolean)
    }
  };
}

comprehensiveArtistExpansion();
