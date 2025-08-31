// 🤖 SAYU 지능형 전시 파서
// 자연어 텍스트 → exhibitions_ko + venues_simple 자동 분리

class IntelligentExhibitionParser {
  constructor() {
    // 이미 등록된 주요 미술관 (venues_simple에 있는 것들)
    this.knownVenues = new Set([
      '국립현대미술관', '서울시립미술관', '리움미술관', '국제갤러리',
      '갤러리현대', '페로탕', '타데우스 로팍', '아모레퍼시픽미술관',
      '대림미술관', '예술의전당', 'DDP', '호암미술관', '부산현대미술관',
      '페이스갤러리', 'PKM갤러리', '학고재', '아라리오갤러리', '가나아트센터',
      '일민미술관', '송은'
    ]);
    
    this.newVenues = new Map(); // 새로 발견된 미술관들
    this.exhibitions = [];      // 파싱된 전시들
  }

  // 메인 파싱 함수
  parse(text) {
    const result = {
      exhibitions: [],
      newVenues: [],
      existingVenueRefs: [],
      stats: {
        totalExhibitions: 0,
        newVenuesFound: 0,
        existingVenuesUsed: 0,
        parseErrors: []
      }
    };

    // 예시: "국제갤러리 / Gala Porras-Kim: Conditions for holding a natural form (9.2-10.26)"
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const parsed = this.parseLine(line);
        if (parsed) {
          // 전시 정보 추가
          result.exhibitions.push(parsed.exhibition);
          
          // 미술관 처리
          if (this.knownVenues.has(parsed.venue)) {
            result.existingVenueRefs.push(parsed.venue);
            result.stats.existingVenuesUsed++;
          } else if (!this.newVenues.has(parsed.venue)) {
            // 새로운 미술관 발견
            const newVenue = {
              name_ko: parsed.venue,
              name_en: this.extractEnglishVenueName(parsed.venue, line),
              city: this.detectCity(line),
              district: this.detectDistrict(line),
              venue_type: this.detectVenueType(parsed.venue),
              is_major: false,
              priority_order: 50 + this.newVenues.size
            };
            
            this.newVenues.set(parsed.venue, newVenue);
            result.newVenues.push(newVenue);
            result.stats.newVenuesFound++;
          }
          
          result.stats.totalExhibitions++;
        }
      } catch (error) {
        result.stats.parseErrors.push({ line, error: error.message });
      }
    }
    
    return result;
  }

  // 한 줄 파싱
  parseLine(line) {
    // 패턴 1: "미술관 / 전시명 (날짜)"
    const pattern1 = /^(.+?)\s*\/\s*(.+?)\s*\((.+?)\)$/;
    
    // 패턴 2: "《전시명》 날짜 미술관"
    const pattern2 = /^《(.+?)》\s*(.+?)\s+(.+?)$/;
    
    let match = line.match(pattern1);
    if (match) {
      const [_, venue, titleWithArtist, dateRange] = match;
      return this.parseExhibition(venue, titleWithArtist, dateRange);
    }
    
    match = line.match(pattern2);
    if (match) {
      const [_, title, dateRange, venue] = match;
      return this.parseExhibition(venue, title, dateRange);
    }
    
    // 더 많은 패턴 추가 가능...
    return null;
  }

  // 전시 정보 파싱
  parseExhibition(venue, titleText, dateRange) {
    // 제목과 작가 분리
    let title = titleText;
    let artists = [];
    
    if (titleText.includes(':')) {
      const parts = titleText.split(':');
      // "작가명: 전시제목" 형식 체크
      if (parts[0].length < 20 && !parts[0].includes('전')) {
        artists = [parts[0].trim()];
        title = parts[1]?.trim() || titleText;
      }
    } else if (titleText.includes('-')) {
      const parts = titleText.split('-');
      if (parts.length === 2 && parts[1].length < 20) {
        title = parts[0].trim();
        artists = parts[1].split(/[,&]/).map(a => a.trim());
      }
    }
    
    // 날짜 파싱
    const dates = this.parseDateRange(dateRange);
    
    // 상태 결정
    const today = new Date('2025-08-31');
    const status = this.determineStatus(dates.start, dates.end, today);
    
    return {
      venue: venue.trim(),
      exhibition: {
        exhibition_title: title,
        venue_name: venue.trim(),
        artists: artists,
        start_date: dates.start,
        end_date: dates.end,
        status: status,
        exhibition_type: this.detectExhibitionType(title, artists),
        genre: this.detectGenre(title, venue),
        city: this.detectCity(venue),
        is_featured: this.knownVenues.has(venue.trim()),
        priority_order: this.knownVenues.has(venue.trim()) ? 10 : 50
      }
    };
  }

  // 날짜 범위 파싱
  parseDateRange(dateRange) {
    // "9.2-10.26" or "2025.9.2-10.26" 형식
    const parts = dateRange.split('-').map(d => d.trim());
    const year = dateRange.includes('2026') ? 2026 : 2025;
    
    const parseDate = (dateStr) => {
      const nums = dateStr.replace(/[년월일]/g, '').split(/[.\s]/);
      const month = nums[nums.length - 2] || nums[0];
      const day = nums[nums.length - 1];
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    
    return {
      start: parseDate(parts[0]),
      end: parts[1] ? parseDate(parts[1]) : parseDate(parts[0])
    };
  }

  // 상태 결정
  determineStatus(startDate, endDate, today) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < today) return 'ended';
    if (start > today) return 'upcoming';
    return 'ongoing';
  }

  // 도시 감지
  detectCity(text) {
    if (text.includes('부산')) return '부산';
    if (text.includes('대구')) return '대구';
    if (text.includes('광주')) return '광주';
    if (text.includes('대전')) return '대전';
    if (text.includes('제주')) return '제주';
    if (text.includes('용인')) return '용인';
    if (text.includes('파주')) return '파주';
    return '서울';
  }

  // 구 감지
  detectDistrict(text) {
    const districts = ['종로구', '중구', '용산구', '강남구', '서초구', '마포구', '성동구'];
    for (const district of districts) {
      if (text.includes(district)) return district;
    }
    return null;
  }

  // 미술관 타입 감지
  detectVenueType(venueName) {
    if (venueName.includes('미술관') || venueName.includes('Museum')) return 'museum';
    if (venueName.includes('갤러리') || venueName.includes('Gallery')) return 'gallery';
    if (venueName.includes('센터') || venueName.includes('Center')) return 'art_center';
    if (venueName.includes('옥션') || venueName.includes('Auction')) return 'auction';
    return 'gallery';
  }

  // 전시 타입 감지
  detectExhibitionType(title, artists) {
    if (artists.length === 1 || title.includes('개인전')) return 'solo';
    if (title.includes('비엔날레') || title.includes('Biennale')) return 'biennale';
    if (title.includes('특별전') || title.includes('Special')) return 'special';
    return 'group';
  }

  // 장르 감지
  detectGenre(title, venue) {
    if (title.includes('미디어') || title.includes('Media')) return 'media';
    if (title.includes('사진') || title.includes('Photography')) return 'photography';
    if (title.includes('조각') || title.includes('Sculpture')) return 'sculpture';
    if (title.includes('설치') || title.includes('Installation')) return 'installation';
    if (title.includes('공예') || title.includes('Craft')) return 'craft';
    if (title.includes('디자인') || title.includes('Design')) return 'design';
    if (title.includes('회화') || title.includes('Painting')) return 'painting';
    return 'contemporary';
  }

  // 영문 미술관명 추출
  extractEnglishVenueName(koreanName, fullText) {
    // 텍스트에서 영문명 찾기 시도
    const afterSlash = fullText.split('/')[0];
    if (afterSlash && /[A-Za-z]/.test(afterSlash)) {
      return afterSlash.trim();
    }
    
    // 기본 매핑
    const mapping = {
      '국립현대미술관': 'MMCA',
      '서울시립미술관': 'SeMA',
      '리움미술관': 'Leeum',
      '예술의전당': 'Seoul Arts Center'
    };
    
    return mapping[koreanName] || null;
  }

  // SQL 생성
  generateSQL(parseResult) {
    const sqls = [];
    
    // 1. 새로운 미술관 INSERT
    if (parseResult.newVenues.length > 0) {
      sqls.push('-- 새로운 미술관 추가');
      for (const venue of parseResult.newVenues) {
        const sql = `INSERT INTO venues_simple (name_ko, name_en, city, district, venue_type, is_major, priority_order) 
VALUES ('${venue.name_ko}', ${venue.name_en ? `'${venue.name_en}'` : 'NULL'}, '${venue.city}', ${venue.district ? `'${venue.district}'` : 'NULL'}, '${venue.venue_type}', false, ${venue.priority_order})
ON CONFLICT (name_ko) DO NOTHING;`;
        sqls.push(sql);
      }
    }
    
    // 2. 전시 데이터 INSERT
    sqls.push('\n-- 전시 데이터 추가');
    for (const exhibition of parseResult.exhibitions) {
      const artists = exhibition.artists.length > 0 
        ? `ARRAY['${exhibition.artists.join("','")}']` 
        : 'ARRAY[]::TEXT[]';
      
      const sql = `INSERT INTO exhibitions_ko (
  exhibition_title, venue_name, artists, start_date, end_date, 
  status, exhibition_type, genre, city, is_featured, priority_order
) VALUES (
  '${exhibition.exhibition_title.replace(/'/g, "''")}',
  '${exhibition.venue_name.replace(/'/g, "''")}',
  ${artists},
  '${exhibition.start_date}',
  '${exhibition.end_date}',
  '${exhibition.status}',
  '${exhibition.exhibition_type}',
  '${exhibition.genre}',
  '${exhibition.city}',
  ${exhibition.is_featured},
  ${exhibition.priority_order}
);`;
      sqls.push(sql);
    }
    
    // 3. venue_id 연결 UPDATE
    sqls.push('\n-- venue_id 연결');
    sqls.push(`UPDATE exhibitions_ko e
SET venue_id = v.id
FROM venues_simple v
WHERE e.venue_name = v.name_ko
AND e.venue_id IS NULL;`);
    
    return sqls.join('\n');
  }
}

// 사용 예시
const parser = new IntelligentExhibitionParser();

// 테스트 텍스트
const testText = `
국제갤러리 / 갈라 포라스-김: Conditions for holding a natural form (9.2-10.26)
페로탕 / 카토 이즈미 (8.26-10.19)
갤러리조선 / 파편의 흐름 (8.16-10.26)
새로운갤러리 / 테스트 전시 (9.1-9.30)
`;

const result = parser.parse(testText);
console.log('파싱 결과:', result);
console.log('\n생성된 SQL:\n', parser.generateSQL(result));

module.exports = IntelligentExhibitionParser;