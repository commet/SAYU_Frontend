#!/usr/bin/env node
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 주요 미술관들의 큐레이션된 메타데이터
const venueMetadata = {
  // 🇰🇷 한국 주요 미술관
  '국립현대미술관 서울': {
    address: '서울특별시 종로구 삼청로 30',
    latitude: 37.5859,
    longitude: 126.9777,
    postal_code: '03062',
    district: '종로구',
    subway_station: '안국역 1번 출구',
    parking_info: '지하주차장 운영 (유료)',
    opening_hours: {
      'tuesday': '10:00-18:00',
      'wednesday': '10:00-18:00', 
      'thursday': '10:00-18:00',
      'friday': '10:00-21:00',
      'saturday': '10:00-18:00',
      'sunday': '10:00-18:00'
    },
    closed_days: ['monday'],
    admission_fee: {
      'adult': 4000,
      'youth': 2000,
      'child': 0,
      'senior': 2000,
      'disabled': 0
    },
    description: '한국을 대표하는 국립미술관으로 한국 현대미술과 세계 현대미술을 전시합니다.',
    specialties: ['현대미술', '한국미술', '국제교류전', '기획전'],
    established_year: 1986,
    architect: '민현식',
    building_type: '현대식 미술관',
    floor_area: 18000,
    exhibition_spaces: 6,
    permanent_collection: true,
    art_genres: ['회화', '조각', '설치', '미디어아트', '사진'],
    phone: '02-3701-9500',
    email: 'info@mmca.go.kr',
    social_media: {
      'instagram': '@mmca_korea',
      'facebook': 'mmcakorea',
      'youtube': 'mmcakorea'
    },
    facilities: {
      'shop': true,
      'cafe': true,
      'library': true,
      'auditorium': true,
      'education_room': true
    },
    accessibility: {
      'wheelchair': true,
      'elevator': true,
      'audio_guide': true,
      'braille': true
    },
    shop: true,
    cafe_restaurant: true,
    wifi: true,
    photography_allowed: false,
    group_tours: true,
    audio_guide: true,
    rating: 4.5,
    review_count: 2847,
    visitor_count_annual: 800000,
    instagram_followers: 287000
  },

  '리움미술관': {
    address: '서울특별시 용산구 이태원로55길 60-16',
    latitude: 37.5347,
    longitude: 126.9978,
    postal_code: '04348',
    district: '용산구',
    subway_station: '한강진역 2번 출구',
    parking_info: '지하주차장 운영 (2시간 무료)',
    opening_hours: {
      'tuesday': '10:00-18:00',
      'wednesday': '10:00-18:00',
      'thursday': '10:00-18:00',
      'friday': '10:00-18:00',
      'saturday': '10:00-18:00',
      'sunday': '10:00-18:00'
    },
    closed_days: ['monday'],
    admission_fee: {
      'adult': 20000,
      'youth': 16000,
      'child': 10000,
      'senior': 16000
    },
    description: '삼성문화재단에서 운영하는 사립미술관으로 한국 고미술과 현대미술을 함께 전시합니다.',
    specialties: ['고미술', '현대미술', '도자기', '국보급 유물'],
    established_year: 2004,
    architect: '마리오 보타, 장 누벨, 렘 쿨하스',
    building_type: '포스트모던 건축',
    floor_area: 15000,
    exhibition_spaces: 4,
    permanent_collection: true,
    art_genres: ['도자기', '불교미술', '회화', '조각', '현대미술'],
    phone: '02-2014-6900',
    email: 'info@leeum.org',
    social_media: {
      'instagram': '@leeum_museum',
      'facebook': 'leeummuseum'
    },
    facilities: {
      'shop': true,
      'cafe': true,
      'vip_lounge': true
    },
    accessibility: {
      'wheelchair': true,
      'elevator': true,
      'audio_guide': true
    },
    shop: true,
    cafe_restaurant: true,
    wifi: true,
    photography_allowed: false,
    group_tours: true,
    audio_guide: true,
    rating: 4.6,
    review_count: 1923,
    visitor_count_annual: 300000,
    instagram_followers: 156000
  },

  '서울시립미술관': {
    address: '서울특별시 중구 덕수궁길 61',
    latitude: 37.5659,
    longitude: 126.9754,
    postal_code: '04515',
    district: '중구',
    subway_station: '시청역 1번 출구',
    parking_info: '인근 공영주차장 이용',
    opening_hours: {
      'tuesday': '10:00-20:00',
      'wednesday': '10:00-20:00',
      'thursday': '10:00-20:00',
      'friday': '10:00-20:00',
      'saturday': '10:00-18:00',
      'sunday': '10:00-18:00'
    },
    closed_days: ['monday'],
    admission_fee: {
      'adult': 0,
      'youth': 0,
      'child': 0,
      'senior': 0
    },
    description: '서울시에서 운영하는 공립미술관으로 시민을 위한 다양한 현대미술 전시를 개최합니다.',
    specialties: ['현대미술', '시민참여', '교육프로그램', '지역작가'],
    established_year: 1988,
    building_type: '근대 건축물 리모델링',
    floor_area: 12000,
    exhibition_spaces: 5,
    permanent_collection: true,
    art_genres: ['현대미술', '회화', '조각', '설치', '미디어아트'],
    phone: '02-2124-8800',
    social_media: {
      'instagram': '@seoulmuseum',
      'facebook': 'seoulmuseum'
    },
    shop: true,
    cafe_restaurant: true,
    wifi: true,
    photography_allowed: true,
    group_tours: true,
    audio_guide: false,
    rating: 4.2,
    review_count: 1456,
    visitor_count_annual: 450000
  },

  // 🇺🇸 미국 주요 미술관
  'Museum of Modern Art (MoMA)': {
    address: '11 W 53rd St, New York, NY 10019',
    latitude: 40.7614,
    longitude: -73.9776,
    postal_code: '10019',
    district: 'Manhattan',
    subway_station: '5 Av/53 St (E, M), 57 St (F)',
    parking_info: 'Nearby parking garages available',
    opening_hours: {
      'monday': '10:30-17:30',
      'tuesday': '10:30-17:30',
      'wednesday': '10:30-17:30',
      'thursday': '10:30-17:30',
      'friday': '10:30-20:00',
      'saturday': '10:30-19:00',
      'sunday': '10:30-17:30'
    },
    closed_days: ['thanksgiving', 'christmas'],
    admission_fee: {
      'adult': 25,
      'student': 14,
      'senior': 18,
      'child': 0
    },
    description: 'One of the most influential modern art museums in the world, featuring works from the 1880s to the present.',
    specialties: ['Modern Art', 'Contemporary Art', 'Design', 'Film', 'Architecture'],
    established_year: 1929,
    architect: 'Edward Durell Stone, Philip Goodwin (original), Taniguchi Yoshio (renovation)',
    building_type: 'Modern Museum Complex',
    floor_area: 65000,
    exhibition_spaces: 12,
    permanent_collection: true,
    art_genres: ['Painting', 'Sculpture', 'Design', 'Photography', 'Film', 'Media Arts'],
    phone: '+1-212-708-9400',
    email: 'info@moma.org',
    social_media: {
      'instagram': '@themuseumofmodernart',
      'twitter': '@moma',
      'facebook': 'MuseumofModernArt'
    },
    facilities: {
      'shop': true,
      'restaurant': true,
      'cafe': true,
      'library': true,
      'auditorium': true,
      'education_center': true
    },
    accessibility: {
      'wheelchair': true,
      'elevator': true,
      'audio_guide': true,
      'sign_language': true
    },
    shop: true,
    cafe_restaurant: true,
    wifi: true,
    photography_allowed: false,
    group_tours: true,
    audio_guide: true,
    rating: 4.7,
    review_count: 18924,
    visitor_count_annual: 3200000,
    instagram_followers: 5400000
  },

  'Gagosian Gallery': {
    address: '555 W 24th St, New York, NY 10011',
    latitude: 40.7489,
    longitude: -74.0059,
    postal_code: '10011',
    district: 'Chelsea',
    subway_station: '23 St (C, E)',
    parking_info: 'Street parking and nearby garages',
    opening_hours: {
      'tuesday': '10:00-18:00',
      'wednesday': '10:00-18:00',
      'thursday': '10:00-18:00',
      'friday': '10:00-18:00',
      'saturday': '10:00-18:00'
    },
    closed_days: ['sunday', 'monday'],
    admission_fee: {
      'adult': 0,
      'student': 0,
      'senior': 0,
      'child': 0
    },
    description: 'Leading international contemporary art gallery representing blue-chip artists.',
    specialties: ['Contemporary Art', 'Blue-chip Artists', 'Primary Market', 'Secondary Market'],
    established_year: 1980,
    building_type: 'Contemporary Gallery Space',
    floor_area: 2000,
    exhibition_spaces: 3,
    permanent_collection: false,
    art_genres: ['Contemporary Art', 'Painting', 'Sculpture', 'Photography'],
    phone: '+1-212-741-1111',
    email: 'info@gagosian.com',
    social_media: {
      'instagram': '@gagosian',
      'facebook': 'gagosian'
    },
    facilities: {
      'viewing_room': true,
      'storage': true
    },
    accessibility: {
      'wheelchair': true,
      'elevator': true
    },
    shop: false,
    cafe_restaurant: false,
    wifi: true,
    photography_allowed: false,
    group_tours: false,
    audio_guide: false,
    rating: 4.3,
    review_count: 234,
    visitor_count_annual: 150000,
    instagram_followers: 2100000
  },

  // 🇬🇧 영국 주요 미술관
  'Tate Modern': {
    address: 'Bankside, London SE1 9TG',
    latitude: 51.5076,
    longitude: -0.0994,
    postal_code: 'SE1 9TG',
    district: 'Southwark',
    subway_station: 'Southwark (Jubilee), Blackfriars (Circle, District)',
    parking_info: 'Limited street parking, nearby NCP car parks',
    opening_hours: {
      'sunday': '10:00-18:00',
      'monday': '10:00-18:00',
      'tuesday': '10:00-18:00',
      'wednesday': '10:00-18:00',
      'thursday': '10:00-18:00',
      'friday': '10:00-22:00',
      'saturday': '10:00-22:00'
    },
    closed_days: ['december 24', 'december 25', 'december 26'],
    admission_fee: {
      'adult': 0,
      'student': 0,
      'senior': 0,
      'child': 0
    },
    description: 'International modern and contemporary art museum housed in a former power station.',
    specialties: ['Modern Art', 'Contemporary Art', 'International Artists', 'Turbine Hall Installations'],
    established_year: 2000,
    architect: 'Herzog & de Meuron',
    building_type: 'Converted Power Station',
    floor_area: 34500,
    exhibition_spaces: 8,
    permanent_collection: true,
    art_genres: ['Modern Art', 'Contemporary Art', 'Installation', 'Video Art', 'Performance'],
    phone: '+44-20-7887-8888',
    email: 'information@tate.org.uk',
    social_media: {
      'instagram': '@tate',
      'twitter': '@tate',
      'facebook': 'tatemuseum'
    },
    facilities: {
      'shop': true,
      'restaurant': true,
      'cafe': true,
      'members_room': true,
      'terrace': true
    },
    accessibility: {
      'wheelchair': true,
      'elevator': true,
      'audio_guide': true,
      'large_print': true
    },
    shop: true,
    cafe_restaurant: true,
    wifi: true,
    photography_allowed: true,
    group_tours: true,
    audio_guide: true,
    rating: 4.6,
    review_count: 23451,
    visitor_count_annual: 5900000,
    instagram_followers: 3200000
  }
};

async function populateVenueMetadata() {
  const client = await pool.connect();
  let updatedCount = 0;
  let notFoundCount = 0;

  try {
    console.log('🏛️ 주요 미술관 메타데이터 입력 시작');
    console.log(`📋 ${Object.keys(venueMetadata).length}개 기관의 상세 정보 추가\n`);

    await client.query('BEGIN');

    for (const [venueName, metadata] of Object.entries(venueMetadata)) {
      try {
        // venue 찾기
        const venueResult = await client.query(
          'SELECT id, name FROM venues WHERE name = $1',
          [venueName]
        );

        if (venueResult.rows.length === 0) {
          console.log(`⚠️  미술관 없음: ${venueName}`);
          notFoundCount++;
          continue;
        }

        const venueId = venueResult.rows[0].id;

        // 메타데이터 업데이트
        await client.query(`
          UPDATE venues SET
            address = $2,
            latitude = $3,
            longitude = $4,
            postal_code = $5,
            district = $6,
            subway_station = $7,
            parking_info = $8,
            opening_hours = $9,
            closed_days = $10,
            admission_fee = $11,
            description = $12,
            specialties = $13,
            established_year = $14,
            architect = $15,
            building_type = $16,
            floor_area = $17,
            exhibition_spaces = $18,
            permanent_collection = $19,
            art_genres = $20,
            phone = $21,
            email = $22,
            social_media = $23,
            facilities = $24,
            accessibility = $25,
            shop = $26,
            cafe_restaurant = $27,
            wifi = $28,
            photography_allowed = $29,
            group_tours = $30,
            audio_guide = $31,
            rating = $32,
            review_count = $33,
            visitor_count_annual = $34,
            instagram_followers = $35,
            data_completeness = 95,
            last_updated = NOW()
          WHERE id = $1
        `, [
          venueId,
          metadata.address,
          metadata.latitude,
          metadata.longitude,
          metadata.postal_code,
          metadata.district,
          metadata.subway_station,
          metadata.parking_info,
          JSON.stringify(metadata.opening_hours),
          metadata.closed_days,
          JSON.stringify(metadata.admission_fee),
          metadata.description,
          metadata.specialties,
          metadata.established_year,
          metadata.architect,
          metadata.building_type,
          metadata.floor_area,
          metadata.exhibition_spaces,
          metadata.permanent_collection,
          metadata.art_genres,
          metadata.phone,
          metadata.email,
          JSON.stringify(metadata.social_media),
          JSON.stringify(metadata.facilities),
          JSON.stringify(metadata.accessibility),
          metadata.shop,
          metadata.cafe_restaurant,
          metadata.wifi,
          metadata.photography_allowed,
          metadata.group_tours,
          metadata.audio_guide,
          metadata.rating,
          metadata.review_count,
          metadata.visitor_count_annual,
          metadata.instagram_followers
        ]);

        console.log(`✅ 업데이트: ${venueName}`);
        updatedCount++;

      } catch (error) {
        console.error(`❌ 오류 (${venueName}):`, error.message);
      }
    }

    await client.query('COMMIT');

    // 통계 조회
    const completenessStats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN data_completeness > 0 THEN 1 END) as with_metadata,
        COUNT(CASE WHEN data_completeness >= 90 THEN 1 END) as complete,
        AVG(data_completeness) as avg_completeness
      FROM venues
    `);

    const topVenues = await client.query(`
      SELECT name, city, country, data_completeness, rating, visitor_count_annual
      FROM venues 
      WHERE data_completeness > 0
      ORDER BY data_completeness DESC, rating DESC
      LIMIT 10
    `);

    console.log('\n\n🎉 메타데이터 입력 완료!');
    console.log('='.repeat(60));
    console.log(`📊 결과:`);
    console.log(`   업데이트됨: ${updatedCount}개`);
    console.log(`   찾을 수 없음: ${notFoundCount}개`);
    console.log(`   메타데이터 보유: ${completenessStats.rows[0].with_metadata}/${completenessStats.rows[0].total}개`);
    console.log(`   완성도 90% 이상: ${completenessStats.rows[0].complete}개`);
    console.log(`   평균 완성도: ${Math.round(completenessStats.rows[0].avg_completeness)}%`);

    console.log('\n🏆 메타데이터 완성도 상위 미술관:');
    topVenues.rows.forEach((venue, index) => {
      console.log(`${index + 1}. ${venue.name} (${venue.city})`);
      console.log(`   완성도: ${venue.data_completeness}% | 평점: ${venue.rating || 'N/A'} | 연간방문자: ${venue.visitor_count_annual?.toLocaleString() || 'N/A'}명`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 메타데이터 입력 오류:', error);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await populateVenueMetadata();
  } catch (error) {
    console.error('실행 실패:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { populateVenueMetadata };