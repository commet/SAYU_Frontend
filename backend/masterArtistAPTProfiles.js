// 마스터 작가 APT 프로필 수동 설정
require('dotenv').config();
const { pool } = require('./src/config/database');

const MASTER_ARTIST_APT_PROFILES = {
  // 예술사 거장들의 APT 프로필 (예술사 연구 기반)
  'Marina Abramović': {
    primary_apt: 'LRUF',
    secondary_apt: 'SAUF', 
    tertiary_apt: 'LAEF',
    analysis: '혁신적이고 도전적인 퍼포먼스 아트의 선구자. 신체적 한계와 정신적 경계를 탐구하는 독립적 리더십을 보임.',
    characteristics: ['혁신적 실험 정신', '신체적 한계 도전', '정신적 경계 탐구', '예술과 삶의 경계 해체']
  },
  'Leonardo da Vinci': {
    primary_apt: 'LAUC',
    secondary_apt: 'SAUC',
    tertiary_apt: 'LRMC',
    analysis: '르네상스의 완전한 인간. 과학과 예술을 통합하는 전략적 모험가적 사고와 분석적 관찰력을 겸비.',
    characteristics: ['다학제적 탐구', '과학적 관찰력', '혁신적 발명', '완벽주의적 성향']
  },
  'Pablo Picasso': {
    primary_apt: 'LAEF',
    secondary_apt: 'SRUF',
    tertiary_apt: 'LRUC',
    analysis: '20세기 미술의 혁명가. 끊임없는 양식 변화와 실험을 통해 몽환적 방랑자의 특성을 보임.',
    characteristics: ['양식적 실험', '창작 욕구', '혁신적 표현', '예술적 다양성']
  },
  'Vincent van Gogh': {
    primary_apt: 'SAEF',
    secondary_apt: 'SRUF',
    tertiary_apt: 'LREF',
    analysis: '감정의 화가. 내면적 고통과 아름다움을 색채로 표현하는 감성적 관찰자.',
    characteristics: ['감정적 표현', '색채의 혁신', '자연에 대한 사랑', '내면적 갈등']
  },
  'Rembrandt van Rijn': {
    primary_apt: 'SREF',
    secondary_apt: 'SRMC',
    tertiary_apt: 'LRMC',
    analysis: '인간성의 화가. 초상화를 통해 인간의 내면을 따뜻하게 포착하는 친근한 공감자.',
    characteristics: ['인간적 온정', '빛과 그림자 마스터', '심리적 깊이', '기법적 완성도']
  },
  'Claude Monet': {
    primary_apt: 'SAEF',
    secondary_apt: 'SAUC',
    tertiary_apt: 'SREF',
    analysis: '인상주의의 아버지. 순간의 빛과 색채를 포착하는 감성적 관찰자.',
    characteristics: ['빛의 변화 관찰', '자연주의', '순간 포착', '색채 혁신']
  },
  'Wassily Kandinsky': {
    primary_apt: 'LAEF',
    secondary_apt: 'SAUC',
    tertiary_apt: 'SRUF',
    analysis: '추상미술의 선구자. 음악과 회화의 연결을 시도한 몽환적 방랑자.',
    characteristics: ['추상적 표현', '정신적 탐구', '색채 이론', '음악적 감성']
  },
  'Salvador Dalí': {
    primary_apt: 'SRUF',
    secondary_apt: 'LAEF',
    tertiary_apt: 'SAUF',
    analysis: '초현실주의의 대가. 무의식을 시각화하는 자유로운 창조자.',
    characteristics: ['무의식 탐구', '시각적 환상', '기법적 완성도', '연극적 성격']
  },
  'Mark Rothko': {
    primary_apt: 'SAEF',
    secondary_apt: 'LREF',
    tertiary_apt: 'SAMC',
    analysis: '색채 명상의 화가. 감정과 영성을 색면으로 표현하는 감성적 관찰자.',
    characteristics: ['색채 명상', '영성 추구', '감정적 깊이', '미니멀한 구성']
  },
  'Jackson Pollock': {
    primary_apt: 'SRUF',
    secondary_apt: 'LAEF',
    tertiary_apt: 'SAUF',
    analysis: '액션 페인팅의 창시자. 의식의 흐름을 캔버스에 담은 자유로운 창조자.',
    characteristics: ['액션 페인팅', '무의식적 표현', '역동적 에너지', '혁신적 기법']
  },
  'Georgia O\'Keeffe': {
    primary_apt: 'SAEF',
    secondary_apt: 'LAUC',
    tertiary_apt: 'SREF',
    analysis: '자연의 본질을 확대하여 포착한 감성적 관찰자. 독특한 시각으로 세계를 재해석.',
    characteristics: ['자연 확대', '여성적 시각', '형태의 본질', '독립적 정신']
  },
  'Andy Warhol': {
    primary_apt: 'SAUC',
    secondary_apt: 'SRMC',
    tertiary_apt: 'LAUC',
    analysis: '팝아트의 아이콘. 대중문화를 예술로 승화시킨 분석가적 관찰자.',
    characteristics: ['대중문화 분석', '반복과 재현', '상업적 미학', '미디어 비판']
  },
  'Frida Kahlo': {
    primary_apt: 'SAEF',
    secondary_apt: 'LREF',
    tertiary_apt: 'SRUF',
    analysis: '고통을 예술로 승화시킨 감성적 관찰자. 개인적 경험을 보편적 메시지로 전환.',
    characteristics: ['자전적 표현', '고통의 승화', '멕시코 정체성', '상징적 언어']
  },
  'Henri Matisse': {
    primary_apt: 'SREF',
    secondary_apt: 'SRUF',
    tertiary_apt: 'SAEF',
    analysis: '색채의 마술사. 순수한 기쁨과 조화를 추구한 친근한 공감자.',
    characteristics: ['색채 해방', '장식적 아름다움', '단순화', '생의 찬미']
  },
  'Paul Cézanne': {
    primary_apt: 'SAUC',
    secondary_apt: 'SRMC',
    tertiary_apt: 'LAMC',
    analysis: '근대회화의 아버지. 형태와 색채의 구조를 탐구한 분석가.',
    characteristics: ['구조적 분석', '기하학적 단순화', '색채 이론', '자연 연구']
  },
  'Edward Hopper': {
    primary_apt: 'SAEF',
    secondary_apt: 'SAUF',
    tertiary_apt: 'LREF',
    analysis: '고독의 화가. 현대인의 소외를 시각화한 감성적 관찰자.',
    characteristics: ['도시적 고독', '빛과 그림자', '일상의 드라마', '심리적 공간']
  },
  '백남준': {
    primary_apt: 'LAEF',
    secondary_apt: 'SRUC',
    tertiary_apt: 'LRUF',
    analysis: '비디오 아트의 아버지. 기술과 예술의 융합을 시도한 몽환적 방랑자.',
    characteristics: ['기술과 예술 융합', '미디어 예술 선구', '동서양 문화 교류', '미래지향적 사고']
  },
  'Francis Bacon': {
    primary_apt: 'SAEF',
    secondary_apt: 'SAUF',
    tertiary_apt: 'LRUF',
    analysis: '인간 존재의 어두운 면을 탐구한 감성적 관찰자. 현대적 불안을 형상화.',
    characteristics: ['실존적 불안', '형태 왜곡', '심리적 긴장', '표현주의적 격정']
  },
  'Alberto Giacometti': {
    primary_apt: 'SAEF',
    secondary_apt: 'LREF',
    tertiary_apt: 'SAUC',
    analysis: '고독한 인간상을 조각한 감성적 관찰자. 실존적 조건을 형태로 표현.',
    characteristics: ['실존적 표현', '인간 조건 탐구', '형태의 본질', '공간과 고독']
  },
  'Peter Paul Rubens': {
    primary_apt: 'SREF',
    secondary_apt: 'LRUC',
    tertiary_apt: 'SRMC',
    analysis: '바로크의 대가. 생명력 넘치는 작품으로 사람들에게 기쁨을 주는 친근한 공감자.',
    characteristics: ['생명력 표현', '화려한 색채', '역동적 구성', '휴머니즘']
  }
};

async function setupMasterArtistAPT() {
  try {
    console.log('🎯 마스터 작가 APT 프로필 설정');
    console.log('='.repeat(80));

    let updateCount = 0;
    let notFoundCount = 0;

    for (const [artistName, aptProfile] of Object.entries(MASTER_ARTIST_APT_PROFILES)) {
      try {
        // 작가 찾기
        const artist = await pool.query(
          `SELECT id, name FROM artists 
           WHERE LOWER(name) = LOWER($1) 
           OR LOWER(name) LIKE LOWER($2)
           ORDER BY importance_score DESC NULLS LAST
           LIMIT 1`,
          [artistName, `%${artistName}%`]
        );

        if (artist.rows.length > 0) {
          const profileData = {
            primary_apt: aptProfile.primary_apt,
            secondary_apt: aptProfile.secondary_apt,
            tertiary_apt: aptProfile.tertiary_apt,
            analysis: aptProfile.analysis,
            characteristics: aptProfile.characteristics,
            meta: {
              source: 'master_profile',
              expert_curated: true,
              timestamp: new Date().toISOString()
            }
          };

          await pool.query(
            'UPDATE artists SET apt_profile = $1, updated_at = NOW() WHERE id = $2',
            [JSON.stringify(profileData), artist.rows[0].id]
          );

          console.log(`✅ ${artistName}: ${aptProfile.primary_apt} / ${aptProfile.secondary_apt} / ${aptProfile.tertiary_apt}`);
          updateCount++;
        } else {
          console.log(`❌ 작가를 찾을 수 없음: ${artistName}`);
          notFoundCount++;
        }
      } catch (err) {
        console.error(`❌ 오류 (${artistName}):`, err.message);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`설정 완료: 성공 ${updateCount}명, 실패 ${notFoundCount}명`);

    // 업데이트된 분포 확인
    const distribution = await pool.query(`
      SELECT 
        apt_profile->>'primary_apt' as apt_type,
        COUNT(*) as count,
        STRING_AGG(name, ', ' ORDER BY importance_score DESC) as artists
      FROM artists
      WHERE apt_profile IS NOT NULL
        AND apt_profile->>'primary_apt' IS NOT NULL
        AND importance_score >= 75
      GROUP BY apt_profile->>'primary_apt'
      ORDER BY count DESC
    `);

    console.log('\n업데이트된 APT 분포:');
    distribution.rows.forEach(row => {
      console.log(`${row.apt_type}: ${row.count}명`);
      console.log(`  작가: ${row.artists.substring(0, 150)}${row.artists.length > 150 ? '...' : ''}`);
    });

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

setupMasterArtistAPT();