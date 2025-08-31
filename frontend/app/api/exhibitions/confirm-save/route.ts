import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ExhibitionToSave {
  exhibition_title: string;
  venue_name: string;
  start_date: string;
  end_date: string;
  ticket_price: string;
  description?: string;
  artists?: string[];
  genre?: string;
  exhibition_type?: string;
  operating_hours?: string;
  website_url?: string;
  phone_number?: string;
  confidence_score: number;
  raw_text: string;
}

export async function POST(request: NextRequest) {
  try {
    const { exhibitions } = await request.json();
    
    if (!Array.isArray(exhibitions) || exhibitions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No exhibitions to save'
      }, { status: 400 });
    }

    const supabase = await createClient();
    const results = [];
    
    for (const exhibition of exhibitions) {
      try {
        const result = await saveExhibition(supabase, exhibition);
        results.push({
          success: true,
          data: result,
          exhibition_title: exhibition.exhibition_title
        });
      } catch (error: any) {
        console.error(`Failed to save exhibition "${exhibition.exhibition_title}":`, error);
        results.push({
          success: false,
          error: error.message,
          exhibition_title: exhibition.exhibition_title
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: exhibitions.length,
        saved: successCount,
        failed: failCount
      }
    });

  } catch (error: any) {
    console.error('Batch save error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save exhibitions'
    }, { status: 500 });
  }
}

async function saveExhibition(supabase: any, exhibition: ExhibitionToSave) {
  // 1. 미술관/갤러리 확인 또는 생성
  const venue = await ensureVenueExists(supabase, exhibition.venue_name);
  
  // 2. 중복 체크
  const isDuplicate = await checkDuplicate(supabase, exhibition, venue.id);
  if (isDuplicate) {
    throw new Error(`Duplicate exhibition found: "${exhibition.exhibition_title}" at ${exhibition.venue_name}`);
  }
  
  // 3. exhibitions_master에 저장
  const masterId = await saveMasterRecord(supabase, exhibition, venue.id);
  
  // 4. exhibitions_translations에 한글 번역 저장
  await saveTranslationRecord(supabase, masterId, exhibition);
  
  return {
    id: masterId,
    venue_id: venue.id,
    exhibition_title: exhibition.exhibition_title
  };
}

async function ensureVenueExists(supabase: any, venueName: string) {
  // 기존 미술관 찾기
  const { data: existingVenue } = await supabase
    .from('venues_simple')
    .select('*')
    .eq('name_ko', venueName)
    .single();
    
  if (existingVenue) {
    return existingVenue;
  }
  
  // 새 미술관 생성
  const newVenue = {
    name_ko: venueName,
    city: '서울', // 기본값
    venue_type: inferVenueType(venueName),
    is_major: false,
    priority_order: 50
  };
  
  const { data, error } = await supabase
    .from('venues_simple')
    .insert(newVenue)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to create venue: ${error.message}`);
  }
  
  return data;
}

function inferVenueType(venueName: string): string {
  if (venueName.includes('미술관')) return 'museum';
  if (venueName.includes('갤러리')) return 'gallery';
  if (venueName.includes('아트센터') || venueName.includes('문화센터')) return 'art_center';
  if (venueName.includes('대안공간') || venueName.includes('스페이스')) return 'alternative';
  return 'gallery'; // 기본값
}

async function checkDuplicate(supabase: any, exhibition: ExhibitionToSave, venueId: string) {
  // 같은 미술관의 비슷한 제목과 날짜로 중복 체크
  const { data } = await supabase
    .from('exhibitions_master')
    .select(`
      id,
      exhibitions_translations!inner (
        exhibition_title
      )
    `)
    .eq('venue_id', venueId)
    .eq('start_date', exhibition.start_date);
    
  if (!data || data.length === 0) {
    return false;
  }
  
  // 제목 유사도 체크 (간단한 문자열 포함 검사)
  const similarTitle = data.some((item: any) => {
    const existingTitle = item.exhibitions_translations[0]?.exhibition_title || '';
    return calculateTitleSimilarity(existingTitle, exhibition.exhibition_title) > 0.8;
  });
  
  return similarTitle;
}

function calculateTitleSimilarity(title1: string, title2: string): number {
  // 간단한 유사도 계산 - 공통 단어 비율
  const words1 = title1.toLowerCase().split(/\s+/);
  const words2 = title2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
}

async function saveMasterRecord(supabase: any, exhibition: ExhibitionToSave, venueId: string): Promise<string> {
  const masterData = {
    venue_id: venueId,
    start_date: exhibition.start_date,
    end_date: exhibition.end_date,
    status: determineStatus(exhibition.start_date, exhibition.end_date),
    exhibition_type: exhibition.exhibition_type || 'group',
    genre: exhibition.genre || 'contemporary',
    view_count: 0,
    is_featured: false,
    priority_order: 50
  };
  
  const { data, error } = await supabase
    .from('exhibitions_master')
    .insert(masterData)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to save master record: ${error.message}`);
  }
  
  return data.id;
}

async function saveTranslationRecord(supabase: any, masterId: string, exhibition: ExhibitionToSave) {
  const translationData = {
    exhibition_id: masterId,
    language_code: 'ko',
    exhibition_title: exhibition.exhibition_title,
    artists: exhibition.artists || [],
    venue_name: exhibition.venue_name,
    city: '서울', // 기본값, 나중에 venue에서 가져올 수 있음
    description: exhibition.description,
    ticket_info: exhibition.ticket_price, // ticket_price -> ticket_info
    operating_hours: exhibition.operating_hours,
    website_url: exhibition.website_url,
    phone_number: exhibition.phone_number,
    // metadata는 별도 컬럼이 아니므로 description에 추가
    meta_description: `신뢰도: ${exhibition.confidence_score}%`
  };
  
  const { error } = await supabase
    .from('exhibitions_translations')
    .insert(translationData);
    
  if (error) {
    throw new Error(`Failed to save translation record: ${error.message}`);
  }
}

function determineStatus(startDate: string, endDate: string): string {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (today < start) return 'upcoming';
  if (today > end) return 'ended';
  return 'ongoing';
}