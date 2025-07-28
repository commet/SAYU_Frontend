const axios = require('axios');
const { pool } = require('../config/database');
const { log } = require('../config/logger');

class ExhibitionDataCollectorService {
  constructor() {
    this.sources = [
      {
        name: 'National Museum of Modern and Contemporary Art',
        baseUrl: 'https://www.mmca.go.kr',
        type: 'scraping', // API가 없으므로 스크래핑 필요
        enabled: false // 실제 구현 시 활성화
      },
      {
        name: 'Seoul Museum of Art',
        baseUrl: 'https://sema.seoul.go.kr',
        type: 'scraping',
        enabled: false
      },
      {
        name: 'Leeum Museum',
        baseUrl: 'https://www.leeum.org',
        type: 'scraping',
        enabled: false
      }
    ];

    // 예시 전시 데이터 (실제 구현 시 실제 API/스크래핑으로 교체)
    this.mockExhibitions = [
      {
        title: '한국 현대미술의 흐름',
        venue_name: '국립현대미술관',
        venue_city: '서울',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-03-31'),
        description: '1960년대부터 현재까지 한국 현대미술의 주요 흐름을 살펴보는 기획전시',
        artists: ['이중섭', '박수근', '김환기', '이우환'],
        admission_fee: 3000,
        source_url: 'https://www.mmca.go.kr/exhibitions/exhibitionsDetail.do',
        contact_info: '02-2188-6000',
        tags: ['현대미술', '한국미술', '기획전'],
        poster_image: 'https://example.com/poster1.jpg'
      },
      {
        title: '디지털 아트의 미래',
        venue_name: '서울시립미술관',
        venue_city: '서울',
        start_date: new Date('2025-02-01'),
        end_date: new Date('2025-04-30'),
        description: 'AI와 디지털 기술이 만나는 새로운 예술의 가능성을 탐구',
        artists: ['테크놀로지 아티스트 그룹', '디지털 크리에이터들'],
        admission_fee: 5000,
        source_url: 'https://sema.seoul.go.kr/exhibitions',
        contact_info: '02-2124-8800',
        tags: ['디지털아트', 'AI', '미래', '기술'],
        poster_image: 'https://example.com/poster2.jpg'
      },
      {
        title: '조선 백자의 아름다움',
        venue_name: '리움미술관',
        venue_city: '서울',
        start_date: new Date('2025-01-15'),
        end_date: new Date('2025-05-15'),
        description: '조선시대 백자의 순수한 아름다움과 장인정신을 재조명',
        artists: ['조선시대 도공들'],
        admission_fee: 20000,
        source_url: 'https://www.leeum.org/exhibitions',
        contact_info: '02-2014-6901',
        tags: ['전통미술', '백자', '조선', '도자기'],
        poster_image: 'https://example.com/poster3.jpg'
      },
      {
        title: '현대 조각의 새로운 시각',
        venue_name: 'OCI미술관',
        venue_city: '서울',
        start_date: new Date('2025-02-15'),
        end_date: new Date('2025-06-15'),
        description: '현대 조각가들의 혁신적인 작품들을 통해 보는 새로운 조각의 언어',
        artists: ['박은선', '정현', '최정화', '김수자'],
        admission_fee: 8000,
        source_url: 'https://www.ocimuseum.org',
        contact_info: '02-734-0440',
        tags: ['조각', '현대미술', '설치미술'],
        poster_image: 'https://example.com/poster4.jpg'
      },
      {
        title: '인상주의 거장들',
        venue_name: '예술의전당 한가람미술관',
        venue_city: '서울',
        start_date: new Date('2025-03-01'),
        end_date: new Date('2025-07-31'),
        description: '모네, 르누아르, 드가 등 인상주의 거장들의 작품 전시',
        artists: ['클로드 모네', '피에르 오귀스트 르누아르', '에드가 드가'],
        admission_fee: 25000,
        source_url: 'https://www.sac.or.kr',
        contact_info: '02-580-1300',
        tags: ['인상주의', '서양미술', '고전'],
        poster_image: 'https://example.com/poster5.jpg'
      }
    ];
  }

  // 모든 소스에서 전시 데이터 수집
  async collectAllExhibitions() {
    const results = {
      collected: 0,
      failed: 0,
      sources: [],
      errors: []
    };

    log.info('Starting exhibition data collection...');

    // 실제 구현에서는 각 소스별로 데이터 수집
    for (const source of this.sources) {
      if (!source.enabled) {
        log.info(`Skipping disabled source: ${source.name}`);
        continue;
      }

      try {
        const exhibitions = await this.collectFromSource(source);
        const imported = await this.importExhibitions(exhibitions, source.name);

        results.collected += imported.success;
        results.failed += imported.failed;
        results.sources.push({
          name: source.name,
          collected: imported.success,
          failed: imported.failed
        });

      } catch (error) {
        log.error(`Failed to collect from ${source.name}:`, error);
        results.errors.push({
          source: source.name,
          error: error.message
        });
        results.failed++;
      }
    }

    // Mock 데이터 추가 (실제 구현에서는 제거)
    const mockImported = await this.importExhibitions(this.mockExhibitions, 'Mock Data');
    results.collected += mockImported.success;
    results.failed += mockImported.failed;
    results.sources.push({
      name: 'Mock Data',
      collected: mockImported.success,
      failed: mockImported.failed
    });

    log.info(`Exhibition collection completed. Collected: ${results.collected}, Failed: ${results.failed}`);
    return results;
  }

  // 특정 소스에서 데이터 수집 (실제 구현 시 각 소스별로 구현)
  async collectFromSource(source) {
    // 실제 구현에서는 각 소스의 API나 스크래핑 로직 구현
    // 현재는 빈 배열 반환
    return [];
  }

  // 수집된 전시 데이터를 데이터베이스에 임포트
  async importExhibitions(exhibitions, sourceName) {
    const results = { success: 0, failed: 0, errors: [] };

    for (const exhibition of exhibitions) {
      try {
        await this.importSingleExhibition(exhibition, sourceName);
        results.success++;
      } catch (error) {
        log.error(`Failed to import exhibition "${exhibition.title}":`, error);
        results.failed++;
        results.errors.push({
          title: exhibition.title,
          error: error.message
        });
      }
    }

    return results;
  }

  // 단일 전시 임포트
  async importSingleExhibition(exhibitionData, sourceName) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 기존 전시 확인 (중복 방지)
      const existingExhibition = await client.query(
        'SELECT id FROM exhibitions WHERE title = $1 AND venue_name = $2 AND start_date = $3',
        [exhibitionData.title, exhibitionData.venue_name, exhibitionData.start_date]
      );

      if (existingExhibition.rows.length > 0) {
        await client.query('ROLLBACK');
        return { skipped: true, reason: 'Already exists' };
      }

      // 장소 정보 찾기 또는 생성
      const venue = await client.query(
        'SELECT id FROM venues WHERE name = $1',
        [exhibitionData.venue_name]
      );

      let venueId;
      if (venue.rows.length === 0) {
        // 새 장소 생성
        const newVenue = await client.query(`
          INSERT INTO venues (name, city, country, type, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING id
        `, [
          exhibitionData.venue_name,
          exhibitionData.venue_city || '서울',
          'KR',
          'gallery'
        ]);
        venueId = newVenue.rows[0].id;
      } else {
        venueId = venue.rows[0].id;
      }

      // 전시 상태 결정
      const now = new Date();
      const startDate = new Date(exhibitionData.start_date);
      const endDate = new Date(exhibitionData.end_date);

      let status;
      if (now < startDate) {
        status = 'upcoming';
      } else if (now >= startDate && now <= endDate) {
        status = 'ongoing';
      } else {
        status = 'ended';
      }

      // 전시 데이터 삽입
      const exhibitionResult = await client.query(`
        INSERT INTO exhibitions (
          title, description, venue_id, venue_name, venue_city, venue_country,
          start_date, end_date, admission_fee, source_url, contact_info,
          poster_image, status, source, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING id
      `, [
        exhibitionData.title,
        exhibitionData.description,
        venueId,
        exhibitionData.venue_name,
        exhibitionData.venue_city || '서울',
        'KR',
        exhibitionData.start_date,
        exhibitionData.end_date,
        exhibitionData.admission_fee || 0,
        exhibitionData.source_url,
        exhibitionData.contact_info,
        exhibitionData.poster_image,
        status,
        sourceName
      ]);

      const exhibitionId = exhibitionResult.rows[0].id;

      // 태그 처리 (있는 경우)
      if (exhibitionData.tags && Array.isArray(exhibitionData.tags)) {
        for (const tag of exhibitionData.tags) {
          await client.query(`
            INSERT INTO exhibition_tags (exhibition_id, tag)
            VALUES ($1, $2)
            ON CONFLICT (exhibition_id, tag) DO NOTHING
          `, [exhibitionId, tag]);
        }
      }

      // 작가 정보 처리 (있는 경우)
      if (exhibitionData.artists && Array.isArray(exhibitionData.artists)) {
        for (const artistName of exhibitionData.artists) {
          // 작가 찾기 또는 생성
          const artist = await client.query(
            'SELECT id FROM artists WHERE name = $1',
            [artistName]
          );

          let artistId;
          if (artist.rows.length === 0) {
            const newArtist = await client.query(`
              INSERT INTO artists (name, nationality, source, created_at, updated_at)
              VALUES ($1, $2, $3, NOW(), NOW())
              RETURNING id
            `, [artistName, 'Unknown', sourceName]);
            artistId = newArtist.rows[0].id;
          } else {
            artistId = artist.rows[0].id;
          }

          // 전시-작가 연결
          await client.query(`
            INSERT INTO exhibition_artists (exhibition_id, artist_id)
            VALUES ($1, $2)
            ON CONFLICT (exhibition_id, artist_id) DO NOTHING
          `, [exhibitionId, artistId]);
        }
      }

      await client.query('COMMIT');

      log.info(`Successfully imported exhibition: ${exhibitionData.title}`);
      return { success: true, exhibitionId };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 전시 상태 업데이트 (진행중 -> 종료 등)
  async updateExhibitionStatuses() {
    const now = new Date();

    try {
      // 상태 업데이트
      const updateResults = await pool.query(`
        UPDATE exhibitions 
        SET status = CASE
          WHEN start_date > $1 THEN 'upcoming'
          WHEN start_date <= $1 AND end_date >= $1 THEN 'ongoing'
          WHEN end_date < $1 THEN 'ended'
        END,
        updated_at = NOW()
        WHERE status != CASE
          WHEN start_date > $1 THEN 'upcoming'
          WHEN start_date <= $1 AND end_date >= $1 THEN 'ongoing'
          WHEN end_date < $1 THEN 'ended'
        END
        RETURNING id, title, status
      `, [now]);

      log.info(`Updated ${updateResults.rowCount} exhibition statuses`);
      return { updated: updateResults.rowCount, exhibitions: updateResults.rows };

    } catch (error) {
      log.error('Failed to update exhibition statuses:', error);
      throw error;
    }
  }

  // 전시 통계 조회
  async getCollectionStats() {
    try {
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total_exhibitions,
          COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as ongoing,
          COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
          COUNT(CASE WHEN status = 'ended' THEN 1 END) as ended,
          COUNT(DISTINCT venue_name) as unique_venues,
          COUNT(DISTINCT source) as sources_used,
          MAX(created_at) as last_imported
        FROM exhibitions
      `);

      const cityStats = await pool.query(`
        SELECT venue_city, COUNT(*) as count
        FROM exhibitions
        GROUP BY venue_city
        ORDER BY count DESC
        LIMIT 10
      `);

      return {
        overview: stats.rows[0],
        by_city: cityStats.rows
      };

    } catch (error) {
      log.error('Failed to get collection stats:', error);
      throw error;
    }
  }

  // 수동 전시 추가 (사용자 제출용)
  async addManualExhibition(exhibitionData, submitterId) {
    try {
      const enhancedData = {
        ...exhibitionData,
        source: 'user_submission',
        submitter_id: submitterId
      };

      const result = await this.importSingleExhibition(enhancedData, 'user_submission');
      return result;

    } catch (error) {
      log.error('Failed to add manual exhibition:', error);
      throw error;
    }
  }
}

module.exports = new ExhibitionDataCollectorService();
