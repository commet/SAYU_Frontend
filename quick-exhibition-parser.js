// 빠른 전시 데이터 입력 파서
// 형식: "갤러리명 / 전시명 (날짜)"를 파싱해서 데이터베이스 형식으로 변환

const quickExhibitions = `
국립현대미술관 서울 / 김창열 회고전 (8.22-12.21)
국립현대미술관 서울 / 올해의 작가상 2025 (8.29-2026.2.1)
리움미술관 / 이불: 1998년 이후 (9.4-2026.1.4)
글래드스톤갤러리 / 우고 론디노네 (8.29-10.30)
대림미술관 / 페트라 콜린스 (8.29-11.30)
아모레퍼시픽미술관 / 무라카미 다카시 (9.2-10.11)
아트선재센터 / 아드리안 비야르 로하스 (9.3-2026.2.1)
예술의전당 한가람미술관 / 오랑주리-오르세 특별전 (9.20-2026.1.25)
예술의전당 한가람미술관 / 마르크 샤갈 특별전 (5.15-9.21)
예술의전당 한가람미술관 / 앤서니 브라운 (6.20-9.24)
DDP / 톰 삭스 (4.25-9.7)
DDP / 스펙트럴 크로싱스 (8.14-11.16)
DDP 뮤지엄 / 장 미셸 바스키아 (9.23-2026.1.31)
서울시립미술관 / 서울미디어시티비엔날레 (8.26-11.24)
코엑스 / Frieze Seoul 2025 (9.3-9.6)
코엑스 / Kiaf 서울 2025 (9.3-9.7)
국제갤러리 / 갈라 포라스-김 (9.2-10.26)
국제갤러리 / 루이즈 부르주아 (9.2-10.26)
타데우스 로팍 서울 / 안토니 곰리 (9.2-11.8)
갤러리현대 / 김민정 (8.27-10.19)
송은 / 파노라마 (8.22-10.16)
일민미술관 / 형상 회로 (8.22-10.26)
페로탕 / 카토 이즈미 (8.26-10.19)
환기미술관 / 김환기와 브라질 (8.22-11.30)
페이스갤러리 / 제임스 터렐 (7.1-9.27)
리만머핀 / 테레시타 페르난데스 (8.27-10.25)
에스더쉬퍼 / 앤 베로니카 얀센스 (9.2-10.25)
화이트스톤갤러리 / 헨릭 울달렌 (8.30-10.19)
`;

// 날짜 파싱 함수
function parseDate(dateStr, year = 2025) {
  // "8.22" -> "2025-08-22"
  // "2026.2.1" -> "2026-02-01"
  
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
  if (title.includes(':') && !title.includes('전')) return 'solo'; // "작가명:" 형식
  return 'group';
}

// 장르 추측
function guessGenre(title, venue) {
  if (title.includes('미디어') || title.includes('비엔날레') || venue.includes('DDP')) return 'media';
  if (title.includes('사진') || title.includes('photography')) return 'photography';
  if (title.includes('조각')) return 'sculpture';
  if (title.includes('설치')) return 'installation';
  if (title.includes('공예')) return 'craft';
  if (title.includes('디자인')) return 'design';
  if (venue.includes('한가람') && title.includes('특별전')) return 'painting';
  return 'contemporary';
}

// 우선순위 결정
function getPriority(venue) {
  if (venue.includes('국립현대미술관')) return 1;
  if (venue.includes('리움')) return 2;
  if (venue.includes('서울시립미술관')) return 3;
  if (venue.includes('아모레퍼시픽')) return 4;
  if (venue.includes('예술의전당')) return 5;
  if (venue.includes('DDP')) return 6;
  if (venue.includes('대림미술관')) return 7;
  if (venue.includes('코엑스')) return 10;
  if (venue.includes('국제갤러리')) return 20;
  if (venue.includes('갤러리현대')) return 21;
  if (venue.includes('페이스갤러리')) return 22;
  if (venue.includes('타데우스')) return 23;
  return 30;
}

// 파싱 함수
function parseQuickExhibitions(text) {
  const lines = text.trim().split('\n').filter(line => line.trim());
  const exhibitions = [];
  
  lines.forEach((line, index) => {
    const match = line.match(/(.+?)\s*\/\s*(.+?)\s*\((.+?)\)/);
    
    if (match) {
      const [_, venue, title, dateRange] = match;
      const dates = dateRange.split('-');
      const startDate = parseDate(dates[0].trim());
      const endDate = dates[1] ? parseDate(dates[1].trim()) : startDate;
      
      // 현재 날짜와 비교해서 status 결정
      const today = new Date('2025-08-30');
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      let status = 'ongoing';
      if (start > today) status = 'upcoming';
      if (end < today) status = 'ended';
      
      // 아티스트 추출 (제목에서 ":" 앞부분)
      let artists = [];
      if (title.includes(':')) {
        const artistName = title.split(':')[0].trim();
        if (!artistName.includes('전') && !artistName.includes('특별')) {
          artists = [artistName];
        }
      }
      
      exhibitions.push({
        exhibition_title: title.trim(),
        venue_name: venue.trim(),
        start_date: startDate,
        end_date: endDate,
        status: status,
        exhibition_type: guessExhibitionType(title),
        genre: guessGenre(title, venue),
        priority_order: getPriority(venue) + index * 0.1, // 같은 우선순위 내에서 순서 유지
        is_featured: getPriority(venue) <= 10,
        artists: artists,
        city: "서울"
      });
    }
  });
  
  return exhibitions;
}

// 실행
const parsedExhibitions = parseQuickExhibitions(quickExhibitions);

// SQL 생성
function generateSQL(exhibitions) {
  const values = exhibitions.map(ex => {
    const artists = ex.artists.length > 0 
      ? `ARRAY['${ex.artists.join("','")}']` 
      : 'NULL';
    
    return `(
    '${ex.exhibition_title.replace(/'/g, "''")}',
    '${ex.venue_name}',
    '${ex.start_date}',
    '${ex.end_date}',
    '${ex.status}',
    '${ex.exhibition_type}',
    '${ex.genre}',
    ${ex.priority_order},
    ${ex.is_featured},
    ${artists},
    '서울'
  )`;
  });
  
  return `
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
  city
) VALUES 
${values.join(',\n')};
  `;
}

// 결과 출력
console.log('=== 파싱된 전시 수:', parsedExhibitions.length);
console.log('\n=== JSON 형식 (처음 3개):');
console.log(JSON.stringify(parsedExhibitions.slice(0, 3), null, 2));

console.log('\n=== SQL INSERT 문 생성:');
console.log(generateSQL(parsedExhibitions.slice(0, 5))); // 처음 5개만 샘플로

// 파일로 저장
const fs = require('fs');
fs.writeFileSync('exhibitions-clean-batch1.json', JSON.stringify(parsedExhibitions, null, 2));
fs.writeFileSync('exhibitions-clean-batch1.sql', generateSQL(parsedExhibitions));

console.log('\n✅ 파일 저장 완료:');
console.log('- exhibitions-clean-batch1.json');
console.log('- exhibitions-clean-batch1.sql');

module.exports = { parseQuickExhibitions, generateSQL };