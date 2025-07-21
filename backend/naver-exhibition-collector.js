#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class NaverExhibitionCollector {
  constructor() {
    this.clientId = process.env.NAVER_CLIENT_ID;
    this.clientSecret = process.env.NAVER_CLIENT_SECRET;
    this.baseUrl = 'https://openapi.naver.com/v1/search';
    this.stats = {
      searched: 0,
      found: 0,
      inserted: 0,
      errors: 0
    };
  }

  async collectSeoulExhibitions() {
    console.log('🎨 네이버 API로 서울 실시간 전시정보 수집');
    console.log(`🔑 API 설정: ${this.clientId ? '✓' : '❌'}`);
    
    if (!this.clientId || !this.clientSecret) {
      console.log('❌ 네이버 API 키가 설정되지 않았습니다.');
      return;
    }

    const client = await pool.connect();

    try {
      // 서울 주요 미술관들
      const venues = [
        '국립현대미술관', '리움미술관', '서울시립미술관', 
        '국제갤러리', '갤러리현대', '학고재갤러리',
        '아르코미술관', '성곡미술관', '예술의전당',
        '세종문화회관', '서울대미술관', '홍익대현대미술관'
      ];

      console.log(`\n📋 ${venues.length}개 주요 미술관 전시정보 수집 시작\n`);

      for (const venue of venues) {
        await this.searchVenueExhibitions(venue, client);
        // API 호출 제한 방지
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      await this.showResults(client);

    } catch (error) {
      console.error('❌ 수집 중 오류:', error);
    } finally {
      client.release();
    }
  }

  async searchVenueExhibitions(venueName, client) {
    try {
      this.stats.searched++;
      console.log(`🔍 [${this.stats.searched}] ${venueName} 전시 검색`);

      // 2025년 전시 검색
      const searchQueries = [
        `${venueName} 전시 2025`,
        `${venueName} 전시회 2025`,
        `${venueName} 개인전 2025`,
        `${venueName} 기획전 2025`
      ];

      let allResults = [];

      for (const query of searchQueries) {
        const results = await this.searchNaver(query, 'blog');
        if (results) {
          allResults = allResults.concat(results);
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // 중복 제거 및 최신순 정렬
      const uniqueResults = this.deduplicateResults(allResults);
      
      if (uniqueResults.length > 0) {
        console.log(`   ✅ ${uniqueResults.length}개 결과 발견`);
        this.stats.found += uniqueResults.length;

        // 상위 5개 결과만 처리
        for (let i = 0; i < Math.min(uniqueResults.length, 5); i++) {
          const result = uniqueResults[i];
          await this.processExhibitionResult(result, venueName, client);
        }
      } else {
        console.log(`   ❌ 검색 결과 없음`);
      }

    } catch (error) {
      console.error(`   ❌ ${venueName} 검색 오류:`, error.message);
      this.stats.errors++;
    }
  }

  async searchNaver(query, searchType = 'blog') {
    try {
      const response = await axios.get(`${this.baseUrl}/${searchType}`, {
        params: {
          query,
          display: 10,
          start: 1,
          sort: 'date'
        },
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret
        }
      });

      return response.data.items || [];
    } catch (error) {
      console.error(`   네이버 API 오류 (${query}):`, error.message);
      return null;
    }
  }

  deduplicateResults(results) {
    const seen = new Set();
    return results.filter(result => {
      const key = result.title + result.link;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async processExhibitionResult(result, venueName, client) {
    try {
      // HTML 태그 제거
      const cleanTitle = result.title.replace(/<[^>]*>/g, '');
      const cleanDescription = result.description.replace(/<[^>]*>/g, '');

      // 전시 제목 추출 시도
      const exhibitionTitle = this.extractExhibitionTitle(cleanTitle, venueName);
      
      if (!exhibitionTitle) {
        return; // 전시명을 추출할 수 없으면 스킵
      }

      // 날짜 추출 시도
      const dates = this.extractDates(cleanTitle + ' ' + cleanDescription);
      
      // venue_id 찾기
      const venueResult = await client.query(
        'SELECT id FROM venues WHERE name ILIKE $1 LIMIT 1',
        [`%${venueName}%`]
      );

      const venueId = venueResult.rows[0]?.id;

      // 데이터베이스에 삽입
      await client.query(`
        INSERT INTO exhibitions (
          venue_id, venue_name, venue_city, venue_country,
          title_local, title_en, description, start_date, end_date,
          source, source_url, collected_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT DO NOTHING
      `, [
        venueId,
        venueName,
        '서울',
        'KR',
        exhibitionTitle,
        exhibitionTitle, // title_en도 같은 값으로 설정
        cleanDescription.substring(0, 500),
        dates.startDate,
        dates.endDate,
        'naver_blog',
        result.link
      ]);

      console.log(`     📝 "${exhibitionTitle}" 추가`);
      this.stats.inserted++;

    } catch (error) {
      console.error(`     ❌ 처리 오류:`, error.message);
      this.stats.errors++;
    }
  }

  extractExhibitionTitle(text, venueName) {
    // 일반적인 전시 패턴들
    const patterns = [
      // "OOO 개인전", "OOO 전시"
      /([가-힣a-zA-Z\s]+(?:개인전|기획전|특별전|전시회?|展))/g,
      // 따옴표나 대괄호 안의 제목
      /['"]([^'"]+)['"]|【([^】]+)】|\[([^\]]+)\]/g,
      // 제목: 형태
      /제목[:\s]*([가-힣a-zA-Z\s]+)/g
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const clean = match.replace(/제목[:\s]*/, '').trim();
          if (clean.length > 3 && clean.length < 100 && !clean.includes(venueName)) {
            return clean;
          }
        }
      }
    }

    // 패턴이 안되면 첫 번째 문장에서 추출
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 5);
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      if (firstSentence.length < 80) {
        return firstSentence;
      }
    }

    return null;
  }

  extractDates(text) {
    const today = new Date();
    const defaultEnd = new Date(today);
    defaultEnd.setMonth(today.getMonth() + 3); // 3개월 후

    // 날짜 패턴 찾기
    const datePatterns = [
      /(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g,
      /(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})/g
    ];

    const dates = [];
    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        try {
          let year, month, day;
          if (match[1].length === 4) { // YYYY.MM.DD
            [, year, month, day] = match;
          } else { // MM.DD.YYYY
            [, month, day, year] = match;
          }
          
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (date.getFullYear() >= 2024 && date.getFullYear() <= 2026) {
            dates.push(date);
          }
        } catch (e) {
          // 날짜 파싱 실패 무시
        }
      }
    }

    // 날짜 정렬
    dates.sort((a, b) => a - b);

    return {
      startDate: dates.length > 0 ? dates[0].toISOString().split('T')[0] : today.toISOString().split('T')[0],
      endDate: dates.length > 1 ? dates[dates.length - 1].toISOString().split('T')[0] : defaultEnd.toISOString().split('T')[0]
    };
  }

  async showResults(client) {
    const recentExhibitions = await client.query(`
      SELECT title_local, venue_name, start_date, end_date, source
      FROM exhibitions 
      WHERE source = 'naver_blog' AND collected_at >= NOW() - INTERVAL '1 hour'
      ORDER BY collected_at DESC
      LIMIT 10
    `);

    console.log('\n\n🎉 네이버 API 전시정보 수집 완료!');
    console.log('='.repeat(60));
    console.log(`📊 수집 결과:`);
    console.log(`   검색된 미술관: ${this.stats.searched}개`);
    console.log(`   발견된 결과: ${this.stats.found}개`);
    console.log(`   DB 추가: ${this.stats.inserted}개`);
    console.log(`   오류: ${this.stats.errors}개`);

    if (recentExhibitions.rows.length > 0) {
      console.log('\n🆕 새로 수집된 전시 (최근 1시간):');
      recentExhibitions.rows.forEach((ex, index) => {
        console.log(`${index + 1}. "${ex.title_local}" - ${ex.venue_name}`);
        console.log(`   📅 ${ex.start_date} ~ ${ex.end_date}`);
      });
    }
  }
}

async function main() {
  const collector = new NaverExhibitionCollector();
  
  try {
    await collector.collectSeoulExhibitions();
  } catch (error) {
    console.error('실행 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}