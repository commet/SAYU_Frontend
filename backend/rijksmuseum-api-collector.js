#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Rijksmuseum API Key (무료 등록 필요)
const API_KEY = process.env.RIJKSMUSEUM_API_KEY || 'fakekey';

class RijksmuseumCollector {
  constructor() {
    this.baseUrl = 'https://www.rijksmuseum.nl/api';
    this.language = 'en'; // en, nl 지원
  }

  async searchExhibitions() {
    console.log('🏛️ Rijksmuseum API - 전시 데이터 수집 시작\n');

    try {
      // 1. 현재 전시중인 작품 검색
      console.log('🔍 현재 전시중인 작품 검색...');
      const params = {
        key: API_KEY,
        format: 'json',
        culture: this.language,
        imgonly: true,
        toppieces: true, // 주요 작품만
        ps: 100 // 페이지당 100개
      };

      const response = await axios.get(`${this.baseUrl}/${this.language}/collection`, { params });

      if (response.data && response.data.artObjects) {
        console.log(`✅ ${response.data.artObjects.length}개 작품 발견`);

        // 전시 데이터로 변환
        const exhibitions = this.convertToExhibitions(response.data.artObjects);

        // 데이터베이스 저장
        await this.saveToDatabase(exhibitions);

        return exhibitions;
      }
    } catch (error) {
      console.error('❌ API 오류:', error.message);

      if (error.response?.status === 401) {
        console.log('\n⚠️ API 키 필요:');
        console.log('1. https://data.rijksmuseum.nl/object-metadata/api/ 방문');
        console.log('2. 무료 계정 등록');
        console.log('3. API 키 발급 (즉시 사용 가능)');
        console.log('4. 환경변수 설정: RIJKSMUSEUM_API_KEY=your_key');
      }
    }

    return [];
  }

  convertToExhibitions(artObjects) {
    const exhibitions = [];

    // 주제별로 그룹화하여 가상 전시 생성
    const themes = new Map();

    artObjects.forEach(obj => {
      const theme = obj.classification || 'General Collection';

      if (!themes.has(theme)) {
        themes.set(theme, {
          title: `${theme} Collection`,
          artworks: []
        });
      }

      themes.get(theme).artworks.push(obj);
    });

    // 각 테마를 전시로 변환
    themes.forEach((data, theme) => {
      exhibitions.push({
        title_en: data.title,
        title_local: data.title,
        venue_name: 'Rijksmuseum',
        venue_city: 'Amsterdam',
        venue_country: 'NL',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6개월
        description: `Featuring ${data.artworks.length} masterpieces from the ${theme} collection`,
        artists: [...new Set(data.artworks.map(a => a.principalOrFirstMaker).filter(a => a))],
        exhibition_type: 'collection',
        artworks_count: data.artworks.length,
        official_url: 'https://www.rijksmuseum.nl',
        source: 'rijksmuseum_api'
      });
    });

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
          'SELECT id FROM exhibitions WHERE title_en = $1 AND venue_name = $2 AND source = $3',
          [exhibition.title_en, exhibition.venue_name, exhibition.source]
        );

        if (existing.rows.length === 0) {
          await client.query(`
            INSERT INTO exhibitions (
              title_en, title_local, venue_name, venue_city, venue_country,
              start_date, end_date, description, artists, exhibition_type,
              artworks_count, official_url, source, status, created_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'ongoing', CURRENT_TIMESTAMP
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
            exhibition.artists,
            exhibition.exhibition_type,
            exhibition.artworks_count,
            exhibition.official_url,
            exhibition.source
          ]);

          saved++;
          console.log(`✅ 저장: ${exhibition.title_en}`);
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
  const collector = new RijksmuseumCollector();
  await collector.searchExhibitions();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = RijksmuseumCollector;
