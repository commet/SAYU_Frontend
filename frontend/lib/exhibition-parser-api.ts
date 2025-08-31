/**
 * 전시 파서 API 연동 모듈
 */

import { ParsedExhibition } from './exhibition-parser';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SaveExhibitionRequest {
  exhibition: ParsedExhibition;
  overwrite?: boolean;
  tags?: string[];
}

export interface ExhibitionSaveResult {
  id: string;
  created: boolean;
  updated: boolean;
  conflicts?: string[];
}

export class ExhibitionParserAPI {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || '';
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/api/admin/exhibitions${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data || data };
      } else {
        return { 
          success: false, 
          error: data.error || 'API 요청 실패',
          message: data.message 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '네트워크 오류' 
      };
    }
  }

  /**
   * 파싱된 전시 정보를 데이터베이스에 저장
   */
  async saveExhibition(
    exhibition: ParsedExhibition, 
    options: { overwrite?: boolean } = {}
  ): Promise<ApiResponse<ExhibitionSaveResult>> {
    // 전시 데이터 변환
    const exhibitionData = {
      title: exhibition.title,
      description: exhibition.description,
      venue_name: exhibition.venue_name,
      venue_city: exhibition.venue_city,
      venue_address: exhibition.venue_address,
      start_date: exhibition.start_date,
      end_date: exhibition.end_date,
      admission_fee: exhibition.admission_fee,
      website_url: exhibition.website_url,
      image_url: exhibition.image_url,
      tags: exhibition.tags,
      status: exhibition.status,
      raw_text: exhibition.raw_text,
      parsing_confidence: exhibition.confidence,
      parsing_errors: exhibition.parsing_errors
    };

    return this.request<ExhibitionSaveResult>('/parse-and-save', {
      method: 'POST',
      body: JSON.stringify({
        exhibition: exhibitionData,
        ...options
      })
    });
  }

  /**
   * 여러 전시를 배치로 저장
   */
  async saveBatchExhibitions(
    exhibitions: ParsedExhibition[],
    options: { 
      overwrite?: boolean;
      skipInvalid?: boolean;
      minConfidence?: number;
    } = {}
  ): Promise<ApiResponse<ExhibitionSaveResult[]>> {
    const validExhibitions = exhibitions.filter(ex => 
      ex.confidence >= (options.minConfidence || 60)
    );

    return this.request<ExhibitionSaveResult[]>('/parse-and-save-batch', {
      method: 'POST',
      body: JSON.stringify({
        exhibitions: validExhibitions.map(ex => ({
          title: ex.title,
          description: ex.description,
          venue_name: ex.venue_name,
          venue_city: ex.venue_city,
          venue_address: ex.venue_address,
          start_date: ex.start_date,
          end_date: ex.end_date,
          admission_fee: ex.admission_fee,
          website_url: ex.website_url,
          image_url: ex.image_url,
          tags: ex.tags,
          status: ex.status,
          raw_text: ex.raw_text,
          parsing_confidence: ex.confidence,
          parsing_errors: ex.parsing_errors
        })),
        ...options
      })
    });
  }

  /**
   * 전시 중복 검사
   */
  async checkDuplicates(
    exhibitions: ParsedExhibition[]
  ): Promise<ApiResponse<{ duplicates: string[]; suggestions: any[] }>> {
    return this.request<{ duplicates: string[]; suggestions: any[] }>('/check-duplicates', {
      method: 'POST',
      body: JSON.stringify({
        exhibitions: exhibitions.map(ex => ({
          title: ex.title,
          venue_name: ex.venue_name,
          start_date: ex.start_date,
          end_date: ex.end_date
        }))
      })
    });
  }

  /**
   * 파싱 통계 조회
   */
  async getParsingStats(): Promise<ApiResponse<{
    totalParsed: number;
    successRate: number;
    avgConfidence: number;
    commonErrors: string[];
    recentActivity: any[];
  }>> {
    return this.request('/parsing-stats');
  }

  /**
   * 이미지 URL 자동 생성 (AI 이미지 검색 기반)
   */
  async generateImageUrl(
    title: string, 
    venueInfo: string
  ): Promise<ApiResponse<{ imageUrl: string; source: string }>> {
    return this.request<{ imageUrl: string; source: string }>('/generate-image', {
      method: 'POST',
      body: JSON.stringify({
        title,
        venue: venueInfo
      })
    });
  }

  /**
   * 태그 자동 추천
   */
  async suggestTags(
    title: string,
    description?: string
  ): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/suggest-tags', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description
      })
    });
  }

  /**
   * 장소 정보 보정 (주소, 좌표 등)
   */
  async enrichVenueInfo(
    venueName: string,
    city: string
  ): Promise<ApiResponse<{
    fullAddress: string;
    coordinates?: { lat: number; lng: number };
    phone?: string;
    website?: string;
  }>> {
    return this.request('/enrich-venue', {
      method: 'POST',
      body: JSON.stringify({
        venue_name: venueName,
        venue_city: city
      })
    });
  }

  /**
   * 파싱 기록 조회
   */
  async getParsingHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{
    items: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    return this.request(`/parsing-history?page=${page}&limit=${limit}`);
  }

  /**
   * 파싱 패턴 성능 분석
   */
  async analyzePatterns(): Promise<ApiResponse<{
    patterns: Array<{
      name: string;
      successRate: number;
      avgConfidence: number;
      commonFailures: string[];
    }>;
  }>> {
    return this.request('/analyze-patterns');
  }
}

// 싱글톤 인스턴스
export const exhibitionParserAPI = new ExhibitionParserAPI();

// 편의 함수들
export async function saveExhibitionToDB(
  exhibition: ParsedExhibition,
  overwrite: boolean = false
) {
  return exhibitionParserAPI.saveExhibition(exhibition, { overwrite });
}

export async function saveBatchExhibitionsToDB(
  exhibitions: ParsedExhibition[],
  options?: { overwrite?: boolean; minConfidence?: number }
) {
  return exhibitionParserAPI.saveBatchExhibitions(exhibitions, options);
}

export async function checkExhibitionDuplicates(exhibitions: ParsedExhibition[]) {
  return exhibitionParserAPI.checkDuplicates(exhibitions);
}

export async function enhanceExhibitionData(exhibition: ParsedExhibition) {
  const enhancements: Partial<ParsedExhibition> = {};

  // 이미지 URL 생성
  if (!exhibition.image_url && exhibition.title && exhibition.venue_name) {
    const imageResult = await exhibitionParserAPI.generateImageUrl(
      exhibition.title,
      exhibition.venue_name
    );
    if (imageResult.success && imageResult.data) {
      enhancements.image_url = imageResult.data.imageUrl;
    }
  }

  // 태그 추천
  if (!exhibition.tags || exhibition.tags.length === 0) {
    const tagsResult = await exhibitionParserAPI.suggestTags(
      exhibition.title,
      exhibition.description
    );
    if (tagsResult.success && tagsResult.data) {
      enhancements.tags = tagsResult.data;
    }
  }

  // 장소 정보 보정
  if (exhibition.venue_name && exhibition.venue_city && !exhibition.venue_address) {
    const venueResult = await exhibitionParserAPI.enrichVenueInfo(
      exhibition.venue_name,
      exhibition.venue_city
    );
    if (venueResult.success && venueResult.data) {
      enhancements.venue_address = venueResult.data.fullAddress;
      enhancements.website_url = enhancements.website_url || venueResult.data.website;
    }
  }

  return { ...exhibition, ...enhancements };
}