/**
 * SAYU 전시 정보 텍스트 파싱 엔진
 * 다양한 형식의 자연어 텍스트를 구조화된 데이터로 변환
 */

export interface ParsedExhibition {
  title: string;
  description?: string;
  venue_name: string;
  venue_city: string;
  venue_address?: string;
  start_date: string;
  end_date: string;
  admission_fee?: number;
  website_url?: string;
  image_url?: string;
  tags?: string[];
  status: 'draft' | 'upcoming' | 'ongoing' | 'ended';
  confidence: number; // 파싱 신뢰도 (0-100)
  raw_text: string; // 원본 텍스트
  parsing_errors: string[]; // 파싱 에러 목록
}

export interface ParsingPattern {
  name: string;
  regex: RegExp;
  extractor: (match: RegExpMatchArray, text: string) => Partial<ParsedExhibition>;
  priority: number; // 높을수록 우선순위
}

export class ExhibitionParser {
  private patterns: ParsingPattern[] = [];
  
  constructor() {
    this.initializePatterns();
  }

  /**
   * 파싱 패턴 초기화
   */
  private initializePatterns(): void {
    // 1. 한국 문화재청/박물관 표준 형식
    this.patterns.push({
      name: 'korean_standard',
      priority: 95,
      regex: /(?:전시명?[:：]?\s*)?([^\n]+?)\s*(?:전시기간?[:：]?\s*)?([\d]{4})[\.\/\-년]([\d]{1,2})[\.\/\-월]([\d]{1,2})일?\s*[~\-~−]\s*([\d]{4})[\.\/\-년]?([\d]{1,2})[\.\/\-월]([\d]{1,2})일?\s*(?:장소[:：]?\s*)?([^\n]+)/gm,
      extractor: (match, text) => ({
        title: match[1].trim(),
        start_date: `${match[2]}-${match[3].padStart(2, '0')}-${match[4].padStart(2, '0')}`,
        end_date: `${match[5]}-${match[6].padStart(2, '0')}-${match[7].padStart(2, '0')}`,
        venue_name: match[8].trim()
      })
    });

    // 2. 서울시립미술관 형식
    this.patterns.push({
      name: 'seoul_museum',
      priority: 90,
      regex: /《([^》]+)》.*?(?:(\d{4})[년\.](\d{1,2})[월\.](\d{1,2})일?\s*[~\-~−]\s*(\d{4})[년\.]?(\d{1,2})[월\.](\d{1,2})일?).*?(?:장소|개최|전시관)[:：]?\s*([^\n]+)/gs,
      extractor: (match, text) => ({
        title: match[1].trim(),
        start_date: `${match[2]}-${match[3].padStart(2, '0')}-${match[4].padStart(2, '0')}`,
        end_date: `${match[5]}-${match[6].padStart(2, '0')}-${match[7].padStart(2, '0')}`,
        venue_name: match[8].trim()
      })
    });

    // 3. 국립현대미술관 형식
    this.patterns.push({
      name: 'mmca_format',
      priority: 88,
      regex: /(.*?전시?)\s*.*?(\d{4})[\.\/\-년]\s*(\d{1,2})[\.\/\-월]\s*(\d{1,2})일?\s*[~\-~−~―]\s*(\d{4})[\.\/\-년]?\s*(\d{1,2})[\.\/\-월]\s*(\d{1,2})일?\s*.*(국립현대미술관|MMCA)[^\n]*/gm,
      extractor: (match, text) => ({
        title: match[1].trim().replace(/전시$/, ''),
        start_date: `${match[2]}-${match[3].padStart(2, '0')}-${match[4].padStart(2, '0')}`,
        end_date: `${match[5]}-${match[6].padStart(2, '0')}-${match[7].padStart(2, '0')}`,
        venue_name: match[8].includes('국립현대미술관') ? '국립현대미술관' : 'MMCA'
      })
    });

    // 4. 갤러리 형식 (사립 갤러리)
    this.patterns.push({
      name: 'gallery_format',
      priority: 85,
      regex: /([^\n]+?)\s*(?:전시|개인전|기획전|특별전).*?(\d{4})[\.\/\-년]\s*(\d{1,2})[\.\/\-월]\s*(\d{1,2})일?\s*[~\-~−]\s*(\d{4})[\.\/\-년]?\s*(\d{1,2})[\.\/\-월]\s*(\d{1,2})일?\s*.*?(갤러리\s*[^\s]+|아트센터\s*[^\s]+|미술관)/gm,
      extractor: (match, text) => ({
        title: match[1].trim(),
        start_date: `${match[2]}-${match[3].padStart(2, '0')}-${match[4].padStart(2, '0')}`,
        end_date: `${match[5]}-${match[6].padStart(2, '0')}-${match[7].padStart(2, '0')}`,
        venue_name: match[8].trim()
      })
    });

    // 5. 영어 형식
    this.patterns.push({
      name: 'english_format',
      priority: 80,
      regex: /([A-Z][^\n]+?)\s*(?:exhibition|show).*?(\d{1,2})[\/\-\.]\s?(\d{1,2})[\/\-\.](\d{4})\s*[~\-~−]\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\s*.*?(Museum|Gallery|Center)/gi,
      extractor: (match, text) => ({
        title: match[1].trim(),
        start_date: `${match[4]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`,
        end_date: `${match[7]}-${match[5].padStart(2, '0')}-${match[6].padStart(2, '0')}`,
        venue_name: match[8].trim()
      })
    });

    // 6. 일반 텍스트에서 날짜 패턴
    this.patterns.push({
      name: 'date_pattern',
      priority: 70,
      regex: /(\d{4})[년\.\/\-]\s*(\d{1,2})[월\.\/\-]\s*(\d{1,2})일?\s*[~\-~−~―]\s*(\d{4})[년\.\/\-]?\s*(\d{1,2})[월\.\/\-]\s*(\d{1,2})일?/g,
      extractor: (match, text) => ({
        start_date: `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`,
        end_date: `${match[4]}-${match[5].padStart(2, '0')}-${match[6].padStart(2, '0')}`
      })
    });

    // 7. 입장료 패턴
    this.patterns.push({
      name: 'admission_fee',
      priority: 60,
      regex: /(?:입장료|관람료|요금)[:：]?\s*(?:(\d{1,3}(?:,\d{3})*)\s*원|무료|free)/gi,
      extractor: (match, text) => ({
        admission_fee: match[1] ? parseInt(match[1].replace(/,/g, '')) : 0
      })
    });

    // 8. 웹사이트 URL 패턴
    this.patterns.push({
      name: 'website_url',
      priority: 50,
      regex: /(https?:\/\/[^\s]+)/gi,
      extractor: (match, text) => ({
        website_url: match[1]
      })
    });
  }

  /**
   * 메인 파싱 함수
   */
  public parse(text: string): ParsedExhibition {
    const result: ParsedExhibition = {
      title: '',
      venue_name: '',
      venue_city: '',
      start_date: '',
      end_date: '',
      status: 'draft',
      confidence: 0,
      raw_text: text,
      parsing_errors: []
    };

    let bestMatch: Partial<ParsedExhibition> = {};
    let highestConfidence = 0;

    // 정규화된 텍스트
    const normalizedText = this.normalizeText(text);

    // 각 패턴으로 시도
    for (const pattern of this.patterns) {
      try {
        pattern.regex.lastIndex = 0; // 정규식 상태 초기화
        const matches = Array.from(normalizedText.matchAll(pattern.regex));
        
        for (const match of matches) {
          const extracted = pattern.extractor(match, normalizedText);
          
          // 신뢰도 계산
          const confidence = this.calculateConfidence(extracted, pattern, normalizedText);
          
          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            bestMatch = { ...bestMatch, ...extracted };
          }
        }
      } catch (error) {
        result.parsing_errors.push(`Pattern "${pattern.name}": ${error.message}`);
      }
    }

    // 결과 병합
    Object.assign(result, bestMatch);

    // 후처리
    this.postProcess(result);

    // 최종 신뢰도 설정
    result.confidence = this.calculateFinalConfidence(result);

    return result;
  }

  /**
   * 텍스트 정규화
   */
  private normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/[~−―]/g, '-')
      .replace(/：/g, ':')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 신뢰도 계산
   */
  private calculateConfidence(
    extracted: Partial<ParsedExhibition>, 
    pattern: ParsingPattern,
    text: string
  ): number {
    let confidence = pattern.priority;

    // 필수 필드 체크
    if (extracted.title) confidence += 15;
    if (extracted.venue_name) confidence += 15;
    if (extracted.start_date && extracted.end_date) confidence += 20;

    // 날짜 유효성 체크
    if (extracted.start_date && extracted.end_date) {
      const startDate = new Date(extracted.start_date);
      const endDate = new Date(extracted.end_date);
      
      if (startDate <= endDate && !isNaN(startDate.getTime())) {
        confidence += 10;
      } else {
        confidence -= 20;
      }
    }

    // 제목 품질 체크
    if (extracted.title) {
      if (extracted.title.length > 50) confidence -= 10;
      if (extracted.title.length < 5) confidence -= 15;
      if (/[가-힣]/.test(extracted.title) || /[A-Za-z]/.test(extracted.title)) {
        confidence += 5;
      }
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * 후처리
   */
  private postProcess(result: ParsedExhibition): void {
    // 제목 정리
    if (result.title) {
      result.title = result.title
        .replace(/^[:\-\s]*/, '')
        .replace(/[:\-\s]*$/, '')
        .replace(/《|》/g, '')
        .trim();
    }

    // 장소명에서 도시 추출
    if (result.venue_name && !result.venue_city) {
      result.venue_city = this.extractCity(result.venue_name);
    }

    // 상태 결정
    if (result.start_date && result.end_date) {
      const now = new Date();
      const startDate = new Date(result.start_date);
      const endDate = new Date(result.end_date);

      if (now < startDate) {
        result.status = 'upcoming';
      } else if (now >= startDate && now <= endDate) {
        result.status = 'ongoing';
      } else {
        result.status = 'ended';
      }
    }

    // 태그 생성
    result.tags = this.generateTags(result);
  }

  /**
   * 도시명 추출
   */
  private extractCity(venueText: string): string {
    const cityPatterns = [
      /서울/,
      /부산/,
      /대구/,
      /인천/,
      /광주/,
      /대전/,
      /울산/,
      /세종/,
      /경기/,
      /강원/,
      /충북/,
      /충남/,
      /전북/,
      /전남/,
      /경북/,
      /경남/,
      /제주/
    ];

    for (const pattern of cityPatterns) {
      if (pattern.test(venueText)) {
        return pattern.source;
      }
    }

    return '서울'; // 기본값
  }

  /**
   * 태그 생성
   */
  private generateTags(result: ParsedExhibition): string[] {
    const tags: string[] = [];

    // 장르별 태그
    if (result.title) {
      const title = result.title.toLowerCase();
      
      if (/현대|contemporary/i.test(title)) tags.push('현대미술');
      if (/전통|traditional/i.test(title)) tags.push('전통예술');
      if (/사진|photo/i.test(title)) tags.push('사진');
      if (/조각|sculpture/i.test(title)) tags.push('조각');
      if (/회화|painting/i.test(title)) tags.push('회화');
      if (/(디지털|digital|미디어|media)/i.test(title)) tags.push('미디어아트');
      if (/(설치|installation)/i.test(title)) tags.push('설치미술');
    }

    // 입장료 기반 태그
    if (result.admission_fee === 0) {
      tags.push('무료관람');
    }

    // 장소 기반 태그
    if (result.venue_name) {
      if (/국립/i.test(result.venue_name)) tags.push('국립미술관');
      if (/시립/i.test(result.venue_name)) tags.push('시립미술관');
      if (/갤러리/i.test(result.venue_name)) tags.push('갤러리');
    }

    return [...new Set(tags)]; // 중복 제거
  }

  /**
   * 최종 신뢰도 계산
   */
  private calculateFinalConfidence(result: ParsedExhibition): number {
    let score = 0;
    let maxScore = 0;

    // 필수 항목
    maxScore += 30;
    if (result.title && result.title.length > 0) score += 15;
    if (result.venue_name && result.venue_name.length > 0) score += 15;

    maxScore += 25;
    if (result.start_date && result.end_date) {
      const startDate = new Date(result.start_date);
      const endDate = new Date(result.end_date);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate) {
        score += 25;
      }
    }

    // 선택 항목
    maxScore += 45;
    if (result.venue_city) score += 10;
    if (result.venue_address) score += 10;
    if (result.description) score += 10;
    if (result.admission_fee !== undefined) score += 5;
    if (result.website_url) score += 5;
    if (result.tags && result.tags.length > 0) score += 5;

    return Math.round((score / maxScore) * 100);
  }

  /**
   * 배치 파싱 (여러 전시 정보 동시 처리)
   */
  public parseBatch(texts: string[]): ParsedExhibition[] {
    return texts.map(text => this.parse(text));
  }

  /**
   * 파싱 결과 검증
   */
  public validate(result: ParsedExhibition): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!result.title || result.title.length < 2) {
      errors.push('전시명이 너무 짧거나 없습니다');
    }

    if (!result.venue_name || result.venue_name.length < 2) {
      errors.push('장소명이 너무 짧거나 없습니다');
    }

    if (!result.start_date || !result.end_date) {
      errors.push('전시 기간이 설정되지 않았습니다');
    } else {
      const startDate = new Date(result.start_date);
      const endDate = new Date(result.end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        errors.push('날짜 형식이 올바르지 않습니다');
      } else if (startDate > endDate) {
        errors.push('시작일이 종료일보다 늦습니다');
      }
    }

    if (result.website_url && !this.isValidUrl(result.website_url)) {
      errors.push('웹사이트 URL 형식이 올바르지 않습니다');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * URL 유효성 검사
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * SQL 생성
   */
  public generateSQL(result: ParsedExhibition): string {
    const escapedValues = {
      title: result.title ? `'${result.title.replace(/'/g, "''")}'` : 'NULL',
      description: result.description ? `'${result.description.replace(/'/g, "''")}'` : 'NULL',
      venue_name: result.venue_name ? `'${result.venue_name.replace(/'/g, "''")}'` : 'NULL',
      venue_city: result.venue_city ? `'${result.venue_city.replace(/'/g, "''")}'` : 'NULL',
      venue_address: result.venue_address ? `'${result.venue_address.replace(/'/g, "''")}'` : 'NULL',
      start_date: result.start_date ? `'${result.start_date}'` : 'NULL',
      end_date: result.end_date ? `'${result.end_date}'` : 'NULL',
      admission_fee: result.admission_fee !== undefined ? result.admission_fee.toString() : 'NULL',
      website_url: result.website_url ? `'${result.website_url.replace(/'/g, "''")}'` : 'NULL',
      image_url: result.image_url ? `'${result.image_url.replace(/'/g, "''")}'` : 'NULL',
      tags: result.tags && result.tags.length > 0 ? `'${JSON.stringify(result.tags).replace(/'/g, "''")}'` : 'NULL',
      status: `'${result.status}'`,
    };

    return `INSERT INTO exhibitions (
  title, 
  description, 
  venue_name, 
  venue_city, 
  venue_address, 
  start_date, 
  end_date, 
  admission_fee, 
  website_url, 
  image_url, 
  tags, 
  status,
  view_count,
  like_count,
  created_at,
  updated_at
) VALUES (
  ${escapedValues.title},
  ${escapedValues.description},
  ${escapedValues.venue_name},
  ${escapedValues.venue_city},
  ${escapedValues.venue_address},
  ${escapedValues.start_date},
  ${escapedValues.end_date},
  ${escapedValues.admission_fee},
  ${escapedValues.website_url},
  ${escapedValues.image_url},
  ${escapedValues.tags},
  ${escapedValues.status},
  0,
  0,
  NOW(),
  NOW()
);`;
  }
}

// 싱글톤 인스턴스
export const exhibitionParser = new ExhibitionParser();

// 편의 함수들
export function parseExhibitionText(text: string): ParsedExhibition {
  return exhibitionParser.parse(text);
}

export function parseMultipleExhibitions(texts: string[]): ParsedExhibition[] {
  return exhibitionParser.parseBatch(texts);
}

export function validateParsedExhibition(result: ParsedExhibition) {
  return exhibitionParser.validate(result);
}

export function generateExhibitionSQL(result: ParsedExhibition): string {
  return exhibitionParser.generateSQL(result);
}