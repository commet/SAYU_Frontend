// 🤖 SAYU 최종 전시 파서 (마스터-번역 구조용)
// 자연어 → exhibitions_master + translations + venues_simple

class FinalExhibitionParser {
  constructor() {
    this.knownVenues = new Set([
      '국립현대미술관', '서울시립미술관', '리움미술관', '국제갤러리',
      '갤러리현대', '페로탕', '타데우스 로팍', '아모레퍼시픽미술관',
      '대림미술관', '예술의전당', 'DDP', '호암미술관', '부산현대미술관'
    ]);
  }

  // 메인 파싱 함수
  parse(text) {
    console.log('🔍 파싱 시작...');
    const result = {
      sql: [],
      stats: {
        exhibitions: 0,
        newVenues: 0,
        errors: []
      }
    };

    const lines = text.split('\n').filter(line => line.trim());
    const masterRecords = [];
    const translationRecords = [];
    const newVenues = new Map();

    for (const line of lines) {
      try {
        const parsed = this.parseLine(line);
        if (parsed) {
          // 마스터 레코드 생성
          const masterId = this.generateUUID();
          
          // 미술관 처리
          let venueId = null;
          if (!this.knownVenues.has(parsed.venue)) {
            if (!newVenues.has(parsed.venue)) {
              newVenues.set(parsed.venue, {
                name_ko: parsed.venue,
                city: parsed.city || '서울',
                venue_type: this.detectVenueType(parsed.venue)
              });
              result.stats.newVenues++;
            }
          }

          masterRecords.push({
            id: masterId,
            venue_name: parsed.venue,
            start_date: parsed.dates.start,
            end_date: parsed.dates.end,
            status: parsed.status,
            exhibition_type: parsed.exhibition_type,
            genre: parsed.genre,
            is_featured: this.knownVenues.has(parsed.venue)
          });

          translationRecords.push({
            exhibition_id: masterId,
            language_code: 'ko',
            exhibition_title: parsed.title,
            artists: parsed.artists,
            venue_name: parsed.venue,
            city: parsed.city || '서울'
          });

          result.stats.exhibitions++;
        }
      } catch (error) {
        result.stats.errors.push({ line, error: error.message });
      }
    }

    // SQL 생성
    result.sql = this.generateSQL(newVenues, masterRecords, translationRecords);
    
    console.log(`✅ 파싱 완료: ${result.stats.exhibitions}개 전시, ${result.stats.newVenues}개 신규 미술관`);
    return result;
  }

  // 한 줄 파싱
  parseLine(line) {
    // 패턴들
    const patterns = [
      // "미술관 / 전시명 (날짜)"
      /^(.+?)\s*\/\s*(.+?)\s*\((.+?)\)$/,
      // "《전시명》 날짜 미술관"
      /^《(.+?)》\s*(.+?)\s+(.+?)$/,
      // "전시명 at 미술관, 날짜"
      /^(.+?)\s+at\s+(.+?),\s*(.+?)$/
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        return this.extractInfo(match, pattern);
      }
    }
    
    return null;
  }

  extractInfo(match, pattern) {
    let venue, title, dateStr, artists = [];
    
    // 패턴별 추출
    if (pattern.source.includes('at')) {
      [, title, venue, dateStr] = match;
    } else if (pattern.source.startsWith('^《')) {
      [, title, dateStr, venue] = match;
    } else {
      [, venue, title, dateStr] = match;
    }

    // 작가명 추출
    if (title.includes(':')) {
      const parts = title.split(':');
      if (parts[0].length < 30 && !parts[0].includes('전')) {
        artists = [parts[0].trim()];
        title = parts[1]?.trim() || title;
      }
    }

    // 날짜 파싱
    const dates = this.parseDates(dateStr);
    
    // 상태 결정
    const today = new Date('2025-08-31');
    const status = this.getStatus(dates.start, dates.end, today);

    return {
      venue: venue.trim(),
      title: title.trim(),
      artists,
      dates,
      status,
      exhibition_type: this.detectExhibitionType(title, artists),
      genre: this.detectGenre(title),
      city: this.detectCity(venue)
    };
  }

  parseDates(dateStr) {
    const year = dateStr.includes('2026') ? 2026 : 2025;
    const parts = dateStr.split(/[-~]/);
    
    const parseDate = (str) => {
      const nums = str.replace(/[^0-9.]/g, '').split('.').filter(n => n);
      
      // 숫자가 없으면 null 반환
      if (nums.length === 0) return null;
      
      let month, day;
      if (nums.length === 1) {
        // 날짜만 있는 경우 (현재 월 사용)
        month = '08';
        day = nums[0];
      } else {
        month = nums[nums.length - 2] || '08';
        day = nums[nums.length - 1] || '01';
      }
      
      // 유효성 검사
      month = month.padStart(2, '0');
      day = day.padStart(2, '0');
      
      if (parseInt(month) < 1 || parseInt(month) > 12) month = '08';
      if (parseInt(day) < 1 || parseInt(day) > 31) day = '01';
      
      return `${year}-${month}-${day}`;
    };

    const startDate = parseDate(parts[0]);
    const endDate = parts[1] ? parseDate(parts[1]) : startDate;
    
    // null 체크
    if (!startDate || !endDate) {
      return { start: '2025-08-01', end: '2025-08-31' }; // 기본값
    }
    
    return {
      start: startDate,
      end: endDate
    };
  }

  getStatus(startDate, endDate, today) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < today) return 'ended';
    if (start > today) return 'upcoming';
    return 'ongoing';
  }

  detectVenueType(name) {
    if (name.includes('미술관')) return 'museum';
    if (name.includes('갤러리')) return 'gallery';
    if (name.includes('센터')) return 'art_center';
    return 'gallery';
  }

  detectExhibitionType(title, artists) {
    if (artists.length === 1) return 'solo';
    if (title.includes('비엔날레')) return 'biennale';
    if (title.includes('특별전')) return 'special';
    return 'group';
  }

  detectGenre(title) {
    if (title.includes('미디어')) return 'media';
    if (title.includes('사진')) return 'photography';
    if (title.includes('조각')) return 'sculpture';
    if (title.includes('설치')) return 'installation';
    if (title.includes('공예')) return 'craft';
    return 'contemporary';
  }

  detectCity(venue) {
    if (venue.includes('부산')) return '부산';
    if (venue.includes('대구')) return '대구';
    if (venue.includes('광주')) return '광주';
    return '서울';
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  generateSQL(venues, masters, translations) {
    const sqls = [];
    
    // 1. 새 미술관
    if (venues.size > 0) {
      sqls.push('-- 새로운 미술관 추가');
      venues.forEach(venue => {
        sqls.push(`INSERT INTO venues_simple (name_ko, city, venue_type) 
VALUES ('${venue.name_ko.replace(/'/g, "''")}', '${venue.city}', '${venue.venue_type}')
ON CONFLICT (name_ko) DO NOTHING;`);
      });
    }

    // 2. 마스터 레코드
    sqls.push('\n-- 전시 마스터 데이터');
    masters.forEach(m => {
      sqls.push(`INSERT INTO exhibitions_master (
  id, start_date, end_date, status, exhibition_type, genre, is_featured
) VALUES (
  '${m.id}', '${m.start_date}', '${m.end_date}', 
  '${m.status}', '${m.exhibition_type}', '${m.genre}', ${m.is_featured}
);`);
    });

    // 3. 번역 레코드
    sqls.push('\n-- 전시 번역 데이터 (한글)');
    translations.forEach(t => {
      const artists = t.artists.length > 0 
        ? `ARRAY['${t.artists.join("','")}']` 
        : 'ARRAY[]::TEXT[]';
      
      sqls.push(`INSERT INTO exhibitions_translations (
  exhibition_id, language_code, exhibition_title, artists, venue_name, city
) VALUES (
  '${t.exhibition_id}', '${t.language_code}', 
  '${t.exhibition_title.replace(/'/g, "''")}', ${artists},
  '${t.venue_name.replace(/'/g, "''")}', '${t.city}'
);`);
    });

    // 4. venue_id 연결
    sqls.push('\n-- venue_id 자동 연결');
    sqls.push(`UPDATE exhibitions_master em
SET venue_id = v.id
FROM exhibitions_translations et, venues_simple v
WHERE em.id = et.exhibition_id
AND et.venue_name = v.name_ko
AND em.venue_id IS NULL;`);

    return sqls.join('\n');
  }
}

// 테스트
const parser = new FinalExhibitionParser();

// 샘플 테스트
const sampleText = `
국제갤러리 / 갈라 포라스-김: Conditions for holding a natural form (9.2-10.26)
《김환기 회고전》 8.22-11.30 환기미술관
이우환 개인전 at 갤러리현대, 9.1-10.15
새미술관 / 새로운 전시 (9.5-9.30)
`;

const result = parser.parse(sampleText);
console.log('\n📝 생성된 SQL:');
console.log(result.sql);
console.log('\n📊 통계:', result.stats);

module.exports = FinalExhibitionParser;