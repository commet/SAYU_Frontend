import { 
  Venue, 
  VenueListResponse, 
  VenueDetailResponse,
  CityWithCount,
  CountryWithCount,
  VenueSearchResult,
  VenueQueryParams
} from '@/types/venue';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// 현재 언어 설정 가져오기 (나중에 전역 상태 관리로 변경 가능)
const getCurrentLanguage = (): 'ko' | 'en' => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') === 'en' ? 'en' : 'ko';
  }
  return 'ko';
};

export const venueApi = {
  // 장소 목록 조회
  async getVenues(params: VenueQueryParams = {}): Promise<VenueListResponse> {
    const queryParams = new URLSearchParams();
    
    // 기본값 설정
    queryParams.append('lang', params.lang || getCurrentLanguage());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.country) queryParams.append('country', params.country);
    if (params.city) queryParams.append('city', params.city);
    if (params.type) queryParams.append('type', params.type);
    if (params.tier) queryParams.append('tier', params.tier.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.order) queryParams.append('order', params.order);

    const response = await fetch(`${API_BASE_URL}/api/venues?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch venues');
    }
    return response.json();
  },

  // 장소 상세 정보 조회
  async getVenue(id: string, lang?: 'ko' | 'en'): Promise<VenueDetailResponse> {
    return this.getVenueById(id, lang);
  },

  // 장소 상세 정보 조회 (내부 메서드)
  async getVenueById(id: string, lang?: 'ko' | 'en'): Promise<VenueDetailResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('lang', lang || getCurrentLanguage());

    const response = await fetch(`${API_BASE_URL}/api/venues/${id}?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch venue details');
    }
    return response.json();
  },

  // 장소 검색
  async searchVenues(
    query: string, 
    limit: number = 10,
    lang?: 'ko' | 'en'
  ): Promise<{ success: boolean; data: VenueSearchResult[]; query: string; language: string }> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    queryParams.append('limit', limit.toString());
    queryParams.append('lang', lang || getCurrentLanguage());

    const response = await fetch(`${API_BASE_URL}/api/venues/search?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to search venues');
    }
    return response.json();
  },

  // 도시 목록 조회 (장소 수 포함)
  async getCitiesWithCounts(
    country?: string,
    lang?: 'ko' | 'en'
  ): Promise<{ success: boolean; data: CityWithCount[]; language: string }> {
    const queryParams = new URLSearchParams();
    queryParams.append('lang', lang || getCurrentLanguage());
    if (country) queryParams.append('country', country);

    const response = await fetch(`${API_BASE_URL}/api/venues/cities?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }
    return response.json();
  },

  // 국가 목록 조회 (장소 수 포함)
  async getCountriesWithCounts(
    lang?: 'ko' | 'en'
  ): Promise<{ success: boolean; data: CountryWithCount[]; language: string }> {
    const queryParams = new URLSearchParams();
    queryParams.append('lang', lang || getCurrentLanguage());

    const response = await fetch(`${API_BASE_URL}/api/venues/countries?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    return response.json();
  },

  // 한국 주요 도시 목록
  getKoreanMajorCities(): { value: string; label_ko: string; label_en: string }[] {
    return [
      { value: '서울', label_ko: '서울', label_en: 'Seoul' },
      { value: '부산', label_ko: '부산', label_en: 'Busan' },
      { value: '대구', label_ko: '대구', label_en: 'Daegu' },
      { value: '인천', label_ko: '인천', label_en: 'Incheon' },
      { value: '광주', label_ko: '광주', label_en: 'Gwangju' },
      { value: '대전', label_ko: '대전', label_en: 'Daejeon' },
      { value: '울산', label_ko: '울산', label_en: 'Ulsan' },
      { value: '제주', label_ko: '제주', label_en: 'Jeju' },
    ];
  },

  // 인기 해외 도시 목록
  getPopularInternationalCities(): { value: string; label_ko: string; label_en: string; country: string }[] {
    return [
      { value: 'New York', label_ko: '뉴욕', label_en: 'New York', country: 'United States' },
      { value: 'Paris', label_ko: '파리', label_en: 'Paris', country: 'France' },
      { value: 'London', label_ko: '런던', label_en: 'London', country: 'United Kingdom' },
      { value: 'Tokyo', label_ko: '도쿄', label_en: 'Tokyo', country: 'Japan' },
      { value: 'Hong Kong', label_ko: '홍콩', label_en: 'Hong Kong', country: 'Hong Kong' },
      { value: 'Berlin', label_ko: '베를린', label_en: 'Berlin', country: 'Germany' },
      { value: 'Amsterdam', label_ko: '암스테르담', label_en: 'Amsterdam', country: 'Netherlands' },
      { value: 'Barcelona', label_ko: '바르셀로나', label_en: 'Barcelona', country: 'Spain' },
      { value: 'Milan', label_ko: '밀라노', label_en: 'Milan', country: 'Italy' },
      { value: 'Singapore', label_ko: '싱가포르', label_en: 'Singapore', country: 'Singapore' },
    ];
  }
};