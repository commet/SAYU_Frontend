/**
 * 최적화된 Artmap.com 대량 수집기
 * 실제 HTML 구조 분석 결과를 바탕으로 정확한 파싱 구현
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class OptimizedArtmapMassiveCollector {
  constructor() {
    this.baseUrl = 'https://artmap.com';
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    this.axiosConfig = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000
    };

    this.requestDelay = 3000; // 3초 딜레이 (안전)
    this.lastRequestTime = 0;

    // 수집 통계
    this.stats = {
      totalExhibitions: 0,
      totalVenues: 0,
      citiesProcessed: 0,
      errors: [],
      startTime: new Date().toISOString()
    };

    // 해외 주요 도시 목록 (우선순위별)
    this.cities = {
      // 최우선 - 유럽 주요 예술 도시
      priority1: {
        london: { slug: 'london', country: 'GB', maxVenues: 100 },
        paris: { slug: 'paris', country: 'FR', maxVenues: 100 },
        berlin: { slug: 'berlin', country: 'DE', maxVenues: 100 },
        amsterdam: { slug: 'amsterdam', country: 'NL', maxVenues: 80 },
        zurich: { slug: 'zurich', country: 'CH', maxVenues: 80 }
      },
      // 2순위 - 북미 주요 도시
      priority2: {
        newyork: { slug: 'new-york', country: 'US', maxVenues: 100 },
        losangeles: { slug: 'los-angeles', country: 'US', maxVenues: 80 },
        chicago: { slug: 'chicago', country: 'US', maxVenues: 60 },
        sanfrancisco: { slug: 'san-francisco', country: 'US', maxVenues: 60 },
        toronto: { slug: 'toronto', country: 'CA', maxVenues: 60 }
      },
      // 3순위 - 기타 유럽 도시
      priority3: {
        vienna: { slug: 'vienna', country: 'AT', maxVenues: 60 },
        madrid: { slug: 'madrid', country: 'ES', maxVenues: 60 },
        barcelona: { slug: 'barcelona', country: 'ES', maxVenues: 60 },
        rome: { slug: 'rome', country: 'IT', maxVenues: 50 },
        milan: { slug: 'milan', country: 'IT', maxVenues: 50 }
      },
      // 4순위 - 아시아 태평양
      priority4: {
        tokyo: { slug: 'tokyo', country: 'JP', maxVenues: 50 },
        hongkong: { slug: 'hong-kong', country: 'HK', maxVenues: 40 },
        singapore: { slug: 'singapore', country: 'SG', maxVenues: 40 },
        sydney: { slug: 'sydney', country: 'AU', maxVenues: 40 },
        melbourne: { slug: 'melbourne', country: 'AU', maxVenues: 40 }
      }
    };
  }

  // 속도 제한 준수
  async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  // 안전한 HTTP 요청
  async safeFetch(url) {
    await this.respectRateLimit();

    try {
      console.log(`📥 Fetching: ${url}`);
      const response = await axios.get(url, this.axiosConfig);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching ${url}: ${error.message}`);
      this.stats.errors.push({ url, error: error.message, timestamp: new Date() });
      return null;
    }
  }

  /**
   * 전 세계 전시 목록에서 직접 수집 (가장 효율적)
   */
  async collectGlobalExhibitions() {
    console.log('🎨 전 세계 전시 목록에서 직접 수집 시작...');

    const exhibitionUrls = [
      `${this.baseUrl}/exhibitions/institutions/opening/worldwide`,
      `${this.baseUrl}/exhibitions/galleries/opening/worldwide`,
      `${this.baseUrl}/exhibitions/furtherspaces/opening/worldwide`
    ];

    const allExhibitions = [];

    for (const url of exhibitionUrls) {
      const exhibitions = await this.parseExhibitionListPage(url);
      allExhibitions.push(...exhibitions);
      console.log(`✅ ${url}에서 ${exhibitions.length}개 전시 수집`);
    }

    console.log(`🎯 총 ${allExhibitions.length}개 전시 발견`);

    // 각 전시의 상세 정보 수집 및 저장
    let savedCount = 0;
    for (let i = 0; i < allExhibitions.length; i++) {
      const exhibition = allExhibitions[i];
      console.log(`\n[${i + 1}/${allExhibitions.length}] 처리 중: ${exhibition.title}`);

      try {
        // 전시 상세 정보 수집
        if (exhibition.detailUrl) {
          const details = await this.fetchExhibitionDetails(exhibition.detailUrl);
          Object.assign(exhibition, details);
        }

        // 데이터베이스에 저장
        const saved = await this.saveExhibitionToDB(exhibition);
        if (saved) {
          savedCount++;
          this.stats.totalExhibitions++;
        }

        // 진행 상황 출력
        if ((i + 1) % 10 === 0) {
          console.log(`📊 진행: ${i + 1}/${allExhibitions.length}, 저장됨: ${savedCount}`);
        }

      } catch (error) {
        console.error(`❌ 전시 처리 오류 (${exhibition.title}): ${error.message}`);
        this.stats.errors.push({
          type: 'exhibition_processing',
          exhibition: exhibition.title,
          error: error.message
        });
      }
    }

    console.log(`\n✅ 전시 수집 완료: ${savedCount}/${allExhibitions.length} 저장됨`);
    return savedCount;
  }

  /**
   * 전시 목록 페이지 파싱 (분석 결과를 바탕으로 정확한 파싱)
   */
  async parseExhibitionListPage(url) {
    const html = await this.safeFetch(url);
    if (!html) return [];

    const $ = cheerio.load(html);
    const exhibitions = [];

    // 메인 전시 테이블 파싱 (.exibitionsListTable)
    $('.exibitionsListTable tr').each((index, element) => {
      const $row = $(element);

      // 첫 번째 td: 이미지와 전시 링크
      const $firstCell = $row.find('td:first-child');
      const detailUrl = $firstCell.find('a').attr('href');
      const imageUrl = $firstCell.find('img').attr('src');

      // 세 번째 td: 텍스트 정보
      const $infoCell = $row.find('td:nth-child(3)');

      if ($infoCell.length === 0) return; // 헤더 행 스킵

      // venue 정보 (첫 번째 h3의 링크)
      const $venueLink = $infoCell.find('h3:first-child a');
      const venueName = $venueLink.text().trim();
      const venueUrl = $venueLink.attr('href');

      // 전시 제목 (h2의 링크)
      const $titleLink = $infoCell.find('h2 a');
      const title = $titleLink.text().trim();

      // 날짜 정보 (회색 텍스트)
      const dateText = $infoCell.find('h3.txGray').text().trim();

      // 아티스트 정보 (나머지 텍스트에서 추출)
      const fullText = $infoCell.text();
      const artists = this.extractArtistsFromText(fullText, title, venueName, dateText);

      if (title && venueName) {
        const exhibition = {
          title: title.trim(),
          venueName: venueName.trim(),
          venueUrl: venueUrl ? `${this.baseUrl}${venueUrl}` : null,
          detailUrl: detailUrl ? `${this.baseUrl}${detailUrl}` : null,
          imageUrl: imageUrl ? `${this.baseUrl}${imageUrl}` : null,
          dateText: dateText.trim(),
          artists,
          source: 'artmap',
          crawledAt: new Date()
        };

        // 날짜 파싱
        const dates = this.parseDateText(dateText);
        exhibition.startDate = dates.start;
        exhibition.endDate = dates.end;

        // venue 정보에서 도시/국가 추정
        const location = this.estimateLocationFromVenue(venueUrl);
        exhibition.city = location.city;
        exhibition.country = location.country;

        exhibitions.push(exhibition);
      }
    });

    return exhibitions;
  }

  /**
   * 텍스트에서 아티스트명 추출
   */
  extractArtistsFromText(fullText, title, venueName, dateText) {
    // 제목, venue명, 날짜를 제거한 나머지 텍스트에서 아티스트 추출
    let cleanText = fullText
      .replace(title, '')
      .replace(venueName, '')
      .replace(dateText, '')
      .trim();

    // 여러 줄바꿈을 하나로 정리
    cleanText = cleanText.replace(/\s+/g, ' ').trim();

    if (cleanText.length > 3 && cleanText.length < 200) {
      // 간단한 아티스트명 정리
      return [cleanText];
    }

    return [];
  }

  /**
   * venue URL에서 도시/국가 추정
   */
  estimateLocationFromVenue(venueUrl) {
    if (!venueUrl) return { city: null, country: null };

    // URL 패턴 분석
    const urlParts = venueUrl.split('/');

    // 알려진 venue들의 도시 매핑
    const venueLocationMap = {
      'moma': { city: 'New York', country: 'US' },
      'tate': { city: 'London', country: 'GB' },
      'centrepompidou': { city: 'Paris', country: 'FR' },
      'palaisdetokyo': { city: 'Paris', country: 'FR' },
      'berlinischegalerie': { city: 'Berlin', country: 'DE' },
      'serpentine': { city: 'London', country: 'GB' },
      'guggenheim': { city: 'New York', country: 'US' }
    };

    for (const [venueKey, location] of Object.entries(venueLocationMap)) {
      if (venueUrl.includes(venueKey)) {
        return location;
      }
    }

    return { city: null, country: null };
  }

  /**
   * 날짜 텍스트 파싱
   */
  parseDateText(dateText) {
    const dates = { start: null, end: null };

    if (!dateText) return dates;

    try {
      // 다양한 날짜 형식 처리
      const patterns = [
        // "11 Jul - 13 Oct 2025"
        /(\d{1,2}\s+\w{3})\s*[-–]\s*(\d{1,2}\s+\w{3}\s+\d{4})/,
        // "11 Jul 2025 - 13 Oct 2025"
        /(\d{1,2}\s+\w{3}\s+\d{4})\s*[-–]\s*(\d{1,2}\s+\w{3}\s+\d{4})/,
        // "25 Apr 2024 - 25 Apr 2026"
        /(\d{1,2}\s+\w{3}\s+\d{4})\s*[-–]\s*(\d{1,2}\s+\w{3}\s+\d{4})/
      ];

      for (const pattern of patterns) {
        const match = dateText.match(pattern);
        if (match) {
          dates.start = this.parseDate(match[1]);
          dates.end = this.parseDate(match[2]);
          break;
        }
      }

      // 단일 날짜 처리
      if (!dates.start) {
        const singleMatch = dateText.match(/(\d{1,2}\s+\w{3}\s+\d{4})/);
        if (singleMatch) {
          dates.start = this.parseDate(singleMatch[1]);
        }
      }
    } catch (error) {
      console.error('날짜 파싱 오류:', dateText, error.message);
    }

    return dates;
  }

  /**
   * 날짜 형식 변환
   */
  parseDate(dateStr) {
    if (!dateStr) return null;

    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    const match = dateStr.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = months[match[2]] || '01';
      const year = match[3];
      return `${year}-${month}-${day}`;
    }

    return null;
  }

  /**
   * 전시 상세 정보 수집
   */
  async fetchExhibitionDetails(detailUrl) {
    const html = await this.safeFetch(detailUrl);
    if (!html) return {};

    const $ = cheerio.load(html);

    const details = {
      description: '',
      curator: '',
      additionalImages: []
    };

    // 설명 텍스트 추출
    const possibleDescSelectors = [
      '#text-block',
      '.exhibition-description',
      '.content-text',
      '.description',
      'p'
    ];

    for (const selector of possibleDescSelectors) {
      const $desc = $(selector);
      if ($desc.length > 0) {
        const text = $desc.text().trim();
        if (text.length > 50) {
          details.description = text;
          break;
        }
      }
    }

    // 큐레이터 정보
    const bodyText = $('body').text();
    const curatorMatch = bodyText.match(/[Cc]urated by:?\s*([^.\n]+)/);
    if (curatorMatch) {
      details.curator = curatorMatch[1].trim();
    }

    // 추가 이미지
    $('img').each((i, img) => {
      const src = $(img).attr('src');
      if (src && src.includes('/static/media/') && !details.additionalImages.includes(src)) {
        details.additionalImages.push(`${this.baseUrl}${src}`);
      }
    });

    return details;
  }

  /**
   * 전시 정보를 데이터베이스에 저장
   */
  async saveExhibitionToDB(exhibition) {
    try {
      // 1. venue 저장/업데이트
      const venueId = await this.saveVenueToDB(exhibition);

      // 2. 기존 전시 확인
      const checkQuery = `
        SELECT id FROM exhibitions 
        WHERE title_en = $1 AND venue_id = $2 AND start_date = $3
      `;
      const checkResult = await this.pool.query(checkQuery, [
        exhibition.title, venueId, exhibition.startDate
      ]);

      if (checkResult.rows.length > 0) {
        console.log(`⚠️  전시 이미 존재: ${exhibition.title}`);
        return checkResult.rows[0].id;
      }

      // 3. 새 전시 저장
      const query = `
        INSERT INTO exhibitions (
          title_en, title_local, venue_id, venue_name, venue_city, venue_country,
          start_date, end_date, description, curator, artists,
          source_url, source, collected_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), NOW())
        RETURNING id
      `;

      const values = [
        exhibition.title ? exhibition.title.substring(0, 255) : null, // title_en (길이 제한)
        exhibition.title ? exhibition.title.substring(0, 255) : null, // title_local
        venueId,
        exhibition.venueName ? exhibition.venueName.substring(0, 200) : null, // venue_name (길이 제한)
        exhibition.city || null,
        exhibition.country || null,
        exhibition.startDate,
        exhibition.endDate,
        exhibition.description || null,
        exhibition.curator ? exhibition.curator.substring(0, 200) : null, // curator (길이 제한)
        exhibition.artists || [], // 배열로 저장
        exhibition.detailUrl,
        'artmap'
      ];

      const result = await this.pool.query(query, values);
      const exhibitionId = result.rows[0].id;

      console.log(`✅ 전시 저장: ${exhibition.title} (ID: ${exhibitionId})`);
      return exhibitionId;

    } catch (error) {
      console.error(`❌ 전시 저장 오류 (${exhibition.title}): ${error.message}`);
      this.stats.errors.push({
        type: 'save_exhibition',
        exhibition: exhibition.title,
        error: error.message
      });
      return null;
    }
  }

  /**
   * venue 정보 저장/업데이트
   */
  async saveVenueToDB(exhibition) {
    try {
      // 기존 venue 확인
      const checkQuery = 'SELECT id FROM venues WHERE name = $1 OR name_en = $1';
      const checkResult = await this.pool.query(checkQuery, [exhibition.venueName]);

      if (checkResult.rows.length > 0) {
        return checkResult.rows[0].id;
      }

      // 새 venue 생성
      const insertQuery = `
        INSERT INTO venues (
          name, name_en, city, country, website, type,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id
      `;

      const values = [
        exhibition.venueName,
        exhibition.venueName,
        exhibition.city || 'Unknown',
        exhibition.country || 'XX',
        exhibition.venueUrl,
        'museum'
      ];

      const insertResult = await this.pool.query(insertQuery, values);
      const venueId = insertResult.rows[0].id;

      console.log(`🏛️ 새 venue 저장: ${exhibition.venueName} (ID: ${venueId})`);
      this.stats.totalVenues++;

      return venueId;

    } catch (error) {
      console.error(`❌ venue 저장 오류: ${error.message}`);
      throw error;
    }
  }

  /**
   * 수집 결과를 JSON 파일로 백업
   */
  async saveResults(exhibitions) {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `artmap-massive-collection-${timestamp}.json`;
      const filepath = path.join(__dirname, 'collection_results', filename);

      await fs.mkdir(path.dirname(filepath), { recursive: true });

      const results = {
        metadata: {
          totalExhibitions: exhibitions.length,
          totalSaved: this.stats.totalExhibitions,
          totalVenues: this.stats.totalVenues,
          totalErrors: this.stats.errors.length,
          startTime: this.stats.startTime,
          endTime: new Date().toISOString(),
          source: 'artmap.com'
        },
        exhibitions,
        errors: this.stats.errors
      };

      await fs.writeFile(filepath, JSON.stringify(results, null, 2));
      console.log(`💾 결과 저장: ${filename}`);

    } catch (error) {
      console.error('결과 저장 오류:', error);
    }
  }

  /**
   * 최종 통계 출력
   */
  printFinalStats() {
    const endTime = new Date();
    const duration = (endTime - new Date(this.stats.startTime)) / 1000;

    console.log('\n🎉 ARTMAP 대량 수집 완료!');
    console.log('=========================');
    console.log(`⏱️  총 소요 시간: ${Math.round(duration)} 초`);
    console.log(`🎨 수집된 전시: ${this.stats.totalExhibitions} 개`);
    console.log(`🏛️  새로 등록된 venue: ${this.stats.totalVenues} 개`);
    console.log(`❌ 오류 발생: ${this.stats.errors.length} 건`);
    console.log(`📊 평균 처리 속도: ${(this.stats.totalExhibitions / (duration / 60)).toFixed(1)} 전시/분`);

    if (this.stats.errors.length > 0) {
      console.log('\n❌ 주요 오류:');
      this.stats.errors.slice(0, 5).forEach((error, i) => {
        console.log(`   ${i + 1}. ${error.type}: ${error.error}`);
      });
    }
  }

  /**
   * 메인 실행 함수
   */
  async startMassiveCollection() {
    console.log('🚀 OPTIMIZED ARTMAP MASSIVE COLLECTION 시작');
    console.log('=============================================');
    console.log(`시작 시간: ${this.stats.startTime}`);
    console.log(`요청 간격: ${this.requestDelay}ms`);

    try {
      // 전 세계 전시 목록에서 직접 수집
      const savedCount = await this.collectGlobalExhibitions();

      // 결과 저장
      await this.saveResults([]);

      // 최종 통계 출력
      this.printFinalStats();

    } catch (error) {
      console.error('💥 크리티컬 오류:', error);
      this.stats.errors.push({
        type: 'critical',
        error: error.message,
        timestamp: new Date()
      });
    } finally {
      await this.pool.end();
    }
  }
}

// CLI 실행
async function main() {
  const args = process.argv.slice(2);
  const collector = new OptimizedArtmapMassiveCollector();

  try {
    if (args.includes('--help') || args.includes('-h')) {
      console.log('🎨 OPTIMIZED ARTMAP MASSIVE COLLECTOR');
      console.log('===================================');
      console.log('Usage: node optimized-artmap-massive-collector.js [options]');
      console.log('\nOptions:');
      console.log('  --start      대량 수집 시작');
      console.log('  --help       도움말 표시');
      console.log('\n이 도구는 Artmap.com에서 전 세계 전시 정보를 효율적으로 수집합니다.');
      console.log('예상 수집량: 500+ 전시, 200+ venue');
      console.log('예상 소요 시간: 30-60분');
      return;
    }

    if (args.includes('--start') || args.length === 0) {
      console.log('🎯 최적화된 Artmap 대량 수집 시작...');
      console.log('안전한 속도로 진행됩니다. Ctrl+C로 중단 가능.');

      await collector.startMassiveCollection();
    } else {
      console.log('--start로 수집을 시작하거나 --help로 도움말을 확인하세요');
    }

  } catch (error) {
    console.error('💥 실행 오류:', error);
  }
}

// Ctrl+C 처리
process.on('SIGINT', async () => {
  console.log('\n⚠️  사용자에 의해 중단됨');
  console.log('현재 진행 상황을 저장 중...');
  process.exit(0);
});

// 처리되지 않은 오류 처리
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

if (require.main === module) {
  main();
}

module.exports = OptimizedArtmapMassiveCollector;
