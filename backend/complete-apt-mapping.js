const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 간소화된 APT 추론 (빠른 처리용)
const QUICK_APT_PATTERNS = {
  // 시대별 기본 APT
  era_defaults: {
    'Contemporary': 'SAMC',
    'Modern': 'LAEF', 
    'Impressionism': 'LAEF',
    'Renaissance': 'LRMC',
    'Baroque': 'SREC',
    'Postmodern': 'SAMF'
  },
  
  // 국적별 기본 APT
  nationality_defaults: {
    'Korean': 'LAEC',
    'French': 'LAEF',
    'Italian': 'LRMC',
    'American': 'SAMC',
    'German': 'SRMC',
    'British': 'SAMC',
    'Japanese': 'LAEC',
    'Spanish': 'SAMF'
  },
  
  // 저작권 상태별 기본 APT
  copyright_defaults: {
    'contemporary': 'SAMC',
    'public_domain': 'LRMC',
    'licensed': 'SAEF'
  }
};

async function completeAPTMapping() {
  try {
    console.log('🎯 나머지 아티스트 APT 매핑 완료 시작\n');
    
    // 1. 미매핑 아티스트 조회
    const unmapped = await pool.query(`
      SELECT 
        id, name, name_ko, nationality, nationality_ko,
        birth_year, death_year, copyright_status, era
      FROM artists 
      WHERE apt_profile IS NULL
        AND name NOT ILIKE '%after %' 
        AND name NOT ILIKE '%attributed%'
        AND name NOT ILIKE '%imitator%'
        AND name NOT ILIKE '%workshop%'
      ORDER BY 
        CASE 
          WHEN name_ko IS NOT NULL THEN 1  -- 한국 작가 우선
          WHEN copyright_status = 'contemporary' THEN 2
          WHEN birth_year > 1900 THEN 3
          ELSE 4
        END,
        name
    `);
    
    console.log(`📊 미매핑 아티스트: ${unmapped.rows.length}명\n`);
    
    // 2. 배치 단위로 처리 (100명씩)
    const batchSize = 100;
    let processed = 0;
    let applied = 0;
    
    for (let i = 0; i < unmapped.rows.length; i += batchSize) {
      const batch = unmapped.rows.slice(i, i + batchSize);
      console.log(`⚡ 배치 ${Math.floor(i/batchSize) + 1}: ${batch.length}명 처리 중...`);
      
      for (const artist of batch) {
        try {
          const aptProfile = quickInferAPT(artist);
          
          await pool.query(`
            UPDATE artists 
            SET apt_profile = $1, updated_at = NOW()
            WHERE id = $2
          `, [JSON.stringify(aptProfile), artist.id]);
          
          // 매핑 로그
          await pool.query(`
            INSERT INTO artist_apt_mappings 
            (artist_id, mapping_method, apt_profile, confidence_score, mapped_by, mapping_notes)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            artist.id,
            'quick_inference_v1',
            JSON.stringify(aptProfile),
            aptProfile.meta.confidence,
            'sayu_quick_mapper',
            `Quick inference: ${aptProfile.meta.reasoning.join('; ')}`
          ]);
          
          applied++;
        } catch (error) {
          console.log(`   - 오류 (${artist.id}): ${error.message}`);
        }
        
        processed++;
      }
      
      // 진행률 출력
      const progress = (processed / unmapped.rows.length * 100).toFixed(1);
      console.log(`   ✅ 진행률: ${progress}% (${processed}/${unmapped.rows.length})`);
    }
    
    console.log(`\n✅ 배치 처리 완료: ${applied}명 적용\n`);
    
    // 3. 최종 통계
    const finalStats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(apt_profile) as mapped,
        COUNT(CASE WHEN apt_profile IS NULL THEN 1 END) as unmapped
      FROM artists
    `);
    
    const final = finalStats.rows[0];
    const finalRate = (final.mapped / final.total * 100).toFixed(1);
    
    console.log('🎉 APT 매핑 시스템 구축 완료!');
    console.log('=========================');
    console.log(`📈 최종 매핑률: ${finalRate}% (${final.mapped}/${final.total})`);
    console.log(`✅ 매핑 완료: ${final.mapped}명`);
    console.log(`❌ 매핑 미완료: ${final.unmapped}명\n`);
    
    // 4. 최종 APT 분포
    const finalDistribution = await pool.query(`
      SELECT 
        (apt_profile->'primary_types'->0->>'type') as apt_type,
        COUNT(*) as count,
        ROUND(AVG((apt_profile->'meta'->>'confidence')::decimal), 2) as avg_confidence
      FROM artists 
      WHERE apt_profile IS NOT NULL
      GROUP BY (apt_profile->'primary_types'->0->>'type')
      ORDER BY count DESC
    `);
    
    console.log('📊 최종 APT 분포:');
    finalDistribution.rows.forEach(row => {
      console.log(`   ${row.apt_type}: ${row.count}명 (평균 신뢰도: ${row.avg_confidence})`);
    });
    
    console.log('\n🎯 이제 "LAEF형인 당신에게는 반 고흐를 추천합니다" 시스템이 작동합니다!');
    
    return {
      total: final.total,
      mapped: final.mapped,
      mappingRate: parseFloat(finalRate),
      processed: processed,
      applied: applied
    };
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

function quickInferAPT(artist) {
  const nationality = artist.nationality || artist.nationality_ko || '';
  const era = artist.era || '';
  const copyright = artist.copyright_status || '';
  
  let aptType = 'LAEC'; // 기본값
  let confidence = 0.4;
  let reasoning = [];
  
  // 1. 시대별 매핑
  for (const [eraKey, defaultAPT] of Object.entries(QUICK_APT_PATTERNS.era_defaults)) {
    if (era.includes(eraKey)) {
      aptType = defaultAPT;
      confidence += 0.2;
      reasoning.push(`${era} 시대 특성`);
      break;
    }
  }
  
  // 2. 국적별 매핑  
  for (const [natKey, defaultAPT] of Object.entries(QUICK_APT_PATTERNS.nationality_defaults)) {
    if (nationality.includes(natKey)) {
      aptType = defaultAPT;
      confidence += 0.15;
      reasoning.push(`${natKey} 문화권 특성`);
      break;
    }
  }
  
  // 3. 저작권 상태별 매핑
  if (QUICK_APT_PATTERNS.copyright_defaults[copyright]) {
    aptType = QUICK_APT_PATTERNS.copyright_defaults[copyright];
    confidence += 0.1;
    reasoning.push(`${copyright} 시대성`);
  }
  
  // 4. 출생연도 기반 조정
  if (artist.birth_year) {
    if (artist.birth_year > 1950) {
      aptType = 'SAMC'; // 현대는 사회적/분석적
      confidence += 0.1;
      reasoning.push('현대 작가 특성');
    } else if (artist.birth_year < 1600) {
      aptType = 'LRMC'; // 고전은 고독/사실적
      confidence += 0.1; 
      reasoning.push('고전 작가 특성');
    }
  }
  
  // 5. 한국 작가 특별 처리
  if (artist.name_ko || nationality.includes('Korea') || nationality.includes('한국')) {
    aptType = 'LAEC'; // 한국적 정서
    confidence += 0.1;
    reasoning.push('한국 작가 정서적 특성');
  }
  
  // APT 차원 점수 생성
  const dimensions = generateDimensionsFromType(aptType);
  
  return {
    dimensions,
    primary_types: [
      { type: aptType, weight: 0.8 }
    ],
    meta: {
      confidence: Math.min(0.8, confidence),
      source: 'quick_inference_system',
      keywords: [era, nationality, `${artist.birth_year}s`].filter(Boolean),
      reasoning
    }
  };
}

function generateDimensionsFromType(aptType) {
  const base = { L: 50, S: 50, A: 50, R: 50, E: 50, M: 50, F: 50, C: 50 };
  
  // APT 타입에 따른 차원 조정
  if (aptType[0] === 'L') { base.L = 75; base.S = 25; }
  else { base.L = 25; base.S = 75; }
  
  if (aptType[1] === 'A') { base.A = 75; base.R = 25; }
  else { base.A = 25; base.R = 75; }
  
  if (aptType[2] === 'E') { base.E = 75; base.M = 25; }
  else { base.E = 25; base.M = 75; }
  
  if (aptType[3] === 'F') { base.F = 75; base.C = 25; }
  else { base.F = 25; base.C = 75; }
  
  return base;
}

completeAPTMapping();