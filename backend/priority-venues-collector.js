#!/usr/bin/env node
require('dotenv').config();

const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class PriorityVenuesCollector {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
    this.stats = {
      processed: 0,
      updated: 0,
      notFound: 0,
      errors: 0
    };
  }

  async collectPriorityVenues() {
    console.log('🎯 주요 미술관 우선 수집 (Google Places API)');
    console.log(`🔑 API 키: ${this.apiKey ? '설정됨' : '없음'}`);
    
    if (!this.apiKey) {
      console.log('❌ Google Places API 키가 필요합니다.');
      return;
    }

    const client = await pool.connect();

    try {
      // Tier 1 미술관들만 우선 처리
      const priorityVenues = await client.query(`
        SELECT id, name, city, country, website
        FROM venues 
        WHERE tier = 1 AND is_active = true
        ORDER BY CASE 
          WHEN country = 'KR' THEN 1
          WHEN country = 'US' THEN 2
          WHEN country = 'GB' THEN 3
          ELSE 4
        END, name
        LIMIT 50
      `);

      console.log(`\n🏛️ ${priorityVenues.rows.length}개 주요 미술관 처리 시작\n`);

      for (const venue of priorityVenues.rows) {
        await this.processVenue(venue, client);
        
        // API 호출 제한 (1초 딜레이)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      await this.showResults(client);

    } catch (error) {
      console.error('❌ 수집 중 오류:', error);
    } finally {
      client.release();
    }
  }

  async processVenue(venue, client) {
    try {
      this.stats.processed++;
      console.log(`🔍 [${this.stats.processed}] ${venue.name} (${venue.city})`);

      // 검색 쿼리 최적화
      const searchQueries = [
        `${venue.name} ${venue.city} museum`,
        `${venue.name} ${venue.city} gallery`,
        `${venue.name} ${venue.city} art`,
        venue.name
      ];

      let placeData = null;
      
      // 여러 검색어로 시도
      for (const query of searchQueries) {
        placeData = await this.searchPlace(query);
        if (placeData) break;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!placeData) {
        console.log(`   ❌ Google Places에서 찾을 수 없음`);
        this.stats.notFound++;
        return;
      }

      // 상세 정보 가져오기
      const details = await this.getPlaceDetails(placeData.place_id);
      
      if (!details) {
        console.log(`   ❌ 상세 정보 가져오기 실패`);
        this.stats.errors++;
        return;
      }

      // 데이터베이스 업데이트
      await this.updateVenueInDatabase(venue.id, details, client);
      
      const info = [
        details.rating ? `평점: ${details.rating}` : null,
        details.user_ratings_total ? `리뷰: ${details.user_ratings_total.toLocaleString()}개` : null,
        details.formatted_phone_number ? '전화번호 ✓' : null,
        details.website ? '웹사이트 ✓' : null
      ].filter(Boolean).join(', ');
      
      console.log(`   ✅ 업데이트 완료 (${info})`);
      this.stats.updated++;

    } catch (error) {
      console.error(`   ❌ 처리 중 오류: ${error.message}`);
      this.stats.errors++;
    }
  }

  async searchPlace(query) {
    try {
      const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
        params: {
          query,
          key: this.apiKey,
          type: 'museum'
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return response.data.results[0];
      }

      return null;
    } catch (error) {
      console.error('   Search API 오류:', error.message);
      return null;
    }
  }

  async getPlaceDetails(placeId) {
    try {
      const fields = [
        'name', 'formatted_address', 'geometry', 'formatted_phone_number',
        'website', 'rating', 'user_ratings_total', 'opening_hours',
        'price_level', 'types', 'photos', 'reviews'
      ].join(',');

      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          fields,
          key: this.apiKey,
          language: 'ko'
        }
      });

      if (response.data.status === 'OK') {
        return response.data.result;
      }

      return null;
    } catch (error) {
      console.error('   Details API 오류:', error.message);
      return null;
    }
  }

  async updateVenueInDatabase(venueId, details, client) {
    // 운영시간 처리
    let openingHours = null;
    if (details.opening_hours && details.opening_hours.weekday_text) {
      openingHours = {
        weekday_text: details.opening_hours.weekday_text,
        open_now: details.opening_hours.open_now
      };
    }

    // 가격 레벨 처리
    let admissionFee = null;
    if (details.price_level !== undefined) {
      const priceLabels = ['무료', '저렴함', '보통', '비쌈', '매우 비쌈'];
      admissionFee = {
        level: details.price_level,
        label: priceLabels[details.price_level] || '정보 없음'
      };
    }

    // 데이터 완성도 계산
    const completeness = this.calculateCompleteness(details);

    await client.query(`
      UPDATE venues SET
        latitude = $1,
        longitude = $2,
        address = $3,
        phone = $4,
        website = COALESCE($5, website),
        rating = $6,
        review_count = $7,
        opening_hours = $8,
        admission_fee = $9,
        google_place_id = $10,
        data_completeness = $11,
        last_updated = NOW()
      WHERE id = $12
    `, [
      details.geometry?.location?.lat,
      details.geometry?.location?.lng,
      details.formatted_address,
      details.formatted_phone_number,
      details.website,
      details.rating,
      details.user_ratings_total,
      openingHours ? JSON.stringify(openingHours) : null,
      admissionFee ? JSON.stringify(admissionFee) : null,
      details.place_id,
      completeness,
      venueId
    ]);
  }

  calculateCompleteness(details) {
    let score = 0;
    const checks = [
      { field: details.geometry?.location?.lat, points: 15 },
      { field: details.formatted_address, points: 15 },
      { field: details.formatted_phone_number, points: 10 },
      { field: details.website, points: 15 },
      { field: details.rating, points: 10 },
      { field: details.opening_hours, points: 20 },
      { field: details.user_ratings_total, points: 10 },
      { field: details.photos && details.photos.length > 0, points: 5 }
    ];

    checks.forEach(check => {
      if (check.field) score += check.points;
    });

    return Math.min(score, 100);
  }

  async showResults(client) {
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as with_coordinates,
        COUNT(CASE WHEN rating IS NOT NULL THEN 1 END) as with_rating,
        COUNT(CASE WHEN data_completeness >= 70 THEN 1 END) as high_quality,
        AVG(data_completeness) as avg_completeness,
        AVG(rating) as avg_rating
      FROM venues
      WHERE tier = 1
    `);

    const topVenues = await client.query(`
      SELECT name, city, country, data_completeness, rating, review_count
      FROM venues 
      WHERE tier = 1 AND data_completeness > 0
      ORDER BY data_completeness DESC, rating DESC
      LIMIT 10
    `);

    console.log('\n\n🎉 주요 미술관 메타데이터 수집 완료!');
    console.log('='.repeat(60));
    console.log(`📊 처리 결과:`);
    console.log(`   처리됨: ${this.stats.processed}개`);
    console.log(`   업데이트됨: ${this.stats.updated}개`);
    console.log(`   찾을 수 없음: ${this.stats.notFound}개`);
    console.log(`   오류: ${this.stats.errors}개`);

    console.log(`\n📈 Tier 1 미술관 데이터 품질:`);
    console.log(`   좌표 정보: ${stats.rows[0].with_coordinates}/${stats.rows[0].total}개`);
    console.log(`   평점 정보: ${stats.rows[0].with_rating}/${stats.rows[0].total}개`);
    console.log(`   고품질 (70%+): ${stats.rows[0].high_quality}개`);
    console.log(`   평균 완성도: ${Math.round(stats.rows[0].avg_completeness)}%`);
    console.log(`   평균 평점: ${parseFloat(stats.rows[0].avg_rating || 0).toFixed(1)}/5.0`);

    console.log('\n🏆 완성도 상위 미술관:');
    topVenues.rows.forEach((venue, index) => {
      const rating = venue.rating ? `${venue.rating}⭐` : 'N/A';
      const reviews = venue.review_count ? `(${venue.review_count.toLocaleString()}개 리뷰)` : '';
      console.log(`${index + 1}. ${venue.name} (${venue.city}) - ${venue.data_completeness}% ${rating} ${reviews}`);
    });
  }
}

async function main() {
  const collector = new PriorityVenuesCollector();
  
  try {
    await collector.collectPriorityVenues();
  } catch (error) {
    console.error('실행 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = PriorityVenuesCollector;