#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 핵심 Venue 데이터 (우선 20개만)
const venues = [
  // Seoul - Tier 1 (Major Museums)
  {
    name: '국립현대미술관 서울관',
    name_en: 'MMCA Seoul',
    type: 'museum',
    tier: '1',
    address: '서울특별시 종로구 삼청로 30',
    city: '서울',
    country: 'KR',
    website: 'https://www.mmca.go.kr',
    instagram: '@mmcakorea',
    is_active: true
  },
  {
    name: '서울시립미술관',
    name_en: 'Seoul Museum of Art',
    type: 'museum',
    tier: '1',
    address: '서울특별시 중구 덕수궁길 61',
    city: '서울',
    country: 'KR',
    website: 'https://sema.seoul.go.kr',
    instagram: '@seoulmuseumofart',
    is_active: true
  },
  {
    name: '리움미술관',
    name_en: 'Leeum Museum of Art',
    type: 'museum',
    tier: '1',
    address: '서울특별시 용산구 이태원로55길 60',
    city: '서울',
    country: 'KR',
    website: 'https://www.leeum.org',
    instagram: '@leeummuseumofart',
    is_active: true
  },
  {
    name: '아모레퍼시픽미술관',
    name_en: 'Amorepacific Museum of Art',
    type: 'museum',
    tier: '1',
    address: '서울특별시 용산구 한강대로 100',
    city: '서울',
    country: 'KR',
    website: 'https://museum.amorepacific.com',
    instagram: '@amorepacific.museum.of.art',
    is_active: true
  },
  {
    name: '대림미술관',
    name_en: 'Daelim Museum',
    type: 'museum',
    tier: '2',
    address: '서울특별시 종로구 자하문로4길 21',
    city: '서울',
    country: 'KR',
    website: 'https://daelimmuseum.org',
    instagram: '@daelimmuseum',
    is_active: true
  },
  
  // Seoul - Tier 1 (Major Galleries)
  {
    name: '갤러리현대',
    name_en: 'Gallery Hyundai',
    type: 'gallery',
    tier: '1',
    address: '서울특별시 종로구 삼청로 14',
    city: '서울',
    country: 'KR',
    website: 'https://www.galleryhyundai.com',
    instagram: '@galleryhyundai',
    is_active: true
  },
  {
    name: '국제갤러리',
    name_en: 'Kukje Gallery',
    type: 'gallery',
    tier: '1',
    address: '서울특별시 종로구 소격동 58-1',
    city: '서울',
    country: 'KR',
    website: 'https://www.kukjegallery.com',
    instagram: '@kukjegallery',
    is_active: true
  },
  {
    name: 'PKM갤러리',
    name_en: 'PKM Gallery',
    type: 'gallery',
    tier: '1',
    address: '서울특별시 종로구 삼청로7길 40',
    city: '서울',
    country: 'KR',
    website: 'https://www.pkmgallery.com',
    instagram: '@pkmgallery',
    is_active: true
  },
  {
    name: '페이스갤러리 서울',
    name_en: 'Pace Gallery Seoul',
    type: 'gallery',
    tier: '1',
    address: '서울특별시 용산구 이태원로 262',
    city: '서울',
    country: 'KR',
    website: 'https://www.pacegallery.com',
    instagram: '@pacegallery',
    is_active: true
  },
  {
    name: '타데우스 로팍 서울',
    name_en: 'Thaddaeus Ropac Seoul',
    type: 'gallery',
    tier: '1',
    address: '서울특별시 용산구 독서당로 122-1',
    city: '서울',
    country: 'KR',
    website: 'https://www.ropac.net',
    instagram: '@thaddaeusropac',
    is_active: true
  },
  
  // Seoul - Tier 2 (Important Spaces)
  {
    name: '아트선재센터',
    name_en: 'Art Sonje Center',
    type: 'alternative_space',
    tier: '2',
    address: '서울특별시 종로구 율곡로3길 87',
    city: '서울',
    country: 'KR',
    website: 'https://artsonje.org',
    instagram: '@artsonjecenter',
    is_active: true
  },
  {
    name: '송은',
    name_en: 'SongEun',
    type: 'gallery',
    tier: '2',
    address: '서울특별시 강남구 압구정로75길 6',
    city: '서울',
    country: 'KR',
    website: 'https://www.songeun.or.kr',
    instagram: '@songeunartspace',
    is_active: true
  },
  {
    name: '페로탱 서울',
    name_en: 'Perrotin Seoul',
    type: 'gallery',
    tier: '1',
    address: '서울특별시 강남구 도산대로45길 5',
    city: '서울',
    country: 'KR',
    website: 'https://www.perrotin.com',
    instagram: '@perrotin',
    is_active: true
  },
  {
    name: '디뮤지엄',
    name_en: 'D Museum',
    type: 'museum',
    tier: '2',
    address: '서울특별시 성동구 왕십리로 83-21',
    city: '서울',
    country: 'KR',
    website: 'https://dmuseum.org',
    instagram: '@d_museum',
    is_active: true
  },
  
  // Gyeonggi-do
  {
    name: '국립현대미술관 과천관',
    name_en: 'MMCA Gwacheon',
    type: 'museum',
    tier: '1',
    address: '경기도 과천시 광명로 313',
    city: '과천',
    country: 'KR',
    website: 'https://www.mmca.go.kr',
    instagram: '@mmcakorea',
    is_active: true
  },
  {
    name: '백남준아트센터',
    name_en: 'Nam June Paik Art Center',
    type: 'museum',
    tier: '1',
    address: '경기도 용인시 기흥구 백남준로 10',
    city: '용인',
    country: 'KR',
    website: 'https://njp.ggcf.kr',
    instagram: '@namjunepaikartcenter',
    is_active: true
  },
  
  // Busan
  {
    name: '부산시립미술관',
    name_en: 'Busan Museum of Art',
    type: 'museum',
    tier: '1',
    address: '부산광역시 해운대구 APEC로 58',
    city: '부산',
    country: 'KR',
    website: 'https://art.busan.go.kr',
    instagram: '@busanmuseumofart',
    is_active: true
  },
  {
    name: '부산현대미술관',
    name_en: 'Museum of Contemporary Art Busan',
    type: 'museum',
    tier: '1',
    address: '부산광역시 사하구 낙동남로 1191',
    city: '부산',
    country: 'KR',
    website: 'https://www.busan.go.kr/moca',
    instagram: '@mocabusan',
    is_active: true
  },
  
  // International - Core venues
  {
    name: 'Museum of Modern Art',
    name_en: 'MoMA',
    type: 'museum',
    tier: '1',
    address: '11 West 53 Street, New York, NY 10019',
    city: 'New York',
    country: 'US',
    website: 'https://www.moma.org',
    instagram: '@themuseumofmodernart',
    is_active: true
  },
  {
    name: 'Tate Modern',
    name_en: 'Tate Modern',
    type: 'museum',
    tier: '1',
    address: 'Bankside, London SE1 9TG',
    city: 'London',
    country: 'GB',
    website: 'https://www.tate.org.uk',
    instagram: '@tate',
    is_active: true
  }
];

async function seedVenues() {
  console.log('🌱 Starting venue seeding to Supabase...');
  
  try {
    // 배치로 venue 데이터 삽입
    const { data, error } = await supabase
      .from('venues')
      .upsert(venues, {
        onConflict: 'name',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error('❌ Error inserting venues:', error);
      return;
    }
    
    console.log(`✅ Successfully seeded ${venues.length} venues to Supabase!`);
    
    // 결과 확인
    const { data: allVenues, error: selectError } = await supabase
      .from('venues')
      .select('id, name, city, type, tier')
      .order('city', { ascending: true });
    
    if (selectError) {
      console.error('❌ Error fetching venues:', selectError);
      return;
    }
    
    console.log('\n📊 Venue Summary:');
    const summary = allVenues.reduce((acc, venue) => {
      const key = `${venue.city} (${venue.type})`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(summary).forEach(([key, count]) => {
      console.log(`  ${key}: ${count}`);
    });
    
    console.log(`\n🎯 Total venues in database: ${allVenues.length}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// 실행
seedVenues();