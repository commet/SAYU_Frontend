#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class NeolookScraper {
  constructor() {
    this.baseUrl = 'https://neolook.com';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
  }

  async scrapeCurrentExhibitions() {
    console.log('🎨 Neolook - 국내 갤러리 전시 정보 수집\n');
    console.log('ℹ️ Neolook: 1970년대부터 운영, UNESCO 인터넷 문화유산');

    try {
      // 현재 전시 페이지
      const url = `${this.baseUrl}/archives`;
      console.log('🔍 전시 목록 페이지 접근...');

      const response = await axios.get(url, { headers: this.headers });
      const $ = cheerio.load(response.data);

      const exhibitions = [];

      // 전시 목록 파싱 (Neolook의 구조에 맞춰 조정 필요)
      $('.exhibition-item, .archive-item, article').each((i, elem) => {
        const $elem = $(elem);

        const exhibition = {
          title_local: $elem.find('.title, h2, h3').first().text().trim(),
          venue_name: $elem.find('.venue, .gallery-name').text().trim(),
          dates: $elem.find('.date, .period').text().trim(),
          artists: $elem.find('.artist').text().trim(),
          url: $elem.find('a').first().attr('href')
        };

        if (exhibition.title_local && exhibition.venue_name) {
          // 날짜 파싱
          const dateMatch = exhibition.dates.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/g);
          if (dateMatch && dateMatch.length >= 2) {
            exhibition.start_date = this.parseKoreanDate(dateMatch[0]);
            exhibition.end_date = this.parseKoreanDate(dateMatch[1]);
          }

          exhibitions.push(exhibition);
        }
      });

      console.log(`✅ ${exhibitions.length}개 전시 발견`);

      // 상세 정보 수집 (선택적)
      for (let i = 0; i < Math.min(exhibitions.length, 10); i++) {
        if (exhibitions[i].url) {
          await this.scrapeExhibitionDetail(exhibitions[i]);
          await this.delay(2000); // 2초 대기
        }
      }

      // 데이터베이스 저장
      await this.saveToDatabase(exhibitions.filter(e => e.start_date && e.end_date));

      return exhibitions;

    } catch (error) {
      console.error('❌ 스크래핑 오류:', error.message);

      if (error.response?.status === 403) {
        console.log('\n⚠️ 접근 차단됨. 대안:');
        console.log('1. 수동 데이터 수집');
        console.log('2. 갤러리 직접 연락');
        console.log('3. RSS 피드 확인');
      }
    }

    return [];
  }

  parseKoreanDate(dateStr) {
    const match = dateStr.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if (match) {
      return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
    }
    return null;
  }

  async scrapeExhibitionDetail(exhibition) {
    try {
      const url = exhibition.url.startsWith('http')
        ? exhibition.url
        : `${this.baseUrl}${exhibition.url}`;

      const response = await axios.get(url, { headers: this.headers });
      const $ = cheerio.load(response.data);

      // 상세 정보 추출
      exhibition.description = $('.description, .content').first().text().trim();
      exhibition.venue_city = '서울'; // 기본값, 실제로는 주소에서 추출

      console.log(`   ✅ 상세 정보: ${exhibition.title_local}`);

    } catch (error) {
      console.log(`   ⚠️ 상세 정보 실패: ${exhibition.title_local}`);
    }
  }

  async saveToDatabase(exhibitions) {
    const client = await pool.connect();
    let saved = 0;

    try {
      await client.query('BEGIN');

      for (const exhibition of exhibitions) {
        // 중복 확인
        const existing = await client.query(
          'SELECT id FROM exhibitions WHERE title_local = $1 AND venue_name = $2 AND start_date = $3',
          [exhibition.title_local, exhibition.venue_name, exhibition.start_date]
        );

        if (existing.rows.length === 0) {
          await client.query(`
            INSERT INTO exhibitions (
              title_local, title_en, venue_name, venue_city, venue_country,
              start_date, end_date, description, artists, source, status, created_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP
            )
          `, [
            exhibition.title_local,
            exhibition.title_en || exhibition.title_local,
            exhibition.venue_name,
            exhibition.venue_city || '서울',
            'KR',
            exhibition.start_date,
            exhibition.end_date,
            exhibition.description,
            exhibition.artists ? [exhibition.artists] : null,
            'neolook_scrape',
            new Date(exhibition.start_date) <= new Date() && new Date(exhibition.end_date) >= new Date()
              ? 'ongoing' : 'upcoming'
          ]);

          saved++;
        }
      }

      await client.query('COMMIT');
      console.log(`\n📊 총 ${saved}개 전시 저장 완료`);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ DB 오류:', error);
    } finally {
      client.release();
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
async function main() {
  const scraper = new NeolookScraper();

  console.log('⚠️ 웹 스크래핑 주의사항:');
  console.log('- robots.txt 준수');
  console.log('- 요청 간격 유지 (2초)');
  console.log('- User-Agent 명시');
  console.log('- 저작권 존중\n');

  await scraper.scrapeCurrentExhibitions();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = NeolookScraper;
