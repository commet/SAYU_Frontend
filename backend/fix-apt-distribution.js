const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 개선된 APT 추론 (더 균형잡힌 분포)
const BALANCED_APT_PATTERNS = {
  // 시대별 기본 APT (다양화)
  era_defaults: {
    'Contemporary': ['SAMC', 'SAMF', 'SAEF', 'LAEF'], // 현대는 다양
    'Modern': ['LAEF', 'SAEF', 'LAMF', 'SAMF'], 
    'Impressionism': ['LAEF', 'SAEF', 'LREF'],
    'Renaissance': ['LRMC', 'SRMC', 'LREC'],
    'Baroque': ['SREC', 'LREC', 'SRMC'],
    'Postmodern': ['SAMF', 'SAMC', 'LAMF']
  },
  
  // 국적별 기본 APT (더 현실적)
  nationality_defaults: {
    'Korean': ['LAEC', 'LAEF', 'LREC'], // 한국도 다양화
    'French': ['LAEF', 'SAEF', 'SAMF'],
    'Italian': ['LRMC', 'SRMC', 'LAEF'],
    'American': ['SAMC', 'SAEF', 'SREF'],
    'German': ['SRMC', 'LRMC', 'SAMC'],
    'British': ['SAMC', 'SREF', 'SAMF'],
    'Japanese': ['LAEC', 'LREF', 'LAEF'],
    'Spanish': ['SAMF', 'SAEF', 'LAEF']
  },
  
  // 저작권 상태별
  copyright_defaults: {
    'contemporary': ['SAMC', 'SAMF', 'SAEF'],
    'public_domain': ['LRMC', 'LAEF', 'SRMC'],
    'licensed': ['SAEF', 'SREF', 'SAMF']
  }
};

async function fixAPTDistribution() {
  try {
    console.log('🔧 APT 분포 균형 조정 시작\n');
    
    // 1. 현재 LAEC로 분류된 아티스트들 중 재분류 대상 선정
    const laecArtists = await pool.query(`
      SELECT 
        id, name, name_ko, nationality, nationality_ko,
        birth_year, death_year, copyright_status, era,
        (apt_profile->'meta'->>'source') as source
      FROM artists 
      WHERE (apt_profile->'primary_types'->0->>'type') = 'LAEC'
        AND (apt_profile->'meta'->>'source') = 'quick_inference_system'
      ORDER BY RANDOM()
      LIMIT 600  -- LAEC 중 600명만 재분류
    `);
    
    console.log(`🎯 LAEC 재분류 대상: ${laecArtists.rows.length}명\n`);
    
    // 2. 배치 단위로 재분류
    const batchSize = 50;
    let reprocessed = 0;
    
    for (let i = 0; i < laecArtists.rows.length; i += batchSize) {
      const batch = laecArtists.rows.slice(i, i + batchSize);
      console.log(`⚡ 재분류 배치 ${Math.floor(i/batchSize) + 1}: ${batch.length}명 처리 중...`);
      
      for (const artist of batch) {
        try {
          const newAPTProfile = balancedInferAPT(artist);
          
          await pool.query(`
            UPDATE artists 
            SET apt_profile = $1, updated_at = NOW()
            WHERE id = $2
          `, [JSON.stringify(newAPTProfile), artist.id]);
          
          // 매핑 로그 업데이트
          await pool.query(`
            UPDATE artist_apt_mappings 
            SET 
              apt_profile = $1,
              confidence_score = $2,
              mapping_notes = $3,
              updated_at = NOW()
            WHERE artist_id = $4
          `, [
            JSON.stringify(newAPTProfile),
            newAPTProfile.meta.confidence,
            `Rebalanced: ${newAPTProfile.meta.reasoning.join('; ')}`,
            artist.id
          ]);
          
          reprocessed++;
        } catch (error) {
          console.log(`   - 오류 (${artist.id}): ${error.message}`);
        }
      }
      
      const progress = (reprocessed / laecArtists.rows.length * 100).toFixed(1);
      console.log(`   ✅ 재분류 진행률: ${progress}% (${reprocessed}/${laecArtists.rows.length})`);
    }
    
    console.log(`\n✅ 재분류 완료: ${reprocessed}명\n`);
    
    // 3. 조정 후 통계 확인
    const newStats = await pool.query(`
      SELECT 
        (apt_profile->'primary_types'->0->>'type') as apt_type,
        COUNT(*) as count,
        ROUND(AVG((apt_profile->'meta'->>'confidence')::decimal), 2) as avg_confidence
      FROM artists 
      WHERE apt_profile IS NOT NULL
      GROUP BY (apt_profile->'primary_types'->0->>'type')
      ORDER BY count DESC
    `);
    
    console.log('📊 조정 후 APT 분포:');
    newStats.rows.forEach(row => {
      const percentage = (row.count / newStats.rows.reduce((sum, r) => sum + parseInt(r.count), 0) * 100).toFixed(1);
      console.log(`   ${row.apt_type}: ${row.count}명 (${percentage}%, 신뢰도: ${row.avg_confidence})`);
    });
    
    console.log('\n🎉 APT 분포 균형 조정 완료!');
    
    return reprocessed;
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

function balancedInferAPT(artist) {
  const nationality = artist.nationality || artist.nationality_ko || '';
  const era = artist.era || '';
  const copyright = artist.copyright_status || '';
  
  let aptCandidates = ['LAEF', 'SAEF', 'LRMC', 'SRMC', 'LAEC', 'SAMC']; // 기본 후보들
  let confidence = 0.5;
  let reasoning = [];
  
  // 1. 시대별 후보 좁히기
  for (const [eraKey, aptList] of Object.entries(BALANCED_APT_PATTERNS.era_defaults)) {
    if (era.includes(eraKey)) {
      aptCandidates = aptList;
      confidence += 0.2;
      reasoning.push(`${era} 시대 특성`);
      break;
    }
  }
  
  // 2. 국적별 조정
  for (const [natKey, aptList] of Object.entries(BALANCED_APT_PATTERNS.nationality_defaults)) {
    if (nationality.includes(natKey)) {
      // 시대와 국적을 교차 매칭
      const intersection = aptCandidates.filter(apt => aptList.includes(apt));
      if (intersection.length > 0) {
        aptCandidates = intersection;
      } else {
        aptCandidates = aptList; // 교차점이 없으면 국적 우선
      }
      confidence += 0.15;
      reasoning.push(`${natKey} 문화권 특성`);
      break;
    }
  }
  
  // 3. 저작권 상태별 미세 조정
  if (BALANCED_APT_PATTERNS.copyright_defaults[copyright]) {
    const copyrightAPTs = BALANCED_APT_PATTERNS.copyright_defaults[copyright];
    const intersection = aptCandidates.filter(apt => copyrightAPTs.includes(apt));
    if (intersection.length > 0) {
      aptCandidates = intersection;
      confidence += 0.1;
      reasoning.push(`${copyright} 시대성`);
    }
  }
  
  // 4. 출생연도 기반 추가 조정
  if (artist.birth_year) {
    if (artist.birth_year > 1950) {
      // 현대 작가는 S(사회적) 성향 강화
      aptCandidates = aptCandidates.filter(apt => apt[0] === 'S') || aptCandidates;
      reasoning.push('현대 작가 - 사회적 성향');
    } else if (artist.birth_year < 1700) {
      // 고전 작가는 R(사실적) + C(체계적) 성향 강화  
      aptCandidates = aptCandidates.filter(apt => apt[1] === 'R' || apt[3] === 'C') || aptCandidates;
      reasoning.push('고전 작가 - 전통적 성향');
    }
  }
  
  // 5. 한국 작가 특별 처리 (완화)
  if (artist.name_ko || nationality.includes('Korea') || nationality.includes('한국')) {
    // 무조건 LAEC가 아니라 한국적 성향 중에서 선택
    const koreanAPTs = ['LAEC', 'LAEF', 'LREC', 'SREC'];
    const intersection = aptCandidates.filter(apt => koreanAPTs.includes(apt));
    if (intersection.length > 0) {
      aptCandidates = intersection;
    }
    reasoning.push('한국 작가 정서적 특성 (완화)');
  }
  
  // 6. 최종 APT 선택 (랜덤 요소 추가)
  const finalAPT = aptCandidates[Math.floor(Math.random() * aptCandidates.length)];
  
  // 7. 차원 점수 생성
  const dimensions = generateDimensionsFromType(finalAPT);
  
  return {
    dimensions,
    primary_types: [
      { type: finalAPT, weight: 0.8 }
    ],
    meta: {
      confidence: Math.min(0.8, confidence),
      source: 'balanced_inference_system',
      keywords: [era, nationality, `${artist.birth_year}s`].filter(Boolean),
      reasoning
    }
  };
}

function generateDimensionsFromType(aptType) {
  const base = { L: 50, S: 50, A: 50, R: 50, E: 50, M: 50, F: 50, C: 50 };
  
  // APT 타입에 따른 차원 조정 (랜덤 요소 추가)
  const variance = 10; // ±10 랜덤 변동
  
  if (aptType[0] === 'L') { 
    base.L = 70 + Math.random() * variance; 
    base.S = 30 - Math.random() * variance; 
  } else { 
    base.L = 30 - Math.random() * variance; 
    base.S = 70 + Math.random() * variance; 
  }
  
  if (aptType[1] === 'A') { 
    base.A = 70 + Math.random() * variance; 
    base.R = 30 - Math.random() * variance; 
  } else { 
    base.A = 30 - Math.random() * variance; 
    base.R = 70 + Math.random() * variance; 
  }
  
  if (aptType[2] === 'E') { 
    base.E = 70 + Math.random() * variance; 
    base.M = 30 - Math.random() * variance; 
  } else { 
    base.E = 30 - Math.random() * variance; 
    base.M = 70 + Math.random() * variance; 
  }
  
  if (aptType[3] === 'F') { 
    base.F = 70 + Math.random() * variance; 
    base.C = 30 - Math.random() * variance; 
  } else { 
    base.F = 30 - Math.random() * variance; 
    base.C = 70 + Math.random() * variance; 
  }
  
  // 대립 차원 합계 정규화
  base.S = 100 - base.L;
  base.R = 100 - base.A;
  base.M = 100 - base.E;
  base.C = 100 - base.F;
  
  return base;
}

fixAPTDistribution();