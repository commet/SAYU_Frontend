#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixVenueNames() {
  console.log('🔧 Adding venue name variations...');
  
  // 국립현대미술관 변형들 추가
  const venueVariations = [
    {
      name: '국립현대미술관',
      name_en: 'MMCA',
      type: 'museum',
      tier: '1',
      address: '서울특별시 종로구 삼청로 30 (서울관 기준)',
      city: '서울',
      country: 'KR',
      website: 'https://www.mmca.go.kr',
      instagram: '@mmcakorea',
      is_active: true,
      description: '국립현대미술관 전관 통합 검색용'
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('venues')
      .upsert(venueVariations, { onConflict: 'name' });
    
    if (error) {
      console.error('❌ Error adding venue variations:', error);
      return;
    }
    
    console.log('✅ Added venue name variations');
    
    // 현재 venues 확인
    const { data: venues, error: selectError } = await supabase
      .from('venues')
      .select('name, name_en, city')
      .order('name');
    
    if (!selectError) {
      console.log('\n📋 Current venues:');
      venues.forEach(venue => {
        console.log(`  ${venue.name} (${venue.city})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to fix venue names:', error);
  }
}

fixVenueNames();