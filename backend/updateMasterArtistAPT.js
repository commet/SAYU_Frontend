// 마스터 작가 APT 프로필 직접 업데이트
require('dotenv').config();
const { pool } = require('./src/config/database');

async function updateMasterArtistAPT() {
  try {
    console.log('🎯 마스터 작가 APT 프로필 직접 업데이트');
    console.log('='.repeat(80));

    const updates = [
      {
        id: '0d977cdf-8a6e-4bce-9958-bc74a2d9b059', // Marina Abramović
        name: 'Marina Abramović',
        primary_apt: 'LRUF',
        secondary_apt: 'SAUF',
        tertiary_apt: 'LAEF',
        analysis: '혁신적이고 도전적인 퍼포먼스 아트의 선구자. 신체적 한계와 정신적 경계를 탐구하는 독립적 리더십을 보임.',
        characteristics: ['혁신적 실험 정신', '신체적 한계 도전', '정신적 경계 탐구', '예술과 삶의 경계 해체']
      },
      {
        id: 'd69adc8c-5325-410f-80fe-cbe2cfd7b652', // Pablo Picasso
        name: 'Pablo Picasso',
        primary_apt: 'LAEF',
        secondary_apt: 'SRUF',
        tertiary_apt: 'LRUC',
        analysis: '20세기 미술의 혁명가. 끊임없는 양식 변화와 실험을 통해 몽환적 방랑자의 특성을 보임.',
        characteristics: ['양식적 실험', '창작 욕구', '혁신적 표현', '예술적 다양성']
      },
      {
        id: '16461492-c53c-4ec5-bf2a-f276d177aa19', // Vincent van Gogh
        name: 'Vincent van Gogh',
        primary_apt: 'SAEF',
        secondary_apt: 'SRUF',
        tertiary_apt: 'LREF',
        analysis: '감정의 화가. 내면적 고통과 아름다움을 색채로 표현하는 감성적 관찰자.',
        characteristics: ['감정적 표현', '색채의 혁신', '자연에 대한 사랑', '내면적 갈등']
      },
      {
        id: '8e76c289-29b6-4361-a40c-a175e8138279', // Salvador Dalí
        name: 'Salvador Dalí',
        primary_apt: 'SRUF',
        secondary_apt: 'LAEF',
        tertiary_apt: 'SAUF',
        analysis: '초현실주의의 대가. 무의식을 시각화하는 자유로운 창조자.',
        characteristics: ['무의식 탐구', '시각적 환상', '기법적 완성도', '연극적 성격']
      },
      {
        id: 'cdfe2fed-615e-4389-a663-b73fa56f6c82', // Mark Rothko
        name: 'Mark Rothko',
        primary_apt: 'SAEF',
        secondary_apt: 'LREF',
        tertiary_apt: 'SAMC',
        analysis: '색채 명상의 화가. 감정과 영성을 색면으로 표현하는 감성적 관찰자.',
        characteristics: ['색채 명상', '영성 추구', '감정적 깊이', '미니멀한 구성']
      },
      {
        id: 'b2b2335d-a294-4b7a-bf72-f28a8986f4ee', // Edward Hopper
        name: 'Edward Hopper',
        primary_apt: 'SAEF',
        secondary_apt: 'SAUF',
        tertiary_apt: 'LREF',
        analysis: '고독의 화가. 현대인의 소외를 시각화한 감성적 관찰자.',
        characteristics: ['도시적 고독', '빛과 그림자', '일상의 드라마', '심리적 공간']
      },
      {
        id: '9c133afb-6117-41ac-acf0-a9f61c85725d', // 백남준
        name: '백남준',
        primary_apt: 'LAEF',
        secondary_apt: 'SRUC',
        tertiary_apt: 'LRUF',
        analysis: '비디오 아트의 아버지. 기술과 예술의 융합을 시도한 몽환적 방랑자.',
        characteristics: ['기술과 예술 융합', '미디어 예술 선구', '동서양 문화 교류', '미래지향적 사고']
      },
      {
        id: 'acffd235-0d6b-489b-b554-12e785fb2926', // Francis Bacon
        name: 'Francis Bacon',
        primary_apt: 'SAEF',
        secondary_apt: 'SAUF',
        tertiary_apt: 'LRUF',
        analysis: '인간 존재의 어두운 면을 탐구한 감성적 관찰자. 현대적 불안을 형상화.',
        characteristics: ['실존적 불안', '형태 왜곡', '심리적 긴장', '표현주의적 격정']
      },
      {
        id: '6b8c3493-debb-4973-8413-7a03a901b221', // Alberto Giacometti
        name: 'Alberto Giacometti',
        primary_apt: 'SAEF',
        secondary_apt: 'LREF',
        tertiary_apt: 'SAUC',
        analysis: '고독한 인간상을 조각한 감성적 관찰자. 실존적 조건을 형태로 표현.',
        characteristics: ['실존적 표현', '인간 조건 탐구', '형태의 본질', '공간과 고독']
      },
      {
        id: 'cd05a0b8-617d-4e09-af93-fa44ea2f4b36', // Peter Paul Rubens
        name: 'Peter Paul Rubens',
        primary_apt: 'SREF',
        secondary_apt: 'LRUC',
        tertiary_apt: 'SRMC',
        analysis: '바로크의 대가. 생명력 넘치는 작품으로 사람들에게 기쁨을 주는 친근한 공감자.',
        characteristics: ['생명력 표현', '화려한 색채', '역동적 구성', '휴머니즘']
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      try {
        const profileData = {
          primary_apt: update.primary_apt,
          secondary_apt: update.secondary_apt,
          tertiary_apt: update.tertiary_apt,
          analysis: update.analysis,
          characteristics: update.characteristics,
          meta: {
            source: 'expert_curated',
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        };

        await pool.query(
          'UPDATE artists SET apt_profile = $1, updated_at = NOW() WHERE id = $2',
          [JSON.stringify(profileData), update.id]
        );

        console.log(`✅ ${update.name}: ${update.primary_apt} / ${update.secondary_apt} / ${update.tertiary_apt}`);
        successCount++;
      } catch (err) {
        console.error(`❌ 오류 (${update.name}):`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`업데이트 완료: 성공 ${successCount}명, 실패 ${errorCount}명`);

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
      console.log(`  작가: ${row.artists.substring(0, 100)}${row.artists.length > 100 ? '...' : ''}`);
    });

    // 각 유형별 대표 작가 확인
    console.log('\n각 APT 유형별 대표 작가:');
    const aptTypes = await pool.query(`
      SELECT DISTINCT apt_profile->>'primary_apt' as apt_type
      FROM artists
      WHERE apt_profile IS NOT NULL
        AND apt_profile->>'primary_apt' IS NOT NULL
        AND importance_score >= 75
      ORDER BY apt_type
    `);

    for (const type of aptTypes.rows) {
      const representative = await pool.query(`
        SELECT name, importance_score
        FROM artists
        WHERE apt_profile->>'primary_apt' = $1
          AND importance_score >= 75
        ORDER BY importance_score DESC
        LIMIT 1
      `, [type.apt_type]);

      if (representative.rows.length > 0) {
        console.log(`${type.apt_type}: ${representative.rows[0].name} (${representative.rows[0].importance_score})`);
      }
    }

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await pool.end();
  }
}

updateMasterArtistAPT();