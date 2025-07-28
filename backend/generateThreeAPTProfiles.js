const { Pool } = require('pg');
const { VALID_TYPE_CODES, getSAYUType } = require('@sayu/shared');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class ThreeAPTGenerator {
  /**
   * 아티스트의 기본 정보를 기반으로 3개의 APT 생성
   */
  generateThreeAPTs(basicInfo, primaryType = null) {
    // 1. 주요 타입 결정 (기존 타입이 있으면 유지)
    let primaryAPT;
    if (primaryType && VALID_TYPE_CODES.includes(primaryType)) {
      primaryAPT = primaryType;
    } else {
      primaryAPT = this.determinePrimaryType(basicInfo);
    }

    // 2. 보조 및 잠재 타입 생성
    const secondaryAPT = this.generateSecondaryType(primaryAPT, basicInfo);
    const tertiaryAPT = this.generateTertiaryType(primaryAPT, secondaryAPT, basicInfo);

    // 3. 각 타입별 신뢰도 계산
    const confidences = this.calculateConfidences(basicInfo);

    // 4. 3개 타입 프로필 생성
    return [
      {
        type: primaryAPT,
        ...this.getTypeDetails(primaryAPT),
        weight: 0.6,
        confidence: confidences.primary
      },
      {
        type: secondaryAPT,
        ...this.getTypeDetails(secondaryAPT),
        weight: 0.25,
        confidence: confidences.secondary
      },
      {
        type: tertiaryAPT,
        ...this.getTypeDetails(tertiaryAPT),
        weight: 0.15,
        confidence: confidences.tertiary
      }
    ];
  }

  /**
   * 주요 타입 결정 (기존 로직 활용)
   */
  determinePrimaryType(basicInfo) {
    const scores = {
      L_S: 0,
      A_R: 0,
      E_M: 0,
      F_C: 0
    };

    // 기본 분석 로직 (간소화)
    if (basicInfo.movements) {
      if (basicInfo.movements.some(m => m.includes('Pop') || m.includes('Street'))) {
        scores.L_S += 30;
      }
      if (basicInfo.movements.some(m => m.includes('Abstract') || m.includes('Conceptual'))) {
        scores.A_R -= 30;
      }
      if (basicInfo.movements.some(m => m.includes('Expressionism'))) {
        scores.E_M -= 30;
      }
    }

    // 타입 코드 생성
    const l_s = scores.L_S < 0 ? 'L' : 'S';
    const a_r = scores.A_R < 0 ? 'A' : 'R';
    const e_m = scores.E_M < 0 ? 'E' : 'M';
    const f_c = scores.F_C < 0 ? 'F' : 'C';

    return l_s + a_r + e_m + f_c;
  }

  /**
   * 보조 타입 생성 (1-2개 축 변경)
   */
  generateSecondaryType(primaryType, basicInfo) {
    const chars = primaryType.split('');
    const variations = [];

    // 각 축별로 변형 생성
    const opposites = {
      'L': 'S', 'S': 'L',
      'A': 'R', 'R': 'A',
      'E': 'M', 'M': 'E',
      'F': 'C', 'C': 'F'
    };

    // 1개 축 변경
    for (let i = 0; i < chars.length; i++) {
      const newChars = [...chars];
      newChars[i] = opposites[chars[i]];
      variations.push(newChars.join(''));
    }

    // 가장 적합한 변형 선택 (작가 특성 고려)
    return this.selectBestVariation(variations, basicInfo, [primaryType]);
  }

  /**
   * 잠재 타입 생성 (2개 축 변경)
   */
  generateTertiaryType(primaryType, secondaryType, basicInfo) {
    const chars = primaryType.split('');
    const variations = [];

    const opposites = {
      'L': 'S', 'S': 'L',
      'A': 'R', 'R': 'A',
      'E': 'M', 'M': 'E',
      'F': 'C', 'C': 'F'
    };

    // 2개 축 변경
    for (let i = 0; i < chars.length - 1; i++) {
      for (let j = i + 1; j < chars.length; j++) {
        const newChars = [...chars];
        newChars[i] = opposites[chars[i]];
        newChars[j] = opposites[chars[j]];
        variations.push(newChars.join(''));
      }
    }

    // 기존 타입과 겹치지 않는 변형 선택
    return this.selectBestVariation(variations, basicInfo, [primaryType, secondaryType]);
  }

  /**
   * 가장 적합한 변형 선택
   */
  selectBestVariation(variations, basicInfo, excludeTypes) {
    // 중복 제거
    const validVariations = variations.filter(v =>
      VALID_TYPE_CODES.includes(v) && !excludeTypes.includes(v)
    );

    if (validVariations.length === 0) {
      // 모든 변형이 제외되면 랜덤 선택
      const remaining = VALID_TYPE_CODES.filter(t => !excludeTypes.includes(t));
      return remaining[Math.floor(Math.random() * remaining.length)];
    }

    // 작가 특성에 따라 가중치 부여 (예: 현대 작가면 S, A 선호)
    if (basicInfo.period === 'Contemporary') {
      return validVariations.find(v => v.includes('S') && v.includes('A')) || validVariations[0];
    }

    return validVariations[0];
  }

  /**
   * 신뢰도 계산
   */
  calculateConfidences(basicInfo) {
    const baseConfidence = 70;
    let modifier = 0;

    // 정보 완성도에 따른 조정
    if (basicInfo.bio && basicInfo.bio.length > 200) modifier += 10;
    if (basicInfo.movements && basicInfo.movements.length > 2) modifier += 5;
    if (basicInfo.nationality) modifier += 5;

    return {
      primary: Math.min(90, baseConfidence + modifier),
      secondary: Math.min(70, baseConfidence + modifier - 20),
      tertiary: Math.min(50, baseConfidence + modifier - 40)
    };
  }

  /**
   * 타입 상세 정보 가져오기
   */
  getTypeDetails(typeCode) {
    const sayuType = getSAYUType(typeCode);
    return {
      title: sayuType.nameEn,
      title_ko: sayuType.name,
      animal: sayuType.animalEn?.toLowerCase(),
      name_ko: sayuType.animal
    };
  }
}

async function updateAllArtistsToThreeAPT() {
  const generator = new ThreeAPTGenerator();

  try {
    console.log('🚀 모든 아티스트 3-APT 시스템 업데이트 시작!\n');

    // 1. 현재 1개 타입만 가진 아티스트들 조회
    const singleTypeResult = await pool.query(`
      SELECT 
        id, name, 
        apt_profile,
        apt_profile->'primary_types'->0->>'type' as current_type,
        nationality, birth_year, death_year
      FROM artists 
      WHERE apt_profile IS NOT NULL
      AND jsonb_array_length(apt_profile->'primary_types') = 1
      ORDER BY importance_score DESC NULLS LAST
      LIMIT 500
    `);

    console.log(`📋 업데이트 대상: ${singleTypeResult.rowCount}명\n`);

    let updated = 0;
    let failed = 0;

    for (const artist of singleTypeResult.rows) {
      try {
        // 기본 정보 구성
        const basicInfo = {
          name: artist.name,
          nationality: artist.nationality,
          birthYear: artist.birth_year,
          movements: [], // TODO: 실제 movements 데이터 필요
          period: artist.birth_year ?
            (artist.birth_year < 1900 ? 'Classical' :
             artist.birth_year < 1950 ? 'Modern' : 'Contemporary') : 'Contemporary'
        };

        // 3개 APT 생성
        const threeAPTs = generator.generateThreeAPTs(basicInfo, artist.current_type);

        // 기존 프로필 업데이트
        const updatedProfile = {
          ...artist.apt_profile,
          primary_types: threeAPTs,
          meta: {
            ...artist.apt_profile.meta,
            updated_to_three_apt: true,
            update_date: new Date().toISOString()
          }
        };

        // DB 업데이트
        await pool.query(
          'UPDATE artists SET apt_profile = $1 WHERE id = $2',
          [JSON.stringify(updatedProfile), artist.id]
        );

        console.log(`✅ ${artist.name}: ${threeAPTs.map(t => t.type).join(' → ')}`);
        updated++;

      } catch (error) {
        console.error(`❌ ${artist.name}: ${error.message}`);
        failed++;
      }
    }

    console.log('\n📊 업데이트 결과:');
    console.log(`  ✅ 성공: ${updated}명`);
    console.log(`  ❌ 실패: ${failed}명`);

    // 2. 잘못된 타입 정리
    console.log('\n🧹 잘못된 타입 정리 중...');

    const cleanupResult = await pool.query(`
      UPDATE artists 
      SET apt_profile = jsonb_set(
        apt_profile,
        '{primary_types}',
        (
          SELECT jsonb_agg(elem)
          FROM jsonb_array_elements(apt_profile->'primary_types') elem
          WHERE elem->>'type' IN (${VALID_TYPE_CODES.map(t => `'${t}'`).join(',')})
        )
      )
      WHERE apt_profile IS NOT NULL
      AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(apt_profile->'primary_types') elem
        WHERE elem->>'type' NOT IN (${VALID_TYPE_CODES.map(t => `'${t}'`).join(',')})
      )
    `);

    console.log(`  정리된 아티스트: ${cleanupResult.rowCount}명`);

    // 3. 최종 통계
    const finalStats = await pool.query(`
      SELECT 
        jsonb_array_length(apt_profile->'primary_types') as type_count,
        COUNT(*) as count
      FROM artists 
      WHERE apt_profile IS NOT NULL
      GROUP BY type_count
      ORDER BY type_count
    `);

    console.log('\n📈 최종 APT 타입 개수 분포:');
    finalStats.rows.forEach(row => {
      console.log(`  ${row.type_count}개 타입: ${row.count}명`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  updateAllArtistsToThreeAPT();
}

module.exports = ThreeAPTGenerator;
