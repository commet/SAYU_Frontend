import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
import Papa from 'papaparse'

interface ExhibitionData {
  title_ko: string
  title_en?: string
  venue_name: string
  start_date: string
  end_date: string
  description_ko?: string
  description_en?: string
  curator?: string
  genre?: string
  exhibition_type?: 'solo' | 'group' | 'special' | 'biennale' | 'permanent'
  ticket_price_adult?: number
  ticket_price_student?: number
  poster_url?: string
  website_url?: string
}

interface ParsedExhibition {
  master: any
  translation_ko: any
  translation_en?: any
  venue: any
}

interface BulkUpdateResult {
  success: boolean
  processed: number
  inserted: number
  updated: number
  errors: string[]
  details: {
    exhibitions: ParsedExhibition[]
    newVenues: string[]
  }
}

// CSV 데이터를 파싱하고 검증하는 함수
function parseExhibitionData(rawData: string, format: 'csv' | 'json'): ExhibitionData[] {
  try {
    if (format === 'csv') {
      const parsed = Papa.parse(rawData, {
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          if (field?.includes('price') && value) {
            return parseInt(value) || 0
          }
          return value?.trim() || ''
        }
      })
      return parsed.data as ExhibitionData[]
    } else {
      return JSON.parse(rawData) as ExhibitionData[]
    }
  } catch (error) {
    throw new Error(`데이터 파싱 실패: ${error}`)
  }
}

// 전시 데이터 검증
function validateExhibition(data: ExhibitionData, index: number): string[] {
  const errors: string[] = []
  
  if (!data.title_ko?.trim()) {
    errors.push(`Row ${index + 1}: 제목(title_ko)이 필수입니다`)
  }
  
  if (!data.venue_name?.trim()) {
    errors.push(`Row ${index + 1}: 미술관명(venue_name)이 필수입니다`)
  }
  
  if (!data.start_date) {
    errors.push(`Row ${index + 1}: 시작일(start_date)이 필수입니다`)
  } else if (isNaN(Date.parse(data.start_date))) {
    errors.push(`Row ${index + 1}: 올바른 시작일 형식이 아닙니다 (YYYY-MM-DD)`)
  }
  
  if (!data.end_date) {
    errors.push(`Row ${index + 1}: 종료일(end_date)이 필수입니다`)
  } else if (isNaN(Date.parse(data.end_date))) {
    errors.push(`Row ${index + 1}: 올바른 종료일 형식이 아닙니다 (YYYY-MM-DD)`)
  }
  
  if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
    errors.push(`Row ${index + 1}: 시작일이 종료일보다 늦습니다`)
  }
  
  return errors
}

// UUID 생성 함수
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 미술관 찾기 또는 생성
async function findOrCreateVenue(venueName: string) {
  // 기존 미술관 찾기
  const { data: existingVenue } = await supabase
    .from('venues_simple')
    .select('id')
    .eq('name_ko', venueName)
    .single()
  
  if (existingVenue) {
    return existingVenue.id
  }
  
  // 새 미술관 생성
  const newVenueId = generateUUID()
  const { error } = await supabase
    .from('venues_simple')
    .insert({
      id: newVenueId,
      name_ko: venueName,
      city: '서울',
      venue_type: 'gallery',
      is_major: false
    })
  
  if (error) {
    throw new Error(`미술관 생성 실패: ${venueName} - ${error.message}`)
  }
  
  return newVenueId
}

// 전시 상태 계산
function calculateExhibitionStatus(startDate: string, endDate: string): string {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (now < start) return 'upcoming'
  if (now > end) return 'ended'
  return 'ongoing'
}

// 전시 데이터를 DB 형식으로 변환
async function convertToDbFormat(exhibitions: ExhibitionData[]): Promise<ParsedExhibition[]> {
  const converted: ParsedExhibition[] = []
  const newVenues = new Set<string>()
  
  for (const exhibition of exhibitions) {
    try {
      // 미술관 ID 찾기/생성
      const venueId = await findOrCreateVenue(exhibition.venue_name)
      
      // 마스터 레코드 생성
      const masterId = generateUUID()
      const status = calculateExhibitionStatus(exhibition.start_date, exhibition.end_date)
      
      const master = {
        id: masterId,
        venue_id: venueId,
        start_date: exhibition.start_date,
        end_date: exhibition.end_date,
        status,
        exhibition_type: exhibition.exhibition_type || 'group',
        genre: exhibition.genre || 'contemporary',
        ticket_price_adult: exhibition.ticket_price_adult || 0,
        ticket_price_student: exhibition.ticket_price_student || 0,
        view_count: 0,
        like_count: 0,
        review_count: 0,
        is_featured: false
      }
      
      // 한국어 번역 레코드
      const translation_ko = {
        exhibition_id: masterId,
        language: 'ko',
        title: exhibition.title_ko,
        subtitle: '',
        description: exhibition.description_ko || '',
        curator: exhibition.curator || '',
        poster_url: exhibition.poster_url || null,
        website_url: exhibition.website_url || null
      }
      
      // 영어 번역 레코드 (선택적)
      let translation_en = null
      if (exhibition.title_en || exhibition.description_en) {
        translation_en = {
          exhibition_id: masterId,
          language: 'en',
          title: exhibition.title_en || exhibition.title_ko,
          subtitle: '',
          description: exhibition.description_en || '',
          curator: exhibition.curator || '',
          poster_url: exhibition.poster_url || null,
          website_url: exhibition.website_url || null
        }
      }
      
      converted.push({
        master,
        translation_ko,
        translation_en,
        venue: {
          id: venueId,
          name: exhibition.venue_name
        }
      })
      
      // 새 미술관 추적
      const { data: venueExists } = await supabase
        .from('venues_simple')
        .select('created_at')
        .eq('id', venueId)
        .single()
      
      if (venueExists && new Date(venueExists.created_at) > new Date(Date.now() - 60000)) {
        newVenues.add(exhibition.venue_name)
      }
      
    } catch (error) {
      throw new Error(`전시 "${exhibition.title_ko}" 처리 중 오류: ${error}`)
    }
  }
  
  return converted
}

// 일괄 삽입/업데이트 실행
async function executeBulkUpdate(parsedExhibitions: ParsedExhibition[]): Promise<{
  inserted: number
  updated: number
  errors: string[]
}> {
  let inserted = 0
  let updated = 0
  const errors: string[] = []
  
  for (const exhibition of parsedExhibitions) {
    try {
      // 기존 전시 확인 (제목과 미술관으로)
      const { data: existing } = await supabase
        .from('exhibitions_master')
        .select('id')
        .eq('venue_id', exhibition.venue.id)
        .eq('start_date', exhibition.master.start_date)
        .single()
      
      if (existing) {
        // 업데이트
        await supabase
          .from('exhibitions_master')
          .update(exhibition.master)
          .eq('id', existing.id)
        
        // 번역 업데이트
        await supabase
          .from('exhibitions_translations')
          .upsert([exhibition.translation_ko])
        
        if (exhibition.translation_en) {
          await supabase
            .from('exhibitions_translations')
            .upsert([exhibition.translation_en])
        }
        
        updated++
      } else {
        // 새로 삽입
        await supabase
          .from('exhibitions_master')
          .insert(exhibition.master)
        
        await supabase
          .from('exhibitions_translations')
          .insert([exhibition.translation_ko])
        
        if (exhibition.translation_en) {
          await supabase
            .from('exhibitions_translations')
            .insert([exhibition.translation_en])
        }
        
        inserted++
      }
    } catch (error) {
      errors.push(`전시 "${exhibition.translation_ko.title}" 저장 실패: ${error}`)
    }
  }
  
  return { inserted, updated, errors }
}

export async function POST(request: NextRequest) {
  try {
    const { data, format = 'csv' } = await request.json()
    
    if (!data) {
      return NextResponse.json(
        { error: '데이터가 제공되지 않았습니다' },
        { status: 400 }
      )
    }
    
    // 1. 데이터 파싱
    console.log('🔄 데이터 파싱 시작...')
    const exhibitions = parseExhibitionData(data, format)
    
    if (exhibitions.length === 0) {
      return NextResponse.json(
        { error: '처리할 데이터가 없습니다' },
        { status: 400 }
      )
    }
    
    // 2. 데이터 검증
    console.log('✅ 데이터 검증 중...')
    const validationErrors: string[] = []
    exhibitions.forEach((exhibition, index) => {
      const errors = validateExhibition(exhibition, index)
      validationErrors.push(...errors)
    })
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: '데이터 검증 실패', 
          details: validationErrors 
        },
        { status: 400 }
      )
    }
    
    // 3. DB 형식으로 변환
    console.log('🔄 DB 형식 변환 중...')
    const parsedExhibitions = await convertToDbFormat(exhibitions)
    
    // 4. 일괄 업데이트 실행
    console.log('💾 데이터베이스 업데이트 실행 중...')
    const result = await executeBulkUpdate(parsedExhibitions)
    
    const response: BulkUpdateResult = {
      success: true,
      processed: exhibitions.length,
      inserted: result.inserted,
      updated: result.updated,
      errors: result.errors,
      details: {
        exhibitions: parsedExhibitions,
        newVenues: Array.from(new Set(parsedExhibitions.map(e => e.venue.name)))
      }
    }
    
    console.log('✅ 일괄 업데이트 완료:', response)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ 일괄 업데이트 실패:', error)
    
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// 템플릿 다운로드 API
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const format = url.searchParams.get('format') || 'csv'
  
  if (format === 'csv') {
    const csvTemplate = `title_ko,title_en,venue_name,start_date,end_date,description_ko,description_en,curator,genre,exhibition_type,ticket_price_adult,ticket_price_student,poster_url,website_url
김현식 개인전,Kim Hyun-sik Solo Exhibition,갤러리현대,2024-03-01,2024-03-30,현대미술가 김현식의 개인전,Solo exhibition by contemporary artist Kim Hyun-sik,박미진,contemporary,solo,15000,10000,https://example.com/poster.jpg,https://example.com
혼합전시,Mixed Exhibition,국립현대미술관,2024-04-01,2024-05-31,다양한 작가들의 혼합전시,Mixed exhibition featuring various artists,이수정,contemporary,group,20000,15000,,
조각 특별전,Special Sculpture Exhibition,서울시립미술관,2024-06-01,2024-07-15,현대 조각 작품들의 특별전시,Special exhibition of contemporary sculptures,김동현,sculpture,special,12000,8000,,https://example.com`
    
    return new NextResponse(csvTemplate, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="exhibition_template.csv"'
      }
    })
  } else {
    const jsonTemplate = [
      {
        title_ko: "김현식 개인전",
        title_en: "Kim Hyun-sik Solo Exhibition",
        venue_name: "갤러리현대",
        start_date: "2024-03-01",
        end_date: "2024-03-30",
        description_ko: "현대미술가 김현식의 개인전",
        description_en: "Solo exhibition by contemporary artist Kim Hyun-sik",
        curator: "박미진",
        genre: "contemporary",
        exhibition_type: "solo",
        ticket_price_adult: 15000,
        ticket_price_student: 10000,
        poster_url: "https://example.com/poster.jpg",
        website_url: "https://example.com"
      }
    ]
    
    return NextResponse.json(jsonTemplate, {
      headers: {
        'Content-Disposition': 'attachment; filename="exhibition_template.json"'
      }
    })
  }
}