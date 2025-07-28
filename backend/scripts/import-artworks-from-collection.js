const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require('../src/config/database');
const { log } = require('../src/config/logger');

// 작품 연도 추출
function extractYears(dateString) {
  if (!dateString) return { yearStart: null, yearEnd: null };

  // 패턴: "1889", "c. 1850-1860", "1850–1860" 등
  const singleYear = dateString.match(/\b(\d{4})\b/);
  const yearRange = dateString.match(/(\d{4})[–\-](\d{4})/);

  if (yearRange) {
    return {
      yearStart: parseInt(yearRange[1]),
      yearEnd: parseInt(yearRange[2])
    };
  } else if (singleYear) {
    const year = parseInt(singleYear[1]);
    return {
      yearStart: year,
      yearEnd: year
    };
  }

  return { yearStart: null, yearEnd: null };
}

// 작가 이름에서 주요 작가 추출
function extractPrimaryArtist(artistString) {
  if (!artistString || artistString === 'Unknown') return null;

  // 첫 번째 작가 이름만 추출 (괄호 앞까지)
  const match = artistString.match(/^([^(\n]+)/);
  return match ? match[1].trim() : artistString.trim();
}

async function importArtworks() {
  const client = await pool.connect();

  try {
    // JSON 파일 읽기
    const collectionPath = path.join(__dirname, '../../met-crawler/met-artworks-data/maximized-collection-2025-07-17T11-22-19-710Z.json');
    const artworksData = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

    log.info(`Found ${artworksData.artworks.length} artworks to process`);

    await client.query('BEGIN');

    let inserted = 0;
    let linked = 0;
    let errors = 0;

    // 배치 처리를 위한 배열
    const batchSize = 100;

    for (let i = 0; i < artworksData.artworks.length; i += batchSize) {
      const batch = artworksData.artworks.slice(i, i + batchSize);

      for (const artwork of batch) {
        try {
          // 작품 정보 추출
          const years = extractYears(artwork.date);
          const primaryArtistName = extractPrimaryArtist(artwork.artist);

          // 작품 삽입
          const artworkResult = await client.query(
            `INSERT INTO artworks (
              object_id,
              title,
              date_display,
              year_start,
              year_end,
              medium,
              dimensions,
              credit_line,
              department,
              classification,
              image_url,
              thumbnail_url,
              cloudinary_url,
              source,
              source_url,
              is_public_domain
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            ON CONFLICT (object_id) DO UPDATE SET
              cloudinary_url = EXCLUDED.cloudinary_url,
              updated_at = CURRENT_TIMESTAMP
            RETURNING id`,
            [
              artwork.objectID || `${artwork.source}_${artwork.id}`,
              artwork.title,
              artwork.date,
              years.yearStart,
              years.yearEnd,
              artwork.medium,
              artwork.dimensions,
              artwork.creditLine,
              artwork.department,
              artwork.classification || artwork.objectName,
              artwork.primaryImage || artwork.image_url,
              artwork.primaryImageSmall || artwork.thumbnail_url,
              artwork.cloudinary_url,
              artwork.source,
              artwork.objectURL || artwork.url,
              artwork.isPublicDomain !== false
            ]
          );

          inserted++;

          // 작가와 연결
          if (primaryArtistName) {
            // 작가 찾기
            const artistResult = await client.query(
              'SELECT id FROM artists WHERE LOWER(name) LIKE LOWER($1) LIMIT 1',
              [`%${primaryArtistName}%`]
            );

            if (artistResult.rows.length > 0) {
              // 작품-작가 연결
              await client.query(
                `INSERT INTO artwork_artists (artwork_id, artist_id, role, is_primary)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (artwork_id, artist_id, role) DO NOTHING`,
                [
                  artworkResult.rows[0].id,
                  artistResult.rows[0].id,
                  'artist',
                  true
                ]
              );
              linked++;
            }
          }

        } catch (error) {
          errors++;
          if (errors % 100 === 0) {
            log.error(`Error processing artwork: ${error.message}`);
          }
        }
      }

      // 진행 상황 로그
      if (i % 500 === 0) {
        log.info(`Progress: ${i}/${artworksData.artworks.length} artworks processed`);
      }
    }

    await client.query('COMMIT');

    log.info(`Import complete: ${inserted} artworks inserted, ${linked} artist links created, ${errors} errors`);

    // 통계 출력
    const stats = await client.query(`
      SELECT 
        COUNT(DISTINCT a.id) as total_artworks,
        COUNT(DISTINCT aa.artist_id) as linked_artists,
        COUNT(DISTINCT a.source) as sources
      FROM artworks a
      LEFT JOIN artwork_artists aa ON a.id = aa.artwork_id
    `);

    log.info('Final statistics:', stats.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    log.error('Import failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  importArtworks();
}
