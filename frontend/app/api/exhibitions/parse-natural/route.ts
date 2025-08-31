import { NextRequest, NextResponse } from 'next/server';

interface ParsedExhibition {
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
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Text input is required'
      }, { status: 400 });
    }

    // AI 파싱 로직 - 정규식과 키워드 기반으로 시작
    const parsed = await parseExhibitionText(text);
    
    return NextResponse.json({
      success: true,
      data: parsed
    });

  } catch (error) {
    console.error('Exhibition parsing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to parse exhibition text'
    }, { status: 500 });
  }
}

async function parseExhibitionText(text: string): Promise<ParsedExhibition[]> {
  const results: ParsedExhibition[] = [];
  
  // 여러 전시가 한번에 입력될 수 있으므로 구분
  const exhibitions = splitExhibitions(text);
  
  for (const exhibitionText of exhibitions) {
    // 1차: 정규식 기반 파싱
    const regexParsed = await parseSingleExhibition(exhibitionText);
    
    if (regexParsed && regexParsed.confidence_score >= 70) {
      // 신뢰도가 높으면 정규식 결과 사용
      results.push(regexParsed);
    } else {
      // 신뢰도가 낮으면 AI 파싱 시도
      try {
        const aiParsed = await parseWithAI(exhibitionText);
        if (aiParsed) {
          results.push(aiParsed);
        } else if (regexParsed) {
          // AI 파싱 실패시 정규식 결과라도 반환
          results.push(regexParsed);
        }
      } catch (error) {
        console.error('AI parsing failed:', error);
        if (regexParsed) {
          results.push(regexParsed);
        }
      }
    }
  }
  
  return results;
}

// OpenAI를 사용한 스마트 파싱
async function parseWithAI(text: string): Promise<ParsedExhibition | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null; // API 키가 없으면 스킵
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `다음 텍스트에서 전시회 정보를 JSON 형식으로 추출해주세요. 
정확한 정보만 추출하고, 불확실한 경우 null을 반환하세요.

응답 형식:
{
  "exhibition_title": "전시제목",
  "venue_name": "미술관명",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD", 
  "ticket_price": "가격정보",
  "artists": ["작가1", "작가2"],
  "description": "전시설명",
  "genre": "contemporary|painting|sculpture|photography|media|installation|craft|design",
  "exhibition_type": "solo|group|special|biennale|permanent",
  "operating_hours": "운영시간",
  "website_url": "웹사이트",
  "phone_number": "전화번호"
}`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    
    if (!content) {
      return null;
    }

    // JSON 파싱 시도
    const parsed = JSON.parse(content);
    
    // 필수 필드 검증
    if (!parsed.exhibition_title || !parsed.venue_name || !parsed.start_date || !parsed.end_date) {
      return null;
    }

    return {
      ...parsed,
      confidence_score: 85, // AI 파싱은 높은 신뢰도 부여
      raw_text: text
    };

  } catch (error) {
    console.error('AI parsing error:', error);
    return null;
  }
}

function splitExhibitions(text: string): string[] {
  // 전시 구분 패턴
  const separators = [
    /\n\s*[-=]{3,}\s*\n/,  // --- 또는 ===
    /\n\s*\d+\.\s*/,       // 1. 2. 3.
    /\n(?=.*전시.*\n)/,     // 새로운 전시 시작으로 추정되는 줄
  ];
  
  let exhibitions = [text];
  
  for (const separator of separators) {
    const newExhibitions: string[] = [];
    for (const ex of exhibitions) {
      newExhibitions.push(...ex.split(separator));
    }
    exhibitions = newExhibitions;
  }
  
  return exhibitions.filter(ex => ex.trim().length > 50); // 너무 짧은 것 제외
}

async function parseSingleExhibition(text: string): Promise<ParsedExhibition | null> {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // 제목 추출 (첫 번째 줄 또는 가장 긴 줄)
  const title = extractTitle(lines);
  if (!title) return null;
  
  // 날짜 추출
  const dates = extractDates(text);
  if (!dates.start_date || !dates.end_date) return null;
  
  // 미술관/갤러리 추출
  const venue = extractVenue(text);
  if (!venue) return null;
  
  // 가격 추출
  const price = extractPrice(text);
  
  // 기타 정보 추출
  const artists = extractArtists(text);
  const genre = inferGenre(text);
  const type = inferExhibitionType(text);
  const hours = extractOperatingHours(text);
  const website = extractWebsite(text);
  const phone = extractPhone(text);
  const description = extractDescription(text, title);
  
  // 신뢰도 계산
  const confidence = calculateConfidence({
    title,
    venue,
    dates,
    price,
    artists,
    text
  });
  
  return {
    exhibition_title: title,
    venue_name: venue,
    start_date: dates.start_date,
    end_date: dates.end_date,
    ticket_price: price,
    description,
    artists,
    genre,
    exhibition_type: type,
    operating_hours: hours,
    website_url: website,
    phone_number: phone,
    confidence_score: confidence,
    raw_text: text
  };
}

function extractTitle(lines: string[]): string | null {
  // 첫 번째 줄이 제목일 가능성이 높음
  if (lines.length > 0) {
    const firstLine = lines[0];
    // 너무 짧거나 날짜/가격만 있는 경우 제외
    if (firstLine.length > 5 && !isDateOrPrice(firstLine)) {
      return firstLine;
    }
  }
  
  // 가장 긴 줄을 제목으로 추정
  const longestLine = lines.reduce((longest, current) => 
    current.length > longest.length ? current : longest, '');
  
  return longestLine.length > 5 ? longestLine : null;
}

function extractDates(text: string): { start_date: string | null; end_date: string | null } {
  // 다양한 날짜 형식 매칭
  const datePatterns = [
    /(\d{4})\.(\d{1,2})\.(\d{1,2})\s*[-~]\s*(\d{4})\.(\d{1,2})\.(\d{1,2})/,  // 2025.8.14-2025.11.16
    /(\d{4})-(\d{1,2})-(\d{1,2})\s*[-~]\s*(\d{4})-(\d{1,2})-(\d{1,2})/,     // 2025-08-14~2025-11-16
    /(\d{1,2})\/(\d{1,2})\/(\d{4})\s*[-~]\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // 8/14/2025-11/16/2025
    /(\d{4})\.(\d{1,2})\.(\d{1,2})\s*[-~]\s*(\d{1,2})\.(\d{1,2})/,          // 2025.8.14-11.16
    /(\d{4})\.(\d{1,2})\.(\d{1,2})\s*[-~]\s*(\d{4})\.(\d{1,2})\.(\d{1,2})/,  // 2025.9.1-2026.2.28
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match.length >= 7) {
        // 전체 날짜
        const startDate = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
        const endDate = `${match[4]}-${match[5].padStart(2, '0')}-${match[6].padStart(2, '0')}`;
        return { start_date: startDate, end_date: endDate };
      } else if (match.length >= 5) {
        // 년도 생략 형태
        const startDate = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
        const endDate = `${match[1]}-${match[4].padStart(2, '0')}-${match[5].padStart(2, '0')}`;
        return { start_date: startDate, end_date: endDate };
      }
    }
  }
  
  return { start_date: null, end_date: null };
}

function extractVenue(text: string): string | null {
  // 미술관/갤러리 키워드
  const venueKeywords = [
    '미술관', '갤러리', '아트센터', '아트스페이스', '문화센터', 
    '박물관', '전시관', '아트홀', '컬처스페이스', 'SKY31', '타워'
  ];
  
  const lines = text.split('\n');
  for (const line of lines) {
    for (const keyword of venueKeywords) {
      if (line.includes(keyword)) {
        // 키워드를 포함한 줄에서 미술관명 추출
        const cleaned = line.replace(/[주소|위치|장소][:：]\s*/, '').trim();
        return cleaned;
      }
    }
  }
  
  // 키워드가 없는 경우 패턴으로 추정
  const patterns = [
    /^([가-힣\w\s]+(?:미술관|갤러리|센터|스페이스|타워))$/m,
    /^([가-힣\w\s]+SKY\d+)$/m
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

function extractPrice(text: string): string {
  // 가격 패턴
  const pricePatterns = [
    /무료/,
    /입장료\s*[:：]\s*([^\n]+)/,
    /관람료\s*[:：]\s*([^\n]+)/,
    /티켓\s*[:：]\s*([^\n]+)/,
    /(\d{1,3}(?:,\d{3})*)\s*원/,
    /성인\s*(\d{1,3}(?:,\d{3})*)\s*원/,
  ];
  
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern.source === '무료') {
        return '무료';
      }
      return match[1] || match[0];
    }
  }
  
  return '문의';
}

function extractArtists(text: string): string[] {
  const artistPatterns = [
    /작가\s*[:：]\s*([^\n]+)/,
    /아티스트\s*[:：]\s*([^\n]+)/,
    /참여작가\s*[:：]\s*([^\n]+)/,
  ];
  
  for (const pattern of artistPatterns) {
    const match = text.match(pattern);
    if (match) {
      // 쉼표나 슬래시로 구분된 작가명들
      return match[1].split(/[,/，]/).map(name => name.trim()).filter(name => name.length > 0);
    }
  }
  
  return [];
}

function inferGenre(text: string): string {
  const genreKeywords = {
    'media': ['미디어아트', '디지털', '영상', 'media', 'digital', '팀랩', 'teamlab', '인터랙티브'],
    'photography': ['사진', '포토', 'photography'],
    'sculpture': ['조각', '조형', 'sculpture'],
    'painting': ['회화', '그림', '페인팅', 'painting'],
    'installation': ['설치', 'installation'],
    'craft': ['공예', 'craft'],
    'design': ['디자인', 'design'],
    'contemporary': ['현대미술', '컨템포러리', 'contemporary']
  };
  
  const lowerText = text.toLowerCase();
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
      return genre;
    }
  }
  
  return 'contemporary';
}

function inferExhibitionType(text: string): string {
  if (text.includes('개인전') || text.includes('solo')) return 'solo';
  if (text.includes('기획전') || text.includes('특별전')) return 'special';
  if (text.includes('비엔날레') || text.includes('biennale')) return 'biennale';
  if (text.includes('상설전') || text.includes('permanent')) return 'permanent';
  return 'group';
}

function extractOperatingHours(text: string): string | null {
  const hourPatterns = [
    /운영시간\s*[:：]\s*([^\n]+)/,
    /관람시간\s*[:：]\s*([^\n]+)/,
    /오픈시간\s*[:：]\s*([^\n]+)/,
    /(\d{1,2}:\d{2}\s*[-~]\s*\d{1,2}:\d{2})/
  ];
  
  for (const pattern of hourPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }
  
  return null;
}

function extractWebsite(text: string): string | null {
  const urlPattern = /(https?:\/\/[^\s]+)/;
  const match = text.match(urlPattern);
  return match ? match[1] : null;
}

function extractPhone(text: string): string | null {
  const phonePattern = /(\d{2,3}-\d{3,4}-\d{4})/;
  const match = text.match(phonePattern);
  return match ? match[1] : null;
}

function extractDescription(text: string, title: string): string | null {
  const lines = text.split('\n').map(line => line.trim());
  
  // 제목, 날짜, 가격, 미술관명을 제외한 가장 긴 문단을 설명으로 추정
  const descriptionCandidates = lines.filter(line => 
    line.length > 20 && 
    line !== title &&
    !isDateOrPrice(line) &&
    !line.includes('미술관') &&
    !line.includes('갤러리')
  );
  
  if (descriptionCandidates.length > 0) {
    return descriptionCandidates.reduce((longest, current) => 
      current.length > longest.length ? current : longest);
  }
  
  return null;
}

function isDateOrPrice(text: string): boolean {
  return /\d{4}[\.\-\/]\d{1,2}[\.\-\/]\d{1,2}/.test(text) || 
         /\d+원/.test(text) || 
         text.includes('무료');
}

function calculateConfidence(data: any): number {
  let score = 0;
  
  // 필수 항목
  if (data.title) score += 30;
  if (data.venue) score += 25;
  if (data.dates.start_date && data.dates.end_date) score += 25;
  
  // 추가 항목
  if (data.price) score += 5;
  if (data.artists && data.artists.length > 0) score += 5;
  if (data.text.length > 100) score += 5;
  if (data.text.length > 300) score += 5;
  
  return Math.min(score, 100);
}