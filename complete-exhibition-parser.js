// 완전한 전시 데이터 파서 - 1-165번 전체
const fs = require('fs');
const allExhibitions = require('./complete-exhibition-list.js');

// 날짜 파싱 함수
function parseDate(dateStr, year = 2025) {
  if (dateStr.includes('2026')) {
    year = 2026;
    dateStr = dateStr.replace('2026.', '');
  }
  
  const parts = dateStr.split('.');
  if (parts.length === 2) {
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return null;
}

// 전시 타입 추측
function guessExhibitionType(title) {
  if (title.includes('회고전') || title.includes('개인전')) return 'solo';
  if (title.includes('비엔날레') || title.includes('Biennale')) return 'biennale';
  if (title.includes('특별전') || title.includes('아트페어') || title.includes('Frieze') || title.includes('Kiaf')) return 'special';
  if (title.includes(':') && !title.includes('전') && !title.includes('<')) return 'solo';
  return 'group';
}

// 장르 추측
function guessGenre(title, venue) {
  if (title.includes('미디어') || title.includes('비엔날레') || venue.includes('DDP')) return 'media';
  if (title.includes('사진') || title.includes('흑백사진')) return 'photography';
  if (title.includes('조각')) return 'sculpture';
  if (title.includes('설치')) return 'installation';
  if (title.includes('공예') || title.includes('백자') || title.includes('도자') || title.includes('자수')) return 'craft';
  if (title.includes('디자인')) return 'design';
  if (venue.includes('한가람') && title.includes('특별전')) return 'painting';
  if (title.includes('회화') || title.includes('단색화') || title.includes('한국화')) return 'painting';
  return 'contemporary';
}

// 우선순위 결정
function getPriority(venue, index) {
  // 국립/시립 미술관
  if (venue.includes('국립현대미술관')) return 1;
  if (venue.includes('서울시립미술관')) return 2;
  if (venue.includes('리움미술관')) return 3;
  if (venue.includes('호암미술관')) return 4;
  if (venue.includes('아모레퍼시픽미술관')) return 5;
  if (venue.includes('예술의전당')) return 6;
  if (venue.includes('DDP')) return 7;
  if (venue.includes('대림미술관')) return 8;
  if (venue.includes('부산현대미술관')) return 9;
  
  // 아트페어
  if (venue.includes('코엑스') && (venue.includes('Frieze') || venue.includes('Kiaf'))) return 10;
  
  // 주요 갤러리
  if (venue.includes('국제갤러리')) return 20;
  if (venue.includes('갤러리현대')) return 21;
  if (venue.includes('페이스갤러리')) return 22;
  if (venue.includes('타데우스')) return 23;
  if (venue.includes('페로탕')) return 24;
  if (venue.includes('PKM')) return 25;
  if (venue.includes('학고재')) return 26;
  if (venue.includes('아라리오')) return 27;
  
  // 공공 미술관
  if (venue.includes('백남준아트센터')) return 30;
  if (venue.includes('경기도미술관')) return 31;
  if (venue.includes('성곡미술관')) return 32;
  if (venue.includes('아르코미술관')) return 33;
  if (venue.includes('금호미술관')) return 34;
  
  // 기타
  return 50 + Math.floor(index / 10);
}

// 특수 장소 처리
function processVenue(venue) {
  if (venue === 'N/A' || venue.includes('N/A')) {
    return '미정';
  }
  if (venue.includes('외') && venue.includes('곳')) {
    return venue.split('외')[0].trim();
  }
  return venue.trim();
}

// 파싱 함수
function parseExhibitions(text) {
  const lines = text.trim().split('\n').filter(line => line.trim());
  const exhibitions = [];
  
  lines.forEach((line, index) => {
    // N/A 특별 처리
    if (line.startsWith('N/A /')) {
      line = line.replace('N/A /', '미정 /');
    }
    
    const match = line.match(/(.+?)\s*\/\s*(.+?)\s*\((.+?)\)/);
    
    if (match) {
      const [_, rawVenue, titleWithArtist, dateRange] = match;
      const venue = processVenue(rawVenue);
      
      // 제목과 아티스트 분리
      let title = titleWithArtist.trim();
      let artists = [];
      
      // "전시명 - 작가명" 형식
      if (title.includes(' - ') && !title.includes('타이틀 매치')) {
        const parts = title.split(' - ');
        title = parts[0].trim();
        if (parts[1]) {
          const artistText = parts[1].trim();
          if (artistText.includes(',')) {
            artists = artistText.split(',').map(a => a.trim());
          } else if (artistText.includes('&')) {
            artists = artistText.split('&').map(a => a.trim());
          } else if (artistText.includes('등')) {
            const mainArtist = artistText.split('등')[0].trim();
            if (mainArtist) artists = [mainArtist];
          } else {
            artists = [artistText];
          }
        }
      }
      // "작가명:" 형식
      else if (title.includes(':') && !title.includes('비엔날레') && !title.includes('<')) {
        const artistName = title.split(':')[0].trim();
        if (!artistName.includes('전') && !artistName.includes('특별') && artistName.length < 10) {
          artists = [artistName];
        }
      }
      
      // 날짜 처리
      const dates = dateRange.split('-');
      const startDate = parseDate(dates[0].trim());
      const endDate = dates[1] ? parseDate(dates[1].trim()) : startDate;
      
      // 현재 날짜와 비교해서 status 결정
      const today = new Date('2025-08-31');
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      let status = 'ongoing';
      if (start > today) status = 'upcoming';
      if (end < today) status = 'ended';
      
      // 도시 결정
      let city = "서울";
      if (venue.includes('부산')) city = "부산";
      else if (venue.includes('파주')) city = "파주";
      else if (venue.includes('경기')) city = "경기";
      
      exhibitions.push({
        id: index + 1,
        exhibition_title: title,
        venue_name: venue,
        start_date: startDate,
        end_date: endDate,
        status: status,
        exhibition_type: guessExhibitionType(title),
        genre: guessGenre(title, venue),
        priority_order: getPriority(venue, index),
        is_featured: getPriority(venue, index) <= 10,
        artists: artists,
        city: city,
        view_count: Math.floor(Math.random() * 1000) + 100 // 임시 조회수
      });
    }
  });
  
  return exhibitions;
}

// SQL 생성
function generateSQL(exhibitions) {
  const values = exhibitions.map(ex => {
    const artists = ex.artists.length > 0 
      ? `ARRAY['${ex.artists.map(a => a.replace(/'/g, "''")).join("','")}']` 
      : 'NULL';
    
    return `(
  '${ex.exhibition_title.replace(/'/g, "''")}',
  '${ex.venue_name.replace(/'/g, "''")}',
  '${ex.start_date}',
  '${ex.end_date}',
  '${ex.status}',
  '${ex.exhibition_type}',
  '${ex.genre}',
  ${ex.priority_order},
  ${ex.is_featured},
  ${artists},
  '${ex.city}',
  ${ex.view_count}
)`;
  });
  
  return `-- SAYU 전시 데이터베이스 - 완전판
-- 총 ${exhibitions.length}개 전시 (2025년 8-9월)
-- 생성일: ${new Date().toISOString()}

-- 테이블 생성 (이미 존재하면 건너뛰기)
CREATE TABLE IF NOT EXISTS exhibitions_clean (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibition_title TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('ongoing', 'upcoming', 'ended')),
  exhibition_type TEXT CHECK (exhibition_type IN ('solo', 'group', 'special', 'biennale', 'permanent')),
  genre TEXT CHECK (genre IN ('contemporary', 'painting', 'sculpture', 'photography', 'media', 'installation', 'craft', 'design')),
  priority_order NUMERIC,
  is_featured BOOLEAN DEFAULT FALSE,
  artists TEXT[],
  city TEXT DEFAULT '서울',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 기존 데이터 삭제 (주의!)
TRUNCATE TABLE exhibitions_clean;

-- 전시 데이터 삽입
INSERT INTO exhibitions_clean (
  exhibition_title,
  venue_name,
  start_date,
  end_date,
  status,
  exhibition_type,
  genre,
  priority_order,
  is_featured,
  artists,
  city,
  view_count
) VALUES 
${values.join(',\n')};

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_exhibitions_status ON exhibitions_clean(status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_dates ON exhibitions_clean(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_exhibitions_venue ON exhibitions_clean(venue_name);
CREATE INDEX IF NOT EXISTS idx_exhibitions_featured ON exhibitions_clean(is_featured);
CREATE INDEX IF NOT EXISTS idx_exhibitions_priority ON exhibitions_clean(priority_order);

-- 확인
SELECT COUNT(*) as total_exhibitions FROM exhibitions_clean;
SELECT status, COUNT(*) FROM exhibitions_clean GROUP BY status;
SELECT venue_name, COUNT(*) FROM exhibitions_clean GROUP BY venue_name ORDER BY COUNT(*) DESC LIMIT 10;
`;
}

// 실행
const exhibitions = parseExhibitions(allExhibitions);

// 통계 출력
console.log('=== 전시 데이터 파싱 완료 ===');
console.log(`총 전시 수: ${exhibitions.length}`);
console.log('\n=== 상태별 분포:');
const statusCount = {};
exhibitions.forEach(ex => {
  statusCount[ex.status] = (statusCount[ex.status] || 0) + 1;
});
Object.entries(statusCount).forEach(([status, count]) => {
  console.log(`${status}: ${count}개`);
});

console.log('\n=== 주요 미술관 전시:');
exhibitions.filter(ex => ex.is_featured).slice(0, 10).forEach(ex => {
  console.log(`- ${ex.venue_name}: ${ex.exhibition_title}`);
});

// SQL 파일 생성
const sql = generateSQL(exhibitions);
fs.writeFileSync('exhibitions-complete-165.sql', sql);

// JSON 백업 생성
fs.writeFileSync('exhibitions-complete-165.json', JSON.stringify(exhibitions, null, 2));

console.log('\n✅ 파일 생성 완료:');
console.log('- exhibitions-complete-165.sql (메인 SQL 파일)');
console.log('- exhibitions-complete-165.json (JSON 백업)');
console.log('\n🎯 Supabase에서 exhibitions-complete-165.sql 파일을 실행하세요!');

module.exports = { parseExhibitions, generateSQL };