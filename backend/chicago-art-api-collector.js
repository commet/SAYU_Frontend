#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class ChicagoArtAPICollector {
  constructor() {
    this.baseUrl = 'https://api.artic.edu/api/v1';
    this.imageBaseUrl = 'https://www.artic.edu/iiif/2';
  }

  async collectExhibitions() {
    console.log('🎨 Art Institute of Chicago API - 전시 데이터 수집\n');
    console.log('✅ 인증 불필요 - 완전 오픈 API');

    try {
      // 1. 전시 목록 가져오기
      console.log('📍 전시 정보 조회...');
      const exhibitionsResponse = await axios.get(`${this.baseUrl}/exhibitions`, {
        params: {
          limit: 50,
          fields: 'id,title,short_description,web_url,image_id,aic_start_at,aic_end_at,status'
        }
      });

      if (exhibitionsResponse.data && exhibitionsResponse.data.data) {
        const exhibitions = exhibitionsResponse.data.data;
        console.log(`✅ ${exhibitions.length}개 전시 발견\n`);

        // 현재 진행중인 전시 필터링
        const currentExhibitions = exhibitions.filter(ex => {
          const now = new Date();
          const start = ex.aic_start_at ? new Date(ex.aic_start_at) : null;
          const end = ex.aic_end_at ? new Date(ex.aic_end_at) : null;

          return start && end && start <= now && end >= now;
        });

        console.log(`🏃 현재 진행중: ${currentExhibitions.length}개`);
        console.log(`📅 예정/종료: ${exhibitions.length - currentExhibitions.length}개\n`);

        // 상세 정보 수집
        const detailedExhibitions = [];
        for (const exhibition of exhibitions.slice(0, 20)) { // 처음 20개만
          const detail = await this.getExhibitionDetail(exhibition.id);
          if (detail) {
            detailedExhibitions.push(detail);
          }
          await this.delay(500); // API 제한 고려
        }

        // 데이터베이스 저장
        await this.saveToDatabase(detailedExhibitions);

        // 갤러리 정보도 수집
        await this.collectGalleries();

        return detailedExhibitions;
      }
    } catch (error) {
      console.error('❌ API 오류:', error.message);
    }

    return [];
  }

  async getExhibitionDetail(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/exhibitions/${id}`);
      const { data } = response.data;

      console.log(`✅ 상세 정보: ${data.title}`);

      return {
        title_en: data.title,
        title_local: data.title,
        venue_name: 'Art Institute of Chicago',
        venue_city: 'Chicago',
        venue_country: 'US',
        start_date: data.aic_start_at ? data.aic_start_at.split('T')[0] : null,
        end_date: data.aic_end_at ? data.aic_end_at.split('T')[0] : null,
        description: data.short_description || data.description,
        official_url: data.web_url,
        image_url: data.image_id ? `${this.imageBaseUrl}/${data.image_id}/full/843,/0/default.jpg` : null,
        status: data.status,
        source: 'chicago_art_api'
      };
    } catch (error) {
      console.log(`⚠️ 상세 정보 실패: ID ${id}`);
      return null;
    }
  }

  async collectGalleries() {
    console.log('\n📍 갤러리별 현재 전시 작품 조회...');

    try {
      // 갤러리 목록
      const galleriesResponse = await axios.get(`${this.baseUrl}/galleries`, {
        params: {
          limit: 10,
          fields: 'id,title,number,floor,latitude,longitude,is_closed'
        }
      });

      if (galleriesResponse.data && galleriesResponse.data.data) {
        const openGalleries = galleriesResponse.data.data.filter(g => !g.is_closed);
        console.log(`✅ 개방 갤러리: ${openGalleries.length}개`);

        for (const gallery of openGalleries.slice(0, 5)) {
          console.log(`   - ${gallery.title} (${gallery.floor}층, Gallery ${gallery.number})`);
        }
      }
    } catch (error) {
      console.log('⚠️ 갤러리 정보 조회 실패');
    }
  }

  async saveToDatabase(exhibitions) {
    const client = await pool.connect();
    let saved = 0;

    try {
      await client.query('BEGIN');

      for (const exhibition of exhibitions) {
        if (!exhibition.start_date || !exhibition.end_date) continue;

        // 중복 확인
        const existing = await client.query(
          'SELECT id FROM exhibitions WHERE title_en = $1 AND venue_name = $2 AND start_date = $3',
          [exhibition.title_en, exhibition.venue_name, exhibition.start_date]
        );

        if (existing.rows.length === 0) {
          await client.query(`
            INSERT INTO exhibitions (
              title_en, title_local, venue_name, venue_city, venue_country,
              start_date, end_date, description, official_url, source,
              status, created_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP
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
            exhibition.official_url,
            exhibition.source,
            exhibition.status || 'ongoing'
          ]);

          saved++;
        }
      }

      await client.query('COMMIT');
      console.log(`\n💾 ${saved}개 전시 저장 완료`);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ DB 오류:', error.message);
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
  const collector = new ChicagoArtAPICollector();

  console.log('🏛️ Art Institute of Chicago');
  console.log('미국 3대 미술관 중 하나');
  console.log('인상파와 후기 인상파 컬렉션으로 유명\n');

  await collector.collectExhibitions();
  await pool.end();
}

if (require.main === module) {
  main();
}

module.exports = ChicagoArtAPICollector;
