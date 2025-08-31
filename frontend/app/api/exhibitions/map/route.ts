import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Seoul venue coordinates with enhanced APT compatibility
const SEOUL_VENUES = [
  {
    id: 'mmca-seoul',
    name: '국립현대미술관 서울',
    name_en: 'MMCA Seoul',
    lat: 37.5785,
    lng: 126.9800,
    district: '종로구',
    type: 'national_museum',
    address: '서울 종로구 삼청로 30',
    website: 'https://www.mmca.go.kr',
    apt_compatibility: {
      'LAEF': 0.95, // 여우 - 창의적, 실험적 전시 최고
      'SAEF': 0.90, // 나비 - 감성적, 아름다운 전시
      'LRMC': 0.90, // 거북이 - 체계적, 학술적 전시
      'SRMC': 0.85, // 독수리 - 권위 있는 전시
      'LAMF': 0.80, // 올빼미 - 깊이 있는 작품
      'SAMF': 0.75  // 앵무새 - 소통하며 감상
    }
  },
  {
    id: 'sema',
    name: '서울시립미술관',
    name_en: 'SeMA',
    lat: 37.5640,
    lng: 126.9738,
    district: '중구',
    type: 'municipal_museum',
    address: '서울 중구 덕수궁길 61',
    website: 'https://sema.seoul.go.kr',
    apt_compatibility: {
      'SREC': 0.95, // 오리 - 시민 친화적 전시 최고
      'SAMC': 0.90, // 사슴 - 평화로운 전시 분위기
      'LREC': 0.85, // 고슴도치 - 접근 가능한 현대미술
      'SRMF': 0.80, // 코끼리 - 대중적 전시
      'SAEC': 0.75, // 펭귄 - 세련된 공간
      'SREC': 0.85  // 오리 - 편안한 관람
    }
  },
  {
    id: 'leeum',
    name: '리움미술관',
    name_en: 'Leeum Museum',
    lat: 37.5384,
    lng: 126.9990,
    district: '용산구',
    type: 'private_museum',
    address: '서울 용산구 이태원로55길 60-16',
    website: 'https://www.leeum.org',
    apt_compatibility: {
      'LAEF': 0.95, // 여우 - 혁신적 현대미술 최고
      'LAMF': 0.90, // 올빼미 - 깊이 있는 작품
      'SREF': 0.85, // 강아지 - 활동적이고 흥미로운 전시
      'LREF': 0.80, // 카멜레온 - 다양한 장르
      'SAEF': 0.85, // 나비 - 아름다운 건축과 전시
      'SAMF': 0.75  // 앵무새 - 대화하며 감상
    }
  },
  {
    id: 'amorepacific',
    name: '아모레퍼시픽미술관',
    name_en: 'Amorepacific Museum',
    lat: 37.5273,
    lng: 126.9727,
    district: '용산구',
    type: 'corporate_museum',
    address: '서울 용산구 한강대로 100',
    website: 'https://www.amorepacific.com/museum',
    apt_compatibility: {
      'SAEC': 0.95, // 펭귄 - 세련된 미적 감각 최고
      'SAEF': 0.90, // 나비 - 뷰티와 예술의 조화
      'LREC': 0.80, // 고슴도치 - 편안한 관람 환경
      'SREC': 0.85, // 오리 - 접근성 좋은 전시
      'LAEC': 0.75, // 고양이 - 세련된 큐레이션
      'SAMC': 0.70  // 사슴 - 평화로운 공간
    }
  },
  {
    id: 'daelim',
    name: '대림미술관',
    name_en: 'Daelim Museum',
    lat: 37.5414,
    lng: 126.9534,
    district: '종로구',
    type: 'private_museum',
    address: '서울 종로구 자하문로4길 21',
    website: 'https://www.daelimmuseum.org',
    apt_compatibility: {
      'SAEF': 0.95, // 나비 - 감성적, 트렌디한 전시 최고
      'LAEF': 0.85, // 여우 - 독창적 기획전
      'SAEC': 0.90, // 펭귄 - 포토제닉한 전시
      'LREC': 0.70, // 고슴도치 - 아늑한 공간
      'LAEC': 0.80, // 고양이 - 독특한 감성
      'SAMF': 0.75  // 앵무새 - SNS 친화적
    }
  }
];

// APT type definitions for matching
const APT_TYPES = {
  'LAEF': { name: '여우', traits: ['창의적', '실험적', '독립적'] },
  'LAEC': { name: '고양이', traits: ['분석적', '독립적', '신중한'] },
  'LAMF': { name: '올빼미', traits: ['분석적', '독립적', '깊이있는'] },
  'LAMC': { name: '거북이', traits: ['분석적', '독립적', '체계적'] },
  'LREF': { name: '카멜레온', traits: ['창의적', '관계지향', '적응적'] },
  'LREC': { name: '고슴도치', traits: ['분석적', '관계지향', '신중한'] },
  'LRMF': { name: '문어', traits: ['분석적', '관계지향', '깊이있는'] },
  'LRMC': { name: '비버', traits: ['분석적', '관계지향', '체계적'] },
  'SAEF': { name: '나비', traits: ['감성적', '활동적', '창의적'] },
  'SAEC': { name: '펭귄', traits: ['감성적', '활동적', '신중한'] },
  'SAMF': { name: '앵무새', traits: ['감성적', '활동적', '깊이있는'] },
  'SAMC': { name: '사슴', traits: ['감성적', '활동적', '체계적'] },
  'SREF': { name: '강아지', traits: ['감성적', '관계지향', '창의적'] },
  'SREC': { name: '오리', traits: ['감성적', '관계지향', '신중한'] },
  'SRMF': { name: '코끼리', traits: ['감성적', '관계지향', '깊이있는'] },
  'SRMC': { name: '독수리', traits: ['감성적', '관계지향', '체계적'] }
};

export async function GET(request: NextRequest) {
  try {
    // Get search parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const aptType = searchParams.get('apt_type');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('exhibitions')
      .select(`
        id,
        external_id,
        title,
        venue,
        venue_address,
        start_date,
        end_date,
        description,
        image_url,
        ticket_url,
        category,
        recommended_apt,
        apt_weights,
        status,
        venue_coordinates,
        venue_district,
        venue_type,
        source,
        created_at
      `)
      .order('start_date', { ascending: false })
      .limit(limit);

    // Filter by status
    if (status !== 'all') {
      if (status === 'current') {
        const today = new Date().toISOString().split('T')[0];
        query = query
          .lte('start_date', today)
          .gte('end_date', today);
      } else {
        query = query.eq('status', status);
      }
    }

    const { data: exhibitions, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { success: false, error: 'Database query failed' },
        { status: 500 }
      );
    }

    if (!exhibitions || exhibitions.length === 0) {
      // Return sample data if no real exhibitions found
      return NextResponse.json({
        success: true,
        exhibitions: [],
        venues: SEOUL_VENUES,
        total: 0,
        center: { lat: 37.5665, lng: 126.9780 },
        message: 'No exhibitions found. Consider running the data collection script.'
      });
    }

    // Enhance exhibition data with venue information and APT matching
    const enhancedExhibitions = exhibitions.map(exhibition => {
      // Find matching venue
      const venue = findMatchingVenue(exhibition.venue, SEOUL_VENUES);
      
      // Use venue coordinates if available, otherwise try parsing from exhibition
      const coordinates = exhibition.venue_coordinates || 
        (venue ? { lat: venue.lat, lng: venue.lng } : null);

      // Calculate APT recommendations if not present
      let recommendedApt = exhibition.recommended_apt;
      if (!recommendedApt || recommendedApt.length === 0) {
        recommendedApt = generateAPTRecommendations(exhibition, venue);
      }

      // Filter by APT type if specified
      if (aptType && !recommendedApt.includes(aptType)) {
        return null;
      }

      // Calculate status based on dates
      const now = new Date();
      const startDate = new Date(exhibition.start_date);
      const endDate = new Date(exhibition.end_date);
      
      let currentStatus = 'upcoming';
      if (now >= startDate && now <= endDate) {
        currentStatus = 'ongoing';
      } else if (now > endDate) {
        currentStatus = 'ended';
      }

      return {
        id: exhibition.id,
        external_id: exhibition.external_id,
        title: exhibition.title,
        venue_name: exhibition.venue,
        venue_name_en: venue?.name_en || exhibition.venue,
        lat: coordinates?.lat || (venue?.lat || 37.5665),
        lng: coordinates?.lng || (venue?.lng || 126.9780),
        district: exhibition.venue_district || venue?.district || '서울',
        venue_type: exhibition.venue_type || venue?.type || 'gallery',
        venue_address: exhibition.venue_address || venue?.address,
        start_date: exhibition.start_date,
        end_date: exhibition.end_date,
        description: exhibition.description,
        image_url: exhibition.image_url,
        ticket_url: exhibition.ticket_url,
        category: exhibition.category || 'general',
        recommended_apt: recommendedApt,
        apt_compatibility: venue?.apt_compatibility || {},
        status: currentStatus,
        days_remaining: Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        source: exhibition.source,
        tags: generateExhibitionTags(exhibition)
      };
    }).filter(Boolean); // Remove null values

    // Sort by relevance (ongoing first, then upcoming, then by start date)
    enhancedExhibitions.sort((a, b) => {
      if (a.status === 'ongoing' && b.status !== 'ongoing') return -1;
      if (b.status === 'ongoing' && a.status !== 'ongoing') return 1;
      if (a.status === 'upcoming' && b.status === 'ended') return -1;
      if (b.status === 'upcoming' && a.status === 'ended') return 1;
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });

    // Calculate statistics
    const stats = {
      total: enhancedExhibitions.length,
      ongoing: enhancedExhibitions.filter(e => e.status === 'ongoing').length,
      upcoming: enhancedExhibitions.filter(e => e.status === 'upcoming').length,
      ended: enhancedExhibitions.filter(e => e.status === 'ended').length,
      venues: [...new Set(enhancedExhibitions.map(e => e.venue_name))].length
    };

    return NextResponse.json({
      success: true,
      exhibitions: enhancedExhibitions,
      venues: SEOUL_VENUES,
      stats,
      apt_types: APT_TYPES,
      center: { lat: 37.5665, lng: 126.9780 }, // Seoul center
      filters: {
        available_apt_types: Object.keys(APT_TYPES),
        available_categories: [...new Set(enhancedExhibitions.map(e => e.category))],
        available_venues: [...new Set(enhancedExhibitions.map(e => e.venue_name))]
      }
    });

  } catch (error) {
    console.error('Error fetching exhibition map data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch exhibition map data',
        message: 'Please check your database connection and run the exhibition collection script.'
      },
      { status: 500 }
    );
  }
}

// Helper function to find matching venue
function findMatchingVenue(venueName: string, venues: any[]) {
  if (!venueName) return null;
  
  const cleanName = venueName.toLowerCase()
    .replace(/[^\w가-힣]/g, '')
    .replace(/\s+/g, '');

  return venues.find(venue => {
    const venueCleanName = venue.name.toLowerCase()
      .replace(/[^\w가-힣]/g, '')
      .replace(/\s+/g, '');
    
    return venueCleanName.includes(cleanName) || 
           cleanName.includes(venueCleanName) ||
           venue.name_en.toLowerCase().includes(venueName.toLowerCase());
  });
}

// Generate APT recommendations based on exhibition content
function generateAPTRecommendations(exhibition: any, venue: any) {
  const recommendations = new Set<string>();
  const title = exhibition.title?.toLowerCase() || '';
  const description = exhibition.description?.toLowerCase() || '';
  const text = `${title} ${description}`;

  // Category-based recommendations
  const categoryMappings = {
    contemporary: ['LAEF', 'SAEF', 'LAMF'],
    traditional: ['LRMC', 'SRMC', 'SAMC'],
    photography: ['LREC', 'SREC', 'LREF'],
    interactive: ['SREF', 'SAEF', 'SRMF'],
    minimalism: ['LAMC', 'LRMC', 'LAMF'],
    social: ['SRMF', 'SRMC', 'SAMF']
  };

  // Check for keywords and add corresponding APT types
  for (const [category, aptTypes] of Object.entries(categoryMappings)) {
    const keywords = {
      contemporary: ['현대', '컨템포러리', '실험', '신진'],
      traditional: ['전통', '고미술', '서화', '불교'],
      photography: ['사진', '포토', '다큐'],
      interactive: ['체험', '인터랙티브', '미디어', 'vr'],
      minimalism: ['미니멀', '단색', '추상'],
      social: ['사회', '환경', '공동체', '참여']
    };

    if (keywords[category as keyof typeof keywords]?.some(keyword => 
      text.includes(keyword))) {
      aptTypes.forEach(type => recommendations.add(type));
    }
  }

  // Venue-based recommendations
  if (venue?.apt_compatibility) {
    Object.entries(venue.apt_compatibility)
      .filter(([_, score]) => (score as number) >= 0.8)
      .forEach(([type, _]) => recommendations.add(type));
  }

  // Ensure minimum recommendations
  if (recommendations.size < 3) {
    ['SAEF', 'LAEF', 'SREC'].forEach(type => recommendations.add(type));
  }

  return Array.from(recommendations).slice(0, 6);
}

// Generate exhibition tags
function generateExhibitionTags(exhibition: any) {
  const tags = [];
  const title = exhibition.title?.toLowerCase() || '';
  const description = exhibition.description?.toLowerCase() || '';
  
  const tagMappings = {
    '현대미술': ['현대', '컨템포러리'],
    '전통': ['전통', '고미술'],
    '사진': ['사진', '포토'],
    '체험': ['체험', '인터랙티브'],
    '미니멀': ['미니멀', '단색'],
    '신진작가': ['신진', '젊은'],
    '기획전': ['기획', '특별'],
    '개인전': ['개인전', '개인']
  };

  for (const [tag, keywords] of Object.entries(tagMappings)) {
    if (keywords.some(keyword => title.includes(keyword) || description.includes(keyword))) {
      tags.push(tag);
    }
  }

  return tags.slice(0, 5);
}