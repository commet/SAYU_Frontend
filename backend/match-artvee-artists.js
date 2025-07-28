/**
 * Artvee 작품과 Artists DB 매칭
 * 다단계 매칭 전략 적용
 */

require('dotenv').config();
const { pool } = require('./src/config/database');

// 매칭 신뢰도 레벨
const CONFIDENCE_LEVELS = {
  EXACT: 1.0,      // 정확히 일치
  ALIAS: 0.9,      // 별칭 일치
  PARTIAL: 0.7,    // 부분 일치 (성만 일치 등)
  FUZZY: 0.5,      // 유사도 매칭
  MANUAL: 1.0      // 수동 매핑
};

// 수동 매핑 테이블 (주요 작가들)
const MANUAL_MAPPINGS = {
  'John William Waterhouse': 'John William Waterhouse',
  'Kazimir Malevich': 'Kazimir Severinovich Malevich',
  'Alphonse Mucha': 'Alphonse Maria Mucha',
  'Caravaggio': 'Michelangelo Merisi da Caravaggio',
  'Chaïm Soutine': 'Chaim Soutine',
  'Juan Gris': 'José Victoriano González-Pérez',  // Juan Gris의 본명
  'Andrea Mantegna': 'Andrea Mantegna',
  'Arthur Rackham': 'Arthur Rackham',
  'Egon Schiele': 'Egon Leo Adolf Ludwig Schiele',
  'El Lissitzky': 'Lazar Markovich Lissitzky',
  'Frederic Leighton': 'Frederic Leighton, 1st Baron Leighton',
  'George Romney': 'George Romney',
  'Charles Demuth': 'Charles Henry Buckius Demuth',
  'André Derain': 'André Derain',
  'Dean Cornwell': 'Dean Cornwell',
  'Howard Pyle': 'Howard Pyle',
  'Jan van Eyck': 'Jan van Eyck',
  'Jean Auguste Dominique Ingres': 'Jean-Auguste-Dominique Ingres',
  'Jean-François Millet': 'Jean-François Millet',
  'Lawrence Alma-Tadema': 'Lawrence Alma-Tadema',
  'Maxfield Parrish': 'Maxfield Frederick Parrish',
  'Michelangelo': 'Michelangelo di Lodovico Buonarroti Simoni',
  'Raphael': 'Raffaello Sanzio da Urbino',
  'Sandro Botticelli': 'Alessandro di Mariano di Vanni Filipepi'
};

async function createMappingTable(client) {
  // 매핑 테이블 생성
  await client.query(`
    CREATE TABLE IF NOT EXISTS artvee_artist_mappings (
      id SERIAL PRIMARY KEY,
      artvee_artist VARCHAR(255) NOT NULL UNIQUE,
      artist_id UUID REFERENCES artists(id),
      confidence_score FLOAT NOT NULL,
      mapping_method VARCHAR(50) NOT NULL,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // artvee_artwork_artists 연결 테이블 생성 (artvee_artworks의 id가 integer이므로)
  await client.query(`
    CREATE TABLE IF NOT EXISTS artvee_artwork_artists (
      id SERIAL PRIMARY KEY,
      artwork_id INTEGER REFERENCES artvee_artworks(id) ON DELETE CASCADE,
      artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
      role VARCHAR(100) DEFAULT 'artist',
      is_primary BOOLEAN DEFAULT TRUE,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(artwork_id, artist_id, role)
    )
  `);

  console.log('✅ 매핑 테이블 생성/확인 완료');
}

async function matchExact(client, artveeArtist) {
  // 1. 정확히 일치
  const exactMatch = await client.query(`
    SELECT id, name FROM artists 
    WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))
    LIMIT 1
  `, [artveeArtist]);

  if (exactMatch.rows.length > 0) {
    return {
      artist_id: exactMatch.rows[0].id,
      confidence: CONFIDENCE_LEVELS.EXACT,
      method: 'exact_match'
    };
  }

  // 2. 별칭 확인 - name_aliases 컬럼이 없으므로 일단 스킵
  // TODO: name_aliases 컬럼 추가 후 활성화

  return null;
}

async function matchPartial(client, artveeArtist) {
  // 성만으로 매칭 시도
  const parts = artveeArtist.split(' ');
  if (parts.length < 2) return null;

  const lastName = parts[parts.length - 1];

  const partialMatch = await client.query(`
    SELECT id, name FROM artists 
    WHERE LOWER(name) LIKE LOWER($1)
    LIMIT 1
  `, [`%${lastName}%`]);

  if (partialMatch.rows.length > 0) {
    return {
      artist_id: partialMatch.rows[0].id,
      confidence: CONFIDENCE_LEVELS.PARTIAL,
      method: 'partial_match'
    };
  }

  return null;
}

async function matchManual(artveeArtist) {
  const mappedName = MANUAL_MAPPINGS[artveeArtist];
  if (mappedName) {
    return {
      mapped_name: mappedName,
      confidence: CONFIDENCE_LEVELS.MANUAL,
      method: 'manual_mapping'
    };
  }
  return null;
}

async function performMatching() {
  const client = await pool.connect();

  try {
    console.log('🎯 Artvee-Artists 매칭 시작...\n');

    // 테이블 생성/확인
    await createMappingTable(client);

    // 모든 고유 작가 가져오기
    const artveeArtists = await client.query(`
      SELECT DISTINCT artist, COUNT(*) as artwork_count
      FROM artvee_artworks
      WHERE artist IS NOT NULL AND artist != ''
      GROUP BY artist
      ORDER BY artwork_count DESC
    `);

    console.log(`📋 총 ${artveeArtists.rows.length}명의 작가 매칭 시작\n`);

    const stats = {
      exact: 0,
      alias: 0,
      partial: 0,
      manual: 0,
      unmatched: 0
    };

    for (const row of artveeArtists.rows) {
      const artveeArtist = row.artist;
      let matched = false;

      // 1. 수동 매핑 확인
      const manualMatch = await matchManual(artveeArtist);
      if (manualMatch) {
        // 수동 매핑된 이름으로 다시 검색
        const artistResult = await client.query(`
          SELECT id FROM artists WHERE LOWER(name) = LOWER($1) LIMIT 1
        `, [manualMatch.mapped_name]);

        if (artistResult.rows.length > 0) {
          await client.query(`
            INSERT INTO artvee_artist_mappings 
            (artvee_artist, artist_id, confidence_score, mapping_method)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (artvee_artist) 
            DO UPDATE SET 
              artist_id = $2,
              confidence_score = $3,
              mapping_method = $4,
              updated_at = NOW()
          `, [artveeArtist, artistResult.rows[0].id, manualMatch.confidence, manualMatch.method]);

          console.log(`✅ [수동] ${artveeArtist} → ${manualMatch.mapped_name}`);
          stats.manual++;
          matched = true;
        }
      }

      // 2. 정확한 매칭 시도
      if (!matched) {
        const exactMatch = await matchExact(client, artveeArtist);
        if (exactMatch) {
          await client.query(`
            INSERT INTO artvee_artist_mappings 
            (artvee_artist, artist_id, confidence_score, mapping_method)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (artvee_artist) 
            DO UPDATE SET 
              artist_id = $2,
              confidence_score = $3,
              mapping_method = $4,
              updated_at = NOW()
          `, [artveeArtist, exactMatch.artist_id, exactMatch.confidence, exactMatch.method]);

          console.log(`✅ [정확] ${artveeArtist}`);
          stats.exact++;
          matched = true;
        }
      }

      // 3. 부분 매칭 시도
      if (!matched) {
        const partialMatch = await matchPartial(client, artveeArtist);
        if (partialMatch) {
          await client.query(`
            INSERT INTO artvee_artist_mappings 
            (artvee_artist, artist_id, confidence_score, mapping_method)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (artvee_artist) 
            DO UPDATE SET 
              artist_id = $2,
              confidence_score = $3,
              mapping_method = $4,
              updated_at = NOW()
          `, [artveeArtist, partialMatch.artist_id, partialMatch.confidence, partialMatch.method]);

          console.log(`⚠️  [부분] ${artveeArtist}`);
          stats.partial++;
          matched = true;
        }
      }

      // 4. 매칭 실패
      if (!matched) {
        console.log(`❌ [실패] ${artveeArtist} (${row.artwork_count}개 작품)`);
        stats.unmatched++;

        // 매칭 실패도 기록 (나중에 수동 처리를 위해)
        await client.query(`
          INSERT INTO artvee_artist_mappings 
          (artvee_artist, artist_id, confidence_score, mapping_method)
          VALUES ($1, NULL, 0, 'unmatched')
          ON CONFLICT (artvee_artist) 
          DO UPDATE SET 
            artist_id = NULL,
            confidence_score = 0,
            mapping_method = 'unmatched',
            updated_at = NOW()
        `, [artveeArtist]);
      }
    }

    console.log('\n📊 매칭 결과 요약:');
    console.log(`  - 정확한 매칭: ${stats.exact}명`);
    console.log(`  - 별칭 매칭: ${stats.alias}명`);
    console.log(`  - 부분 매칭: ${stats.partial}명`);
    console.log(`  - 수동 매핑: ${stats.manual}명`);
    console.log(`  - 매칭 실패: ${stats.unmatched}명`);
    console.log(`  - 전체 성공률: ${((artveeArtists.rows.length - stats.unmatched) / artveeArtists.rows.length * 100).toFixed(1)}%`);

    // 이제 artvee_artwork_artists 테이블에 연결 정보 생성
    console.log('\n🔗 Artwork-Artist 연결 생성 중...');

    const linkResult = await client.query(`
      INSERT INTO artvee_artwork_artists (artwork_id, artist_id)
      SELECT 
        aa.id as artwork_id,
        aam.artist_id
      FROM artvee_artworks aa
      INNER JOIN artvee_artist_mappings aam ON aa.artist = aam.artvee_artist
      WHERE aam.artist_id IS NOT NULL
      ON CONFLICT (artwork_id, artist_id, role) DO NOTHING
    `);

    console.log(`✅ ${linkResult.rowCount}개의 연결 생성 완료!`);

  } catch (error) {
    console.error('❌ 매칭 중 오류 발생:', error);
  } finally {
    client.release();
  }
}

// 실행
performMatching().then(() => {
  console.log('\n✅ 매칭 작업 완료!');
  process.exit(0);
}).catch(error => {
  console.error('❌ 실행 실패:', error);
  process.exit(1);
});
