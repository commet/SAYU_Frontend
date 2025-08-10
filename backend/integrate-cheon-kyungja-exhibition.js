/**
 * SAYU - 천경자 탄생 100주년 기념 전시 통합 스크립트
 * "영혼을 울리는 바람을 향하여" 전시 정보를 데이터베이스에 추가
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 천경자 작가 정보
const CHEON_KYUNGJA_ARTIST_DATA = {
  name: '천경자',
  name_ko: '천경자',
  birth_year: 1924,
  death_year: 2015,
  nationality: 'Korean',
  nationality_ko: '한국',
  bio: '한국 채색화 분야의 독자적 양식을 구축한 대표적인 여성 화가. 1940년대부터 1990년대까지 60여 년간 활동하며, 환상적이고 서정적인 작품 세계를 펼쳤다. 기행(紀行) 회화를 통해 독특한 화풍을 완성했으며, 1998년 서울시립미술관에 93점의 작품을 기증했다.',
  bio_ko: '한국 채색화 분야의 독자적 양식을 구축한 대표적인 여성 화가. 1940년대부터 1990년대까지 60여 년간 활동하며, 환상적이고 서정적인 작품 세계를 펼쳤다. 기행(紀行) 회화를 통해 독특한 화풍을 완성했으며, 1998년 서울시립미술관에 93점의 작품을 기증했다.',
  copyright_status: 'estate_managed',
  era: '20th Century Korean Art',
  is_featured: true,
  importance_score: 85,
  importance_tier: 1,
  apt_profile: {
    // SAYU 성격 유형별 친화도 (16가지 동물 유형 기준)
    personality_affinity: {
      // 높은 친화도 (80-95점)
      '나비': 90,      // SAEF - 환상적이고 감성적인 세계관
      '여우': 85,      // LAEF - 직관적이고 예술적 표현력
      '앵무새': 85,    // SAMF - 사회적 메시지와 표현력
      '펭귄': 80,      // SAEC - 따뜻하고 공감적인 감성
      
      // 중간 친화도 (60-79점)
      '고양이': 75,    // LAEC - 독립적이고 감각적
      '카멜레온': 70,  // LREF - 변화무쌍한 표현
      '사슴': 70,      // SAMC - 순수하고 자연친화적
      '강아지': 65,    // SREF - 감정적 교감
      
      // 보통 친화도 (40-59점)
      '올빼미': 55,    // LAMF - 신비롭고 깊이 있는
      '문어': 50,      // LRMF - 복합적 사고
      '오리': 50,      // SREC - 평화로운 감성
      '코끼리': 45,    // SRMF - 기억과 전통
      
      // 낮은 친화도 (20-39점)
      '거북이': 35,    // LAMC - 차분하고 내성적
      '고슴도치': 35,  // LREC - 보호적이고 신중
      '비버': 30,      // LRMC - 실용적이고 체계적
      '독수리': 25     // SRMC - 강력하고 직선적
    },
    dominant_emotions: ['melancholy', 'nostalgia', 'wonder', 'serenity'],
    art_themes: ['travel', 'nature', 'memory', 'fantasy', 'femininity'],
    color_palette: ['soft_pastels', 'earth_tones', 'dream_colors'],
    style_keywords: ['lyrical', 'fantastical', 'feminine', 'nostalgic', 'travel_inspired']
  },
  sources: {
    wikipedia: 'https://ko.wikipedia.org/wiki/천경자',
    museum: 'https://sema.seoul.go.kr/kr/collection/collectionView?id=10274'
  },
  recent_exhibitions: [
    {
      title: '영혼을 울리는 바람을 향하여',
      venue: '서울시립미술관',
      year: 2024,
      type: 'permanent_collection'
    }
  ]
};

// 서울시립미술관 정보
const SEOUL_MUSEUM_VENUE_DATA = {
  name: '서울시립미술관',
  name_en: 'Seoul Museum of Art',
  type: 'museum',
  tier: '1',
  address: '서울특별시 중구 덕수궁길 61',
  address_detail: '서소문본관',
  city: '서울',
  region: '중구',
  country: 'KR',
  latitude: 37.5658,
  longitude: 126.9751,
  phone: '02-2124-8800',
  website: 'https://sema.seoul.go.kr',
  instagram: '@seoulmuseumofart',
  operating_hours: {
    weekdays: '10:00-20:00',
    weekends_summer: '10:00-19:00',
    weekends_winter: '10:00-18:00',
    friday_cultural_night: '10:00-21:00',
    special_notes: '금요일 서울문화의 밤 운영'
  },
  closed_days: ['월요일', '1월 1일'],
  description: '1988년 개관한 서울시립미술관은 현대미술을 중심으로 다양한 기획전시와 교육프로그램을 운영하는 서울의 대표적인 공립미술관입니다.',
  description_en: 'Seoul Museum of Art, opened in 1988, is a leading public art museum in Seoul that focuses on contemporary art with various special exhibitions and educational programs.',
  is_active: true,
  is_premium: false,
  features: ['wheelchair_accessible', 'parking', 'cafe', 'shop', 'education_program']
};

// 천경자 전시 정보
const CHEON_KYUNGJA_EXHIBITION_DATA = {
  title: '영혼을 울리는 바람을 향하여',
  title_en: 'Towards the Wind that Stirs the Soul',
  description: `천경자(千鏡子, 1924-2015) 탄생 100주년을 기념하는 상설 전시입니다. 

전시는 4개의 섹션으로 구성되어 있습니다:
1. 환상과 정한의 세계 - 천경자 특유의 환상적이고 서정적인 작품들
2. 꿈과 바람의 여로 - 기행 회화를 중심으로 한 여행과 추억의 기록
3. 예술과 낭만 - 예술가로서의 삶과 낭만적 세계관을 보여주는 작품들
4. 자유로운 여자 - 시대를 앞서간 여성 예술가로서의 정체성을 탐구

천경자는 한국 채색화 분야에서 독자적인 양식을 구축한 대표적인 여성 화가로, 1998년 서울시립미술관에 93점의 소중한 작품들을 기증했습니다. 이번 전시에서는 그 중 30여 점의 대표작을 만나볼 수 있습니다.`,
  
  start_date: '2024-01-01', // 상시 전시로 설정
  end_date: '2025-12-31',   // 장기 전시로 설정
  
  artists: [
    {
      name: '천경자',
      name_ko: '천경자',
      name_en: 'Cheon Kyung-ja',
      birth_year: 1924,
      death_year: 2015,
      nationality: '한국'
    }
  ],
  
  type: 'collection',
  admission_fee: 0,
  admission_note: '무료관람',
  
  source: 'manual',
  verification_status: 'verified',
  status: 'ongoing',
  featured: true,
  
  tags: [
    '천경자',
    '채색화',
    '한국미술',
    '여성작가',
    '상설전시',
    '컬렉션',
    '기행회화',
    '20세기미술',
    '서울시립미술관'
  ],
  
  // SAYU 특화 메타데이터
  sayu_metadata: {
    exhibition_mood: {
      primary: 'contemplative',
      secondary: 'nostalgic',
      energy_level: 'medium',
      emotional_journey: ['wonder', 'melancholy', 'serenity', 'inspiration']
    },
    recommended_visit_duration: 45, // 분
    best_visit_time: ['afternoon', 'evening'],
    personality_recommendations: {
      highly_recommended: ['나비', '여우', '앵무새', '펭귄'],
      recommended: ['고양이', '카멜레온', '사슴', '강아지'],
      suitable: ['올빼미', '문어', '오리', '코끼리']
    },
    curatorial_notes: {
      '나비': '천경자의 환상적이고 꿈같은 작품 세계가 당신의 감성적 상상력과 깊이 공명할 것입니다.',
      '여우': '예술가의 직관적 표현력과 독창적 시선이 당신의 예술적 감각을 자극할 것입니다.',
      '앵무새': '작품 속에 담긴 시대적 메시지와 여성 예술가로서의 목소리에 깊이 공감하게 될 것입니다.',
      '펭귄': '따뜻하고 서정적인 작품들이 당신의 마음에 평안과 위로를 선사할 것입니다.'
    }
  }
};

async function integrateCheonKyungjaExhibition() {
  console.log('🎨 천경자 탄생 100주년 기념 전시 통합 시작...\n');

  try {
    // 1. 작가 정보 확인/생성
    console.log('📝 천경자 작가 정보 처리 중...');
    let artist;
    const { data: existingArtist } = await supabase
      .from('artists')
      .select('*')
      .eq('name', '천경자')
      .single();

    if (existingArtist) {
      console.log('✓ 기존 작가 정보 발견, 업데이트 중...');
      const { data: updatedArtist, error } = await supabase
        .from('artists')
        .update(CHEON_KYUNGJA_ARTIST_DATA)
        .eq('id', existingArtist.id)
        .select()
        .single();
      
      if (error) throw error;
      artist = updatedArtist;
    } else {
      console.log('✓ 새 작가 정보 생성 중...');
      const { data: newArtist, error } = await supabase
        .from('artists')
        .insert(CHEON_KYUNGJA_ARTIST_DATA)
        .select()
        .single();
      
      if (error) throw error;
      artist = newArtist;
    }
    console.log(`✅ 작가 정보 완료: ${artist.name} (ID: ${artist.id})\n`);

    // 2. 서울시립미술관 정보 확인/생성
    console.log('🏛️ 서울시립미술관 정보 처리 중...');
    let venue;
    const { data: existingVenue } = await supabase
      .from('venues')
      .select('*')
      .eq('name', '서울시립미술관')
      .single();

    if (existingVenue) {
      console.log('✓ 기존 미술관 정보 발견, 업데이트 중...');
      const { data: updatedVenue, error } = await supabase
        .from('venues')
        .update(SEOUL_MUSEUM_VENUE_DATA)
        .eq('id', existingVenue.id)
        .select()
        .single();
      
      if (error) throw error;
      venue = updatedVenue;
    } else {
      console.log('✓ 새 미술관 정보 생성 중...');
      const { data: newVenue, error } = await supabase
        .from('venues')
        .insert(SEOUL_MUSEUM_VENUE_DATA)
        .select()
        .single();
      
      if (error) throw error;
      venue = newVenue;
    }
    console.log(`✅ 미술관 정보 완료: ${venue.name} (ID: ${venue.id})\n`);

    // 3. 전시 정보 확인/생성
    console.log('🎭 전시 정보 처리 중...');
    const exhibitionData = {
      ...CHEON_KYUNGJA_EXHIBITION_DATA,
      venue_id: venue.id,
      venue_name: venue.name,
      venue_city: venue.city,
      venue_country: venue.country
    };

    const { data: existingExhibition } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('title', '영혼을 울리는 바람을 향하여')
      .eq('venue_id', venue.id)
      .single();

    let exhibition;
    if (existingExhibition) {
      console.log('✓ 기존 전시 정보 발견, 업데이트 중...');
      const { data: updatedExhibition, error } = await supabase
        .from('exhibitions')
        .update(exhibitionData)
        .eq('id', existingExhibition.id)
        .select()
        .single();
      
      if (error) throw error;
      exhibition = updatedExhibition;
    } else {
      console.log('✓ 새 전시 정보 생성 중...');
      const { data: newExhibition, error } = await supabase
        .from('exhibitions')
        .insert(exhibitionData)
        .select()
        .single();
      
      if (error) throw error;
      exhibition = newExhibition;
    }
    console.log(`✅ 전시 정보 완료: ${exhibition.title} (ID: ${exhibition.id})\n`);

    // 4. 통합 완료 리포트
    console.log('🎉 천경자 탄생 100주년 기념 전시 통합 완료!\n');
    console.log('📊 통합 결과:');
    console.log(`• 작가: ${artist.name} (${artist.birth_year}-${artist.death_year})`);
    console.log(`• 미술관: ${venue.name} (${venue.city})`);
    console.log(`• 전시: ${exhibition.title}`);
    console.log(`• 전시 기간: ${exhibition.start_date} ~ ${exhibition.end_date}`);
    console.log(`• 관람료: ${exhibition.admission_fee === 0 ? '무료' : exhibition.admission_fee + '원'}`);
    console.log(`• 전시 상태: ${exhibition.status}`);
    
    console.log('\n🎯 SAYU 성격 매칭 정보:');
    console.log('• 높은 친화도: 나비, 여우, 앵무새, 펭귄');
    console.log('• 중간 친화도: 고양이, 카멜레온, 사슴, 강아지');
    console.log('• 주요 감정: 멜랑콜리, 그리움, 경이로움, 평온');
    console.log('• 추천 관람 시간: 45분');
    
    console.log('\n✨ 천경자의 환상적이고 서정적인 작품 세계가');
    console.log('   SAYU 사용자들에게 깊은 감동을 선사할 것입니다!');

    return {
      success: true,
      artist,
      venue,
      exhibition
    };

  } catch (error) {
    console.error('❌ 전시 통합 중 오류 발생:', error);
    throw error;
  }
}

// 데이터 검증 함수
async function validateIntegration() {
  console.log('\n🔍 통합 데이터 검증 중...\n');

  try {
    // 작가 정보 검증
    const { data: artist } = await supabase
      .from('artists')
      .select('*')
      .eq('name', '천경자')
      .single();
    
    console.log('✅ 작가 검증 완료:', {
      name: artist.name,
      birth_year: artist.birth_year,
      death_year: artist.death_year,
      importance_score: artist.importance_score,
      apt_profile_exists: !!artist.apt_profile
    });

    // 미술관 정보 검증
    const { data: venue } = await supabase
      .from('venues')
      .select('*')
      .eq('name', '서울시립미술관')
      .single();
    
    console.log('✅ 미술관 검증 완료:', {
      name: venue.name,
      type: venue.type,
      tier: venue.tier,
      city: venue.city,
      coordinates: [venue.latitude, venue.longitude]
    });

    // 전시 정보 검증
    const { data: exhibition } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('title', '영혼을 울리는 바람을 향하여')
      .single();
    
    console.log('✅ 전시 검증 완료:', {
      title: exhibition.title,
      venue_name: exhibition.venue_name,
      status: exhibition.status,
      start_date: exhibition.start_date,
      end_date: exhibition.end_date,
      admission_fee: exhibition.admission_fee,
      tags_count: exhibition.tags?.length || 0
    });

    console.log('\n🎊 모든 데이터 검증 통과!');

  } catch (error) {
    console.error('❌ 검증 중 오류 발생:', error);
    throw error;
  }
}

// 실행
if (require.main === module) {
  integrateCheonKyungjaExhibition()
    .then(() => validateIntegration())
    .then(() => {
      console.log('\n🎨 천경자 탄생 100주년 기념 전시가 성공적으로 SAYU에 통합되었습니다!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 통합 실패:', error.message);
      process.exit(1);
    });
}

module.exports = {
  integrateCheonKyungjaExhibition,
  validateIntegration,
  CHEON_KYUNGJA_ARTIST_DATA,
  SEOUL_MUSEUM_VENUE_DATA,
  CHEON_KYUNGJA_EXHIBITION_DATA
};