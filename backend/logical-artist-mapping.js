const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * LAREMFC 차원 기반 논리적 아티스트 분석 시스템
 *
 * L/S (Lone/Social) - 작업 방식과 예술계 활동
 * A/R (Abstract/Representational) - 작품의 추상성 vs 구상성
 * E/M (Emotional/Meaning-driven) - 감정 표현 vs 의미/메시지 중심
 * F/C (Flow/Constructive) - 즉흥적/직관적 vs 체계적/계획적
 */

// 아티스트별 상세 LAREMFC 분석
const ARTIST_DIMENSION_ANALYSIS = {
  // 고흐 - 실제 삶과 작품 기반 분석
  'Vincent van Gogh': {
    L: 85, S: 15,  // 극도로 고독한 삶, 동생과의 편지가 유일한 소통
    A: 75, R: 25,  // 후기인상주의, 현실을 기반으로 하지만 감정적 왜곡
    E: 95, M: 5,   // 순수한 감정의 폭발, 붓터치 하나하나가 감정
    F: 90, C: 10,  // 격정적이고 즉흥적인 작업, 하루에 여러 작품
    reasoning: '고독한 삶, 강렬한 감정 표현, 소용돌이치는 붓터치',
    expectedType: 'LAEF' // 여우 - 몽환적 방랑자
  },

  // 피카소 - 다양한 시기와 스타일 고려
  'Pablo Picasso': {
    L: 30, S: 70,  // 매우 사교적, 예술계 중심인물, 많은 연인과 친구들
    A: 60, R: 40,  // 큐비즘은 추상이지만 형태 기반, 시기별로 다양
    E: 40, M: 60,  // 지적이고 실험적, 형식 혁신에 관심
    F: 70, C: 30,  // 끊임없는 실험과 변화, 하지만 시기별 체계성
    reasoning: '사교적 성격, 지적 실험, 끊임없는 스타일 변화',
    expectedType: 'SRMF' // 코끼리 - 지식 멘토
  },

  // 모네 - 인상주의의 아버지
  'Claude Monet': {
    L: 70, S: 30,  // 지베르니 정원에서 은둔, 하지만 인상파 그룹 활동
    A: 65, R: 35,  // 빛과 색의 인상, 형태는 흐릿하지만 실제 풍경
    E: 80, M: 20,  // 순간의 느낌과 감각 포착이 목적
    F: 85, C: 15,  // 같은 대상을 다른 시간대에 반복 (즉흥적 관찰)
    reasoning: '빛의 순간적 인상, 감각적 경험, 정원에서의 고독한 작업',
    expectedType: 'LAEF' // 여우 - 몽환적 방랑자
  },

  // 레오나르도 다빈치 - 르네상스 천재
  'Leonardo da Vinci': {
    L: 60, S: 40,  // 궁정 예술가로 활동하지만 연구는 혼자
    A: 20, R: 80,  // 극도로 정밀한 사실주의, 해부학적 정확성
    M: 90, E: 10,  // 과학적 탐구, 지식과 이해가 목적
    C: 95, F: 5,   // 체계적 연구, 수천 개의 노트와 설계도
    reasoning: '과학적 접근, 체계적 연구, 완벽주의적 계획',
    expectedType: 'LRMC' // 비버 - 학구적 연구자
  },

  // 프리다 칼로 - 자전적 초현실주의
  'Frida Kahlo': {
    L: 75, S: 25,  // 병상에서의 고독한 작업, 하지만 정치적 활동
    A: 60, R: 40,  // 초현실적이지만 자화상 중심
    E: 90, M: 10,  // 고통과 감정의 직접적 표현
    F: 60, C: 40,  // 감정적이지만 상징 체계 사용
    reasoning: '개인적 고통의 표현, 강렬한 자전적 감정',
    expectedType: 'LAEF' // 여우 - 몽환적 방랑자
  },

  // 앤디 워홀 - 팝아트의 제왕
  'Andy Warhol': {
    L: 20, S: 80,  // The Factory, 사교계의 중심
    R: 70, A: 30,  // 대중문화 이미지 그대로 사용
    M: 75, E: 25,  // 소비문화 비평, 의미와 메시지 중심
    C: 85, F: 15,  // 실크스크린 반복 작업, 체계적 생산
    reasoning: '사교적 활동, 대중문화 비평, 체계적 작품 생산',
    expectedType: 'SRMC' // 독수리 - 체계적 교육자
  },

  // 잭슨 폴록 - 추상표현주의
  'Jackson Pollock': {
    L: 80, S: 20,  // 고독하고 괴팍한 성격
    A: 95, R: 5,   // 완전한 추상, 액션 페인팅
    E: 85, M: 15,  // 무의식과 감정의 직접적 표출
    F: 95, C: 5,   // 즉흥적 드리핑 기법
    reasoning: '고독한 성격, 무의식적 표현, 즉흥적 액션 페인팅',
    expectedType: 'LAEF' // 여우 - 몽환적 방랑자
  },

  // 요하네스 베르메르 - 네덜란드 황금기
  'Johannes Vermeer': {
    L: 85, S: 15,  // 극히 적은 작품, 은둔적 삶
    R: 90, A: 10,  // 극사실주의, 빛의 정밀한 묘사
    M: 60, E: 40,  // 일상의 조용한 순간들의 의미
    C: 90, F: 10,  // 극도로 정밀하고 계획적인 작업
    reasoning: '은둔적 삶, 정밀한 사실주의, 계획적 구성',
    expectedType: 'LRMC' // 비버 - 학구적 연구자
  },

  // 바스키아 - 신표현주의
  'Jean-Michel Basquiat': {
    L: 30, S: 70,  // 뉴욕 예술계의 스타
    A: 70, R: 30,  // 추상적이지만 텍스트와 상징 사용
    E: 60, M: 40,  // 분노와 정체성, 하지만 사회 비평도
    F: 80, C: 20,  // 즉흥적이고 원시적인 표현
    reasoning: '사교적 활동, 즉흥적 표현, 사회적 메시지',
    expectedType: 'SAEF' // 나비 - 감성 나눔이
  },

  // 조지아 오키프 - 미국 모더니즘
  "Georgia O'Keeffe": {
    L: 90, S: 10,  // 뉴멕시코 사막에서 은둔
    A: 50, R: 50,  // 꽃과 풍경을 추상화
    E: 70, M: 30,  // 자연의 감각적 경험
    C: 70, F: 30,  // 신중하고 반복적인 주제 탐구
    reasoning: '사막에서의 고독한 삶, 자연의 감각적 추상화',
    expectedType: 'LAEC' // 고양이 - 감성 큐레이터
  },

  // 마리나 아브라모비치 - 퍼포먼스 아트
  'Marina Abramović': {
    L: 50, S: 50,  // 퍼포먼스는 관객과 함께, 하지만 극한의 개인적 경험
    A: 80, R: 20,  // 개념적이고 추상적
    M: 70, E: 30,  // 철학적 탐구가 목적
    C: 80, F: 20,  // 철저히 계획된 퍼포먼스
    reasoning: '극한의 퍼포먼스, 철학적 탐구, 관객과의 상호작용',
    expectedType: 'LAMC' // 거북이 - 철학적 수집가
  },

  // 데이비드 호크니 - 팝아트와 풍경
  'David Hockney': {
    L: 30, S: 70,  // 사교적이고 개방적
    R: 80, A: 20,  // 구상적이지만 밝은 색채
    E: 60, M: 40,  // 기쁨과 즐거움의 표현
    F: 40, C: 60,  // 계획적이지만 경쾌함
    reasoning: '밝고 사교적, 구상적 표현, 일상의 기쁨',
    expectedType: 'SREC' // 오리 - 따뜻한 안내자
  }
};

/**
 * LAREMFC 점수를 기반으로 16가지 타입 중 최적 매칭
 */
function calculateBestType(dimensions) {
  const { L, S, A, R, E, M, F, C } = dimensions;

  // 4글자 코드 생성
  const first = L > S ? 'L' : 'S';
  const second = A > R ? 'A' : 'R';
  const third = E > M ? 'E' : 'M';
  const fourth = F > C ? 'F' : 'C';

  return first + second + third + fourth;
}

/**
 * 아티스트 이름으로 차원 분석 추론 (상세 분석이 없는 경우)
 */
function inferDimensionsFromArtist(artistName, biography = '') {
  const name = artistName.toLowerCase();
  const bio = biography.toLowerCase();

  // 기본값
  const dimensions = {
    L: 50, S: 50,
    A: 50, R: 50,
    E: 50, M: 50,
    F: 50, C: 50
  };

  // 시대별 특성
  if (bio.includes('renaissance') || bio.includes('르네상스')) {
    dimensions.R += 20; // 사실주의 경향
    dimensions.C += 20; // 체계적 작업
    dimensions.M += 10; // 의미 중심
  }

  if (bio.includes('impressionist') || bio.includes('인상')) {
    dimensions.A += 15; // 추상적 경향
    dimensions.E += 20; // 감각과 감정
    dimensions.F += 20; // 즉흥적 포착
  }

  if (bio.includes('abstract') || bio.includes('추상')) {
    dimensions.A += 30; // 높은 추상성
    dimensions.E += 10; // 감정 표현
  }

  if (bio.includes('surreal') || bio.includes('초현실')) {
    dimensions.A += 20; // 추상적
    dimensions.M += 15; // 의미와 상징
    dimensions.L += 10; // 내면 탐구
  }

  // 매체별 특성
  if (bio.includes('performance') || bio.includes('퍼포먼스')) {
    dimensions.S += 20; // 관객과 상호작용
    dimensions.A += 15; // 개념적
    dimensions.F += 10; // 즉흥성
  }

  if (bio.includes('photographer') || bio.includes('사진')) {
    dimensions.R += 20; // 현실 포착
    dimensions.C += 15; // 기술적 체계
  }

  // 정규화 (각 대립쌍의 합이 100이 되도록)
  const normalizeOpposites = (a, b) => {
    const total = a + b;
    return [Math.round(a * 100 / total), Math.round(b * 100 / total)];
  };

  [dimensions.L, dimensions.S] = normalizeOpposites(dimensions.L, dimensions.S);
  [dimensions.A, dimensions.R] = normalizeOpposites(dimensions.A, dimensions.R);
  [dimensions.E, dimensions.M] = normalizeOpposites(dimensions.E, dimensions.M);
  [dimensions.F, dimensions.C] = normalizeOpposites(dimensions.F, dimensions.C);

  return dimensions;
}

/**
 * 메인 실행 함수
 */
async function logicalArtistMapping() {
  try {
    console.log('🧠 LAREMFC 차원 기반 논리적 아티스트 매핑 시작\n');

    // 1. 상세 분석이 있는 아티스트들 처리
    console.log('📊 상세 차원 분석 아티스트 처리:');
    for (const [artistName, analysis] of Object.entries(ARTIST_DIMENSION_ANALYSIS)) {
      const { L, S, A, R, E, M, F, C, reasoning, expectedType } = analysis;

      const calculatedType = calculateBestType({ L, S, A, R, E, M, F, C });

      console.log(`\n${artistName}:`);
      console.log(`  차원: L${L}/S${S}, A${A}/R${R}, E${E}/M${M}, F${F}/C${C}`);
      console.log(`  이유: ${reasoning}`);
      console.log(`  계산된 타입: ${calculatedType} (예상: ${expectedType})`);

      // DB 업데이트
      const result = await pool.query(`
        SELECT id FROM artists 
        WHERE LOWER(name) LIKE LOWER($1)
        LIMIT 1
      `, [`%${artistName}%`]);

      if (result.rows.length > 0) {
        const aptProfile = {
          dimensions: { L, S, A, R, E, M, F, C },
          primary_types: [{
            type: calculatedType,
            weight: 0.9,
            confidence: 95
          }],
          meta: {
            analysis_method: 'detailed_logical_analysis',
            reasoning,
            analysis_date: new Date().toISOString()
          }
        };

        await pool.query(`
          UPDATE artists 
          SET apt_profile = $1, updated_at = NOW()
          WHERE id = $2
        `, [JSON.stringify(aptProfile), result.rows[0].id]);

        console.log(`  ✅ DB 업데이트 완료`);
      }
    }

    // 2. 추가 아티스트 자동 분석
    console.log('\n\n📈 추가 아티스트 자동 분석:');
    const additionalArtists = await pool.query(`
      SELECT id, name, biography
      FROM artists
      WHERE apt_profile IS NULL
        AND (is_featured = true OR follow_count > 100)
      ORDER BY follow_count DESC NULLS LAST
      LIMIT 30
    `);

    for (const artist of additionalArtists.rows) {
      const dimensions = inferDimensionsFromArtist(artist.name, artist.biography || '');
      const calculatedType = calculateBestType(dimensions);

      console.log(`\n${artist.name}: ${calculatedType}`);
      console.log(`  자동 분석: L${dimensions.L}/S${dimensions.S}, A${dimensions.A}/R${dimensions.R}, E${dimensions.E}/M${dimensions.M}, F${dimensions.F}/C${dimensions.C}`);

      const aptProfile = {
        dimensions,
        primary_types: [{
          type: calculatedType,
          weight: 0.8,
          confidence: 70
        }],
        meta: {
          analysis_method: 'automated_inference',
          analysis_date: new Date().toISOString()
        }
      };

      await pool.query(`
        UPDATE artists 
        SET apt_profile = $1, updated_at = NOW()
        WHERE id = $2
      `, [JSON.stringify(aptProfile), artist.id]);
    }

    // 3. 최종 분포 확인
    const distribution = await pool.query(`
      SELECT 
        apt_profile->'primary_types'->0->>'type' as type,
        COUNT(*) as count,
        STRING_AGG(name, ', ' ORDER BY follow_count DESC NULLS LAST) as artists
      FROM artists
      WHERE apt_profile IS NOT NULL
      GROUP BY apt_profile->'primary_types'->0->>'type'
      ORDER BY count DESC
    `);

    console.log('\n\n📊 최종 타입 분포:');
    for (const row of distribution.rows) {
      console.log(`${row.type}: ${row.count}명`);
      console.log(`  대표 작가: ${row.artists.split(', ').slice(0, 3).join(', ')}...`);
    }

    console.log('\n✨ 논리적 매핑 완료!');

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  logicalArtistMapping();
}

module.exports = {
  ARTIST_DIMENSION_ANALYSIS,
  calculateBestType,
  inferDimensionsFromArtist
};
