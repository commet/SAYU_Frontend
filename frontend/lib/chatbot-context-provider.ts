// 페이지별 동적 컨텍스트 제공자
// 각 페이지에서 실제 데이터를 챗봇에 전달

import { createClient } from '@/lib/supabase/client'

// 주요 미술관 목록 정의 (우선순위 순)
const MAJOR_VENUES = [
  '국립현대미술관',
  '서울시립미술관',
  '리움미술관',
  '호암미술관',
  '아모레퍼시픽미술관',
  '한가람미술관',
  '예술의전당',
  'DDP',
  '동대문디자인플라자',
  '대림미술관',
  '국제갤러리',
  '삼성미술관',
  '리움',
  'MMCA',
  'SeMA',
  'K현대미술관',
  '로델갤러리',
  '석파정 서울미술관'
]

// 전시 페이지 데이터 로더
export async function loadExhibitionsContext() {
  try {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    
    console.log('[loadExhibitionsContext] Loading exhibitions for date:', today)
    
    // 주요 미술관 전시 우선 가져오기 (각 미술관처 1-2개씩 균형있게)
    const majorVenueExhibitions: any[] = []
    const selectedVenues = new Set<string>()
    
    // 각 주요 미술관에서 1개씩 먼저 가져오기
    for (const venue of MAJOR_VENUES) {
      if (majorVenueExhibitions.length >= 6) break
      
      const { data } = await supabase
        .from('exhibitions')
        .select('id, title_local, venue_name, start_date, end_date, admission_fee, tags, view_count')
        .lte('start_date', today)
        .gte('end_date', today)
        .eq('venue_name', venue)
        .limit(1)
      
      if (data && data.length > 0) {
        majorVenueExhibitions.push(data[0])
        selectedVenues.add(venue)
      }
    }
    
    // 아직 6개가 안 되면 다시 돌면서 추가
    if (majorVenueExhibitions.length < 6) {
      for (const venue of MAJOR_VENUES) {
        if (majorVenueExhibitions.length >= 6) break
        if (selectedVenues.has(venue)) continue
        
        const { data } = await supabase
          .from('exhibitions')
          .select('id, title_local, venue_name, start_date, end_date, admission_fee, tags, view_count')
          .lte('start_date', today)
          .gte('end_date', today)
          .eq('venue_name', venue)
          .limit(2)
        
        if (data) {
          majorVenueExhibitions.push(...data.slice(0, 6 - majorVenueExhibitions.length))
        }
      }
    }
    
    // 나머지 전시 가져오기 (주요 미술관 제외)
    const remainingLimit = 10 - (majorVenueExhibitions?.length || 0)
    let otherExhibitions: any[] = []
    
    if (remainingLimit > 0) {
      const { data } = await supabase
        .from('exhibitions')
        .select('id, title_local, venue_name, start_date, end_date, admission_fee, tags, view_count')
        .lte('start_date', today)
        .gte('end_date', today)
        .not('venue_name', 'in', `(${MAJOR_VENUES.map(v => `"${v}"`).join(',')})`)
        .order('view_count', { ascending: false, nullsFirst: false })
        .limit(remainingLimit)
      
      otherExhibitions = data || []
    }
    
    // 주요 미술관 + 기타 전시 합치기
    const currentExhibitions = [...(majorVenueExhibitions || []), ...otherExhibitions]
    
    const count = await supabase
      .from('exhibitions')
      .select('*', { count: 'exact', head: true })
      .lte('start_date', today)
      .gte('end_date', today)
    
    console.log('[loadExhibitionsContext] Major venues:', majorVenueExhibitions?.length, 'Others:', otherExhibitions.length)
    
    console.log('[loadExhibitionsContext] Total current exhibitions:', count.count, 'Loaded:', currentExhibitions?.length)
    
    // 곧 시작하는 전시 (7일 이내)
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const { data: upcomingExhibitions } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, start_date, end_date, admission_fee')
      .gt('start_date', today)
      .lte('start_date', sevenDaysLater)
      .order('start_date', { ascending: true })
      .limit(5)
    
    // 마감 임박 전시 (7일 이내)
    const { data: endingSoon } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, start_date, end_date')
      .gte('end_date', today)
      .lte('end_date', sevenDaysLater)
      .order('end_date', { ascending: true })
      .limit(5)
    
    // 인기 전시 (주요 미술관 우선, 그 다음 view_count)
    const { data: popularExhibitions } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, view_count')
      .lte('start_date', today)
      .gte('end_date', today)
      .in('venue_name', MAJOR_VENUES)
      .limit(5)
    
    // 무료 전시
    const { data: freeExhibitions } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name')
      .gte('end_date', today)
      .or('admission_fee.eq.0,admission_fee.is.null')
      .limit(5)
    
    return {
      current: currentExhibitions || [],
      upcoming: upcomingExhibitions || [],
      endingSoon: endingSoon || [],
      popular: popularExhibitions || [],
      free: freeExhibitions || [],
      totalCurrent: count.count || 0,
      loadedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to load exhibitions context:', error)
    return {
      current: [],
      upcoming: [],
      endingSoon: [],
      popular: [],
      free: [],
      totalCurrent: 0,
      error: true
    }
  }
}

// 갤러리 페이지 데이터 로더
export async function loadGalleryContext(userId?: string) {
  try {
    const supabase = createClient()
    
    // 추천 작품 (임시로 랜덤)
    const { data: featuredArtworks } = await supabase
      .from('artworks')
      .select('id, title, artist, year, style, image_url')
      .limit(20)
    
    // 사용자가 저장한 작품 (로그인한 경우)
    let savedArtworks = []
    if (userId) {
      const { data } = await supabase
        .from('user_saved_artworks')
        .select('artwork_id, artworks(title, artist)')
        .eq('user_id', userId)
        .limit(10)
      savedArtworks = data || []
    }
    
    // 인기 작가
    const popularArtists = [
      '클로드 모네', '빈센트 반 고흐', '파블로 피카소',
      '김환기', '박수근', '이중섭'
    ]
    
    // 작품 스타일
    const artStyles = [
      '인상주의', '표현주의', '추상화', '사실주의',
      '큐비즘', '초현실주의', '팝아트', '미니멀리즘'
    ]
    
    return {
      featured: featuredArtworks || [],
      saved: savedArtworks,
      popularArtists,
      artStyles,
      totalArtworks: featuredArtworks?.length || 0,
      loadedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to load gallery context:', error)
    return {
      featured: [],
      saved: [],
      popularArtists: [],
      artStyles: [],
      totalArtworks: 0,
      error: true
    }
  }
}

// 프로필 페이지 데이터 로더
export async function loadProfileContext(userId: string, userType: string) {
  try {
    const supabase = createClient()
    
    // 사용자 활동 통계
    const { data: userStats } = await supabase
      .from('user_profiles')
      .select('exhibitions_visited, artworks_saved, quiz_completed_at, badges')
      .eq('id', userId)
      .single()
    
    // 최근 활동
    const { data: recentActivities } = await supabase
      .from('user_activities')
      .select('activity_type, activity_data, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    // APT 유형별 추천
    const aptRecommendations = getAPTRecommendations(userType)
    
    return {
      stats: userStats || {
        exhibitions_visited: 0,
        artworks_saved: 0,
        quiz_completed_at: null,
        badges: []
      },
      recentActivities: recentActivities || [],
      recommendations: aptRecommendations,
      userType,
      loadedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to load profile context:', error)
    return {
      stats: {},
      recentActivities: [],
      recommendations: [],
      userType,
      error: true
    }
  }
}

// 커뮤니티 페이지 데이터 로더
export async function loadCommunityContext() {
  try {
    const supabase = createClient()
    
    // 활발한 토론
    const { data: activeDiscussions } = await supabase
      .from('discussions')
      .select('id, title, replies_count, created_at')
      .order('replies_count', { ascending: false })
      .limit(5)
    
    // 최근 리뷰
    const { data: recentReviews } = await supabase
      .from('exhibition_reviews')
      .select('id, exhibition_title, rating, review_text, user_name')
      .order('created_at', { ascending: false })
      .limit(5)
    
    // 동행자 매칭 현황
    const { data: matchingRequests } = await supabase
      .from('companion_requests')
      .select('id, exhibition_title, preferred_date, user_type')
      .eq('status', 'open')
      .limit(5)
    
    return {
      discussions: activeDiscussions || [],
      reviews: recentReviews || [],
      matchingRequests: matchingRequests || [],
      totalDiscussions: activeDiscussions?.length || 0,
      loadedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to load community context:', error)
    return {
      discussions: [],
      reviews: [],
      matchingRequests: [],
      totalDiscussions: 0,
      error: true
    }
  }
}

// APT 유형별 추천 생성
function getAPTRecommendations(userType: string) {
  const recommendations: Record<string, any> = {
    'LAEF': {
      exhibitions: ['색채의 향연', '추상 표현주의', '감성의 여정'],
      artists: ['마크 로스코', '이우환', '제임스 터렐'],
      activities: ['혼자 조용히 감상하기', '감정 일기 쓰기', '명상하며 관람']
    },
    'SAEF': {
      exhibitions: ['인터랙티브 미디어아트', '팀랩 전시', '참여형 설치미술'],
      artists: ['쿠사마 야요이', '올라퍼 엘리아손', 'KAWS'],
      activities: ['친구와 함께 관람', 'SNS 공유하기', '아트 파티 참가']
    },
    'LAMC': {
      exhibitions: ['미술사 특별전', '거장의 회고전', '학술 기획전'],
      artists: ['레오나르도 다빈치', '렘브란트', '카라바조'],
      activities: ['도슨트 투어', '학술 강연 참가', '작품 연구']
    },
    'SRMF': {
      exhibitions: ['현대미술 실험전', '미디어 아트', '기술과 예술의 만남'],
      artists: ['백남준', '라파엘 로자노헤머', '팀랩'],
      activities: ['워크샵 참가', '작가와의 대화', '기술 시연 관람']
    }
  }
  
  return recommendations[userType] || recommendations['LAEF']
}

// 메인 컨텍스트 로더
export async function loadPageContext(page: string, userId?: string, userType?: string) {
  const baseContext = {
    page,
    timestamp: new Date().toISOString()
  }
  
  // pathname에서 핵심 페이지 타입 추출 (예: /exhibitions -> exhibitions)
  const pageType = page.split('/').filter(Boolean)[0] || 'home'
  
  switch(pageType) {
    case 'exhibitions':
    case 'exhibition':
      return {
        ...baseContext,
        exhibitions: await loadExhibitionsContext()
      }
    
    case 'gallery':
      return {
        ...baseContext,
        gallery: await loadGalleryContext(userId)
      }
    
    case 'profile':
      if (userId && userType) {
        return {
          ...baseContext,
          profile: await loadProfileContext(userId, userType)
        }
      }
      return baseContext
    
    case 'community':
      return {
        ...baseContext,
        community: await loadCommunityContext()
      }
    
    case 'quiz':
    case 'results':
      // 퀴즈와 결과 페이지는 정적 지식만 사용
      return baseContext
    
    default:
      // 홈페이지나 기타 페이지는 기본 컨텍스트만
      return baseContext
  }
}

// 캐시 관리
class ContextCache {
  private cache: Map<string, any> = new Map()
  private ttl: number = 5 * 60 * 1000 // 5분
  
  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
  
  get(key: string) {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }
  
  clear() {
    this.cache.clear()
  }
}

export const contextCache = new ContextCache()