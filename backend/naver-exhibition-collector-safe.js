#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class SafeNaverExhibitionCollector {
  constructor() {
    this.clientId = process.env.NAVER_CLIENT_ID;
    this.clientSecret = process.env.NAVER_CLIENT_SECRET;
    this.headers = {
      'X-Naver-Client-Id': this.clientId,
      'X-Naver-Client-Secret': this.clientSecret
    };
  }

  async collectExhibitions() {
    console.log('🎨 네이버 API를 통한 전시 정보 수집 (법적 준수 버전)');
    console.log('📋 주의사항:');
    console.log('   - 공개된 정보만 수집');
    console.log('   - 이미지는 링크만 저장');
    console.log('   - 출처 명시');
    console.log('   - API 호출 제한 준수\n');

    const venues = await this.getTopVenues();
    const results = {
      total: 0,
      added: 0,
      skipped: 0,
      errors: 0
    };

    for (const venue of venues) {
      console.log(`\n🔍 Searching for: ${venue.name}`);
      
      try {
        // 다양한 검색어로 시도
        const queries = [
          `${venue.name} 전시`,
          `${venue.name} 현재전시`,
          `${venue.name} 기획전`,
          `${venue.name} 2025년`
        ];

        for (const query of queries) {
          const exhibitions = await this.searchExhibitions(query, venue);
          results.total += exhibitions.length;
          
          for (const exhibition of exhibitions) {
            const saved = await this.saveExhibition(exhibition);
            if (saved) {
              results.added++;
            } else {
              results.skipped++;
            }
          }

          // API 호출 간격 (1초)
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Error for ${venue.name}:`, error.message);
        results.errors++;
      }
    }

    console.log('\n📊 수집 완료:');
    console.log(`   검색된 전시: ${results.total}개`);
    console.log(`   저장됨: ${results.added}개`);
    console.log(`   건너뜀: ${results.skipped}개`);
    console.log(`   오류: ${results.errors}개`);

    await this.showStats();
  }

  async getTopVenues() {
    const result = await pool.query(`
      SELECT id, name, city, website
      FROM venues
      WHERE tier = 1 AND country = 'KR' AND is_active = true
      ORDER BY name
      LIMIT 10
    `);
    return result.rows;
  }

  async searchExhibitions(query, venue) {
    try {
      const response = await axios.get('https://openapi.naver.com/v1/search/blog.json', {
        headers: this.headers,
        params: {
          query,
          display: 10,
          sort: 'date'
        }
      });

      const exhibitions = [];
      const items = response.data.items || [];

      for (const item of items) {
        const exhibition = this.parseExhibition(item, venue);
        if (exhibition) {
          exhibitions.push(exhibition);
        }
      }

      return exhibitions;
    } catch (error) {
      console.error('Search error:', error.message);
      return [];
    }
  }

  parseExhibition(item, venue) {
    const text = this.stripHtml(item.title + ' ' + item.description);
    
    // 날짜 패턴 매칭
    const datePattern = /(\d{4})[.\s년]?\s*(\d{1,2})[.\s월]?\s*(\d{1,2})[일]?\s*[-~]\s*(\d{4})?[.\s년]?\s*(\d{1,2})[.\s월]?\s*(\d{1,2})[일]?/;
    const dateMatch = text.match(datePattern);
    
    if (!dateMatch) return null;

    // 제목 추출 시도
    let title = null;
    const titlePatterns = [
      /『(.+?)』/,
      /「(.+?)」/,
      /<(.+?)>/,
      /\[(.+?)\]/,
      /전시\s*[:：]\s*(.+?)(?=\s|$)/
    ];

    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match) {
        title = match[1].trim();
        break;
      }
    }

    if (!title) {
      // 기본 제목 생성
      title = `${venue.name} 전시`;
    }

    // 날짜 파싱
    const startYear = dateMatch[1];
    const startMonth = dateMatch[2].padStart(2, '0');
    const startDay = dateMatch[3].padStart(2, '0');
    const endYear = dateMatch[4] || startYear;
    const endMonth = dateMatch[5].padStart(2, '0');
    const endDay = dateMatch[6].padStart(2, '0');

    return {
      title_local: title,
      title_en: title, // 영문 제목은 추후 번역 API 사용
      venue_id: venue.id,
      venue_name: venue.name,
      venue_city: venue.city,
      start_date: `${startYear}-${startMonth}-${startDay}`,
      end_date: `${endYear}-${endMonth}-${endDay}`,
      description: item.description.substring(0, 500),
      source: 'naver_blog',
      source_url: item.link,
      official_url: venue.website
    };
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>?/gm, '').replace(/&[^;]+;/g, ' ');
  }

  async saveExhibition(exhibition) {
    const client = await pool.connect();
    
    try {
      // 중복 확인
      const existing = await client.query(
        'SELECT id FROM exhibitions WHERE title_local = $1 AND venue_id = $2 AND start_date = $3',
        [exhibition.title_local, exhibition.venue_id, exhibition.start_date]
      );

      if (existing.rows.length > 0) {
        return false; // 이미 존재
      }

      // 상태 결정
      const now = new Date();
      const start = new Date(exhibition.start_date);
      const end = new Date(exhibition.end_date);
      
      let status;
      if (now < start) status = 'upcoming';
      else if (now > end) status = 'past';
      else status = 'current';

      // 전시 저장
      const exhibitionId = uuidv4();
      await client.query(`
        INSERT INTO exhibitions (
          id, title_en, title_local, venue_id, venue_name, venue_city, venue_country,
          start_date, end_date, status, description,
          source, source_url, official_url,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          NOW(), NOW()
        )
      `, [
        exhibitionId,
        exhibition.title_en,
        exhibition.title_local,
        exhibition.venue_id,
        exhibition.venue_name,
        exhibition.venue_city,
        'KR',
        exhibition.start_date,
        exhibition.end_date,
        status,
        exhibition.description,
        exhibition.source,
        exhibition.source_url,
        exhibition.official_url
      ]);

      console.log(`✅ Saved: ${exhibition.title_local} (${exhibition.start_date})`);
      return true;

    } catch (error) {
      console.error(`Error saving exhibition:`, error.message);
      return false;
    } finally {
      client.release();
    }
  }

  async showStats() {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'current' THEN 1 END) as current,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
        COUNT(CASE WHEN status = 'past' THEN 1 END) as past,
        COUNT(CASE WHEN source LIKE 'naver%' THEN 1 END) as from_naver
      FROM exhibitions
    `);

    const venueStats = await pool.query(`
      SELECT venue_name, COUNT(*) as count
      FROM exhibitions
      WHERE source LIKE 'naver%'
      GROUP BY venue_name
      ORDER BY count DESC
      LIMIT 5
    `);

    console.log('\n📈 전체 전시 통계:');
    console.log(`   총 전시: ${stats.rows[0].total}개`);
    console.log(`   진행중: ${stats.rows[0].current}개`);
    console.log(`   예정: ${stats.rows[0].upcoming}개`);
    console.log(`   종료: ${stats.rows[0].past}개`);
    console.log(`   네이버 수집: ${stats.rows[0].from_naver}개`);

    console.log('\n🏛️  네이버 수집 상위 미술관:');
    venueStats.rows.forEach((venue, index) => {
      console.log(`   ${index + 1}. ${venue.venue_name}: ${venue.count}개`);
    });

    console.log('\n✅ 모든 수집은 법적/윤리적 기준을 준수했습니다.');
    console.log('📱 수집된 정보는 출처와 함께 제공됩니다.');
  }
}

async function main() {
  const collector = new SafeNaverExhibitionCollector();
  
  try {
    await collector.collectExhibitions();
  } catch (error) {
    console.error('Collection failed:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = SafeNaverExhibitionCollector;