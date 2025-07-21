#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Harvard Art Museums API (무료 등록 필요)
const API_KEY = process.env.HARVARD_API_KEY || '96a5e5e0-4b7a-4f8d-b7f0-8f3f3f3f3f3f';

class HarvardMuseumsCollector {
  constructor() {
    this.baseUrl = 'https://api.harvardartmuseums.org';
  }

  async collectExhibitions() {
    console.log('🏛️ Harvard Art Museums API - 전시 데이터 수집\n');

    try {
      // 1. 현재 및 예정 전시 가져오기
      console.log('🔍 전시 정보 조회...');
      
      const params = {
        apikey: API_KEY,
        status: 'current|upcoming',
        size: 100,
        sort: 'temporalorder:desc'
      };

      const response = await axios.get(`${this.baseUrl}/exhibition`, { params });
      
      if (response.data && response.data.records) {
        console.log(`✅ ${response.data.records.length}개 전시 발견`);
        
        const exhibitions = await this.processExhibitions(response.data.records);
        await this.saveToDatabase(exhibitions);
        
        return exhibitions;
      }
    } catch (error) {
      console.error('❌ API 오류:', error.message);
      
      if (error.response?.status === 401) {
        console.log('\n⚠️ API 키 필요:');
        console.log('1. https://www.harvardartmuseums.org/collections/api 방문');
        console.log('2. 무료 계정 등록');
        console.log('3. API 키 즉시 발급');
        console.log('4. 일일 2,500 요청 제한');
      }
    }
    
    return [];
  }

  async processExhibitions(records) {
    const exhibitions = [];
    
    for (const record of records) {
      // 상세 정보 가져오기
      try {
        const detailResponse = await axios.get(
          `${this.baseUrl}/exhibition/${record.id}`,
          { params: { apikey: API_KEY } }
        );
        
        const detail = detailResponse.data;
        
        exhibitions.push({
          title_en: detail.title || record.title,
          title_local: detail.title,
          venue_name: detail.venues?.[0]?.name || 'Harvard Art Museums',
          venue_city: 'Cambridge',
          venue_country: 'US',
          start_date: detail.begindate || detail.temporalorder,
          end_date: detail.enddate,
          description: detail.description || detail.shortdescription,
          exhibition_type: 'special',
          official_url: detail.url || `https://www.harvardartmuseums.org/exhibitions/${detail.id}`,
          source: 'harvard_api',
          galleries: detail.galleries?.map(g => g.name),
          view_count: detail.objectcount || 0
        });
        
        console.log(`✅ 처리됨: ${detail.title}`);
        
      } catch (err) {
        console.log(`⚠️ 상세 정보 실패: ${record.title}`);
      }
    }
    
    return exhibitions;
  }

  async saveToDatabase(exhibitions) {
    const client = await pool.connect();
    let saved = 0;

    try {
      await client.query('BEGIN');

      for (const exhibition of exhibitions) {
        // 중복 확인
        const existing = await client.query(
          'SELECT id FROM exhibitions WHERE title_en = $1 AND venue_name = $2 AND start_date = $3',
          [exhibition.title_en, exhibition.venue_name, exhibition.start_date]
        );

        if (existing.rows.length === 0) {
          await client.query(`
            INSERT INTO exhibitions (
              title_en, title_local, venue_name, venue_city, venue_country,
              start_date, end_date, description, exhibition_type,
              official_url, source, status, view_count, created_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP
            )
          `, [
            exhibition.title_en,
            exhibition.title_local,
            exhibition.venue_name,
            exhibition.venue_city,
            exhibition.venue_country,
            exhibition.start_date,
            exhibition.end_date,
            exhibition.description,
            exhibition.exhibition_type,
            exhibition.official_url,
            exhibition.source,
            new Date(exhibition.start_date) <= new Date() ? 'ongoing' : 'upcoming',
            exhibition.view_count
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
}

// 실행
async function main() {
  const collector = new HarvardMuseumsCollector();
  await collector.collectExhibitions();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = HarvardMuseumsCollector;