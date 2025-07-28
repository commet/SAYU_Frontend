const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require('../src/config/database');
const { log } = require('../src/config/logger');

// 작가 정보 추출 함수
function extractArtistInfo(artistString) {
  if (!artistString || artistString === 'Unknown') {
    return null;
  }

  // 패턴: "Name (Nationality, Birth-Death)" 또는 "Name\nNationality, Birth-Death"
  const patterns = [
    /^(.+?)\s*\((.+?),\s*(\d{4})(?:–|-)(\d{4}|\?)\)$/,
    /^(.+?)\s*\((.+?),\s*(\d{4})(?:–|-)present\)$/,
    /^(.+?)\s*\((.+?),\s*b\.\s*(\d{4})\)$/,
    /^(.+?)\n(.+?),\s*(\d{4})(?:-|–)(\d{4})$/,
    /^(.+?)\s*\((.+?)\)$/
  ];

  for (const pattern of patterns) {
    const match = artistString.match(pattern);
    if (match) {
      return {
        name: match[1].trim(),
        nationality: match[2] ? match[2].trim() : null,
        birthYear: match[3] ? parseInt(match[3]) : null,
        deathYear: match[4] && match[4] !== '?' ? parseInt(match[4]) : null
      };
    }
  }

  // 단순 이름만 있는 경우
  return {
    name: artistString.trim(),
    nationality: null,
    birthYear: null,
    deathYear: null
  };
}

// 국적을 한국어로 번역
function translateNationality(nationality) {
  const translations = {
    'French': '프랑스',
    'Dutch': '네덜란드',
    'American': '미국',
    'German': '독일',
    'Spanish': '스페인',
    'Italian': '이탈리아',
    'British': '영국',
    'Japanese': '일본',
    'Chinese': '중국',
    'Korean': '한국',
    'Russian': '러시아',
    'Belgian': '벨기에',
    'Austrian': '오스트리아',
    'Swiss': '스위스',
    'Mexican': '멕시코'
  };

  return translations[nationality] || nationality;
}

// 저작권 상태 결정
function determineCopyrightStatus(deathYear) {
  if (!deathYear) {
    return 'contemporary'; // 생존 작가
  }

  const currentYear = new Date().getFullYear();
  const yearsSinceDeath = currentYear - deathYear;

  if (yearsSinceDeath > 70) {
    return 'public_domain';
  } else if (yearsSinceDeath > 50) {
    return 'licensed'; // 일부 국가에서는 퍼블릭 도메인
  } else {
    return 'contemporary';
  }
}

async function importArtists() {
  try {
    // JSON 파일 읽기
    const collectionPath = path.join(__dirname, '../../met-crawler/met-artworks-data/maximized-collection-2025-07-17T11-22-19-710Z.json');
    const artworksData = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

    log.info(`Found ${artworksData.artworks.length} artworks to process`);

    // 작가별로 그룹화
    const artistMap = new Map();

    for (const artwork of artworksData.artworks) {
      if (!artwork.artist || artwork.artist === 'Unknown') continue;

      const artistInfo = extractArtistInfo(artwork.artist);
      if (!artistInfo) continue;

      // 이름이 너무 긴 경우 잘라내기
      if (artistInfo.name.length > 255) {
        artistInfo.name = `${artistInfo.name.substring(0, 252)}...`;
      }

      // 작가별로 작품 수 카운트
      const key = artistInfo.name.toLowerCase();
      if (!artistMap.has(key)) {
        artistMap.set(key, {
          ...artistInfo,
          artworkCount: 1,
          source: artwork.source
        });
      } else {
        artistMap.get(key).artworkCount++;
      }
    }

    log.info(`Found ${artistMap.size} unique artists`);

    // 데이터베이스에 삽입
    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const [key, artist] of artistMap) {
      try {
        const copyrightStatus = determineCopyrightStatus(artist.deathYear);
        const nationalityKo = artist.nationality ? translateNationality(artist.nationality) : null;

        // 기존 작가 확인
        const existingArtist = await pool.query(
          'SELECT id FROM artists WHERE LOWER(name) = LOWER($1)',
          [artist.name]
        );

        if (existingArtist.rows.length > 0) {
          // 업데이트 (기본 정보만 업데이트)
          await pool.query(
            `UPDATE artists 
             SET updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [existingArtist.rows[0].id]
          );
          updated++;
        } else {
          // 새로 삽입
          await pool.query(
            `INSERT INTO artists (
              name, 
              name_ko,
              birth_year, 
              death_year, 
              nationality,
              nationality_ko,
              bio,
              bio_ko,
              copyright_status,
              follow_count,
              is_featured,
              era,
              images,
              sources
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
              artist.name,
              artist.name, // 한국어 이름은 나중에 업데이트
              artist.birthYear,
              artist.deathYear,
              artist.nationality,
              nationalityKo,
              `Artist from ${artist.source} collection`, // 기본 바이오
              `${artist.source} 컬렉션 작가`, // 한국어 바이오
              copyrightStatus,
              Math.floor(Math.random() * 1000), // 임시 팔로우 수
              false, // is_featured
              null, // era는 나중에 분류
              JSON.stringify({}), // 이미지는 나중에 추가
              JSON.stringify([artist.source])
            ]
          );
          inserted++;
        }

      } catch (error) {
        log.error(`Error processing artist ${artist.name}:`, error.message);
        console.error(error);
        errors++;
      }
    }

    log.info(`Import complete: ${inserted} inserted, ${updated} updated, ${errors} errors`);

    // 통계 출력
    const statsQuery = await pool.query(`
      SELECT 
        copyright_status,
        COUNT(*) as count
      FROM artists
      GROUP BY copyright_status
      ORDER BY count DESC
    `);

    log.info('Artist statistics by copyright status:');
    statsQuery.rows.forEach(row => {
      log.info(`  ${row.copyright_status}: ${row.count} artists`);
    });

    const totalArtists = await pool.query('SELECT COUNT(*) as total FROM artists');
    log.info(`Total artists in database: ${totalArtists.rows[0].total}`);

  } catch (error) {
    log.error('Import failed:', error);
  } finally {
    await pool.end();
  }
}

// 실행
importArtists();
